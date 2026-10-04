/**
 * Hero "healthcare ecosystem".
 *
 *  Desktop + WebGL + motion allowed  → Three.js scene (self-hosted, lazy-loaded)
 *  Mobile / low-power / no WebGL     → light 2D canvas network
 *  prefers-reduced-motion            → single static 2D frame
 *
 * Seven professional domains orbit the name as HTML buttons (accessible,
 * keyboard-focusable). Their screen positions are projected from the scene.
 */

const NODE_COUNT = 7;
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export async function initHero() {
  const hero = document.getElementById('home');
  const stage = document.getElementById('hero-stage');
  const items = [...document.querySelectorAll('#hero-nodes li')];
  if (!hero || !stage) return;

  // Node buttons → scroll to their chapter
  items.forEach((li) => {
    const b = li.querySelector('button');
    b.addEventListener('click', () => {
      const t = document.querySelector(b.dataset.target);
      t?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' });
    });
  });

  const wide = () => window.innerWidth >= 900 && window.innerHeight >= 560;
  const lowPower =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
    (navigator.connection && navigator.connection.saveData) ||
    (navigator.deviceMemory && navigator.deviceMemory < 4);

  const reduced = prefersReduced();
  // ?renderer=webgl | 2d | static lets you test each tier on any device
  const force = new URLSearchParams(location.search).get('renderer');
  const use3D = force === 'webgl' ? hasWebGL() : force ? false : !reduced && wide() && !lowPower && hasWebGL();

  const ctx = { hero, stage, items, hot: -1, orbit: false };
  items.forEach((li, i) => {
    const b = li.querySelector('button');
    b.addEventListener('mouseenter', () => (ctx.hot = i));
    b.addEventListener('focus', () => (ctx.hot = i));
    b.addEventListener('mouseleave', () => (ctx.hot = -1));
    b.addEventListener('blur', () => (ctx.hot = -1));
  });

  const setOrbit = () => {
    ctx.orbit = wide();
    hero.classList.toggle('is-orbit', ctx.orbit);
    if (!ctx.orbit) items.forEach((li) => { li.style.transform = ''; li.style.opacity = ''; });
  };
  setOrbit();
  window.addEventListener('resize', setOrbit, { passive: true });

  if (use3D) {
    try {
      await start3D(ctx);
      hero.dataset.renderer = 'webgl';
      return;
    } catch (err) {
      console.info('[hero] WebGL scene unavailable, using 2D fallback:', err?.message || err);
    }
  }
  const isStatic = reduced || force === 'static';
  start2D(ctx, isStatic);
  hero.dataset.renderer = isStatic ? 'static' : '2d';
}

/* ---------------- shared helpers ---------------- */
function nameRect(hero) {
  const h = hero.getBoundingClientRect();
  return [...hero.querySelectorAll('.hero__role, .hero__name span, .hero__now, .hero__foot .btn')].map((el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left - h.left - 64, r: r.right - h.left + 64, t: r.top - h.top - 20, b: r.bottom - h.top + 20 };
  });
}

function placeLabels(ctx, pts) {
  if (!ctx.orbit) return;
  const nr = ctx._nr || (ctx._nr = nameRect(ctx.hero));
  pts.forEach((p, i) => {
    const li = ctx.items[i];
    if (!li) return;
    const inside = nr.some((z) => p.x > z.l && p.x < z.r && p.y > z.t && p.y < z.b);
    const depth = Math.max(0, Math.min(1, p.depth)); // 1 = front
    let op = 0.55 + depth * 0.45;
    if (inside) op = 0;
    li.style.opacity = op.toFixed(2);
    li.style.pointerEvents = inside ? 'none' : 'auto';
    li.style.zIndex = inside ? 1 : 3 + Math.round(depth * 10);
    li.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${(0.86 + depth * 0.18).toFixed(3)})`;
  });
}

function visibilityGate(ctx, onChange) {
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; onChange(visible && !document.hidden); }, { threshold: 0.02 });
  io.observe(ctx.hero);
  document.addEventListener('visibilitychange', () => onChange(visible && !document.hidden));
  window.addEventListener('resize', () => { ctx._nr = null; }, { passive: true });
}

/* ---------------- 3D (Three.js) ---------------- */
async function start3D(ctx) {
  const THREE = await import('../assets/vendor/three.module.min.js');
  const { stage, hero } = ctx;

  const primary = new THREE.Color(cssVar('--color-primary', '#7FD6C2'));
  const accent = new THREE.Color(cssVar('--color-accent', '#D8B26E'));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c1e24, 7, 15);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const world = new THREE.Group();
  world.rotation.x = 0.26;
  scene.add(world);

  // Particle sphere — the population / data field
  const N = 1600, R = 3.1;
  const pos = new Float32Array(N * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const jitter = 1 + (Math.random() - 0.5) * 0.05;
    pos[i * 3] = Math.cos(th) * r * R * jitter;
    pos[i * 3 + 1] = y * R * jitter;
    pos[i * 3 + 2] = Math.sin(th) * r * R * jitter;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ color: primary, size: 0.032, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true });
  const sphere = new THREE.Points(pGeo, pMat);
  world.add(sphere);

  // Latitude rings — quiet structure, not a cliché globe
  const ringMat = new THREE.LineBasicMaterial({ color: primary, transparent: true, opacity: 0.08 });
  [-0.55, 0, 0.55].forEach((lat) => {
    const pts = [];
    const rr = Math.cos(lat) * R * 1.002;
    for (let a = 0; a <= 64; a++) { const t = (a / 64) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * rr, Math.sin(lat) * R, Math.sin(t) * rr)); }
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  });

  // Orbit of seven domains
  const ORBIT = 4.6;
  const orbitGroup = new THREE.Group();
  world.add(orbitGroup);
  const orbitPts = [];
  for (let a = 0; a <= 128; a++) { const t = (a / 128) * Math.PI * 2; orbitPts.push(new THREE.Vector3(Math.cos(t) * ORBIT, 0, Math.sin(t) * ORBIT)); }
  orbitGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.22 })));

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const t = (i / NODE_COUNT) * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(t) * ORBIT, Math.sin(t * 2) * 0.35, Math.sin(t) * ORBIT);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: i === 0 ? accent : primary }));
    core.position.copy(p);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i === 0 ? accent : primary, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.setScalar(0.5);
    core.add(halo);
    orbitGroup.add(core);
    nodes.push({ core, halo, base: p.clone() });
  }

  // Threads: each node links to the nodes two steps away (heptagram) and to the sphere
  const linkPairs = [];
  for (let i = 0; i < NODE_COUNT; i++) linkPairs.push([i, (i + 2) % NODE_COUNT], [i, (i + 3) % NODE_COUNT]);
  const linkGeo = new THREE.BufferGeometry();
  const linkPos = new Float32Array(linkPairs.length * 6);
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  const links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: primary, transparent: true, opacity: 0.12 }));
  orbitGroup.add(links);
  const spokeGeo = new THREE.BufferGeometry();
  const spokePos = new Float32Array(NODE_COUNT * 6);
  spokeGeo.setAttribute('position', new THREE.BufferAttribute(spokePos, 3));
  const spokes = new THREE.LineSegments(spokeGeo, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.16 }));
  orbitGroup.add(spokes);

  // Pulses travelling along threads
  const PULSES = 18;
  const pulseGeo = new THREE.BufferGeometry();
  const pulsePos = new Float32Array(PULSES * 3);
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.85, depthWrite: false, map: glowTex, blending: THREE.AdditiveBlending }));
  orbitGroup.add(pulses);
  const pulseState = Array.from({ length: PULSES }, () => ({ pair: (Math.random() * linkPairs.length) | 0, t: Math.random(), speed: 0.12 + Math.random() * 0.18 }));

  // Interaction
  let tx = 0, ty = 0, mx = 0, my = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1.2 ? 13 : 10.8;
    camera.updateProjectionMatrix();
    ctx._nr = null;
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  const v = new THREE.Vector3();
  let running = true, last = performance.now(), raf = 0, spin = 0;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    spin += dt * (ctx.hot >= 0 ? 0.03 : 0.085);
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    world.rotation.y = spin * 0.6 + mx * 0.25;
    world.rotation.x = 0.26 + my * 0.1;
    orbitGroup.rotation.y = spin * 0.55;
    sphere.rotation.y = -spin * 0.35;

    nodes.forEach((n, i) => {
      const s = ctx.hot === i ? 1.9 : 1;
      n.core.scale.lerp(v.set(s, s, s), 0.12);
      n.halo.material.opacity = ctx.hot === i ? 1 : 0.65 + Math.sin(now / 900 + i) * 0.1;
    });
    linkPairs.forEach(([a, b], k) => {
      const A = nodes[a].core.position, B = nodes[b].core.position;
      linkPos.set([A.x, A.y, A.z, B.x, B.y, B.z], k * 6);
    });
    linkGeo.attributes.position.needsUpdate = true;
    nodes.forEach((n, i) => {
      const P = n.core.position;
      const k = 3.1 / P.length();
      spokePos.set([P.x, P.y, P.z, P.x * k, P.y * k, P.z * k], i * 6);
    });
    spokeGeo.attributes.position.needsUpdate = true;
    pulseState.forEach((p, k) => {
      p.t += dt * p.speed;
      if (p.t > 1) { p.t = 0; p.pair = (Math.random() * linkPairs.length) | 0; }
      const [a, b] = linkPairs[p.pair];
      const A = nodes[a].core.position, B = nodes[b].core.position;
      pulsePos[k * 3] = A.x + (B.x - A.x) * p.t;
      pulsePos[k * 3 + 1] = A.y + (B.y - A.y) * p.t;
      pulsePos[k * 3 + 2] = A.z + (B.z - A.z) * p.t;
    });
    pulseGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    // Project node positions → label positions
    const w = stage.clientWidth, h = stage.clientHeight;
    const out = nodes.map((n) => {
      n.core.getWorldPosition(v);
      const camDist = v.distanceTo(camera.position);
      v.project(camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, depth: (14.6 - camDist) / 9.2 };
    });
    placeLabels(ctx, out);
  };
  raf = requestAnimationFrame(loop);

  visibilityGate(ctx, (on) => {
    if (on && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    else if (!on && running) { running = false; cancelAnimationFrame(raf); }
  });
}

/* ---------------- 2D canvas fallback ---------------- */
function start2D(ctx, reduced) {
  const { stage, hero } = ctx;
  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);
  const g = canvas.getContext('2d');
  const primary = cssVar('--color-primary', '#7FD6C2');
  const accent = cssVar('--color-accent', '#D8B26E');
  let W = 0, H = 0, dpr = 1, parts = [];

  const rgba = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(36, (W * H) / 16000)));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, r: Math.random() * 1.4 + 0.4
    }));
    ctx._nr = null;
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  let spin = 0;
  const draw = (dt) => {
    g.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * (W < 700 ? 0.44 : 0.47);
    // particle network
    for (const p of parts) {
      p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    const maxD = Math.min(130, W * 0.18);
    for (let i = 0; i < parts.length; i++) {
      const a = parts[i];
      for (let j = i + 1; j < parts.length; j++) {
        const b = parts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxD) { g.strokeStyle = rgba(primary, (1 - d / maxD) * 0.16); g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
      }
      g.fillStyle = rgba(primary, 0.55); g.beginPath(); g.arc(a.x, a.y, a.r, 0, Math.PI * 2); g.fill();
    }
    // orbit
    const Rx = Math.min(W * 0.42, 560), Ry = Math.min(H * 0.3, 240);
    g.strokeStyle = rgba(accent, 0.22); g.lineWidth = 1;
    g.beginPath(); g.ellipse(cx, cy, Rx, Ry, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = rgba(primary, 0.08);
    g.beginPath(); g.ellipse(cx, cy, Rx * 0.62, Ry * 0.62, 0, 0, Math.PI * 2); g.stroke();
    const pts = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const t = (i / NODE_COUNT) * Math.PI * 2 + spin;
      pts.push({ x: cx + Math.cos(t) * Rx, y: cy + Math.sin(t) * Ry, depth: (Math.sin(t) + 1) / 2 });
    }
    g.strokeStyle = rgba(primary, 0.12);
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = pts[i], b = pts[(i + 2) % NODE_COUNT];
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    pts.forEach((p, i) => {
      const r = (ctx.hot === i ? 7 : 4) * (0.7 + p.depth * 0.5);
      const grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
      grd.addColorStop(0, rgba(i === 0 ? accent : primary, 0.5)); grd.addColorStop(1, rgba(primary, 0));
      g.fillStyle = grd; g.beginPath(); g.arc(p.x, p.y, r * 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = i === 0 ? accent : primary; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
    });
    placeLabels(ctx, pts);
  };

  if (reduced) { draw(0); window.addEventListener('resize', () => requestAnimationFrame(() => draw(0))); return; }

  let running = true, last = performance.now(), raf = 0;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    spin += dt * (ctx.hot >= 0 ? 0.02 : 0.07);
    draw(dt);
  };
  raf = requestAnimationFrame(loop);
  visibilityGate(ctx, (on) => {
    if (on && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    else if (!on && running) { running = false; cancelAnimationFrame(raf); }
  });
}
