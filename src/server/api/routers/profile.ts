import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { userProfilesCollection } from "~/server/db/collections";
import {
  UserNeedsProfileSchema,
  CompareSetSchema,
  EstimateSchema,
} from "~/server/api/schemas";
import type { FieldValue, Timestamp } from "firebase-admin/firestore";
import { FieldValue as FieldValueClass } from "firebase-admin/firestore";

/**
 * Profile Router - User profile management, favorites, and saved items
 * 
 * Note: Currently using local browser storage only (no authentication).
 * User ID is passed from client-side localStorage.
 */

export const profileRouter = createTRPCRouter({
  /**
   * T041 [P] [US4]: Get user profile (auto-create on first access)
   */
  get: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();

        if (!doc.exists) {
          // Auto-create profile on first access
          const newProfile = {
            userId: input.userId,
            email: undefined,
            displayName: undefined,
            preferences: undefined,
            favorites: [],
            savedSearches: [],
            compareSets: [],
            estimates: [],
            voiceEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await userProfilesCollection().doc(input.userId).set(newProfile);
          return newProfile;
        }

        const data = doc.data();
        if (!data) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve profile data",
          });
        }

        // Convert Firestore timestamps to Date objects
        const createdAtValue = data.createdAt as Timestamp | undefined;
        const updatedAtValue = data.updatedAt as Timestamp | undefined;
        
        return {
          ...data,
          createdAt: createdAtValue?.toDate() ?? new Date(),
          updatedAt: updatedAtValue?.toDate() ?? new Date(),
        };
      } catch (error) {
        console.error("Failed to get profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve user profile",
        });
      }
    }),

  /**
   * T042 [P] [US4]: Update user profile fields
   */
  update: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        displayName: z.string().optional(),
        preferences: UserNeedsProfileSchema.optional(),
        voiceEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, ...updates } = input;
        const updateData: Record<string, unknown> = {
          ...updates,
          updatedAt: new Date(),
        };

        await userProfilesCollection().doc(userId).update(updateData);

        return {
          success: true,
          updatedAt: new Date(),
        };
      } catch (error) {
        console.error("Failed to update profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
        });
      }
    }),

  /**
   * T043 [P] [US4]: Add vehicle to favorites
   */
  addFavorite: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        vehicleId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if vehicle exists
        const vehicleDoc = await ctx.db.collection("vehicles").doc(input.vehicleId).get();
        if (!vehicleDoc.exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vehicle not found",
          });
        }

        // Use arrayUnion for idempotent operation
        await userProfilesCollection().doc(input.userId).update({
          favorites: FieldValueClass.arrayUnion(input.vehicleId) as unknown as FieldValue,
          updatedAt: new Date(),
        });

        // Fetch updated favorites
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();

        return {
          success: true,
          favorites: (data?.favorites as string[]) ?? [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to add favorite:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add favorite",
        });
      }
    }),

  /**
   * T044 [P] [US4]: Remove vehicle from favorites
   */
  removeFavorite: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        vehicleId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use arrayRemove for idempotent operation
        await userProfilesCollection().doc(input.userId).update({
          favorites: FieldValueClass.arrayRemove(input.vehicleId) as unknown as FieldValue,
          updatedAt: new Date(),
        });

        // Fetch updated favorites
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();

        return {
          success: true,
          favorites: (data?.favorites as string[]) ?? [],
        };
      } catch (error) {
        console.error("Failed to remove favorite:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove favorite",
        });
      }
    }),

  /**
   * T045 [P] [US4]: Get favorite vehicles with full details
   */
  getFavorites: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        const favoriteIds = (data?.favorites as string[]) ?? [];

        if (favoriteIds.length === 0) {
          return [];
        }

        // Fetch vehicle details for each favorite
        const vehiclePromises = favoriteIds.map(async (vehicleId) => {
          const vehicleDoc = await ctx.db.collection("vehicles").doc(vehicleId).get();
          if (!vehicleDoc.exists) return null;
          
          const vehicleData = vehicleDoc.data();
          return {
            id: vehicleDoc.id,
            ...vehicleData,
          };
        });

        const vehicles = await Promise.all(vehiclePromises);
        return vehicles.filter((v) => v !== null);
      } catch (error) {
        console.error("Failed to get favorites:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve favorites",
        });
      }
    }),

  /**
   * T039 [P] [US4]: Save a discovery search
   */
  saveSearch: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        search: UserNeedsProfileSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        await userProfilesCollection().doc(input.userId).update({
          savedSearches: FieldValueClass.arrayUnion(input.search) as unknown as FieldValue,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to save search:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save search",
        });
      }
    }),

  /**
   * T040 [P] [US4]: Get saved searches
   */
  getSavedSearches: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        
        return (data?.savedSearches ?? []) as z.infer<typeof UserNeedsProfileSchema>[];
      } catch (error) {
        console.error("Failed to get saved searches:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve saved searches",
        });
      }
    }),

  /**
   * T041 [P] [US4]: Delete a saved search
   */
  deleteSearch: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        searchIndex: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        const searches = (data?.savedSearches ?? []) as unknown[];
        
        if (input.searchIndex >= searches.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid search index",
          });
        }

        // Remove search at index
        searches.splice(input.searchIndex, 1);

        await userProfilesCollection().doc(input.userId).update({
          savedSearches: searches,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to delete search:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete search",
        });
      }
    }),

  /**
   * T042 [P] [US4]: Set user preferences
   */
  setPreferences: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        preferences: UserNeedsProfileSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        await userProfilesCollection().doc(input.userId).update({
          preferences: input.preferences,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to set preferences:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set preferences",
        });
      }
    }),

  /**
   * Save a compare set
   */
  saveCompareSet: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        compareSet: CompareSetSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        await userProfilesCollection().doc(input.userId).update({
          compareSets: FieldValueClass.arrayUnion(input.compareSet) as unknown as FieldValue,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to save compare set:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save compare set",
        });
      }
    }),

  /**
   * Get saved compare sets
   */
  getCompareSets: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        
        return (data?.compareSets ?? []) as z.infer<typeof CompareSetSchema>[];
      } catch (error) {
        console.error("Failed to get compare sets:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve compare sets",
        });
      }
    }),

  /**
   * Delete a compare set
   */
  deleteCompareSet: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        compareSetId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        const compareSets = (data?.compareSets ?? []) as Array<{ id: string }>;
        
        const filtered = compareSets.filter((set) => set.id !== input.compareSetId);

        await userProfilesCollection().doc(input.userId).update({
          compareSets: filtered,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to delete compare set:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete compare set",
        });
      }
    }),

  /**
   * Save an estimate
   */
  saveEstimate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        estimate: EstimateSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        await userProfilesCollection().doc(input.userId).update({
          estimates: FieldValueClass.arrayUnion(input.estimate) as unknown as FieldValue,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to save estimate:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save estimate",
        });
      }
    }),

  /**
   * Get saved estimates
   */
  getSavedEstimates: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        
        return (data?.estimates ?? []) as z.infer<typeof EstimateSchema>[];
      } catch (error) {
        console.error("Failed to get estimates:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve estimates",
        });
      }
    }),

  /**
   * Delete an estimate
   */
  deleteEstimate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        estimateId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const doc = await userProfilesCollection().doc(input.userId).get();
        const data = doc.data();
        const estimates = (data?.estimates ?? []) as Array<{ id: string }>;
        
        const filtered = estimates.filter((est) => est.id !== input.estimateId);

        await userProfilesCollection().doc(input.userId).update({
          estimates: filtered,
          updatedAt: new Date(),
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to delete estimate:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete estimate",
        });
      }
    }),
});
