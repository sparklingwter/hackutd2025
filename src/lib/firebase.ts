/**
 * Firebase Client SDK Configuration
 * 
 * This module initializes Firebase services for client-side usage.
 * Uses the modular v9+ API for optimal tree-shaking and bundle size.
 * 
 * @see https://firebase.google.com/docs/web/setup
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { env } from '~/env';

/**
 * Firebase configuration from environment variables
 * These are safe to expose publicly (NEXT_PUBLIC_ prefix)
 */
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase App
 * Prevents re-initialization in development with hot-reloading
 */
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

/**
 * Firebase Analytics
 * Only available in browser environment
 */
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  analytics = getAnalytics(app);
}

/**
 * Firestore Database Instance
 * NoSQL document database for storing vehicle data, user profiles, etc.
 * 
 * @see https://firebase.google.com/docs/firestore
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase Storage Instance
 * For storing vehicle images, user uploads, cached audio, etc.
 * 
 * @see https://firebase.google.com/docs/storage
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase App Instance
 * Exported for advanced use cases
 */
export { app, analytics };

/**
 * Type-safe collection references
 * Add your Firestore collection paths here for autocomplete
 */
export const COLLECTIONS = {
  VEHICLES: 'vehicles',
  USERS: 'users',
  PROFILES: 'profiles',
  SEARCHES: 'searches',
  COMPARISONS: 'comparisons',
  ESTIMATES: 'estimates',
} as const;
