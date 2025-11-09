/**
 * Finance Engine - Auto Loan Calculation
 * 
 * Calculates monthly payments, total interest, and amortization for auto loans.
 */

import { calculateTaxesAndFees } from './taxes';

export interface FinanceInputs {
  vehiclePrice: number;
  zipCode: string;
  downPayment?: number;
  tradeInValue?: number;
  tradeInPayoff?: number;
  discounts?: number;
  rebates?: number;
  termMonths: number;
  apr: number; // Annual Percentage Rate (e.g., 5.99 for 5.99%)
}

export interface FinanceEstimateResult {
  vehiclePrice: number;
  discounts: number;
  rebates: number;
  adjustedPrice: number;
  tradeInValue: number;
  tradeInPayoff: number;
  tradeInEquity: number;
  downPayment: number;
  salesTax: number;
  salesTaxRate: number;
  registrationFee: number;
  docFee: number;
  totalFees: number;
  outTheDoorTotal: number;
  amountFinanced: number;
  termMonths: number;
  apr: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterestPaid: number;
  totalCostOverTerm: number;
  dueAtSigning: number;
  disclaimer: string;
}

/**
 * Calculate monthly payment using standard amortization formula
 * 
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * - M = monthly payment
 * - P = principal (amount financed)
 * - r = monthly interest rate (APR / 12 / 100)
 * - n = number of months
 */
function calculateMonthlyPayment(principal: number, apr: number, termMonths: number): number {
  if (apr === 0) {
    // No interest - simple division
    return principal / termMonths;
  }

  const monthlyRate = apr / 12 / 100;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;

  return numerator / denominator;
}

/**
 * Calculate auto loan estimate with full breakdown
 * 
 * @param inputs - Finance parameters
 * @returns Detailed finance estimate
 */
export function calculateFinanceEstimate(inputs: FinanceInputs): FinanceEstimateResult {
  const {
    vehiclePrice,
    zipCode,
    downPayment = 0,
    tradeInValue = 0,
    tradeInPayoff = 0,
    discounts = 0,
    rebates = 0,
    termMonths,
    apr,
  } = inputs;

  // Calculate adjusted price after discounts and rebates
  const adjustedPrice = vehiclePrice - discounts - rebates;

  // Calculate trade-in equity
  const tradeInEquity = tradeInValue - tradeInPayoff;

  // Calculate taxes and fees on adjusted price
  const { salesTax, salesTaxRate, registrationFee, docFee, totalFees } = 
    calculateTaxesAndFees({ vehiclePrice: adjustedPrice, zipCode });

  // Out-the-door total
  const outTheDoorTotal = adjustedPrice + salesTax + totalFees;

  // Amount to finance = out-the-door total - down payment - trade-in equity
  const amountFinanced = Math.max(0, outTheDoorTotal - downPayment - tradeInEquity);

  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(amountFinanced, apr, termMonths);

  // Total payments over loan term
  const totalPayments = monthlyPayment * termMonths;

  // Total interest paid
  const totalInterestPaid = totalPayments - amountFinanced;

  // Total cost = down payment + trade-in equity + total payments
  const totalCostOverTerm = downPayment + tradeInEquity + totalPayments;

  // Due at signing = down payment + fees (if not rolled into loan)
  // Simplified: assume all fees/taxes are financed
  const dueAtSigning = downPayment;

  return {
    vehiclePrice,
    discounts,
    rebates,
    adjustedPrice,
    tradeInValue,
    tradeInPayoff,
    tradeInEquity,
    downPayment,
    salesTax,
    salesTaxRate,
    registrationFee,
    docFee,
    totalFees,
    outTheDoorTotal,
    amountFinanced,
    termMonths,
    apr,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100, // Round to cents
    totalPayments: Math.round(totalPayments * 100) / 100,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalCostOverTerm: Math.round(totalCostOverTerm * 100) / 100,
    dueAtSigning,
    disclaimer: 'This is an estimate only. Actual rates, terms, and payments may vary based on credit approval. Please confirm with your dealer and lender.',
  };
}
