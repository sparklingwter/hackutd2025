/**
 * Disclaimer Text Configuration
 * Central repository for all legal disclaimers and notices
 */

export const DISCLAIMERS = {
  /**
   * AI Recommendations Disclaimer
   * Used on recommendations page and discovery journey
   */
  aiRecommendations:
    "Vehicle recommendations are generated using artificial intelligence and are for informational purposes only. Actual availability, pricing, and specifications may vary. Please verify all details with an authorized Toyota dealer before making a purchase decision.",

  /**
   * Pricing Disclaimer
   * Used on estimate pages and pricing displays
   */
  pricing:
    "All prices shown are Manufacturer's Suggested Retail Price (MSRP) and exclude taxes, title, license, registration, documentation fees, and dealer charges. Actual transaction price may differ. Contact your local Toyota dealer for current pricing and incentives.",

  /**
   * Finance/Lease Disclaimer
   * Used on estimate calculator
   */
  financeEstimate:
    "Payment estimates are for illustrative purposes only and do not constitute a financing offer. Actual rates, terms, and monthly payments may vary based on creditworthiness, down payment, location, and dealer participation. All financing subject to credit approval.",

  /**
   * Lease Disclaimer
   * Used specifically for lease calculations
   */
  leaseEstimate:
    "Lease estimates are approximations based on typical lease programs and may not reflect current offers. Lease terms, residual values, money factors, and incentives vary by model, trim, location, and credit qualification. See dealer for actual lease programs.",

  /**
   * MPG/Fuel Economy Disclaimer
   * Used when displaying fuel economy data
   */
  fuelEconomy:
    "EPA-estimated fuel economy figures. Actual mileage will vary based on driving conditions, habits, vehicle condition, and other factors. Hybrid and electric vehicle range estimates are EPA-based and may vary significantly based on temperature, terrain, and usage patterns.",

  /**
   * Safety Ratings Disclaimer
   * Used when displaying safety information
   */
  safetyRatings:
    "Safety ratings are provided by NHTSA and IIHS and may not reflect all vehicle variants. Actual safety performance depends on many factors including proper maintenance, driving conditions, and use of safety features. See official safety rating websites for complete information.",

  /**
   * Comparison Disclaimer
   * Used on comparison pages
   */
  comparison:
    "Vehicle comparisons are based on publicly available data and specifications. Features, options, and specifications may vary by trim level and model year. Always verify specifications and availability with an authorized Toyota dealer.",

  /**
   * Dealer Contact Disclaimer
   * Used when submitting lead forms
   */
  dealerContact:
    "By submitting this form, you consent to be contacted by authorized Toyota dealers regarding your vehicle inquiry. Dealers are independent businesses and are responsible for their own sales practices. Your information will be shared only with dealers you select.",

  /**
   * Voice Synthesis Disclaimer
   * Used with voice features
   */
  voiceSynthesis:
    "Voice synthesis powered by ElevenLabs. Audio content is computer-generated and provided for convenience. Actual product information should be verified through written documentation or dealer consultation.",

  /**
   * AI Technology Disclosure
   * General AI usage notice
   */
  aiDisclosure:
    "This application uses artificial intelligence (Gemini by Google) to generate vehicle recommendations and explanations. AI-generated content is informational and should not be considered professional advice. Always verify critical information independently.",

  /**
   * Data Privacy Notice
   * Brief privacy statement
   */
  dataPrivacy:
    "Your preferences and saved selections are stored locally in your browser. We do not collect or store personal information without your explicit consent. See our Privacy Policy for complete details.",

  /**
   * Third-Party Data Disclaimer
   * Used for external data sources
   */
  thirdPartyData:
    "Vehicle specifications, pricing, and availability information are sourced from Toyota and other third-party sources. While we strive for accuracy, information may be outdated or incomplete. Verify all information with official Toyota sources or dealers.",

  /**
   * No Warranty Disclaimer
   * General limitation of liability
   */
  noWarranty:
    "This service is provided 'as is' without warranties of any kind. We make no guarantees regarding accuracy, completeness, or timeliness of information. Use of this service is at your own risk.",
} as const;

/**
 * Get formatted disclaimer for a specific context
 */
export function getDisclaimer(key: keyof typeof DISCLAIMERS): string {
  return DISCLAIMERS[key];
}

/**
 * Get multiple disclaimers combined
 */
export function getCombinedDisclaimers(keys: Array<keyof typeof DISCLAIMERS>): string {
  return keys.map((key) => DISCLAIMERS[key]).join("\n\n");
}
