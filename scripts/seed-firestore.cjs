#!/usr/bin/env node

/**
 * Firestore Seeding Script
 * Seeds Toyota vehicle data into Firestore according to the schema in research.md
 * 
 * Usage:
 *   node seed-firestore.js <path-to-json-file>
 *   node seed-firestore.js --help
 * 
 * Environment Variables:
 *   GOOGLE_APPLICATION_CREDENTIALS - Path to Firebase service account key
 *   FIRESTORE_EMULATOR_HOST - Use emulator (e.g., localhost:8080)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const BATCH_SIZE = 500; // Firestore batch write limit
const DRY_RUN = process.env.DRY_RUN === 'true';

// Helper function to create a canonical key
function createCanonicalKey(make, model, year, trim) {
  const normalized = [
    make.toLowerCase().trim(),
    model.toLowerCase().trim(),
    year.toString(),
    (trim || 'base').toLowerCase().trim().replace(/\s+/g, '_')
  ];
  return normalized.join('|');
}

// Helper function to create document ID
function createDocumentId(make, model, year, trim) {
  const normalized = [
    make.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'),
    model.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'),
    year.toString(),
    (trim || 'base').toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_')
  ];
  return normalized.join('_');
}

// Helper function to normalize trim name
function normalizeTrim(optionDesc) {
  if (!optionDesc) return 'base';
  
  // Extract trim from option description (e.g., "Auto (S6), 6 cyl, 3.5 L" -> "auto_s6")
  const trimMatch = optionDesc.match(/^([^,]+)/);
  if (trimMatch) {
    return trimMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
  
  return 'base';
}

// Map EPA fuel type to simplified categories
function mapFuelType(epaFuelType) {
  if (!epaFuelType) return 'gas';
  
  const type = epaFuelType.toLowerCase();
  if (type.includes('electric') || type.includes('battery')) return 'electric';
  if (type.includes('hybrid') || type.includes('plug-in')) return 'hybrid';
  if (type.includes('diesel')) return 'diesel';
  return 'gas';
}

// Map body style from vehicle type
function mapBodyStyle(vehicleType) {
  if (!vehicleType) return 'sedan';
  
  const type = vehicleType.toLowerCase();
  if (type.includes('suv') || type.includes('utility')) return 'suv';
  if (type.includes('truck') || type.includes('pickup')) return 'truck';
  if (type.includes('van') || type.includes('minivan')) return 'van';
  if (type.includes('coupe')) return 'coupe';
  if (type.includes('wagon')) return 'wagon';
  if (type.includes('hatchback')) return 'hatchback';
  return 'sedan';
}

// Map drive type to standardized drivetrain
function mapDrivetrain(driveType) {
  if (!driveType) return 'fwd';
  
  const type = driveType.toLowerCase();
  if (type.includes('awd') || type.includes('all-wheel')) return 'awd';
  if (type.includes('4wd') || type.includes('four-wheel') || type.includes('4x4')) return '4wd';
  if (type.includes('rwd') || type.includes('rear-wheel')) return 'rwd';
  return 'fwd';
}

// Generate tags for filtering
function generateTags(vehicle) {
  const tags = [];
  
  // Brand
  if (vehicle.make) tags.push(vehicle.make.toLowerCase());
  
  // Body style
  const bodyStyle = mapBodyStyle(vehicle.vehicle_type);
  tags.push(bodyStyle);
  
  // Powertrain
  const fuelType = mapFuelType(vehicle.fuel_type);
  tags.push(fuelType);
  if (fuelType === 'hybrid') tags.push('economy');
  if (fuelType === 'electric') tags.push('ev');
  
  // Drivetrain
  const drivetrain = mapDrivetrain(vehicle.drive_type);
  tags.push(drivetrain);
  
  // Additional descriptors
  if (vehicle.seating && vehicle.seating >= 7) tags.push('family');
  if (bodyStyle === 'truck') tags.push('towing');
  if (drivetrain === '4wd') tags.push('offroad');
  if (vehicle.msrp && vehicle.msrp >= 45000) tags.push('luxury');
  if (vehicle.combined_mpg && vehicle.combined_mpg >= 35) tags.push('efficient');
  
  // Safety and tech (if features provided)
  if (vehicle.features && vehicle.features.length > 0) {
    tags.push('safety-tech');
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

// Format price for display
function formatPrice(msrp) {
  if (!msrp) return 'Contact Dealer';
  return `$${msrp.toLocaleString()}`;
}

// Format MPG or range for display
function formatEfficiency(vehicle) {
  const fuelType = mapFuelType(vehicle.fuel_type);
  
  if (fuelType === 'electric') {
    // For EVs, use range (placeholder - would come from EPA data)
    return vehicle.range ? `${vehicle.range} mi` : null;
  } else {
    // For gas/hybrid, use combined MPG
    return vehicle.combined_mpg ? `${vehicle.combined_mpg} mpg` : null;
  }
}

// Generate vehicle name (display name)
function generateVehicleName(vehicle) {
  const make = vehicle.make || 'Unknown';
  const model = vehicle.model || 'Unknown';
  const year = vehicle.year || 2024;
  const trim = vehicle.trim || vehicle.epa_option_desc;
  
  let name = `${year} ${make} ${model}`;
  
  if (trim && trim !== 'base') {
    // Clean up trim name for display
    const cleanTrim = trim
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    name += ` ${cleanTrim}`;
  }
  
  return name;
}

// Generate placeholder image path
function generateImagePath(vehicle) {
  const model = (vehicle.model || 'vehicle').toLowerCase().replace(/\s+/g, '-');
  return `/CarImages/${model}.jpg`;
}

// Transform EPA vehicle data to Firestore document (matching application schema)
function transformEpaVehicle(epaVehicle) {
  const make = epaVehicle.make || 'Unknown';
  const model = epaVehicle.model || 'Unknown';
  const year = epaVehicle.year || 2024;
  const trim = normalizeTrim(epaVehicle.epa_option_desc);
  
  const docId = createDocumentId(make, model, year, trim);
  const canonicalKey = createCanonicalKey(make, model, year, trim);
  
  // Map actual EPA field names to expected names
  const vehicleClass = epaVehicle.VClass || epaVehicle.vehicle_class || epaVehicle.vehicle_type;
  const fuelTypeRaw = epaVehicle.fuelType || epaVehicle.fuelType1 || epaVehicle.fuel_type;
  const driveTypeRaw = epaVehicle.drive || epaVehicle.drive_type;
  const cityMpg = parseInt(epaVehicle.city08 || epaVehicle.city_mpg || 0);
  const highwayMpg = parseInt(epaVehicle.highway08 || epaVehicle.highway_mpg || 0);
  const combinedMpg = parseInt(epaVehicle.comb08 || epaVehicle.combined_mpg || 0);
  const displacement = parseFloat(epaVehicle.displ || epaVehicle.engine_displacement || 0);
  const cylinders = parseInt(epaVehicle.cylinders || 0);
  const transmission = epaVehicle.trany || epaVehicle.transmission;
  
  const bodyStyle = mapBodyStyle(vehicleClass);
  const fuelType = mapFuelType(fuelTypeRaw);
  const drivetrain = mapDrivetrain(driveTypeRaw);
  const msrp = epaVehicle.msrp || null;
  
  return {
    // Core identifiers
    id: docId,
    name: generateVehicleName({ make, model, year, trim }),
    img: generateImagePath(epaVehicle),
    make,
    model,
    year: parseInt(year),
    trim,
    canonicalKey,
    
    // Display fields (matching Car type from cars.ts)
    description: `${year} ${make} ${model} - ${vehicleClass || bodyStyle}`,
    tags: generateTags({...epaVehicle, vehicle_type: vehicleClass, fuel_type: fuelTypeRaw, drive_type: driveTypeRaw, combined_mpg: combinedMpg}),
    price: formatPrice(msrp),
    
    // Specs (matching application schema)
    specs: {
      drivetrain: drivetrain,
      powertrain: fuelType,
      body: bodyStyle,
      mpg: fuelType !== 'electric' && combinedMpg ? `${combinedMpg} mpg` : null,
      range: fuelType === 'electric' ? formatEfficiency({...epaVehicle, combined_mpg: combinedMpg}) : null,
    },
    
    // Detailed fields for finance/ranking engines
    pricing: {
      msrp: msrp,
      invoice: msrp ? Math.round(msrp * 0.93) : null, // Approximate invoice (93% of MSRP)
      destinationCharge: 1095, // Typical Toyota destination charge
    },
    
    performance: {
      mpgCity: cityMpg || null,
      mpgHighway: highwayMpg || null,
      mpgCombined: combinedMpg || null,
      engineDisplacement: displacement || null,
      cylinders: cylinders || null,
      horsepower: null, // Would come from CarQuery
      torque: null, // Would come from CarQuery
    },
    
    dimensions: {
      seating: epaVehicle.seating || 5,
      cargo: null, // Would come from CarQuery
      length: null,
      width: null,
      height: null,
      wheelbase: null,
    },
    
    features: {
      standard: epaVehicle.features || [],
      safety: [],
      technology: [],
      comfort: [],
      exterior: [],
    },
    
    availability: {
      available: true,
      inventory: 0, // Would be updated from dealer inventory API
      estimatedDelivery: '4-6 weeks',
    },
    
    // EPA source data (preserved for accuracy)
    epa: {
      epa_id: epaVehicle.id || epaVehicle.epa_id || null,
      epa_option_desc: epaVehicle.epa_option_desc || null,
      city_mpg: cityMpg || null,
      highway_mpg: highwayMpg || null,
      combined_mpg: combinedMpg || null,
      fuel_type: fuelTypeRaw || null,
      fuel_type_primary: epaVehicle.fuelType1 || null,
      fuel_type_secondary: epaVehicle.fuelType2 || null,
      engine_displacement: displacement || null,
      cylinders: cylinders || null,
      transmission: transmission || null,
      drive_type: driveTypeRaw || null,
      vehicle_class: vehicleClass || null,
      co2: parseInt(epaVehicle.co2 || 0) || null,
      feScore: parseInt(epaVehicle.feScore || 0) || null,
      ghgScore: parseInt(epaVehicle.ghgScore || 0) || null,
    },
    
    // VPIC placeholder (will be enriched if data available)
    vpic: {
      vpic_model_id: null,
      vehicle_types: [],
      models_by_year: {},
    },
    
    // CarQuery placeholder (will be enriched if data available)
    carquery: {
      trim_id: null,
      trim_specs: {},
    },
    
    // Metadata
    sources: ['epa'],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// Process and upload vehicles in batches
async function seedVehicles(db, vehicles) {
  console.log(`\n📦 Processing ${vehicles.length} vehicles...`);
  
  let batch = db.batch();
  let batchCount = 0;
  let totalProcessed = 0;
  let skipped = 0;
  let errors = 0;
  
  const vehiclesCollection = db.collection('vehicles');
  
  for (let i = 0; i < vehicles.length; i++) {
    try {
      const vehicle = vehicles[i];
      const transformed = transformEpaVehicle(vehicle);
      
      if (!transformed.make || !transformed.model || !transformed.year) {
        console.warn(`⚠️  Skipping invalid vehicle at index ${i}:`, vehicle);
        skipped++;
        continue;
      }
      
      const docRef = vehiclesCollection.doc(transformed.id);
      
      if (DRY_RUN) {
        console.log(`[DRY RUN] Would add: ${transformed.id}`);
      } else {
        batch.set(docRef, transformed);
        batchCount++;
      }
      
      // Commit batch when reaching limit
      if (batchCount >= BATCH_SIZE) {
        if (!DRY_RUN) {
          await batch.commit();
          console.log(`✅ Committed batch of ${batchCount} vehicles (${totalProcessed + batchCount}/${vehicles.length})`);
        }
        
        totalProcessed += batchCount;
        batchCount = 0;
        batch = db.batch();
      }
    } catch (error) {
      console.error(`❌ Error processing vehicle at index ${i}:`, error.message);
      errors++;
    }
  }
  
  // Commit remaining vehicles
  if (batchCount > 0 && !DRY_RUN) {
    await batch.commit();
    console.log(`✅ Committed final batch of ${batchCount} vehicles`);
    totalProcessed += batchCount;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total processed: ${totalProcessed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  
  return totalProcessed;
}

// Seed metadata collection with aggregated counts
async function seedMetadata(db, vehicles) {
  console.log(`\n📋 Creating metadata documents...`);
  
  // Group vehicles by make and year
  const makeYearCounts = {};
  
  vehicles.forEach(vehicle => {
    const make = vehicle.make || 'Unknown';
    const year = vehicle.year || 2024;
    
    if (!makeYearCounts[make]) {
      makeYearCounts[make] = {
        make,
        years: new Set(),
        counts_by_year: {},
      };
    }
    
    makeYearCounts[make].years.add(year);
    makeYearCounts[make].counts_by_year[year] = 
      (makeYearCounts[make].counts_by_year[year] || 0) + 1;
  });
  
  // Write metadata documents
  let batch = db.batch();
  let batchCount = 0;
  
  for (const [make, data] of Object.entries(makeYearCounts)) {
    const docRef = db.collection('metadata').doc('makes').collection(make).doc('stats');
    
    const metadataDoc = {
      make: data.make,
      years: Array.from(data.years).sort(),
      counts_by_year: data.counts_by_year,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      sources: ['epa'],
    };
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create metadata for ${make}:`, metadataDoc);
    } else {
      batch.set(docRef, metadataDoc);
      batchCount++;
    }
    
    if (batchCount >= BATCH_SIZE) {
      if (!DRY_RUN) {
        await batch.commit();
        console.log(`✅ Committed metadata batch`);
      }
      batchCount = 0;
      batch = db.batch();
    }
  }
  
  if (batchCount > 0 && !DRY_RUN) {
    await batch.commit();
    console.log(`✅ Committed final metadata batch`);
  }
  
  console.log(`✅ Created metadata for ${Object.keys(makeYearCounts).length} makes`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Firestore Seeding Script

Usage:
  node seed-firestore.js <path-to-json-file>
  
Options:
  --help, -h          Show this help message
  
Environment Variables:
  GOOGLE_APPLICATION_CREDENTIALS  Path to Firebase service account key
  FIRESTORE_EMULATOR_HOST         Use emulator (e.g., localhost:8080)
  DRY_RUN                         Set to 'true' for dry run (no writes)

Examples:
  # Seed from JSON file
  node seed-firestore.js ../path/to/toyota_dataset_2024-2025.json
  
  # Dry run
  DRY_RUN=true node seed-firestore.js data.json
  
  # Use emulator
  FIRESTORE_EMULATOR_HOST=localhost:8080 node seed-firestore.js data.json
    `);
    process.exit(0);
  }
  
  if (args.length < 1) {
    console.error('❌ Error: Missing JSON file path');
    console.error('Usage: node seed-firestore.js <path-to-json-file>');
    console.error('Run with --help for more information');
    process.exit(1);
  }
  
  const jsonFilePath = args[0];
  
  // Check if file exists
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ Error: File not found: ${jsonFilePath}`);
    process.exit(1);
  }
  
  console.log('🔥 Toyota Firestore Seeding Script\n');
  console.log(`📁 Reading data from: ${jsonFilePath}`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No data will be written\n');
  }
  
  // Initialize Firebase Admin
  try {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log(`🧪 Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}\n`);
      admin.initializeApp({
        projectId: 'demo-project',
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(`🔐 Using service account: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}\n`);
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      console.log(`🔐 Using Firebase project: ${process.env.FIREBASE_PROJECT_ID}\n`);
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.log(`🔐 Using default credentials\n`);
      admin.initializeApp();
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.error('\nMake sure to set GOOGLE_APPLICATION_CREDENTIALS or use emulator');
    process.exit(1);
  }
  
  const db = admin.firestore();
  
  // Read and parse JSON file
  let data;
  try {
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    data = JSON.parse(fileContent);
    console.log('✅ Successfully parsed JSON file\n');
  } catch (error) {
    console.error('❌ Error reading/parsing JSON file:', error.message);
    process.exit(1);
  }
  
  // Extract vehicles array (handle different JSON structures)
  let vehicles = [];
  if (Array.isArray(data)) {
    vehicles = data;
  } else if (data.vehicles && Array.isArray(data.vehicles)) {
    vehicles = data.vehicles;
  } else if (data.epa && data.epa.vehicles) {
    vehicles = data.epa.vehicles;
  } else {
    console.error('❌ Error: Could not find vehicles array in JSON file');
    console.error('Expected structure: { vehicles: [...] } or top-level array');
    process.exit(1);
  }
  
  console.log(`📊 Found ${vehicles.length} vehicles in dataset\n`);
  
  if (vehicles.length === 0) {
    console.error('❌ Error: No vehicles found in dataset');
    process.exit(1);
  }
  
  // Start seeding
  const startTime = Date.now();
  
  try {
    // Seed vehicles
    const processedCount = await seedVehicles(db, vehicles);
    
    // Seed metadata
    await seedMetadata(db, vehicles);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ Seeding completed in ${duration}s`);
    console.log(`📦 Total vehicles processed: ${processedCount}`);
    
    if (DRY_RUN) {
      console.log('\n🔍 This was a dry run - no data was written to Firestore');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  transformEpaVehicle,
  createCanonicalKey,
  createDocumentId,
};
