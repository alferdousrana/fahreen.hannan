/** Masonry gallery + accessible lightbox (keyboard, swipe, lazy images). */
import { esc, img, safeUrl } from './render.js';

const ORDER = ['Professional', 'Healthcare', 'Events', 'Awards', 'Speaking', 'Community', 'International', 'Team'];

export function initGallery({ items, masonry, filter, lightbox }) {
  if (!masonry) return;
  if (!items.length) {
    masonry.innerHTML = '<p class="empty">Photographs added in the Admin Panel appear here, newest first.</p>';
    return;
  }

  const tiles = items
    .map((it, i) => `
      <figure class="tile" data-category="${esc(it.category || '')}" data-idx="${i}">
        <button type="button" aria-label="View image: ${esc(it.title)}">
          ${img(it.thumbUrl || it.thumbnailUrl || it.imageUrl, it.title)}
        </button>
        <figcaption><span>${esc(it.category || '')}</span>${esc(it.title)}</figcaption>
      </figure>`);

  // Row-first masonry: tiles are dealt left→right so newest stays top-left.
  let cols = 0;
  const layout = () => {
    const w = masonry.clientWidth || window.innerWidth;
    const n = w < 280 ? 1 : w < 700 ? 2 : w < 1100 ? 3 : 4;
    const shown = [...masonry.querySelectorAll('.tile')];
    if (n === cols && shown.length) return;
    cols = n;
    const nodes = shown.length ? shown : null;
    masonry.innerHTML = Array.from({ length: n }, () => '<div class="masonry__col"></div>').join('');
    const colEls = [...masonry.children];
    if (nodes) nodes.forEach((t) => colEls[+t.dataset.idx % n].appendChild(t));
    else tiles.forEach((html, i) => colEls[i % n].insertAdjacentHTML('beforeend', html));
  };
  const relayoutVisible = () => {
    // after filtering, re-deal visible tiles so there are no gaps
    const all = [...masonry.querySelectorAll('.tile')].sort((a, b) => a.dataset.idx - b.dataset.idx);
    const colEls = [...masonry.children];
    let k = 0;
    all.forEach((t) => { if (!t.classList.contains('is-hidden')) colEls[k++ % colEls.length].appendChild(t); else colEls[0].appendChild(t); });
  };
  layout();
  new ResizeObserver(() => { const before = cols; layout(); if (before !== cols) relayoutVisible(); }).observe(masonry);

  const present = ORDER.filter((c) => items.some((i) => i.category === c));
  const extra = [...new Set(items.map((i) => i.category).filter((c) => c && !ORDER.includes(c)))];
  const cats = ['All', ...present, ...extra];
  filter.innerHTML = cats.map((c, i) => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('');
  filter.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    filter.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    masonry.querySelectorAll('.tile').forEach((t) => t.classList.toggle('is-hidden', b.dataset.cat !== 'All' && t.dataset.category !== b.dataset.cat));
    relayoutVisible();
  });

  // ---- Lightbox ----
  const lbImg = lightbox.querySelector('#lb-img');
  const lbCap = lightbox.querySelector('#lb-caption');
  const lbCount = lightbox.querySelector('#lb-count');
  let order = [], pos = 0, opener = null;

  const visibleIdx = () => [...masonry.querySelectorAll('.tile:not(.is-hidden)')].map((t) => +t.dataset.idx).sort((a, b) => a - b);
  const show = () => {
    const it = items[order[pos]];
    lbImg.src = safeUrl(it.imageUrl || it.fileUrl);
    lbImg.alt = it.title || '';
    lbCap.textContent = it.title || '';
    lbCount.textContent = `${pos + 1} / ${order.length}`;
    // Preload neighbours
    [order[pos + 1], order[pos - 1]].forEach((k) => { if (k != null) { const im = new Image(); im.src = safeUrl(items[k].imageUrl); } });
  };
  const step = (d) => { pos = (pos + d + order.length) % order.length; show(); };

  masonry.addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (!t) return;
    opener = t.querySelector('button');
    order = visibleIdx();
    pos = Math.max(0, order.indexOf(+t.dataset.idx));
    show();
    lightbox.showModal();
    document.body.classList.add('is-locked');
  });
  lightbox.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lb]')?.dataset.lb;
    if (a === 'close') lightbox.close();
    else if (a === 'prev') step(-1);
    else if (a === 'next') step(1);
    else if (e.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  lightbox.addEventListener('close', () => { document.body.classList.remove('is-locked'); lbImg.removeAttribute('src'); opener?.focus(); });

  let sx = 0, sy = 0;
  lightbox.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
    else if (dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.5) lightbox.close();
  }, { passive: true });
}
