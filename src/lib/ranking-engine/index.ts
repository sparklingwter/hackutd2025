/**
 * Ranking Engine - Main Entry Point
 * 
 * Provides a unified interface for vehicle ranking with automatic fallback:
 * 1. Try Gemini API (primary)
 * 2. Try OpenRouter (fallback)
 * 3. Use deterministic ranking (guaranteed fallback)
 */

export { rankVehicles, calculateMatchScore, generateExplanation, identifyTradeoffs } from './ranking';
export { applySafetyFilters, meetsMinimumSafety, calculateSafetyScore } from './safety';
export { generateGeminiRecommendations } from './gemini';
export { generateOpenRouterRecommendations } from './openrouter';
export * from './schemas';

import type { UserNeeds, VehicleForRanking, TieredRecommendations, RankedVehicle } from './schemas';
import { rankVehicles } from './ranking';
import { generateGeminiRecommendations } from './gemini';
import { generateOpenRouterRecommendations } from './openrouter';

export interface RecommendationOptions {
  provider?: 'gemini' | 'openrouter' | 'deterministic';
  useAI?: boolean;
}

/**
 * Generate vehicle recommendations with automatic fallback
 * 
 * Attempts to use AI providers in order:
 * 1. Gemini (if enabled and available)
 * 2. OpenRouter (if enabled and available)
 * 3. Deterministic ranking (always available)
 * 
 * @param vehicles - List of vehicles to rank
 * @param userNeeds - User preferences and requirements
 * @param options - Ranking options
 * @returns Tiered recommendations
 */
export async function generateRecommendations(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds,
  options: RecommendationOptions = {}
): Promise<TieredRecommendations> {
  const { provider = 'gemini', useAI = true } = options;

  // If AI is disabled, use deterministic ranking
  if (!useAI || provider === 'deterministic') {
    return rankVehicles(vehicles, userNeeds);
  }

  // Try AI providers with fallback
  try {
    if (provider === 'gemini') {
      // Try Gemini first
      try {
        const rankedVehicles = await generateGeminiRecommendations(vehicles, userNeeds);
        return tierRankedVehicles(rankedVehicles);
      } catch (geminiError) {
        console.warn('Gemini API failed, falling back to OpenRouter:', geminiError);
        
        // Try OpenRouter fallback
        try {
          const rankedVehicles = await generateOpenRouterRecommendations(vehicles, userNeeds);
          return tierRankedVehicles(rankedVehicles);
        } catch (openRouterError) {
          console.warn('OpenRouter failed, falling back to deterministic:', openRouterError);
        }
      }
    } else if (provider === 'openrouter') {
      // Use OpenRouter directly
      const rankedVehicles = await generateOpenRouterRecommendations(vehicles, userNeeds);
      return tierRankedVehicles(rankedVehicles);
    }
  } catch (error) {
    console.error('All AI providers failed, using deterministic ranking:', error);
  }

  // Final fallback: deterministic ranking
  return rankVehicles(vehicles, userNeeds);
}

/**
 * Convert flat ranked list to tiered structure
 */
function tierRankedVehicles(rankedVehicles: RankedVehicle[]): TieredRecommendations {
  // Sort by score
  rankedVehicles.sort((a, b) => b.score - a.score);

  const topPicks = rankedVehicles.filter((v) => v.score >= 80).slice(0, 3);
  const strongContenders = rankedVehicles.filter((v) => v.score >= 60 && v.score < 80).slice(0, 5);
  const exploreAlternatives = rankedVehicles.filter((v) => v.score < 60).slice(0, 5);

  return {
    topPicks: topPicks.map(v => ({ ...v, tier: 'top-pick' as const })),
    strongContenders: strongContenders.map(v => ({ ...v, tier: 'strong-contender' as const })),
    exploreAlternatives: exploreAlternatives.map(v => ({ ...v, tier: 'explore-alternative' as const })),
  };
}

/**
 * Library version
 */
export const VERSION = '1.0.0';
