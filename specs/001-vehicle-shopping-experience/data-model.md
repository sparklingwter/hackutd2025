# Data Model: Toyota Vehicle Shopping Experience

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-08  
**Purpose**: Define entities, relationships, validation rules, and state transitions

## Entity Definitions

### 1. Vehicle

**Purpose**: Represents a Toyota model with base specifications and trim information

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | ✅ | Kebab-case, unique | Vehicle identifier (e.g., "camry-2024") |
| `make` | string | ✅ | Always "Toyota" | Vehicle manufacturer |
| `model` | string | ✅ | Non-empty | Model name (e.g., "Camry") |
| `year` | number | ✅ | 2020-2030 | Model year |
| `bodyStyle` | enum | ✅ | `sedan \| suv \| truck \| van \| coupe \| hatchback` | Body style category |
| `fuelType` | enum | ✅ | `gas \| hybrid \| electric \| plugin-hybrid` | Fuel/powertrain type |
| `seating` | number | ✅ | 2-8 | Passenger seating capacity |
| `mpgCity` | number | ✅ | 1-150 (or null for EV) | EPA city fuel economy |
| `mpgHighway` | number | ✅ | 1-150 (or null for EV) | EPA highway fuel economy |
| `mpgCombined` | number | ✅ | 1-150 (or null for EV) | EPA combined fuel economy |
| `range` | number | ❌ | 50-500 (required for EV/PHEV) | Electric range in miles |
| `cargoVolume` | number | ✅ | 0-200 | Cargo space in cubic feet |
| `towingCapacity` | number | ✅ | 0-15000 | Max towing capacity in pounds |
| `awd` | boolean | ✅ | true/false | All-wheel drive available |
| `fourWheelDrive` | boolean | ✅ | true/false | 4x4 available |
| `msrp` | number | ✅ | 15000-100000 | Base MSRP in USD |
| `features` | string[] | ✅ | Array of feature codes | Standard features (e.g., ["adaptive-cruise", "lane-keep"]) |
| `safetyRating` | number | ❌ | 1-5 | NHTSA overall safety rating |
| `trims` | string[] | ✅ | Non-empty array | Available trim names |
| `imageUrls` | string[] | ✅ | Valid Firebase Storage URLs | Vehicle images (min 1, max 10) |
| `description` | string | ✅ | Max 500 chars | Marketing description |
| `createdAt` | timestamp | ✅ | Auto-generated | Creation timestamp |
| `updatedAt` | timestamp | ✅ | Auto-updated | Last update timestamp |

**Indexes** (Firestore composite indexes):

- `(bodyStyle, fuelType, msrp)` — Filter by body style + fuel type, sort by price
- `(seating, msrp)` — Filter by seating, sort by price
- `(fuelType, mpgCombined)` — Filter by fuel type, sort by efficiency

**Relationships**:

- **1:many** → `Trim` (subcollection: `vehicles/{vehicleId}/trims/{trimId}`)
- **many:many** → `UserProfile.favorites` (referenced by vehicle ID)
- **many:many** → `CompareSet.vehicleIds` (referenced by vehicle ID)

**Validation Rules**:

```typescript
const VehicleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  make: z.literal('Toyota'),
  model: z.string().min(1),
  year: z.number().int().min(2020).max(2030),
  bodyStyle: z.enum(['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback']),
  fuelType: z.enum(['gas', 'hybrid', 'electric', 'plugin-hybrid']),
  seating: z.number().int().min(2).max(8),
  mpgCity: z.number().positive().nullable(),
  mpgHighway: z.number().positive().nullable(),
  mpgCombined: z.number().positive().nullable(),
  range: z.number().positive().nullable(),
  cargoVolume: z.number().nonnegative(),
  towingCapacity: z.number().nonnegative().max(15000),
  awd: z.boolean(),
  fourWheelDrive: z.boolean(),
  msrp: z.number().positive().min(15000).max(100000),
  features: z.array(z.string()),
  safetyRating: z.number().int().min(1).max(5).nullable(),
  trims: z.array(z.string()).nonempty(),
  imageUrls: z.array(z.string().url()).min(1).max(10),
  description: z.string().max(500),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine(
  (data) => {
    // EV/PHEV must have range
    if (['electric', 'plugin-hybrid'].includes(data.fuelType)) {
      return data.range !== null;
    }
    // Gas/hybrid must have MPG
    if (['gas', 'hybrid'].includes(data.fuelType)) {
      return data.mpgCity !== null && data.mpgHighway !== null && data.mpgCombined !== null;
    }
    return true;
  },
  { message: 'Range required for EV/PHEV, MPG required for gas/hybrid' }
);
```

---

### 2. Trim

**Purpose**: Represents a specific trim level of a vehicle (subcollection of Vehicle)

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | ✅ | Unique within vehicle | Trim identifier (e.g., "xle") |
| `name` | string | ✅ | Non-empty | Trim name (e.g., "XLE") |
| `msrp` | number | ✅ | Positive | Trim-specific MSRP in USD |
| `features` | string[] | ✅ | Array of feature codes | Trim-specific features |
| `engine` | string | ✅ | Non-empty | Engine description (e.g., "2.5L I4 Hybrid") |
| `horsepower` | number | ✅ | Positive | Engine horsepower |
| `torque` | number | ✅ | Positive | Engine torque (lb-ft) |
| `zeroToSixty` | number | ❌ | Positive | 0-60 mph time in seconds |
| `transmission` | string | ✅ | Non-empty | Transmission type (e.g., "8-Speed Automatic") |
| `driveType` | enum | ✅ | `fwd \| rwd \| awd \| 4wd` | Drive configuration |
| `imageUrls` | string[] | ❌ | Valid URLs | Trim-specific images |

**Path**: `vehicles/{vehicleId}/trims/{trimId}`

**Validation Rules**:

```typescript
const TrimSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  msrp: z.number().positive(),
  features: z.array(z.string()),
  engine: z.string().min(1),
  horsepower: z.number().positive(),
  torque: z.number().positive(),
  zeroToSixty: z.number().positive().nullable(),
  transmission: z.string().min(1),
  driveType: z.enum(['fwd', 'rwd', 'awd', '4wd']),
  imageUrls: z.array(z.string().url()).optional(),
});
```

---

### 3. UserNeedsProfile

**Purpose**: Represents user preferences collected during guided discovery journey

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `budgetType` | enum | ✅ | `monthly \| cash` | Budget constraint type |
| `budgetAmount` | number | ✅ | Positive | Budget amount in USD |
| `bodyStyle` | enum | ✅ | Vehicle body styles | Preferred body style |
| `seating` | number | ✅ | 2-8 | Minimum seating capacity |
| `fuelType` | enum | ✅ | Fuel types | Preferred fuel/powertrain |
| `priorityMpg` | boolean | ✅ | true/false | Prioritize fuel efficiency |
| `priorityRange` | boolean | ✅ | true/false | Prioritize electric range |
| `cargoNeeds` | enum | ✅ | `none \| light \| moderate \| heavy` | Cargo space needs |
| `towingNeeds` | enum | ✅ | `none \| light \| moderate \| heavy` | Towing capacity needs |
| `requireAwd` | boolean | ✅ | true/false | AWD/4WD required |
| `safetyPriority` | enum | ✅ | `low \| medium \| high` | Safety feature priority |
| `driverAssistNeeds` | string[] | ✅ | Feature codes | Must-have driver-assist features |
| `mustHaveFeatures` | string[] | ✅ | Feature codes | Other must-have features |
| `drivingPattern` | enum | ✅ | `urban \| highway \| mixed` | Primary driving environment |
| `commuteLength` | enum | ✅ | `short \| medium \| long` | Daily commute length |
| `createdAt` | timestamp | ✅ | Auto-generated | When profile created |

**Embedded In**: `UserProfile.preferences` or passed as input to recommendation API

**Validation Rules**:

```typescript
const UserNeedsProfileSchema = z.object({
  budgetType: z.enum(['monthly', 'cash']),
  budgetAmount: z.number().positive(),
  bodyStyle: z.enum(['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback']),
  seating: z.number().int().min(2).max(8),
  fuelType: z.enum(['gas', 'hybrid', 'electric', 'plugin-hybrid']),
  priorityMpg: z.boolean(),
  priorityRange: z.boolean(),
  cargoNeeds: z.enum(['none', 'light', 'moderate', 'heavy']),
  towingNeeds: z.enum(['none', 'light', 'moderate', 'heavy']),
  requireAwd: z.boolean(),
  safetyPriority: z.enum(['low', 'medium', 'high']),
  driverAssistNeeds: z.array(z.string()),
  mustHaveFeatures: z.array(z.string()),
  drivingPattern: z.enum(['urban', 'highway', 'mixed']),
  commuteLength: z.enum(['short', 'medium', 'long']),
  createdAt: z.date(),
});
```

---

### 4. Recommendation

**Purpose**: Represents an AI-generated vehicle recommendation with explanation

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `vehicleId` | string | ✅ | Valid vehicle ID | Reference to Vehicle |
| `tier` | enum | ✅ | `top-pick \| strong-contender \| explore-alternative` | Recommendation tier |
| `score` | number | ✅ | 0-100 | Calculated match score |
| `explanation` | string | ✅ | Max 300 chars | Why recommended (plain language) |
| `matchedCriteria` | string[] | ✅ | Non-empty | Which user needs this matches |
| `tradeoffs` | string[] | ❌ | Optional | Known compromises (e.g., "Slightly over budget") |

**Not Persisted**: Recommendations are ephemeral, generated on-demand via tRPC API

**Validation Rules**:

```typescript
const RecommendationSchema = z.object({
  vehicleId: z.string(),
  tier: z.enum(['top-pick', 'strong-contender', 'explore-alternative']),
  score: z.number().min(0).max(100),
  explanation: z.string().max(300),
  matchedCriteria: z.array(z.string()).nonempty(),
  tradeoffs: z.array(z.string()).optional(),
});
```

---

### 5. CompareSet

**Purpose**: Represents a collection of vehicles for side-by-side comparison

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | ✅ | Auto-generated UUID | Compare set identifier |
| `name` | string | ❌ | Max 100 chars | User-defined name (e.g., "My Favorites") |
| `vehicleIds` | string[] | ✅ | 1-4 valid vehicle IDs | Vehicles in comparison |
| `createdAt` | timestamp | ✅ | Auto-generated | When set created |
| `updatedAt` | timestamp | ✅ | Auto-updated | Last modification time |

**Embedded In**: `UserProfile.compareSets` or standalone for anonymous users (local storage)

**Validation Rules**:

```typescript
const CompareSetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100).optional(),
  vehicleIds: z.array(z.string()).min(1).max(4),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

---

### 6. Estimate

**Purpose**: Represents a cost projection (cash/finance/lease) for a specific vehicle

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | ✅ | Auto-generated UUID | Estimate identifier |
| `vehicleId` | string | ✅ | Valid vehicle ID | Vehicle being estimated |
| `trimId` | string | ❌ | Valid trim ID | Specific trim (optional) |
| `type` | enum | ✅ | `cash \| finance \| lease` | Estimate type |
| `zipCode` | string | ✅ | 5-digit ZIP | For tax/fee calculation |
| `inputs` | object | ✅ | See sub-schemas | Type-specific inputs |
| `outputs` | object | ✅ | See sub-schemas | Calculated results |
| `fuelEstimate` | object | ❌ | Optional | Fuel/energy cost estimate |
| `createdAt` | timestamp | ✅ | Auto-generated | When estimate created |
| `updatedAt` | timestamp | ✅ | Auto-updated | Last recalculation time |

**Sub-Schema: CashInputs**:

```typescript
const CashInputsSchema = z.object({
  vehiclePrice: z.number().positive(), // MSRP or adjusted
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
});
```

**Sub-Schema: FinanceInputs**:

```typescript
const FinanceInputsSchema = z.object({
  vehiclePrice: z.number().positive(),
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  downPayment: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
  termMonths: z.number().int().positive(), // e.g., 36, 48, 60, 72
  apr: z.number().nonnegative().max(30), // Annual percentage rate
});
```

**Sub-Schema: LeaseInputs**:

```typescript
const LeaseInputsSchema = z.object({
  vehiclePrice: z.number().positive(),
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  downPayment: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
  termMonths: z.number().int().positive(), // e.g., 24, 36, 48
  residualPercent: z.number().positive().max(100), // e.g., 60%
  moneyFactor: z.number().positive(), // e.g., 0.00125
  mileageCap: z.number().int().positive(), // e.g., 10000, 12000, 15000 per year
});
```

**Sub-Schema: EstimateOutputs**:

```typescript
const EstimateOutputsSchema = z.object({
  monthlyPayment: z.number().nonnegative().nullable(), // null for cash
  dueAtSigning: z.number().nonnegative(),
  totalTaxes: z.number().nonnegative(),
  totalFees: z.number().nonnegative(),
  outTheDoorTotal: z.number().positive(),
  totalCostOverTerm: z.number().positive(), // For finance/lease
  totalInterestPaid: z.number().nonnegative().nullable(), // Finance only
});
```

**Sub-Schema: FuelEstimate**:

```typescript
const FuelEstimateSchema = z.object({
  fuelType: z.enum(['gas', 'electric']),
  pricePerUnit: z.number().positive(), // $/gallon or $/kWh
  annualMiles: z.number().positive(),
  mpgOrMpge: z.number().positive(),
  monthlyCost: z.number().positive(),
  annualCost: z.number().positive(),
});
```

**Embedded In**: `UserProfile.estimates` or standalone for anonymous users

**Validation Rules**: See sub-schemas above (enforced by `finance-engine` library)

---

### 7. UserProfile

**Purpose**: Represents an authenticated user with saved data (favorites, searches, compare sets, estimates)

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `userId` | string | ✅ | Auth0 user ID | User identifier from Auth0 |
| `email` | string | ✅ | Valid email | User email (from Auth0) |
| `displayName` | string | ❌ | Max 100 chars | User display name |
| `preferences` | object | ❌ | UserNeedsProfile schema | Last discovery journey inputs |
| `favorites` | string[] | ✅ | Array of vehicle IDs | Favorited vehicles |
| `savedSearches` | object[] | ❌ | Array of UserNeedsProfile | Previous discovery journeys |
| `compareSets` | object[] | ❌ | Array of CompareSet | Saved comparisons |
| `estimates` | object[] | ❌ | Array of Estimate | Saved cost estimates |
| `voiceEnabled` | boolean | ✅ | true/false | Voice interaction preference |
| `createdAt` | timestamp | ✅ | Auto-generated | Account creation time |
| `updatedAt` | timestamp | ✅ | Auto-updated | Last profile update |

**Path**: `userProfiles/{userId}`

**Validation Rules**:

```typescript
const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string().max(100).optional(),
  preferences: UserNeedsProfileSchema.optional(),
  favorites: z.array(z.string()),
  savedSearches: z.array(UserNeedsProfileSchema).optional(),
  compareSets: z.array(CompareSetSchema).optional(),
  estimates: z.array(EstimateSchema).optional(),
  voiceEnabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

---

### 8. DealerLead

**Purpose**: Represents a user's request for dealer contact with explicit consent

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | ✅ | Auto-generated UUID | Lead identifier |
| `userId` | string | ✅ | Auth0 user ID | User who submitted lead |
| `vehicleIds` | string[] | ✅ | 1-10 vehicle IDs | Vehicles user is interested in |
| `estimateId` | string | ❌ | Valid estimate ID | Attached estimate (optional) |
| `contactInfo` | object | ✅ | See sub-schema | User contact details |
| `consent` | boolean | ✅ | Must be true | Explicit consent to share info |
| `zipCode` | string | ✅ | 5-digit ZIP | User location |
| `message` | string | ❌ | Max 500 chars | Optional message to dealer |
| `status` | enum | ✅ | `new \| contacted \| closed` | Lead status (admin only) |
| `createdAt` | timestamp | ✅ | Auto-generated | When lead created |

**Sub-Schema: ContactInfo**:

```typescript
const ContactInfoSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/), // 10-digit phone
  preferredContact: z.enum(['email', 'phone', 'either']),
});
```

**Path**: `dealerLeads/{leadId}`

**Validation Rules**:

```typescript
const DealerLeadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  vehicleIds: z.array(z.string()).min(1).max(10),
  estimateId: z.string().uuid().optional(),
  contactInfo: ContactInfoSchema,
  consent: z.literal(true), // Must be true
  zipCode: z.string().regex(/^\d{5}$/),
  message: z.string().max(500).optional(),
  status: z.enum(['new', 'contacted', 'closed']),
  createdAt: z.date(),
});
```

---

## Entity Relationships Diagram

```text
┌─────────────────┐
│    Vehicle      │
│                 │
│ - id            │──┐
│ - model         │  │
│ - bodyStyle     │  │
│ - fuelType      │  │
│ - msrp          │  │
│ - features[]    │  │
│ - trims[]       │  │
└─────────────────┘  │
         │           │
         │ 1:many    │
         ▼           │
┌─────────────────┐  │
│      Trim       │  │
│ (subcollection) │  │
│                 │  │
│ - name          │  │
│ - msrp          │  │
│ - features[]    │  │
│ - engine        │  │
└─────────────────┘  │
                     │ many:many
                     │
┌─────────────────┐  │
│  UserProfile    │  │
│                 │  │
│ - userId        │  │
│ - favorites[]   │──┘ (vehicle IDs)
│ - compareSets[] │──┐
│ - estimates[]   │  │
│ - preferences   │  │
└─────────────────┘  │
         │           │
         │ 1:many    │
         ▼           ▼
┌─────────────────┐ ┌─────────────────┐
│   CompareSet    │ │    Estimate     │
│                 │ │                 │
│ - vehicleIds[]  │ │ - vehicleId     │
│ - name          │ │ - type          │
│ - createdAt     │ │ - inputs        │
└─────────────────┘ │ - outputs       │
                    │ - zipCode       │
                    └─────────────────┘
                             │
                             │ referenced in
                             ▼
                    ┌─────────────────┐
                    │   DealerLead    │
                    │                 │
                    │ - userId        │
                    │ - vehicleIds[]  │
                    │ - estimateId    │
                    │ - contactInfo   │
                    │ - consent       │
                    └─────────────────┘
```

---

## State Transitions

### CompareSet State

```text
[Empty] ──add vehicle──> [1 vehicle] ──add vehicle──> [2-3 vehicles] ──add vehicle──> [4 vehicles (max)]
   │                          │                            │                              │
   └──────────────────────────┴────────────────────────────┴──────────────────────────────┘
                                       │
                                       │ remove vehicle
                                       ▼
                            [Updated compare set]
```

**Rules**:

- Maximum 4 vehicles in compare set
- Attempting to add 5th vehicle returns error: "Compare tray is full (max 4 vehicles)"
- Removing vehicle shifts remaining vehicles (no gaps)

### Estimate State

```text
[Draft] ──save inputs──> [Calculating] ──complete──> [Final]
   │                          │                         │
   │                          │ error                   │ update inputs
   │                          ▼                         ▼
   │                     [Failed] ──retry──────────> [Recalculating]
   │                                                    │
   └────────────────────────────────────────────────────┘
```

**Rules**:

- Estimates are recalculated whenever inputs change (reactive)
- Failed estimates show error message, allow user to retry or adjust inputs
- Estimates marked with "Last updated" timestamp

### DealerLead State

```text
[New] ──dealer reviews──> [Contacted] ──dealer closes──> [Closed]
```

**Rules**:

- Users cannot modify leads after submission (immutable)
- Only admins can update status (`new` → `contacted` → `closed`)
- Users can submit multiple leads for different vehicles

---

## Validation Summary

All entities enforce validation at three levels:

1. **Schema-level**: Zod schemas in `packages/finance-engine/src/schemas.ts` and `apps/web/src/server/api/schemas.ts`
2. **API-level**: tRPC procedures validate inputs before processing
3. **Database-level**: Firebase Security Rules enforce required fields and ownership

**Key Validation Patterns**:

- **Required fields**: Must be present or API/Firestore write fails
- **Enums**: Limited to predefined values (e.g., `bodyStyle`, `fuelType`)
- **Ranges**: Numeric fields have min/max bounds (e.g., `msrp: 15000-100000`)
- **References**: Vehicle IDs, user IDs must exist before creating dependent entities
- **Consent**: `DealerLead.consent` must be `true` (literal value, not just boolean)

---

## Next Steps

1. Generate tRPC API contracts in `/contracts/` based on these entities
2. Implement Firestore Security Rules enforcing validation and ownership
3. Create seed data for ~50 Toyota vehicles in `scripts/seed-vehicles.ts`
