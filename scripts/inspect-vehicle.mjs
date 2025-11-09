import admin from 'firebase-admin';

// Use Application Default Credentials (same as server)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

console.log('🔍 Inspecting vehicle document structure...\n');

try {
  // Get one vehicle
  const snapshot = await db.collection('vehicles').limit(1).get();
  
  if (snapshot.empty) {
    console.log('❌ No vehicles found');
    process.exit(1);
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  
  console.log('✅ Sample vehicle document:');
  console.log(`ID: ${doc.id}\n`);
  console.log('Fields:', Object.keys(data).sort());
  console.log('\nFull data:');
  console.log(JSON.stringify(data, null, 2));
  
  // Check for trims subcollection
  console.log('\n🔧 Checking for trims subcollection...');
  const trimsSnapshot = await doc.ref.collection('trims').limit(1).get();
  
  if (trimsSnapshot.empty) {
    console.log('⚠️  No trims subcollection found');
  } else {
    const trimData = trimsSnapshot.docs[0].data();
    console.log('✅ Trim found:', trimsSnapshot.docs[0].id);
    console.log('Trim fields:', Object.keys(trimData).sort());
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
