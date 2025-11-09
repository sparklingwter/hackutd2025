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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a single vehicle by ID
 */
export const getVehicleById = async (vehicleId: string) => {
  const doc = await vehiclesCollection().doc(vehicleId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
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

// ============================================================================
// Collection Interfaces (for type safety)
// ============================================================================

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
  id: string; // Auth0 sub
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
