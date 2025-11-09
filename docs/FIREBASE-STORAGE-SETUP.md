# Firebase Storage Setup Guide

## Quick Start

### 1. Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon (⚙️) → **Project settings**
4. Scroll to **Your apps** section
5. Click on your web app (or create one if none exists)
6. Copy the configuration values

### 2. Create .env File

Create a `.env` file in the root of your project:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 3. Upload Car Images

#### Option A: Firebase Console
1. Go to Firebase Console → **Storage**
2. Click **Get started** (if first time)
3. Create folder named `CarImages`
4. Upload your images:
   - rav4-hybrid.jpg
   - highlander-hybrid.jpg
   - tacoma.jpg
   - camry-hybrid.jpg
   - crown.jpg
   - bz4x.jpg

#### Option B: Firebase CLI
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init storage

# Upload images
firebase storage:upload ./my-images/rav4-hybrid.jpg /CarImages/rav4-hybrid.jpg
```

### 4. Update Storage Rules

In Firebase Console → Storage → Rules, use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to car images
    match /CarImages/{imageId} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can upload
    }
  }
}
```

Click **Publish** to save the rules.

### 5. Test It Out

Restart your dev server:
```bash
npm run dev
```

Navigate to the results page and verify images load from Firebase Storage.

## Troubleshooting

### ❌ "Firebase: Error (auth/invalid-api-key)"
- Check your `.env` file has the correct `NEXT_PUBLIC_FIREBASE_API_KEY`
- Restart your dev server after adding .env variables

### ❌ Images show placeholder
- Verify images are uploaded to `CarImages/` folder in Firebase Storage
- Check image names match exactly (case-sensitive)
- Open browser console to see detailed error messages

### ❌ "Permission denied" errors
- Update Storage Rules to allow public read access (see step 4)
- Wait a few seconds after publishing rules for them to take effect

### ❌ CORS errors
- Firebase Storage should handle CORS automatically
- If issues persist, add CORS configuration via Firebase CLI:
  ```bash
  firebase storage:cors:set cors.json
  ```
  
  With `cors.json`:
  ```json
  [
    {
      "origin": ["*"],
      "method": ["GET"],
      "maxAgeSeconds": 3600
    }
  ]
  ```

## Image Requirements

- **Format:** JPG, PNG, or WebP recommended
- **Size:** Recommended 800x600px or larger
- **File size:** Keep under 500KB for better performance
- **Naming:** Use lowercase with hyphens (e.g., `rav4-hybrid.jpg`)

## Next Steps

- ✅ Images now load from Firebase Storage
- ✅ Automatic caching improves performance
- ✅ Easy to update images without redeploying

For more details, see [FIREBASE-STORAGE-IMAGES.md](./FIREBASE-STORAGE-IMAGES.md)
