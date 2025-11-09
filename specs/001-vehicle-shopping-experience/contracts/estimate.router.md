# Estimate Router

**Domain**: Cost estimation (cash/finance/lease) and fuel calculations  
**Authentication**: Public (anonymous estimates) + Protected (saved estimates)  
**Rate Limits**: None

## Procedures

### `estimate.calculateCash`

Calculate cash (out-the-door) purchase estimate.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
  trimId?: string;      // Optional specific trim
  zipCode: string;      // 5-digit ZIP for tax/fee calculation
  inputs: CashInputsSchema; // See schemas.md
}
```

**Output**:

```typescript
{
  estimateId: string;           // UUID for saving/referencing
  vehicleId: string;
  trimId?: string;
  type: 'cash';
  zipCode: string;
  inputs: CashInputsSchema;
  outputs: EstimateOutputsSchema;
  taxBreakdown: {
    salesTax: number;
    registrationFee: number;
    titleFee: number;
    documentFee: number;
    stateFees: number;
  };
  disclaimer: string;           // Non-binding disclaimer text
  calculatedAt: Date;
}
```

**Behavior**:

- Calls `finance-engine` library with inputs
- Calculates taxes/fees based on ZIP code (or state fallback if ZIP unavailable)
- Returns out-the-door total with itemized breakdown
- Includes disclaimer text for display

**Errors**:

- `BAD_REQUEST`: Invalid inputs or ZIP code format
- `NOT_FOUND`: Vehicle ID does not exist
- `INTERNAL_SERVER_ERROR`: Tax/fee calculation service unavailable (fallback to state-level estimate)

**Example**:

```typescript
const { data } = trpc.estimate.calculateCash.useQuery({
  vehicleId: 'camry-2024',
  zipCode: '75080',
  inputs: {
    vehiclePrice: 28855,
    discounts: 1000,
    rebates: 500,
    tradeInValue: 5000,
    tradeInPayoff: 3000,
  },
});

// Response:
// {
//   estimateId: '770g0622-...',
//   vehicleId: 'camry-2024',
//   type: 'cash',
//   zipCode: '75080',
//   inputs: { ... },
//   outputs: {
//     monthlyPayment: null,
//     dueAtSigning: 0,
//     totalTaxes: 1728,
//     totalFees: 350,
//     outTheDoorTotal: 22433,
//     totalCostOverTerm: 22433,
//     totalInterestPaid: null
//   },
//   taxBreakdown: {
//     salesTax: 1728,     // 6% of (28855 - 1000 - 500)
//     registrationFee: 150,
//     titleFee: 50,
//     documentFee: 150,
//     stateFees: 0
//   },
//   disclaimer: 'This estimate is informational only and not binding...',
//   calculatedAt: '2025-11-08T10:30:00Z'
// }
```

---

### `estimate.calculateFinance`

Calculate finance (loan) payment estimate.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
  trimId?: string;
  zipCode: string;
  inputs: FinanceInputsSchema; // See schemas.md
}
```

**Output**:

```typescript
{
  estimateId: string;
  vehicleId: string;
  trimId?: string;
  type: 'finance';
  zipCode: string;
  inputs: FinanceInputsSchema;
  outputs: EstimateOutputsSchema;
  taxBreakdown: { ... };
  disclaimer: string;
  calculatedAt: Date;
}
```

**Behavior**:

- Calls `finance-engine` library with inputs
- Calculates monthly payment using standard amortization formula
- Returns total interest paid over term, due-at-signing, and out-the-door total

**Errors**:

- `BAD_REQUEST`: Invalid inputs (e.g., APR > 30%, term length not standard)
- `NOT_FOUND`: Vehicle ID does not exist

**Example**:

```typescript
const { data } = trpc.estimate.calculateFinance.useQuery({
  vehicleId: 'camry-2024',
  zipCode: '75080',
  inputs: {
    vehiclePrice: 28855,
    discounts: 1000,
    rebates: 500,
    downPayment: 3000,
    tradeInValue: 5000,
    tradeInPayoff: 3000,
    termMonths: 60,
    apr: 5.99,
  },
});

// Response:
// {
//   estimateId: '880h1733-...',
//   vehicleId: 'camry-2024',
//   type: 'finance',
//   zipCode: '75080',
//   inputs: { ... },
//   outputs: {
//     monthlyPayment: 382,
//     dueAtSigning: 5078, // Down payment + taxes + fees
//     totalTaxes: 1728,
//     totalFees: 350,
//     outTheDoorTotal: 29933,
//     totalCostOverTerm: 27998, // Monthly payment * 60 + down payment
//     totalInterestPaid: 2998
//   },
//   taxBreakdown: { ... },
//   disclaimer: '...',
//   calculatedAt: '2025-11-08T10:30:00Z'
// }
```

---

### `estimate.calculateLease`

Calculate lease payment estimate.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
  trimId?: string;
  zipCode: string;
  inputs: LeaseInputsSchema; // See schemas.md
}
```

**Output**:

```typescript
{
  estimateId: string;
  vehicleId: string;
  trimId?: string;
  type: 'lease';
  zipCode: string;
  inputs: LeaseInputsSchema;
  outputs: EstimateOutputsSchema;
  taxBreakdown: { ... };
  disclaimer: string;
  calculatedAt: Date;
}
```

**Behavior**:

- Calls `finance-engine` library with inputs
- Calculates monthly lease payment using residual value and money factor
- Returns total cost over lease term, due-at-signing

**Errors**:

- `BAD_REQUEST`: Invalid inputs (e.g., residual > 100%, money factor < 0)
- `NOT_FOUND`: Vehicle ID does not exist

**Example**:

```typescript
const { data } = trpc.estimate.calculateLease.useQuery({
  vehicleId: 'camry-2024',
  zipCode: '75080',
  inputs: {
    vehiclePrice: 28855,
    discounts: 1000,
    rebates: 500,
    downPayment: 2000,
    tradeInValue: 0,
    tradeInPayoff: 0,
    termMonths: 36,
    residualPercent: 60,
    moneyFactor: 0.00125,
    mileageCap: 12000,
  },
});

// Response:
// {
//   estimateId: '990i2844-...',
//   vehicleId: 'camry-2024',
//   type: 'lease',
//   zipCode: '75080',
//   inputs: { ... },
//   outputs: {
//     monthlyPayment: 325,
//     dueAtSigning: 4078, // Down payment + first month + fees
//     totalTaxes: 1728,
//     totalFees: 350,
//     outTheDoorTotal: 15778, // 36 * 325 + 4078 (lease-specific)
//     totalCostOverTerm: 15778,
//     totalInterestPaid: null
//   },
//   taxBreakdown: { ... },
//   disclaimer: '...',
//   calculatedAt: '2025-11-08T10:30:00Z'
// }
```

---

### `estimate.calculateFuelCost`

Calculate estimated fuel or energy cost.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  vehicleId: string;
  inputs: FuelEstimateInputSchema; // See schemas.md
}
```

**Output**:

```typescript
{
  vehicleId: string;
  fuelType: 'gas' | 'electric';
  monthlyCost: number;
  annualCost: number;
  assumptions: {
    pricePerUnit: number;
    annualMiles: number;
    mpgOrMpge: number;
  };
}
```

**Behavior**:

- Calls `finance-engine` library with inputs
- Calculates monthly and annual fuel/energy cost based on MPG/MPGe and price
- Returns itemized assumptions for transparency

**Errors**:

- `BAD_REQUEST`: Invalid inputs (e.g., negative price, zero MPG)
- `NOT_FOUND`: Vehicle ID does not exist

**Example**:

```typescript
const { data } = trpc.estimate.calculateFuelCost.useQuery({
  vehicleId: 'camry-2024',
  inputs: {
    fuelType: 'gas',
    pricePerUnit: 3.50,  // $/gallon
    annualMiles: 15000,
    mpgOrMpge: 52,
  },
});

// Response:
// {
//   vehicleId: 'camry-2024',
//   fuelType: 'gas',
//   monthlyCost: 84,      // (15000 / 52 * 3.50) / 12
//   annualCost: 1009,
//   assumptions: {
//     pricePerUnit: 3.50,
//     annualMiles: 15000,
//     mpgOrMpge: 52
//   }
// }
```

---

### `estimate.saveEstimate`

Save an estimate to user profile (authenticated users only).

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  estimate: {
    vehicleId: string;
    trimId?: string;
    type: 'cash' | 'finance' | 'lease';
    zipCode: string;
    inputs: CashInputsSchema | FinanceInputsSchema | LeaseInputsSchema;
    outputs: EstimateOutputsSchema;
  };
}
```

**Output**:

```typescript
{
  estimateId: string;
  savedAt: Date;
}
```

**Behavior**:

- Saves estimate to `userProfiles/{userId}.estimates[]`
- Returns estimate ID for future reference

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Invalid estimate data

**Example**:

```typescript
const { mutate } = trpc.estimate.saveEstimate.useMutation();

mutate({
  estimate: {
    vehicleId: 'camry-2024',
    type: 'finance',
    zipCode: '75080',
    inputs: { ... },
    outputs: { ... },
  },
});

// Response:
// {
//   estimateId: '880h1733-...',
//   savedAt: '2025-11-08T10:30:00Z'
// }
```

---

### `estimate.getSavedEstimates`

Get all saved estimates for authenticated user.

**Type**: `query`  
**Authentication**: Protected

**Input**: None

**Output**:

```typescript
{
  estimates: {
    id: string;
    vehicleId: string;
    trimId?: string;
    type: 'cash' | 'finance' | 'lease';
    zipCode: string;
    inputs: any;
    outputs: EstimateOutputsSchema;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
```

**Behavior**:

- Fetches `userProfiles/{userId}.estimates[]`
- Returns all saved estimates sorted by `updatedAt` descending

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { data } = trpc.estimate.getSavedEstimates.useQuery();

// Response:
// {
//   estimates: [
//     {
//       id: '880h1733-...',
//       vehicleId: 'camry-2024',
//       type: 'finance',
//       zipCode: '75080',
//       inputs: { ... },
//       outputs: { monthlyPayment: 382, ... },
//       createdAt: '2025-11-08T10:30:00Z',
//       updatedAt: '2025-11-08T10:30:00Z'
//     }
//   ]
// }
```

---

### `estimate.deleteEstimate`

Delete a saved estimate.

**Type**: `mutation`  
**Authentication**: Protected

**Input**:

```typescript
{
  estimateId: string;
}
```

**Output**:

```typescript
{
  success: boolean;
}
```

**Behavior**:

- Removes estimate from `userProfiles/{userId}.estimates[]`
- Returns success status

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `NOT_FOUND`: Estimate ID does not exist in user's profile

**Example**:

```typescript
const { mutate } = trpc.estimate.deleteEstimate.useMutation();

mutate({ estimateId: '880h1733-...' });

// Response:
// { success: true }
```

---

## Implementation Notes

- **Tax/Fee Calculation**: Uses ZIP-to-county lookup for accurate tax rates; falls back to state-level if ZIP unavailable
- **Disclaimers**: All estimates include non-binding disclaimer text (stored in config, not hardcoded)
- **Rounding**: All currency values rounded to 2 decimal places (cents)
- **Validation**: Finance-engine library validates inputs before calculation (e.g., APR < 30%, term in [12, 24, 36, 48, 60, 72])

## Related Files

- [Data Model: Estimate](../data-model.md#6-estimate)
- [Finance Engine Library](../../packages/finance-engine/README.md)
- [Shared Schemas](./schemas.md)
