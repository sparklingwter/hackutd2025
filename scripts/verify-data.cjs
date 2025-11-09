#!/usr/bin/env node

/**
 * Verification script to check seeded data in Firestore
 * 
 * Usage:
 *   node verify-data.js
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 node verify-data.js
 */

const admin = require('firebase-admin');

async function main() {
  console.log('🔍 Verifying Firestore Data\n');
  
  // Initialize Firebase Admin
  try {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log(`🧪 Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}\n`);
      admin.initializeApp({
        projectId: 'demo-project',
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }
  
  const db = admin.firestore();
  
  try {
    // Count total vehicles
    console.log('📊 Counting vehicles...');
    const vehiclesSnapshot = await db.collection('vehicles').count().get();
    const totalVehicles = vehiclesSnapshot.data().count;
    console.log(`   Total vehicles: ${totalVehicles}\n`);
    
    // Sample vehicle
    console.log('🚗 Sample vehicle:');
    const sampleSnapshot = await db.collection('vehicles').limit(1).get();
    if (!sampleSnapshot.empty) {
      const sampleDoc = sampleSnapshot.docs[0];
      console.log(`   ID: ${sampleDoc.id}`);
      console.log(`   Data:`, JSON.stringify(sampleDoc.data(), null, 2));
    } else {
      console.log('   No vehicles found');
    }
    
    console.log('\n📋 Metadata:');
    const metadataSnapshot = await db.collection('metadata').doc('makes').listCollections();
    const makes = await Promise.all(
      metadataSnapshot.map(async (makeCollection) => {
        const statsDoc = await makeCollection.doc('stats').get();
        return {
          make: makeCollection.id,
          exists: statsDoc.exists,
          data: statsDoc.exists ? statsDoc.data() : null,
        };
      })
    );
    
    makes.forEach(({ make, exists, data }) => {
      if (exists) {
        console.log(`   ${make}: ${data.years.length} years, ${Object.keys(data.counts_by_year).length} records`);
      }
    });
    
    console.log('\n✅ Verification complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    process.exit(1);
  }
}

main();
