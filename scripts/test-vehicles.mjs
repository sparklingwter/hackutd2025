/**
 * Test script to check if vehicles exist in Firestore
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

const db = getFirestore();

async function testVehicles() {
  try {
    console.log('🔍 Checking for vehicles in Firestore...\n');
    
    // Get first 10 vehicles
    const snapshot = await db.collection('vehicles').limit(10).get();
    
    if (snapshot.empty) {
      console.log('❌ No vehicles found in the database!');
      console.log('   Please run the data import script first.');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} vehicles (showing first 10):\n`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📍 ${doc.id}`);
      console.log(`   Model: ${data.model}`);
      console.log(`   Year: ${data.year}`);
      console.log(`   Body: ${data.specs?.body || 'N/A'}`);
      console.log(`   MSRP: $${data.pricing?.msrp || 'N/A'}`);
      console.log('');
    });
    
    // Get total count estimate
    const allSnapshot = await db.collection('vehicles').count().get();
    console.log(`📊 Total vehicles in database: ${allSnapshot.data().count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied. Make sure:');
      console.log('   1. You have Firebase credentials set up');
      console.log('   2. Firestore rules allow read access');
    }
  }
}

testVehicles().then(() => {
  console.log('\n✨ Test complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
