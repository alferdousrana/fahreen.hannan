/**
 * Firebase Web App configuration.
 *
 * Paste the config object from:
 *   Firebase Console → Project settings → General → Your apps → Web app → SDK setup and configuration → Config
 *
 * These values identify your Firebase project to the browser. They are NOT secrets
 * and are safe to commit. Security comes from Firebase Authentication plus the
 * Firestore and Storage security rules in /firebase.
 *
 * NEVER put a service-account JSON, Admin SDK private key or any server credential here.
 *
 * Until these placeholders are replaced, the public site runs on the built-in
 * CV-based starter content and the Admin Panel shows setup instructions.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCIDf4zd4_reoXAxI3Q6AppNJfk2qEZz3c",
  authDomain: "fahreenhannan-f46cb.firebaseapp.com",
  projectId: "fahreenhannan-f46cb",
  storageBucket: "fahreenhannan-f46cb.firebasestorage.app",
  messagingSenderId: "259240662446",
  appId: "1:259240662446:web:9e64ec405065d710e5a43f",
  measurementId: "G-EEL1J4W9FZ",
};

/** Firebase JS SDK version loaded from Google's CDN (modular, ES modules). */
export const FIREBASE_SDK_VERSION = '10.12.2';
