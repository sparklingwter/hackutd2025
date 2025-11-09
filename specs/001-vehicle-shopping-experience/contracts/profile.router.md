# Profile Router

**Domain**: User profile management, favorites, and saved items  
**Authentication**: Protected (all procedures require authentication)  
**Rate Limits**: None

## Procedures

### `profile.get`

Get authenticated user's profile.

**Type**: `query`  
**Authentication**: Protected

**Input**: None

**Output**:

```typescript
{
  userId: string;
  email: string;
  displayName?: string;
  preferences?: UserNeedsProfileSchema;
  favorites: string[];        // Vehicle IDs
  savedSearches: UserNeedsProfileSchema[];
  compareSets: CompareSetSchema[];
  estimates: EstimateSchema[];
  voiceEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Behavior**:

- Fetches `userProfiles/{userId}` document from Firestore
- If profile doesn't exist (first login), creates new profile with defaults
- Returns full user profile with all saved items

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { data } = trpc.profile.get.useQuery();

// Response:
// {
//   userId: 'auth0|123',
//   email: 'user@example.com',
//   displayName: 'John Doe',
//   preferences: { budgetType: 'monthly', budgetAmount: 500, ... },
//   favorites: ['camry-2024', 'rav4-2024'],
//   savedSearches: [{ budgetType: 'cash', budgetAmount: 30000, ... }],
//   compareSets: [{ id: '550e8400-...', vehicleIds: [...], ... }],
//   estimates: [{ id: '880h1733-...', type: 'finance', ... }],
//   voiceEnabled: true,
//   createdAt: '2025-11-01T08:00:00Z',
//   updatedAt: '2025-11-08T10:30:00Z'
// }
```

---

### `profile.update`

Update user profile fields.

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  displayName?: string;
  preferences?: UserNeedsProfileSchema;
  voiceEnabled?: boolean;
}
```

**Output**:

```typescript
{
  success: boolean;
  updatedAt: Date;
}
```

**Behavior**:

- Updates specified fields in `userProfiles/{userId}`
- Only updates fields provided (partial update)
- Sets `updatedAt` timestamp

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Invalid field values

**Example**:

```typescript
const { mutate } = trpc.profile.update.useMutation();

mutate({
  displayName: 'Jane Doe',
  voiceEnabled: false,
});

// Response:
// {
//   success: true,
//   updatedAt: '2025-11-08T10:35:00Z'
// }
```

---

### `profile.addFavorite`

Add a vehicle to favorites.

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  vehicleId: string;
}
```

**Output**:

```typescript
{
  success: boolean;
  favorites: string[]; // Updated favorites list
}
```

**Behavior**:

- Adds vehicle ID to `userProfiles/{userId}.favorites[]` array (Firestore `arrayUnion`)
- If already favorited, no-op (idempotent)
- Returns updated favorites list

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `NOT_FOUND`: Vehicle ID does not exist

**Example**:

```typescript
const { mutate } = trpc.profile.addFavorite.useMutation();

mutate({ vehicleId: 'camry-2024' });

// Response:
// {
//   success: true,
//   favorites: ['camry-2024', 'rav4-2024']
// }
```

---

### `profile.removeFavorite`

Remove a vehicle from favorites.

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  vehicleId: string;
}
```

**Output**:

```typescript
{
  success: boolean;
  favorites: string[];
}
```

**Behavior**:

- Removes vehicle ID from `userProfiles/{userId}.favorites[]` (Firestore `arrayRemove`)
- If not favorited, no-op (idempotent)
- Returns updated favorites list

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { mutate } = trpc.profile.removeFavorite.useMutation();

mutate({ vehicleId: 'camry-2024' });

// Response:
// {
//   success: true,
//   favorites: ['rav4-2024']
// }
```

---

### `profile.getFavorites`

Get full details of favorited vehicles.

**Type**: `query`  
**Authentication**: Protected

**Input**: None

**Output**:

```typescript
{
  favorites: VehicleSchema[];
}
```

**Behavior**:

- Fetches `userProfiles/{userId}.favorites[]` (vehicle IDs)
- Queries Firestore for full vehicle details (parallel batch)
- Returns array of vehicle objects

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { data } = trpc.profile.getFavorites.useQuery();

// Response:
// {
//   favorites: [
//     { id: 'camry-2024', model: 'Camry', msrp: 28855, ... },
//     { id: 'rav4-2024', model: 'RAV4', msrp: 29500, ... }
//   ]
// }
```

---

### `profile.saveSearch`

Save a discovery journey search (user needs profile).

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  search: UserNeedsProfileSchema;
}
```

**Output**:

```typescript
{
  success: boolean;
  searchId: string;
}
```

**Behavior**:

- Adds search to `userProfiles/{userId}.savedSearches[]` array
- Generates unique ID for search
- Returns search ID for future reference

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Invalid search data

**Example**:

```typescript
const { mutate } = trpc.profile.saveSearch.useMutation();

mutate({
  search: {
    budgetType: 'monthly',
    budgetAmount: 500,
    bodyStyle: 'suv',
    seating: 7,
    fuelType: 'hybrid',
    // ... all required fields
  },
});

// Response:
// {
//   success: true,
//   searchId: 'aa0j3955-...'
// }
```

---

### `profile.getSavedSearches`

Get all saved discovery journey searches.

**Type**: `query`  
**Authentication**: Protected

**Input**: None

**Output**:

```typescript
{
  searches: {
    id: string;
    needs: UserNeedsProfileSchema;
    createdAt: Date;
  }[];
}
```

**Behavior**:

- Fetches `userProfiles/{userId}.savedSearches[]`
- Returns all saved searches sorted by `createdAt` descending

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { data } = trpc.profile.getSavedSearches.useQuery();

// Response:
// {
//   searches: [
//     {
//       id: 'aa0j3955-...',
//       needs: { budgetType: 'monthly', budgetAmount: 500, ... },
//       createdAt: '2025-11-08T10:30:00Z'
//     },
//     {
//       id: 'bb1k4066-...',
//       needs: { budgetType: 'cash', budgetAmount: 35000, ... },
//       createdAt: '2025-11-07T14:20:00Z'
//     }
//   ]
// }
```

---

### `profile.deleteSearch`

Delete a saved search.

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  searchId: string;
}
```

**Output**:

```typescript
{
  success: boolean;
}
```

**Behavior**:

- Removes search from `userProfiles/{userId}.savedSearches[]`
- Returns success status

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `NOT_FOUND`: Search ID does not exist

**Example**:

```typescript
const { mutate } = trpc.profile.deleteSearch.useMutation();

mutate({ searchId: 'aa0j3955-...' });

// Response:
// { success: true }
```

---

### `profile.setPreferences`

Set current user preferences (from discovery journey).

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  preferences: UserNeedsProfileSchema;
}
```

**Output**:

```typescript
{
  success: boolean;
}
```

**Behavior**:

- Updates `userProfiles/{userId}.preferences` field
- Overwrites previous preferences (not merge)
- Used to persist last discovery journey inputs

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Invalid preferences data

**Example**:

```typescript
const { mutate } = trpc.profile.setPreferences.useMutation();

mutate({
  preferences: {
    budgetType: 'monthly',
    budgetAmount: 600,
    bodyStyle: 'truck',
    seating: 5,
    fuelType: 'gas',
    // ... all required fields
  },
});

// Response:
// { success: true }
```

---

## Implementation Notes

- **Profile Creation**: Automatically create profile on first login (via Auth0 Action or on first API call)
- **Favorites**: Limited to 50 vehicles per user (enforced in mutation)
- **Saved Searches**: Limited to 20 per user (oldest deleted if exceeded)
- **Compare Sets/Estimates**: Managed via separate routers (`compare`, `estimate`)
- **Voice Preference**: Persisted in profile, used to default voice UI on/off

## Related Files

- [Data Model: UserProfile](../data-model.md#7-userprofile)
- [Shared Schemas](./schemas.md)
