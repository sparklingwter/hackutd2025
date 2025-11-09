import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function checkCorollas() {
  const snapshot = await db.collection('vehicles').where('model', '==', 'Corolla').get();
  
  console.log(`Total Corolla documents: ${snapshot.size}`);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`- ${doc.id}: ${data.name} (Trim: ${data.trim})`);
  });
  
  process.exit(0);
}

checkCorollas().catch(err => {
  console.error(err);
  process.exit(1);
});
