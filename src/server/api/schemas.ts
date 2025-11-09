import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

/**
 * Pagination input for list queries
 */
export const PaginationInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

/**
 * Generic paginated response wrapper
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().optional(),
  });

// ============================================================================
// Vehicle Filters
// ============================================================================

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

// ============================================================================
// User Needs Profile
// ============================================================================

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

// ============================================================================
// Vehicle Entity
// ============================================================================

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

export type Vehicle = z.infer<typeof VehicleSchema>;

// ============================================================================
// Trim Entity
// ============================================================================

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

export type Trim = z.infer<typeof TrimSchema>;

// ============================================================================
// Recommendation
// ============================================================================

export const RecommendationSchema = z.object({
  vehicleId: z.string(),
  tier: z.enum(['top-pick', 'strong-contender', 'explore-alternative']),
  score: z.number().min(0).max(100),
  explanation: z.string().max(300),
  matchedCriteria: z.array(z.string()).nonempty(),
  tradeoffs: z.array(z.string()).optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// ============================================================================
// Estimate Inputs
// ============================================================================

export const CashInputsSchema = z.object({
  vehiclePrice: z.number().positive(),
  discounts: z.number().nonnegative().default(0),
  rebates: z.number().nonnegative().default(0),
  tradeInValue: z.number().nonnegative().default(0),
  tradeInPayoff: z.number().nonnegative().default(0),
});

export type CashInputs = z.infer<typeof CashInputsSchema>;

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

export type FinanceInputs = z.infer<typeof FinanceInputsSchema>;

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

export type LeaseInputs = z.infer<typeof LeaseInputsSchema>;

export const FuelEstimateInputSchema = z.object({
  fuelType: z.enum(['gas', 'electric']),
  pricePerUnit: z.number().positive(),
  annualMiles: z.number().positive(),
  mpgOrMpge: z.number().positive(),
});

export type FuelEstimateInput = z.infer<typeof FuelEstimateInputSchema>;

// ============================================================================
// Estimate Outputs
// ============================================================================

export const EstimateOutputsSchema = z.object({
  monthlyPayment: z.number().nonnegative().nullable(),
  dueAtSigning: z.number().nonnegative(),
  totalTaxes: z.number().nonnegative(),
  totalFees: z.number().nonnegative(),
  outTheDoorTotal: z.number().positive(),
  totalCostOverTerm: z.number().positive(),
  totalInterestPaid: z.number().nonnegative().nullable(),
});

export type EstimateOutputs = z.infer<typeof EstimateOutputsSchema>;

export const FuelEstimateOutputSchema = z.object({
  monthlyCost: z.number().positive(),
  annualCost: z.number().positive(),
});

export type FuelEstimateOutput = z.infer<typeof FuelEstimateOutputSchema>;

// ============================================================================
// User Profile & Saved Items
// ============================================================================

export const CompareSetSchema = z.object({
  id: z.string().uuid(),
  vehicleIds: z.array(z.string()).min(2).max(4),
  name: z.string().optional(),
  createdAt: z.date(),
});

export type CompareSet = z.infer<typeof CompareSetSchema>;

export const EstimateSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['cash', 'finance', 'lease']),
  vehicleId: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
  inputs: z.union([CashInputsSchema, FinanceInputsSchema, LeaseInputsSchema]),
  outputs: EstimateOutputsSchema,
  fuelEstimate: FuelEstimateOutputSchema.optional(),
  createdAt: z.date(),
  name: z.string().optional(),
});

export type Estimate = z.infer<typeof EstimateSchema>;

export const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  preferences: UserNeedsProfileSchema.optional(),
  favorites: z.array(z.string()).default([]),
  savedSearches: z.array(UserNeedsProfileSchema).default([]),
  compareSets: z.array(CompareSetSchema).default([]),
  estimates: z.array(EstimateSchema).default([]),
  voiceEnabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
