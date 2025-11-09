/**
 * Ranking Engine - Gemini API Integration
 * 
 * Integrates with Google Gemini API for AI-powered vehicle recommendations.
 * Uses structured output (JSON mode) for consistent formatting.
 * 
 * Note: Requires @google/generative-ai package to be installed.
 * Falls back to deterministic ranking if API is unavailable.
 */

import type { UserNeeds, VehicleForRanking, RankedVehicle } from './schemas';
import { env } from '~/env';

/**
 * Generate AI-powered recommendations using Gemini API
 * 
 * @param vehicles - List of vehicles to rank
 * @param userNeeds - User preferences and requirements
 * @returns Ranked vehicles with AI-generated explanations
 */
export async function generateGeminiRecommendations(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds
): Promise<RankedVehicle[]> {
  // Check if API key is available
  if (!env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in environment.');
  }

  const prompt = buildPrompt(vehicles, userNeeds);

  // Call Gemini API directly via REST
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json', // Request JSON response
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json() as {
    candidates: Array<{
      content: {
        parts: Array<{ text: string }>;
      };
    }>;
  };

  const responseText = data.candidates[0]?.content?.parts[0]?.text ?? '';
  return parseGeminiResponse(responseText);
}

/**
 * Build prompt for Gemini API
 */
function buildPrompt(vehicles: VehicleForRanking[], userNeeds: UserNeeds): string {
  const vehiclesJson = JSON.stringify(vehicles, null, 2);
  const needsJson = JSON.stringify(userNeeds, null, 2);

  return `You are an automotive expert helping a customer find the perfect Toyota vehicle.

User Needs:
${needsJson}

Available Vehicles:
${vehiclesJson}

Task: Rank these vehicles from best to worst match for this customer. For each vehicle, provide:
1. A match score (0-100)
2. A brief explanation (max 200 chars) of why it's a good match
3. List of matched criteria (e.g., "Within budget", "Hybrid powertrain", "7 seats")
4. Any tradeoffs or compromises (optional)

Respond in JSON format:
{
  "rankings": [
    {
      "vehicleId": "string",
      "score": number,
      "explanation": "string",
      "matchedCriteria": ["string"],
      "tradeoffs": ["string"] // optional
    }
  ]
}

Focus on practical, honest recommendations. Don't oversell vehicles that don't match well.`;
}

/**
 * Parse Gemini API response into ranked vehicles
 */
function parseGeminiResponse(responseText: string): RankedVehicle[] {
  try {
    const parsed = JSON.parse(responseText) as { rankings: Array<{
      vehicleId: string;
      score: number;
      explanation: string;
      matchedCriteria: string[];
      tradeoffs?: string[];
    }> };

    return parsed.rankings.map((r) => ({
      vehicleId: r.vehicleId,
      score: r.score,
      tier: r.score >= 80 ? 'top-pick' : r.score >= 60 ? 'strong-contender' : 'explore-alternative',
      explanation: r.explanation,
      matchedCriteria: r.matchedCriteria,
      tradeoffs: r.tradeoffs,
    }));
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    throw new Error('Invalid response format from Gemini API');
  }
}
