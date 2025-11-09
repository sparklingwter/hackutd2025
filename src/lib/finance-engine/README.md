# Finance Engine Library

## Overview

The Finance Engine is a TypeScript library for calculating accurate vehicle purchase costs, financing payments, lease payments, taxes/fees, and fuel expenses. All calculations are ZIP code-aware for state-specific tax rates and include appropriate legal disclaimers.

**Version:** 1.0.0  
**Location:** `src/lib/finance-engine/`

## Features

- ✅ **Cash Purchase** - Out-the-door total with tax breakdown
- ✅ **Auto Loan Financing** - Monthly payment with amortization schedule
- ✅ **Lease Calculation** - Monthly lease payment with residual value
- ✅ **Tax & Fee Calculation** - State-specific rates by ZIP code
- ✅ **Fuel Cost Estimation** - Compare fuel costs across vehicles
- ✅ **Trade-in Handling** - Account for trade-in value and payoff
- ✅ **Discount & Rebate** - Apply manufacturer incentives

## Installation

No installation required - this library is part of the monorepo:

```typescript
import { calculateCashEstimate, calculateFinanceEstimate } from '~/lib/finance-engine';
```

## Quick Start

### Cash Purchase Estimate

```typescript
import { calculateCashEstimate } from '~/lib/finance-engine';

const estimate = calculateCashEstimate({
  vehiclePrice: 28000,
  zipCode: '75080',
  downPayment: 5000,
  tradeInValue: 8000,
  tradeInPayoff: 3000, // Amount owed on trade-in
  discounts: 1000,
  rebates: 500,
});

console.log(`Out-the-door total: $${estimate.outTheDoorTotal.toFixed(2)}`);
console.log(`Amount due: $${estimate.amountDue.toFixed(2)}`);
console.log(`Sales tax: $${estimate.salesTax.toFixed(2)} (${estimate.salesTaxRate}%)`);
```

### Auto Loan Financing

```typescript
import { calculateFinanceEstimate } from '~/lib/finance-engine';

const estimate = calculateFinanceEstimate({
  vehiclePrice: 28000,
  zipCode: '75080',
  downPayment: 5000,
  termMonths: 60, // 5 years
  apr: 6.5, // 6.5% APR
});

console.log(`Monthly payment: $${estimate.monthlyPayment.toFixed(2)}`);
console.log(`Total interest: $${estimate.totalInterestPaid.toFixed(2)}`);
console.log(`Total cost: $${estimate.totalCostOverTerm.toFixed(2)}`);
```

### Lease Calculation

```typescript
import { calculateLeaseEstimate } from '~/lib/finance-engine';

const estimate = calculateLeaseEstimate({
  vehiclePrice: 28000,
  zipCode: '75080',
  capCostReduction: 2000, // Down payment equivalent
  residualPercent: 60, // Expected value at lease end
  moneyFactor: 0.00125, // Lease rate (APR / 2400)
  termMonths: 36, // 3 years
  annualMileage: 12000,
});

console.log(`Monthly payment: $${estimate.monthlyPayment.toFixed(2)}`);
console.log(`Due at signing: $${estimate.dueAtSigning.toFixed(2)}`);
console.log(`Total lease cost: $${estimate.totalCostOverTerm.toFixed(2)}`);
```

## API Reference

### Cash Calculations

#### `calculateCashEstimate(inputs: CashInputs): CashEstimateResult`

Calculates the total out-the-door cost for a cash purchase.

**Parameters:**

```typescript
interface CashInputs {
  vehiclePrice: number;       // Base MSRP
  zipCode: string;            // 5-digit ZIP for tax calculation
  downPayment?: number;       // Cash down (reduces amount due)
  tradeInValue?: number;      // Trade-in vehicle value
  tradeInPayoff?: number;     // Amount owed on trade-in
  discounts?: number;         // Dealer discounts
  rebates?: number;           // Manufacturer rebates/incentives
}
```

**Returns:**

```typescript
interface CashEstimateResult {
  vehiclePrice: number;       // Original MSRP
  discounts: number;          // Total discounts applied
  rebates: number;            // Total rebates applied
  adjustedPrice: number;      // Price after discounts/rebates
  tradeInValue: number;       // Trade-in value
  tradeInPayoff: number;      // Amount owed on trade-in
  tradeInEquity: number;      // Net trade-in credit
  salesTax: number;           // State/local sales tax amount
  salesTaxRate: number;       // Tax rate percentage
  registrationFee: number;    // State registration fee
  docFee: number;             // Dealer documentation fee
  totalFees: number;          // Sum of all fees
  outTheDoorTotal: number;    // Final amount to pay
  amountDue: number;          // Amount due after down/trade-in
  disclaimer: string;         // Legal disclaimer text
}
```

### Finance Calculations

#### `calculateFinanceEstimate(inputs: FinanceInputs): FinanceEstimateResult`

Calculates monthly payment and total cost for an auto loan.

**Parameters:**

```typescript
interface FinanceInputs {
  vehiclePrice: number;       // Base MSRP
  zipCode: string;            // 5-digit ZIP for tax calculation
  downPayment?: number;       // Cash down payment
  tradeInValue?: number;      // Trade-in vehicle value
  tradeInPayoff?: number;     // Amount owed on trade-in
  discounts?: number;         // Dealer discounts
  rebates?: number;           // Manufacturer rebates
  termMonths: number;         // Loan duration (12-84 months)
  apr: number;                // Annual percentage rate (e.g., 6.5 for 6.5%)
}
```

**Returns:**

```typescript
interface FinanceEstimateResult extends CashEstimateResult {
  amountFinanced: number;     // Principal loan amount
  termMonths: number;         // Loan term
  apr: number;                // Interest rate
  monthlyPayment: number;     // Fixed monthly payment
  totalPayments: number;      // Total of all payments
  totalInterestPaid: number;  // Interest portion only
  totalCostOverTerm: number;  // Total paid (principal + interest)
  dueAtSigning: number;       // Down payment + upfront fees
}
```

**Loan Term Validation:**
- Minimum: 12 months
- Maximum: 84 months (7 years)
- Common terms: 24, 36, 48, 60, 72, 84 months

**APR Validation:**
- Maximum: 30% (enforced by tRPC router)
- Typical range: 3-10% for good credit

### Lease Calculations

#### `calculateLeaseEstimate(inputs: LeaseInputs): LeaseEstimateResult`

Calculates monthly lease payment and total lease cost.

**Parameters:**

```typescript
interface LeaseInputs {
  vehiclePrice: number;       // Base MSRP
  zipCode: string;            // 5-digit ZIP for tax calculation
  capCostReduction?: number;  // Capitalized cost reduction (down payment)
  residualPercent: number;    // Expected value at lease end (40-70%)
  moneyFactor: number;        // Lease rate (APR ÷ 2400)
  termMonths: number;         // Lease term (24,36,39,48 months)
  annualMileage: number;      // Yearly mileage cap (7500,10000,12000,15000)
}
```

**Returns:**

```typescript
interface LeaseEstimateResult {
  vehiclePrice: number;       // Original MSRP
  capCostReduction: number;   // Down payment equivalent
  residualValue: number;      // Calculated end-of-lease value
  residualPercent: number;    // Residual percentage
  moneyFactor: number;        // Lease rate
  termMonths: number;         // Lease duration
  annualMileage: number;      // Mileage cap
  monthlyDepreciation: number;// Depreciation portion of payment
  monthlyFinanceCharge: number;// Interest portion of payment
  monthlyPayment: number;     // Total monthly payment
  dueAtSigning: number;       // Upfront payment + fees
  totalCostOverTerm: number;  // Total paid over lease
  disclaimer: string;         // Lease disclaimer with mileage terms
}
```

**Money Factor Conversion:**
```typescript
// Convert APR to money factor
moneyFactor = apr / 2400;

// Example: 6% APR
moneyFactor = 6.0 / 2400 = 0.0025;
```

### Tax & Fee Calculations

#### `calculateTaxesAndFees(inputs: TaxInputs): TaxBreakdown`

Calculates state-specific taxes and fees based on ZIP code.

**Parameters:**

```typescript
interface TaxInputs {
  vehiclePrice: number;       // Taxable vehicle price
  zipCode: string;            // 5-digit ZIP code
}
```

**Returns:**

```typescript
interface TaxBreakdown {
  salesTax: number;           // State/local sales tax amount
  salesTaxRate: number;       // Tax rate percentage
  registrationFee: number;    // State registration fee
  docFee: number;             // Dealer documentation fee
  totalFees: number;          // Sum of all fees
}
```

**State Tax Rates:**

The library includes hardcoded tax rates for all 50 states:

```typescript
// Example state tax rates
const TAX_RATES = {
  TX: 6.25,   // Texas
  CA: 7.25,   // California
  FL: 6.00,   // Florida
  NY: 4.00,   // New York
  // ... all 50 states
};
```

**Fee Structure:**

```typescript
// Default fees (can be customized per state)
const FEES = {
  registration: 75,    // Base registration fee
  docFee: 150,        // Dealer documentation fee
};
```

### Fuel Cost Calculations

#### `calculateFuelCost(inputs: FuelCostInputs): FuelCostEstimate`

Estimates annual and monthly fuel costs based on driving habits.

**Parameters:**

```typescript
interface FuelCostInputs {
  annualMileage: number;      // Miles driven per year
  mpg?: number;               // Gas vehicle MPG (if applicable)
  mpgE?: number;              // Electric vehicle MPGe (if applicable)
  fuelType: 'gas' | 'electric' | 'hybrid' | 'plugin-hybrid';
  gasPricePerGallon?: number; // Current gas price (default: $3.50)
  electricityPricePerKWh?: number; // Electricity rate (default: $0.14)
}
```

**Returns:**

```typescript
interface FuelCostEstimate {
  annualCost: number;         // Yearly fuel expense
  monthlyCost: number;        // Monthly fuel expense
  costPerMile: number;        // Cost per mile driven
  fuelType: string;           // Fuel type
  assumptions: {
    annualMileage: number;
    mpg?: number;
    gasPricePerGallon?: number;
    electricityPricePerKWh?: number;
  };
  disclaimer: string;         // Fuel cost disclaimer
}
```

#### `compareFuelCosts(vehicles: FuelCostInputs[]): FuelCostComparison`

Compares fuel costs across multiple vehicles.

**Parameters:**

Array of `FuelCostInputs` objects (one per vehicle to compare).

**Returns:**

```typescript
interface FuelCostComparison {
  vehicles: FuelCostEstimate[];  // Individual estimates
  lowestAnnualCost: number;      // Best annual cost
  highestAnnualCost: number;     // Worst annual cost
  avgAnnualCost: number;         // Average annual cost
  savings: {
    mostEfficientVsLeast: number; // Savings potential
  };
}
```

## Constants

The library exports useful constants:

```typescript
import { CONSTANTS } from '~/lib/finance-engine';

// Default values
CONSTANTS.DEFAULT_DOWN_PAYMENT_PERCENT;  // 0.2 (20%)
CONSTANTS.DEFAULT_FINANCE_TERM_MONTHS;   // 60 (5 years)
CONSTANTS.DEFAULT_LEASE_TERM_MONTHS;     // 36 (3 years)
CONSTANTS.DEFAULT_MILEAGE_CAP;           // 12000 miles/year

// Validation ranges
CONSTANTS.MIN_TERM_MONTHS;               // 12
CONSTANTS.MAX_FINANCE_TERM_MONTHS;       // 84
CONSTANTS.MAX_LEASE_TERM_MONTHS;         // 48

// Fuel price defaults
CONSTANTS.NATIONAL_AVG_GAS_PRICE;        // $3.50/gallon
CONSTANTS.NATIONAL_AVG_ELECTRIC_PRICE;   // $0.14/kWh
CONSTANTS.KWH_PER_GALLON_EQUIVALENT;     // 33.7
```

## Error Handling

All functions return results directly - validation should be done at the tRPC router level:

```typescript
// Example validation in tRPC router
if (input.apr > 30) {
  throw new Error("BAD_REQUEST: APR cannot exceed 30%");
}

if (![12, 24, 36, 48, 60, 72, 84].includes(input.termMonths)) {
  throw new Error("BAD_REQUEST: Invalid loan term");
}
```

## Disclaimers

All estimate results include a `disclaimer` field with appropriate legal text:

**Cash Estimate:**
```
This is an estimate only. Actual prices, taxes, and fees may vary. 
Please confirm with your dealer.
```

**Finance Estimate:**
```
This is an estimate only. Actual loan terms, rates, and payments may vary 
based on credit approval. Please confirm with your lender.
```

**Lease Estimate:**
```
This is an estimate only. Actual lease terms and payments may vary. 
Excess mileage charges may apply (typically $0.15-$0.25/mile over cap). 
Please confirm with your dealer.
```

**Fuel Estimate:**
```
Fuel cost estimates are based on average prices and driving conditions. 
Actual costs will vary based on local fuel prices, driving habits, and 
vehicle condition.
```

## Testing

### Unit Tests

```bash
# Run finance-engine tests
npm test -- finance-engine
```

### Manual Testing

Use the tRPC playground or Postman to test calculations:

```typescript
// Example tRPC query
const estimate = await trpc.estimate.calculateFinance.query({
  vehicleId: "camry-2024",
  zipCode: "75080",
  inputs: {
    vehiclePrice: 28000,
    downPayment: 5000,
    termMonths: 60,
    apr: 6.5
  }
});
```

## Integration with tRPC

The finance-engine is consumed by the estimate router:

```typescript
// src/server/api/routers/estimate.ts
import { calculateFinanceEstimate } from '~/lib/finance-engine';

export const estimateRouter = createTRPCRouter({
  calculateFinance: publicProcedure
    .input(FinanceInputsSchema)
    .query(async ({ input }) => {
      const result = calculateFinanceEstimate(input.inputs);
      return {
        estimateId: uuidv4(),
        vehicleId: input.vehicleId,
        outputs: result,
        // ...
      };
    }),
});
```

## Future Enhancements

- [ ] Real-time tax rate API integration (replace hardcoded rates)
- [ ] Support for multiple states with local tax rates
- [ ] Gap insurance and warranty cost estimation
- [ ] Credit score-based APR estimation
- [ ] EV charging cost calculator with time-of-use rates
- [ ] Lease-end buyout calculation
- [ ] Export estimates to PDF

## Contributing

When modifying the finance-engine:

1. Update type definitions in each module
2. Add JSDoc comments for new functions
3. Update this README with usage examples
4. Add unit tests for new calculations
5. Verify accuracy against industry calculators

## References

- [Edmunds Finance Calculator](https://www.edmunds.com/calculators/)
- [IRS Standard Mileage Rates](https://www.irs.gov/tax-professionals/standard-mileage-rates)
- [EPA Fuel Economy](https://www.fueleconomy.gov/)
- [DMV Registration Fee Schedules](https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/)

## License

MIT - Part of hackutd2025 monorepo

## Support

For questions or issues, contact the development team or file an issue in the GitHub repository.
