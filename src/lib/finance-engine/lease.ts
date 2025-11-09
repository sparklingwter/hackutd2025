/**
 * Finance Engine - Auto Lease Calculation
 * 
 * Calculates monthly lease payments using residual value and money factor.
 */

import { calculateTaxesAndFees } from './taxes';

export interface LeaseInputs {
  vehiclePrice: number; // MSRP or negotiated cap cost
  zipCode: string;
  downPayment?: number; // Capitalized cost reduction
  tradeInValue?: number;
  tradeInPayoff?: number;
  discounts?: number;
  rebates?: number;
  termMonths: number; // Typically 24, 36, or 48 months
  residualPercent: number; // Percentage of MSRP (e.g., 60 for 60%)
  moneyFactor: number; // Lease rate (e.g., 0.00125)
  mileageCap: number; // Annual mileage limit (e.g., 10000, 12000, 15000)
}

export interface LeaseEstimateResult {
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
  capCost: number; // Capitalized cost (adjusted price)
  capCostReduction: number; // Down payment + trade-in equity
  adjustedCapCost: number; // Cap cost after reduction
  residualPercent: number;
  residualValue: number;
  moneyFactor: number;
  equivalentAPR: number; // Money factor * 2400
  termMonths: number;
  mileageCap: number;
  totalMileage: number; // mileageCap * (termMonths / 12)
  depreciationPayment: number; // (Adjusted cap cost - residual) / term
  financePayment: number; // (Adjusted cap cost + residual) * money factor
  monthlyPayment: number; // Depreciation + finance + tax
  totalLeasePayments: number;
  dueAtSigning: number; // Down payment + first month + fees
  totalCostOverTerm: number;
  disclaimer: string;
}

/**
 * Calculate lease estimate with full breakdown
 * 
 * Lease Payment Formula:
 * Monthly Payment = Depreciation Payment + Finance Payment + Tax
 * 
 * Depreciation Payment = (Adjusted Cap Cost - Residual Value) / Term
 * Finance Payment = (Adjusted Cap Cost + Residual Value) * Money Factor
 * 
 * @param inputs - Lease parameters
 * @returns Detailed lease estimate
 */
export function calculateLeaseEstimate(inputs: LeaseInputs): LeaseEstimateResult {
  const {
    vehiclePrice,
    zipCode,
    downPayment = 0,
    tradeInValue = 0,
    tradeInPayoff = 0,
    discounts = 0,
    rebates = 0,
    termMonths,
    residualPercent,
    moneyFactor,
    mileageCap,
  } = inputs;

  // Calculate adjusted price after discounts and rebates
  const adjustedPrice = vehiclePrice - discounts - rebates;

  // Calculate trade-in equity
  const tradeInEquity = tradeInValue - tradeInPayoff;

  // Capitalized cost = adjusted price (what you're leasing)
  const capCost = adjustedPrice;

  // Capitalized cost reduction = down payment + trade-in equity
  const capCostReduction = downPayment + tradeInEquity;

  // Adjusted capitalized cost = cap cost - cap cost reduction
  const adjustedCapCost = capCost - capCostReduction;

  // Residual value = vehicle price * residual percent
  const residualValue = vehiclePrice * (residualPercent / 100);

  // Calculate taxes and fees
  const { salesTaxRate, registrationFee, docFee, totalFees } = 
    calculateTaxesAndFees({ vehiclePrice: adjustedPrice, zipCode });

  // Depreciation payment = (adjusted cap cost - residual) / term
  const depreciationPayment = (adjustedCapCost - residualValue) / termMonths;

  // Finance payment = (adjusted cap cost + residual) * money factor
  const financePayment = (adjustedCapCost + residualValue) * moneyFactor;

  // Base monthly payment = depreciation + finance
  const baseMonthlyPayment = depreciationPayment + financePayment;

  // Monthly tax on lease payment (varies by state - simplified)
  const monthlyTax = baseMonthlyPayment * salesTaxRate;

  // Total monthly payment including tax
  const monthlyPayment = baseMonthlyPayment + monthlyTax;

  // Total lease payments over term
  const totalLeasePayments = monthlyPayment * termMonths;

  // Due at signing = down payment + first month + fees
  const dueAtSigning = downPayment + monthlyPayment + totalFees;

  // Total cost = due at signing + remaining payments
  const totalCostOverTerm = dueAtSigning + (monthlyPayment * (termMonths - 1));

  // Total mileage allowed over lease term
  const totalMileage = mileageCap * (termMonths / 12);

  // Convert money factor to equivalent APR (money factor * 2400)
  const equivalentAPR = moneyFactor * 2400;

  return {
    vehiclePrice,
    discounts,
    rebates,
    adjustedPrice,
    tradeInValue,
    tradeInPayoff,
    tradeInEquity,
    downPayment,
    salesTax: monthlyTax * termMonths,
    salesTaxRate,
    registrationFee,
    docFee,
    totalFees,
    capCost,
    capCostReduction,
    adjustedCapCost,
    residualPercent,
    residualValue: Math.round(residualValue * 100) / 100,
    moneyFactor,
    equivalentAPR: Math.round(equivalentAPR * 100) / 100,
    termMonths,
    mileageCap,
    totalMileage,
    depreciationPayment: Math.round(depreciationPayment * 100) / 100,
    financePayment: Math.round(financePayment * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalLeasePayments: Math.round(totalLeasePayments * 100) / 100,
    dueAtSigning: Math.round(dueAtSigning * 100) / 100,
    totalCostOverTerm: Math.round(totalCostOverTerm * 100) / 100,
    disclaimer: 'This is a lease estimate only. Actual lease terms, money factor, and residual values are subject to lessor approval and market conditions. Excess mileage charges may apply. Please confirm with your dealer.',
  };
}
