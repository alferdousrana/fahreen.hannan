/** PWA: service worker registration, install UI (no nagging), offline notice. */

const DISMISS_KEY = 'fh-install-dismissed';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
};

export function initPWA({ toast }) {
  // Service worker — relative URL keeps scope correct under /<repo>/ on GitHub Pages
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).then((reg) => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw?.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              toast('A new version of this site is ready.', [{ label: 'Refresh', primary: true, run: () => location.reload() }]);
            }
          });
        });
      }).catch((e) => console.warn('[pwa] Service worker registration failed:', e.message));
    });
  }

  const buttons = [document.getElementById('install-btn'), document.getElementById('install-btn-menu')].filter(Boolean);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let deferred = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (!standalone) buttons.forEach((b) => (b.hidden = false));
  });
  buttons.forEach((b) =>
    b.addEventListener('click', async () => {
      if (!deferred) return showManual();
      deferred.prompt();
      const { outcome } = await deferred.userChoice.catch(() => ({}));
      if (outcome) buttons.forEach((x) => (x.hidden = true));
      deferred = null;
    })
  );
  window.addEventListener('appinstalled', () => {
    buttons.forEach((b) => (b.hidden = true));
    toast('Installed. Open “Dr. Fahreen” from your home screen or app list.');
  });

  // iOS / iPadOS Safari has no install prompt → one gentle hint, once, after engagement
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  function showManual() {
    toast(isIOS
      ? 'To install: tap the Share button, then “Add to Home Screen”.'
      : 'To install: open your browser menu and choose “Install app” or “Add to Home screen”.',
      [{ label: 'Got it', run: () => store.set(DISMISS_KEY, '1') }]);
  }
  if (isIOS && isSafari && !standalone && !store.get(DISMISS_KEY)) {
    let shown = false;
    const onScroll = () => {
      if (shown || window.scrollY < window.innerHeight * 2) return;
      shown = true;
      window.removeEventListener('scroll', onScroll);
      toast('Keep this site one tap away: Share, then “Add to Home Screen”.', [
        { label: 'Not now', run: () => store.set(DISMISS_KEY, '1') }
      ], 12000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  window.addEventListener('offline', () => toast('You are offline. Some content may be unavailable.'));
  window.addEventListener('online', () => toast('Back online.', [], 2500));
}
