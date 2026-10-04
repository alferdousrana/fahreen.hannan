import { isConfigured, getAuthBundle, getFirestoreBundle } from './firebase.js';

const form = document.getElementById('login-form');
const err = document.getElementById('login-error');
const btn = document.getElementById('login-btn');
const showErr = (m) => { err.textContent = m; err.hidden = !m; };

const MESSAGES = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, or reset your password.',
  'auth/network-request-failed': 'No connection to Firebase. Check your internet connection.',
  'auth/unauthorized-domain': 'This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Email/Password sign-in is disabled. Enable it in Firebase → Authentication → Sign-in method.'
};

async function init() {
  if (!isConfigured) {
    document.getElementById('setup-notice').hidden = false;
    form.querySelectorAll('input, button').forEach((el) => (el.disabled = true));
    return;
  }
  const { auth, au } = await getAuthBundle();
  au.onAuthStateChanged(auth, (user) => { if (user) location.replace('admin.html'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showErr('');
    const email = form.email.value.trim(), password = form.password.value;
    if (!email || !password) return showErr('Enter your email and password.');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      const cred = await au.signInWithEmailAndPassword(auth, email, password);
      // Confirm admin status before entering
      const { db, fs } = await getFirestoreBundle();
      const snap = await fs.getDoc(fs.doc(db, 'admins', cred.user.uid)).catch(() => null);
      if (!snap || !snap.exists()) {
        await au.signOut(auth);
        showErr(`This account is not an administrator. Ask the site owner to add UID ${cred.user.uid} to the “admins” collection.`);
        return;
      }
      location.replace('admin.html');
    } catch (ex) {
      showErr(MESSAGES[ex.code] || `Sign-in failed (${ex.code || ex.message}).`);
    } finally {
      btn.disabled = false; btn.textContent = 'Sign in';
    }
  });

  document.getElementById('reset-btn').addEventListener('click', async () => {
    const email = form.email.value.trim();
    if (!email) return showErr('Enter your email above, then select “Forgot password?” again.');
    try {
      await au.sendPasswordResetEmail(auth, email);
      showErr('');
      err.hidden = false; err.textContent = `If ${email} is registered, a reset link is on its way.`;
    } catch (ex) { showErr(MESSAGES[ex.code] || ex.message); }
  });
}
init();
