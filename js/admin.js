/**
 * Admin Panel — Firebase Auth guard, CRUD for every collection, uploads to
 * Firebase Storage, draft/publish workflow, previews, settings, starter import.
 */
import { isConfigured, getAuthBundle, getFirestoreBundle, getStorageBundle, toDate } from './firebase.js';
import { SEED } from './seed-data.js';
import { esc, detailView, feedCard, safeUrl } from './render.js';
import { normalize } from './content.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let FS, DB, AUTH, AU, USER;

/* ================================================================== */
/* Schemas                                                             */
/* ================================================================== */
const STATUS = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'];
const F = {
  title: { key: 'title', label: 'Title', type: 'text', required: true, span: 2 },
  description: { key: 'description', label: 'Short description', type: 'textarea', span: 2, help: 'One or two sentences shown on cards.' },
  content: { key: 'content', label: 'Full story', type: 'longtext', span: 2, help: 'Shown when visitors open the item. Leave a blank line between paragraphs.' },
  image: { key: 'imageUrl', label: 'Main image', type: 'image', span: 2 },
  images: { key: 'images', label: 'Extra images (one URL per line)', type: 'images', span: 2, help: 'Upload adds a line automatically.' },
  video: { key: 'videoUrl', label: 'Video (YouTube, Facebook, LinkedIn, Vimeo link, or upload)', type: 'video', span: 2 },
  external: { key: 'externalUrl', label: 'External link (source / article)', type: 'url', span: 2 },
  dateLabel: { key: 'dateLabel', label: 'Date as shown (optional)', type: 'text', help: 'e.g. “30 September 2026” or “2019”. Leave empty to use the publish date.' },
  location: { key: 'location', label: 'Location', type: 'text' },
  featured: { key: 'featured', label: 'Featured on homepage', type: 'toggle' },
  sourceLabel: { key: 'sourceLabel', label: 'Source label', type: 'text', help: 'e.g. “Bangladesh Post, 2 October 2026”' },
  order: { key: 'order', label: 'Manual order (optional)', type: 'number' }
};
const cat = (options) => ({ key: 'category', label: 'Category', type: 'select', options });

const SCHEMAS = {
  activities: { label: 'Activities', singular: 'Activity', folder: 'activities', type: 'activity',
    fields: [F.title, cat(['Conference', 'Speaking', 'Healthcare', 'Digital Health', 'Partnership', 'Business', 'Community', 'Training', 'Award', 'Media']), F.dateLabel, F.location, F.description, F.content, F.image, F.images, F.video, F.external, F.sourceLabel, F.featured] },
  articles: { label: 'Articles', singular: 'Article', folder: 'articles', type: 'article',
    fields: [F.title, cat(['Article', 'Insight', 'Opinion', 'Healthcare', 'Digital Health', 'Leadership']), F.dateLabel, F.description, F.content, F.image, F.external, F.featured] },
  media: { label: 'Media / press', singular: 'Press item', folder: 'media', type: 'media',
    fields: [{ key: 'publication', label: 'Publication / outlet', type: 'text', required: true }, cat(['News', 'Interview', 'Feature', 'Article']), { ...F.title, label: 'Headline' }, F.dateLabel, F.description, { ...F.image, label: 'Thumbnail / clipping image' }, { key: 'fileUrl', label: 'Attached file (PDF of clipping, optional)', type: 'file', span: 2 }, { ...F.external, label: 'Original article link' }, F.featured] },
  videos: { label: 'Videos', singular: 'Video', folder: 'videos', type: 'video',
    fields: [F.title, cat(['Talk', 'Interview', 'Panel', 'Webinar', 'Podcast', 'Feature']), F.dateLabel, F.description, { ...F.video, required: true }, { key: 'thumbnailUrl', label: 'Thumbnail (optional; YouTube is automatic)', type: 'image', span: 2 }, F.featured] },
  gallery: { label: 'Gallery', singular: 'Photo', folder: 'gallery', type: 'gallery',
    fields: [{ ...F.title, label: 'Caption' }, cat(['Professional', 'Healthcare', 'Events', 'Awards', 'Speaking', 'Community', 'International', 'Team']), { ...F.image, label: 'Photo', required: true }, F.featured] },
  awards: { label: 'Awards', singular: 'Award', folder: 'awards', type: 'award',
    fields: [F.title, { key: 'issuer', label: 'Issued by', type: 'text' }, { key: 'year', label: 'Year', type: 'text' }, F.dateLabel, F.location, cat(['National', 'International', 'Organisational', 'Programme']), F.description, F.content, { key: 'quote', label: 'Quote (optional)', type: 'textarea', span: 2 }, { ...F.image, label: 'Certificate / award image' }, F.images, F.featured, { key: 'showInFeed', label: 'Also show in “Latest from Fahreen”', type: 'toggle' }] },
  testimonials: { label: 'Testimonials', singular: 'Testimonial', folder: 'testimonials', type: 'testimonial',
    fields: [{ ...F.title, label: 'Person’s name' }, { key: 'category', label: 'Their role / organisation', type: 'text' }, { key: 'content', label: 'Quote', type: 'longtext', span: 2, required: true }, F.external] },
  experiences: { label: 'Experience', singular: 'Role', folder: 'experiences', type: 'experience',
    fields: [{ ...F.title, label: 'Job title' }, { key: 'organization', label: 'Organisation', type: 'text', required: true }, { key: 'period', label: 'Period as shown', type: 'text', help: 'e.g. “October 2024 – Present”' }, F.location, { key: 'current', label: 'Current role', type: 'toggle' }, cat(['Digital Health', 'Entrepreneurship', 'Education', 'Startup Ecosystem', 'Academia', 'Clinical', 'Other']), F.description, { key: 'bullets', label: 'Responsibilities (one per line)', type: 'list', span: 2 }, F.image] },
  education: { label: 'Education', singular: 'Qualification', folder: 'education', type: 'education',
    fields: [{ ...F.title, label: 'Degree' }, { key: 'field', label: 'Field / specialisation', type: 'text' }, { key: 'institution', label: 'Institution', type: 'text', required: true }, { key: 'year', label: 'Year', type: 'text' }, { key: 'detail', label: 'Detail (e.g. CGPA)', type: 'text' }] },
  training: { label: 'Training', singular: 'Training', folder: 'training', type: 'training',
    fields: [F.title, { key: 'description', label: 'Subtitle / focus', type: 'text', span: 2 }, { key: 'institution', label: 'Provider', type: 'text' }, { key: 'year', label: 'Year', type: 'text' }, { key: 'duration', label: 'Duration', type: 'text' }] },
  research: { label: 'Research', singular: 'Research item', folder: 'research', type: 'research',
    fields: [F.title, cat(['Thesis', 'Paper', 'Report', 'Poster', 'Presentation']), { key: 'institution', label: 'Institution', type: 'text' }, { key: 'year', label: 'Year', type: 'text' }, F.description, F.external] },
  socialLinks: { label: 'Social links', singular: 'Link', folder: 'social', type: 'link',
    fields: [{ ...F.title, label: 'Label shown' }, { key: 'category', label: 'Platform', type: 'select', options: ['LinkedIn', 'Facebook', 'YouTube', 'Instagram', 'X', 'Website', 'Other'] }, { ...F.external, required: true }] }
};

const SINGLETONS = {
  profile: { col: 'profiles', label: 'Profile', fields: [
    { key: 'headline', label: 'Headline (italic line under the section title)', type: 'text', span: 2 },
    { key: 'bio', label: 'Biography', type: 'longtext', span: 2, help: 'Blank line between paragraphs.' },
    { key: 'focusAreas', label: 'Professional focus (one per line)', type: 'list', span: 2 },
    { key: 'portraitUrl', label: 'Profile image', type: 'image', span: 2 },
    { key: 'portraitCaption', label: 'Image caption', type: 'text', span: 2 }
  ] },
  site: { col: 'siteSettings', label: 'Site settings & WhatsApp', fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'title', label: 'Professional title', type: 'text' },
    { key: 'currentRole', label: 'Current role', type: 'text' },
    { key: 'currentOrg', label: 'Current organisation', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'whatsapp', label: 'WhatsApp number', type: 'text', help: 'International format, digits only, no + or spaces. Example: 8801XXXXXXXXX. Empty = button scrolls to Contact.' },
    { key: 'whatsappMessage', label: 'WhatsApp pre-filled message', type: 'textarea', span: 2 },
    { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
    { key: 'facebook', label: 'Facebook URL', type: 'url' },
    { key: 'theme', label: 'Theme accent', type: 'select', options: ['aqua', 'violet', 'brass'] },
    { key: 'useSeedFallback', label: 'Show CV starter content for empty sections', type: 'toggle', help: 'Turn off once your own content is in Firestore.' }
  ] },
  seo: { col: 'seoSettings', label: 'SEO', fields: [
    { key: 'title', label: 'SEO title', type: 'text', span: 2, help: 'About 50–60 characters.' },
    { key: 'description', label: 'Meta description', type: 'textarea', span: 2, help: 'About 150–160 characters.' },
    { key: 'ogImage', label: 'Social share image (1200×630)', type: 'image', span: 2 },
    { key: 'canonicalUrl', label: 'Canonical URL', type: 'url', span: 2, help: 'Your live address, e.g. https://username.github.io/fahreen-portfolio/ or your custom domain.' }
  ] }
};

/* ================================================================== */
/* Utilities                                                           */
/* ================================================================== */
let toastTimer;
function toast(msg, ms = 4000) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}
const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u0980-\u09ff]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'item';
const dateInputValue = (v) => { const d = toDate(v) || new Date(); const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
const fmt = (v) => { const d = toDate(v); return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; };

const dlg = $('#admin-dialog');
const dlgBody = $('#admin-dialog-body');
function openDlg(html) { dlgBody.innerHTML = html; dlg.showModal(); dlgBody.scrollTop = 0; }
dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
dlg.addEventListener('close', () => { dlgBody.innerHTML = ''; });

function confirmDlg(message, okLabel = 'Delete') {
  return new Promise((resolve) => {
    openDlg(`<div class="editor"><h2 id="admin-dialog-title">Are you sure?</h2><p>${esc(message)}</p>
      <div class="editor__foot"><button class="btn btn--ghost" type="button" data-no>Cancel</button><button class="btn btn--danger" type="button" data-yes>${esc(okLabel)}</button></div></div>`);
    const done = (v) => { dlg.close(); resolve(v); };
    dlgBody.querySelector('[data-yes]').onclick = () => done(true);
    dlgBody.querySelector('[data-no]').onclick = () => done(false);
    dlg.addEventListener('close', () => resolve(false), { once: true });
  });
}

/* ---------- Image resize + upload ---------- */
async function resizeImage(file, max, quality = 0.84) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 900 * 1024) return file;
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', quality));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file;
  } catch { return file; }
}

async function putFile(blob, path, onProgress) {
  const { storage, st } = await getStorageBundle();
  const r = st.ref(storage, path);
  const task = st.uploadBytesResumable(r, blob, { contentType: blob.type || 'application/octet-stream', cacheControl: 'public,max-age=31536000' });
  await new Promise((res, rej) => task.on('state_changed', (s) => onProgress?.(s.bytesTransferred / s.totalBytes), rej, res));
  return st.getDownloadURL(r);
}

/** Uploads a file (+ thumbnail for images). Returns { url, thumbUrl }. */
async function uploadFile(file, folder, onProgress) {
  const base = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}`;
  if (file.type.startsWith('image/')) {
    const main = await resizeImage(file, 2000, 0.85);
    const thumb = await resizeImage(file, 720, 0.78);
    const ext = main.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'img');
    const url = await putFile(main, `uploads/${folder}/${base}.${ext}`, (p) => onProgress?.(p * 0.85));
    const thumbUrl = thumb === main ? url : await putFile(thumb, `uploads/${folder}/thumbs/${base}.jpg`, (p) => onProgress?.(0.85 + p * 0.15));
    return { url, thumbUrl };
  }
  if (file.type.startsWith('video/') && file.size > 300 * 1024 * 1024) throw new Error('Video is larger than 300 MB. Upload it to YouTube and paste the link instead.');
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const url = await putFile(file, `uploads/${folder}/${base}.${ext}`, onProgress);
  return { url, thumbUrl: '' };
}

async function deleteStorageUrl(url) {
  if (!url || !/firebasestorage\.googleapis\.com|\.firebasestorage\.app/.test(url)) return;
  try { const { storage, st } = await getStorageBundle(); await st.deleteObject(st.ref(storage, url)); } catch { /* already gone or not ours */ }
}

/* ================================================================== */
/* Form builder                                                        */
/* ================================================================== */
function fieldHTML(f, v) {
  const id = `f-${f.key}`;
  const req = f.required ? ' required' : '';
  const help = f.help ? `<small>${esc(f.help)}</small>` : '';
  const span = f.span === 2 ? ' span-2' : '';
  const val = v ?? '';
  switch (f.type) {
    case 'textarea':
    case 'longtext':
      return `<label class="field${span}"><span>${esc(f.label)}${f.required ? ' *' : ''}</span><textarea id="${id}" name="${f.key}" class="${f.type === 'longtext' ? 'long' : ''}"${req}>${esc(Array.isArray(val) ? val.join('\n\n') : val)}</textarea>${help}</label>`;
    case 'list':
    case 'images':
      return `<div class="field${span}"><label for="${id}"><span>${esc(f.label)}</span></label><textarea id="${id}" name="${f.key}" data-kind="list">${esc((Array.isArray(val) ? val : []).join('\n'))}</textarea>${
        f.type === 'images' ? `<div class="upload__row"><label class="btn btn--ghost btn--sm">Upload images<input type="file" accept="image/*" multiple data-upload-list="${f.key}"></label><div class="progress" hidden><i></i></div></div>` : ''}${help}</div>`;
    case 'select':
      return `<label class="field${span}"><span>${esc(f.label)}</span><select id="${id}" name="${f.key}">${['', ...f.options].map((o) => `<option value="${esc(o)}"${o === val ? ' selected' : ''}>${esc(o || '—')}</option>`).join('')}</select>${help}</label>`;
    case 'toggle':
      return `<label class="field field--check${span}"><input type="checkbox" id="${id}" name="${f.key}"${val ? ' checked' : ''}><span>${esc(f.label)}</span>${help}</label>`;
    case 'number':
      return `<label class="field${span}"><span>${esc(f.label)}</span><input type="number" id="${id}" name="${f.key}" value="${esc(val)}">${help}</label>`;
    case 'image':
    case 'video':
    case 'file': {
      const accept = f.type === 'image' ? 'image/*' : f.type === 'video' ? 'video/*' : 'application/pdf,image/*';
      const isImg = f.type === 'image' && val;
      return `<div class="field${span}"><label for="${id}"><span>${esc(f.label)}${f.required ? ' *' : ''}</span></label>
        <div class="upload">
          <div class="upload__preview" data-preview="${f.key}">${isImg ? `<img src="${esc(safeUrl(val))}" alt="">` : f.type === 'image' ? 'No image' : f.type === 'video' ? 'Video' : 'File'}</div>
          <div>
            <input type="${f.type === 'video' ? 'text' : 'url'}" id="${id}" name="${f.key}" value="${esc(val)}" placeholder="${f.type === 'video' ? 'Paste a link, or upload' : 'Paste a URL, or upload'}" inputmode="url"${req}>
            <div class="upload__row"><label class="btn btn--ghost btn--sm">Upload<input type="file" accept="${accept}" data-upload="${f.key}" data-kind="${f.type}"></label><div class="progress" hidden><i></i></div></div>
          </div>
        </div>${help}</div>`;
    }
    default:
      return `<label class="field${span}"><span>${esc(f.label)}${f.required ? ' *' : ''}</span><input type="${f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : 'text'}" id="${id}" name="${f.key}" value="${esc(val)}"${req}${f.type === 'url' ? ' inputmode="url"' : ''}>${help}</label>`;
  }
}

function collect(form, fields) {
  const out = {};
  for (const f of fields) {
    const el = form.elements[f.key];
    if (!el) continue;
    if (f.type === 'toggle') out[f.key] = el.checked;
    else if (f.type === 'list' || f.type === 'images') out[f.key] = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'number') out[f.key] = el.value === '' ? null : Number(el.value);
    else out[f.key] = el.value.trim();
  }
  if (form.elements.thumbUrl) out.thumbUrl = form.elements.thumbUrl.value;
  return out;
}

function wireUploads(form, folder) {
  form.addEventListener('change', async (e) => {
    const input = e.target;
    if (input.type !== 'file' || !input.files.length) return;
    const row = input.closest('.upload__row');
    const bar = row.querySelector('.progress');
    const fill = bar.querySelector('i');
    bar.hidden = false;
    const btn = input.closest('label');
    btn.classList.add('is-busy');
    try {
      if (input.dataset.uploadList) {
        const ta = form.elements[input.dataset.uploadList];
        const files = [...input.files];
        for (let i = 0; i < files.length; i++) {
          const { url } = await uploadFile(files[i], folder, (p) => (fill.style.width = `${((i + p) / files.length) * 100}%`));
          ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + url;
        }
      } else {
        const key = input.dataset.upload;
        const { url, thumbUrl } = await uploadFile(input.files[0], folder, (p) => (fill.style.width = `${p * 100}%`));
        form.elements[key].value = url;
        if (key === 'imageUrl' && form.elements.thumbUrl) form.elements.thumbUrl.value = thumbUrl || url;
        const pv = form.querySelector(`[data-preview="${key}"]`);
        if (pv && input.dataset.kind === 'image') pv.innerHTML = `<img src="${esc(url)}" alt="">`;
        if (pv && input.dataset.kind !== 'image') pv.textContent = 'Uploaded';
      }
      toast('Upload complete.');
    } catch (ex) {
      console.error(ex);
      toast(ex.code === 'storage/unauthorized' ? 'Upload blocked: this account is not an admin in Storage rules.' : `Upload failed: ${ex.message}`, 7000);
    } finally {
      fill.style.width = '0'; bar.hidden = true; input.value = ''; btn.classList.remove('is-busy');
    }
  });
}

/* ================================================================== */
/* Data access                                                         */
/* ================================================================== */
async function listAll(col) {
  const snap = await FS.getDocs(FS.collection(DB, col));
  return snap.docs.map((d) => normalize({ id: d.id, ...d.data() }));
}

async function saveItem(col, id, data, isNew) {
  const ref = id ? FS.doc(DB, col, id) : FS.doc(FS.collection(DB, col));
  const payload = { ...data, updatedAt: FS.serverTimestamp() };
  if (isNew) payload.createdAt = FS.serverTimestamp();
  await FS.setDoc(ref, payload, { merge: !isNew });
  return ref.id;
}

/* ================================================================== */
/* Views                                                               */
/* ================================================================== */
const view = $('#view');
const setTitle = (t) => { $('#view-title').textContent = t; document.title = `${t} | Admin`; };

async function viewDashboard() {
  setTitle('Dashboard');
  view.innerHTML = `
    <div class="quick">
      <button class="btn btn--primary btn--sm" data-new="activities">+ Add activity</button>
      <button class="btn btn--ghost btn--sm" data-new="awards">+ Add award</button>
      <button class="btn btn--ghost btn--sm" data-new="articles">+ Add article</button>
      <button class="btn btn--ghost btn--sm" data-new="videos">+ Add video</button>
      <button class="btn btn--ghost btn--sm" data-bulk="gallery">+ Upload gallery</button>
      <button class="btn btn--ghost btn--sm" data-new="experiences">+ Add experience</button>
    </div>
    <div class="stats" id="stats"><div class="stat"><b>…</b><span>Loading counts</span></div></div>
    <div class="panel"><h2>Latest content</h2><div id="latest">Loading…</div></div>`;

  const cols = ['activities', 'awards', 'gallery', 'videos', 'media', 'articles'];
  try {
    const counts = await Promise.all(cols.map(async (c) => {
      const all = await FS.getCountFromServer(FS.collection(DB, c));
      const pub = await FS.getCountFromServer(FS.query(FS.collection(DB, c), FS.where('status', '==', 'PUBLISHED')));
      const dr = await FS.getCountFromServer(FS.query(FS.collection(DB, c), FS.where('status', '==', 'DRAFT')));
      return { c, total: all.data().count, pub: pub.data().count, draft: dr.data().count };
    }));
    const a = counts.find((x) => x.c === 'activities');
    const totalAll = counts.reduce((s, x) => s + x.total, 0);
    const pubAll = counts.reduce((s, x) => s + x.pub, 0);
    const draftAll = counts.reduce((s, x) => s + x.draft, 0);
    const stat = (n, l) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`;
    $('#stats').innerHTML = [
      stat(totalAll, 'Total content'), stat(pubAll, 'Published'), stat(draftAll, 'Drafts'),
      stat(a.total, 'Activities'), stat(a.pub, 'Published activities'),
      ...counts.filter((x) => x.c !== 'activities').map((x) => stat(x.total, SCHEMAS[x.c].label))
    ].join('');

    const latest = (await Promise.all(cols.map(async (c) => (await listAll(c)).map((x) => ({ ...x, _col: c })))))
      .flat().sort((x, y) => (y._date?.getTime() || 0) - (x._date?.getTime() || 0)).slice(0, 8);
    $('#latest').innerHTML = latest.length
      ? `<div class="table-wrap"><table class="table"><thead><tr><th>Title</th><th>Section</th><th>Status</th><th>Published</th><th></th></tr></thead><tbody>${latest.map((x) => `
          <tr><td class="title-cell">${esc(x.title)}</td><td>${esc(SCHEMAS[x._col].label)}</td><td><span class="pill pill--${x.status}">${x.status}</span></td><td>${fmt(x.publishedAt)}</td>
          <td><button class="btn btn--ghost btn--sm" data-edit="${x._col}:${esc(x.id)}">Edit</button></td></tr>`).join('')}</tbody></table></div>`
      : `<div class="empty-state">No content in Firestore yet. Go to <a href="#starter">Starter content</a> to import everything from the CV in one step.</div>`;
  } catch (ex) {
    $('#stats').innerHTML = `<div class="notice notice--warn">Could not load counts: ${esc(ex.message)}</div>`;
    $('#latest').textContent = '';
  }
}

const listState = {};
async function viewCollection(col) {
  const S = SCHEMAS[col];
  if (!S) return viewDashboard();
  setTitle(S.label);
  const st = (listState[col] ||= { sort: 'newest', status: 'all', category: 'all', q: '' });
  view.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary btn--sm" data-new="${col}">+ Add ${esc(S.singular.toLowerCase())}</button>
      ${col === 'gallery' ? '<button class="btn btn--ghost btn--sm" data-bulk="gallery">Upload several photos</button>' : ''}
      <span class="spacer"></span>
      <label class="field"><span class="sr-only">Search</span><input type="search" id="q" placeholder="Search titles" value="${esc(st.q)}"></label>
      <label class="field"><span class="sr-only">Sort</span>
        <select id="sort">
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="category">Category</option>
        </select></label>
      <label class="field"><span class="sr-only">Status</span>
        <select id="status"><option value="all">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Drafts</option><option value="UNPUBLISHED">Unpublished</option></select></label>
      <label class="field"><span class="sr-only">Category</span><select id="cat"><option value="all">All categories</option></select></label>
    </div>
    <div id="list">Loading…</div>`;
  $('#sort').value = st.sort; $('#status').value = st.status;

  let items = [];
  try { items = await listAll(col); }
  catch (ex) { $('#list').innerHTML = `<div class="notice notice--warn">Could not load ${esc(S.label)}: ${esc(ex.message)}</div>`; return; }

  const cats = [...new Set(items.map((i) => i.category).filter(Boolean))].sort();
  $('#cat').insertAdjacentHTML('beforeend', cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join(''));
  $('#cat').value = cats.includes(st.category) ? st.category : 'all';

  const draw = () => {
    let list = items.filter((i) =>
      (st.status === 'all' || i.status === st.status) &&
      (st.category === 'all' || i.category === st.category) &&
      (!st.q || `${i.title} ${i.publication || ''} ${i.organization || ''}`.toLowerCase().includes(st.q.toLowerCase())));
    const t = (i) => i._date?.getTime() || 0;
    if (st.sort === 'newest') list.sort((a, b) => t(b) - t(a));
    if (st.sort === 'oldest') list.sort((a, b) => t(a) - t(b));
    if (st.sort === 'category') list.sort((a, b) => String(a.category || '').localeCompare(b.category || '') || t(b) - t(a));
    $('#list').innerHTML = list.length ? `
      <div class="table-wrap"><table class="table"><thead><tr><th></th><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead><tbody>
      ${list.map((i) => {
        const th = i.thumbUrl || i.thumbnailUrl || i.imageUrl;
        return `<tr>
          <td>${th ? `<img src="${esc(safeUrl(th))}" alt="" loading="lazy">` : ''}</td>
          <td class="title-cell">${i.featured ? '<span class="star" title="Featured">★</span> ' : ''}${esc(i.title)}<small>${esc(i.publication || i.organization || i.institution || i.dateLabel || '')}</small></td>
          <td>${esc(i.category || '')}</td>
          <td><span class="pill pill--${i.status}">${i.status}</span></td>
          <td>${fmt(i.publishedAt)}</td>
          <td><div class="actions">
            <button class="btn btn--ghost btn--sm" data-edit="${col}:${esc(i.id)}">Edit</button>
            <button class="btn btn--ghost btn--sm" data-toggle="${col}:${esc(i.id)}">${i.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button>
            <button class="btn btn--danger btn--sm" data-del="${col}:${esc(i.id)}">Delete</button>
          </div></td></tr>`;
      }).join('')}</tbody></table></div>`
      : `<div class="empty-state">${items.length ? 'Nothing matches these filters.' : `No ${esc(S.label.toLowerCase())} yet. Add the first one, or import the starter content.`}</div>`;
  };
  draw();
  $('#q').oninput = (e) => { st.q = e.target.value; draw(); };
  $('#sort').onchange = (e) => { st.sort = e.target.value; draw(); };
  $('#status').onchange = (e) => { st.status = e.target.value; draw(); };
  $('#cat').onchange = (e) => { st.category = e.target.value; draw(); };
}

/* ---------- Editor ---------- */
async function openEditor(col, id) {
  const S = SCHEMAS[col];
  let item = { status: 'DRAFT', publishedAt: new Date() };
  if (id) {
    const snap = await FS.getDoc(FS.doc(DB, col, id));
    if (!snap.exists()) return toast('That item no longer exists.');
    item = { id, ...snap.data() };
  }
  openDlg(`
    <form class="editor" id="editor" novalidate>
      <h2 id="admin-dialog-title">${id ? 'Edit' : 'New'} ${esc(S.singular.toLowerCase())}</h2>
      <div class="editor__grid">
        ${S.fields.map((f) => fieldHTML(f, item[f.key])).join('')}
        <input type="hidden" name="thumbUrl" value="${esc(item.thumbUrl || '')}">
        <label class="field"><span>Status</span><select name="status">${STATUS.map((s) => `<option${s === item.status ? ' selected' : ''}>${s}</option>`).join('')}</select>
          <small>Only “PUBLISHED” items appear on the website.</small></label>
        <label class="field"><span>Publish date</span><input type="date" name="publishedAt" value="${dateInputValue(item.publishedAt)}" required>
          <small>Controls ordering: newest first.</small></label>
      </div>
      <p class="form-error" id="ed-err" hidden></p>
      <div class="editor__foot">
        <button class="btn btn--ghost" type="button" data-close>Cancel</button>
        <button class="btn btn--ghost" type="button" id="ed-preview">Preview</button>
        <button class="btn btn--ghost" type="submit" data-as="">Save</button>
        <button class="btn btn--primary" type="submit" data-as="PUBLISHED">Publish</button>
      </div>
      <div class="preview-wrap" id="ed-preview-area" hidden></div>
    </form>`);
  const form = $('#editor');
  wireUploads(form, S.folder);
  let as = null;
  form.querySelectorAll('[data-as]').forEach((b) => b.addEventListener('click', () => (as = b.dataset.as)));

  const build = () => {
    const d = collect(form, S.fields);
    d.status = as || form.elements.status.value || 'DRAFT';
    d.published = d.status === 'PUBLISHED';
    const day = form.elements.publishedAt.value;
    d.publishedAt = day ? new Date(`${day}T12:00:00`) : new Date();
    if (!d.slug) d.slug = slugify(d.title);
    return d;
  };

  $('#ed-preview').addEventListener('click', () => {
    const d = { ...build(), id: id || 'preview', _type: S.type };
    const area = $('#ed-preview-area');
    area.hidden = false;
    area.innerHTML = `<p class="muted" style="margin:1rem 0 0">Card preview</p><div class="feed">${feedCard({ ...normalize(d), _type: S.type }, 1)}</div>
      <p class="muted">Detail preview</p>${detailView(normalize(d))}`;
    area.scrollIntoView({ behavior: 'smooth' });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#ed-err');
    const d = build();
    const missing = S.fields.filter((f) => f.required && (!d[f.key] || (Array.isArray(d[f.key]) && !d[f.key].length)));
    if (!d.title) missing.unshift({ label: 'Title' });
    if (missing.length) { err.textContent = `Fill in: ${[...new Set(missing.map((m) => m.label))].join(', ')}.`; err.hidden = false; return; }
    if (S.type === 'video' && d.videoUrl && !/^https?:\/\//.test(d.videoUrl)) { err.textContent = 'The video must be a full link starting with https://, or an uploaded file.'; err.hidden = false; return; }
    d.publishedAt = FS.Timestamp.fromDate(d.publishedAt);
    const submit = form.querySelectorAll('[type="submit"]');
    submit.forEach((b) => (b.disabled = true));
    try {
      await saveItem(col, id, d, !id);
      dlg.close();
      toast(d.status === 'PUBLISHED' ? 'Published.' : d.status === 'DRAFT' ? 'Draft saved.' : 'Saved as unpublished.');
      route();
    } catch (ex) {
      err.textContent = ex.code === 'permission-denied' ? 'Not allowed: your account is not in the admins collection, or a required field is missing.' : `Could not save: ${ex.message}`;
      err.hidden = false;
    } finally { submit.forEach((b) => (b.disabled = false)); as = null; }
  });
}

async function togglePublish(col, id) {
  const snap = await FS.getDoc(FS.doc(DB, col, id));
  if (!snap.exists()) return;
  const cur = snap.data().status;
  const status = cur === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
  await FS.updateDoc(FS.doc(DB, col, id), { status, published: status === 'PUBLISHED', updatedAt: FS.serverTimestamp() });
  toast(status === 'PUBLISHED' ? 'Published.' : 'Unpublished.');
  route();
}

async function deleteItem(col, id) {
  const snap = await FS.getDoc(FS.doc(DB, col, id));
  if (!snap.exists()) return;
  const d = snap.data();
  if (!(await confirmDlg(`Delete “${d.title}”? Uploaded files for it are deleted too. This cannot be undone.`))) return;
  await FS.deleteDoc(FS.doc(DB, col, id));
  await Promise.all([d.imageUrl, d.thumbUrl, d.fileUrl, d.videoUrl, d.thumbnailUrl, ...(d.images || [])].map(deleteStorageUrl));
  toast('Deleted.');
  route();
}

/* ---------- Bulk gallery upload ---------- */
function openBulkGallery() {
  openDlg(`
    <form class="editor" id="bulk">
      <h2 id="admin-dialog-title">Upload several photos</h2>
      <p class="muted">Each photo becomes a gallery item captioned from its file name. Edit captions afterwards.</p>
      ${fieldHTML(SCHEMAS.gallery.fields[1], 'Events')}
      <label class="field field--check"><input type="checkbox" name="publish" checked><span>Publish immediately</span></label>
      <label class="field"><span>Photos</span><input type="file" name="files" accept="image/*" multiple required></label>
      <div class="progress" hidden id="bulk-bar"><i></i></div>
      <p class="muted" id="bulk-status" aria-live="polite"></p>
      <div class="editor__foot"><button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit">Upload</button></div>
    </form>`);
  const form = $('#bulk');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = [...form.files.files];
    if (!files.length) return;
    const bar = $('#bulk-bar'), fill = bar.querySelector('i'), status = $('#bulk-status');
    bar.hidden = false;
    form.querySelector('[type="submit"]').disabled = true;
    const st = form.publish.checked ? 'PUBLISHED' : 'DRAFT';
    try {
      for (let i = 0; i < files.length; i++) {
        status.textContent = `Uploading ${i + 1} of ${files.length}…`;
        const { url, thumbUrl } = await uploadFile(files[i], 'gallery', (p) => (fill.style.width = `${((i + p) / files.length) * 100}%`));
        const title = files[i].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Photo';
        await saveItem('gallery', null, {
          title, slug: slugify(title), category: form.category.value, imageUrl: url, thumbUrl,
          status: st, published: st === 'PUBLISHED', featured: false,
          publishedAt: FS.Timestamp.fromDate(new Date(Date.now() - i * 1000))
        }, true);
      }
      dlg.close();
      toast(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded.`);
      location.hash = '#c/gallery'; route();
    } catch (ex) {
      status.textContent = `Stopped: ${ex.message}`;
      form.querySelector('[type="submit"]').disabled = false;
    }
  });
}

/* ---------- Singletons ---------- */
async function viewSingleton(key) {
  const S = SINGLETONS[key];
  if (!S) return viewDashboard();
  setTitle(S.label);
  const seed = key === 'profile' ? SEED.profiles : key === 'site' ? SEED.siteSettings : SEED.seoSettings;
  let data = { ...seed };
  try { const s = await FS.getDoc(FS.doc(DB, S.col, 'main')); if (s.exists()) data = { ...data, ...s.data() }; }
  catch (ex) { toast(`Could not load: ${ex.message}`); }
  view.innerHTML = `
    <form class="panel" id="single" novalidate>
      ${key === 'site' ? '<div class="notice">The floating “Let’s connect” button opens WhatsApp with the number below. Without a number it scrolls to the Contact section.</div>' : ''}
      <div class="editor__grid">${S.fields.map((f) => fieldHTML(f, data[f.key])).join('')}</div>
      <div class="editor__foot"><button class="btn btn--primary" type="submit">Save changes</button></div>
    </form>`;
  const form = $('#single');
  wireUploads(form, key === 'seo' ? 'seo' : 'profile');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = collect(form, S.fields);
    if (key === 'site' && d.whatsapp) d.whatsapp = d.whatsapp.replace(/\D/g, '');
    try {
      await FS.setDoc(FS.doc(DB, S.col, 'main'), { ...d, updatedAt: FS.serverTimestamp() }, { merge: true });
      toast('Changes saved. Reload the website to see them.');
    } catch (ex) { toast(ex.code === 'permission-denied' ? 'Not allowed: this account is not an admin.' : `Could not save: ${ex.message}`, 7000); }
  });
}

/* ---------- Starter content import ---------- */
function viewStarter() {
  setTitle('Starter content');
  const counts = Object.keys(SCHEMAS).map((c) => `<li>${esc(SCHEMAS[c].label)}: ${(SEED[c] || []).length}</li>`).join('');
  view.innerHTML = `
    <div class="panel">
      <h2>Import the CV-based content into Firestore</h2>
      <p>The website ships with content taken only from Dr. Fahreen Hannan’s CV and the photographs supplied with it. Import it once so every item becomes editable here.</p>
      <ul class="check-list">${counts}<li>Profile, site settings and SEO</li></ul>
      <div class="notice notice--warn">Importing overwrites items with the same IDs and switches off the starter-content fallback, so Firestore becomes the single source of truth. Your own new items are not touched. Items marked with a “date not in source” note need their real dates set afterwards.</div>
      <button class="btn btn--primary" type="button" id="do-import">Import starter content</button>
      <p id="import-status" class="muted" aria-live="polite"></p>
    </div>`;
  $('#do-import').addEventListener('click', async (e) => {
    if (!(await confirmDlg('Import starter content into Firestore now?', 'Import'))) return;
    const btn = e.target; btn.disabled = true;
    const status = $('#import-status');
    try {
      let n = 0;
      let batch = FS.writeBatch(DB);
      let inBatch = 0;
      const flush = async () => { if (inBatch) { await batch.commit(); batch = FS.writeBatch(DB); inBatch = 0; } };
      for (const col of Object.keys(SCHEMAS)) {
        for (const raw of SEED[col] || []) {
          const { id, _date, ...rest } = raw;
          const doc = {
            ...rest,
            title: rest.title || id,
            slug: id,
            status: 'PUBLISHED',
            published: true,
            featured: !!rest.featured,
            publishedAt: FS.Timestamp.fromDate(new Date(`${rest.publishedAt || '2020-01-01'}T12:00:00`)),
            createdAt: FS.serverTimestamp(),
            updatedAt: FS.serverTimestamp()
          };
          batch.set(FS.doc(DB, col, id), doc);
          n++; inBatch++;
          if (inBatch >= 400) await flush();
          status.textContent = `Prepared ${n} items…`;
        }
      }
      await flush();
      const profile = { ...SEED.profiles, bio: SEED.profiles.bio.join('\n\n') };
      await FS.setDoc(FS.doc(DB, 'profiles', 'main'), { ...profile, updatedAt: FS.serverTimestamp() }, { merge: true });
      await FS.setDoc(FS.doc(DB, 'seoSettings', 'main'), { ...SEED.seoSettings, updatedAt: FS.serverTimestamp() }, { merge: true });
      await FS.setDoc(FS.doc(DB, 'siteSettings', 'main'), { ...SEED.siteSettings, useSeedFallback: false, updatedAt: FS.serverTimestamp() }, { merge: true });
      status.textContent = `Done. ${n} items imported, plus profile, site settings and SEO.`;
      toast('Starter content imported.');
    } catch (ex) {
      status.textContent = ex.code === 'permission-denied' ? 'Not allowed: confirm this account’s UID is in the admins collection and the rules are deployed.' : `Import failed: ${ex.message}`;
    } finally { btn.disabled = false; }
  });
}

/* ================================================================== */
/* Router & events                                                     */
/* ================================================================== */
function route() {
  const h = location.hash.replace(/^#/, '') || 'dashboard';
  $$('.side nav a').forEach((a) => a.classList.toggle('is-active', a.dataset.route === h));
  $('#side').classList.remove('is-open');
  $('#side-toggle').setAttribute('aria-expanded', 'false');
  if (h.startsWith('c/')) viewCollection(h.slice(2));
  else if (h.startsWith('s/')) viewSingleton(h.slice(2));
  else if (h === 'starter') viewStarter();
  else viewDashboard();
}

document.addEventListener('click', (e) => {
  const n = e.target.closest('[data-new]');
  if (n) return openEditor(n.dataset.new, null);
  const ed = e.target.closest('[data-edit]');
  if (ed) { const [c, id] = ed.dataset.edit.split(':'); return openEditor(c, id); }
  const tg = e.target.closest('[data-toggle]');
  if (tg) { const [c, id] = tg.dataset.toggle.split(':'); return togglePublish(c, id).catch((ex) => toast(ex.message)); }
  const dl = e.target.closest('[data-del]');
  if (dl) { const [c, id] = dl.dataset.del.split(':'); return deleteItem(c, id).catch((ex) => toast(ex.message)); }
  if (e.target.closest('[data-bulk]')) return openBulkGallery();
});

/* ================================================================== */
/* Auth gate                                                           */
/* ================================================================== */
function gateMessage(html) { $('#gate').innerHTML = `<div class="card">${html}</div>`; }

async function boot() {
  if (!isConfigured) {
    gateMessage(`<h1 style="font-family:var(--font-display);font-weight:500;margin-top:0">Connect Firebase first</h1>
      <p>Add your Firebase web configuration to <code>js/firebase-config.js</code>, deploy the rules in <code>/firebase</code>, and create your admin user. The README’s “Firebase setup” and “Admin setup” sections list every step.</p>
      <p><a class="btn btn--primary" href="./">Back to the website</a></p>`);
    return;
  }
  try {
    ({ auth: AUTH, au: AU } = await getAuthBundle());
    ({ db: DB, fs: FS } = await getFirestoreBundle());
  } catch (ex) {
    gateMessage(`<p>Could not reach Firebase: ${esc(ex.message)}</p><p><button class="btn btn--primary" onclick="location.reload()">Try again</button></p>`);
    return;
  }
  AU.onAuthStateChanged(AUTH, async (user) => {
    if (!user) { location.replace('admin-login.html'); return; }
    let isAdmin = false;
    try { isAdmin = (await FS.getDoc(FS.doc(DB, 'admins', user.uid))).exists(); } catch { isAdmin = false; }
    if (!isAdmin) {
      gateMessage(`<h1 style="font-family:var(--font-display);font-weight:500;margin-top:0">This account is not an administrator</h1>
        <p>Signed in as ${esc(user.email)}. To grant access, create a document in Firestore at <code>admins/${esc(user.uid)}</code> (README → Admin setup).</p>
        <p><button class="btn btn--primary" id="gate-out">Sign out</button></p>`);
      $('#gate-out').onclick = () => AU.signOut(AUTH);
      return;
    }
    USER = user;
    $('#gate').hidden = true;
    $('#app').hidden = false;
    $('#who').textContent = user.email;
    route();
  });
  $('#logout').addEventListener('click', async () => { await AU.signOut(AUTH); location.replace('admin-login.html'); });
  $('#side-toggle').addEventListener('click', () => {
    const open = !$('#side').classList.contains('is-open');
    $('#side').classList.toggle('is-open', open);
    $('#side-toggle').setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('hashchange', () => { if (USER) route(); });
}
boot();
