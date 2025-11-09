/**
 * Test Firestore Connection and Data Access
 * 
 * Run with: npx tsx scripts/test-firestore.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

async function testFirestoreConnection() {
  console.log('🔍 Testing Firestore connection...\n');

  try {
    // Test 1: Check vehicles collection
    console.log('📊 Checking vehicles collection...');
    const vehiclesSnapshot = await db.collection('vehicles').limit(5).get();
    
    if (vehiclesSnapshot.empty) {
      console.log('❌ No vehicles found in Firestore');
      console.log('   Please seed data first with: npm run seed:vehicles\n');
      return false;
    }

    console.log(`✅ Found ${vehiclesSnapshot.size} vehicles (showing first 5):`);
    vehiclesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.year} ${data.make} ${data.model} (${data.bodyStyle}) - $${data.msrp?.toLocaleString()}`);
    });
    console.log();

    // Test 2: Get total vehicle count
    console.log('📈 Getting total vehicle count...');
    const allVehicles = await db.collection('vehicles').get();
    console.log(`✅ Total vehicles in database: ${allVehicles.size}\n`);

    // Test 3: Check for trims subcollection (sample one vehicle)
    const firstVehicle = vehiclesSnapshot.docs[0];
    if (firstVehicle) {
      console.log(`🔧 Checking trims for: ${firstVehicle.data().model}...`);
      const trimsSnapshot = await firstVehicle.ref.collection('trims').get();
      
      if (trimsSnapshot.empty) {
        console.log('⚠️  No trims found for this vehicle');
      } else {
        console.log(`✅ Found ${trimsSnapshot.size} trims:`);
        trimsSnapshot.docs.slice(0, 3).forEach((trimDoc) => {
          const trim = trimDoc.data();
          console.log(`   - ${trim.name}: $${trim.msrp?.toLocaleString()} (${trim.engine})`);
        });
      }
      console.log();
    }

    // Test 4: Test filtering capabilities
    console.log('🔍 Testing filters (SUVs under $50k)...');
    const filteredVehicles = await db.collection('vehicles')
      .where('bodyStyle', '==', 'suv')
      .where('msrp', '<=', 50000)
      .limit(3)
      .get();
    
    console.log(`✅ Found ${filteredVehicles.size} matching vehicles:`);
    filteredVehicles.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.year} ${data.model} - $${data.msrp?.toLocaleString()}`);
    });
    console.log();

    // Test 5: Check data structure completeness
    console.log('📋 Checking data structure...');
    const sampleVehicle = vehiclesSnapshot.docs[0]?.data();
    const requiredFields = ['id', 'make', 'model', 'year', 'bodyStyle', 'fuelType', 'msrp', 'features'];
    const missingFields = requiredFields.filter(field => !(field in sampleVehicle));
    
    if (missingFields.length > 0) {
      console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ All required fields present');
    }
    console.log();

    console.log('✅ Firestore connection test PASSED!');
    console.log('🚀 Ready to build APIs and UI\n');
    return true;

  } catch (error) {
    console.error('❌ Firestore connection test FAILED:', error);
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Check Firebase credentials in .env.local');
    console.log('2. Verify Firebase project is initialized: firebase init');
    console.log('3. Run seed script: npm run seed:vehicles');
    console.log('4. Check Firebase Console for data\n');
    return false;
  }
}

// Run the test
testFirestoreConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
