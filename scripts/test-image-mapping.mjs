/**
 * Test script to verify image mapping functionality
 * Run with: node scripts/test-image-mapping.mjs
 */

// Mock the getVehicleImages function logic
const AVAILABLE_IMAGES = {
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
  "Tacoma": [
    "Toyota Tacoma Trailhunter black.png",
    "Toyota Tacoma TRD Off-Road white.png",
    "Toyota Tacoma TRD Sport blue.png",
  ],
};

function getVehicleImages(make, model, year, trim) {
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
    return [];
  }

  if (trim) {
    const trimImages = modelImages.filter((img) =>
      img.toLowerCase().includes(trim.toLowerCase())
    );
    
    if (trimImages.length > 0) {
      return trimImages.map((img) => `/CarImages/${img}`);
    }
  }

  return modelImages.map((img) => `/CarImages/${img}`);
}

// Test cases
console.log("Testing image mapping...\n");

const testCases = [
  { make: "Toyota", model: "RAV4", year: 2024, trim: "Limited", expected: 2 },
  { make: "Toyota", model: "RAV4", year: 2024, trim: undefined, expected: 8 },
  { make: "Toyota", model: "Camry", year: 2025, trim: "SE", expected: 1 },
  { make: "Toyota", model: "Tacoma", year: 2024, trim: "TRD Off-Road", expected: 1 },
  { make: "Toyota", model: "Highlander", year: 2024, trim: undefined, expected: 0 },
  { make: "Toyota", model: "Corolla", year: 2024, trim: undefined, expected: 4 },
  // New test cases for fuzzy matching
  { make: "Toyota", model: "Camry HEV", year: 2025, trim: undefined, expected: 4 },
  { make: "Toyota", model: "Camry AWD", year: 2024, trim: "LE", expected: 4 },
  { make: "Toyota", model: "RAV4 Hybrid", year: 2024, trim: undefined, expected: 8 },
  { make: "Toyota", model: "Corolla Hybrid", year: 2024, trim: "SE", expected: 4 },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const { make, model, year, trim, expected } = testCase;
  const result = getVehicleImages(make, model, year, trim);
  const success = result.length === expected;
  
  if (success) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${model}${trim ? ` (${trim})` : ''}`);
    console.log(`  Expected ${expected} images, got ${result.length}`);
    if (result.length > 0) {
      console.log(`  First image: ${result[0]}`);
    }
  } else {
    failed++;
    console.log(`✗ Test ${index + 1} FAILED: ${model}${trim ? ` (${trim})` : ''}`);
    console.log(`  Expected ${expected} images, got ${result.length}`);
    console.log(`  Results:`, result);
  }
  console.log('');
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("✓ All tests passed!");
  process.exit(0);
} else {
  console.log("✗ Some tests failed");
  process.exit(1);
}
