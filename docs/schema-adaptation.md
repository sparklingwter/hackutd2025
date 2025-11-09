# Data Schema Adaptation Notes

**Date**: 2025-11-09  
**Status**: ✅ Complete

## Overview

The codebase has been adapted to work with the actual Firestore data schema, which differs from the original spec in `specs/001-vehicle-shopping-experience/data-model.md`.

## Actual vs. Spec Schema

### Actual Schema (as seeded in Firestore)

```typescript
{
  id: string;
  make: string;
  model: string;
  year: number;
  specs: {
    body: string;           // "suv", "sedan", "truck", "van", "wagon"
    powertrain: string;     // "gas", "electric" (no hybrid in current data)
    drivetrain: string;     // "rwd", "fwd", "awd", "4wd"
    mpg: string;
    range: number | null;
  };
  pricing: {
    msrp: number | null;    // ⚠️ All vehicles have null MSRP
    invoice: number | null;
    destinationCharge: number;
  };
  performance: {
    mpgCity: number | null;
    mpgHighway: number | null;
    mpgCombined: number | null;
    engineDisplacement: number | null;
    cylinders: number | null;
    horsepower: number | null;
    torque: number | null;
  };
  dimensions: {
    seating: number | null;
    cargo: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    wheelbase: number | null;
  };
  features: {
    standard: string[];
    safety: string[];
    technology: string[];
    comfort: string[];
    exterior: string[];
  };
}
```

### Original Spec Schema

```typescript
{
  id: string;
  bodyStyle: string;      // Top-level field
  fuelType: string;       // Top-level field
  msrp: number;          // Top-level field
  seating: number;       // Top-level field
  features: string[];    // Flat array
  // ... other top-level fields
}
```

## Adaptations Made

### 1. Collection Helpers (`src/server/db/collections.ts`)

- Added `VehicleDocRaw` interface for actual Firestore schema
- Created `transformVehicleDoc()` function to normalize data
- Maps nested fields to flat structure:
  - `specs.body` → `bodyStyle`
  - `specs.powertrain` → `fuelType`
  - `pricing.msrp` → `msrp`
  - `dimensions.seating` → `seating`
  - `features.*` arrays → flattened into single `features` array
  - `specs.drivetrain` → derives `awd` and `fourWheelDrive` booleans

### 2. Firestore Indexes (`firestore.indexes.json`)

Updated all composite indexes to use nested field paths:
- `specs.body` instead of `bodyStyle`
- `pricing.msrp` instead of `msrp`
- `specs.powertrain` instead of `fuelType`
- `dimensions.seating` instead of `seating`
- `performance.mpgCombined` instead of `mpgCombined`

### 3. Ranking Engine (`src/lib/ranking-engine/`)

- Updated `VehicleForRankingSchema` comments to reflect mapping
- Ranking logic works with normalized format after transformation
- No code changes needed (uses transformed data)

### 4. Finance Engine (`src/lib/finance-engine/`)

- Already designed to accept `vehiclePrice` as parameter
- Handles null MSRP gracefully by requiring user input
- No code changes needed

## Data Limitations

### Current Data (142 vehicles total)

**Powertrains**:
- Gas: 127 vehicles (89%)
- Electric: 15 vehicles (11%)
- Hybrid: 0 vehicles ❌

**Body Styles**:
- SUV: 63 vehicles (44%)
- Sedan: 56 vehicles (39%)
- Truck: 18 vehicles (13%)
- Van: 4 vehicles (3%)
- Wagon: 1 vehicle (1%)

**Pricing**:
- With MSRP: 0 vehicles (0%) ❌
- No MSRP: 142 vehicles (100%)
- All show "Contact Dealer" for pricing

### Impact on Features

1. **Price-based filtering**: Limited without MSRP data
   - Workaround: Use estimated pricing or allow users to input expected price
   
2. **Hybrid recommendations**: No hybrid vehicles in dataset
   - Workaround: Suggest electric vehicles as alternative for efficiency
   
3. **Budget calculations**: Require user input for vehicle price
   - Finance calculators work correctly once price is provided

## Testing Results

✅ All schema adaptation tests passed:
- Vehicle retrieval and transformation
- Filtering by body style (specs.body)
- Filtering by powertrain (specs.powertrain)
- Counting by body style
- Basic ranking algorithm

See test scripts:
- `scripts/test-firestore.mjs` - Basic connectivity
- `scripts/test-ranking.mjs` - Ranking with actual data
- `scripts/analyze-data.mjs` - Data structure analysis
- `scripts/inspect-vehicle.mjs` - Single document inspection

## Recommendations

1. **For Production**: Seed MSRP data for accurate price-based recommendations
2. **For Hybrid Support**: Add hybrid vehicles to dataset if needed
3. **For UI**: Show "Contact Dealer" for pricing when MSRP is null
4. **For Finance**: Require user to enter expected price before calculations

## Files Modified

- ✅ `src/server/db/collections.ts` - Added transformation logic
- ✅ `src/lib/ranking-engine/schemas.ts` - Updated comments
- ✅ `firestore.indexes.json` - Updated field paths
- ✅ Created test scripts for verification
