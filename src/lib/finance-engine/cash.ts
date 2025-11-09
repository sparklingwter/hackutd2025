/**
 * Finance Engine - Cash Payment Calculation
 * 
 * Calculates out-the-door total for cash purchases including taxes and fees.
 */

import { calculateTaxesAndFees } from './taxes';

export interface CashInputs {
  vehiclePrice: number;
  zipCode: string;
  downPayment?: number;
  tradeInValue?: number;
  tradeInPayoff?: number;
  discounts?: number;
  rebates?: number;
}

export interface CashEstimateResult {
  vehiclePrice: number;
  discounts: number;
  rebates: number;
  adjustedPrice: number;
  tradeInValue: number;
  tradeInPayoff: number;
  tradeInEquity: number;
  salesTax: number;
  salesTaxRate: number;
  registrationFee: number;
  docFee: number;
  totalFees: number;
  outTheDoorTotal: number;
  amountDue: number;
  disclaimer: string;
}

/**
 * Calculate cash purchase estimate with full breakdown
 * 
 * @param inputs - Cash purchase parameters
 * @returns Detailed cash estimate
 */
export function calculateCashEstimate(inputs: CashInputs): CashEstimateResult {
  const {
    vehiclePrice,
    zipCode,
    downPayment = 0,
    tradeInValue = 0,
    tradeInPayoff = 0,
    discounts = 0,
    rebates = 0,
  } = inputs;

  // Calculate adjusted price after discounts and rebates
  const adjustedPrice = vehiclePrice - discounts - rebates;

  // Calculate trade-in equity (value minus payoff)
  const tradeInEquity = tradeInValue - tradeInPayoff;

  // Calculate taxes and fees on adjusted price
  const { salesTax, salesTaxRate, registrationFee, docFee, totalFees } = 
    calculateTaxesAndFees({ vehiclePrice: adjustedPrice, zipCode });

  // Out-the-door total = adjusted price + sales tax + fees
  const outTheDoorTotal = adjustedPrice + salesTax + totalFees;

  // Amount due at signing = out-the-door total - down payment - trade-in equity
  const amountDue = Math.max(0, outTheDoorTotal - downPayment - tradeInEquity);

  return {
    vehiclePrice,
    discounts,
    rebates,
    adjustedPrice,
    tradeInValue,
    tradeInPayoff,
    tradeInEquity,
    salesTax,
    salesTaxRate,
    registrationFee,
    docFee,
    totalFees,
    outTheDoorTotal,
    amountDue,
    disclaimer: 'This is an estimate only. Actual prices, taxes, and fees may vary. Please confirm with your dealer.',
  };
}
