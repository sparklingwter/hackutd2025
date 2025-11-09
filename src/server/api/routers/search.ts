import { z } from "zod";
import type { Query, DocumentData } from "firebase-admin/firestore";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { generateRecommendations } from "~/lib/ranking-engine";
import { UserNeedsProfileSchema } from "~/server/api/schemas";

// Rate limiting map (in-memory for now, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export const searchRouter = createTRPCRouter({
  /**
   * T040: search.recommend - Generate AI-powered vehicle recommendations
   */
  recommend: publicProcedure
    .input(
      z.object({
        needs: UserNeedsProfileSchema,
        voiceEnabled: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      // T043: Rate limiting - 10 requests/minute/IP
      const ip = ctx.headers.get("x-forwarded-for") ?? "unknown";
      const allowed = checkRateLimit(ip, 10, 60000); // 10 requests per 60 seconds

      if (!allowed) {
        throw new Error("TOO_MANY_REQUESTS: Rate limit exceeded. Please try again later.");
      }

      try {
        // Fetch vehicles from Firestore
        const snapshot = await ctx.db.collection("vehicles").limit(100).get();
        
        // Transform to format expected by ranking engine
        const vehicles = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            model: (data.model as string) ?? "",
            year: (data.year as number) ?? 2024,
            bodyStyle: ((data.specs as Record<string, unknown>)?.body as string) ?? "sedan",
            fuelType: ((data.specs as Record<string, unknown>)?.powertrain as string) ?? "gas",
            seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
            mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
            range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
            cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
            towingCapacity: 0, // Not in current schema
            awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
            msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
            features: [
              ...((data.features as Record<string, string[]>)?.standard ?? []),
              ...((data.features as Record<string, string[]>)?.safety ?? []),
              ...((data.features as Record<string, string[]>)?.technology ?? []),
            ],
            safetyRating: null,
          };
        });

        // Call ranking-engine library
        const recommendations = await generateRecommendations(vehicles, input.needs);

        // TODO: Generate audio summary if voiceEnabled
        const audioSummaryUrl: string | undefined = input.voiceEnabled
          ? undefined // Placeholder for audio generation: await generateAudioSummary(recommendations.topPicks)
          : undefined;

        return {
          topPicks: recommendations.topPicks,
          strongContenders: recommendations.strongContenders,
          exploreAlternatives: recommendations.exploreAlternatives,
          audioSummaryUrl,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Recommendation generation failed:", error);
        throw new Error("INTERNAL_SERVER_ERROR: Failed to generate recommendations. Please try again.");
      }
    }),

  /**
   * T041: search.filter - Filter vehicles by criteria (deterministic)
   */
  filter: publicProcedure
    .input(
      z.object({
        filters: z.object({
          bodyStyle: z.enum(["sedan", "suv", "truck", "van", "coupe", "hatchback"]).optional(),
          fuelType: z.enum(["gas", "hybrid", "electric", "plugin-hybrid"]).optional(),
          minSeating: z.number().int().min(2).max(8).optional(),
          maxPrice: z.number().positive().optional(),
          minMpg: z.number().positive().optional(),
          requireAwd: z.boolean().optional(),
        }),
        sort: z.enum(["price-asc", "price-desc", "mpg-desc", "name-asc"]).optional().default("price-asc"),
        pagination: z.object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      const { filters, sort, pagination } = input;
      
      // Start Firestore query with proper typing
      let query: Query<DocumentData, DocumentData> = ctx.db.collection("vehicles");

      // Apply filters
      if (filters.bodyStyle) {
        query = query.where("specs.body", "==", filters.bodyStyle);
      }
      if (filters.fuelType) {
        query = query.where("specs.powertrain", "==", filters.fuelType);
      }
      if (filters.minSeating) {
        query = query.where("dimensions.seating", ">=", filters.minSeating);
      }
      if (filters.maxPrice) {
        query = query.where("pricing.msrp", "<=", filters.maxPrice);
      }
      if (filters.minMpg) {
        query = query.where("efficiency.mpgCombined", ">=", filters.minMpg);
      }
      if (filters.requireAwd) {
        query = query.where("specs.drivetrain", "==", "awd");
      }

      // Apply sorting
      if (sort === "price-asc") {
        query = query.orderBy("pricing.msrp", "asc");
      } else if (sort === "price-desc") {
        query = query.orderBy("pricing.msrp", "desc");
      } else if (sort === "mpg-desc") {
        query = query.orderBy("performance.mpgCombined", "desc");
      } else if (sort === "name-asc") {
        query = query.orderBy("model", "asc");
      }

      // Apply pagination
      if (pagination.cursor) {
        const cursorDoc = await ctx.db.collection("vehicles").doc(pagination.cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      query = query.limit(pagination.limit + 1); // Fetch one extra to check if there are more

      // Execute query
      const snapshot = await query.get();
      const docs = snapshot.docs;

      const hasMore = docs.length > pagination.limit;
      const items = docs.slice(0, pagination.limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const nextCursor = hasMore ? docs[pagination.limit - 1]?.id : undefined;

      return {
        items,
        nextCursor,
        total: snapshot.size,
      };
    }),

  /**
   * T042: search.semanticSearch - Natural language search using Gemini
   */
  semanticSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      // Rate limiting - 10 requests/minute/IP
      const ip = ctx.headers.get("x-forwarded-for") ?? "unknown";
      const allowed = checkRateLimit(ip, 10, 60000);

      if (!allowed) {
        throw new Error("TOO_MANY_REQUESTS: Rate limit exceeded. Please try again later.");
      }

      try {
        // TODO: Implement Gemini API call to parse query intent
        // For now, fallback to simple keyword search
        const keywords = input.query.toLowerCase().split(/\s+/);
        
        // Simple keyword matching fallback
        const allVehicles = await ctx.db.collection("vehicles").limit(50).get();
        const results = allVehicles.docs
          .map((doc) => {
            const data = doc.data();
            const model = (data.model as string) ?? "";
            const body = ((data.specs as Record<string, unknown>)?.body as string) ?? "";
            const desc = (data.description as string) ?? "";
            const description = `${model} ${body} ${desc}`.toLowerCase();
            
            // Calculate simple relevance score based on keyword matches
            let score = 0;
            for (const keyword of keywords) {
              if (description.includes(keyword)) {
                score += 0.2;
              }
            }
            
            return {
              vehicleId: doc.id,
              relevanceScore: Math.min(score, 1),
              snippet: desc.substring(0, 150) || "No description available",
            };
          })
          .filter((result) => result.relevanceScore > 0)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, input.limit);

        return {
          results,
          queryIntent: input.query, // Placeholder - would be parsed by Gemini
        };
      } catch (error) {
        console.error("Semantic search failed:", error);
        throw new Error("INTERNAL_SERVER_ERROR: Search failed. Please try again.");
      }
    }),
});
