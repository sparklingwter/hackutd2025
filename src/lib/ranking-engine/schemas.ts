/**
 * Ranking Engine - Schemas
 * 
 * Zod schemas for AI-powered vehicle ranking and recommendations.
 */

import { z } from 'zod';

/**
 * User needs profile for ranking
 */
export const UserNeedsSchema = z.object({
  budgetType: z.enum(['monthly', 'cash']),
  budgetAmount: z.number().positive(),
  bodyStyle: z.enum(['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback']),
  seating: z.number().int().min(2).max(8),
  fuelType: z.enum(['gas', 'hybrid', 'electric', 'plugin-hybrid']),
  priorityMpg: z.boolean(),
  priorityRange: z.boolean(),
  cargoNeeds: z.enum(['none', 'light', 'moderate', 'heavy']),
  towingNeeds: z.enum(['none', 'light', 'moderate', 'heavy']),
  requireAwd: z.boolean(),
  safetyPriority: z.enum(['low', 'medium', 'high']),
  driverAssistNeeds: z.array(z.string()),
  mustHaveFeatures: z.array(z.string()),
  drivingPattern: z.enum(['urban', 'highway', 'mixed']),
  commuteLength: z.enum(['short', 'medium', 'long']),
});

export type UserNeeds = z.infer<typeof UserNeedsSchema>;

/**
 * Vehicle for ranking (simplified view)
 * NOTE: Uses normalized format after transformation from raw Firestore schema
 */
export const VehicleForRankingSchema = z.object({
  id: z.string(),
  model: z.string(),
  year: z.number(),
  bodyStyle: z.string(), // Mapped from specs.body
  fuelType: z.string(), // Mapped from specs.powertrain
  seating: z.number(), // Mapped from dimensions.seating
  mpgCombined: z.number().nullable(), // From performance.mpgCombined
  range: z.number().nullable(), // From specs.range
  cargoVolume: z.number(), // Mapped from dimensions.cargo
  towingCapacity: z.number(), // Not in schema, defaults to 0
  awd: z.boolean(), // Derived from specs.drivetrain === 'awd'
  msrp: z.number(), // Mapped from pricing.msrp (may be 0 if null)
  features: z.array(z.string()), // Flattened from features object
  safetyRating: z.number().nullable(), // Not in schema, defaults to null
});

export type VehicleForRanking = z.infer<typeof VehicleForRankingSchema>;

/**
 * Ranked vehicle with score and explanation
 */
export const RankedVehicleSchema = z.object({
  vehicleId: z.string(),
  score: z.number().min(0).max(100),
  tier: z.enum(['top-pick', 'strong-contender', 'explore-alternative']),
  explanation: z.string().max(500),
  matchedCriteria: z.array(z.string()),
  tradeoffs: z.array(z.string()).optional(),
});

export type RankedVehicle = z.infer<typeof RankedVehicleSchema>;

/**
 * Tiered recommendations result
 */
export const TieredRecommendationsSchema = z.object({
  topPicks: z.array(RankedVehicleSchema).max(3),
  strongContenders: z.array(RankedVehicleSchema),
  exploreAlternatives: z.array(RankedVehicleSchema),
});

export type TieredRecommendations = z.infer<typeof TieredRecommendationsSchema>;
