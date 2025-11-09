# Firestore Schema & Seeding Summary

## Overview

The seeding scripts (`scripts/seed-firestore.js` and `scripts/seed-firestore.ps1`) transform EPA vehicle data into a comprehensive Firestore schema that supports:

- **Display/UI**: Vehicle cards, lists, and detail pages (matching `src/lib/cars.ts` structure)
- **Finance Engine**: Cash, finance, and lease calculations (pricing, performance data)
- **Ranking Engine**: AI-powered recommendations (tags, features, specs)
- **Search & Filtering**: Faceted search with composite indexes
- **User Features**: Favorites, comparisons, dealer leads

## Schema Mapping

### Source Data → Firestore Document

```
EPA Vehicle Data (JSON)
    ↓
Transformation Functions (seed-firestore.js)
    ↓
Firestore Document (matching application schema)
    ↓
Application Components (React/Next.js)
```

### Key Transformations

| Source Field | Transformation | Firestore Field | Purpose |
|--------------|----------------|-----------------|---------|
| `make`, `model`, `year`, `epa_option_desc` | Clean, normalize trim | `id`, `canonicalKey`, `trim` | Unique identification |
| `make`, `model`, `year`, `trim` | Format display name | `name` | UI display: "2024 Toyota Camry XLE" |
| `model` | Generate path | `img` | Image reference: "/CarImages/camry.jpg" |
| `msrp` | Format currency | `price` | Display: "$28,855" |
| `fuel_type` | Normalize | `specs.powertrain` | "gas", "hybrid", "ev", "phev" |
| `drive_type` | Normalize | `specs.drivetrain` | "fwd", "awd", "4wd", "rwd" |
| `vehicle_type` | Map categories | `specs.body` | "sedan", "suv", "truck", etc. |
| `combined_mpg` | Format efficiency | `specs.mpg` | "32 mpg" (or `specs.range` for EVs) |
| Multiple fields | Generate keywords | `tags[]` | Searchable tags for filtering |
| `msrp` | Calculate invoice | `pricing.invoice` | ~93% of MSRP |
| EPA fields | Preserve raw | `epa.*` | Original data fidelity |

### Schema Structure

See `src/types/firestore.ts` for complete TypeScript definitions.

#### Vehicle Document (Collection: `vehicles`)

```typescript
{
  // Display fields (UI components)
  id: string                    // "toyota_camry_2024_xle"
  name: string                  // "2024 Toyota Camry XLE"
  img: string                   // "/CarImages/camry.jpg"
  description: string           // Brief description
  tags: string[]                // ["toyota", "sedan", "gas", "fwd", "efficient"]
  price: string                 // "$28,855"
  
  // Specifications (matching Car type)
  specs: {
    drivetrain: "awd" | "4wd" | "fwd" | "rwd"
    powertrain: "hybrid" | "ev" | "gas" | "phev"
    body: "suv" | "sedan" | "truck" | "crossover" | ...
    mpg?: string                // "39 mpg" (gas/hybrid)
    range?: string              // "252 mi" (EVs)
  }
  
  // Finance engine data
  pricing: {
    msrp: number
    invoice: number             // ~93% of MSRP
    destinationCharge: number   // $1,095
  }
  
  // Performance metrics
  performance: {
    mpgCity: number
    mpgHighway: number
    mpgCombined: number
    engineDisplacement: number
    cylinders: number
    horsepower: number | null   // Future: CarQuery API
    torque: number | null
  }
  
  // Dimensions
  dimensions: {
    seating: number
    cargo: number | null        // Future: CarQuery API
    length: number | null
    width: number | null
    height: number | null
    wheelbase: number | null
  }
  
  // Features
  features: {
    standard: string[]          // ["adaptive-cruise", "lane-keep"]
    safety: string[]
    technology: string[]
    comfort: string[]
    exterior: string[]
  }
  
  // Availability
  availability: {
    available: boolean
    inventory: number           // Future: Dealer inventory API
    estimatedDelivery: string
  }
  
  // Source data (preserved for accuracy)
  epa: { /* EPA fields */ }
  vpic: { /* Future: VPIC API */ }
  carquery: { /* Future: CarQuery API */ }
  
  // Metadata
  sources: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### Metadata Document (Collection: `metadata/makes/{make}`)

```typescript
{
  make: string                  // "Toyota", "Lexus"
  years: number[]               // [2024, 2025]
  counts_by_year: {
    "2024": number,
    "2025": number
  }
  lastUpdated: Timestamp
  sources: string[]
}
```

## Tag Generation

Tags are automatically generated for search and filtering:

### Brand Tags
- Make name (lowercase): `"toyota"`, `"lexus"`

### Body Style Tags
- Normalized body type: `"sedan"`, `"suv"`, `"truck"`, `"crossover"`

### Powertrain Tags
- Fuel type: `"gas"`, `"hybrid"`, `"electric"`, `"phev"`
- Economy marker: `"economy"` (hybrid), `"ev"` (electric)

### Drivetrain Tags
- Drive type: `"fwd"`, `"awd"`, `"4wd"`, `"rwd"`

### Feature Tags
- Capacity: `"family"` (7+ seats)
- Capability: `"towing"` (trucks), `"offroad"` (4WD)
- Premium: `"luxury"` (MSRP ≥ $45k)
- Efficiency: `"efficient"` (≥35 mpg)
- Safety: `"safety-tech"` (features present)

**Example**: RAV4 Hybrid XSE → `["toyota", "suv", "hybrid", "economy", "awd", "efficient", "safety-tech"]`

## Collections

### Primary Collections

1. **`vehicles`** - Vehicle documents
   - Read: Public
   - Write: Admin only
   - Indexes: Required for faceted search

2. **`metadata/makes/{make}`** - Aggregated stats per make
   - Read: Public
   - Write: Admin only
   - Purpose: Fast faceting, counts, filters

### User Collections (Future)

3. **`userProfiles`** - User preferences and favorites
   - Read: Owner only
   - Write: Owner only

4. **`dealerLeads`** - Customer inquiries
   - Read: Admin only
   - Write: Authenticated users
   - Immutable after creation

5. **`anonymousSessions`** - Guest user data
   - Read: Unauthenticated only
   - Write: Unauthenticated only
   - TTL: 30 days auto-delete

## Required Firestore Indexes

For efficient queries, create these composite indexes:

```javascript
// firestore.indexes.json
{
  "indexes": [
    // Body style + fuel type + price
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "specs.body", "order": "ASCENDING" },
        { "fieldPath": "specs.powertrain", "order": "ASCENDING" },
        { "fieldPath": "pricing.msrp", "order": "ASCENDING" }
      ]
    },
    
    // Make + year (for browsing by brand/year)
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "make", "order": "ASCENDING" },
        { "fieldPath": "year", "order": "DESCENDING" }
      ]
    },
    
    // Body style + seating + price (family search)
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "specs.body", "order": "ASCENDING" },
        { "fieldPath": "dimensions.seating", "order": "ASCENDING" },
        { "fieldPath": "pricing.msrp", "order": "ASCENDING" }
      ]
    },
    
    // Tags array + price (multi-tag filtering)
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tags", "arrayConfig": "CONTAINS" },
        { "fieldPath": "pricing.msrp", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    
    // Public vehicle data
    match /vehicles/{vehicleId} {
      allow read: if true;              // Public read
      allow write: if isAdmin();        // Admin only
    }
    
    // Public metadata
    match /metadata/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User profiles
    match /userProfiles/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Dealer leads
    match /dealerLeads/{leadId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.consent == true;
      allow update, delete: if false;   // Immutable
    }
    
    // Anonymous sessions (guest users)
    match /anonymousSessions/{sessionId} {
      allow read, write: if request.auth == null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Usage Examples

### Query Vehicles (tRPC)

```typescript
// src/server/api/routers/vehicles.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const vehiclesRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      bodyStyle: z.enum(['sedan', 'suv', 'truck', 'crossover']).optional(),
      powertrain: z.enum(['gas', 'hybrid', 'ev', 'phev']).optional(),
      maxPrice: z.number().optional(),
      minSeating: z.number().optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.db.collection('vehicles');
      
      // Filter by body style
      if (input.bodyStyle) {
        query = query.where('specs.body', '==', input.bodyStyle);
      }
      
      // Filter by powertrain
      if (input.powertrain) {
        query = query.where('specs.powertrain', '==', input.powertrain);
      }
      
      // Filter by price
      if (input.maxPrice) {
        query = query.where('pricing.msrp', '<=', input.maxPrice);
      }
      
      // Filter by seating
      if (input.minSeating) {
        query = query.where('dimensions.seating', '>=', input.minSeating);
      }
      
      // Filter by tags (array-contains-any)
      if (input.tags && input.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', input.tags);
      }
      
      // Execute query
      const snapshot = await query
        .orderBy('pricing.msrp')
        .limit(input.limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }),
});
```

### Use in React Component

```typescript
'use client';

import { api } from '@/trpc/react';

export function VehicleList() {
  const { data: vehicles, isLoading } = api.vehicles.list.useQuery({
    bodyStyle: 'suv',
    powertrain: 'hybrid',
    minSeating: 7,
    maxPrice: 50000,
    limit: 20
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles?.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

function VehicleCard({ vehicle }) {
  return (
    <div className="border rounded-lg p-4">
      <img src={vehicle.img} alt={vehicle.name} className="w-full h-48 object-cover" />
      <h3 className="text-lg font-bold mt-2">{vehicle.name}</h3>
      <p className="text-gray-600">{vehicle.description}</p>
      <div className="flex gap-2 mt-2">
        {vehicle.tags.map(tag => (
          <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xl font-bold mt-2">{vehicle.price}</p>
      <p className="text-sm text-gray-500">
        {vehicle.specs.mpg || vehicle.specs.range} • {vehicle.specs.drivetrain.toUpperCase()}
      </p>
    </div>
  );
}
```

## Data Quality & Validation

The seeding script validates:

- ✅ **Required fields**: `make`, `model`, `year` must be present
- ✅ **Data types**: Numbers, strings, arrays properly typed
- ✅ **Normalization**: Lowercase, trim whitespace, consistent formatting
- ✅ **Defaults**: Sensible defaults for missing optional fields
- ⚠️ **Warnings**: Logs skipped records with reasons
- ❌ **Errors**: Continues processing on individual errors, reports at end

## Future Enhancements

### Planned Data Sources

1. **VPIC (NHTSA API)** - Vehicle specifications
   - VIN decoding
   - Safety ratings
   - Manufacturer details

2. **CarQuery API** - Detailed specifications
   - Horsepower, torque
   - Dimensions (length, width, height, cargo)
   - Trim-specific options

3. **Dealer Inventory API** - Real-time availability
   - Stock levels
   - Pricing variations by region
   - Available colors/options

### Enrichment Process

```
EPA Data (Seed) → VPIC Enrichment → CarQuery Enrichment → Dealer Inventory
     ↓                   ↓                    ↓                   ↓
 Base vehicle      Safety ratings      Full specs         Availability
 MPG, pricing      VIN validation      Dimensions         Real-time stock
```

## Performance Considerations

### Write Performance
- **Batch Size**: 500 documents/batch (Firestore limit)
- **Speed**: ~1000 vehicles/minute on stable connection
- **Emulator**: Much faster (10,000+ vehicles/minute)

### Read Performance
- **Indexes**: Required for complex queries (auto-created on first use in production)
- **Caching**: Consider Firebase Extensions for caching frequently accessed data
- **Pagination**: Use cursor-based (not offset) for large result sets

## Monitoring & Maintenance

### Firestore Console
- **Document Count**: Check total vehicles in collection
- **Index Status**: Ensure all indexes are built
- **Request Costs**: Monitor read/write usage

### Scripts
- **Verify Data**: `node scripts/verify-data.js`
- **Re-seed**: Safe to re-run (overwrites existing documents)
- **Incremental Updates**: Modify script to check `updatedAt` timestamp

## Troubleshooting

See `scripts/README.md` and `QUICKSTART-SEEDING.md` for detailed troubleshooting guides.

## Resources

- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **TypeScript Definitions**: `src/types/firestore.ts`
- **Sample Data**: `scripts/sample-data.json`
- **Seeding Scripts**: `scripts/seed-firestore.js`, `scripts/seed-firestore.ps1`
- **Verification**: `scripts/verify-data.js`

---

**Last Updated**: November 9, 2025  
**Schema Version**: 1.0  
**Compatible With**: Next.js 15, tRPC 11, Firebase Admin SDK 13+
