/** Shared, XSS-safe templates used by the public site and the Admin preview. */
import { toDate } from './firebase.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Allows http(s), mailto, tel, hash and relative URLs only. */
export function safeUrl(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ''; // javascript:, data:, etc.
  return u; // relative or #anchor
}

export function fmtDate(item) {
  if (item?.dateLabel) return item.dateLabel;
  const d = item?._date || toDate(item?.publishedAt);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function isoDate(item) {
  const d = item?._date || toDate(item?.publishedAt);
  return d ? d.toISOString().slice(0, 10) : '';
}

/** Plain text → paragraphs; bare URLs become links. */
export function paragraphs(text) {
  return String(text || '')
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const linked = esc(p).replace(
        /(https?:\/\/[^\s<]+)/g,
        (m) => `<a href="${m}" target="_blank" rel="noopener">${m}</a>`
      );
      return `<p>${linked.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

export function img(src, alt, cls = '', { eager = false, sizes = '' } = {}) {
  const s = safeUrl(src);
  if (!s) return '';
  return `<img src="${esc(s)}" alt="${esc(alt)}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${sizes ? ` sizes="${sizes}"` : ''}>`;
}

export const TYPE_LABEL = {
  activity: 'Activity',
  article: 'Article',
  media: 'In the media',
  video: 'Video',
  award: 'Recognition'
};

export function feedCard(item, i = 0) {
  const thumb = item.thumbUrl || item.thumbnailUrl || item.imageUrl;
  const type = TYPE_LABEL[item._type] || '';
  const cat = item.category && item.category !== type ? item.category : '';
  return `
  <article class="feed-card${thumb ? '' : ' feed-card--text'}${i === 0 ? ' feed-card--lead' : ''}" data-type="${esc(item._type)}" data-category="${esc(item.category || '')}">
    <button class="feed-card__hit" type="button" data-open="${esc(item._type)}:${esc(item.id)}" aria-label="Open: ${esc(item.title)}"></button>
    ${thumb ? `<div class="feed-card__media">${img(thumb, item.title)}</div>` : ''}
    <div class="feed-card__body">
      <p class="feed-card__meta"><span class="tag">${esc(cat || type)}</span><time datetime="${isoDate(item)}">${esc(fmtDate(item))}</time></p>
      <h3 class="feed-card__title">${esc(item.title)}</h3>
      ${item.description ? `<p class="feed-card__desc">${esc(item.description)}</p>` : ''}
    </div>
  </article>`;
}

/** Full detail view used inside the shared dialog. */
export function detailView(item, { kicker = '' } = {}) {
  const imgs = (item.images && item.images.length ? item.images : [item.imageUrl || item.fileUrl]).filter(Boolean);
  const ext = safeUrl(item.externalUrl);
  const meta = [kicker || item.category, fmtDate(item), item.location, item.issuer || item.publication]
    .filter(Boolean)
    .map((m) => `<span>${esc(m)}</span>`)
    .join('');
  return `
  <div class="detail">
    ${imgs.length ? `<div class="detail__media${imgs.length > 1 ? ' detail__media--multi' : ''}">${imgs
      .map((s, i) => `<figure>${img(s, `${item.title}${imgs.length > 1 ? ` (image ${i + 1})` : ''}`, '', { eager: i === 0 })}</figure>`)
      .join('')}</div>` : ''}
    <div class="detail__text">
      <p class="detail__meta">${meta}</p>
      <h2 class="detail__title" id="dialog-title">${esc(item.title)}</h2>
      ${item.quote ? `<blockquote class="detail__quote">“${esc(item.quote)}”</blockquote>` : ''}
      <div class="prose">${paragraphs(item.content || item.description)}</div>
      ${item.videoUrl ? `<p><button class="btn btn--ghost" type="button" data-video="${esc(item.videoUrl)}" data-title="${esc(item.title)}">Play video</button></p>` : ''}
      <div class="detail__foot">
        ${ext ? `<a class="btn btn--primary" href="${esc(ext)}" target="_blank" rel="noopener">${item._type === 'media' ? 'Read the article' : 'View source'}</a>` : ''}
        ${item.sourceLabel ? `<p class="detail__source">Source: ${esc(item.sourceLabel)}</p>` : ''}
      </div>
    </div>
  </div>`;
}
