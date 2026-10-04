/* Service worker — app shell caching that never interferes with Firebase.
 * Bump VERSION whenever you change CSS/JS so visitors get the update. */
const VERSION = 'fh-v1.0.0';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

// Relative to the SW location → works at https://user.github.io/repo/ and on a custom domain.
const CORE = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './favicon.ico',
  './css/style.css',
  './css/responsive.css',
  './js/app.js',
  './js/animations.js',
  './js/content.js',
  './js/render.js',
  './js/seed-data.js',
  './js/firebase.js',
  './js/firebase-config.js',
  './js/gallery.js',
  './js/media.js',
  './js/pwa.js',
  './js/hero3d.js',
  './js/globe.js',
  './assets/fonts/cormorant.woff2',
  './assets/fonts/cormorant-italic.woff2',
  './assets/fonts/manrope.woff2',
  './assets/fonts/space-grotesk.woff2',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon-32.png',
  './assets/images/portrait.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never touch cross-origin traffic: Firebase (Firestore, Auth, Storage), gstatic SDK, embeds.
  if (url.origin !== self.location.origin) return;

  // Admin pages are always fresh and never cached.
  if (/admin(-login)?\.html$/.test(url.pathname) || url.pathname.endsWith('/js/admin.js') || url.pathname.endsWith('/js/admin-login.js')) return;

  // Page navigations: network first, then cached shell, then offline page.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(RUNTIME).then((c) => c.put(req, copy)); return res; })
        .catch(async () => (await caches.match(req)) || (await caches.match('./index.html')) || caches.match('./offline.html'))
    );
    return;
  }

  // Images: cache first (they rarely change), capped runtime cache.
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(RUNTIME).then((c) => { c.put(req, copy); trim(RUNTIME, 80); }); }
        return res;
      }).catch(() => new Response('', { status: 504 })))
    );
    return;
  }

  // CSS / JS / fonts / JSON: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(SHELL).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

async function trim(name, max) {
  const c = await caches.open(name);
  const keys = await c.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => c.delete(k)));
}
