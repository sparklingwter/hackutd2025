import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Cache for image URLs to avoid repeated Firebase calls
 */
const imageUrlCache = new Map<string, string>();

/**
 * Fetches the download URL for a car image from Firebase Storage
 * @param imagePath - The path to the image in Firebase Storage (e.g., "CarImages/rav4-hybrid.jpg")
 * @returns Promise resolving to the download URL or a fallback placeholder
 */
export async function getCarImageUrl(imagePath: string): Promise<string> {
  // Check cache first
  if (imageUrlCache.has(imagePath)) {
    return imageUrlCache.get(imagePath)!;
  }

  try {
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Create reference to the file in Firebase Storage
    const imageRef = ref(storage, cleanPath);
    
    // Get the download URL
    const url = await getDownloadURL(imageRef);
    
    // Cache the URL
    imageUrlCache.set(imagePath, url);
    
    return url;
  } catch (error) {
    console.error(`Error fetching image from Firebase Storage: ${imagePath}`, error);
    
    // Return a placeholder image or fallback
    return '/placeholder-car.svg';
  }
}

/**
 * Preloads multiple car images in parallel
 * @param imagePaths - Array of image paths to preload
 * @returns Promise resolving to a map of path -> URL
 */
export async function preloadCarImages(imagePaths: string[]): Promise<Map<string, string>> {
  const results = await Promise.allSettled(
    imagePaths.map(async (path) => ({
      path,
      url: await getCarImageUrl(path),
    }))
  );

  const urlMap = new Map<string, string>();
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      urlMap.set(result.value.path, result.value.url);
    }
  });

  return urlMap;
}

/**
 * Clears the image URL cache (useful for testing or if images are updated)
 */
export function clearImageCache(): void {
  imageUrlCache.clear();
}

/**
 * Gets a car image URL from Firestore document
 * The img field in Firestore should be in format: "CarImages/filename.jpg" or "/CarImages/filename.jpg"
 */
export async function getCarImageFromFirestore(firestoreImgPath: string): Promise<string> {
  // Handle both "/CarImages/..." and "CarImages/..." formats
  const storagePath = firestoreImgPath.startsWith('/') 
    ? firestoreImgPath.slice(1) 
    : firestoreImgPath;
  
  return getCarImageUrl(storagePath);
}
