/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Query } from "firebase-admin/firestore";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import {
  VehicleFiltersSchema,
  PaginationInputSchema,
} from "~/server/api/schemas";

/**
 * Vehicles Router - Vehicle catalog, details, and trim information
 * 
 * Provides read-only access to vehicle database with filtering, sorting,
 * and pagination. All procedures are public (no authentication required).
 * Responses are CDN-cached with 1-hour TTL for optimal performance.
 * 
 * @module server/api/routers/vehicles
 * @cache CDN TTL: 1 hour
 */
export const vehiclesRouter = createTRPCRouter({
  /**
   * List vehicles with optional filters and pagination
   * 
   * Fetch paginated vehicle catalog with support for filtering by body style,
   * fuel type, price range, and seating capacity. Uses cursor-based pagination
   * for efficient large dataset traversal.
   * 
   * @param {object} input - Input parameters
   * @param {VehicleFilters} [input.filters] - Optional filtering criteria
   * @param {BodyStyle} [input.filters.bodyStyle] - Filter by body type
   * @param {FuelType} [input.filters.fuelType] - Filter by powertrain
   * @param {number} [input.filters.minPrice] - Minimum MSRP
   * @param {number} [input.filters.maxPrice] - Maximum MSRP
   * @param {number} [input.filters.minSeating] - Minimum passenger capacity
   * @param {number} [input.filters.maxSeating] - Maximum passenger capacity
   * @param {SortOption} [input.sort="name-asc"] - Sort order
   * @param {PaginationInput} input.pagination - Pagination parameters
   * @param {number} [input.pagination.limit] - Results per page
   * @param {string} [input.pagination.cursor] - Resume from vehicle ID
   * 
   * @returns {Promise<VehicleListResult>} Paginated vehicle list
   * @returns {Vehicle[]} returns.items - Array of vehicles for current page
   * @returns {string|null} returns.nextCursor - Cursor for next page (null if last)
   * @returns {number|undefined} returns.total - Total count (omitted for performance)
   * 
   * @throws {TRPCError} INTERNAL_SERVER_ERROR - Database query failed
   * 
   * @example
   * ```typescript
   * const result = await trpc.vehicles.list.query({
   *   filters: {
   *     bodyStyle: "suv",
   *     maxPrice: 50000
   *   },
   *   sort: "price-asc",
   *   pagination: { limit: 20 }
   * });
   * ```
   * 
   * @see Requires Firestore composite indexes for multi-field filtering
   */
  list: publicProcedure
    .input(
      z.object({
        filters: VehicleFiltersSchema.optional(),
        sort: z
          .enum(["price-asc", "price-desc", "mpg-desc", "name-asc", "year-desc"])
          .optional()
          .default("name-asc"),
        pagination: PaginationInputSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Start Firestore query with proper typing
        let query: Query = ctx.db.collection("vehicles") as Query;

        // Apply filters
        if (input.filters?.bodyStyle) {
          query = query.where("specs.body", "==", input.filters.bodyStyle);
        }
        if (input.filters?.fuelType) {
          query = query.where("specs.powertrain", "==", input.filters.fuelType);
        }
        if (input.filters?.minPrice) {
          query = query.where("pricing.msrp", ">=", input.filters.minPrice);
        }
        if (input.filters?.maxPrice) {
          query = query.where("pricing.msrp", "<=", input.filters.maxPrice);
        }
        if (input.filters?.minSeating) {
          query = query.where("dimensions.seating", ">=", input.filters.minSeating);
        }
        if (input.filters?.maxSeating) {
          query = query.where("dimensions.seating", "<=", input.filters.maxSeating);
        }

        // Apply sorting
        switch (input.sort) {
          case "price-asc":
            query = query.orderBy("pricing.msrp", "asc");
            break;
          case "price-desc":
            query = query.orderBy("pricing.msrp", "desc");
            break;
          case "mpg-desc":
            query = query.orderBy("performance.mpgCombined", "desc");
            break;
          case "name-asc":
            query = query.orderBy("model", "asc");
            break;
          case "year-desc":
            query = query.orderBy("year", "desc");
            break;
        }

        // Apply pagination
        if (input.pagination.cursor) {
          const cursorDoc = await ctx.db.collection("vehicles").doc(input.pagination.cursor).get();
          if (cursorDoc.exists) {
            query = query.startAfter(cursorDoc);
          }
        }

        query = query.limit(input.pagination.limit);

        const snapshot = await query.get();

        // Transform Firestore documents to Vehicle schema
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            make: "Toyota" as const,
            model: (data.model as string) ?? "",
            year: (data.year as number) ?? 2024,
            bodyStyle: ((data.specs as Record<string, unknown>)?.body as any) ?? "sedan",
            fuelType: ((data.specs as Record<string, unknown>)?.powertrain as any) ?? "gas",
            seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
            mpgCity: ((data.performance as Record<string, unknown>)?.mpgCity as number | null) ?? null,
            mpgHighway: ((data.performance as Record<string, unknown>)?.mpgHighway as number | null) ?? null,
            mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
            range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
            cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
            towingCapacity: ((data.specs as Record<string, unknown>)?.towingCapacity as number) ?? 0,
            awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
            fourWheelDrive: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "4wd"),
            msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
            features: [
              ...((data.features as Record<string, string[]>)?.standard ?? []),
              ...((data.features as Record<string, string[]>)?.safety ?? []),
              ...((data.features as Record<string, string[]>)?.technology ?? []),
            ],
            safetyRating: ((data.safety as Record<string, unknown>)?.nhtsaRating as number | null) ?? null,
            trims: ((data.trims as string[]) ?? []),
            imageUrls: ((data.images as string[]) ?? []),
            description: (data.description as string) ?? "",
            createdAt: data.createdAt?.toDate() ?? new Date(),
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
          };
        });

        // Determine next cursor
        const nextCursor = snapshot.docs.length === input.pagination.limit
          ? snapshot.docs[snapshot.docs.length - 1]?.id ?? null
          : null;

        return {
          items,
          nextCursor,
          total: undefined, // Count queries are expensive, omit for now
        };
      } catch (error) {
        console.error("Failed to list vehicles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch vehicles",
        });
      }
    }),

  /**
   * Get detailed information for a specific vehicle
   * 
   * Fetches complete vehicle data including specs, features, images, and
   * available trim levels. Returns 404 if vehicle doesn't exist.
   * 
   * @param {object} input - Input parameters
   * @param {string} input.vehicleId - Vehicle identifier
   * 
   * @returns {Promise<Vehicle>} Complete vehicle details
   * @returns {string} returns.id - Vehicle identifier
   * @returns {"Toyota"} returns.make - Always "Toyota"
   * @returns {string} returns.model - Model name (Camry, RAV4, etc.)
   * @returns {number} returns.year - Model year
   * @returns {BodyStyle} returns.bodyStyle - Body type
   * @returns {FuelType} returns.fuelType - Powertrain type
   * @returns {number} returns.seating - Passenger capacity
   * @returns {number|null} returns.mpgCombined - Combined fuel economy
   * @returns {number|null} returns.range - Electric range (EVs only)
   * @returns {number} returns.cargoVolume - Cargo capacity (cu ft)
   * @returns {number} returns.towingCapacity - Max towing (lbs)
   * @returns {number} returns.msrp - Base price
   * @returns {string[]} returns.features - All standard features
   * @returns {number|null} returns.safetyRating - NHTSA rating (1-5)
   * @returns {string[]} returns.trims - Available trim levels
   * @returns {string[]} returns.imageUrls - Vehicle photos
   * @returns {string} returns.description - Marketing description
   * 
   * @throws {TRPCError} NOT_FOUND - Vehicle doesn't exist
   * @throws {TRPCError} INTERNAL_SERVER_ERROR - Database error
   * 
   * @example
   * ```typescript
   * const vehicle = await trpc.vehicles.getById.query({
   *   vehicleId: "camry-2024"
   * });
   * ```
   */
  getById: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const doc = await ctx.db.collection("vehicles").doc(input.vehicleId).get();

        if (!doc.exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vehicle not found",
          });
        }

        const data = doc.data()!;

        return {
          id: doc.id,
          make: "Toyota" as const,
          model: (data.model as string) ?? "",
          year: (data.year as number) ?? 2024,
          bodyStyle: ((data.specs as Record<string, unknown>)?.body as any) ?? "sedan",
          fuelType: ((data.specs as Record<string, unknown>)?.powertrain as any) ?? "gas",
          seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
          mpgCity: ((data.performance as Record<string, unknown>)?.mpgCity as number | null) ?? null,
          mpgHighway: ((data.performance as Record<string, unknown>)?.mpgHighway as number | null) ?? null,
          mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
          range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
          cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
          towingCapacity: ((data.specs as Record<string, unknown>)?.towingCapacity as number) ?? 0,
          awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
          fourWheelDrive: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "4wd"),
          msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
          features: [
            ...((data.features as Record<string, string[]>)?.standard ?? []),
            ...((data.features as Record<string, string[]>)?.safety ?? []),
            ...((data.features as Record<string, string[]>)?.technology ?? []),
          ],
          safetyRating: ((data.safety as Record<string, unknown>)?.nhtsaRating as number | null) ?? null,
          trims: ((data.trims as string[]) ?? []),
          imageUrls: ((data.images as string[]) ?? []),
          description: (data.description as string) ?? "",
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to fetch vehicle:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch vehicle details",
        });
      }
    }),

  /**
   * T041: vehicles.getTrims - Get all available trims for a vehicle
   */
  getTrims: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // First check if vehicle exists
        const vehicleDoc = await ctx.db.collection("vehicles").doc(input.vehicleId).get();
        if (!vehicleDoc.exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vehicle not found",
          });
        }

        // Fetch trims subcollection
        const trimsSnapshot = await ctx.db
          .collection("vehicles")
          .doc(input.vehicleId)
          .collection("trims")
          .orderBy("msrp", "asc")
          .get();

        const trims = trimsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: (data.name as string) ?? "",
            msrp: (data.msrp as number) ?? 0,
            features: (data.features as string[]) ?? [],
            engine: (data.engine as string) ?? "",
            horsepower: (data.horsepower as number) ?? 0,
            torque: (data.torque as number) ?? 0,
            zeroToSixty: (data.zeroToSixty as number | null) ?? null,
            transmission: (data.transmission as string) ?? "",
            driveType: ((data.driveType as string) ?? "fwd") as "fwd" | "rwd" | "awd" | "4wd",
            imageUrls: (data.imageUrls as string[]) ?? undefined,
          };
        });

        return { trims };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to fetch trims:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch vehicle trims",
        });
      }
    }),

  /**
   * T042: vehicles.getTrimById - Get detailed information for a specific trim
   */
  getTrimById: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const doc = await ctx.db
          .collection("vehicles")
          .doc(input.vehicleId)
          .collection("trims")
          .doc(input.trimId)
          .get();

        if (!doc.exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Trim not found",
          });
        }

        const data = doc.data()!;

        return {
          id: doc.id,
          name: (data.name as string) ?? "",
          msrp: (data.msrp as number) ?? 0,
          features: (data.features as string[]) ?? [],
          engine: (data.engine as string) ?? "",
          horsepower: (data.horsepower as number) ?? 0,
          torque: (data.torque as number) ?? 0,
          zeroToSixty: (data.zeroToSixty as number | null) ?? null,
          transmission: (data.transmission as string) ?? "",
          driveType: ((data.driveType as string) ?? "fwd") as "fwd" | "rwd" | "awd" | "4wd",
          imageUrls: (data.imageUrls as string[]) ?? undefined,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to fetch trim:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch trim details",
        });
      }
    }),

  /**
   * T043: vehicles.search - Text search for vehicles
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        pagination: PaginationInputSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Simple text search by model name (case-insensitive)
        // For production, consider using Algolia or similar for full-text search
        const searchTerm = input.query.toLowerCase();

        const snapshot = await ctx.db
          .collection("vehicles")
          .orderBy("model", "asc")
          .limit(100) // Fetch more for client-side filtering
          .get();

        // Filter in memory for text matching
        const matchedDocs = snapshot.docs.filter((doc) => {
          const data = doc.data();
          const model = (data.model as string)?.toLowerCase() ?? "";
          const description = (data.description as string)?.toLowerCase() ?? "";
          return model.includes(searchTerm) || description.includes(searchTerm);
        });

        // Apply pagination
        const startIndex = input.pagination.cursor
          ? matchedDocs.findIndex((doc) => doc.id === input.pagination.cursor) + 1
          : 0;

        const paginatedDocs = matchedDocs.slice(
          startIndex,
          startIndex + input.pagination.limit
        );

        // Transform to Vehicle schema
        const items = paginatedDocs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            make: "Toyota" as const,
            model: (data.model as string) ?? "",
            year: (data.year as number) ?? 2024,
            bodyStyle: ((data.specs as Record<string, unknown>)?.body as any) ?? "sedan",
            fuelType: ((data.specs as Record<string, unknown>)?.powertrain as any) ?? "gas",
            seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
            mpgCity: ((data.performance as Record<string, unknown>)?.mpgCity as number | null) ?? null,
            mpgHighway: ((data.performance as Record<string, unknown>)?.mpgHighway as number | null) ?? null,
            mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
            range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
            cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
            towingCapacity: ((data.specs as Record<string, unknown>)?.towingCapacity as number) ?? 0,
            awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
            fourWheelDrive: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "4wd"),
            msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
            features: [
              ...((data.features as Record<string, string[]>)?.standard ?? []),
              ...((data.features as Record<string, string[]>)?.safety ?? []),
              ...((data.features as Record<string, string[]>)?.technology ?? []),
            ],
            safetyRating: ((data.safety as Record<string, unknown>)?.nhtsaRating as number | null) ?? null,
            trims: ((data.trims as string[]) ?? []),
            imageUrls: ((data.images as string[]) ?? []),
            description: (data.description as string) ?? "",
            createdAt: data.createdAt?.toDate() ?? new Date(),
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
          };
        });

        const nextCursor =
          paginatedDocs.length === input.pagination.limit
            ? paginatedDocs[paginatedDocs.length - 1]?.id ?? null
            : null;

        return {
          items,
          nextCursor,
          total: matchedDocs.length,
        };
      } catch (error) {
        console.error("Failed to search vehicles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search vehicles",
        });
      }
    }),

  /**
   * T044: vehicles.getFeaturedVehicles - Get featured vehicles for homepage
   */
  getFeaturedVehicles: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(6),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Fetch vehicles marked as featured or top-rated
        const snapshot = await ctx.db
          .collection("vehicles")
          .where("featured", "==", true)
          .limit(input.limit)
          .get();

        // If no featured vehicles, fall back to highest-rated or newest
        let docs = snapshot.docs;
        if (docs.length === 0) {
          const fallbackSnapshot = await ctx.db
            .collection("vehicles")
            .orderBy("year", "desc")
            .limit(input.limit)
            .get();
          docs = fallbackSnapshot.docs;
        }

        // Transform to Vehicle schema
        const items = docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            make: "Toyota" as const,
            model: (data.model as string) ?? "",
            year: (data.year as number) ?? 2024,
            bodyStyle: ((data.specs as Record<string, unknown>)?.body as any) ?? "sedan",
            fuelType: ((data.specs as Record<string, unknown>)?.powertrain as any) ?? "gas",
            seating: ((data.dimensions as Record<string, unknown>)?.seating as number) ?? 5,
            mpgCity: ((data.performance as Record<string, unknown>)?.mpgCity as number | null) ?? null,
            mpgHighway: ((data.performance as Record<string, unknown>)?.mpgHighway as number | null) ?? null,
            mpgCombined: ((data.performance as Record<string, unknown>)?.mpgCombined as number | null) ?? null,
            range: ((data.specs as Record<string, unknown>)?.range as number | null) ?? null,
            cargoVolume: ((data.dimensions as Record<string, unknown>)?.cargo as number) ?? 0,
            towingCapacity: ((data.specs as Record<string, unknown>)?.towingCapacity as number) ?? 0,
            awd: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "awd"),
            fourWheelDrive: (((data.specs as Record<string, unknown>)?.drivetrain as string)?.toLowerCase() === "4wd"),
            msrp: ((data.pricing as Record<string, unknown>)?.msrp as number) ?? 0,
            features: [
              ...((data.features as Record<string, string[]>)?.standard ?? []),
              ...((data.features as Record<string, string[]>)?.safety ?? []),
              ...((data.features as Record<string, string[]>)?.technology ?? []),
            ],
            safetyRating: ((data.safety as Record<string, unknown>)?.nhtsaRating as number | null) ?? null,
            trims: ((data.trims as string[]) ?? []),
            imageUrls: ((data.images as string[]) ?? []),
            description: (data.description as string) ?? "",
            createdAt: data.createdAt?.toDate() ?? new Date(),
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
          };
        });

        return {
          items,
        };
      } catch (error) {
        console.error("Failed to fetch featured vehicles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch featured vehicles",
        });
      }
    }),
});
