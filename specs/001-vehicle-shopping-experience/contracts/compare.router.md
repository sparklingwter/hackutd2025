# Compare Router

**Domain**: Vehicle comparison functionality  
**Authentication**: Public (anonymous) + Protected (saved compare sets)  
**Rate Limits**: None

## Procedures

### `compare.getComparison`

Get side-by-side comparison data for up to 4 vehicles.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleIds: string[]; // 1-4 vehicle IDs
  trimIds?: string[];   // Optional specific trims (parallel to vehicleIds)
}
```

**Output**:

```typescript
{
  vehicles: VehicleSchema[];
  categoryWinners: {
    lowestPrice: string;        // Vehicle ID
    highestMpg: string;
    mostCargo: string;
    highestTowing: string;
    highestSafetyRating: string;
    mostHorsepower: string;
  };
  comparisonMatrix: {
    [vehicleId: string]: {
      [category: string]: any; // Dynamic comparison data
    };
  };
}
```

**Behavior**:

- Fetches all vehicles by ID (parallel queries)
- If `trimIds` provided, fetches specific trim specs and merges with vehicle data
- Calculates category winners (best value in each category)
- Returns structured comparison matrix for easy table rendering

**Errors**:

- `BAD_REQUEST`: Invalid vehicle IDs, wrong array length (1-4 required), or mismatched trimIds length
- `NOT_FOUND`: One or more vehicle IDs do not exist

**Example**:

```typescript
const { data } = trpc.compare.getComparison.useQuery({
  vehicleIds: ['camry-2024', 'accord-2024', 'altima-2024'],
});

// Response:
// {
//   vehicles: [
//     { id: 'camry-2024', model: 'Camry', msrp: 28855, mpgCombined: 52, ... },
//     { id: 'accord-2024', model: 'Accord', msrp: 27895, mpgCombined: 48, ... },
//     { id: 'altima-2024', model: 'Altima', msrp: 26300, mpgCombined: 39, ... },
//   ],
//   categoryWinners: {
//     lowestPrice: 'altima-2024',
//     highestMpg: 'camry-2024',
//     mostCargo: 'accord-2024',
//     ...
//   },
//   comparisonMatrix: {
//     'camry-2024': { price: 28855, mpg: 52, cargo: 15.1, ... },
//     'accord-2024': { price: 27895, mpg: 48, cargo: 16.7, ... },
//     'altima-2024': { price: 26300, mpg: 39, cargo: 15.4, ... },
//   }
// }
```

---

### `compare.saveCompareSet`

Save a compare set to user profile (authenticated users only).

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  name?: string;        // Optional user-defined name
  vehicleIds: string[]; // 1-4 vehicle IDs
}
```

**Output**:

```typescript
{
  compareSetId: string; // UUID of saved compare set
  createdAt: Date;
}
```

**Behavior**:

- Creates a new compare set in `userProfiles/{userId}.compareSets[]`
- If name not provided, auto-generates (e.g., "Comparison 1", "Comparison 2")
- Returns compare set ID for future reference

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Invalid vehicle IDs or array length

**Example**:

```typescript
const { mutate } = trpc.compare.saveCompareSet.useMutation();

mutate({
  name: 'My Top 3 Sedans',
  vehicleIds: ['camry-2024', 'accord-2024', 'altima-2024'],
});

// Response:
// {
//   compareSetId: '550e8400-e29b-41d4-a716-446655440000',
//   createdAt: '2025-11-08T10:30:00Z'
// }
```

---

### `compare.getCompareSets`

Get all saved compare sets for authenticated user.

**Type**: `query`  
**Authentication**: Protected

**Input**: None

**Output**:

```typescript
{
  compareSets: {
    id: string;
    name?: string;
    vehicleIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }[];
}
```

**Behavior**:

- Fetches `userProfiles/{userId}.compareSets[]`
- Returns all saved compare sets sorted by `updatedAt` descending

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { data } = trpc.compare.getCompareSets.useQuery();

// Response:
// {
//   compareSets: [
//     {
//       id: '550e8400-...',
//       name: 'My Top 3 Sedans',
//       vehicleIds: ['camry-2024', 'accord-2024', 'altima-2024'],
//       createdAt: '2025-11-08T10:30:00Z',
//       updatedAt: '2025-11-08T10:30:00Z'
//     },
//     {
//       id: '660f9511-...',
//       name: 'SUV Options',
//       vehicleIds: ['rav4-2024', 'cr-v-2024'],
//       createdAt: '2025-11-07T14:20:00Z',
//       updatedAt: '2025-11-07T14:20:00Z'
//     }
//   ]
// }
```

---

### `compare.deleteCompareSet`

Delete a saved compare set.

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  compareSetId: string; // UUID of compare set to delete
}
```

**Output**:

```typescript
{
  success: boolean;
}
```

**Behavior**:

- Removes compare set from `userProfiles/{userId}.compareSets[]`
- Returns success status

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `NOT_FOUND`: Compare set ID does not exist in user's profile

**Example**:

```typescript
const { mutate } = trpc.compare.deleteCompareSet.useMutation();

mutate({ compareSetId: '550e8400-e29b-41d4-a716-446655440000' });

// Response:
// { success: true }
```

---

### `compare.getSharedCompareSet`

Get a compare set by shareable link (read-only, no auth required).

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  shareToken: string; // Encrypted token containing vehicleIds
}
```

**Output**:

```typescript
{
  vehicleIds: string[];
  vehicles: VehicleSchema[];
  categoryWinners: { ... };
  comparisonMatrix: { ... };
}
```

**Behavior**:

- Decrypts share token to extract vehicle IDs
- Fetches comparison data (same as `getComparison`)
- Returns read-only comparison (user cannot modify or save)

**Errors**:

- `BAD_REQUEST`: Invalid or expired share token
- `NOT_FOUND`: Vehicle IDs in token do not exist

**Example**:

```typescript
const { data } = trpc.compare.getSharedCompareSet.useQuery({
  shareToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
});

// Response:
// {
//   vehicleIds: ['camry-2024', 'accord-2024'],
//   vehicles: [...],
//   categoryWinners: { ... },
//   comparisonMatrix: { ... }
// }
```

---

### `compare.generateShareLink`

Generate a shareable link for a compare set.

**Type**: `mutation`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleIds: string[]; // 1-4 vehicle IDs
}
```

**Output**:

```typescript
{
  shareToken: string;    // Encrypted token
  shareUrl: string;      // Full URL for sharing
  expiresAt: Date;       // Token expiration (30 days)
}
```

**Behavior**:

- Encrypts vehicle IDs into a JWT-like share token
- Returns shareable URL (e.g., `https://yourdomain.com/compare/shared?token=...`)
- Token expires after 30 days

**Errors**:

- `BAD_REQUEST`: Invalid vehicle IDs or array length

**Example**:

```typescript
const { mutate } = trpc.compare.generateShareLink.useMutation();

mutate({ vehicleIds: ['camry-2024', 'accord-2024'] });

// Response:
// {
//   shareToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//   shareUrl: 'https://yourdomain.com/compare/shared?token=eyJhbGci...',
//   expiresAt: '2025-12-08T10:30:00Z'
// }
```

---

## Implementation Notes

- **Category Winners**: Calculated dynamically on server (not stored)
- **Share Tokens**: Use JWT with 30-day expiration, signed with secret key
- **Compare Matrix**: Structured for easy table rendering (rows = categories, columns = vehicles)
- **Anonymous Users**: Can use `getComparison` and `generateShareLink` without auth; saved compare sets require auth

## Related Files

- [Data Model: CompareSet](../data-model.md#5-compareset)
- [Shared Schemas](./schemas.md)
