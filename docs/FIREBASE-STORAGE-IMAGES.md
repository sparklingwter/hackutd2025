# Firebase Storage Integration for Car Images

This document explains how the application fetches and displays car images from Firebase Storage.

## Overview

The application uses Firebase Storage to store and retrieve car images dynamically. This allows for:
- Centralized image management
- Easy updates to car images without redeploying
- Reduced bundle size (images aren't stored in the public folder)
- Image caching for better performance

## Architecture

### Files Created/Modified

1. **`src/lib/firebase.ts`** - Firebase initialization and configuration
2. **`src/lib/storage.ts`** - Image fetching utilities with caching
3. **`src/components/ui/car-image.tsx`** - Reusable component for displaying car images
4. **`src/env.js`** - Updated with Firebase environment variables
5. **`src/app/result/page.tsx`** - Updated to use Firebase images
6. **`src/lib/cars.ts`** - Updated image paths to Firebase Storage format

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the root directory (if it doesn't exist) and add your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

You can find these values in your Firebase Console under:
**Project Settings → General → Your apps → SDK setup and configuration**

### 2. Upload Images to Firebase Storage

Images should be uploaded to Firebase Storage in the following structure:

```
Storage Root/
└── CarImages/
    ├── rav4-hybrid.jpg
    ├── highlander-hybrid.jpg
    ├── tacoma.jpg
    ├── camry-hybrid.jpg
    ├── crown.jpg
    └── bz4x.jpg
```

#### Using Firebase Console:
1. Go to Firebase Console → Storage
2. Create a folder named `CarImages`
3. Upload your car images to this folder

#### Using Firebase CLI:
```bash
# Upload all images at once
firebase storage:upload local-image.jpg /CarImages/image-name.jpg
```

### 3. Configure Storage Rules (Optional)

To allow public read access to car images, update your Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /CarImages/{imageId} {
      allow read: if true;  // Public read access
      allow write: if false; // Only admins can write
    }
  }
}
```

## Usage

### Using the CarImage Component

```tsx
import CarImage from "~/components/ui/car-image";

function MyComponent() {
  return (
    <CarImage
      imagePath="CarImages/rav4-hybrid.jpg"
      alt="Toyota RAV4 Hybrid"
      fill // or specify width/height
      className="object-cover"
    />
  );
}
```

### Fetching Image URLs Directly

```tsx
import { getCarImageUrl } from "~/lib/storage";

async function fetchImage() {
  const url = await getCarImageUrl("CarImages/rav4-hybrid.jpg");
  console.log(url); // Firebase download URL
}
```

### Preloading Multiple Images

```tsx
import { preloadCarImages } from "~/lib/storage";

async function preloadAll() {
  const paths = [
    "CarImages/rav4-hybrid.jpg",
    "CarImages/tacoma.jpg"
  ];
  
  const urlMap = await preloadCarImages(paths);
  // Returns Map<string, string> of path -> URL
}
```

## Image Path Format

In your data (Firestore, hardcoded arrays, etc.), use these formats:

✅ **Correct:**
- `"CarImages/rav4-hybrid.jpg"`
- `"/CarImages/rav4-hybrid.jpg"` (leading slash is optional)

❌ **Incorrect:**
- `"/cars/rav4-hybrid.jpg"` (old format)
- `"public/CarImages/rav4-hybrid.jpg"` (don't include 'public')

## Caching

The `storage.ts` utility includes in-memory caching:
- First request: Fetches from Firebase Storage
- Subsequent requests: Returns cached URL
- Clear cache: `clearImageCache()`

This reduces Firebase API calls and improves performance.

## Fallback Behavior

If an image fails to load:
1. Error is logged to console
2. Fallback placeholder is displayed: `/placeholder-car.jpg`
3. Make sure to add a placeholder image to your `public/` folder

## Firestore Integration

When fetching vehicles from Firestore, the `img` field should contain the Firebase Storage path:

```typescript
// Firestore document structure
{
  id: "rav4-hybrid-awd",
  name: "Toyota RAV4 Hybrid XSE (AWD)",
  img: "CarImages/rav4-hybrid.jpg",  // ← Firebase Storage path
  // ... other fields
}
```

Then use:
```tsx
<CarImage imagePath={vehicle.img} alt={vehicle.name} />
```

## Troubleshooting

### Images not loading?

1. **Check environment variables:**
   ```bash
   echo $NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   ```

2. **Verify images exist in Firebase Storage:**
   - Go to Firebase Console → Storage
   - Check the `CarImages` folder

3. **Check browser console:**
   - Look for Firebase errors
   - Verify the image paths in error messages

4. **Storage rules:**
   - Ensure read access is enabled for the `CarImages` folder

5. **CORS issues:**
   - Firebase Storage automatically handles CORS
   - If issues persist, check Firebase Storage CORS configuration

### Performance Issues?

- Use `preloadCarImages()` for pages with multiple images
- Consider implementing lazy loading for off-screen images
- The built-in cache helps, but consider adding service worker caching

## Next Steps

1. Add more car images to Firebase Storage
2. Create an admin interface for uploading images
3. Implement image optimization (compression, resizing)
4. Add image variants (thumbnails, full-size)
5. Consider using Firebase CDN for better global performance

## Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Next.js Image Component](https://nextjs.org/docs/api-reference/next/image)
- [Firebase Console](https://console.firebase.google.com/)
