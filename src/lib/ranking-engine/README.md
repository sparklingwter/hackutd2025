# Ranking Engine Library

## Overview

The Ranking Engine is an AI-powered vehicle recommendation system that matches vehicles to user preferences using Google Gemini API, OpenRouter fallback, and deterministic scoring. It provides transparent explanations, identifies tradeoffs, and ensures safety guardrails.

**Version:** 1.0.0  
**Location:** `src/lib/ranking-engine/`

## Features

- ✅ **AI-Powered Ranking** - Uses Google Gemini for natural language understanding
- ✅ **Automatic Fallback** - OpenRouter → Deterministic ranking if AI unavailable
- ✅ **Transparent Explanations** - Clear reasoning for each recommendation
- ✅ **Tradeoff Analysis** - Identifies compromises (e.g., "Slightly over budget")
- ✅ **Safety Filters** - Blocks inappropriate or unsafe recommendations
- ✅ **Tiered Results** - Top Picks (80+), Strong Contenders (60-79), Alternatives (<60)
- ✅ **Type-Safe** - Full TypeScript with Zod schema validation

## Architecture

```
┌────────────────────────────────┐
│   generateRecommendations()   │  ← Main Entry Point
└───────────┬────────────────────┘
            │
            ├─→ Gemini API (Primary)
            │   └─→ gemini.ts
            │
            ├─→ OpenRouter API (Fallback)
            │   └─→ openrouter.ts
            │
            └─→ Deterministic Ranking (Guaranteed)
                └─→ ranking.ts
```

## Installation

No installation required - this library is part of the monorepo:

```typescript
import { generateRecommendations } from '~/lib/ranking-engine';
```

## Quick Start

### Basic Recommendation

```typescript
import { generateRecommendations } from '~/lib/ranking-engine';

const vehicles = [
  {
    id: 'camry-2024',
    model: 'Camry',
    year: 2024,
    bodyStyle: 'sedan',
    fuelType: 'hybrid',
    seating: 5,
    mpgCombined: 52,
    range: null,
    cargoVolume: 15,
    towingCapacity: 0,
    awd: false,
    msrp: 29000,
    features: ['Toyota Safety Sense', 'Apple CarPlay', 'Lane Keeping Assist'],
    safetyRating: 5,
  },
  // ... more vehicles
];

const userNeeds = {
  budgetType: 'cash',
  budgetAmount: 35000,
  bodyStyle: 'sedan',
  fuelType: 'hybrid',
  seating: 5,
  priorityMpg: true,
  priorityRange: false,
  requireAwd: false,
  cargoNeeds: 'moderate',
  towingNeeds: 'none',
  safetyPriority: 'high',
};

const recommendations = await generateRecommendations(vehicles, userNeeds);

console.log('Top Picks:', recommendations.topPicks);
console.log('Strong Contenders:', recommendations.strongContenders);
console.log('Explore Alternatives:', recommendations.exploreAlternatives);
```

### Deterministic Ranking Only

```typescript
import { generateRecommendations } from '~/lib/ranking-engine';

// Force deterministic ranking (no AI)
const recommendations = await generateRecommendations(vehicles, userNeeds, {
  useAI: false,
});
```

### Specify AI Provider

```typescript
import { generateRecommendations } from '~/lib/ranking-engine';

// Use OpenRouter directly
const recommendations = await generateRecommendations(vehicles, userNeeds, {
  provider: 'openrouter',
});

// Use Gemini explicitly
const recommendations = await generateRecommendations(vehicles, userNeeds, {
  provider: 'gemini',
});
```

## API Reference

### Main Functions

#### `generateRecommendations(vehicles, userNeeds, options?)`

Main entry point that orchestrates AI and fallback ranking.

**Parameters:**

```typescript
interface RecommendationOptions {
  provider?: 'gemini' | 'openrouter' | 'deterministic';
  useAI?: boolean;  // Default: true
}

function generateRecommendations(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds,
  options?: RecommendationOptions
): Promise<TieredRecommendations>;
```

**Returns:**

```typescript
interface TieredRecommendations {
  topPicks: RankedVehicle[];         // Score >= 80
  strongContenders: RankedVehicle[]; // Score 60-79
  exploreAlternatives: RankedVehicle[]; // Score < 60
}

interface RankedVehicle extends VehicleForRanking {
  score: number;              // 0-100 match score
  tier: 'top-pick' | 'strong-contender' | 'explore-alternative';
  explanation: string;        // Why this vehicle was recommended
  matchedCriteria: string[];  // ["Within budget", "Hybrid powertrain", ...]
  tradeoffs?: string[];       // ["Slightly over budget", ...]
}
```

**Example:**

```typescript
const recommendations = await generateRecommendations(vehicles, userNeeds);

recommendations.topPicks.forEach(vehicle => {
  console.log(`${vehicle.model} - Score: ${vehicle.score}`);
  console.log(`  Explanation: ${vehicle.explanation}`);
  console.log(`  Matched: ${vehicle.matchedCriteria.join(', ')}`);
  if (vehicle.tradeoffs?.length) {
    console.log(`  Tradeoffs: ${vehicle.tradeoffs.join(', ')}`);
  }
});
```

### Deterministic Ranking

#### `rankVehicles(vehicles, userNeeds)`

Rules-based ranking without AI (guaranteed fallback).

**Parameters:**

```typescript
function rankVehicles(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds
): TieredRecommendations;
```

**Scoring Criteria:**

| Criterion | Max Points | Description |
|-----------|------------|-------------|
| Budget | 25 | Within budget = 25pts, 10% over = 20pts, 20% over = 15pts |
| Body Style | 15 | Exact match required |
| Fuel Type | 15 | Exact match (gas, hybrid, electric, plugin-hybrid) |
| Seating | 10 | Meets minimum requirement |
| Fuel Efficiency | 10 | If priority and MPG ≥ 30 |
| Electric Range | 10 | If priority and range ≥ 250 miles |
| AWD | 10 | If required and available |
| Cargo Space | 5 | If needed and cargo ≥ 20 cu ft |
| Towing Capacity | 5 | If needed and capacity > 3500 lbs |
| Safety Rating | 5 | If priority and rating ≥ 4 stars |

**Example:**

```typescript
import { rankVehicles } from '~/lib/ranking-engine';

// No API calls - instant results
const recommendations = rankVehicles(vehicles, userNeeds);
```

#### `calculateMatchScore(vehicle, userNeeds)`

Calculate a single vehicle's match score (0-100).

```typescript
function calculateMatchScore(
  vehicle: VehicleForRanking,
  userNeeds: UserNeeds
): number;
```

**Example:**

```typescript
import { calculateMatchScore } from '~/lib/ranking-engine';

const score = calculateMatchScore(vehicles[0], userNeeds);
console.log(`Match score: ${score}/100`);
```

### AI Integration

#### `generateGeminiRecommendations(vehicles, userNeeds)`

Use Google Gemini API for AI-powered ranking.

**Environment Variable:**

```bash
GEMINI_API_KEY=your_api_key_here
```

**Parameters:**

```typescript
async function generateGeminiRecommendations(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds
): Promise<RankedVehicle[]>;
```

**Throws:**
- `Error` if `GEMINI_API_KEY` not set
- `Error` if API call fails
- `Error` if response parsing fails

**Prompt Engineering:**

The library uses a carefully crafted prompt that:
1. Presents user needs in JSON format
2. Lists all available vehicles with specs
3. Requests structured JSON output with scores and explanations
4. Emphasizes honest, practical recommendations

**Example Prompt Structure:**

```text
You are an automotive expert helping a customer find the perfect Toyota vehicle.

User Needs:
{
  "budgetType": "cash",
  "budgetAmount": 35000,
  "bodyStyle": "sedan",
  ...
}

Available Vehicles:
[...]

Task: Rank these vehicles from best to worst match...
```

#### `generateOpenRouterRecommendations(vehicles, userNeeds)`

Fallback to OpenRouter API if Gemini unavailable.

**Environment Variable:**

```bash
OPENROUTER_API_KEY=your_api_key_here
```

**Parameters:**

```typescript
async function generateOpenRouterRecommendations(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds
): Promise<RankedVehicle[]>;
```

**Supported Models:**
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4-turbo`
- `meta-llama/llama-3.1-70b-instruct`

### Safety Filters

#### `applySafetyFilters(vehicles, userNeeds)`

Remove vehicles that don't meet minimum safety requirements.

```typescript
function applySafetyFilters(
  vehicles: VehicleForRanking[],
  userNeeds: UserNeeds
): VehicleForRanking[];
```

**Filters Applied:**

1. **Minimum Safety Rating** - If `safetyPriority: 'high'`, require ≥4 stars
2. **Seating Capacity** - Must meet minimum seating requirement
3. **Budget Constraints** - Exclude vehicles >50% over budget
4. **AWD Requirement** - If required, exclude FWD vehicles

**Example:**

```typescript
import { applySafetyFilters } from '~/lib/ranking-engine';

const safeVehicles = applySafetyFilters(vehicles, userNeeds);
```

#### `meetsMinimumSafety(vehicle, userNeeds)`

Check if a single vehicle meets safety criteria.

```typescript
function meetsMinimumSafety(
  vehicle: VehicleForRanking,
  userNeeds: UserNeeds
): boolean;
```

#### `calculateSafetyScore(vehicle)`

Calculate a safety score based on features and rating.

```typescript
function calculateSafetyScore(
  vehicle: VehicleForRanking
): number; // 0-100
```

## Data Schemas

### UserNeeds

```typescript
interface UserNeeds {
  budgetType: 'cash' | 'monthly';
  budgetAmount: number;
  bodyStyle: 'sedan' | 'suv' | 'truck' | 'van' | 'coupe' | 'hatchback';
  fuelType: 'gas' | 'hybrid' | 'electric' | 'plugin-hybrid';
  seating: number;             // Minimum required (2-8)
  priorityMpg: boolean;        // Prioritize fuel efficiency
  priorityRange: boolean;      // Prioritize electric range
  requireAwd: boolean;         // Require all-wheel drive
  cargoNeeds: 'none' | 'minimal' | 'moderate' | 'significant';
  towingNeeds: 'none' | 'light' | 'moderate' | 'heavy';
  safetyPriority: 'low' | 'medium' | 'high';
}
```

### VehicleForRanking

```typescript
interface VehicleForRanking {
  id: string;
  model: string;
  year: number;
  bodyStyle: 'sedan' | 'suv' | 'truck' | 'van' | 'coupe' | 'hatchback';
  fuelType: 'gas' | 'hybrid' | 'electric' | 'plugin-hybrid';
  seating: number;
  mpgCombined: number | null;  // null for electric
  range: number | null;        // miles (electric/PHEV only)
  cargoVolume: number;         // cubic feet
  towingCapacity: number;      // pounds
  awd: boolean;
  msrp: number;
  features: string[];
  safetyRating: number | null; // 1-5 stars (NHTSA)
}
```

## Fallback Strategy

The ranking engine implements a three-tier fallback strategy:

```typescript
// 1. Try Gemini API (fastest, most accurate)
try {
  return await generateGeminiRecommendations(vehicles, userNeeds);
} catch (geminiError) {
  console.warn('Gemini failed, trying OpenRouter');
  
  // 2. Try OpenRouter (slightly slower)
  try {
    return await generateOpenRouterRecommendations(vehicles, userNeeds);
  } catch (openRouterError) {
    console.warn('OpenRouter failed, using deterministic');
  }
}

// 3. Use deterministic ranking (instant, guaranteed)
return rankVehicles(vehicles, userNeeds);
```

**Why This Approach?**

- **Reliability:** Always returns results even if all APIs fail
- **Performance:** Fast deterministic fallback (no network latency)
- **Cost:** Only uses paid APIs when available
- **User Experience:** Seamless degradation with no visible errors

## Integration with tRPC

The ranking engine is consumed by the search router:

```typescript
// src/server/api/routers/search.ts
import { generateRecommendations } from '~/lib/ranking-engine';

export const searchRouter = createTRPCRouter({
  recommend: publicProcedure
    .input(UserNeedsProfileSchema)
    .query(async ({ input, ctx }) => {
      // Fetch vehicles from Firestore
      const vehicles = await fetchVehicles();
      
      // Generate recommendations
      const recommendations = await generateRecommendations(
        vehicles,
        input.needs
      );
      
      return recommendations;
    }),
});
```

## Rate Limiting

The search router implements rate limiting for AI endpoints:

```typescript
// 10 requests per minute per IP
const allowed = checkRateLimit(ip, 10, 60000);

if (!allowed) {
  throw new Error('TOO_MANY_REQUESTS');
}
```

**Why Rate Limiting?**

- Prevent API abuse and quota exhaustion
- Control AI service costs (Gemini/OpenRouter are usage-based)
- Ensure fair access for all users

## Cost Management

### Gemini API Costs

- **Free Tier:** 15 requests/minute, 1500/day
- **Paid Tier:** $0.125 per 1M input tokens, $0.375 per 1M output tokens
- **Average Request:** ~500 input tokens, ~200 output tokens = $0.00012/request

### OpenRouter Costs

- **Claude 3.5 Sonnet:** $3.00/$15.00 per 1M tokens
- **GPT-4 Turbo:** $10.00/$30.00 per 1M tokens
- **Llama 3.1 70B:** $0.60/$0.80 per 1M tokens

**Cost Optimization Tips:**

1. Use deterministic ranking for guest users
2. Cache recommendations for 5 minutes
3. Batch requests when possible
4. Monitor daily API usage
5. Set budget alerts in API dashboards

## Testing

### Unit Tests

```bash
# Run ranking engine tests
npm test -- ranking-engine
```

### Manual Testing

```typescript
// Test all three ranking methods
import { generateRecommendations, rankVehicles } from '~/lib/ranking-engine';

// Test Gemini
const geminiResults = await generateRecommendations(vehicles, needs, {
  provider: 'gemini',
});

// Test OpenRouter
const openRouterResults = await generateRecommendations(vehicles, needs, {
  provider: 'openrouter',
});

// Test deterministic
const deterministicResults = rankVehicles(vehicles, needs);

// Compare results
console.log('Gemini top pick:', geminiResults.topPicks[0]);
console.log('OpenRouter top pick:', openRouterResults.topPicks[0]);
console.log('Deterministic top pick:', deterministicResults.topPicks[0]);
```

## Troubleshooting

### "Gemini API key not configured"

**Solution:** Add `GEMINI_API_KEY` to `.env`:

```bash
GEMINI_API_KEY=AIzaSy...
```

### "Invalid response format from Gemini API"

**Cause:** Gemini returned non-JSON or malformed JSON.

**Solution:** Check prompt formatting and retry. System will automatically fall back to OpenRouter or deterministic.

### "All AI providers failed"

**Cause:** Both Gemini and OpenRouter APIs unavailable or misconfigured.

**Solution:** System automatically falls back to deterministic ranking. No action needed.

### Recommendations seem inaccurate

**Diagnosis:**

1. Check if AI is being used: Look for "Using deterministic ranking" in logs
2. Verify user needs are complete (all fields populated)
3. Test with simplified needs to isolate issue
4. Compare AI vs deterministic results

**Solution:**

- Improve prompt engineering in `gemini.ts`
- Adjust scoring weights in `ranking.ts`
- Add more vehicle features to dataset

## Future Enhancements

- [ ] Multi-brand support (Honda, Ford, etc.)
- [ ] Collaborative filtering (learn from other users)
- [ ] Personalization over time (user history)
- [ ] A/B test different prompts
- [ ] Explanation scoring (rate explanation quality)
- [ ] Image-based recommendations (upload photo)
- [ ] Voice input for needs ("I need a family SUV under $40k")

## Contributing

When modifying the ranking engine:

1. **Update schemas** - Keep TypeScript types in sync with Zod schemas
2. **Test fallback** - Ensure deterministic ranking always works
3. **Document prompts** - Add comments explaining prompt engineering decisions
4. **Validate outputs** - AI responses must match `RankedVehicle` schema
5. **Update README** - Add examples for new features

## References

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [NHTSA Safety Ratings](https://www.nhtsa.gov/ratings)

## License

MIT - Part of hackutd2025 monorepo

## Support

For questions or issues, contact the development team or file an issue in the GitHub repository.
