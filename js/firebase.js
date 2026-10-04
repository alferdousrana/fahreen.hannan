/**
 * Thin, lazy Firebase loader.
 * - The SDK is only downloaded when the config is filled in.
 * - The public site loads app + Firestore only; Auth and Storage load on admin pages.
 */
import { firebaseConfig, FIREBASE_SDK_VERSION } from './firebase-config.js';

const BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/`;

export const isConfigured = Boolean(
  firebaseConfig &&
    firebaseConfig.apiKey &&
    !String(firebaseConfig.apiKey).startsWith('YOUR_') &&
    firebaseConfig.projectId &&
    !String(firebaseConfig.projectId).startsWith('YOUR_')
);

let appP, fsP, authP, stP;

export function getApp() {
  if (!isConfigured) return Promise.resolve(null);
  return (appP ||= import(BASE + 'firebase-app.js').then((m) =>
    m.getApps().length ? m.getApp() : m.initializeApp(firebaseConfig)
  ));
}

/** Returns { db, fs } where fs is the firestore module namespace. */
export function getFirestoreBundle() {
  if (!isConfigured) return Promise.resolve(null);
  return (fsP ||= Promise.all([getApp(), import(BASE + 'firebase-firestore.js')]).then(([app, fs]) => ({
    db: fs.getFirestore(app),
    fs
  })));
}

/** Returns { auth, au } where au is the auth module namespace. */
export function getAuthBundle() {
  if (!isConfigured) return Promise.resolve(null);
  return (authP ||= Promise.all([getApp(), import(BASE + 'firebase-auth.js')]).then(async ([app, au]) => {
    const auth = au.getAuth(app);
    await au.setPersistence(auth, au.browserLocalPersistence).catch(() => {});
    return { auth, au };
  }));
}

/** Returns { storage, st } where st is the storage module namespace. */
export function getStorageBundle() {
  if (!isConfigured) return Promise.resolve(null);
  return (stP ||= Promise.all([getApp(), import(BASE + 'firebase-storage.js')]).then(([app, st]) => ({
    storage: st.getStorage(app),
    st
  })));
}

/** Converts Firestore Timestamp | Date | ISO string | number → Date (or null). */
export function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v === 'object' && typeof v.seconds === 'number') return new Date(v.seconds * 1000);
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
