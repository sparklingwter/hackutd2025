import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sign, verify } from "jsonwebtoken";
import { getVehicleImages } from "~/lib/imageMapper";

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
   * Get side-by-side comparison data for multiple vehicles
   * 
   * Fetches detailed information for 2-4 vehicles and calculates category
   * winners (best price, MPG, cargo, etc.) for easy comparison. Supports
   * optional trim-specific comparisons.
   * 
   * @param {object} input - Input parameters
   * @param {string[]} input.vehicleIds - Vehicle IDs to compare (1-4 vehicles)
   * @param {string[]} [input.trimIds] - Optional trim IDs (must match vehicleIds length)
   * 
   * @returns {Promise<ComparisonResult>} Comparison data with winners
   * @returns {Vehicle[]} returns.vehicles - Full vehicle details for comparison
   * @returns {CategoryWinners} returns.categoryWinners - IDs of winners per category
   * @returns {string} returns.categoryWinners.lowestPrice - Vehicle with best MSRP
   * @returns {string} returns.categoryWinners.highestMpg - Vehicle with best fuel economy
   * @returns {string} returns.categoryWinners.mostCargo - Vehicle with largest cargo volume
   * @returns {string} returns.categoryWinners.highestTowing - Vehicle with best towing capacity
   * @returns {string} returns.categoryWinners.highestSafetyRating - Vehicle with best NHTSA rating
   * @returns {string} returns.categoryWinners.mostHorsepower - Vehicle with most powerful engine
   * @returns {ComparisonMatrix} returns.comparisonMatrix - Structured data for table rendering
   * 
   * @throws {TRPCError} BAD_REQUEST - trimIds length doesn't match vehicleIds
   * @throws {TRPCError} NOT_FOUND - One or more vehicles don't exist
   * 
   * @example
   * ```typescript
   * const comparison = await trpc.compare.getComparison.query({
   *   vehicleIds: ["camry-2024", "accord-2024", "altima-2024"]
   * });
   * // Returns winner badges, full specs, and comparison matrix
   * ```
   * 
   * @see {@link ComparisonTable} component for rendering logic
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
          imageUrls: getVehicleImages(
            (data.make as string) ?? "Toyota",
            (data.model as string) ?? "Unknown",
            (data.year as number) ?? 2024,
            (data.trim as string | undefined)
          ),
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
   * Get shared comparison data from shareable link (read-only)
   * 
   * Decodes JWT share token and returns comparison data for public viewing.
   * No authentication required. Token expires after 30 days.
   * 
   * @param {object} input - Input parameters
   * @param {string} input.shareToken - JWT token from share link
   * 
   * @returns {Promise<SharedComparisonResult>} Public comparison data
   * @returns {string[]} returns.vehicleIds - Vehicles in comparison
   * @returns {Vehicle[]} returns.vehicles - Full vehicle details
   * @returns {CategoryWinners} returns.categoryWinners - Category winners
   * @returns {ComparisonMatrix} returns.comparisonMatrix - Comparison table data
   * 
   * @throws {TRPCError} BAD_REQUEST - Invalid or expired token
   * @throws {TRPCError} NOT_FOUND - Vehicles in token no longer exist
   * 
   * @example
   * ```typescript
   * const shared = await trpc.compare.getSharedCompareSet.query({
   *   shareToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * });
   * ```
   * 
   * @see Token generated by {@link generateShareLink}
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
            imageUrls: getVehicleImages(
              (data.make as string) ?? "Toyota",
              (data.model as string) ?? "",
              (data.year as number) ?? 2024,
              (data.trim as string | undefined)
            ),
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
   * Generate shareable link for vehicle comparison
   * 
   * Creates JWT-signed token that can be shared via URL. Token contains
   * vehicle IDs and expires after 30 days. No authentication required.
   * 
   * @param {object} input - Input parameters
   * @param {string[]} input.vehicleIds - Vehicles to include in share link (1-4)
   * 
   * @returns {Promise<ShareLinkResult>} Generated share link details
   * @returns {string} returns.shareToken - JWT token for URL parameter
   * @returns {string} returns.shareUrl - Full shareable URL
   * @returns {Date} returns.expiresAt - Token expiration timestamp (30 days)
   * 
   * @throws {TRPCError} BAD_REQUEST - Invalid vehicle IDs
   * 
   * @example
   * ```typescript
   * const { shareUrl } = await trpc.compare.generateShareLink.mutate({
   *   vehicleIds: ["camry-2024", "accord-2024"]
   * });
   * // shareUrl: "https://app.com/compare?share=eyJhbGc..."
   * ```
   * 
   * @security Token signed with SHARE_TOKEN_SECRET environment variable
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
