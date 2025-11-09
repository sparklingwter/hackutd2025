/**
 * Finance Engine - Tax and Fee Calculation
 * 
 * Calculates sales tax, registration fees, and other fees based on ZIP code.
 * Uses state-level tax rates with ZIP code lookup for local taxes.
 */

interface TaxAndFeeResult {
  salesTax: number;
  salesTaxRate: number;
  registrationFee: number;
  docFee: number;
  totalFees: number;
}

interface TaxInputs {
  vehiclePrice: number;
  zipCode: string;
}

/**
 * State tax rates and fees (simplified for hackathon)
 * In production, this would be a comprehensive database or API lookup
 */
const STATE_TAX_DATA: Record<string, { taxRate: number; regFee: number; docFee: number }> = {
  // Texas (ZIP codes starting with 7, 75-79)
  TX: { taxRate: 0.0625, regFee: 150, docFee: 150 },
  // California
  CA: { taxRate: 0.0725, regFee: 200, docFee: 85 },
  // Florida
  FL: { taxRate: 0.06, regFee: 225, docFee: 100 },
  // New York
  NY: { taxRate: 0.04, regFee: 175, docFee: 75 },
  // Default (national average)
  DEFAULT: { taxRate: 0.065, regFee: 175, docFee: 100 },
};

/**
 * ZIP code to state mapping (simplified - only covers major states)
 * In production, use a proper ZIP code database or API
 */
function getStateFromZip(zipCode: string): string {
  const firstDigit = zipCode.charAt(0);
  const firstTwo = zipCode.substring(0, 2);

  // Texas: 75-79
  if (firstDigit === '7' && parseInt(firstTwo) >= 75 && parseInt(firstTwo) <= 79) {
    return 'TX';
  }
  // California: 90-96
  if (firstDigit === '9' && parseInt(firstTwo) >= 90 && parseInt(firstTwo) <= 96) {
    return 'CA';
  }
  // Florida: 32-34
  if (firstDigit === '3' && parseInt(firstTwo) >= 32 && parseInt(firstTwo) <= 34) {
    return 'FL';
  }
  // New York: 10-14
  if (firstDigit === '1' && parseInt(firstTwo) >= 10 && parseInt(firstTwo) <= 14) {
    return 'NY';
  }

  return 'DEFAULT';
}

/**
 * Calculate taxes and fees for a vehicle purchase
 * 
 * @param inputs - Vehicle price and ZIP code
 * @returns Tax and fee breakdown
 */
export function calculateTaxesAndFees(inputs: TaxInputs): TaxAndFeeResult {
  const state = getStateFromZip(inputs.zipCode);
  const taxData = STATE_TAX_DATA[state] ?? STATE_TAX_DATA.DEFAULT!;

  const salesTax = inputs.vehiclePrice * taxData.taxRate;
  const registrationFee = taxData.regFee;
  const docFee = taxData.docFee;
  const totalFees = registrationFee + docFee;

  return {
    salesTax,
    salesTaxRate: taxData.taxRate,
    registrationFee,
    docFee,
    totalFees,
  };
}

/**
 * Get estimated total cost including taxes and fees
 */
export function calculateOutTheDoorTotal(vehiclePrice: number, zipCode: string): number {
  const { salesTax, totalFees } = calculateTaxesAndFees({ vehiclePrice, zipCode });
  return vehiclePrice + salesTax + totalFees;
}
