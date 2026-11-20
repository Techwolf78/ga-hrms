import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwj3fRAPgSSfbMpxxY-nz8-usz8w93S4U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ga-hrms-70260.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ga-hrms-70260",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ga-hrms-70260.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1054915446388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1054915446388:web:203303452423b955047321",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8KLHFLK9K3",
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider configured for single-company HRMS
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Cloud Firestore with multi-tab offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;

