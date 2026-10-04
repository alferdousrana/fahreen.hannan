/** Motion & interaction utilities: intro, cursor, scroll-spy, header, case-study steps. */

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Intro: ≤ 2.6 s, first visit only, skippable, skipped entirely for reduced motion. */
export function runIntro() {
  return new Promise((resolve) => {
    const el = document.getElementById('intro');
    let seen = false;
    try { seen = sessionStorage.getItem('fh-intro') === '1' || localStorage.getItem('fh-intro') === '1'; } catch { /* ignore */ }
    if (!el || seen || reducedMotion()) { el?.remove(); return resolve(); }
    el.hidden = false;
    const lines = [...el.querySelectorAll('li')];
    const timers = [];
    const finish = () => {
      timers.forEach(clearTimeout);
      try { localStorage.setItem('fh-intro', '1'); sessionStorage.setItem('fh-intro', '1'); } catch { /* ignore */ }
      el.classList.add('is-done');
      setTimeout(() => el.remove(), 650);
      document.removeEventListener('keydown', onKey);
      resolve();
    };
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); };
    document.addEventListener('keydown', onKey);
    el.querySelector('.intro__skip').addEventListener('click', finish);
    el.querySelector('.intro__skip').focus({ preventScroll: true });
    lines.forEach((li, i) => timers.push(setTimeout(() => li.classList.add('is-on'), 250 + i * 480)));
    timers.push(setTimeout(finish, 2600));
  });
}

/** Subtle custom cursor — fine pointers only, never with reduced motion. */
export function initCursor() {
  if (reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.querySelector('.cursor');
  if (!root) return;
  document.documentElement.classList.add('has-cursor');
  const dot = root.querySelector('.cursor__dot'), ring = root.querySelector('.cursor__ring');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; root.style.opacity = '1'; }
    root.classList.toggle('is-hover', !!e.target.closest('a, button, [role="button"], .node, canvas#globe'));
  }, { passive: true });
  document.addEventListener('mouseleave', () => { shown = false; root.style.opacity = '0'; });
  const tick = () => {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Highlights the current section in the top nav and the bottom nav. */
export function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav__list a, .bottom-nav a')];
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(a);
  });
  // Bottom nav groups: which sections light up which tab
  const groups = { home: ['home', 'profile'], journey: ['journey', 'experience', 'ecosystem', 'dhaka-cast', 'impact', 'achievements'], activities: ['activities', 'media', 'videos', 'testimonials'], gallery: ['gallery'], contact: ['education', 'research', 'training', 'contact'] };
  const bottom = [...document.querySelectorAll('.bottom-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const setActive = (id) => {
    document.querySelectorAll('.nav__list a').forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', on);
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    });
    bottom.forEach((a) => a.classList.toggle('is-active', (groups[a.dataset.bn] || []).includes(id)));
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

/** Header hides on scroll-down, returns on scroll-up. WhatsApp hides inside the hero. */
export function initHeader() {
  const header = document.getElementById('site-header');
  const wa = document.getElementById('wa-btn');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const menuOpen = document.body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 4);
    if (y < lastY - 4 || y < 400) header.classList.remove('is-hidden');
    wa?.classList.toggle('is-away', y < innerHeight * 0.6);
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
}

/** Case-study steps light up as they cross the middle of the screen. */
export function initCaseSteps() {
  const steps = [...document.querySelectorAll('.case-step')];
  const bars = [...document.querySelectorAll('#case-progress li')];
  if (!steps.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      bars.forEach((b, k) => b.classList.toggle('is-on', k <= i));
    });
  }, { rootMargin: '-40% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));
}
