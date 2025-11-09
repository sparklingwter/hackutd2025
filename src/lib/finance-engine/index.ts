/**
 * Finance Engine - Main Exports
 * 
 * Provides all finance calculation functions for cash, finance, lease,
 * taxes/fees, and fuel costs.
 */

// Cash calculations
export { calculateCashEstimate, type CashInputs, type CashEstimateResult } from './cash';

// Finance calculations
export {
  calculateFinanceEstimate,
  type FinanceInputs,
  type FinanceEstimateResult,
} from './finance';

// Lease calculations
export { calculateLeaseEstimate, type LeaseInputs, type LeaseEstimateResult } from './lease';

// Tax and fee calculations
export {
  calculateTaxesAndFees,
  calculateOutTheDoorTotal,
} from './taxes';

// Fuel cost calculations
export {
  calculateFuelCost,
  compareFuelCosts,
  type FuelCostInputs,
  type FuelCostEstimate,
} from './fuel';

/**
 * Finance engine library version
 */
export const VERSION = '1.0.0';

/**
 * Library constants
 */
export const CONSTANTS = {
  // Default values
  DEFAULT_DOWN_PAYMENT_PERCENT: 0.2, // 20%
  DEFAULT_FINANCE_TERM_MONTHS: 60, // 5 years
  DEFAULT_LEASE_TERM_MONTHS: 36, // 3 years
  DEFAULT_MILEAGE_CAP: 12000, // 12k miles/year
  
  // Ranges
  MIN_TERM_MONTHS: 12,
  MAX_FINANCE_TERM_MONTHS: 84, // 7 years
  MAX_LEASE_TERM_MONTHS: 48, // 4 years
  
  // Gas prices (national averages for reference)
  NATIONAL_AVG_GAS_PRICE: 3.50, // $/gallon
  NATIONAL_AVG_ELECTRIC_PRICE: 0.14, // $/kWh
  
  // EPA equivalency
  KWH_PER_GALLON_EQUIVALENT: 33.7,
} as const;
