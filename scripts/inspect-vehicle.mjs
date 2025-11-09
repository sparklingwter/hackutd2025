/**
 * Inspect a single vehicle to see its data structure
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

const db = getFirestore();

async function inspectVehicle() {
  try {
    const snapshot = await db.collection('vehicles').limit(1).get();
    
    if (snapshot.empty) {
      console.log('No vehicles found');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('Vehicle ID:', doc.id);
    console.log('\nFull data structure:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectVehicle().then(() => process.exit(0));
