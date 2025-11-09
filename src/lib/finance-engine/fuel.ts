/**
 * Finance Engine - Fuel Cost Estimation
 * 
 * Calculates fuel/energy costs for gas and electric vehicles.
 */

export interface FuelCostInputs {
  fuelType: 'gas' | 'electric';
  mpgOrMpge: number; // MPG for gas, MPGe for electric
  annualMiles: number; // Annual mileage
  pricePerUnit: number; // $/gallon for gas, $/kWh for electric
}

export interface FuelCostEstimate {
  fuelType: 'gas' | 'electric';
  mpgOrMpge: number;
  annualMiles: number;
  pricePerUnit: number;
  unitsPerYear: number; // Gallons or kWh per year
  monthlyCost: number;
  annualCost: number;
  costPerMile: number;
}

/**
 * Calculate fuel/energy costs
 * 
 * For gas vehicles:
 * - Units = Annual Miles / MPG (gallons per year)
 * - Cost = Units * Price per Gallon
 * 
 * For electric vehicles:
 * - kWh per mile = 33.7 / MPGe (EPA equivalency: 33.7 kWh = 1 gallon gas)
 * - Units = Annual Miles * kWh per mile (kWh per year)
 * - Cost = Units * Price per kWh
 * 
 * @param inputs - Fuel cost parameters
 * @returns Fuel cost estimate
 */
export function calculateFuelCost(inputs: FuelCostInputs): FuelCostEstimate {
  const { fuelType, mpgOrMpge, annualMiles, pricePerUnit } = inputs;

  let unitsPerYear: number;

  if (fuelType === 'gas') {
    // Gallons per year = annual miles / MPG
    unitsPerYear = annualMiles / mpgOrMpge;
  } else {
    // Electric: kWh per year
    // kWh per mile = 33.7 / MPGe (EPA equivalency)
    const kWhPerMile = 33.7 / mpgOrMpge;
    unitsPerYear = annualMiles * kWhPerMile;
  }

  // Annual cost = units * price per unit
  const annualCost = unitsPerYear * pricePerUnit;

  // Monthly cost = annual cost / 12
  const monthlyCost = annualCost / 12;

  // Cost per mile = annual cost / annual miles
  const costPerMile = annualCost / annualMiles;

  return {
    fuelType,
    mpgOrMpge,
    annualMiles,
    pricePerUnit,
    unitsPerYear: Math.round(unitsPerYear * 100) / 100,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    annualCost: Math.round(annualCost * 100) / 100,
    costPerMile: Math.round(costPerMile * 10000) / 10000, // Round to 4 decimal places
  };
}

/**
 * Calculate fuel cost savings comparison between two vehicles
 * 
 * @param vehicle1 - First vehicle fuel parameters
 * @param vehicle2 - Second vehicle fuel parameters
 * @returns Savings comparison
 */
export function compareFuelCosts(
  vehicle1: FuelCostInputs,
  vehicle2: FuelCostInputs
): {
  vehicle1Cost: FuelCostEstimate;
  vehicle2Cost: FuelCostEstimate;
  monthlySavings: number;
  annualSavings: number;
  savingsPercent: number;
} {
  const vehicle1Cost = calculateFuelCost(vehicle1);
  const vehicle2Cost = calculateFuelCost(vehicle2);

  const monthlySavings = vehicle1Cost.monthlyCost - vehicle2Cost.monthlyCost;
  const annualSavings = vehicle1Cost.annualCost - vehicle2Cost.annualCost;
  const savingsPercent = (annualSavings / vehicle1Cost.annualCost) * 100;

  return {
    vehicle1Cost,
    vehicle2Cost,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
}
