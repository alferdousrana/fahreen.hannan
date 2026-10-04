/** Press list and video section (YouTube, Facebook, LinkedIn, Vimeo, Firebase Storage files). */
import { esc, img, fmtDate, isoDate, safeUrl } from './render.js';

export function parseVideo(url) {
  const u = safeUrl(url);
  if (!u) return null;
  let m;
  if ((m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/i)))
    return { kind: 'youtube', id: m[1], embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i)))
    return { kind: 'vimeo', embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1` };
  if (/facebook\.com|fb\.watch/i.test(u))
    return { kind: 'facebook', embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true` };
  if (/linkedin\.com/i.test(u)) {
    if (/\/embed\//.test(u)) return { kind: 'linkedin', embed: u };
    const urn = u.match(/urn:li:(?:activity|ugcPost|share):\d+/);
    if (urn) return { kind: 'linkedin', embed: `https://www.linkedin.com/embed/feed/update/${urn[0]}` };
    const act = u.match(/activity-(\d{15,})/);
    if (act) return { kind: 'linkedin', embed: `https://www.linkedin.com/embed/feed/update/urn:li:activity:${act[1]}` };
    return { kind: 'external', url: u };
  }
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u) || /firebasestorage\.googleapis\.com|\.firebasestorage\.app/i.test(u))
    return { kind: 'file', src: u };
  return { kind: 'external', url: u };
}

export function videoPlayerHTML(url, title) {
  const v = parseVideo(url);
  if (!v) return '<p class="empty">This video link is not valid.</p>';
  if (v.kind === 'file')
    return `<div class="video-frame"><video controls playsinline preload="metadata" src="${esc(v.src)}"></video></div>`;
  if (v.kind === 'external')
    return `<p>This video plays on its original site.</p><p><a class="btn btn--primary" href="${esc(v.url)}" target="_blank" rel="noopener">Watch on the original site</a></p>`;
  return `<div class="video-frame"><iframe src="${esc(v.embed)}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

const MEDIA_CATS = ['News', 'Interview', 'Feature', 'Article'];

export function renderPress({ items, list, filter }) {
  if (!list) return;
  if (!items.length) {
    list.innerHTML = '<li class="empty">Press coverage added in the Admin Panel appears here, newest first.</li>';
    filter.innerHTML = '';
    return;
  }
  list.innerHTML = items
    .map((m) => {
      const ext = safeUrl(m.externalUrl);
      const thumb = m.thumbUrl || m.thumbnailUrl || m.imageUrl;
      return `
      <li class="press-item" data-category="${esc(m.category || '')}">
        <div class="press-item__thumb">${thumb ? img(thumb, `${m.publication || ''} clipping`) : ''}</div>
        <div>
          <p class="press-item__pub">${esc(m.publication || '')}</p>
          <h3 class="press-item__title"${/[\u0980-\u09FF]/.test(m.title) ? ' lang="bn"' : ''}>${esc(m.title)}</h3>
          <p class="press-item__meta"><span>${esc(m.category || '')}</span><time datetime="${isoDate(m)}">${esc(fmtDate(m))}</time></p>
          ${m.description ? `<p class="press-item__desc">${esc(m.description)}</p>` : ''}
        </div>
        <div class="press-item__actions">
          ${ext ? `<a class="btn btn--primary" href="${esc(ext)}" target="_blank" rel="noopener">Read article</a>` : ''}
          <button class="btn btn--ghost" type="button" data-open="media:${esc(m.id)}">${thumb ? 'View clipping' : 'Details'}</button>
        </div>
      </li>`;
    })
    .join('');

  const cats = MEDIA_CATS.filter((c) => items.some((i) => i.category === c));
  if (cats.length < 2) { filter.innerHTML = ''; return; }
  filter.innerHTML = ['All', ...cats].map((c, i) => `<button class="chip" type="button" data-cat="${c}" aria-pressed="${i === 0}">${c}</button>`).join('');
  filter.onclick = (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    filter.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    list.querySelectorAll('.press-item').forEach((li) => (li.hidden = b.dataset.cat !== 'All' && li.dataset.category !== b.dataset.cat));
  };
}

export function renderVideos({ items, grid, section, navItem }) {
  if (!items.length) { section.hidden = true; if (navItem) navItem.hidden = true; return false; }
  section.hidden = false;
  if (navItem) navItem.hidden = false;
  grid.innerHTML = items
    .map((v) => {
      const p = parseVideo(v.videoUrl);
      const thumb = v.thumbnailUrl || v.thumbUrl || v.imageUrl || p?.thumb || '';
      return `
      <button class="video-card" type="button" data-video="${esc(v.videoUrl)}" data-title="${esc(v.title)}">
        <span class="video-card__thumb">${thumb ? img(thumb, '') : ''}<span class="video-card__play" aria-hidden="true"></span></span>
        <span class="video-card__body">
          <span class="tag">${esc(v.category || 'Video')}</span> <span class="muted" style="font-size:.8rem">${esc(fmtDate(v))}</span>
          <h3>${esc(v.title)}</h3>
        </span>
      </button>`;
    })
    .join('');
  return true;
}
