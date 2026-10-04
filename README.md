# Dr. Fahreen Hannan — Personal Website

An immersive digital biography of **Dr. Fahreen Hannan**, Senior Healthcare, Business Development & Partnerships Leader, International Business Lead at Grameen HealthTech Limited, and former Founder & CEO of Dhaka Cast Limited.

- **Frontend:** static HTML, CSS and JavaScript (ES modules), hosted on **GitHub Pages**
- **Backend:** **Firebase** (Authentication, Firestore, Storage)
- **App:** installable **Progressive Web App** with an offline page
- **No build step.** No `npm install` is needed to run or deploy.

---

## Contents

1. [Project overview](#1-project-overview)
2. [Screenshots](#2-screenshots)
3. [Features](#3-features)
4. [Tech stack](#4-tech-stack)
5. [Architecture](#5-architecture)
6. [Folder structure](#6-folder-structure)
7. [Content sources and accuracy](#7-content-sources-and-accuracy)
8. [Local development](#8-local-development)
9. [Firebase setup (step by step)](#9-firebase-setup-step-by-step)
10. [Security rules](#10-security-rules)
11. [Admin setup](#11-admin-setup)
12. [Using the Admin Panel](#12-using-the-admin-panel)
13. [GitHub repository setup](#13-github-repository-setup)
14. [GitHub Pages deployment](#14-github-pages-deployment)
15. [The GitHub Pages path issue](#15-the-github-pages-path-issue)
16. [What is safe to commit](#16-what-is-safe-to-commit)
17. [PWA installation](#17-pwa-installation)
18. [SEO](#18-seo)
19. [Custom domain setup (later)](#19-custom-domain-setup-later)
20. [Firebase authorized domains](#20-firebase-authorized-domains)
21. [Troubleshooting](#21-troubleshooting)
22. [Testing checklist](#22-testing-checklist)
23. [Future improvements](#23-future-improvements)

---

## 1. Project overview

The site presents Dr. Fahreen Hannan's career as an explorable experience rather than an online CV. It covers clinical training, public health, the Dhaka Cast startup chapter, digital health and international partnerships.

It works **immediately, without Firebase**. All CV-based content is built in (`js/seed-data.js`). Once Firebase is connected, the Admin Panel imports that content into Firestore in one click. From then on everything is editable without touching code.

## 2. Screenshots

Add screenshots after deployment to a `docs/` folder and reference them here:

| Desktop hero | Mobile | Admin |
| --- | --- | --- |
| `docs/desktop.png` | `docs/mobile.png` | `docs/admin.png` |

## 3. Features

**Public site**

- **Intro sequence.** A first-visit sequence ("Healthcare system initializing…") lasting under 2.6 s. It can be skipped and is never shown with reduced motion.
- **3D hero ecosystem.** Seven professional domains orbit her name, and each one is a button that leads to its chapter. The renderer is chosen automatically:
  - **WebGL (Three.js):** used on capable desktops.
  - **2D canvas:** used on phones, low-power devices, or when WebGL is unavailable.
  - **Static frame:** used with `prefers-reduced-motion`.
  - **Testing override:** add `?renderer=webgl`, `?renderer=2d` or `?renderer=static` to the URL to test any tier.
- **Executive profile.** An editorial portrait, biography, key facts and professional focus.
- **Professional journey.** A horizontal timeline (2010 to Present). Each milestone opens its chapter in a dialog.
- **Experience.** The current role is shown as a spotlight. Earlier roles expand to show their responsibilities.
- **Digital health and partnerships.** An interactive sector network plus a canvas globe. The globe marks only places confirmed by her CV or press coverage.
- **Dhaka Cast case study.** Problem, Idea, Platform, Services, Growth, Impact and Recognition, with a progress bar that fills as you scroll.
- **Impact ledger.** Every figure states its source.
- **Recognition.** A featured award plus a list, each opening a full-screen certificate view.
- **Latest from Fahreen.** A combined feed of activities, articles, media, videos and opted-in awards. It is always sorted **newest first** (`publishedAt DESC`), with category filters and "View all".
- **In the media.** Press list with "Read article" and clipping viewer.
- **Watch / listen.** Supports YouTube, Facebook, LinkedIn, Vimeo and uploaded files. Nothing autoplays until the visitor presses play. The section stays hidden until a video exists.
- **Visual journey gallery.** A masonry layout (newest top-left) with category filters and a lightbox. The lightbox supports arrow keys, swipe, and swipe-down to close.
- **Academic band.** Education, research and training.
- **Contact.** Email, phone, LinkedIn and Facebook.
- **Floating "Let's connect" WhatsApp button.** The number is managed in the Admin Panel.
- **Navigation.**
  - Desktop: a floating glass navigation bar.
  - Tablet and phone: a full-screen menu.
  - Phone: an app-style bottom navigation bar.
- **Accessibility.** Includes:
  - semantic HTML, skip link and visible focus states;
  - keyboard support everywhere;
  - native `<dialog>` with focus return;
  - reduced-motion support;
  - a custom cursor on desktop fine pointers only.

**Admin Panel** (`admin-login.html` → `admin.html`)

- Firebase email/password login, with a check against the `admins` collection before anything loads.
- **Dashboard:**
  - totals, published counts and drafts;
  - per-section counts;
  - the 8 latest items;
  - quick-add buttons.
- **Create, edit and delete** for activities, articles, media, videos, gallery, awards, testimonials, experience, education, training, research and social links.
- **Status workflow:** DRAFT, PUBLISHED and UNPUBLISHED. Only PUBLISHED items appear publicly, and you can preview before publishing.
- **Sorting:** newest first (default), oldest first or category. You can also filter by status and category, and search titles.
- **Uploads to Firebase Storage:**
  - images are resized in the browser and get a thumbnail automatically;
  - videos, PDFs and multi-photo gallery uploads are supported;
  - uploaded files are deleted together with their item.
- **Settings:**
  - Profile: bio, focus areas and portrait.
  - Site settings: name, title, contact details, WhatsApp number and message, LinkedIn, Facebook, theme accent.
  - SEO: title, description, share image, canonical URL.
- **Featured flag** on every item.
- **Starter content import:** copies all CV-based content into Firestore in one click.

**PWA**

- `manifest.json` with standalone display, theme colours, regular and maskable icons, and shortcuts.
- `sw.js` caches the app shell (HTML, CSS, JS, fonts, icons). It **never intercepts Firebase or any cross-origin request**, and never caches admin pages.
- `offline.html` fallback.
- An install button appears only when the browser supports installation. On iOS there is a single, dismissible hint.

## 4. Tech stack

| Layer | Choice |
| --- | --- |
| Markup and style | HTML5, CSS3 (custom properties, grid, `color-mix`, `:has`) |
| Logic | JavaScript ES modules, no framework, no bundler |
| 3D | Three.js r160 (self-hosted at `assets/vendor/three.module.min.js`, loaded only on capable desktops) |
| Motion | CSS animations, IntersectionObserver, requestAnimationFrame. GSAP was not needed. |
| Fonts | Cormorant (display), Manrope (body), Space Grotesk (interface). Self-hosted, Latin subset. |
| Backend | Firebase JS SDK v10 (modular, loaded from Google's CDN only when configured) |
| Hosting | GitHub Pages |

## 5. Architecture

```
USER
 ↓
GitHub Pages  (static files: HTML · CSS · JS · images · PWA)
 ↓
Frontend (browser)
 ↓
Firebase
 ├── Authentication   (admin login)
 ├── Firestore        (all content, settings, SEO)
 └── Storage          (uploaded images, videos, PDFs)
```

Later, with a custom domain:

```
USER → CUSTOM DOMAIN → GITHUB PAGES → FRONTEND → FIREBASE
```

**How content loads** (`js/content.js`):

1. If Firebase is not configured, the built-in starter content is shown.
2. If it is configured, the site reads `siteSettings/main`, `seoSettings/main`, `profiles/main`, then each collection. It queries `where('published','==',true)` and `orderBy('publishedAt','desc')`.
3. Any collection that is still empty falls back to the starter content, until the starter content is imported. Importing sets `useSeedFallback: false`.
4. If Firestore is unreachable, the starter content is shown and the page never breaks.

## 6. Folder structure

```
fahreen-portfolio/
├── index.html              Public site
├── admin-login.html        Admin sign-in
├── admin.html              Admin Panel (protected)
├── offline.html            Offline fallback page
├── 404.html                GitHub Pages "not found" page
├── manifest.json           PWA manifest
├── sw.js                   Service worker
├── robots.txt
├── sitemap.xml
├── favicon.ico
├── .nojekyll               Tells GitHub Pages to serve files as-is
├── README.md
│
├── css/
│   ├── style.css           Design system + all components
│   ├── responsive.css      Breakpoints, mobile app UI, standalone mode
│   └── admin.css           Admin Panel
│
├── js/
│   ├── app.js              Public entry: renders sections, dialogs, menu
│   ├── animations.js       Intro, cursor, scroll-spy, header, case-study steps
│   ├── firebase-config.js  ← paste your Firebase web config here
│   ├── firebase.js         Lazy Firebase loader (Firestore / Auth / Storage)
│   ├── content.js          Data layer: Firestore + starter fallback, newest-first
│   ├── seed-data.js        Starter content from the CV + supplied photos
│   ├── render.js           Shared XSS-safe templates (site + admin preview)
│   ├── hero3d.js           3D / 2D / static hero ecosystem
│   ├── globe.js            Canvas globe of verified locations
│   ├── gallery.js          Masonry + lightbox
│   ├── media.js            Press list + video player
│   ├── pwa.js              SW registration, install UI, offline notices
│   ├── admin-login.js      Sign-in page logic
│   └── admin.js            Admin Panel logic
│
├── assets/
│   ├── fonts/              4 × woff2
│   ├── icons/              192, 512, maskable, apple-touch, favicon-32
│   ├── images/             Optimised photos (+ thumbs/) and og-image.jpg
│   └── vendor/             three.module.min.js
│
└── firebase/
    ├── firestore.rules
    ├── storage.rules
    ├── firestore.indexes.json
    ├── firebase.json       For deploying rules with the Firebase CLI
    └── .firebaserc.example
```

**Changes from the suggested structure, and why:**

- **Extra JS files.** `seed-data.js`, `render.js`, `hero3d.js`, `globe.js` and `admin-login.js` were added. This keeps the heavy 3D and globe code out of the first page load (they are loaded only when needed). It also lets the Admin preview use exactly the same templates as the public site.
- **Extra Firebase files.** `firebase.json` and `firestore.indexes.json` live in `/firebase` so the rules and indexes can be deployed with one command.
- **Extra pages.** `offline.html` and `404.html` were added for the PWA and GitHub Pages.

## 7. Content sources and accuracy

Nothing on the site is invented. Every starter item in `js/seed-data.js` records its `source`.

- **The CV is the primary source.** It supplies roles, dates, education, awards, training, research and contact details.
- **Supplied photographs and clippings** are used for:
  - Bangladesh Post (2 October 2026) and the Somoy image of the Cox's Bazar roundtable;
  - the Bengali feature by Mahbub Nahid;
  - the Digital Bangladesh Award 2021 and ACT COVID-19 certificates;
  - She Loves Tech 2019 photos;
  - the GP Accelerator card;
  - the Kumudini Welfare Trust MOU;
  - Digital World 2020;
  - the Bridge for Billions certificate;
  - the Employee of the Quarter Q4 2025–26 plaque.
- **The CV takes precedence where sources disagree:**
  - Bangladesh Post calls her "Head of International Partnerships", but the site uses the CV title "International Business Lead". The article's wording is mentioned in that activity's story.
  - The Bengali feature gives a different founding year for Dhaka Cast and a different dental college. The CV values are used.
- **LinkedIn link.** The site uses the link supplied with the brief: `linkedin.com/in/fahreen-hannan/`. The CV prints a different one; change it in Admin → Site settings if needed.
- **Dates to confirm.** Items whose source has no exact date carry a `dateNote`. Open them in the Admin Panel and set the real date:
  - Kumudini MOU
  - Bridge for Billions certificate
  - the Bengali feature
  - Somoy link
  - She Loves Tech exact date
  - Digital World 2020
  - gallery photo order
- **Neutral captions.** A photo with a public figure is captioned "At a conference" without naming anyone. Edit the caption if you wish.
- **Social media was not scraped.** Add posts manually in the Admin Panel; use the External link field to store the source URL.

## 8. Local development

You need a simple local web server because ES modules do not load from `file://`.

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Enter the folder**

   ```bash
   cd fahreen-portfolio
   ```

3. **Install dependencies.** None. There is no build tool.

4. **Configure Firebase** (optional for local preview). See [section 9](#9-firebase-setup-step-by-step). Without it, the site runs on starter content.

5. **Start a local server.** Use any one of these:

   ```bash
   # Python 3 (already installed on macOS/Linux)
   python3 -m http.server 8080

   # Node.js
   npx serve -l 8080 .

   # VS Code: install the "Live Server" extension → right-click index.html → "Open with Live Server"
   ```

6. **Open the site.** Go to <http://localhost:8080>. The admin is at <http://localhost:8080/admin-login.html>.

`localhost` counts as a secure origin, so the service worker and admin login work locally. When you change CSS or JS during development, bump `VERSION` in `sw.js` or use DevTools → Application → Service Workers → "Update on reload".

## 9. Firebase setup (step by step)

**Step 1. Go to the Firebase Console.** Open <https://console.firebase.google.com> and sign in with a Google account.

**Step 2. Create a project.** Click **Add project** and name it, for example `fahreen-portfolio`. Google Analytics is optional; you can switch it off.

**Step 3. Add a Web App.**

- In the project overview, click the **Web** icon `</>`.
- Give it a nickname such as `website`.
- Do **not** tick "Firebase Hosting"; you are using GitHub Pages.
- Click **Register app**.

**Step 4. Copy the configuration.** Firebase shows a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIza…",
  authDomain: "fahreen-portfolio.firebaseapp.com",
  projectId: "fahreen-portfolio",
  storageBucket: "fahreen-portfolio.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
```

You can find it again later under ⚙ **Project settings → General → Your apps**.

**Step 5. Add the configuration to the project.** Open `js/firebase-config.js` and replace each `YOUR_…` placeholder with your values. Save the file.

**Step 6. Enable Authentication.** Go to **Build → Authentication → Get started**.

**Step 7. Enable Email/Password.**

- Open the **Sign-in method** tab and choose **Email/Password**.
- Turn on the first switch and click **Save**.
- Leave "Email link" off.

**Step 8. Create the Firestore database.**

- Go to **Build → Firestore Database → Create database**.
- Choose a location close to your visitors (for example `asia-south1` for Mumbai, or `asia-southeast1` for Singapore). It cannot be changed later.
- Start in **production mode**. You will replace the rules in step 10.

**Step 9. Create Storage.**

- Go to **Build → Storage → Get started**.
- Choose production mode and the same region.
- New projects may need the Blaze (pay-as-you-go) plan for Storage. Small portfolio usage normally stays within the free allowance, but set a budget alert under Google Cloud Billing.

**Step 10. Deploy the Firestore rules and indexes.** Use either option.

*Option A, Console (no tools needed):*

1. Go to **Firestore → Rules**, paste the full contents of `firebase/firestore.rules`, then click **Publish**.
2. For indexes, the site still works without them (it sorts in the browser and logs a notice in the console). To create one, open the link printed in the browser console, or add a composite index in **Firestore → Indexes** for each collection: `published` Ascending + `publishedAt` Descending.

*Option B, Firebase CLI (deploys rules and all indexes at once):*

```bash
npm install -g firebase-tools
firebase login
cd firebase
cp .firebaserc.example .firebaserc      # then put your project ID inside
firebase deploy --only firestore:rules,firestore:indexes,storage
```

**Step 11. Deploy the Storage rules.**

- *Console:* go to **Storage → Rules**, paste `firebase/storage.rules`, and click **Publish**.
- *CLI:* already included in Option B above.

The Storage rules check Firestore to see whether the uploader is an admin. On first publish, Firebase asks to grant Storage access to Firestore; click **Grant**.

**Step 12. Create the first admin account.** See [section 11](#11-admin-setup).

## 10. Security rules

`firebase/firestore.rules`

| Who | What they can do |
| --- | --- |
| Anyone | Read `siteSettings`, `seoSettings`, `profiles` |
| Anyone | Read content documents **only where `published == true`** |
| Signed-in admin (UID in `/admins`) | Read everything, create, update and delete content |
| Signed-in user | Read **their own** `/admins/{uid}` document (to check admin status) |
| Everyone, including admins | **Cannot write** `/admins` from the browser; manage it only in the Console |
| Anything else | Denied |

Writes are also validated:

- `title` must be a non-empty string;
- `published` must be a boolean;
- `status` must be DRAFT, PUBLISHED or UNPUBLISHED;
- `published` must equal `status == 'PUBLISHED'`.

`firebase/storage.rules`

- Files under `/uploads/**` are publicly readable, because they are displayed on the site.
- Only admins can upload, replace or delete files.
- Images and PDFs are limited to 20 MB; videos to 300 MB.
- Everything else is denied.

The rules never use `allow read, write: if true`.

## 11. Admin setup

1. **Create the admin user.**
   - Go to **Firebase Console → Authentication → Users → Add user**.
   - Enter the admin email and a strong password.
2. **Copy the UID.** Copy the **User UID** shown in the users table (a long string such as `kX9…Q2`).
3. **Register the UID as an admin.**
   - Go to **Firestore Database → Data → Start collection**.
   - Collection ID: `admins`.
   - Document ID: paste the UID exactly.
   - Add a field: `email` (string) = the admin email. Any field works; only the document's existence matters.
   - Click **Save**.
4. **Apply the security rules** (section 9, steps 10–11) if you have not already.
5. **Open** `/admin-login.html` on your site, for example `https://USERNAME.github.io/fahreen-portfolio/admin-login.html`.
6. **Log in** with the email and password from step 1.
7. **Manage the website.**
   - First, go to **Starter content** and click **Import starter content**.
   - Then edit freely.

To add another admin, repeat steps 1–3. To remove one, delete their `admins/{uid}` document and, optionally, the user.

**Passwords are never stored in code.** Reset a forgotten password from the login page ("Forgot password?") or in the Firebase Console.

## 12. Using the Admin Panel

| Task | Where |
| --- | --- |
| Add an activity | Dashboard → **+ Add activity** (or Activities → **+ Add**) |
| Publish / unpublish | **Publish** in the editor, or the **Publish / Unpublish** button in any list |
| Preview before publishing | Editor → **Preview** shows the card and the detail view |
| Make it appear first | Set **Publish date**. Newest dates appear first everywhere |
| Feature on homepage | Tick **Featured** (the first featured award becomes the large Recognition card) |
| Show an award in the "Latest" feed | Award → tick **Also show in "Latest from Fahreen"** |
| Upload several photos | Gallery → **Upload several photos** |
| Change WhatsApp number | **Site settings & WhatsApp** → digits only, e.g. `8801XXXXXXXXX` |
| Change bio or portrait | **Profile** |
| Change search-engine text | **SEO** |
| Switch theme accent | **Site settings** → Theme accent (aqua, violet, brass) |

**How the WhatsApp button works:**

- It opens `https://wa.me/<NUMBER>?text=<message>`.
- The default message is "Hello Dr. Fahreen, I visited your website and would like to connect."
- Until a number is saved, the button scrolls to the Contact section instead. **No number is hard-coded.**

**Video links:**

- Supported links: YouTube (`youtube.com/watch?v=…`, `youtu.be/…`, Shorts), Facebook video URLs, Vimeo, and LinkedIn post URLs that contain `activity-…` or `urn:li:…`.
- LinkedIn posts that cannot be embedded show a "Watch on the original site" button.
- Uploaded video files play in the built-in player.

## 13. GitHub repository setup

1. **Create a repository.** Go to <https://github.com/new> and name it, for example `fahreen-portfolio`. Make it **Public** (GitHub Pages on free accounts requires this). Don't add a README; this project has one.

2. **Open a terminal in the project folder.**

   ```bash
   cd fahreen-portfolio
   ```

3. **Initialise git.**

   ```bash
   git init
   ```

4. **Add the files.**

   ```bash
   git add .
   ```

5. **Commit.**

   ```bash
   git commit -m "Initial portfolio"
   ```

6. **Add the remote.** Copy the URL from your new GitHub repository page.

   ```bash
   git remote add origin https://github.com/USERNAME/fahreen-portfolio.git
   ```

7. **Push.**

   ```bash
   git branch -M main
   git push -u origin main
   ```

**Later updates:**

```bash
git add .
git commit -m "Describe the change"
git push
```

Content changes made in the Admin Panel go to Firebase, so they need **no** git push. Only code or design changes do.

## 14. GitHub Pages deployment

This is a pure static project, so there is no build step.

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: **main**, folder: **/ (root)**, then click **Save**.
5. Wait 1–2 minutes. The **Actions** tab shows the "pages build and deployment" run.

Your site is live at:

```
https://USERNAME.github.io/REPOSITORY-NAME/
```

For example: `https://USERNAME.github.io/fahreen-portfolio/`

**After the first deploy:**

1. Replace `https://USERNAME.github.io/fahreen-portfolio/` with your real URL in these files ([section 18](#18-seo)):
   - `index.html`
   - `sitemap.xml`
   - `robots.txt`
2. Add `USERNAME.github.io` to Firebase **Authorized domains** ([section 20](#20-firebase-authorized-domains)).
3. Commit and push.

## 15. The GitHub Pages path issue

A repository site lives under a sub-path (`/fahreen-portfolio/`), not at the domain root. A link such as `/css/style.css` would point to `https://USERNAME.github.io/css/style.css` and break.

This project avoids that problem completely:

- **All paths are relative.** For example: `css/style.css`, `js/app.js`, `assets/images/...`, `manifest.json`.
- **The manifest uses relative paths too:** `"start_url": "./?source=pwa"`, `"scope": "./"`, and `"id": "./"`.
- **The service worker** is registered with `./sw.js` and scope `./`, and caches `./…` paths. It works under `/fahreen-portfolio/` and, unchanged, at a custom-domain root.
- **CSS fonts** use `../assets/fonts/…`, relative to the stylesheet.
- **Uploaded images** are stored as absolute Firebase Storage URLs.
- **Starter images** are stored as relative `assets/images/…` paths.
- **`404.html`** points its home link at the repository root.

**Rule for future edits: never start an internal path with `/`.**

## 16. What is safe to commit

**Safe to commit:** the Firebase **web app config** in `js/firebase-config.js` (`apiKey`, `authDomain`, `projectId`, etc.).

- These values only identify your project to the browser, and every visitor's browser receives them anyway.
- Security comes from **Authentication + Firestore Rules + Storage Rules**, not from hiding the config.
- Optional hardening: in Google Cloud Console → APIs & Services → Credentials, restrict the browser API key to your domains (HTTP referrers).

**Never commit:**

- a Firebase **Admin SDK** private key or any **service-account JSON**;
- private API secrets, server credentials or `.env` files containing secrets;
- passwords.

If any of these are committed by accident:

1. Revoke them immediately in Google Cloud.
2. Remove them from git history.

## 17. PWA installation

**Requirements:** HTTPS (GitHub Pages provides it) or `localhost`.

| Platform | How visitors install |
| --- | --- |
| Android (Chrome/Edge/Samsung Internet) | **Install app** button in the header or menu, or browser menu → *Install app* |
| Desktop (Chrome/Edge) | **Install app** button, or the install icon in the address bar |
| iPhone / iPad (Safari) | Share → **Add to Home Screen**. A one-time hint appears after scrolling |

When installed, the site opens full-screen with its own icon. On phones the bottom navigation makes it feel like a native app.

**Icons.** These are generated already in `assets/icons/`:

- `icon-192.png` and `icon-512.png` (purpose `any`);
- `maskable-192.png` and `maskable-512.png` (artwork inside the 80 % safe zone, so Android adaptive icons don't crop it);
- `apple-touch-icon.png` (180 × 180) and `favicon.ico` / `favicon-32.png`.

To replace them:

1. Export PNGs at the same sizes.
2. For maskable icons, keep the important artwork within the central 80 %. You can check them at <https://maskable.app>.
3. Keep the same file names, or update `manifest.json`.

**Offline behaviour.**

- Pages already visited, plus CSS, JS, fonts and icons, keep working offline.
- If a page isn't cached, `offline.html` shows "You are offline. Some content may be unavailable."
- Firebase requests are never intercepted. Firestore handles its own connectivity.

**Updating after code changes.**

1. Bump `VERSION` in `sw.js`, for example `fh-v1.0.1`.
2. Push.
3. Returning visitors see "A new version of this site is ready" with a **Refresh** button.

## 18. SEO

Included:

- `<title>`, meta description and canonical link;
- Open Graph and Twitter/X card tags, with a 1200 × 630 share image (`assets/images/og-image.jpg`);
- `Person` structured data (JSON-LD) with accurate CV facts only;
- `robots.txt` and `sitemap.xml`;
- `noindex` on admin pages.

**Replace the placeholder URL once you know your address.** Search and replace `https://USERNAME.github.io/fahreen-portfolio/` in:

- `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD `url` and `image`);
- `sitemap.xml`;
- `robots.txt`.

Admin → SEO can override the title, description and canonical at runtime. Social-media crawlers read the static tags, so keep `index.html` accurate too.

**Note about `robots.txt`.** Search engines only read `robots.txt` at a domain root. On a `username.github.io/repo/` URL it is ignored, but it takes effect once a custom domain is connected. Admin pages are protected regardless by `noindex` and by authentication.

**Submitting to Google.** After deploying, add the site to Google Search Console and submit `sitemap.xml`.

## 19. Custom domain setup (later)

1. **Buy a domain** from any registrar (Namecheap, Cloudflare, GoDaddy, etc.), for example `drfahreenhannan.com`.

2. **Add the domain in GitHub.**
   - Go to **Settings → Pages → Custom domain**.
   - Enter `drfahreenhannan.com` (or `www.drfahreenhannan.com`) and click **Save**.
   - GitHub creates a `CNAME` file in the repository; pull it before your next push: `git pull`.

3. **Configure DNS at your domain provider.**

   For the apex (root) domain `drfahreenhannan.com`, add four **A** records:

   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   Optionally add **AAAA** records for IPv6:

   ```
   2606:50c0:8000::153
   2606:50c0:8001::153
   2606:50c0:8002::153
   2606:50c0:8003::153
   ```

   For `www`, add a **CNAME** record: `www` → `USERNAME.github.io`.

   DNS can take from a few minutes up to 48 hours. If you use Cloudflare, set these records to "DNS only" (grey cloud) until HTTPS is issued.

4. **Enable HTTPS.** Once DNS resolves, tick **Enforce HTTPS** in Settings → Pages. The certificate is issued automatically.

5. **Verify the domain.**
   - Go to your GitHub **profile** Settings → Pages → **Add a domain**.
   - Add the TXT record GitHub shows at your registrar.
   - This prevents anyone else from claiming your domain on GitHub Pages.

6. **Update the site for the new domain** ([section 20](#20-firebase-authorized-domains) and the next subsection).

**PWA and SEO after switching domain.**

- **Manifest, service worker and icons:** no change needed, because all paths are relative.
- **Canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`:** replace the GitHub URL with `https://drfahreenhannan.com/`.
- **Admin → SEO → Canonical URL:** set the new address.
- **Cache refresh:** bump `VERSION` in `sw.js` so visitors receive fresh files.
- **Installs:** a PWA installed from the old address stays tied to that origin. Visitors who installed it should reinstall from the new domain.

**Firebase on the new domain.** The Firebase configuration stays the same. The only required change is adding the new domain to Authorized domains, so admin login works there.

## 20. Firebase authorized domains

Admin login only works on domains Firebase trusts.

1. Go to **Firebase Console → Authentication → Settings → Authorized domains → Add domain**.
2. Add each address you use:
   - `localhost` (present by default)
   - `USERNAME.github.io`
   - later: `drfahreenhannan.com` and `www.drfahreenhannan.com`

The public site reading Firestore does not depend on this list; only Authentication does.

## 21. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Page loads without styles on GitHub Pages | A path starts with `/`. Use relative paths (section 15). Also confirm the Pages source is `main` / `root`. |
| Blank page locally when opening `index.html` by double-click | ES modules need a server. Use `python3 -m http.server` (section 8). |
| Admin page says "Connect Firebase first" | `js/firebase-config.js` still has `YOUR_…` values. |
| `auth/unauthorized-domain` on login | Add the domain in Authentication → Authorized domains. |
| `auth/operation-not-allowed` | Enable Email/Password in Authentication → Sign-in method. |
| "This account is not an administrator" | Create `admins/{UID}` in Firestore with the exact UID (section 11). |
| `permission-denied` when saving | The UID is missing from `admins`, the rules are not published, or the item has no title. |
| Upload fails with `storage/unauthorized` | Publish `storage.rules` and accept the Firestore-access prompt. Check the file is under 20 MB (images/PDF) or 300 MB (video). |
| Console: "Index for … missing" | Not an error, because the site sorts in the browser. Deploy `firestore.indexes.json` or click the link Firebase prints. |
| New content not showing | It must be **PUBLISHED**. Check the Publish date. Reload the site, and hard-refresh if the service worker served an older shell. |
| Starter content keeps reappearing after I deleted items | Admin → Site settings → untick "Show CV starter content for empty sections" (the import does this for you). |
| Old CSS/JS after deploying | Bump `VERSION` in `sw.js`, push, then reload twice or click **Refresh** in the update toast. |
| Install button never appears | The browser must support install prompts (Chrome/Edge), the site must be on HTTPS, and it must not already be installed. On iOS use Share → Add to Home Screen. |
| 3D hero not shown | Expected on phones, low-power devices, without WebGL, or with reduced motion. Force it with `?renderer=webgl` to test. |
| WhatsApp button only scrolls to Contact | No number saved yet. Add it in Admin → Site settings & WhatsApp. |
| LinkedIn video shows "Watch on the original site" | That post URL isn't embeddable. Use a link containing `activity-<id>` or `urn:li:activity:<id>`. |

## 22. Testing checklist

**Verified during development:**

- Tested in Chromium at 320, 390, 768 and 1440 px, with both WebGL and 2D renderers. No console errors.
- Working features:
  - intro and skip;
  - navigation, full-screen menu and bottom navigation;
  - journey dialogs and award dialogs;
  - feed filters;
  - gallery filters, plus lightbox arrows, count and Escape;
  - service-worker registration;
  - offline page;
  - admin pages in the "not configured" state.

**Requires your Firebase project, so run it after setup:**

- [ ] Admin login and logout, and that a non-admin account is refused
- [ ] Import starter content
- [ ] Create, edit and delete an activity; publish and unpublish; check newest-first order on the homepage
- [ ] Image upload (with automatic thumbnail), video upload and link, gallery bulk upload
- [ ] Draft items invisible on the public site; published items visible
- [ ] WhatsApp number saved, and the button opens `wa.me`
- [ ] Rules: logged out, try writing in the browser console; it must fail with `permission-denied`
- [ ] PWA install on Android and iOS
- [ ] Lighthouse (Chrome DevTools) for Performance, Accessibility, Best Practices, SEO and PWA

## 23. Future improvements

- Static pre-rendering of Firestore content (via a GitHub Action) so crawlers see admin-edited text without JavaScript.
- Firebase App Check to further protect Firestore and Storage from abuse.
- Individual shareable pages per activity (`?item=…` with per-item Open Graph).
- A Bengali-language version.
- Scheduled publishing, using a future `publishedAt` together with a scheduled function.
- Automatic WebP/AVIF variants for uploads.
- Analytics with a privacy-friendly tool (e.g. Plausible) if visit statistics are wanted.
