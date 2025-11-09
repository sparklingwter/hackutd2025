# 🚀 Quick Start: Firebase Storage for Car Images

## What Changed?

Your app now loads car images from Firebase Storage instead of the local `public` folder. This means:
- ✅ Images load dynamically from the cloud
- ✅ You can update images without redeploying
- ✅ Automatic caching for better performance
- ✅ Fallback placeholders if images are missing

## 🔧 Setup (3 Steps)

### Step 1: Add Firebase Config to .env

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Get your Firebase config from [Firebase Console](https://console.firebase.google.com/):
   - Select your project
   - Click ⚙️ Settings → Project settings
   - Scroll to "Your apps" → Click your web app
   - Copy the config values

3. Paste into `.env`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

### Step 2: Upload Images to Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/) → Storage
2. Click **Get started** (if needed)
3. Create a folder named `CarImages`
4. Upload these images:
   - `rav4-hybrid.jpg`
   - `highlander-hybrid.jpg`
   - `tacoma.jpg`
   - `camry-hybrid.jpg`
   - `crown.jpg`
   - `bz4x.jpg`

**Important:** Image names must match exactly (case-sensitive)!

### Step 3: Set Storage Rules

1. In Firebase Console → Storage → Rules tab
2. Replace with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /CarImages/{imageId} {
         allow read: if true;
         allow write: if false;
       }
     }
   }
   ```
3. Click **Publish**

## ▶️ Run It

```bash
# Restart your dev server
npm run dev
```

Navigate to `http://localhost:3000/result` and you should see car images loading from Firebase!

## ✅ Verify It's Working

Open your browser console (F12) and look for:
- ✅ No Firebase errors
- ✅ Images loading with Firebase Storage URLs
- ✅ "Fetching image from Firebase Storage" logs (if any)

## 🚨 Troubleshooting

### Images show placeholder?
- Check Firebase Storage has the images in `CarImages/` folder
- Verify image names match exactly
- Check browser console for error messages

### "Firebase Error: invalid-api-key"?
- Check `.env` file exists and has correct values
- Restart dev server after changing `.env`

### "Permission denied" errors?
- Update Storage Rules (Step 3 above)
- Wait 10 seconds for rules to propagate

## 📚 More Info

- **Quick Setup Guide**: `docs/FIREBASE-STORAGE-SETUP.md`
- **Full Documentation**: `docs/FIREBASE-STORAGE-IMAGES.md`
- **Summary of Changes**: `docs/FIREBASE-STORAGE-SUMMARY.md`

## 🎯 What's Next?

Once images are loading:
1. Add more car images to Firebase Storage
2. Update `src/lib/cars.ts` with new car entries
3. Images will automatically load from Firebase

---

**Need help?** Check the troubleshooting guides in the `docs/` folder!
