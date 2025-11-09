import { adminDb } from './firebase';

/**
 * Firestore collections structure for the Toyota Vehicle Shopping Experience
 * 
 * Collections:
 * - vehicles: Vehicle catalog with models and trims
 * - userProfiles: User saved data (favorites, searches, estimates, compare sets)
 * - dealerLeads: Contact requests submitted to dealers
 */

// ============================================================================
// Collection References
// ============================================================================

/**
 * Vehicles collection - Main vehicle catalog
 */
export const vehiclesCollection = () => adminDb.collection('vehicles');

/**
 * Trims subcollection for a specific vehicle
 */
export const trimsCollection = (vehicleId: string) =>
  vehiclesCollection().doc(vehicleId).collection('trims');

/**
 * User profiles collection - Stores user preferences and saved data
 */
export const userProfilesCollection = () => adminDb.collection('userProfiles');

/**
 * Dealer leads collection - Contact requests from users to dealers
 */
export const dealerLeadsCollection = () => adminDb.collection('dealerLeads');

/**
 * Dealers collection - Toyota dealership locations
 */
export const dealersCollection = () => adminDb.collection('dealers');

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform raw Firestore vehicle document to normalized format
 */
export function transformVehicleDoc(raw: VehicleDocRaw): VehicleDoc {
  // Extract all features into flat array
  const allFeatures = [
    ...(raw.features?.standard ?? []),
    ...(raw.features?.safety ?? []),
    ...(raw.features?.technology ?? []),
    ...(raw.features?.comfort ?? []),
    ...(raw.features?.exterior ?? []),
  ];

  // Determine AWD/4WD from drivetrain
  const drivetrain = raw.specs?.drivetrain?.toLowerCase() ?? '';
  const awd = drivetrain === 'awd';
  const fourWheelDrive = drivetrain === '4wd';

  // Convert Firestore timestamps
  const createdAt = raw.createdAt
    ? new Date(raw.createdAt._seconds * 1000)
    : new Date();
  const updatedAt = raw.updatedAt
    ? new Date(raw.updatedAt._seconds * 1000)
    : new Date();

  return {
    id: raw.id,
    make: raw.make,
    model: raw.model,
    year: raw.year,
    bodyStyle: raw.specs?.body ?? 'sedan',
    fuelType: raw.specs?.powertrain ?? 'gas',
    seating: raw.dimensions?.seating ?? 5,
    mpgCity: raw.performance?.mpgCity ?? null,
    mpgHighway: raw.performance?.mpgHighway ?? null,
    mpgCombined: raw.performance?.mpgCombined ?? null,
    range: raw.specs?.range ?? null,
    cargoVolume: raw.dimensions?.cargo ?? 0,
    towingCapacity: 0, // Not in current schema
    awd,
    fourWheelDrive,
    msrp: raw.pricing?.msrp ?? 0,
    features: allFeatures,
    safetyRating: null, // Not in current schema
    trims: [raw.trim],
    imageUrls: raw.img ? [raw.img] : [],
    description: raw.description ?? '',
    createdAt,
    updatedAt,
  };
}

/**
 * Get a single vehicle by ID
 */
export const getVehicleById = async (vehicleId: string) => {
  const doc = await vehiclesCollection().doc(vehicleId).get();
  if (!doc.exists) {
    return null;
  }
  const raw = { id: doc.id, ...doc.data() } as VehicleDocRaw;
  return transformVehicleDoc(raw);
};

/**
 * Get user profile by user ID (Auth0 sub)
 */
export const getUserProfile = async (userId: string) => {
  const doc = await userProfilesCollection().doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Create or update user profile
 */
export const upsertUserProfile = async (userId: string, data: Partial<UserProfileDoc>) => {
  const ref = userProfilesCollection().doc(userId);
  await ref.set(data, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
};

/**
 * Get all trims for a vehicle
 */
export const getVehicleTrims = async (vehicleId: string) => {
  const snapshot = await trimsCollection(vehicleId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get a specific trim by ID
 */
export const getTrimById = async (vehicleId: string, trimId: string) => {
  const doc = await trimsCollection(vehicleId).doc(trimId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Create a dealer lead
 */
export const createDealerLead = async (data: Omit<DealerLeadDoc, 'id' | 'createdAt' | 'status'>) => {
  const ref = await dealerLeadsCollection().add({
    ...data,
    createdAt: new Date(),
    status: 'new',
  });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
};

/**
 * Get dealer leads for a user
 */
export const getUserDealerLeads = async (userId: string) => {
  const snapshot = await dealerLeadsCollection()
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get dealer by ID
 */
export const getDealerById = async (dealerId: string) => {
  const doc = await dealersCollection().doc(dealerId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as DealerDoc;
};

/**
 * Get all dealers (for proximity search)
 */
export const getAllDealers = async () => {
  const snapshot = await dealersCollection().get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DealerDoc));
};

// ============================================================================
// Collection Interfaces (for type safety)
// ============================================================================

// Actual Firestore schema (as stored in database)
export interface VehicleDocRaw {
  id: string;
  make: string;
  model: string;
  year: number;
  name: string;
  trim: string;
  img: string;
  description: string;
  tags: string[];
  price: string;
  specs: {
    body: string; // suv, sedan, truck, etc.
    powertrain: string; // gas, hybrid, electric, etc.
    drivetrain: string; // rwd, fwd, awd, 4wd
    mpg: string;
    range: number | null;
  };
  pricing: {
    msrp: number | null;
    invoice: number | null;
    destinationCharge: number;
  };
  performance: {
    mpgCity: number | null;
    mpgHighway: number | null;
    mpgCombined: number | null;
    engineDisplacement: number | null;
    cylinders: number | null;
    horsepower: number | null;
    torque: number | null;
  };
  dimensions: {
    seating: number | null;
    cargo: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    wheelbase: number | null;
  };
  features: {
    standard: string[];
    safety: string[];
    technology: string[];
    comfort: string[];
    exterior: string[];
  };
  availability: {
    available: boolean;
    inventory: number;
    estimatedDelivery: string;
  };
  epa: Record<string, unknown>;
  vpic: Record<string, unknown>;
  carquery: Record<string, unknown>;
  sources: string[];
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
}

// Normalized interface for application use
export interface VehicleDoc {
  id: string;
  make: string;
  model: string;
  year: number;
  bodyStyle: string;
  fuelType: string;
  seating: number;
  mpgCity: number | null;
  mpgHighway: number | null;
  mpgCombined: number | null;
  range: number | null;
  cargoVolume: number;
  towingCapacity: number;
  awd: boolean;
  fourWheelDrive: boolean;
  msrp: number;
  features: string[];
  safetyRating: number | null;
  trims: string[];
  imageUrls: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrimDoc {
  id: string;
  name: string;
  msrp: number;
  features: string[];
  engine: string;
  horsepower: number;
  torque: number;
  zeroToSixty: number | null;
  transmission: string;
  driveType: string;
  imageUrls?: string[];
}

export interface UserProfileDoc {
  id: string; // User identifier (generated locally)
  email: string;
  displayName?: string;
  favorites: string[]; // Vehicle IDs
  savedSearches: SavedSearch[];
  savedCompareSets: SavedCompareSet[];
  savedEstimates: SavedEstimate[];
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedSearch {
  id: string;
  name: string;
  userNeeds: Record<string, unknown>;
  results: string[]; // Vehicle IDs
  createdAt: Date;
}

export interface SavedCompareSet {
  id: string;
  name: string;
  vehicleIds: string[];
  createdAt: Date;
}

export interface SavedEstimate {
  id: string;
  vehicleId: string;
  type: 'cash' | 'finance' | 'lease';
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: Date;
}

export interface DealerLeadDoc {
  id: string;
  userId: string;
  vehicleIds: string[];
  estimateId?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    preferredContact: string;
  };
  zipCode: string;
  message?: string;
  consent: true;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
}

export interface DealerDoc {
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
