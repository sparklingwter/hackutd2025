# Shared Zod Schemas

**Purpose**: Reusable Zod schemas for API input/output validation

All routers reference these shared schemas to ensure consistency across the API.

## Common Schemas

### Pagination

```typescript
export const PaginationInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().optional(),
  });
```

### Vehicle Filters

```typescript
export const VehicleFiltersSchema = z.object({
  bodyStyle: z.enum(['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback']).optional(),
  fuelType: z.enum(['gas', 'hybrid', 'electric', 'plugin-hybrid']).optional(),
  minSeating: z.number().int().min(2).max(8).optional(),
  maxSeating: z.number().int().min(2).max(8).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  requireAwd: z.boolean().optional(),
  minMpg: z.number().positive().optional(),
  minRange: z.number().positive().optional(),
  minTowing: z.number().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  safetyRating: z.number().int().min(1).max(5).optional(),
});
```

### User Needs Profile

```typescript
export const UserNeedsProfileSchema = z.object({
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
});
```

### Vehicle Entity

```typescript
export const VehicleSchema = z.object({
  id: z.string(),
  make: z.literal('Toyota'),
  model: z.string(),
  year: z.number().int().min(2020).max(2030),
  bodyStyle: z.enum(['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback']),
  fuelType: z.enum(['gas', 'hybrid', 'electric', 'plugin-hybrid']),
  seating: z.number().int().min(2).max(8),
  mpgCity: z.number().positive().nullable(),
  mpgHighway: z.number().positive().nullable(),
  mpgCombined: z.number().positive().nullable(),
  range: z.number().positive().nullable(),
  cargoVolume: z.number().nonnegative(),
  towingCapacity: z.number().nonnegative(),
  awd: z.boolean(),
  fourWheelDrive: z.boolean(),
  msrp: z.number().positive(),
  features: z.array(z.string()),
  safetyRating: z.number().int().min(1).max(5).nullable(),
  trims: z.array(z.string()),
  imageUrls: z.array(z.string().url()),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### Trim Entity

```typescript
export const TrimSchema = z.object({
  id: z.string(),
  name: z.string(),
  msrp: z.number().positive(),
  features: z.array(z.string()),
  engine: z.string(),
  horsepower: z.number().positive(),
  torque: z.number().positive(),
  zeroToSixty: z.number().positive().nullable(),
  transmission: z.string(),
  driveType: z.enum(['fwd', 'rwd', 'awd', '4wd']),
  imageUrls: z.array(z.string().url()).optional(),
});
```

### Recommendation

```typescript
export const RecommendationSchema = z.object({
  vehicleId: z.string(),
  tier: z.enum(['top-pick', 'strong-contender', 'explore-alternative']),
  score: z.number().min(0).max(100),
  explanation: z.string().max(300),
  matchedCriteria: z.array(z.string()).nonempty(),
  tradeoffs: z.array(z.string()).optional(),
});
```

### Estimate Inputs

```typescript
export const CashInputsSchema = z.object({
  vehiclePrice: z.number().positive(),
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
});

export const FinanceInputsSchema = z.object({
  vehiclePrice: z.number().positive(),
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  downPayment: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
  termMonths: z.number().int().positive(),
  apr: z.number().nonnegative().max(30),
});

export const LeaseInputsSchema = z.object({
  vehiclePrice: z.number().positive(),
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  downPayment: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
  termMonths: z.number().int().positive(),
  residualPercent: z.number().positive().max(100),
  moneyFactor: z.number().positive(),
  mileageCap: z.number().int().positive(),
});

export const FuelEstimateInputSchema = z.object({
  fuelType: z.enum(['gas', 'electric']),
  pricePerUnit: z.number().positive(),
  annualMiles: z.number().positive(),
  mpgOrMpge: z.number().positive(),
});
```

### Estimate Outputs

```typescript
export const EstimateOutputsSchema = z.object({
  monthlyPayment: z.number().nonnegative().nullable(),
  dueAtSigning: z.number().nonnegative(),
  totalTaxes: z.number().nonnegative(),
  totalFees: z.number().nonnegative(),
  outTheDoorTotal: z.number().positive(),
  totalCostOverTerm: z.number().positive(),
  totalInterestPaid: z.number().nonnegative().nullable(),
});

export const FuelEstimateOutputSchema = z.object({
  monthlyCost: z.number().positive(),
  annualCost: z.number().positive(),
});
```

### Dealer Lead

```typescript
export const ContactInfoSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  preferredContact: z.enum(['email', 'phone', 'either']),
});

export const DealerLeadInputSchema = z.object({
  vehicleIds: z.array(z.string()).min(1).max(10),
  estimateId: z.string().uuid().optional(),
  contactInfo: ContactInfoSchema,
  consent: z.literal(true),
  zipCode: z.string().regex(/^\d{5}$/),
  message: z.string().max(500).optional(),
});
```

## Usage

Import shared schemas in router files:

```typescript
import {
  VehicleSchema,
  VehicleFiltersSchema,
  PaginationInputSchema,
  PaginatedResponseSchema,
} from '../schemas';

export const vehiclesRouter = createTRPCRouter({
  list: publicProcedure
    .input(VehicleFiltersSchema.merge(PaginationInputSchema))
    .output(PaginatedResponseSchema(VehicleSchema))
    .query(async ({ input, ctx }) => {
      // Implementation
    }),
});
```
