/**
 * Image Mapper Utility
 * Maps vehicle information to local image files in public/CarImages
 */

// Available images in public/CarImages (based on actual filenames)
const AVAILABLE_IMAGES: Record<string, string[]> = {
  "Camry": [
    "Toyota Camry black.png",
    "Toyota Camry SE red.png",
    "Toyota Camry silver.png",
    "Toyota Camry white.png",
  ],
  "Corolla": [
    "Toyota Corolla gray.png",
    "Toyota Corolla red.png",
    "Toyota Corolla silver.png",
    "Toyota Corolla white.png",
  ],
  "Corolla Hybrid": [
    "Toyota Corolla Hybrid SE black.png",
    "Toyota Corolla Hybrid SE blue.png",
    "Toyota Corolla Hybrid SE red.png",
    "Toyota Corolla Hybrid SE white.png",
  ],
  "Crown": [
    "Toyota Crown black.png",
    "Toyota Crown gray.png",
    "Toyota Crown red.png",
    "Toyota Crown silver.png",
  ],
  "GR Supra": [
    "Toyota GR Supra black.png",
    "Toyota GR Supra blue.png",
    "Toyota GR Supra red.png",
    "Toyota GR Supra white.png",
  ],
  "GR86": [
    "Toyota GR86 black.png",
    "Toyota GR86 red.png",
    "Toyota GR86 silver.png",
    "Toyota GR86 white.png",
  ],
  "Highlander": [
    "Toyota Highlander black.png",
    "Toyota Highlander gray.png",
    "Toyota Highlander red.png",
    "Toyota Highlander white.png",
  ],
  "Prius": [
    "Toyota Prius black.png",
    "Toyota Prius gray.png",
    "Toyota Prius red.png",
    "Toyota Prius white.png",
  ],
  "RAV4": [
    "Toyota RAV4 black.png",
    "Toyota RAV4 blue.png",
    "Toyota RAV4 gray.png",
    "Toyota RAV4 Limited red.png",
    "Toyota RAV4 Limited white.png",
    "Toyota RAV4 red.png",
    "Toyota RAV4 white.png",
    "Toyota RAV4 XLE gray.png",
  ],
  "Sequoia": [
    "Toyota Sequoia black.png",
    "Toyota Sequoia Limited.png",
    "Toyota Sequoia red.png",
    "Toyota Sequoia silver.png",
    "Toyota Sequoia SR5.png",
    "Toyota Sequoia TRD Pro.png",
    "Toyota Sequoia TRD Sport.png",
    "Toyota Sequoia white.png",
  ],
  "Sienna": [
    "Toyota Sienna black.png",
    "Toyota Sienna blue.png",
    "Toyota Sienna red.png",
    "Toyota Sienna white.png",
  ],
  "Tacoma": [
    "Toyota Tacoma Trailhunter black.png",
    "Toyota Tacoma TRD Off-Road white.png",
    "Toyota Tacoma TRD Sport blue.png",
  ],
  "Tundra": [
    "Toyota Tundra Limited red.png",
    "Toyota Tundra Platinum silver.png",
    "Toyota Tundra red.png",
    "Toyota Tundra TRD Pro black.png",
    "Toyota Tundra TRD Sport white.png",
  ],
};

/**
 * Get image URLs for a vehicle based on make, model, year, and trim
 * @param make - Vehicle make (e.g., "Toyota")
 * @param model - Vehicle model (e.g., "RAV4", "Camry", "Camry HEV")
 * @param year - Vehicle year (e.g., 2025)
 * @param trim - Optional trim level (e.g., "XLE", "TRD", "Limited")
 * @returns Array of image URLs from /CarImages folder
 */
export function getVehicleImages(
  make: string,
  model: string,
  year: number,
  trim?: string
): string[] {
  // Normalize model name for matching
  const normalizedModel = model.trim();
  
  // Try exact match first
  let modelImages = AVAILABLE_IMAGES[normalizedModel];
  
  // If no exact match, try fuzzy matching by removing common suffixes/modifiers
  if (!modelImages || modelImages.length === 0) {
    // Remove common modifiers: HEV, AWD, FWD, RWD, Hybrid, etc.
    const baseModel = normalizedModel
      .replace(/\s+(HEV|AWD|FWD|RWD|4WD|Hybrid|Electric|EV|PHEV|Prime)\b/gi, '')
      .trim();
    
    // Try matching with base model name
    modelImages = AVAILABLE_IMAGES[baseModel];
    
    // If still no match, try finding a partial match
    if (!modelImages || modelImages.length === 0) {
      const modelKeys = Object.keys(AVAILABLE_IMAGES);
      const partialMatch = modelKeys.find(key => 
        baseModel.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(baseModel.toLowerCase())
      );
      
      if (partialMatch) {
        modelImages = AVAILABLE_IMAGES[partialMatch];
      }
    }
  }
  
  if (!modelImages || modelImages.length === 0) {
    // Return empty array if no images found
    return [];
  }

  // If trim is specified, try to find trim-specific images first
  if (trim) {
    const trimImages = modelImages.filter((img) =>
      img.toLowerCase().includes(trim.toLowerCase())
    );
    
    if (trimImages.length > 0) {
      // Return trim-specific images with full path
      return trimImages.map((img) => `/CarImages/${img}`);
    }
  }

  // Return all images for this model with full path
  return modelImages.map((img) => `/CarImages/${img}`);
}

/**
 * Get a single primary image for a vehicle
 * @param make - Vehicle make
 * @param model - Vehicle model
 * @param year - Vehicle year
 * @param trim - Optional trim level
 * @returns Single image URL or empty string if none found
 */
export function getVehiclePrimaryImage(
  make: string,
  model: string,
  year: number,
  trim?: string
): string {
  const images = getVehicleImages(make, model, year, trim);
  return images[0] ?? "";
}

/**
 * Check if images exist for a given model
 * @param model - Vehicle model name
 * @returns true if images are available
 */
export function hasVehicleImages(model: string): boolean {
  const normalizedModel = model.trim();
  return !!AVAILABLE_IMAGES[normalizedModel] && AVAILABLE_IMAGES[normalizedModel].length > 0;
}

/**
 * Get all available models that have images
 * @returns Array of model names that have images
 */
export function getAvailableModels(): string[] {
  return Object.keys(AVAILABLE_IMAGES);
}
