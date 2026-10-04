/**
 * Content data layer.
 *
 * Source order:
 *   1. Firestore (published items only, newest first) when Firebase is configured.
 *   2. CV-based starter content (seed-data.js) for any collection that is still
 *      empty — until the admin imports the starter content, which switches
 *      `siteSettings/main.useSeedFallback` to false.
 */
import { SEED } from './seed-data.js';
import { isConfigured, getFirestoreBundle, toDate } from './firebase.js';

export const CONTENT_COLLECTIONS = [
  'experiences', 'awards', 'activities', 'articles', 'media', 'videos',
  'gallery', 'education', 'research', 'training', 'testimonials', 'socialLinks'
];

export function normalize(item) {
  const status = item.status || (item.published === false ? 'DRAFT' : 'PUBLISHED');
  return {
    ...item,
    status,
    published: item.published ?? status === 'PUBLISHED',
    _date: toDate(item.publishedAt) || toDate(item.createdAt)
  };
}

/** Newest first (publishedAt DESC). */
export function sortNewest(list) {
  return list.slice().sort((a, b) => (b._date?.getTime() || 0) - (a._date?.getTime() || 0));
}

function withTimeout(p, ms, label) {
  return Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))
  ]);
}

async function fetchCollection(fsb, name) {
  const { db, fs } = fsb;
  const col = fs.collection(db, name);
  try {
    const snap = await fs.getDocs(
      fs.query(col, fs.where('published', '==', true), fs.orderBy('publishedAt', 'desc'), fs.limit(300))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    if (err && err.code === 'failed-precondition') {
      // Composite index not deployed yet → still correct, sorted client-side.
      console.info(`[content] Index for "${name}" missing; sorting in the browser. Deploy firebase/firestore.indexes.json.`);
      const snap = await fs.getDocs(fs.query(col, fs.where('published', '==', true), fs.limit(300)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    throw err;
  }
}

async function fetchSingleton(fsb, col, id = 'main') {
  const { db, fs } = fsb;
  const snap = await fs.getDoc(fs.doc(db, col, id));
  return snap.exists() ? snap.data() : null;
}

function seedData() {
  const out = {
    siteSettings: { ...SEED.siteSettings },
    seoSettings: { ...SEED.seoSettings },
    profiles: { ...SEED.profiles },
    source: 'starter'
  };
  for (const c of CONTENT_COLLECTIONS) out[c] = sortNewest((SEED[c] || []).map(normalize));
  return out;
}

export async function loadContent() {
  const data = seedData();
  if (!isConfigured) return data;

  try {
    const fsb = await withTimeout(getFirestoreBundle(), 8000, 'Firebase SDK');
    const [settings, seo, profile] = await withTimeout(
      Promise.all([
        fetchSingleton(fsb, 'siteSettings').catch(() => null),
        fetchSingleton(fsb, 'seoSettings').catch(() => null),
        fetchSingleton(fsb, 'profiles').catch(() => null)
      ]),
      8000,
      'Settings'
    );
    if (settings) Object.assign(data.siteSettings, settings);
    if (seo) Object.assign(data.seoSettings, seo);
    if (profile) Object.assign(data.profiles, profile);

    const useSeed = data.siteSettings.useSeedFallback !== false;
    const results = await withTimeout(
      Promise.allSettled(CONTENT_COLLECTIONS.map((c) => fetchCollection(fsb, c))),
      10000,
      'Collections'
    );
    results.forEach((r, i) => {
      const name = CONTENT_COLLECTIONS[i];
      if (r.status === 'fulfilled' && r.value.length) {
        data[name] = sortNewest(r.value.map(normalize).filter((x) => x.published === true));
      } else if (!useSeed) {
        data[name] = [];
      }
      if (r.status === 'rejected') console.warn(`[content] ${name}:`, r.reason?.message || r.reason);
    });
    data.source = 'firestore';
  } catch (err) {
    console.warn('[content] Firestore unavailable; showing starter content.', err?.message || err);
  }
  return data;
}

/** Combined "Latest from Fahreen" feed — newest first. */
export function buildLatestFeed(data) {
  const tag = (list, type) => (list || []).map((x) => ({ ...x, _type: type }));
  return sortNewest([
    ...tag(data.activities, 'activity'),
    ...tag(data.articles, 'article'),
    ...tag(data.media, 'media'),
    ...tag(data.videos, 'video'),
    ...tag((data.awards || []).filter((a) => a.showInFeed), 'award')
  ]);
}
