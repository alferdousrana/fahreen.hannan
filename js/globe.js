/**
 * Orthographic canvas globe — no map tiles, no external data.
 * Shows ONLY verified locations (seed-data.js → LOCATIONS).
 */
import { esc } from './render.js';

const D2R = Math.PI / 180;

export function initGlobe({ canvas, list, detail, locations, onOpenActivity }) {
  if (!canvas || !locations?.length) return;
  const g = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
  const primary = css('--color-primary', '#7FD6C2');
  const accent = css('--color-accent', '#D8B26E');
  const text = css('--color-text', '#EEF2EF');

  let lam0 = 96, phi0 = 22, targetLam = lam0, targetPhi = phi0;
  let size = 0, dpr = 1, R = 0, cx = 0, cy = 0, active = null, t0 = performance.now();
  let dragging = false, lastX = 0, lastY = 0, userMoved = false;

  // List of locations (accessible controls)
  list.innerHTML = locations
    .map((l) => `<li><button type="button" data-loc="${esc(l.id)}" aria-pressed="false"><span>${esc(l.name)}</span><span>${esc(l.kind)}</span></button></li>`)
    .join('');
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-loc]');
    if (b) focus(b.dataset.loc);
  });

  function focus(id) {
    const l = locations.find((x) => x.id === id);
    if (!l) return;
    active = id; userMoved = true;
    targetLam = l.lon; targetPhi = Math.max(-30, Math.min(40, l.lat));
    list.querySelectorAll('[data-loc]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.loc === id)));
    detail.innerHTML = `<p><strong>${esc(l.name)}</strong><br>${esc(l.text)}</p>${
      l.activityId ? `<button class="btn btn--ghost" type="button" data-open="activity:${esc(l.activityId)}">Open the story</button>` : `<a class="btn btn--ghost" href="${esc(l.link)}">Go to section</a>`
    }`;
    if (reduced) { lam0 = targetLam; phi0 = targetPhi; draw(); }
  }
  detail.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (b && onOpenActivity) onOpenActivity(b.dataset.open);
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    size = Math.max(200, rect.width);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr; canvas.height = size * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = size * 0.42; cx = size / 2; cy = size / 2;
  }

  function project(lat, lon) {
    const phi = lat * D2R, lam = lon * D2R, p0 = phi0 * D2R, l0 = lam0 * D2R;
    const cosc = Math.sin(p0) * Math.sin(phi) + Math.cos(p0) * Math.cos(phi) * Math.cos(lam - l0);
    const x = R * Math.cos(phi) * Math.sin(lam - l0);
    const y = R * (Math.cos(p0) * Math.sin(phi) - Math.sin(p0) * Math.cos(phi) * Math.cos(lam - l0));
    return { x: cx + x, y: cy - y, v: cosc };
  }

  function path(points) {
    let pen = false;
    g.beginPath();
    for (const [lat, lon] of points) {
      const p = project(lat, lon);
      if (p.v > 0) { pen ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); pen = true; } else pen = false;
    }
    g.stroke();
  }

  function slerp(a, b, t) {
    const toV = ([lat, lon]) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
    const A = toV(a), B = toV(b);
    const d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    if (d < 1e-6) return a;
    const s1 = Math.sin((1 - t) * d) / Math.sin(d), s2 = Math.sin(t * d) / Math.sin(d);
    const v = [A[0] * s1 + B[0] * s2, A[1] * s1 + B[1] * s2, A[2] * s1 + B[2] * s2];
    return [Math.asin(v[2]) / D2R, Math.atan2(v[1], v[0]) / D2R];
  }

  function draw(now = performance.now()) {
    g.clearRect(0, 0, size, size);
    // sphere
    const grd = g.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    grd.addColorStop(0, 'rgba(36, 74, 84, 0.95)');
    grd.addColorStop(1, 'rgba(10, 26, 31, 0.95)');
    g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(127, 214, 194, 0.35)'; g.lineWidth = 1; g.stroke();

    // graticule
    g.strokeStyle = 'rgba(238, 242, 239, 0.07)'; g.lineWidth = 1;
    for (let lon = -180; lon < 180; lon += 20) { const pts = []; for (let lat = -90; lat <= 90; lat += 4) pts.push([lat, lon]); path(pts); }
    for (let lat = -60; lat <= 60; lat += 20) { const pts = []; for (let lon = -180; lon <= 180; lon += 4) pts.push([lat, lon]); path(pts); }

    // arcs from base (Dhaka) to every other verified place
    const base = locations[0];
    locations.slice(1).forEach((l, i) => {
      const pts = [];
      for (let k = 0; k <= 48; k++) pts.push(slerp([base.lat, base.lon], [l.lat, l.lon], k / 48));
      g.strokeStyle = l.id === active ? accent : 'rgba(216, 178, 110, 0.55)';
      g.lineWidth = l.id === active ? 2 : 1.2;
      path(pts);
      if (!reduced) {
        const t = ((now - t0) / 2600 + i * 0.33) % 1;
        const [la, lo] = slerp([base.lat, base.lon], [l.lat, l.lon], t);
        const p = project(la, lo);
        if (p.v > 0) { g.fillStyle = text; g.beginPath(); g.arc(p.x, p.y, 1.8, 0, Math.PI * 2); g.fill(); }
      }
    });

    // pins
    g.font = `500 ${Math.max(11, size * 0.024)}px "Space Grotesk", system-ui, sans-serif`;
    locations.forEach((l) => {
      const p = project(l.lat, l.lon);
      if (p.v <= 0.05) return;
      const on = l.id === active;
      const pulse = reduced ? 0 : (Math.sin(now / 500) + 1) / 2;
      g.fillStyle = on ? 'rgba(216,178,110,0.25)' : 'rgba(127,214,194,0.18)';
      g.beginPath(); g.arc(p.x, p.y, 7 + pulse * 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = on ? accent : primary; g.beginPath(); g.arc(p.x, p.y, on ? 5 : 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = on ? accent : text;
      const label = l.name.split(',')[0];
      const side = l.label || (p.x < cx + R * 0.55 ? 'e' : 'w');
      const west = side.includes('w');
      g.textAlign = west ? 'right' : 'left';
      const dy = side.startsWith('n') ? -8 : side.startsWith('s') ? 18 : 4;
      g.fillText(label, p.x + (west ? -12 : 12), p.y + dy);
    });
  }

  function hit(x, y) {
    let best = null, bd = 22;
    locations.forEach((l) => {
      const p = project(l.lat, l.lon);
      if (p.v <= 0.05) return;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd) { bd = d; best = l; }
    });
    return best;
  }

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId);
    canvas.dataset.downX = e.clientX; canvas.dataset.downY = e.clientY;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) {
      const r = canvas.getBoundingClientRect();
      canvas.style.cursor = hit(e.clientX - r.left, e.clientY - r.top) ? 'pointer' : 'grab';
      return;
    }
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    targetLam = lam0 = lam0 - dx * 0.35;
    targetPhi = phi0 = Math.max(-60, Math.min(70, phi0 + dy * 0.3));
    userMoved = true;
    if (reduced) draw();
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    const moved = Math.hypot(e.clientX - canvas.dataset.downX, e.clientY - canvas.dataset.downY);
    if (moved < 6) {
      const r = canvas.getBoundingClientRect();
      const l = hit(e.clientX - r.left, e.clientY - r.top);
      if (l) focus(l.id);
    }
  });

  resize();
  new ResizeObserver(() => { resize(); draw(); }).observe(canvas);

  if (reduced) { draw(); return; }
  let raf = 0, visible = false;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (!userMoved) targetLam = 96 + Math.sin((now - t0) / 7000) * 22;
    lam0 += (targetLam - lam0) * 0.06;
    phi0 += (targetPhi - phi0) * 0.06;
    draw(now);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !visible) { visible = true; raf = requestAnimationFrame(loop); }
    else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
  }).observe(canvas);
  draw();
}
