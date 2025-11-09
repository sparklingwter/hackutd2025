import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

console.log('🔍 Analyzing vehicle data structure...\n');

try {
  // Get all vehicles
  const snapshot = await db.collection('vehicles').get();
  console.log(`Total vehicles: ${snapshot.size}\n`);
  
  // Analyze powertrains
  const powertrains = new Map();
  const bodyStyles = new Map();
  const msrpStatus = { hasPrice: 0, noPrice: 0 };
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    // Count powertrains
    const powertrain = data.specs?.powertrain || 'unknown';
    powertrains.set(powertrain, (powertrains.get(powertrain) || 0) + 1);
    
    // Count body styles
    const body = data.specs?.body || 'unknown';
    bodyStyles.set(body, (bodyStyles.get(body) || 0) + 1);
    
    // Check MSRP
    if (data.pricing?.msrp && data.pricing.msrp > 0) {
      msrpStatus.hasPrice++;
    } else {
      msrpStatus.noPrice++;
    }
  });
  
  console.log('📊 Powertrains:');
  [...powertrains.entries()].sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log('\n📊 Body Styles:');
  [...bodyStyles.entries()].sort((a, b) => b[1] - a[1]).forEach(([style, count]) => {
    console.log(`   ${style}: ${count}`);
  });
  
  console.log('\n💰 MSRP Status:');
  console.log(`   With price: ${msrpStatus.hasPrice} (${Math.round(msrpStatus.hasPrice/snapshot.size*100)}%)`);
  console.log(`   No price: ${msrpStatus.noPrice} (${Math.round(msrpStatus.noPrice/snapshot.size*100)}%)`);
  
  // Sample vehicles with prices
  console.log('\n💵 Sample vehicles WITH pricing:');
  const withPricing = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.pricing?.msrp && data.pricing.msrp > 0;
  }).slice(0, 5);
  
  withPricing.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.year} ${data.model}: $${data.pricing.msrp.toLocaleString()} (${data.specs?.powertrain})`);
  });
  
  // Check for hybrid-related tags
  console.log('\n🔋 Checking for hybrid vehicles by tags...');
  const hybridByTag = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.tags?.some(tag => tag.includes('hybrid'));
  });
  
  console.log(`   Found ${hybridByTag.length} vehicles with "hybrid" in tags`);
  hybridByTag.slice(0, 5).forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.year} ${data.model}: ${data.specs?.powertrain}, tags: ${data.tags?.join(', ')}`);
  });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
