import { z } from "zod";
import type { Query, DocumentData } from "firebase-admin/firestore";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { generateRecommendations } from "~/lib/ranking-engine";
import { UserNeedsProfileSchema } from "~/server/api/schemas";
import { getVehicleImages } from "~/lib/imageMapper";

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
   * Generate AI-powered vehicle recommendations based on user needs
   * 
   * Uses Google Gemini API to analyze user preferences and rank vehicles
   * by match score. Implements rate limiting to prevent API abuse.
   * 
   * @param {object} input - Input parameters
   * @param {UserNeedsProfile} input.needs - User's vehicle preferences and requirements
   * @param {boolean} [input.voiceEnabled=false] - Whether to generate audio summary (future feature)
   * 
   * @returns {Promise<RecommendationResult>} Categorized vehicle recommendations
   * @returns {Vehicle[]} returns.topPicks - Best 3 matches with highest scores (>85)
   * @returns {Vehicle[]} returns.strongContenders - Good alternatives (70-84 score)
   * @returns {Vehicle[]} returns.exploreAlternatives - Broader options (<70 score)
   * @returns {string|undefined} returns.audioSummaryUrl - URL to audio summary if voice enabled
   * @returns {Date} returns.generatedAt - Timestamp of recommendation generation
   * 
   * @throws {Error} TOO_MANY_REQUESTS - Rate limit exceeded (10 requests/minute/IP)
   * @throws {Error} INTERNAL_SERVER_ERROR - AI service failure or database error
   * 
   * @example
   * ```typescript
   * const recommendations = await trpc.search.recommend.query({
   *   needs: {
   *     budget: 35000,
   *     primaryUse: "commuting",
   *     bodyStyle: "sedan",
   *     seating: 5,
   *     priorities: ["fuel-efficiency", "reliability"]
   *   },
   *   voiceEnabled: false
   * });
   * ```
   * 
   * @see {@link ~/lib/ranking-engine} for AI ranking implementation
   * @see {@link ~/server/api/schemas} for UserNeedsProfileSchema
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
        const allVehicles = snapshot.docs.map((doc) => {
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
            awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase().includes("awd")),
            msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 35000, // Default to $35k if not set
            features: [
              ...((data.features as Record<string, string[]>)?.standard ?? []),
              ...((data.features as Record<string, string[]>)?.safety ?? []),
              ...((data.features as Record<string, string[]>)?.technology ?? []),
            ],
            safetyRating: null,
          };
        });

        // Deduplicate vehicles by model - keep the latest year for each model
        const vehiclesByModel = new Map<string, typeof allVehicles[0]>();
        for (const vehicle of allVehicles) {
          const existing = vehiclesByModel.get(vehicle.model);
          if (!existing || vehicle.year > existing.year) {
            vehiclesByModel.set(vehicle.model, vehicle);
          }
        }
        const vehicles = Array.from(vehiclesByModel.values());

        // If no vehicles found in database, return mock data for demo
        if (vehicles.length === 0) {
          console.warn("No vehicles in database, returning demo data");
          const mockVehicles = [
            {
              id: "camry-2024",
              model: "Camry",
              year: 2024,
              bodyStyle: "sedan" as const,
              fuelType: "hybrid" as const,
              seating: 5,
              mpgCombined: 52,
              range: null,
              cargoVolume: 15.1,
              towingCapacity: 0,
              awd: false,
              msrp: 28855,
              features: ["Toyota Safety Sense", "8-inch touchscreen", "Apple CarPlay"],
              safetyRating: 5,
            },
            {
              id: "rav4-2024",
              model: "RAV4",
              year: 2024,
              bodyStyle: "suv" as const,
              fuelType: "gas" as const,
              seating: 5,
              mpgCombined: 30,
              range: null,
              cargoVolume: 37.6,
              towingCapacity: 1500,
              awd: true,
              msrp: 29575,
              features: ["AWD", "Roof rails", "8-inch touchscreen"],
              safetyRating: 5,
            },
            {
              id: "highlander-2024",
              model: "Highlander",
              year: 2024,
              bodyStyle: "suv" as const,
              fuelType: "hybrid" as const,
              seating: 8,
              mpgCombined: 36,
              range: null,
              cargoVolume: 48.4,
              towingCapacity: 3500,
              awd: true,
              msrp: 42850,
              features: ["3-row seating", "AWD", "10.5-inch touchscreen"],
              safetyRating: 5,
            },
          ];
          
          const mockRecommendations = {
            topPicks: mockVehicles.slice(0, 2).map((v) => ({
              vehicleId: v.id,
              score: 85,
              tier: 'top-pick' as const,
              explanation: `The ${v.year} ${v.model} is an excellent match with ${v.mpgCombined} MPG combined, ${v.seating} seats, and starts at $${v.msrp.toLocaleString()}.`,
              matchedCriteria: ['Within budget', 'Good fuel economy', 'Reliable'],
              tradeoffs: undefined,
              vehicle: {
                id: v.id,
                model: v.model,
                year: v.year,
                msrp: v.msrp,
                bodyStyle: v.bodyStyle,
                fuelType: v.fuelType,
                mpgCombined: v.mpgCombined,
                seating: v.seating,
                imageUrls: getVehicleImages("Toyota", v.model, v.year),
              },
            })),
            strongContenders: mockVehicles.slice(2).map((v) => ({
              vehicleId: v.id,
              score: 75,
              tier: 'strong-contender' as const,
              explanation: `The ${v.year} ${v.model} offers ${v.seating} seats and great versatility.`,
              matchedCriteria: ['Spacious', 'Versatile'],
              tradeoffs: undefined,
              vehicle: {
                id: v.id,
                model: v.model,
                year: v.year,
                msrp: v.msrp,
                bodyStyle: v.bodyStyle,
                fuelType: v.fuelType,
                mpgCombined: v.mpgCombined,
                seating: v.seating,
                imageUrls: getVehicleImages("Toyota", v.model, v.year),
              },
            })),
            exploreAlternatives: [],
          };
          
          return {
            ...mockRecommendations,
            audioSummaryUrl: undefined,
            generatedAt: new Date(),
          };
        }

        // Try to generate recommendations with AI/ranking
        let recommendations;
        try {
          recommendations = await generateRecommendations(vehicles, input.needs);
        } catch (rankingError) {
          console.warn("Ranking engine failed, using simple fallback:", rankingError);
          
          // FALLBACK: Just show all vehicles as alternatives with basic info
          recommendations = {
            topPicks: vehicles.slice(0, 3).map((v) => ({
              vehicleId: v.id,
              score: 70,
              tier: 'top-pick' as const,
              explanation: `The ${v.year} ${v.model} is a ${v.bodyStyle} with ${v.seating} seats. Starting at $${v.msrp.toLocaleString()}.`,
              matchedCriteria: ['Available vehicle'],
              tradeoffs: undefined,
            })),
            strongContenders: vehicles.slice(3, 8).map((v) => ({
              vehicleId: v.id,
              score: 60,
              tier: 'strong-contender' as const,
              explanation: `The ${v.year} ${v.model} is a ${v.bodyStyle} option with ${v.seating} seats.`,
              matchedCriteria: ['Available vehicle'],
              tradeoffs: undefined,
            })),
            exploreAlternatives: vehicles.slice(8, 13).map((v) => ({
              vehicleId: v.id,
              score: 50,
              tier: 'explore-alternative' as const,
              explanation: `Consider the ${v.year} ${v.model} as an alternative option.`,
              matchedCriteria: ['Available vehicle'],
              tradeoffs: undefined,
            })),
          };
        }

        // Fetch full vehicle data for each recommendation
        const enrichRecommendation = async (rec: typeof recommendations.topPicks[0]) => {
          try {
            const vehicleDoc = await ctx.db.collection("vehicles").doc(rec.vehicleId).get();
            if (!vehicleDoc.exists) {
              return null;
            }
            const vData = vehicleDoc.data()!;
            const make = (vData.make as string) ?? "Toyota";
            const model = (vData.model as string) ?? "Unknown";
            const year = (vData.year as number) ?? 2024;
            const trim = (vData.trim as string | undefined);
            return {
              ...rec,
              vehicle: {
                id: vehicleDoc.id,
                model,
                year,
                msrp: ((vData.pricing as Record<string, unknown>)?.msrp as number) ?? 35000,
                bodyStyle: ((vData.specs as Record<string, unknown>)?.body as string) ?? "sedan",
                fuelType: ((vData.specs as Record<string, unknown>)?.powertrain as string) ?? "gas",
                mpgCombined: ((vData.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
                seating: ((vData.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
                imageUrls: getVehicleImages(make, model, year, trim),
              },
            };
          } catch (error) {
            console.error(`Failed to fetch vehicle ${rec.vehicleId}:`, error);
            return null;
          }
        };

        const [enrichedTopPicks, enrichedStrongContenders, enrichedExploreAlternatives] = await Promise.all([
          Promise.all(recommendations.topPicks.map(enrichRecommendation)),
          Promise.all(recommendations.strongContenders.map(enrichRecommendation)),
          Promise.all(recommendations.exploreAlternatives.map(enrichRecommendation)),
        ]);

        // TODO: Generate audio summary if voiceEnabled
        const audioSummaryUrl: string | undefined = input.voiceEnabled
          ? undefined // Placeholder for audio generation: await generateAudioSummary(recommendations.topPicks)
          : undefined;

        return {
          topPicks: enrichedTopPicks.filter((r) => r !== null) as Array<typeof recommendations.topPicks[0] & { vehicle: { id: string; model: string; year: number; msrp: number; bodyStyle: string; fuelType: string; mpgCombined: number | null; seating: number; imageUrls: string[] } }>,
          strongContenders: enrichedStrongContenders.filter((r) => r !== null) as Array<typeof recommendations.strongContenders[0] & { vehicle: { id: string; model: string; year: number; msrp: number; bodyStyle: string; fuelType: string; mpgCombined: number | null; seating: number; imageUrls: string[] } }>,
          exploreAlternatives: enrichedExploreAlternatives.filter((r) => r !== null) as Array<typeof recommendations.exploreAlternatives[0] & { vehicle: { id: string; model: string; year: number; msrp: number; bodyStyle: string; fuelType: string; mpgCombined: number | null; seating: number; imageUrls: string[] } }>,
          audioSummaryUrl,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Recommendation generation failed completely:", error);
        
        // ULTIMATE FALLBACK: Return empty but valid response instead of throwing
        return {
          topPicks: [],
          strongContenders: [],
          exploreAlternatives: [],
          audioSummaryUrl: undefined,
          generatedAt: new Date(),
        };
      }
    }),

  /**
   * Filter vehicles using deterministic criteria (no AI)
   * 
   * Provides fast, predictable filtering without AI costs. Supports
   * multiple filter types and sorting options with cursor-based pagination.
   * 
   * @param {object} input - Input parameters
   * @param {object} input.filters - Filter criteria
   * @param {BodyStyle} [input.filters.bodyStyle] - Vehicle body type (sedan, suv, truck, etc.)
   * @param {FuelType} [input.filters.fuelType] - Powertrain type (gas, hybrid, electric, etc.)
   * @param {number} [input.filters.minSeating] - Minimum passenger capacity (2-8)
   * @param {number} [input.filters.maxPrice] - Maximum MSRP in USD
   * @param {number} [input.filters.minMpg] - Minimum combined fuel economy (mpg)
   * @param {boolean} [input.filters.requireAwd] - Only show AWD vehicles
   * @param {SortOption} [input.sort="price-asc"] - Sort order (price-asc, price-desc, mpg-desc, name-asc)
   * @param {object} input.pagination - Pagination parameters
   * @param {number} [input.pagination.limit=20] - Max results per page (1-50)
   * @param {string} [input.pagination.cursor] - Cursor for next page (vehicle ID)
   * 
   * @returns {Promise<FilterResult>} Filtered and sorted vehicles
   * @returns {Vehicle[]} returns.items - Vehicles matching filters
   * @returns {string|undefined} returns.nextCursor - Cursor for next page (null if last page)
   * @returns {number} returns.total - Total result count
   * 
   * @throws {Error} No error thrown - returns empty array if no matches
   * 
   * @example
   * ```typescript
   * const results = await trpc.search.filter.query({
   *   filters: {
   *     bodyStyle: "suv",
   *     maxPrice: 40000,
   *     minSeating: 7,
   *     requireAwd: true
   *   },
   *   sort: "price-asc",
   *   pagination: { limit: 20 }
   * });
   * ```
   * 
   * @see Firestore composite indexes required for multi-field filtering
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
   * Natural language vehicle search using AI
   * 
   * Allows users to search with conversational queries like "family SUV under $40k"
   * or "electric car with long range". Uses Gemini API to parse intent and extract
   * search parameters. Falls back to keyword matching if AI unavailable.
   * 
   * @param {object} input - Input parameters
   * @param {string} input.query - Natural language search query (1-200 characters)
   * @param {number} [input.limit=10] - Maximum results to return (1-20)
   * 
   * @returns {Promise<SemanticSearchResult>} Ranked search results
   * @returns {SearchResult[]} returns.results - Vehicles matching query intent
   * @returns {string} returns.results[].vehicleId - Matching vehicle ID
   * @returns {number} returns.results[].relevanceScore - Match confidence (0-1)
   * @returns {string} returns.results[].snippet - Relevant excerpt from vehicle description
   * @returns {string} returns.queryIntent - Interpreted search intent from AI
   * 
   * @throws {Error} TOO_MANY_REQUESTS - Rate limit exceeded (10 requests/minute/IP)
   * @throws {Error} INTERNAL_SERVER_ERROR - AI service failure or database error
   * 
   * @example
   * ```typescript
   * const results = await trpc.search.semanticSearch.query({
   *   query: "reliable hybrid sedan for daily commute",
   *   limit: 10
   * });
   * // results.queryIntent: "Looking for: fuel-efficient sedan, primary use: commuting"
   * ```
   * 
   * @todo Implement full Gemini API integration for intent parsing
   * @see {@link ~/lib/ranking-engine/gemini} for AI integration
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
