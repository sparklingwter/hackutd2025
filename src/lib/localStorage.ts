/**
 * T043 [P] [US4]: localStorage wrapper utility for anonymous users
 * 
 * This utility provides type-safe access to browser localStorage for storing
 * user data when not authenticated. Data includes favorites, compare sets,
 * estimates, and saved searches.
 */

import { z } from "zod";
import {
  UserNeedsProfileSchema,
  CompareSetSchema,
  EstimateSchema,
} from "~/server/api/schemas";

// ============================================================================
// Schema Definitions
// ============================================================================

const AnonymousDataSchema = z.object({
  favorites: z.array(z.string()).default([]),
  compareSets: z.array(CompareSetSchema).default([]),
  estimates: z.array(EstimateSchema).default([]),
  savedSearches: z.array(UserNeedsProfileSchema).default([]),
  preferences: UserNeedsProfileSchema.optional(),
  voiceEnabled: z.boolean().default(true),
});

export type AnonymousData = z.infer<typeof AnonymousDataSchema>;

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "toyota_anonymous_data";
const STORAGE_VERSION = "1.0";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if localStorage is available (server-safe)
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const test = "__localStorage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get anonymous data from localStorage
 */
export function getAnonymousData(): AnonymousData {
  if (!isLocalStorageAvailable()) {
    return {
      favorites: [],
      compareSets: [],
      estimates: [],
      savedSearches: [],
      voiceEnabled: true,
    };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        favorites: [],
        compareSets: [],
        estimates: [],
        savedSearches: [],
        voiceEnabled: true,
      };
    }

    const parsed = JSON.parse(stored) as { data: unknown };
    
    // Validate and return with schema
    return AnonymousDataSchema.parse(parsed.data);
  } catch (error) {
    console.error("Failed to parse anonymous data from localStorage:", error);
    // Return empty data on error
    return {
      favorites: [],
      compareSets: [],
      estimates: [],
      savedSearches: [],
      voiceEnabled: true,
    };
  }
}

/**
 * Set anonymous data to localStorage
 */
export function setAnonymousData(data: AnonymousData): void {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available");
    return;
  }

  try {
    const validated = AnonymousDataSchema.parse(data);
    const toStore = {
      version: STORAGE_VERSION,
      data: validated,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error("Failed to save anonymous data to localStorage:", error);
  }
}

/**
 * Clear all anonymous data from localStorage
 */
export function clearAnonymousData(): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear anonymous data:", error);
  }
}

// ============================================================================
// Favorites Management
// ============================================================================

/**
 * T044 [US4]: Add vehicle to anonymous favorites
 */
export function addAnonymousFavorite(vehicleId: string): void {
  const data = getAnonymousData();
  if (!data.favorites.includes(vehicleId)) {
    data.favorites.push(vehicleId);
    setAnonymousData(data);
  }
}

/**
 * Remove vehicle from anonymous favorites
 */
export function removeAnonymousFavorite(vehicleId: string): void {
  const data = getAnonymousData();
  data.favorites = data.favorites.filter((id) => id !== vehicleId);
  setAnonymousData(data);
}

/**
 * Get anonymous favorites
 */
export function getAnonymousFavorites(): string[] {
  const data = getAnonymousData();
  return data.favorites;
}

/**
 * Check if vehicle is favorited
 */
export function isVehicleFavorited(vehicleId: string): boolean {
  const data = getAnonymousData();
  return data.favorites.includes(vehicleId);
}

// ============================================================================
// Compare Sets Management
// ============================================================================

/**
 * T045 [P] [US4]: Save compare set to anonymous storage
 */
export function saveAnonymousCompareSet(compareSet: z.infer<typeof CompareSetSchema>): void {
  const data = getAnonymousData();
  
  // Remove existing compare set with same ID if exists
  data.compareSets = data.compareSets.filter((set) => set.id !== compareSet.id);
  
  // Add new compare set
  data.compareSets.push(compareSet);
  setAnonymousData(data);
}

/**
 * Get anonymous compare sets
 */
export function getAnonymousCompareSets(): Array<z.infer<typeof CompareSetSchema>> {
  const data = getAnonymousData();
  return data.compareSets;
}

/**
 * Delete anonymous compare set
 */
export function deleteAnonymousCompareSet(compareSetId: string): void {
  const data = getAnonymousData();
  data.compareSets = data.compareSets.filter((set) => set.id !== compareSetId);
  setAnonymousData(data);
}

// ============================================================================
// Estimates Management
// ============================================================================

/**
 * T039 [P] [US4]: Save estimate to anonymous storage
 */
export function saveAnonymousEstimate(estimate: z.infer<typeof EstimateSchema>): void {
  const data = getAnonymousData();
  
  // Remove existing estimate with same ID if exists
  data.estimates = data.estimates.filter((est) => est.id !== estimate.id);
  
  // Add new estimate
  data.estimates.push(estimate);
  setAnonymousData(data);
}

/**
 * Get anonymous estimates
 */
export function getAnonymousEstimates(): Array<z.infer<typeof EstimateSchema>> {
  const data = getAnonymousData();
  return data.estimates;
}

/**
 * Delete anonymous estimate
 */
export function deleteAnonymousEstimate(estimateId: string): void {
  const data = getAnonymousData();
  data.estimates = data.estimates.filter((est) => est.id !== estimateId);
  setAnonymousData(data);
}

// ============================================================================
// Saved Searches Management
// ============================================================================

/**
 * Save discovery search to anonymous storage
 */
export function saveAnonymousSearch(search: z.infer<typeof UserNeedsProfileSchema>): void {
  const data = getAnonymousData();
  data.savedSearches.push(search);
  setAnonymousData(data);
}

/**
 * Get anonymous saved searches
 */
export function getAnonymousSavedSearches(): Array<z.infer<typeof UserNeedsProfileSchema>> {
  const data = getAnonymousData();
  return data.savedSearches;
}

/**
 * Delete anonymous saved search by index
 */
export function deleteAnonymousSavedSearch(index: number): void {
  const data = getAnonymousData();
  if (index >= 0 && index < data.savedSearches.length) {
    data.savedSearches.splice(index, 1);
    setAnonymousData(data);
  }
}

// ============================================================================
// Preferences Management
// ============================================================================

/**
 * Set anonymous user preferences
 */
export function setAnonymousPreferences(preferences: z.infer<typeof UserNeedsProfileSchema>): void {
  const data = getAnonymousData();
  data.preferences = preferences;
  setAnonymousData(data);
}

/**
 * Get anonymous user preferences
 */
export function getAnonymousPreferences(): z.infer<typeof UserNeedsProfileSchema> | undefined {
  const data = getAnonymousData();
  return data.preferences;
}

/**
 * Set voice enabled preference
 */
export function setAnonymousVoiceEnabled(enabled: boolean): void {
  const data = getAnonymousData();
  data.voiceEnabled = enabled;
  setAnonymousData(data);
}

/**
 * Get voice enabled preference
 */
export function getAnonymousVoiceEnabled(): boolean {
  const data = getAnonymousData();
  return data.voiceEnabled;
}

// ============================================================================
// Migration to Authenticated Profile
// ============================================================================

/**
 * T044 [US4]: Get data for migration to authenticated profile
 * Returns all anonymous data that should be migrated when user signs in
 */
export function getDataForMigration(): AnonymousData {
  return getAnonymousData();
}

/**
 * Check if there is anonymous data that should be migrated
 */
export function hasDataToMigrate(): boolean {
  const data = getAnonymousData();
  return (
    data.favorites.length > 0 ||
    data.compareSets.length > 0 ||
    data.estimates.length > 0 ||
    data.savedSearches.length > 0 ||
    data.preferences !== undefined
  );
}
