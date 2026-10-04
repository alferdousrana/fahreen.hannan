/**
 * Public site entry point.
 * Loads content (Firestore → starter content fallback), renders every section,
 * then wires interaction. All dynamic lists are newest-first (publishedAt DESC).
 */
import { loadContent, buildLatestFeed } from './content.js';
import { JOURNEY, CASE_STUDY, ECOSYSTEM, LOCATIONS } from './seed-data.js';
import { esc, img, fmtDate, isoDate, detailView, feedCard, paragraphs, safeUrl } from './render.js';
import { runIntro, initCursor, initScrollSpy, initHeader, initCaseSteps, reducedMotion } from './animations.js';
import { initGallery } from './gallery.js';
import { renderPress, renderVideos, videoPlayerHTML } from './media.js';
import { initPWA } from './pwa.js';

document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let DATA = null;

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */
let toastTimer;
export function toast(message, actions = [], ms = 6000) {
  const el = $('#toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.innerHTML = `<span>${esc(message)}</span>${actions.map((a, i) => `<button type="button" data-i="${i}" class="${a.primary ? 'primary' : ''}">${esc(a.label)}</button>`).join('')}`;
  el.hidden = false;
  el.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    actions[+b.dataset.i]?.run?.();
    el.hidden = true;
  };
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */
const dialog = $('#dialog');
const dialogBody = $('#dialog-body');
let lastFocus = null;

function openDialog(html, label) {
  lastFocus = document.activeElement;
  dialogBody.innerHTML = html;
  dialogBody.scrollTop = 0;
  if (!dialogBody.querySelector('#dialog-title')) dialog.setAttribute('aria-label', label || 'Details');
  else dialog.removeAttribute('aria-label');
  dialog.showModal();
  document.body.classList.add('is-locked');
}
dialog.addEventListener('close', () => {
  dialogBody.innerHTML = ''; // stops any playing video
  document.body.classList.remove('is-locked');
  lastFocus?.focus?.();
});
dialog.addEventListener('click', (e) => {
  if (e.target === dialog || e.target.closest('[data-dialog-close]')) dialog.close();
  const go = e.target.closest('[data-goto]');
  if (go) { dialog.close(); setTimeout(() => $(go.dataset.goto)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }), 60); }
});

const TYPE_COLLECTION = { activity: 'activities', media: 'media', award: 'awards', article: 'articles', video: 'videos' };
function openItem(ref) {
  const [type, id] = String(ref).split(':');
  const list = DATA?.[TYPE_COLLECTION[type]] || [];
  const item = list.find((x) => x.id === id);
  if (!item) return;
  openDialog(detailView({ ...item, _type: type }, { kicker: type === 'award' ? 'Recognition' : '' }), item.title);
}
function openVideo(url, title) {
  openDialog(`<div class="journey-detail"><h2 id="dialog-title">${esc(title)}</h2>${videoPlayerHTML(url, title)}</div>`, title);
}
document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]');
  if (o && !o.closest('#loc-detail')) { e.preventDefault(); openItem(o.dataset.open); return; }
  const v = e.target.closest('[data-video]');
  if (v) { e.preventDefault(); openVideo(v.dataset.video, v.dataset.title || 'Video'); }
});

/* ------------------------------------------------------------------ */
/* Settings, contact, SEO                                              */
/* ------------------------------------------------------------------ */
function waLink(s) {
  const digits = String(s.whatsapp || '').replace(/\D/g, '');
  if (!digits) return '';
  const msg = s.whatsappMessage ? `?text=${encodeURIComponent(s.whatsappMessage)}` : '';
  return `https://wa.me/${digits}${msg}`;
}

function applySettings(d) {
  const s = d.siteSettings;
  document.documentElement.dataset.themeAccent = s.theme || 'aqua';
  $$('[data-bind]').forEach((el) => { const v = s[el.dataset.bind]; if (v) el.textContent = v; });

  const wa = waLink(s);
  const waBtn = $('#wa-btn');
  if (wa) { waBtn.href = wa; waBtn.target = '_blank'; waBtn.setAttribute('aria-label', 'Let’s connect on WhatsApp'); }
  else { waBtn.href = '#contact'; waBtn.removeAttribute('target'); waBtn.setAttribute('aria-label', 'Let’s connect'); }

  const email = $('#contact-email');
  if (s.email) { email.href = `mailto:${s.email}`; email.textContent = s.email; }

  const links = [
    s.phone && { label: 'Phone', value: s.phone, href: `tel:${s.phone.replace(/[^\d+]/g, '')}` },
    wa && { label: 'WhatsApp', value: 'Message on WhatsApp', href: wa, ext: true },
    s.linkedin && { label: 'LinkedIn', value: 'Fahreen Hannan', href: s.linkedin, ext: true },
    s.facebook && { label: 'Facebook', value: 'fahreen.hannan', href: s.facebook, ext: true },
    ...(d.socialLinks || []).map((l) => ({ label: l.category || 'Link', value: l.title, href: l.externalUrl, ext: true })),
    s.location && { label: 'Based in', value: s.location }
  ].filter(Boolean);
  $('#contact-links').innerHTML = links
    .map((l) => {
      const href = safeUrl(l.href);
      return `<li>${href
        ? `<a href="${esc(href)}"${l.ext ? ' target="_blank" rel="noopener"' : ''}><small>${esc(l.label)}</small><strong>${esc(l.value)}</strong></a>`
        : `<a role="presentation"><small>${esc(l.label)}</small><strong>${esc(l.value)}</strong></a>`}</li>`;
    })
    .join('');

  const foot = [
    s.linkedin && ['LinkedIn', s.linkedin, true],
    s.facebook && ['Facebook', s.facebook, true],
    s.email && ['Email', `mailto:${s.email}`],
    wa && ['WhatsApp', wa, true],
    ['Admin', 'admin-login.html']
  ].filter(Boolean);
  $('#footer-links').innerHTML = foot.map(([t, h, ext]) => `<li><a href="${esc(safeUrl(h))}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a></li>`).join('');
  $('#year').textContent = new Date().getFullYear();

  // Runtime SEO overrides from Admin (static tags in index.html remain the crawler baseline)
  const seo = d.seoSettings || {};
  if (d.source === 'firestore') {
    if (seo.title) document.title = seo.title;
    const setMeta = (sel, val) => { const m = $(sel); if (m && val) m.setAttribute('content', val); };
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    if (seo.canonicalUrl) $('link[rel="canonical"]')?.setAttribute('href', seo.canonicalUrl);
  }
}

/* ------------------------------------------------------------------ */
/* Section renderers                                                   */
/* ------------------------------------------------------------------ */
function renderProfile(p) {
  if (p.portraitUrl) $('#profile-img').src = safeUrl(p.portraitUrl);
  if (p.portraitCaption) $('#profile-caption').textContent = p.portraitCaption;
  $('#profile-headline').textContent = p.headline || '';
  const bio = Array.isArray(p.bio) ? p.bio.join('\n\n') : p.bio;
  $('#profile-bio').innerHTML = paragraphs(bio);
  $('#focus-list').innerHTML = (p.focusAreas || []).map((f) => `<li>${esc(f)}</li>`).join('');
}

function renderJourney() {
  const list = $('#journey-list');
  list.innerHTML = JOURNEY.map((m, i) => `
    <li class="milestone${m.year === 'Present' ? ' is-current' : ''}">
      <button class="milestone__btn" type="button" data-journey="${i}" aria-haspopup="dialog">
        <span class="milestone__year">${esc(m.year)}</span>
        <span class="milestone__node" aria-hidden="true"></span>
        <span class="milestone__title">${esc(m.title)}</span>
        <span class="milestone__sum">${esc(m.summary)}</span>
        <span class="milestone__more">Open chapter</span>
      </button>
    </li>`).join('');
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-journey]');
    if (!b) return;
    const m = JOURNEY[+b.dataset.journey];
    openDialog(`
      <div class="journey-detail">
        <div class="journey-detail__year">${esc(m.year)}</div>
        <h2 id="dialog-title">${esc(m.title)}</h2>
        <ul class="bullets">${m.detail.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
        <p style="margin-top:2rem"><button class="btn btn--primary" type="button" data-goto="${esc(m.link)}">Go to this chapter</button></p>
      </div>`, m.title);
  });
  const track = $('#journey-track');
  $$('.journey__controls [data-scroll]').forEach((b) =>
    b.addEventListener('click', () => track.scrollBy({ left: +b.dataset.scroll * (track.clientWidth * 0.8), behavior: reducedMotion() ? 'auto' : 'smooth' }))
  );
}

function renderExperience(list) {
  const current = list.find((x) => x.current) || list[0];
  const rest = list.filter((x) => x !== current);
  if (current) {
    $('#experience-current').innerHTML = `
      <article class="exp-current">
        <div>
          ${current.current ? '<p class="exp-current__now"><span class="pulse-dot" aria-hidden="true"></span>Current role</p>' : ''}
          <h3 class="exp-current__title">${esc(current.title)}</h3>
          <p class="exp-current__org">${esc(current.organization)}</p>
          <p class="exp-current__period">${esc(current.period || fmtDate(current))}${current.location ? `, ${esc(current.location)}` : ''}</p>
        </div>
        <ul class="bullets">${(current.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('') || `<li>${esc(current.description)}</li>`}</ul>
      </article>`;
  }
  $('#experience-list').innerHTML = rest.map((x) => `
    <li>
      <details class="exp-row">
        <summary>
          <span class="exp-row__period">${esc(x.period || fmtDate(x))}</span>
          <span class="exp-row__title">${esc(x.title)}<span class="exp-row__org">${esc(x.organization || '')}</span></span>
          <span class="exp-row__toggle" aria-hidden="true">+</span>
        </summary>
        <div class="exp-row__body">
          <ul class="bullets">${(x.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('') || `<li>${esc(x.description)}</li>`}</ul>
          ${x.imageUrl ? img(x.imageUrl, `${x.title}, ${x.organization}`) : ''}
        </div>
      </details>
    </li>`).join('');
}

function renderEcosystem() {
  const svg = $('#eco-svg');
  const C = 300, RAD = 215;
  const nodes = ECOSYSTEM.map((n, i) => {
    const a = -Math.PI / 2 + (i / ECOSYSTEM.length) * Math.PI * 2;
    return { ...n, x: C + Math.cos(a) * RAD, y: C + Math.sin(a) * RAD, a };
  });
  const ns = 'http://www.w3.org/2000/svg';
  let html = `<circle class="ring" cx="${C}" cy="${C}" r="${RAD}"/><circle class="ring" cx="${C}" cy="${C}" r="${RAD * 0.62}" stroke-dasharray="2 6"/>`;
  nodes.forEach((n, i) => {
    const m = nodes[(i + 3) % nodes.length];
    html += `<line class="link" x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}"/>`;
    html += `<line class="link link--flow" x1="${C}" y1="${C}" x2="${n.x}" y2="${n.y}" style="animation-delay:${-i * 0.4}s"/>`;
  });
  html += `<g class="hub"><circle cx="${C}" cy="${C}" r="74"/><text x="${C}" y="${C - 4}" text-anchor="middle">Inclusive</text><text x="${C}" y="${C + 20}" text-anchor="middle">healthcare access</text></g>`;
  nodes.forEach((n) => {
    const right = Math.cos(n.a) > 0.2, left = Math.cos(n.a) < -0.2;
    const anchor = right ? 'start' : left ? 'end' : 'middle';
    const dx = right ? 18 : left ? -18 : 0;
    const dy = Math.sin(n.a) < -0.5 ? -18 : Math.sin(n.a) > 0.5 ? 30 : 5;
    html += `<g class="node" data-eco="${n.id}" tabindex="0" role="button" aria-label="${esc(n.label)}">
      <circle cx="${n.x}" cy="${n.y}" r="10"/>
      <text x="${n.x + dx}" y="${n.y + dy}" text-anchor="${anchor}">${esc(n.label)}</text></g>`;
  });
  svg.insertAdjacentHTML('beforeend', html);
  void ns;

  const listEl = $('#eco-list');
  listEl.innerHTML = ECOSYSTEM.map((n) => `<li><button class="chip" type="button" data-eco="${n.id}" aria-pressed="false">${esc(n.label)}</button></li>`).join('');
  const detail = $('#eco-detail');
  const set = (id) => {
    const n = ECOSYSTEM.find((x) => x.id === id);
    if (!n) return;
    $$('[data-eco]').forEach((el) => {
      const on = el.dataset.eco === id;
      el.classList.toggle('is-active', on);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(on));
    });
    detail.innerHTML = `<h3>${esc(n.label)}</h3><p>${esc(n.text)}</p>`;
  };
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-eco]'); if (t) set(t.dataset.eco); });
  svg.addEventListener('keydown', (e) => {
    const t = e.target.closest('[data-eco]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); set(t.dataset.eco); }
  });
  set('healthcare');
}

function renderCase() {
  $('#case-steps').innerHTML = CASE_STUDY.map((s) => `
    <li class="case-step">
      <p class="case-step__label">${esc(s.step)}</p>
      <p class="case-step__text">${esc(s.text)}</p>
      ${s.note ? `<p class="case-step__note">${esc(s.note)}</p>` : ''}
      ${s.image ? `<figure>${img('assets/images/' + s.image, s.caption)}<figcaption>${esc(s.caption)}</figcaption></figure>` : ''}
    </li>`).join('');
  $('#case-progress').innerHTML = CASE_STUDY.map(() => '<li></li>').join('');
}

function renderImpact() {
  const rows = [
    ['Thousands', 'of online consultations enabled by the diabetes and chronic-care tools she built at Dhaka Cast.', 'CV, Dhaka Cast Limited'],
    ['1st', 'Bangladeshi winner of She Loves Tech, the global startup competition held in Beijing in 2019.', 'CV, Awards'],
    ['3 <small>countries</small>', 'where her work has been recognised or programmed: Bangladesh, China and India.', 'CV, Awards'],
    ['4 <small>sectors</small>', 'brought into her partnership work: NGOs, donor agencies, government and the private sector.', 'CV, Grameen HealthTech'],
    ['3.91', 'CGPA in her Master of Public Health in Hospital Management at North South University.', 'CV, Education'],
    ['2007', 'the year she qualified in dental surgery, the start of a career across clinic, classroom and HealthTech.', 'CV, Education']
  ];
  $('#impact-ledger').innerHTML = rows.map(([f, w, s]) => `
    <li><span class="impact__fig">${f}</span><span class="impact__what">${esc(w)}</span><span class="impact__src">Source: ${esc(s)}</span></li>`).join('');
}

function renderAwards(awards) {
  const el = $('#awards-layout');
  if (!awards.length) { el.innerHTML = '<p class="empty">Awards added in the Admin Panel appear here.</p>'; return; }
  const feature = awards.find((a) => a.featured) || awards[0];
  const rest = awards.filter((a) => a !== feature);
  el.innerHTML = `
    <article class="award-feature">
      ${feature.imageUrl ? `<div class="award-feature__img">${img(feature.imageUrl, `${feature.title} certificate`)}</div>` : ''}
      <div class="award-feature__body">
        <div class="award-feature__year">${esc(feature.year || fmtDate(feature))}</div>
        <h3>${esc(feature.title)}</h3>
        <p>${esc(feature.issuer || '')}${feature.location ? `, ${esc(feature.location)}` : ''}</p>
        <button class="btn btn--primary" type="button" data-open="award:${esc(feature.id)}">See the certificate</button>
      </div>
    </article>
    <ol class="award-list">
      ${rest.map((a) => `
        <li class="award-item">
          <button type="button" data-open="award:${esc(a.id)}">
            <span class="award-item__year">${esc(a.year || '')}</span>
            <span><span class="award-item__title">${esc(a.title)}</span><span class="award-item__issuer">${esc(a.issuer || '')}${a.location ? `, ${esc(a.location)}` : ''}</span></span>
            ${a.thumbUrl || a.imageUrl ? `<img class="award-item__thumb" src="${esc(safeUrl(a.thumbUrl || a.imageUrl))}" alt="" loading="lazy">` : '<span class="award-item__thumb--none" aria-hidden="true">★</span>'}
          </button>
        </li>`).join('')}
    </ol>`;
}

const FEED_CATS = ['Conference', 'Speaking', 'Healthcare', 'Digital Health', 'Partnership', 'Business', 'Community', 'Training', 'Award', 'Media'];
function renderFeed(data) {
  const all = buildLatestFeed(data);
  const feed = $('#feed'), more = $('#feed-more'), filter = $('#feed-filter');
  const LIMIT = 8;
  let cat = 'All', expanded = false;
  const matches = (it) => cat === 'All' || it.category === cat || (cat === 'Media' && it._type === 'media') || (cat === 'Award' && it._type === 'award');
  const draw = () => {
    const list = all.filter(matches);
    const shown = cat === 'All' && !expanded ? list.slice(0, LIMIT) : list;
    feed.innerHTML = shown.length ? shown.map((it, i) => feedCard(it, cat === 'All' ? i : 1)).join('') : '<p class="empty">Nothing in this category yet.</p>';
    more.hidden = !(cat === 'All' && list.length > LIMIT);
    more.textContent = expanded ? 'Show fewer' : `View all (${list.length})`;
  };
  const present = FEED_CATS.filter((c) => all.some((it) => it.category === c || (c === 'Media' && it._type === 'media')));
  filter.innerHTML = ['All', ...present].map((c, i) => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('');
  filter.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.dataset.cat; expanded = false;
    filter.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  });
  more.addEventListener('click', () => { expanded = !expanded; draw(); if (!expanded) $('#activities').scrollIntoView(); });
  draw();
}

function renderTestimonials(list) {
  const sec = $('#testimonials');
  if (!list.length) { sec.hidden = true; return; }
  sec.hidden = false;
  $('#testi-grid').innerHTML = list.map((t) => `
    <blockquote class="testi"><p>“${esc(t.content || t.description)}”</p><footer>${esc(t.title)}${t.category ? `, ${esc(t.category)}` : ''}</footer></blockquote>`).join('');
}

function renderAcademic(d) {
  $('#edu-list').innerHTML = d.education.map((e) => `
    <li class="edu-item">
      <span class="edu-item__year">${esc(e.year || fmtDate(e))}</span>
      <div>
        <h3 class="edu-item__deg">${esc(e.title)}</h3>
        ${e.field ? `<p class="edu-item__field">${esc(e.field)}</p>` : ''}
        <p class="edu-item__inst">${esc(e.institution || '')}</p>
      </div>
      ${e.detail ? `<span class="edu-item__badge">${esc(e.detail)}</span>` : '<span></span>'}
    </li>`).join('');
  $('#research-list').innerHTML = d.research.map((r) => `
    <li><h3>${esc(r.title)}</h3><p>${esc(r.category || 'Thesis')}, ${esc(r.institution || '')}${r.year ? ` (${esc(r.year)})` : ''}</p>
    ${r.externalUrl ? `<p><a href="${esc(safeUrl(r.externalUrl))}" target="_blank" rel="noopener">Read</a></p>` : ''}</li>`).join('') || '<li><p>Research entries appear here.</p></li>';
  $('#training-list').innerHTML = d.training.map((t) => `
    <li><h3>${esc(t.title)}</h3><p>${esc(t.description || '')}${t.description ? '. ' : ''}${esc(t.institution || '')}${t.year ? `, ${esc(t.year)}` : ''}${t.duration ? ` (${esc(t.duration)})` : ''}</p></li>`).join('');
}

/* ------------------------------------------------------------------ */
/* Mobile menu                                                         */
/* ------------------------------------------------------------------ */
function initMenu() {
  const btn = $('#menu-btn'), menu = $('#mobile-menu'), list = $('#mobile-menu-list');
  const build = () => {
    list.innerHTML = $$('#nav-list li:not([hidden]) a')
      .map((a, i) => `<li><a href="${a.getAttribute('href')}" data-close><span>${String(i + 1).padStart(2, '0')}</span>${esc(a.textContent)}</a></li>`)
      .join('');
  };
  const open = () => {
    build();
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    btn.setAttribute('aria-expanded', 'true');
    btn.querySelector('.sr-only').textContent = 'Close menu';
    document.body.classList.add('is-locked', 'menu-open');
    list.querySelector('a')?.focus();
  };
  const close = (focusBtn = true) => {
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.querySelector('.sr-only').textContent = 'Open menu';
    document.body.classList.remove('is-locked', 'menu-open');
    setTimeout(() => (menu.hidden = true), 300);
    if (focusBtn) btn.focus();
  };
  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open()));
  menu.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close(); });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
function renderAll(d) {
  const steps = [
    () => applySettings(d),
    () => renderProfile(d.profiles),
    renderJourney,
    () => renderExperience(d.experiences),
    renderEcosystem,
    renderCase,
    renderImpact,
    () => renderAwards(d.awards),
    () => renderFeed(d),
    () => renderPress({ items: d.media, list: $('#press-list'), filter: $('#media-filter') }),
    () => renderVideos({ items: d.videos, grid: $('#video-grid'), section: $('#videos'), navItem: $('[data-requires="videos"]') }),
    () => renderTestimonials(d.testimonials),
    () => initGallery({ items: d.gallery, masonry: $('#masonry'), filter: $('#gallery-filter'), lightbox: $('#lightbox') }),
    () => renderAcademic(d)
  ];
  for (const s of steps) {
    try { s(); } catch (err) { console.error('[render]', err); }
  }
}

function lazyGlobe() {
  const block = $('#globe-block');
  if (!block) return;
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const { initGlobe } = await import('./globe.js');
    initGlobe({ canvas: $('#globe'), list: $('#loc-list'), detail: $('#loc-detail'), locations: LOCATIONS, onOpenActivity: openItem });
  }, { rootMargin: '400px 0px' });
  io.observe(block);
}

async function main() {
  const safety = setTimeout(() => document.body.classList.add('is-ready'), 4500);
  initPWA({ toast });
  const intro = runIntro();
  import('./hero3d.js').then((m) => m.initHero()).catch((e) => console.warn('[hero]', e));
  DATA = await loadContent();
  renderAll(DATA);
  initMenu();
  await intro;
  clearTimeout(safety);
  document.body.classList.add('is-ready');
  initScrollSpy();
  initHeader();
  initCaseSteps();
  initCursor();
  lazyGlobe();
  if (location.hash && location.hash.length > 1) $(location.hash)?.scrollIntoView();
}

main();
