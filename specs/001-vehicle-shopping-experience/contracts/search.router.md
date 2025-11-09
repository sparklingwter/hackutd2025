# Search Router

**Domain**: AI-powered vehicle search and recommendations  
**Authentication**: Public (no auth required)  
**Rate Limits**: 10 requests/minute/IP for recommendations

## Procedures

### `search.recommend`

Generate AI-powered vehicle recommendations based on user needs.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  needs: UserNeedsProfileSchema; // User preferences from discovery journey
  voiceEnabled?: boolean;         // Whether to generate audio summary
}
```

**Output**:

```typescript
{
  topPicks: Recommendation[];          // Up to 3 top recommendations
  strongContenders: Recommendation[];  // 3-5 additional matches
  exploreAlternatives: Recommendation[]; // 2-3 broader options
  audioSummaryUrl?: string;            // Optional audio summary (if voiceEnabled)
  generatedAt: Date;                   // Timestamp for cache busting
}
```

**Behavior**:

- Calls `ranking-engine` library with user needs
- Returns tiered recommendations (top picks, contenders, alternatives)
- Optionally generates audio summary via ElevenLabs (cached in Firebase Storage)
- Rate limited to 10 requests/minute/IP to prevent Gemini API abuse

**Errors**:

- `BAD_REQUEST`: Invalid user needs profile
- `TOO_MANY_REQUESTS`: Rate limit exceeded
- `INTERNAL_SERVER_ERROR`: AI provider failure (Gemini + OpenRouter both failed)

**Example**:

```typescript
const { data } = trpc.search.recommend.useQuery({
  needs: {
    budgetType: 'monthly',
    budgetAmount: 500,
    bodyStyle: 'suv',
    seating: 7,
    fuelType: 'hybrid',
    priorityMpg: true,
    priorityRange: false,
    cargoNeeds: 'moderate',
    towingNeeds: 'light',
    requireAwd: true,
    safetyPriority: 'high',
    driverAssistNeeds: ['adaptive-cruise', 'blind-spot'],
    mustHaveFeatures: [],
    drivingPattern: 'mixed',
    commuteLength: 'medium',
  },
  voiceEnabled: true,
});

// Response:
// {
//   topPicks: [
//     { vehicleId: 'highlander-hybrid-2024', tier: 'top-pick', score: 95,
//       explanation: 'Highlander Hybrid matches your hybrid SUV needs with 7-seat capacity...',
//       matchedCriteria: ['hybrid', 'suv', '7-seat', 'awd', 'adaptive-cruise'] },
//   ],
//   strongContenders: [...],
//   exploreAlternatives: [...],
//   audioSummaryUrl: 'https://storage.googleapis.com/bucket/audio/summary-abc123.mp3',
//   generatedAt: '2025-11-08T10:30:00Z'
// }
```

---

### `search.filter`

Filter vehicles by criteria without AI recommendations (fast, deterministic).

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  filters: VehicleFiltersSchema; // See schemas.md
  sort?: 'price-asc' | 'price-desc' | 'mpg-desc' | 'name-asc';
  pagination: PaginationInputSchema;
}
```

**Output**:

```typescript
PaginatedResponseSchema(VehicleSchema)
```

**Behavior**:

- Queries Firestore with filters (uses composite indexes)
- Returns paginated vehicle list without AI explanations
- Fast (<200ms p95) for immediate UI updates when user adjusts filter chips

**Errors**:

- `BAD_REQUEST`: Invalid filter combination (e.g., conflicting price ranges)

**Example**:

```typescript
const { data } = trpc.search.filter.useQuery({
  filters: {
    bodyStyle: 'suv',
    fuelType: 'hybrid',
    minSeating: 7,
    maxPrice: 50000,
  },
  sort: 'price-asc',
  pagination: { limit: 20 },
});

// Response:
// {
//   items: [
//     { id: 'highlander-hybrid-2024', model: 'Highlander Hybrid', msrp: 42500, ... },
//     { id: 'sienna-2024', model: 'Sienna', msrp: 38500, ... },
//   ],
//   nextCursor: 'abc123',
//   total: 5
// }
```

---

### `search.semanticSearch`

Semantic search using natural language query (e.g., "family SUV with good gas mileage").

**Type**: `query`  
**Authentication**: Public  
**Rate Limits**: 10 requests/minute/IP

**Input**:

```typescript
{
  query: string; // Natural language query (max 200 chars)
  limit?: number; // Max results (default 10, max 20)
}
```

**Output**:

```typescript
{
  results: {
    vehicleId: string;
    relevanceScore: number; // 0-1
    snippet: string;        // Why this matched
  }[];
  queryIntent?: string;      // Parsed intent (e.g., "family vehicle, fuel-efficient")
}
```

**Behavior**:

- Calls Gemini API to parse query intent and extract facets
- Matches intent to vehicles using vector similarity (if available) or keyword matching
- Returns ranked results with relevance scores
- Fallback: If AI fails, performs keyword search on vehicle descriptions

**Errors**:

- `BAD_REQUEST`: Empty query or invalid characters
- `TOO_MANY_REQUESTS`: Rate limit exceeded

**Example**:

```typescript
const { data } = trpc.search.semanticSearch.useQuery({
  query: 'reliable family SUV with good gas mileage',
  limit: 10,
});

// Response:
// {
//   results: [
//     { vehicleId: 'highlander-hybrid-2024', relevanceScore: 0.92,
//       snippet: 'Highlander Hybrid offers excellent fuel economy (36 MPG combined)...' },
//     { vehicleId: 'rav4-hybrid-2024', relevanceScore: 0.85,
//       snippet: 'RAV4 Hybrid combines reliability with 40 MPG combined...' },
//   ],
//   queryIntent: 'family vehicle, fuel-efficient, reliable'
// }
```

---

## Implementation Notes

- **Caching**: Cache AI recommendations for identical user needs profiles (24-hour TTL)
- **Audio Generation**: Pre-generate common discovery journey prompts at build time, cache in Firebase Storage
- **Rate Limiting**: Use Redis (Firebase Extensions) or in-memory map for rate limit tracking
- **Fallback**: If Gemini API fails, fall back to OpenRouter; if both fail, return error with "Try again later" message

## Related Files

- [Data Model: Recommendation](../data-model.md#4-recommendation)
- [Data Model: UserNeedsProfile](../data-model.md#3-userneedsprofile)
- [Shared Schemas](./schemas.md)
