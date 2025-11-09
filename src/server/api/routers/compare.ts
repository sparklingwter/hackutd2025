import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { sign, verify } from "jsonwebtoken";

// JWT secret for share tokens (use environment variable in production)
const SHARE_TOKEN_SECRET = process.env.SHARE_TOKEN_SECRET ?? "development-secret-change-in-production";
const SHARE_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Calculate category winners from a list of vehicles
 */
function calculateCategoryWinners(vehicles: Array<{
  id: string;
  msrp: number;
  mpgCombined: number | null;
  cargoVolume: number;
  towingCapacity: number;
  safetyRating: number | null;
  [key: string]: unknown;
}>): {
  lowestPrice: string;
  highestMpg: string;
  mostCargo: string;
  highestTowing: string;
  highestSafetyRating: string;
  mostHorsepower: string;
} {
  const lowestPrice = vehicles.reduce((min, v) => (v.msrp < min.msrp ? v : min)).id;
  const highestMpg = vehicles
    .filter((v) => v.mpgCombined !== null)
    .reduce((max, v) => ((v.mpgCombined ?? 0) > (max.mpgCombined ?? 0) ? v : max), vehicles[0]!)
    .id;
  const mostCargo = vehicles.reduce((max, v) => (v.cargoVolume > max.cargoVolume ? v : max)).id;
  const highestTowing = vehicles.reduce((max, v) => (v.towingCapacity > max.towingCapacity ? v : max)).id;
  const highestSafetyRating = vehicles
    .filter((v) => v.safetyRating !== null)
    .reduce((max, v) => ((v.safetyRating ?? 0) > (max.safetyRating ?? 0) ? v : max), vehicles[0]!)
    .id;

  // mostHorsepower requires trim data - default to first vehicle for now
  const mostHorsepower = vehicles[0]!.id;

  return {
    lowestPrice,
    highestMpg,
    mostCargo,
    highestTowing,
    highestSafetyRating,
    mostHorsepower,
  };
}

/**
 * Build comparison matrix for easy table rendering
 */
function buildComparisonMatrix(vehicles: Array<{ id: string; [key: string]: unknown }>) {
  const matrix: Record<string, Record<string, unknown>> = {};

  for (const vehicle of vehicles) {
    matrix[vehicle.id] = {
      price: vehicle.msrp,
      mpg: vehicle.mpgCombined,
      cargo: vehicle.cargoVolume,
      towing: vehicle.towingCapacity,
      safety: vehicle.safetyRating,
      seating: vehicle.seating,
      awd: vehicle.awd,
      features: vehicle.features,
    };
  }

  return matrix;
}

export const compareRouter = createTRPCRouter({
  /**
   * Get side-by-side comparison data for up to 4 vehicles
   */
  getComparison: publicProcedure
    .input(
      z.object({
        vehicleIds: z.array(z.string()).min(1).max(4),
        trimIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { vehicleIds, trimIds } = input;

      // Validate trimIds length matches vehicleIds if provided
      if (trimIds && trimIds.length !== vehicleIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "trimIds array must match vehicleIds array length",
        });
      }

      // Fetch all vehicles in parallel
      const vehiclePromises = vehicleIds.map((id) => ctx.db.collection("vehicles").doc(id).get());
      const vehicleDocs = await Promise.all(vehiclePromises);

      // Check if all vehicles exist
      const missingVehicles = vehicleIds.filter((id, index) => !vehicleDocs[index]?.exists);
      if (missingVehicles.length > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicles not found: ${missingVehicles.join(", ")}`,
        });
      }

      // Transform vehicles with schema adaptation
      const vehicles = vehicleDocs.map((doc) => {
        const data = doc.data()!;
        return {
          id: doc.id,
          make: "Toyota" as const,
          model: (data.model as string) ?? "",
          year: (data.year as number) ?? 2024,
          bodyStyle: ((data.specs as Record<string, unknown>)?.body as "sedan" | "suv" | "truck" | "van" | "coupe" | "hatchback") ?? "sedan",
          fuelType: ((data.specs as Record<string, unknown>)?.powertrain as "gas" | "hybrid" | "electric" | "plugin-hybrid") ?? "gas",
          seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
          mpgCity: ((data.performance as Record<string, unknown>)?.mpgCity as number | null) ?? null,
          mpgHighway: ((data.performance as Record<string, unknown>)?.mpgHighway as number | null) ?? null,
          mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
          range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
          cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
          towingCapacity: 0, // Not in current schema
          awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
          fourWheelDrive: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "4wd"),
          msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
          features: [
            ...((data.features as Record<string, string[]>)?.standard ?? []),
            ...((data.features as Record<string, string[]>)?.safety ?? []),
            ...((data.features as Record<string, string[]>)?.technology ?? []),
          ],
          safetyRating: null,
          trims: (data.trims as string[]) ?? [],
          imageUrls: (data.imageUrls as string[]) ?? [],
          description: (data.description as string) ?? "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // TODO: Fetch trim-specific data if trimIds provided
      // For now, using base vehicle data

      // Calculate category winners
      const categoryWinners = calculateCategoryWinners(vehicles);

      // Build comparison matrix
      const comparisonMatrix = buildComparisonMatrix(vehicles);

      return {
        vehicles,
        categoryWinners,
        comparisonMatrix,
      };
    }),

  /**
   * Save a compare set to user profile
   */
  saveCompareSet: protectedProcedure
    .input(
      z.object({
        name: z.string().max(100).optional(),
        vehicleIds: z.array(z.string()).min(1).max(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, vehicleIds } = input;
      const userId = ctx.userId;

      // Validate vehicle IDs exist
      const vehiclePromises = vehicleIds.map((id) => ctx.db.collection("vehicles").doc(id).get());
      const vehicleDocs = await Promise.all(vehiclePromises);
      const missingVehicles = vehicleIds.filter((id, index) => !vehicleDocs[index]?.exists);

      if (missingVehicles.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid vehicle IDs: ${missingVehicles.join(", ")}`,
        });
      }

      // Get user profile
      const userRef = ctx.db.collection("userProfiles").doc(userId);
      const userDoc = await userRef.get();

      // Auto-generate name if not provided
      const existingCompareSets = (userDoc.data()?.compareSets as Array<{ name?: string }> | undefined) ?? [];
      const compareSetName = name ?? `Comparison ${existingCompareSets.length + 1}`;

      // Create compare set
      const compareSetId = randomUUID();
      const compareSet = {
        id: compareSetId,
        name: compareSetName,
        vehicleIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to user profile
      await userRef.update({
        compareSets: FieldValue.arrayUnion(compareSet),
        updatedAt: new Date(),
      });

      return {
        compareSetId,
        createdAt: compareSet.createdAt,
      };
    }),

  /**
   * Get all saved compare sets for authenticated user
   */
  getCompareSets: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const userRef = ctx.db.collection("userProfiles").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { compareSets: [] };
    }

    const compareSets = (userDoc.data()?.compareSets as Array<{
      id: string;
      name?: string;
      vehicleIds: string[];
      createdAt: Date;
      updatedAt: Date;
    }>) ?? [];

    // Sort by updatedAt descending
    compareSets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return { compareSets };
  }),

  /**
   * Delete a saved compare set
   */
  deleteCompareSet: protectedProcedure
    .input(z.object({ compareSetId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { compareSetId } = input;
      const userId = ctx.userId;

      const userRef = ctx.db.collection("userProfiles").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const compareSets = (userDoc.data()?.compareSets as Array<{ id: string }> | undefined) ?? [];
      const compareSetExists = compareSets.some((set) => set.id === compareSetId);

      if (!compareSetExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compare set not found",
        });
      }

      // Remove compare set from array
      const updatedCompareSets = compareSets.filter((set) => set.id !== compareSetId);

      await userRef.update({
        compareSets: updatedCompareSets,
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  /**
   * Get a compare set by shareable link (read-only)
   */
  getSharedCompareSet: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input, ctx }) => {
      const { shareToken } = input;

      try {
        // Verify and decode JWT
        const decoded = verify(shareToken, SHARE_TOKEN_SECRET) as { vehicleIds: string[] };

        if (!decoded.vehicleIds || !Array.isArray(decoded.vehicleIds)) {
          throw new Error("Invalid token structure");
        }

        // Fetch vehicles
        const vehiclePromises = decoded.vehicleIds.map((id) => ctx.db.collection("vehicles").doc(id).get());
        const vehicleDocs = await Promise.all(vehiclePromises);

        const missingVehicles = decoded.vehicleIds.filter((id, index) => !vehicleDocs[index]?.exists);
        if (missingVehicles.length > 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Vehicles not found: ${missingVehicles.join(", ")}`,
          });
        }

        // Transform vehicles
        const vehicles = vehicleDocs.map((doc) => {
          const data = doc.data()!;
          return {
            id: doc.id,
            make: "Toyota" as const,
            model: (data.model as string) ?? "",
            year: (data.year as number) ?? 2024,
            bodyStyle: ((data.specs as Record<string, unknown>)?.body as "sedan" | "suv" | "truck" | "van" | "coupe" | "hatchback") ?? "sedan",
            fuelType: ((data.specs as Record<string, unknown>)?.powertrain as "gas" | "hybrid" | "electric" | "plugin-hybrid") ?? "gas",
            seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
            mpgCity: ((data.performance as Record<string, unknown>)?.mpgCity as number | null) ?? null,
            mpgHighway: ((data.performance as Record<string, unknown>)?.mpgHighway as number | null) ?? null,
            mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
            range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
            cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
            towingCapacity: 0,
            awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
            fourWheelDrive: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "4wd"),
            msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
            features: [
              ...((data.features as Record<string, string[]>)?.standard ?? []),
              ...((data.features as Record<string, string[]>)?.safety ?? []),
              ...((data.features as Record<string, string[]>)?.technology ?? []),
            ],
            safetyRating: null,
            trims: (data.trims as string[]) ?? [],
            imageUrls: (data.imageUrls as string[]) ?? [],
            description: (data.description as string) ?? "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });

        const categoryWinners = calculateCategoryWinners(vehicles);
        const comparisonMatrix = buildComparisonMatrix(vehicles);

        return {
          vehicleIds: decoded.vehicleIds,
          vehicles,
          categoryWinners,
          comparisonMatrix,
        };
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired share token",
        });
      }
    }),

  /**
   * Generate a shareable link for a compare set
   */
  generateShareLink: publicProcedure
    .input(z.object({ vehicleIds: z.array(z.string()).min(1).max(4) }))
    .mutation(async ({ input, ctx }) => {
      const { vehicleIds } = input;

      // Validate vehicle IDs exist
      const vehiclePromises = vehicleIds.map((id) => ctx.db.collection("vehicles").doc(id).get());
      const vehicleDocs = await Promise.all(vehiclePromises);
      const missingVehicles = vehicleIds.filter((id, index) => !vehicleDocs[index]?.exists);

      if (missingVehicles.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid vehicle IDs: ${missingVehicles.join(", ")}`,
        });
      }

      // Generate JWT share token
      const expiresAt = new Date(Date.now() + SHARE_TOKEN_EXPIRY * 1000);
      const shareToken = sign(
        { vehicleIds },
        SHARE_TOKEN_SECRET,
        { expiresIn: SHARE_TOKEN_EXPIRY }
      );

      // Build share URL (use environment variable for base URL in production)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const shareUrl = `${baseUrl}/compare/shared?token=${shareToken}`;

      return {
        shareToken,
        shareUrl,
        expiresAt,
      };
    }),
});
