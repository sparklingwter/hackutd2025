#!/usr/bin/env node
/**
 * Seed script for Toyota dealer locations
 * Populates the dealers collection in Firestore with Texas Toyota dealerships
 * 
 * Run with: npm run seed-dealers
 */

import { adminDb } from '../src/server/db/firebase';

interface DealerSeed {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  website?: string;
  hours?: Record<string, string>;
  services: string[];
  reviews?: {
    rating: number;
    count: number;
    source: string;
  };
}

/**
 * Texas Toyota dealers seed data
 * Coordinates are approximate and should be updated with actual values
 */
const texasToyotaDealers: DealerSeed[] = [
  {
    id: 'toyota-of-dallas',
    name: 'Toyota of Dallas',
    address: {
      street: '2500 W Northwest Hwy',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75220',
    },
    coordinates: {
      lat: 32.8679,
      lng: -96.8765,
    },
    phone: '2145550100',
    website: 'https://toyotaofdallas.com',
    hours: {
      Monday: '9AM-7PM',
      Tuesday: '9AM-7PM',
      Wednesday: '9AM-7PM',
      Thursday: '9AM-7PM',
      Friday: '9AM-7PM',
      Saturday: '9AM-6PM',
      Sunday: 'Closed',
    },
    services: ['sales', 'service', 'parts'],
    reviews: {
      rating: 4.5,
      count: 1234,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-plano',
    name: 'Toyota of Plano',
    address: {
      street: '5000 W Plano Pkwy',
      city: 'Plano',
      state: 'TX',
      zipCode: '75093',
    },
    coordinates: {
      lat: 33.0198,
      lng: -96.7489,
    },
    phone: '4695550101',
    website: 'https://toyotaofplano.com',
    hours: {
      Monday: '8AM-8PM',
      Tuesday: '8AM-8PM',
      Wednesday: '8AM-8PM',
      Thursday: '8AM-8PM',
      Friday: '8AM-8PM',
      Saturday: '8AM-7PM',
      Sunday: '11AM-6PM',
    },
    services: ['sales', 'service', 'parts', 'collision'],
    reviews: {
      rating: 4.3,
      count: 987,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-richardson',
    name: 'Toyota of Richardson',
    address: {
      street: '1601 N Central Expy',
      city: 'Richardson',
      state: 'TX',
      zipCode: '75080',
    },
    coordinates: {
      lat: 32.9756,
      lng: -96.7298,
    },
    phone: '4695550102',
    website: 'https://toyotaofrichardson.com',
    hours: {
      Monday: '9AM-7PM',
      Tuesday: '9AM-7PM',
      Wednesday: '9AM-7PM',
      Thursday: '9AM-7PM',
      Friday: '9AM-7PM',
      Saturday: '9AM-6PM',
      Sunday: 'Closed',
    },
    services: ['sales', 'service', 'parts'],
    reviews: {
      rating: 4.6,
      count: 756,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-fort-worth',
    name: 'Toyota of Fort Worth',
    address: {
      street: '3600 Airport Fwy',
      city: 'Fort Worth',
      state: 'TX',
      zipCode: '76111',
    },
    coordinates: {
      lat: 32.7995,
      lng: -97.2644,
    },
    phone: '8175550103',
    website: 'https://toyotaoffortworth.com',
    hours: {
      Monday: '8AM-8PM',
      Tuesday: '8AM-8PM',
      Wednesday: '8AM-8PM',
      Thursday: '8AM-8PM',
      Friday: '8AM-8PM',
      Saturday: '8AM-7PM',
      Sunday: '12PM-6PM',
    },
    services: ['sales', 'service', 'parts', 'collision'],
    reviews: {
      rating: 4.4,
      count: 1102,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-irving',
    name: 'Toyota of Irving',
    address: {
      street: '2201 W Airport Fwy',
      city: 'Irving',
      state: 'TX',
      zipCode: '75062',
    },
    coordinates: {
      lat: 32.8412,
      lng: -96.9687,
    },
    phone: '2145550104',
    website: 'https://toyotaofirving.com',
    hours: {
      Monday: '9AM-7PM',
      Tuesday: '9AM-7PM',
      Wednesday: '9AM-7PM',
      Thursday: '9AM-7PM',
      Friday: '9AM-7PM',
      Saturday: '9AM-6PM',
      Sunday: 'Closed',
    },
    services: ['sales', 'service', 'parts'],
    reviews: {
      rating: 4.2,
      count: 543,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-lewisville',
    name: 'Toyota of Lewisville',
    address: {
      street: '1850 S Stemmons Fwy',
      city: 'Lewisville',
      state: 'TX',
      zipCode: '75067',
    },
    coordinates: {
      lat: 33.0298,
      lng: -96.9898,
    },
    phone: '9725550105',
    website: 'https://toyotaoflewisville.com',
    hours: {
      Monday: '8AM-8PM',
      Tuesday: '8AM-8PM',
      Wednesday: '8AM-8PM',
      Thursday: '8AM-8PM',
      Friday: '8AM-8PM',
      Saturday: '8AM-7PM',
      Sunday: '11AM-6PM',
    },
    services: ['sales', 'service', 'parts'],
    reviews: {
      rating: 4.5,
      count: 821,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-mesquite',
    name: 'Toyota of Mesquite',
    address: {
      street: '18900 LBJ Fwy',
      city: 'Mesquite',
      state: 'TX',
      zipCode: '75150',
    },
    coordinates: {
      lat: 32.8268,
      lng: -96.6067,
    },
    phone: '2145550106',
    website: 'https://toyotaofmesquite.com',
    hours: {
      Monday: '9AM-7PM',
      Tuesday: '9AM-7PM',
      Wednesday: '9AM-7PM',
      Thursday: '9AM-7PM',
      Friday: '9AM-7PM',
      Saturday: '9AM-6PM',
      Sunday: 'Closed',
    },
    services: ['sales', 'service', 'parts'],
    reviews: {
      rating: 4.3,
      count: 674,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-grapevine',
    name: 'Toyota of Grapevine',
    address: {
      street: '1301 E State Hwy 114',
      city: 'Grapevine',
      state: 'TX',
      zipCode: '76051',
    },
    coordinates: {
      lat: 32.9234,
      lng: -97.0567,
    },
    phone: '8175550107',
    website: 'https://toyotaofgrapevine.com',
    hours: {
      Monday: '8AM-8PM',
      Tuesday: '8AM-8PM',
      Wednesday: '8AM-8PM',
      Thursday: '8AM-8PM',
      Friday: '8AM-8PM',
      Saturday: '8AM-7PM',
      Sunday: '12PM-6PM',
    },
    services: ['sales', 'service', 'parts', 'collision'],
    reviews: {
      rating: 4.6,
      count: 932,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-mckinney',
    name: 'Toyota of McKinney',
    address: {
      street: '3700 S Central Expy',
      city: 'McKinney',
      state: 'TX',
      zipCode: '75070',
    },
    coordinates: {
      lat: 33.1823,
      lng: -96.6398,
    },
    phone: '4695550108',
    website: 'https://toyotaofmckinney.com',
    hours: {
      Monday: '9AM-7PM',
      Tuesday: '9AM-7PM',
      Wednesday: '9AM-7PM',
      Thursday: '9AM-7PM',
      Friday: '9AM-7PM',
      Saturday: '9AM-6PM',
      Sunday: 'Closed',
    },
    services: ['sales', 'service', 'parts'],
    reviews: {
      rating: 4.4,
      count: 598,
      source: 'Google',
    },
  },
  {
    id: 'toyota-of-arlington',
    name: 'Toyota of Arlington',
    address: {
      street: '3131 E Division St',
      city: 'Arlington',
      state: 'TX',
      zipCode: '76011',
    },
    coordinates: {
      lat: 32.7434,
      lng: -97.0656,
    },
    phone: '8175550109',
    website: 'https://toyotaofarlington.com',
    hours: {
      Monday: '8AM-8PM',
      Tuesday: '8AM-8PM',
      Wednesday: '8AM-8PM',
      Thursday: '8AM-8PM',
      Friday: '8AM-8PM',
      Saturday: '8AM-7PM',
      Sunday: '11AM-6PM',
    },
    services: ['sales', 'service', 'parts', 'collision'],
    reviews: {
      rating: 4.3,
      count: 1056,
      source: 'Google',
    },
  },
];

/**
 * Seed dealers collection
 */
async function seedDealers() {
  console.log('Starting dealer seed process...');
  console.log(`Seeding ${texasToyotaDealers.length} Texas Toyota dealers`);

  const dealersCollection = adminDb.collection('dealers');

  let successCount = 0;
  let errorCount = 0;

  for (const dealer of texasToyotaDealers) {
    try {
      await dealersCollection.doc(dealer.id).set(dealer);
      console.log(`✓ Seeded: ${dealer.name} (${dealer.id})`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to seed ${dealer.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n=== Seed Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${texasToyotaDealers.length}`);

  if (errorCount === 0) {
    console.log('\n✓ All dealers seeded successfully!');
  } else {
    console.log(`\n⚠ ${errorCount} dealer(s) failed to seed`);
    process.exit(1);
  }
}

// Run the seed script
seedDealers()
  .then(() => {
    console.log('\nDealer seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error during seeding:', error);
    process.exit(1);
  });
