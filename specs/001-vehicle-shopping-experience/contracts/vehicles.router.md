# Vehicles Router

**Domain**: Vehicle catalog, details, and trim information  
**Authentication**: Public (read-only)  
**Rate Limits**: None (cached responses)

## Procedures

### `vehicles.list`

List vehicles with optional filters and pagination.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  filters?: VehicleFiltersSchema; // See schemas.md
  sort?: 'price-asc' | 'price-desc' | 'mpg-desc' | 'name-asc' | 'year-desc';
  pagination: PaginationInputSchema;
}
```

**Output**:

```typescript
PaginatedResponseSchema(VehicleSchema)
```

**Behavior**:

- Queries Firestore `vehicles` collection with filters
- Returns paginated results (default 20, max 50 per page)
- Cached at CDN level (1-hour TTL) for common filter combinations
- Uses Firestore composite indexes for multi-field filtering

**Errors**:

- `BAD_REQUEST`: Invalid filter values

**Example**:

```typescript
const { data } = trpc.vehicles.list.useQuery({
  filters: { bodyStyle: 'suv', maxPrice: 50000 },
  sort: 'price-asc',
  pagination: { limit: 20 },
});
```

---

### `vehicles.getById`

Get detailed information for a specific vehicle.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
}
```

**Output**:

```typescript
VehicleSchema
```

**Behavior**:

- Fetches single vehicle document from Firestore
- Returns full vehicle details (base specs, features, images)
- Cached at CDN level (1-hour TTL)

**Errors**:

- `NOT_FOUND`: Vehicle ID does not exist

**Example**:

```typescript
const { data } = trpc.vehicles.getById.useQuery({ vehicleId: 'camry-2024' });

// Response:
// {
//   id: 'camry-2024',
//   make: 'Toyota',
//   model: 'Camry',
//   year: 2024,
//   bodyStyle: 'sedan',
//   fuelType: 'hybrid',
//   msrp: 28855,
//   ...
// }
```

---

### `vehicles.getTrims`

Get all available trims for a vehicle.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
}
```

**Output**:

```typescript
{
  trims: TrimSchema[];
}
```

**Behavior**:

- Fetches subcollection `vehicles/{vehicleId}/trims`
- Returns all trims sorted by MSRP ascending
- Cached at CDN level (1-hour TTL)

**Errors**:

- `NOT_FOUND`: Vehicle ID does not exist

**Example**:

```typescript
const { data } = trpc.vehicles.getTrims.useQuery({ vehicleId: 'camry-2024' });

// Response:
// {
//   trims: [
//     { id: 'le', name: 'LE', msrp: 28855, engine: '2.5L I4 Hybrid', ... },
//     { id: 'se', name: 'SE', msrp: 30855, engine: '2.5L I4 Hybrid', ... },
//     { id: 'xse', name: 'XSE', msrp: 32855, engine: '2.5L I4 Hybrid', ... },
//   ]
// }
```

---

### `vehicles.getTrimById`

Get detailed information for a specific trim.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
  trimId: string;
}
```

**Output**:

```typescript
TrimSchema
```

**Behavior**:

- Fetches single trim document from `vehicles/{vehicleId}/trims/{trimId}`
- Returns full trim details (specs, features, pricing)
- Cached at CDN level (1-hour TTL)

**Errors**:

- `NOT_FOUND`: Vehicle or trim ID does not exist

**Example**:

```typescript
const { data } = trpc.vehicles.getTrimById.useQuery({
  vehicleId: 'camry-2024',
  trimId: 'xle',
});

// Response:
// {
//   id: 'xle',
//   name: 'XLE',
//   msrp: 32950,
//   features: ['leather', 'sunroof', 'premium-audio'],
//   engine: '2.5L I4 Hybrid',
//   horsepower: 208,
//   torque: 163,
//   zeroToSixty: 7.1,
//   transmission: '8-Speed Automatic',
//   driveType: 'fwd',
// }
```

---

### `vehicles.search`

Simple text search across vehicle model names and descriptions.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  query: string; // Search term (min 2 chars)
  limit?: number; // Max results (default 10, max 20)
}
```

**Output**:

```typescript
{
  results: VehicleSchema[];
}
```

**Behavior**:

- Performs case-insensitive substring match on `model` and `description` fields
- Returns matching vehicles sorted by relevance (exact match > prefix match > contains)
- Fallback: If no matches, returns empty array (not error)

**Errors**:

- `BAD_REQUEST`: Query too short (<2 chars) or invalid characters

**Example**:

```typescript
const { data } = trpc.vehicles.search.useQuery({ query: 'corolla', limit: 10 });

// Response:
// {
//   results: [
//     { id: 'corolla-2024', model: 'Corolla', ... },
//     { id: 'corolla-hybrid-2024', model: 'Corolla Hybrid', ... },
//     { id: 'corolla-cross-2024', model: 'Corolla Cross', ... },
//   ]
// }
```

---

### `vehicles.getFeaturedVehicles`

Get curated list of featured vehicles (e.g., homepage showcase).

**Type**: `query`  
**Authentication**: Public

**Input**: None

**Output**:

```typescript
{
  featured: VehicleSchema[];
}
```

**Behavior**:

- Returns manually curated list of 6-8 vehicles for homepage
- Stored in Firestore as a separate collection (`featuredVehicles`) or hardcoded list
- Cached at CDN level (24-hour TTL)

**Example**:

```typescript
const { data } = trpc.vehicles.getFeaturedVehicles.useQuery();

// Response:
// {
//   featured: [
//     { id: 'camry-2024', model: 'Camry', ... },
//     { id: 'rav4-2024', model: 'RAV4', ... },
//     { id: 'tacoma-2024', model: 'Tacoma', ... },
//   ]
// }
```

---

## Implementation Notes

- **Caching**: All procedures cached at CDN level (Firebase AppHosting) for 1 hour
- **Indexes**: Firestore composite indexes required for multi-field filtering
- **Images**: Vehicle and trim images stored in Firebase Storage, URLs returned as `gs://` paths (converted to CDN URLs in client)
- **Search**: Use Firestore `>=` and `<` queries for prefix matching (not full-text search)

## Related Files

- [Data Model: Vehicle](../data-model.md#1-vehicle)
- [Data Model: Trim](../data-model.md#2-trim)
- [Shared Schemas](./schemas.md)
