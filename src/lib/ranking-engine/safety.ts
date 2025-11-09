/**
 * Ranking Engine - Safety Filters
 * 
 * Apply safety-related filters to vehicle results.
 */

import type { VehicleForRanking } from './schemas';

export interface SafetyFilterOptions {
  minSafetyRating?: number;
  requiredFeatures?: string[];
  excludeFeatures?: string[];
}

/**
 * Apply safety filters to a list of vehicles
 */
export function applySafetyFilters(
  vehicles: VehicleForRanking[],
  options: SafetyFilterOptions
): VehicleForRanking[] {
  let filtered = vehicles;

  // Filter by minimum safety rating
  if (options.minSafetyRating !== undefined) {
    filtered = filtered.filter(
      (v) => v.safetyRating !== null && v.safetyRating >= options.minSafetyRating!
    );
  }

  // Filter by required features
  if (options.requiredFeatures && options.requiredFeatures.length > 0) {
    filtered = filtered.filter((v) =>
      options.requiredFeatures!.every((feature) => v.features.includes(feature))
    );
  }

  // Filter by excluded features
  if (options.excludeFeatures && options.excludeFeatures.length > 0) {
    filtered = filtered.filter((v) =>
      options.excludeFeatures!.every((feature) => !v.features.includes(feature))
    );
  }

  return filtered;
}

/**
 * Validate that a vehicle meets minimum safety requirements
 */
export function meetsMinimumSafety(vehicle: VehicleForRanking): boolean {
  // Minimum requirements:
  // - Safety rating of 3+ (if available)
  // - Basic safety features (airbags, ABS, stability control)
  
  if (vehicle.safetyRating !== null && vehicle.safetyRating < 3) {
    return false;
  }

  const requiredSafetyFeatures = ['airbags', 'abs', 'stability-control'];
  const hasRequiredFeatures = requiredSafetyFeatures.some((feature) =>
    vehicle.features.includes(feature)
  );

  return hasRequiredFeatures;
}

/**
 * Get safety score for a vehicle (0-100)
 */
export function calculateSafetyScore(vehicle: VehicleForRanking): number {
  let score = 0;

  // Safety rating (40 points)
  if (vehicle.safetyRating !== null) {
    score += (vehicle.safetyRating / 5) * 40;
  }

  // Advanced safety features (60 points)
  const advancedFeatures = [
    'forward-collision-warning',
    'automatic-emergency-braking',
    'lane-departure-warning',
    'lane-keep-assist',
    'blind-spot-monitoring',
    'rear-cross-traffic-alert',
    'adaptive-cruise-control',
    'driver-attention-monitor',
  ];

  const featureCount = advancedFeatures.filter((f) => vehicle.features.includes(f)).length;
  score += (featureCount / advancedFeatures.length) * 60;

  return Math.round(score);
}
