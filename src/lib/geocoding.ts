/**
 * Geocoding utilities for converting ZIP codes to lat/long coordinates
 * Uses Google Maps Geocoding API
 */

import { env } from "~/env";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult extends Coordinates {
  zipCode: string;
  city?: string;
  state?: string;
  formattedAddress?: string;
}

/**
 * In-memory cache for geocoded ZIP codes (simple LRU-like cache)
 * In production, consider using Redis or similar
 */
const geocodeCache = new Map<string, GeocodingResult>();
const MAX_CACHE_SIZE = 1000;

/**
 * Convert ZIP code to latitude/longitude using Google Maps Geocoding API
 * Results are cached to avoid redundant API calls
 */
export async function geocodeZipCode(zipCode: string): Promise<GeocodingResult> {
  // Validate ZIP code format
  if (!/^\d{5}$/.test(zipCode)) {
    throw new Error('Invalid ZIP code format. Must be 5 digits.');
  }

  // Check cache first
  const cached = geocodeCache.get(zipCode);
  if (cached) {
    return cached;
  }

  try {
    // Call Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${env.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json() as {
      status: string;
      results?: Array<{
        geometry: { location: { lat: number; lng: number } };
        address_components?: Array<{
          long_name: string;
          types: string[];
        }>;
        formatted_address?: string;
      }>;
      error_message?: string;
    };

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(
        data.error_message ?? `Unable to geocode ZIP code: ${zipCode}`
      );
    }

    const result = data.results[0]!;
    const { lat, lng } = result.geometry.location;

    // Extract city and state from address components
    let city: string | undefined;
    let state: string | undefined;

    if (result.address_components) {
      for (const component of result.address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
      }
    }

    const geocodingResult: GeocodingResult = {
      zipCode,
      lat,
      lng,
      city,
      state,
      formattedAddress: result.formatted_address,
    };

    // Cache the result
    if (geocodeCache.size >= MAX_CACHE_SIZE) {
      // Simple eviction: remove oldest entry
      const firstKey = geocodeCache.keys().next().value!;
      geocodeCache.delete(firstKey);
    }
    geocodeCache.set(zipCode, geocodingResult);

    return geocodingResult;
  } catch (error) {
    console.error(`Failed to geocode ZIP code ${zipCode}:`, error);
    throw new Error(
      `Unable to find location for ZIP code ${zipCode}. Please verify the ZIP code and try again.`
    );
  }
}

/**
 * Calculate the distance in miles between two points using the Haversine formula
 * @param lat1 Latitude of point 1 in degrees
 * @param lng1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lng2 Longitude of point 2 in degrees
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
