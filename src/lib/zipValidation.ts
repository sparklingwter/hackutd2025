/**
 * ZIP Code Validation Utility
 * Provides validation and state detection for US ZIP codes
 */

// US State to ZIP code prefix mapping
const STATE_ZIP_RANGES: Record<string, { min: number; max: number; name: string }> = {
  AL: { min: 35000, max: 36999, name: "Alabama" },
  AK: { min: 99500, max: 99999, name: "Alaska" },
  AZ: { min: 85000, max: 86999, name: "Arizona" },
  AR: { min: 71600, max: 72999, name: "Arkansas" },
  CA: { min: 90000, max: 96199, name: "California" },
  CO: { min: 80000, max: 81999, name: "Colorado" },
  CT: { min: 6000, max: 6999, name: "Connecticut" },
  DE: { min: 19700, max: 19999, name: "Delaware" },
  FL: { min: 32000, max: 34999, name: "Florida" },
  GA: { min: 30000, max: 31999, name: "Georgia" },
  HI: { min: 96700, max: 96899, name: "Hawaii" },
  ID: { min: 83200, max: 83999, name: "Idaho" },
  IL: { min: 60000, max: 62999, name: "Illinois" },
  IN: { min: 46000, max: 47999, name: "Indiana" },
  IA: { min: 50000, max: 52999, name: "Iowa" },
  KS: { min: 66000, max: 67999, name: "Kansas" },
  KY: { min: 40000, max: 42999, name: "Kentucky" },
  LA: { min: 70000, max: 71599, name: "Louisiana" },
  ME: { min: 3900, max: 4999, name: "Maine" },
  MD: { min: 20600, max: 21999, name: "Maryland" },
  MA: { min: 1000, max: 2799, name: "Massachusetts" },
  MI: { min: 48000, max: 49999, name: "Michigan" },
  MN: { min: 55000, max: 56899, name: "Minnesota" },
  MS: { min: 38600, max: 39999, name: "Mississippi" },
  MO: { min: 63000, max: 65999, name: "Missouri" },
  MT: { min: 59000, max: 59999, name: "Montana" },
  NE: { min: 68000, max: 69999, name: "Nebraska" },
  NV: { min: 88900, max: 89999, name: "Nevada" },
  NH: { min: 3000, max: 3899, name: "New Hampshire" },
  NJ: { min: 7000, max: 8999, name: "New Jersey" },
  NM: { min: 87000, max: 88499, name: "New Mexico" },
  NY: { min: 10000, max: 14999, name: "New York" },
  NC: { min: 27000, max: 28999, name: "North Carolina" },
  ND: { min: 58000, max: 58999, name: "North Dakota" },
  OH: { min: 43000, max: 45999, name: "Ohio" },
  OK: { min: 73000, max: 74999, name: "Oklahoma" },
  OR: { min: 97000, max: 97999, name: "Oregon" },
  PA: { min: 15000, max: 19699, name: "Pennsylvania" },
  RI: { min: 2800, max: 2999, name: "Rhode Island" },
  SC: { min: 29000, max: 29999, name: "South Carolina" },
  SD: { min: 57000, max: 57999, name: "South Dakota" },
  TN: { min: 37000, max: 38599, name: "Tennessee" },
  TX: { min: 75000, max: 79999, name: "Texas" },
  UT: { min: 84000, max: 84999, name: "Utah" },
  VT: { min: 5000, max: 5999, name: "Vermont" },
  VA: { min: 22000, max: 24699, name: "Virginia" },
  WA: { min: 98000, max: 99499, name: "Washington" },
  WV: { min: 24700, max: 26999, name: "West Virginia" },
  WI: { min: 53000, max: 54999, name: "Wisconsin" },
  WY: { min: 82000, max: 83199, name: "Wyoming" },
  DC: { min: 20000, max: 20599, name: "Washington DC" },
};

export interface ZipValidationResult {
  isValid: boolean;
  state?: string;
  stateName?: string;
  error?: string;
  suggestion?: string;
}

/**
 * Validates a US ZIP code and returns state information
 * @param zipCode - 5-digit ZIP code string
 * @returns Validation result with state information or error
 */
export function validateZipCode(zipCode: string): ZipValidationResult {
  // Remove whitespace and validate format
  const cleaned = zipCode.trim();

  // Check if empty
  if (!cleaned) {
    return {
      isValid: false,
      error: "ZIP code is required",
    };
  }

  // Check format (5 digits)
  if (!/^\d{5}$/.test(cleaned)) {
    return {
      isValid: false,
      error: "ZIP code must be exactly 5 digits",
      suggestion: "Please enter a valid 5-digit ZIP code (e.g., 75001)",
    };
  }

  const zipNumber = parseInt(cleaned, 10);

  // Find matching state
  for (const [stateCode, range] of Object.entries(STATE_ZIP_RANGES)) {
    if (zipNumber >= range.min && zipNumber <= range.max) {
      return {
        isValid: true,
        state: stateCode,
        stateName: range.name,
      };
    }
  }

  // ZIP code doesn't match any known state range
  return {
    isValid: false,
    error: "ZIP code not recognized",
    suggestion:
      "This ZIP code is not in our database. Please verify the ZIP code or use a nearby location.",
  };
}

/**
 * Gets the state code from a ZIP code
 * @param zipCode - 5-digit ZIP code string
 * @returns State code (e.g., "TX") or null if invalid
 */
export function getStateFromZip(zipCode: string): string | null {
  const result = validateZipCode(zipCode);
  return result.isValid && result.state ? result.state : null;
}

/**
 * Gets the full state name from a ZIP code
 * @param zipCode - 5-digit ZIP code string
 * @returns State name (e.g., "Texas") or null if invalid
 */
export function getStateNameFromZip(zipCode: string): string | null {
  const result = validateZipCode(zipCode);
  return result.isValid && result.stateName ? result.stateName : null;
}

/**
 * Formats error message with state-level fallback
 * @param zipCode - 5-digit ZIP code string
 * @returns User-friendly error message
 */
export function formatZipError(zipCode: string): string {
  const result = validateZipCode(zipCode);
  
  if (result.isValid) {
    return "";
  }

  if (result.error && result.suggestion) {
    return `${result.error}. ${result.suggestion}`;
  }

  return result.error ?? "Invalid ZIP code";
}
