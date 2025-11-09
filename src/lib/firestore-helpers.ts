import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { getCarImageUrl } from './storage';
import type { VehicleDocument } from '~/types/firestore';

/**
 * Car type with Firebase Storage image URL
 */
export type CarWithImageUrl = Omit<VehicleDocument, 'img'> & {
  img: string;
  imageUrl: string; // Resolved Firebase Storage URL
};

/**
 * Fetches vehicles from Firestore with resolved image URLs
 * @param filters - Optional Firestore query constraints
 * @returns Array of vehicles with image URLs from Firebase Storage
 */
export async function fetchVehiclesFromFirestore(
  filters?: QueryConstraint[]
): Promise<CarWithImageUrl[]> {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = filters ? query(vehiclesRef, ...filters) : vehiclesRef;
    
    const snapshot = await getDocs(q);
    
    // Fetch all vehicles and their image URLs in parallel
    const vehicles = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as VehicleDocument;
        
        // Fetch the image URL from Firebase Storage
        const imageUrl = await getCarImageUrl(data.img);
        
        return {
          ...data,
          imageUrl,
        };
      })
    );
    
    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicles from Firestore:', error);
    throw error;
  }
}

/**
 * Fetches a single vehicle by ID from Firestore with resolved image URL
 * @param vehicleId - The vehicle document ID
 * @returns Vehicle with image URL or null if not found
 */
export async function fetchVehicleById(vehicleId: string): Promise<CarWithImageUrl | null> {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('id', '==', vehicleId), limit(1));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn(`Vehicle with ID ${vehicleId} not found`);
      return null;
    }
    
    const doc = snapshot.docs[0]!;
    const data = doc.data() as VehicleDocument;
    const imageUrl = await getCarImageUrl(data.img);
    
    return {
      ...data,
      imageUrl,
    };
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId}:`, error);
    throw error;
  }
}

/**
 * Fetches vehicles filtered by tags/keywords
 * @param tags - Array of tags to filter by (e.g., ["hybrid", "suv"])
 * @returns Array of matching vehicles with image URLs
 */
export async function fetchVehiclesByTags(tags: string[]): Promise<CarWithImageUrl[]> {
  if (tags.length === 0) {
    return fetchVehiclesFromFirestore();
  }
  
  try {
    const vehiclesRef = collection(db, 'vehicles');
    // Firestore doesn't support array-contains-any with more than 10 items
    const tagFilter = tags.slice(0, 10);
    const q = query(vehiclesRef, where('tags', 'array-contains-any', tagFilter));
    
    const snapshot = await getDocs(q);
    
    const vehicles = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as VehicleDocument;
        const imageUrl = await getCarImageUrl(data.img);
        
        return {
          ...data,
          imageUrl,
        };
      })
    );
    
    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicles by tags:', error);
    throw error;
  }
}

/**
 * Example usage in a component:
 * 
 * ```tsx
 * import { fetchVehiclesFromFirestore } from '~/lib/firestore-helpers';
 * import CarImage from '~/components/ui/car-image';
 * 
 * export default async function VehiclesPage() {
 *   const vehicles = await fetchVehiclesFromFirestore();
 *   
 *   return (
 *     <div>
 *       {vehicles.map(vehicle => (
 *         <div key={vehicle.id}>
 *           <h2>{vehicle.name}</h2>
 *           <CarImage 
 *             imagePath={vehicle.img} 
 *             alt={vehicle.name}
 *           />
 *           {* Or use the pre-fetched URL directly: *}
 *           <img src={vehicle.imageUrl} alt={vehicle.name} />
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
