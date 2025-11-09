/**
 * Ranking Engine - Deterministic Ranking Logic
 * 
 * Implements rules-based scoring and filtering when AI is unavailable or as a fallback.
 */

import type { UserNeeds, VehicleForRanking, RankedVehicle, TieredRecommendations } from './schemas';

/**
 * Calculate a deterministic match score (0-100) based on how well a vehicle matches user needs
 */
export function calculateMatchScore(vehicle: VehicleForRanking, userNeeds: UserNeeds): number {
  let score = 0;
  const matchedCriteria: string[] = [];

  // Budget match (25 points max)
  const budgetScore = calculateBudgetScore(vehicle.msrp, userNeeds.budgetType, userNeeds.budgetAmount);
  score += budgetScore;
  if (budgetScore > 15) {
    matchedCriteria.push('Within budget');
  }

  // Body style match (15 points)
  if (vehicle.bodyStyle.toLowerCase() === userNeeds.bodyStyle.toLowerCase()) {
    score += 15;
    matchedCriteria.push(`${vehicle.bodyStyle} body style`);
  }

  // Fuel type match (15 points)
  if (vehicle.fuelType.toLowerCase() === userNeeds.fuelType.toLowerCase()) {
    score += 15;
    matchedCriteria.push(`${vehicle.fuelType} powertrain`);
  }

  // Seating (10 points)
  if (vehicle.seating >= userNeeds.seating) {
    score += 10;
    matchedCriteria.push(`${vehicle.seating} seats`);
  }

  // Fuel efficiency (10 points if prioritized)
  if (userNeeds.priorityMpg && vehicle.mpgCombined && vehicle.mpgCombined >= 30) {
    score += 10;
    matchedCriteria.push('Excellent fuel economy');
  }

  // Range (10 points if prioritized for EV/PHEV)
  if (userNeeds.priorityRange && vehicle.range && vehicle.range >= 250) {
    score += 10;
    matchedCriteria.push('Long electric range');
  }

  // AWD requirement (10 points if required and available)
  if (userNeeds.requireAwd && vehicle.awd) {
    score += 10;
    matchedCriteria.push('All-wheel drive');
  }

  // Cargo needs (5 points)
  if (userNeeds.cargoNeeds !== 'none' && vehicle.cargoVolume > 20) {
    score += 5;
    matchedCriteria.push('Ample cargo space');
  }

  // Towing needs (5 points)
  if (userNeeds.towingNeeds !== 'none' && vehicle.towingCapacity > 3500) {
    score += 5;
    matchedCriteria.push('Strong towing capacity');
  }

  // Safety rating (5 points)
  if (userNeeds.safetyPriority === 'high' && vehicle.safetyRating && vehicle.safetyRating >= 4) {
    score += 5;
    matchedCriteria.push('High safety rating');
  }

  return Math.min(100, Math.round(score));
}

/**
 * Calculate budget match score (0-25 points)
 */
function calculateBudgetScore(msrp: number, budgetType: string, budgetAmount: number): number {
  if (budgetType === 'cash') {
    // Cash budget - direct comparison
    if (msrp <= budgetAmount) return 25;
    if (msrp <= budgetAmount * 1.1) return 20; // Within 10%
    if (msrp <= budgetAmount * 1.2) return 15; // Within 20%
    if (msrp <= budgetAmount * 1.3) return 10; // Within 30%
    return 0;
  } else {
    // Monthly budget - rough estimate (60 month loan at 6% APR)
    const estimatedMonthly = (msrp * 0.0193); // Simplified multiplier
    if (estimatedMonthly <= budgetAmount) return 25;
    if (estimatedMonthly <= budgetAmount * 1.1) return 20;
    if (estimatedMonthly <= budgetAmount * 1.2) return 15;
    if (estimatedMonthly <= budgetAmount * 1.3) return 10;
    return 0;
  }
}

/**
 * Generate explanation text based on matched criteria
 */
export function generateExplanation(
  vehicle: VehicleForRanking,
  score: number,
  matchedCriteria: string[]
): string {
  if (score >= 80) {
    return `Excellent match! This ${vehicle.model} checks all your key requirements: ${matchedCriteria.slice(0, 3).join(', ')}.`;
  } else if (score >= 60) {
    return `Strong contender. The ${vehicle.model} meets most of your needs including ${matchedCriteria.slice(0, 2).join(' and ')}.`;
  } else {
    return `Worth exploring. While the ${vehicle.model} may not match all criteria, it offers ${matchedCriteria[0] ?? 'compelling features'}.`;
  }
}

/**
 * Identify tradeoffs for a vehicle
 */
export function identifyTradeoffs(vehicle: VehicleForRanking, userNeeds: UserNeeds): string[] {
  const tradeoffs: string[] = [];

  // Budget tradeoff
  const budgetScore = calculateBudgetScore(vehicle.msrp, userNeeds.budgetType, userNeeds.budgetAmount);
  if (budgetScore < 25 && budgetScore > 0) {
    tradeoffs.push('Slightly over budget');
  }

  // Fuel type tradeoff
  if (vehicle.fuelType !== userNeeds.fuelType) {
    tradeoffs.push(`${vehicle.fuelType} instead of ${userNeeds.fuelType}`);
  }

  // AWD tradeoff
  if (userNeeds.requireAwd && !vehicle.awd) {
    tradeoffs.push('No AWD available');
  }

  // MPG tradeoff
  if (userNeeds.priorityMpg && vehicle.mpgCombined && vehicle.mpgCombined < 25) {
    tradeoffs.push('Lower fuel economy');
  }

  return tradeoffs;
}

/**
 * Rank vehicles deterministically and tier them
 */
export function rankVehicles(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds
): TieredRecommendations {
  // Score all vehicles
  const scoredVehicles = vehicles.map((vehicle) => {
    const score = calculateMatchScore(vehicle, userNeeds);
    const matchedCriteria: string[] = [];
    const explanation = generateExplanation(vehicle, score, matchedCriteria);
    const tradeoffs = identifyTradeoffs(vehicle, userNeeds);

    return {
      vehicleId: vehicle.id,
      score,
      tier: 'explore-alternative' as const,
      explanation,
      matchedCriteria,
      tradeoffs: tradeoffs.length > 0 ? tradeoffs : undefined,
    };
  });

  // Sort by score descending
  scoredVehicles.sort((a, b) => b.score - a.score);

  // Tier vehicles
  const topPicks: RankedVehicle[] = [];
  const strongContenders: RankedVehicle[] = [];
  const exploreAlternatives: RankedVehicle[] = [];

  scoredVehicles.forEach((vehicle) => {
    if (vehicle.score >= 80 && topPicks.length < 3) {
      topPicks.push({ ...vehicle, tier: 'top-pick' });
    } else if (vehicle.score >= 60 && strongContenders.length < 5) {
      strongContenders.push({ ...vehicle, tier: 'strong-contender' });
    } else if (exploreAlternatives.length < 5) {
      exploreAlternatives.push({ ...vehicle, tier: 'explore-alternative' });
    }
  });

  return {
    topPicks,
    strongContenders,
    exploreAlternatives,
  };
}
