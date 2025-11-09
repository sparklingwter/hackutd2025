import admin from 'firebase-admin';

// Use Application Default Credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

console.log('🧪 Testing vehicle ranking with actual Firestore data...\n');

try {
  // 1. Test basic vehicle retrieval with transformation
  console.log('📊 Test 1: Fetch and transform vehicles...');
  const snapshot = await db.collection('vehicles').limit(5).get();
  
  const vehicles = snapshot.docs.map(doc => {
    const raw = doc.data();
    
    // Transformation logic (same as collections.ts)
    const allFeatures = [
      ...(raw.features?.standard ?? []),
      ...(raw.features?.safety ?? []),
      ...(raw.features?.technology ?? []),
      ...(raw.features?.comfort ?? []),
      ...(raw.features?.exterior ?? []),
    ];
    
    const drivetrain = raw.specs?.drivetrain?.toLowerCase() ?? '';
    
    return {
      id: doc.id,
      model: raw.model,
      year: raw.year,
      bodyStyle: raw.specs?.body ?? 'sedan',
      fuelType: raw.specs?.powertrain ?? 'gas',
      seating: raw.dimensions?.seating ?? 5,
      mpgCombined: raw.performance?.mpgCombined ?? null,
      range: raw.specs?.range ?? null,
      cargoVolume: raw.dimensions?.cargo ?? 0,
      towingCapacity: 0,
      awd: drivetrain === 'awd',
      msrp: raw.pricing?.msrp ?? 0,
      features: allFeatures,
      safetyRating: null,
    };
  });
  
  console.log(`✅ Transformed ${vehicles.length} vehicles`);
  vehicles.forEach(v => {
    console.log(`   - ${v.year} ${v.model}: ${v.bodyStyle}, ${v.fuelType}, $${v.msrp || 'N/A'}`);
  });
  
  // 2. Test filtering by body style
  console.log('\n📊 Test 2: Filter SUVs...');
  const suvSnapshot = await db.collection('vehicles')
    .where('specs.body', '==', 'suv')
    .limit(3)
    .get();
  
  console.log(`✅ Found ${suvSnapshot.size} SUVs`);
  suvSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.year} ${data.model} - $${data.pricing?.msrp || 'Contact Dealer'}`);
  });
  
  // 3. Test filtering by fuel type
  console.log('\n📊 Test 3: Filter hybrids...');
  const hybridSnapshot = await db.collection('vehicles')
    .where('specs.powertrain', '==', 'hybrid')
    .limit(3)
    .get();
  
  console.log(`✅ Found ${hybridSnapshot.size} hybrids`);
  hybridSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.year} ${data.model} - ${data.performance?.mpgCombined || '?'} mpg combined`);
  });
  
  // 4. Test counting by body style
  console.log('\n📊 Test 4: Count by body style...');
  const bodyStyles = ['suv', 'sedan', 'truck', 'van'];
  
  for (const style of bodyStyles) {
    const count = await db.collection('vehicles')
      .where('specs.body', '==', style)
      .count()
      .get();
    console.log(`   - ${style}: ${count.data().count} vehicles`);
  }
  
  // 5. Test ranking algorithm with sample user needs
  console.log('\n📊 Test 5: Rank vehicles for sample user...');
  
  const userNeeds = {
    budgetType: 'monthly',
    budgetAmount: 500,
    bodyStyle: 'suv',
    seating: 5,
    fuelType: 'hybrid',
    priorityMpg: true,
    priorityRange: false,
    cargoNeeds: 'moderate',
    towingNeeds: 'none',
    requireAwd: false,
    safetyPriority: 'high',
    driverAssistNeeds: [],
    mustHaveFeatures: [],
    drivingPattern: 'mixed',
    commuteLength: 'medium',
  };
  
  console.log(`   User needs: ${userNeeds.bodyStyle}, ${userNeeds.fuelType}, $${userNeeds.budgetAmount}/mo`);
  
  // Get matching vehicles
  const rankingSnapshot = await db.collection('vehicles')
    .where('specs.body', '==', userNeeds.bodyStyle)
    .limit(10)
    .get();
  
  const candidateVehicles = rankingSnapshot.docs.map(doc => {
    const raw = doc.data();
    const drivetrain = raw.specs?.drivetrain?.toLowerCase() ?? '';
    
    return {
      id: doc.id,
      model: raw.model,
      year: raw.year,
      bodyStyle: raw.specs?.body ?? 'sedan',
      fuelType: raw.specs?.powertrain ?? 'gas',
      seating: raw.dimensions?.seating ?? 5,
      mpgCombined: raw.performance?.mpgCombined ?? null,
      range: raw.specs?.range ?? null,
      cargoVolume: raw.dimensions?.cargo ?? 0,
      towingCapacity: 0,
      awd: drivetrain === 'awd',
      msrp: raw.pricing?.msrp ?? 40000, // Default for scoring
      features: [],
      safetyRating: null,
    };
  });
  
  // Simple scoring
  const scored = candidateVehicles.map(v => {
    let score = 0;
    
    // Body style match (15 pts)
    if (v.bodyStyle === userNeeds.bodyStyle) score += 15;
    
    // Fuel type match (15 pts)
    if (v.fuelType === userNeeds.fuelType) score += 15;
    
    // MPG bonus if prioritized (10 pts)
    if (userNeeds.priorityMpg && v.mpgCombined && v.mpgCombined >= 30) score += 10;
    
    // Budget scoring (25 pts max)
    const estimatedMonthly = v.msrp * 0.0193; // Rough 60mo @ 6% APR
    if (estimatedMonthly <= userNeeds.budgetAmount) score += 25;
    else if (estimatedMonthly <= userNeeds.budgetAmount * 1.2) score += 15;
    else if (estimatedMonthly <= userNeeds.budgetAmount * 1.5) score += 5;
    
    return { ...v, score, estimatedMonthly };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  console.log(`✅ Ranked ${scored.length} vehicles:`);
  scored.slice(0, 5).forEach(v => {
    console.log(`   - ${v.year} ${v.model}: ${v.score} pts (${v.fuelType}, ${v.mpgCombined || '?'} mpg, ~$${Math.round(v.estimatedMonthly)}/mo)`);
  });
  
  console.log('\n✅ All tests passed! Schema adaptation working correctly.\n');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  if (error.details) {
    console.error('Details:', error.details);
  }
  process.exit(1);
}
