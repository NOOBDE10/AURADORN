import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import type { Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase config missing: set the VITE_FIREBASE_* variables (see .env.example).');
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Firestore Lite: small REST-based client used by the storefront (reads + admin writes).
 * The full SDK (real-time listeners) is only loaded inside the admin panel.
 */
export const db = getFirestore(app);

/** Firebase Auth is only needed by admins, so it is loaded on demand. */
let authPromise: Promise<Auth> | null = null;
export function getAuthLazy(): Promise<Auth> {
  if (!authPromise) {
    authPromise = import('firebase/auth').then(({ getAuth }) => getAuth(app));
  }
  return authPromise;
}

/** Set after an admin signs in, so returning admins restore their session automatically. */
export const ADMIN_SESSION_FLAG = 'aura_adorn_admin_session';
