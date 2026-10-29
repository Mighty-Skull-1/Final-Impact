// Final Impact - Articulated pixel-art fighter rig
// Draws a fully posed, outlined and shaded humanoid from a compact "design" spec.
// Every pose is computed from joint targets (2-bone IK), so each state looks like a
// real stance instead of stacked boxes.

const OUT = '#120a0c'; // universal outline colour

// ---------- colour helpers ----------
function hexToRgb(h) {
  const s = h.replace('#', '');
  const f = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
const shadeCache = new Map();
/** amt in -1..1 : negative darkens, positive lightens */
function shade(hex, amt) {
  const key = hex + amt;
  if (shadeCache.has(key)) return shadeCache.get(key);
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const k = Math.abs(amt);
  const out = rgbToHex(r + (t - r) * k, g + (t - g) * k, b + (t - b) * k);
  shadeCache.set(key, out);
  return out;
}

// ---------- primitive drawing ----------
function px(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

function brush(ctx, x1, y1, x2, y2, w, c) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
  ctx.fillStyle = c;
  const half = w / 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    ctx.fillRect(Math.round(x1 + (x2 - x1) * t - half), Math.round(y1 + (y2 - y1) * t - half), w, w);
  }
}

/** Scanline fill of a convex polygon (crisp pixels, no antialiasing). */
function poly(ctx, pts, c) {
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  ctx.fillStyle = c;
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const yy = y + 0.5;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) {
        const x = a[0] + ((yy - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
        lo = Math.min(lo, x); hi = Math.max(hi, x);
      }
    }
    if (hi >= lo) ctx.fillRect(Math.round(lo), y, Math.max(1, Math.round(hi) - Math.round(lo)), 1);
  }
}

/** Two-bone IK. bend = +1 (elbow down for arms) / -1 (knee forward for legs). */
function ik(sx, sy, tx, ty, l1, l2, bend) {
  let dx = tx - sx, dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.05;
  if (d > maxd) { const k = maxd / d; dx *= k; dy *= k; d = maxd; tx = sx + dx; ty = sy + dy; }
  if (d < 0.5) d = 0.5;
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const mx = sx + (dx * a) / d, my = sy + (dy * a) / d;
  return { ex: mx + (-dy / d) * h * bend, ey: my + (dx / d) * h * bend, hx: tx, hy: ty };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpArr(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }

// ---------- poses ----------
// Pose vocabulary (sprite space, fighter faces right, 80x90 box, floor line at y≈88):
//   hy        hip drop (+ = lower)            lean   shoulder x offset vs hip (+ = forward)
//   fa / ra   front / rear hand target relative to its shoulder (reach 20)
//   ff / rf   front / rear foot target relative to the hip (reach 28)
//   hdx/hdy   head offset                     expr   face ('normal' | 'pain' | 'rage' | 'block')
//   air       feet are not planted (no floor snap, no baked contact shadow)
const BASE = { hy: 1, lean: 0, fa: [12, 1], ra: [8, 3], ff: [10, 26], rf: [-9, 27], hdx: 0, hdy: 0, expr: 'normal' };
const CROUCH = { hy: 13, lean: 2, fa: [12, 6], ra: [8, 8], ff: [12, 14], rf: [-10, 14], hdx: 1, hdy: 0 };
const AIR = { hy: -10, lean: 0, fa: [10, -6], ra: [6, -4], ff: [10, 20], rf: [-6, 22], hdx: 0, hdy: 0, air: true };

const FLOOR = 27;        // hip-relative foot y that rests a foot on the floor when hy = 0
const LEG_REACH = 27.6;  // keep IK just short of full extension

function mergePose(base, over) { return { ...BASE, ...base, ...over }; }
const P = (o) => mergePose(BASE, o);
const C = (o) => mergePose(CROUCH, o);
const A = (o) => mergePose(AIR, o);

function blendPose(a, b, t) {
  return {
    hy: lerp(a.hy, b.hy, t), lean: lerp(a.lean, b.lean, t), hdx: lerp(a.hdx || 0, b.hdx || 0, t), hdy: lerp(a.hdy || 0, b.hdy || 0, t),
    fa: lerpArr(a.fa, b.fa, t), ra: lerpArr(a.ra, b.ra, t), ff: lerpArr(a.ff, b.ff, t), rf: lerpArr(a.rf, b.rf, t),
    expr: t < 0.5 ? (a.expr || b.expr) : (b.expr || a.expr),
    air: t < 0.5 ? !!a.air : !!b.air
  };
}
const ease = (t) => t * t * (3 - 2 * t);

/** Keep planted feet exactly on the floor (and within leg reach) whatever the hip height. */
function plantFeet(p) {
  if (p.air) return p;
  const gy = FLOOR - p.hy;
  let out = p;
  for (const k of ['ff', 'rf']) {
    const f = p[k];
    if (f[1] >= gy - 3) {
      const y = Math.min(gy, LEG_REACH - 0.4);
      const mx = Math.sqrt(Math.max(0, LEG_REACH * LEG_REACH - y * y));
      if (out === p) out = { ...p };
      out[k] = [Math.max(-mx, Math.min(mx, f[0])), y];
    }
  }
  return out;
}

// --- locomotion ---
function idlePose(ph) {
  // fighting-stance bounce: hips lead, fists and head follow a beat later (overlapping action)
  const a = ph * Math.PI * 2;
  const b = Math.sin(a), lag = Math.sin(a - 0.9);
  return P({
    hy: 1.6 + b * 1.1, lean: 0.4 + b * 0.5,
    fa: [12 + lag * 0.6, 1 + lag * 1.3], ra: [8 - lag * 0.4, 3 + lag * 1.1],
    hdy: Math.max(0, lag) * 0.9, ff: [10, 26], rf: [-10, 26]
  });
}

function walkPose(ph) {
  // shuffle step: front foot reaches (lifted arc) while the rear stays planted, then the rear follows
  const first = ph < 0.5;
  const s = first ? ph * 2 : ph * 2 - 1;
  const lift = Math.sin(s * Math.PI);
  const e = ease(s);
  let fx, fy, rx, ry;
  if (first) { fx = lerp(4, 13, e); fy = 26 - lift * 5; rx = lerp(-4, -13, s); ry = 26; }
  else { fx = lerp(13, 4, s); fy = 26; rx = lerp(-13, -4, e); ry = 26 - lift * 5; }
  const sw = Math.cos(ph * Math.PI * 2);
  return P({
    hy: 2.8 - lift * 1.2, lean: 1 + lift * 0.5, ff: [fx, fy], rf: [rx, ry],
    fa: [11 + sw * 1.5, 2 - lift * 0.7], ra: [8 - sw * 1.5, 3 - lift * 0.7], hdy: lift * 0.5
  });
}

const JUMP_POSES = {
  takeoff: A({ hy: -4, lean: 1, fa: [9, -12], ra: [6, -10], ff: [5, 26], rf: [-3, 27], hdy: -1 }),
  rise: A({ hy: -8, ff: [10, 18], rf: [-6, 22], fa: [10, -7], ra: [6, -5] }),
  apex: A({ hy: -14, lean: 1, ff: [12, 10], rf: [0, 14], fa: [11, -2], ra: [8, 0], hdy: 1 }),
  fall: A({ hy: -10, ff: [9, 19], rf: [-7, 22], fa: [12, -8], ra: [6, -10] }),
  preland: A({ hy: -6, ff: [9, 25], rf: [-9, 26], fa: [13, -5], ra: [8, -8] }),
  tuck: A({ hy: -12, lean: 3, ff: [9, 8], rf: [2, 10], fa: [12, 7], ra: [9, 9], hdx: 1, hdy: 2 })
};
const LAND_POSES = [
  P({ hy: 9, lean: 3, fa: [13, 7], ra: [9, 9], ff: [13, 26], rf: [-12, 26], hdy: 1 }),
  P({ hy: 4, lean: 1, fa: [12, 3], ra: [8, 5], ff: [11, 26], rf: [-11, 26] })
];

// --- guard / damage reactions ---
const GUARD = P({ hy: 3, lean: -1, fa: [8, -6], ra: [10, -4], ff: [11, 24], rf: [-10, 25], hdx: -1, hdy: 1, expr: 'block' });
const GUARD_IMPACT = P({ hy: 4, lean: -3, fa: [6, -7], ra: [8, -5], ff: [11, 24], rf: [-13, 25], hdx: -2, hdy: 1, expr: 'block' });
const CGUARD = C({ hy: 14, lean: -1, fa: [7, -4], ra: [9, -2], hdx: -1, hdy: 1, expr: 'block' });
const CGUARD_IMPACT = C({ hy: 15, lean: -3, fa: [5, -5], ra: [7, -3], hdx: -2, hdy: 1, rf: [-12, 14], expr: 'block' });

const HIT_POSES = [ // high / standing: head snaps back, arms fly, then recovers to guard
  P({ hy: 2, lean: -7, hdx: -4, hdy: -1, fa: [-6, 1], ra: [-10, -1], ff: [9, 26], rf: [-13, 26], expr: 'pain' }),
  P({ hy: 3, lean: -5, hdx: -3, fa: [-3, 6], ra: [-7, 6], ff: [9, 26], rf: [-13, 26], expr: 'pain' }),
  P({ hy: 3, lean: -3, hdx: -1, fa: [4, 6], ra: [2, 6], ff: [10, 26], rf: [-12, 26], expr: 'pain' }),
  P({ hy: 2, lean: -1, fa: [9, 3], ra: [6, 4], ff: [10, 26], rf: [-11, 26] })
];
const HIT_CROUCH_POSES = [ // crouching: folds over the gut, stays low
  C({ hy: 15, lean: -6, hdx: -3, hdy: -1, fa: [-4, 7], ra: [-8, 7], expr: 'pain' }),
  C({ hy: 15, lean: -4, hdx: -2, hdy: 1, fa: [2, 9], ra: [-3, 9], expr: 'pain' }),
  C({ hy: 14, lean: -1, hdy: 1, fa: [7, 8], ra: [4, 8], expr: 'pain' }),
  C({ hy: 13, lean: 1, fa: [11, 6], ra: [7, 8] })
];
const HIT_AIR_POSES = [ // airborne: arched back, legs trailing forward
  A({ hy: -8, lean: -7, hdx: -4, hdy: -1, fa: [-7, -7], ra: [-11, -4], ff: [15, 17], rf: [7, 20], expr: 'pain' }),
  A({ hy: -8, lean: -5, hdx: -3, fa: [-4, -3], ra: [-8, -1], ff: [13, 18], rf: [5, 21], expr: 'pain' }),
  A({ hy: -9, lean: -3, hdx: -1, fa: [3, -2], ra: [-2, 0], ff: [11, 19], rf: [0, 22], expr: 'pain' }),
  A({ hy: -9, lean: -1, fa: [8, -4], ra: [4, -3], ff: [10, 20], rf: [-4, 22], expr: 'pain' })
];
const STUN_POSE = (s) => P({ hy: 4 + Math.abs(s) * 0.6, lean: s * 2.2, hdx: 1 + s * 1.5, hdy: 2, fa: [7, -12], ra: [5, -7], ff: [11, 26], rf: [-10, 26], expr: 'pain' });

const FLUNG = A({ hy: -2, lean: -3, fa: [-9, -12], ra: [-12, -8], ff: [14, 16], rf: [8, 20], hdx: -3, expr: 'pain' });
const LIE = A({ hy: 0, lean: 0, fa: [5, 18], ra: [-1, 18], ff: [6, 27], rf: [-2, 27], hdx: -1, expr: 'pain' });
const GETUP_POSES = [
  P({ hy: 15, lean: 6, fa: [9, 22], ra: [4, 20], ff: [13, 12], rf: [-15, 12], hdx: 1, hdy: 2, expr: 'pain' }),
  P({ hy: 8, lean: 2, fa: [11, 6], ra: [8, 8], ff: [12, 19], rf: [-12, 19], hdx: 1, hdy: 1 })
];

const VICTORY_POSE = (s) => P({ hy: 0.5 + s, lean: -1, fa: [5, -22 - s * 1.5], ra: [9, 6 - s], ff: [10, 26], rf: [-10, 26], hdx: 1, hdy: -1, expr: 'rage' });
const WINDED_POSE = (s) => P({ hy: 6 + s, lean: 6 + s * 0.8, fa: [7, 18 - s], ra: [3, 18 - s], ff: [11, 26], rf: [-11, 26], hdx: 2, hdy: 3 + s * 0.5, expr: 'pain' });

const DASH_POSES = {
  launch: P({ hy: 4, lean: 9, ff: [16, 26], rf: [-17, 21], fa: [-6, 4], ra: [-8, 2], hdx: 2, hdy: 1 }),
  glide: P({ air: true, hy: 3, lean: 8, ff: [14, 19], rf: [-14, 21], fa: [-8, 6], ra: [-10, 4], hdx: 2, hdy: 1 }),
  glide2: P({ air: true, hy: 3, lean: 7, ff: [12, 20], rf: [-15, 20], fa: [-7, 5], ra: [-9, 3], hdx: 2, hdy: 1 }),
  brake: P({ hy: 6, lean: 1, ff: [17, 26], rf: [-12, 26], fa: [10, 2], ra: [6, 4], hdx: 1 }),
  hop: P({ hy: 2, lean: -4, ff: [12, 20], rf: [-8, 26], fa: [10, -2], ra: [8, 0], hdx: -1 }),
  float: A({ hy: -4, lean: -3, ff: [10, 21], rf: [-6, 24], fa: [10, -4], ra: [6, -2], hdx: -1 }),
  land: P({ hy: 6, lean: -1, ff: [12, 26], rf: [-12, 26], fa: [11, 2], ra: [8, 4] })
};

// --- attacks: wind = anticipation, deep = fully coiled, strike = contact, alt = second active pose ---
const ATTACKS = {
  light_punch: { base: BASE, limb: 'fa', lines: true,
    wind: { hy: 2, lean: -1, fa: [6, 4], ra: [9, 1] },
    deep: { hy: 2, lean: -2, fa: [4, 5], ra: [9, 0], hdx: -1 },
    strike: { hy: 2, lean: 3, fa: [22, -1], ra: [6, 5], ff: [12, 26], hdx: 1 } },
  heavy_punch: { base: BASE, limb: 'fa', lines: true, heavy: true,
    wind: { hy: 3, lean: -3, fa: [-2, 7], ra: [13, -1], hdx: -1, ff: [12, 26], rf: [-11, 26] },
    deep: { hy: 4, lean: -6, fa: [-6, 7], ra: [12, -2], hdx: -2, ff: [12, 26], rf: [-12, 26] },
    strike: { hy: 4, lean: 8, fa: [27, -3], ra: [2, 8], ff: [18, 26], rf: [-14, 26], hdx: 2, expr: 'rage' } },
  light_kick: { base: BASE, limb: 'ff', arc: true,
    wind: { hy: 1, lean: -2, ff: [12, 15], fa: [10, -1], ra: [7, 1] },
    deep: { hy: 1, lean: -3, ff: [10, 12], fa: [9, -2], ra: [6, 0] },
    strike: { hy: 0, lean: -4, ff: [26, 6], fa: [8, -4], ra: [1, 2], rf: [-6, 27] } },
  heavy_kick: { base: BASE, limb: 'ff', arc: true, heavy: true,
    wind: { hy: 0, lean: -3, ff: [6, 10], fa: [6, -6], ra: [-2, 4], rf: [-4, 27] },
    deep: { hy: 1, lean: -5, ff: [2, 8], fa: [4, -7], ra: [-5, 4], rf: [-5, 27], hdx: -1 },
    strike: { hy: -1, lean: -9, ff: [27, -9], fa: [6, -8], ra: [-12, 1], rf: [-3, 28], hdx: -2, expr: 'rage' } },
  crouch_lp: { base: CROUCH, limb: 'fa', lines: true,
    wind: { fa: [6, 8], lean: 1 }, deep: { fa: [4, 9], lean: 0 },
    strike: { fa: [22, 5], lean: 4, hdx: 2 } },
  crouch_hp: { base: CROUCH, limb: 'fa', heavy: true,
    wind: { hy: 15, fa: [4, 14], lean: 2 }, deep: { hy: 16, fa: [2, 16], ra: [6, 10], lean: 1, hdy: 1 },
    strike: { hy: 6, fa: [9, -23], ra: [6, 8], lean: 4, hdx: 1, expr: 'rage' } },
  crouch_lk: { base: CROUCH, limb: 'ff',
    wind: { ff: [12, 10], lean: 1 }, deep: { ff: [9, 9], lean: 2 },
    strike: { ff: [25, 13], lean: -3, hy: 14, fa: [10, 4] } },
  crouch_hk: { base: CROUCH, limb: 'ff', heavy: true,
    wind: { ff: [8, 11], lean: 3, rf: [-12, 14] }, deep: { ff: [5, 10], lean: 5, rf: [-13, 14], hy: 14 },
    strike: { ff: [30, 13], lean: -6, rf: [-14, 13], hy: 15, fa: [4, 16], ra: [-6, 12], expr: 'rage' } },
  jump_punch: { base: AIR, limb: 'fa', lines: true,
    wind: { fa: [4, -3], lean: -2 }, deep: { fa: [2, -4], lean: -3 },
    strike: { fa: [21, 10], lean: 4, hdx: 1, ff: [12, 16], rf: [-6, 22] } },
  jump_kick: { base: AIR, limb: 'ff',
    wind: { ff: [6, 12], lean: -2 }, deep: { ff: [4, 10], lean: -3 },
    strike: { ff: [26, 16], rf: [-8, 16], lean: -5, fa: [8, -6], ra: [-4, -2] } },
  special_1: { base: BASE, limb: 'fa', orb: true, heavy: true, release: 2,
    wind: { hy: 4, lean: -4, fa: [-2, 7], ra: [-4, 8], ff: [13, 26], rf: [-12, 26] },
    deep: { hy: 5, lean: -6, fa: [-4, 7], ra: [-6, 8], ff: [13, 26], rf: [-12, 26], hdx: -1 },
    strike: { hy: 4, lean: 6, fa: [24, 0], ra: [21, 3], ff: [17, 26], rf: [-14, 26], hdx: 2, expr: 'rage' } },
  special_2: { base: BASE, limb: 'fa', orb: true, arc: true, heavy: true,
    wind: { hy: 7, lean: 2, fa: [5, 12], ra: [3, 12], ff: [12, 26], rf: [-12, 26] },
    deep: { hy: 9, lean: 3, fa: [3, 14], ra: [1, 13], ff: [12, 26], rf: [-12, 26], hdy: 1 },
    strike: { air: true, hy: -6, lean: 2, fa: [8, -25], ra: [3, -10], ff: [8, 20], rf: [-6, 24], expr: 'rage' },
    alt: { air: true, hy: -12, lean: 1, fa: [5, -27], ra: [2, -12], ff: [6, 15], rf: [-4, 22], expr: 'rage' } },
  special_3: { base: BASE, limb: 'ff', arc: true, orb: true,
    wind: { hy: 2, lean: -2, ff: [8, 14] },
    deep: { hy: 3, lean: -4, ff: [5, 12], fa: [4, -4] },
    strike: { air: true, hy: -3, lean: -6, ff: [28, -2], fa: [8, -6], rf: [-8, 22] },
    alt: { air: true, hy: -3, lean: 4, ff: [-16, 4], rf: [8, 22], fa: [-12, 0], ra: [14, -2], hdx: 1 } },
  dirty: { base: CROUCH, limb: 'fa',
    wind: { fa: [0, 12], lean: 3 }, deep: { fa: [-2, 15], lean: 4, hy: 14 },
    strike: { fa: [20, -6], lean: 3, hy: 9, ra: [4, 6] } }
};

/** Resolved key poses of an attack: base, a1 (start of anticipation), wind, deep, smear, over, strike, alt, follow, rec, settle. */
const attackPoseCache = new Map();
function attackPoses(state) {
  if (attackPoseCache.has(state)) return attackPoseCache.get(state);
  const d = ATTACKS[state];
  const base = mergePose(d.base, {});
  const wind = mergePose(d.base, d.wind);
  const deep = d.deep ? mergePose(d.base, d.deep) : blendPose(base, wind, 1.25);
  const strike = mergePose(d.base, d.strike);
  const alt = d.alt ? mergePose(d.base, d.alt) : null;
  const rec = blendPose(strike, base, 0.5);
  const r = {
    base, wind, deep, strike, alt, rec,
    a1: blendPose(base, wind, 0.45),
    smear: blendPose(deep, strike, 0.85),
    over: blendPose(deep, strike, 1.15),
    altSmear: alt ? blendPose(strike, alt, 0.55) : null,
    follow: blendPose(strike, rec, 0.3),
    settle: blendPose(strike, base, 0.85)
  };
  attackPoseCache.set(state, r);
  return r;
}

const ULT = {
  charge: P({ hy: 3, lean: -2, fa: [4, -18], ra: [-4, -16], ff: [13, 26], rf: [-12, 26], expr: 'rage' }),
  chargeB: P({ hy: 5, lean: -4, fa: [2, -16], ra: [-6, -14], ff: [14, 26], rf: [-13, 26], hdy: 1, expr: 'rage' }),
  fin: P({ hy: 2, lean: 7, fa: [27, -2], ra: [24, 2], ff: [16, 26], rf: [-12, 26], expr: 'rage' }),
  lunge: P({ hy: 3, lean: 9, fa: [26, -2], ra: [-6, 8], ff: [18, 26], rf: [-16, 26], hdx: 2, expr: 'rage' }),
  jab: P({ hy: 3, lean: 6, fa: [25, -4], ra: [6, 6], ff: [15, 26], rf: [-13, 26], hdx: 2, expr: 'rage' }),
  kick: P({ hy: 0, lean: -6, ff: [24, -2], fa: [8, -6], ra: [-8, 2], rf: [-4, 27], hdx: -1, expr: 'rage' }),
  finisher: P({ hy: -1, lean: 4, fa: [10, -26], ra: [6, 8], ff: [12, 26], rf: [-12, 26], hdx: 1, expr: 'rage' })
};

/** Key (gameplay-indexed) pose of a state. Index semantics are unchanged from the original rig. */
function keyPose(state, i, n) {
  switch (state) {
    case 'idle': return idlePose(i / n);
    case 'walk': return walkPose(i / n);
    case 'jump': return [JUMP_POSES.rise, JUMP_POSES.apex, JUMP_POSES.fall][Math.min(i, 2)];
    case 'crouch': return i === 0 ? mergePose(CROUCH, {}) : C({ hy: 14, fa: [12, 7], ra: [8, 9] });
    case 'hit': return HIT_POSES[Math.min(i, 1)];
    case 'hit_crouch': return HIT_CROUCH_POSES[Math.min(i, 1)];
    case 'hit_air': return HIT_AIR_POSES[Math.min(i, 1)];
    case 'stun': return STUN_POSE(i === 0 ? -1 : 1);
    case 'block': return i === 0 ? GUARD : GUARD_IMPACT;
    case 'crouch_block': return i === 0 ? CGUARD : CGUARD_IMPACT;
    case 'victory': return VICTORY_POSE([0, 0.6, 1, 0.4][i % 4]);
    case 'winded': return WINDED_POSE([0, 0.5, 1, 0.5][i % 4]);
    case 'dash': return [DASH_POSES.launch, DASH_POSES.glide, DASH_POSES.brake][Math.min(i, 2)];
    case 'dash_back': return [DASH_POSES.hop, DASH_POSES.float, DASH_POSES.land][Math.min(i, 2)];
    case 'ultimate': {
      const base = mergePose(BASE, {});
      if (i < 4) return blendPose(base, ULT.charge, (i + 1) / 4);
      const e = Math.min(1, (i - 3) / 2) * (i === 7 ? 0.6 : 1);
      return blendPose(ULT.charge, ULT.fin, e);
    }
    default: {
      if (!ATTACKS[state]) return mergePose(BASE, {});
      const a = attackPoses(state);
      const seq = n <= 2 ? [a.wind, a.strike]
        : n === 3 ? [a.wind, a.strike, a.rec]
        : n === 4 ? [a.wind, a.deep, a.strike, a.rec]
        : [a.wind, a.deep, a.strike, a.alt || a.over, a.rec];
      return seq[Math.min(i, seq.length - 1)];
    }
  }
}

// ---------- body part builders ----------
function buildMetrics(spec) {
  const b = spec.build || 'normal';
  if (b === 'heavy') return { limb: 7, thigh: 8, sw: 9, hw: 7, torso: 19, headW: 13 };
  if (b === 'lean') return { limb: 5, thigh: 6, sw: 6.5, hw: 5, torso: 19, headW: 11 };
  return { limb: 6, thigh: 7, sw: 7.5, hw: 6, torso: 19, headW: 12 };
}

function drawLimb(ctx, a, b, c, w, col, shadeAmt = 0.28) {
  brush(ctx, a[0], a[1], b[0], b[1], w + 2, OUT);
  brush(ctx, b[0], b[1], c[0], c[1], w + 2, OUT);
  brush(ctx, a[0], a[1], b[0], b[1], w, col);
  brush(ctx, b[0], b[1], c[0], c[1], w, col);
  // highlight along the top-front edge
  const hl = shade(col, 0.22);
  brush(ctx, a[0] + 1, a[1] - 1, b[0] + 1, b[1] - 1, Math.max(1, Math.floor(w / 3)), hl);
  brush(ctx, b[0] + 1, b[1] - 1, c[0] + 1, c[1] - 1, Math.max(1, Math.floor(w / 3)), hl);
  // shadow on rear edge
  const sh = shade(col, -shadeAmt);
  brush(ctx, a[0] - Math.floor(w / 3), a[1] + 1, b[0] - Math.floor(w / 3), b[1] + 1, 1, sh);
  brush(ctx, b[0] - Math.floor(w / 3), b[1] + 1, c[0] - Math.floor(w / 3), c[1] + 1, 1, sh);
}

function drawArm(ctx, spec, M, sh, target, isFront) {
  const k = ik(sh[0], sh[1], sh[0] + target[0], sh[1] + target[1], 10, 10, 1);
  const skin = spec.skin;
  const armCol = spec.arms ? spec.arms.color : null;
  const style = (spec.arms && spec.arms.style) || 'bare';
  const w = M.limb - 1;
  const dim = isFront ? 0 : -0.22;
  const upperCol = (style === 'sleeve' || style === 'long' || style === 'gauntlet' && false) ? armCol : skin;
  const lowerCol = (style === 'long') ? armCol : (style === 'gauntlet' ? armCol : skin);
  const A = [sh[0], sh[1]], B = [k.ex, k.ey], C = [k.hx, k.hy];

  // outline whole arm first so the colour change between segments stays crisp
  brush(ctx, A[0], A[1], B[0], B[1], w + 2, OUT);
  brush(ctx, B[0], B[1], C[0], C[1], w + 2, OUT);
  brush(ctx, A[0], A[1], B[0], B[1], w, shade(upperCol, dim));
  brush(ctx, B[0], B[1], C[0], C[1], w, shade(lowerCol, dim));
  brush(ctx, A[0] + 1, A[1] - 1, B[0] + 1, B[1] - 1, 1, shade(upperCol, 0.2 + dim));
  brush(ctx, B[0] + 1, B[1] - 1, C[0] + 1, C[1] - 1, 1, shade(lowerCol, 0.2 + dim));

  // gauntlet bracer detail / wraps
  if (style === 'gauntlet') {
    const mx = lerp(B[0], C[0], 0.5), my = lerp(B[1], C[1], 0.5);
    brush(ctx, mx, my, C[0], C[1], w + 1, shade(armCol, 0.1 + dim));
    px(ctx, C[0] - 1, C[1] - 1, 2, 1, shade(armCol, 0.5));
  }
  const gl = spec.gloves || { style: 'none' };
  if (gl.style === 'wraps') {
    const mx = lerp(B[0], C[0], 0.45), my = lerp(B[1], C[1], 0.45);
    brush(ctx, mx, my, C[0], C[1], w, shade(gl.color, dim));
    px(ctx, mx - 1, my, w, 1, shade(gl.color, -0.3));
  }
  // hand / glove
  const handCol = gl.style === 'glove' || gl.style === 'claws' ? gl.color : skin;
  const hs = gl.style === 'glove' ? w + 1 : w - 1;
  px(ctx, C[0] - hs / 2 - 1, C[1] - hs / 2 - 1, hs + 2, hs + 2, OUT);
  px(ctx, C[0] - hs / 2, C[1] - hs / 2, hs, hs, shade(handCol, dim));
  px(ctx, C[0] - hs / 2 + 1, C[1] - hs / 2, 1, 1, shade(handCol, 0.4));
  if (gl.style === 'claws') {
    for (let c = 0; c < 3; c++) {
      brush(ctx, C[0] + 1, C[1] - 1 + c, C[0] + 5, C[1] - 1 + c, 1, '#e5e7eb');
    }
  }
  // pauldron / shoulder cap
  if (spec.pauldrons && isFront) {
    px(ctx, A[0] - 4, A[1] - 3, 9, 6, OUT);
    px(ctx, A[0] - 3, A[1] - 2, 7, 4, spec.pauldrons);
    px(ctx, A[0] - 2, A[1] - 2, 4, 1, shade(spec.pauldrons, 0.4));
    px(ctx, A[0] - 3, A[1] + 1, 7, 1, shade(spec.pauldrons, -0.35));
  } else if (spec.pauldrons) {
    px(ctx, A[0] - 3, A[1] - 3, 7, 5, OUT);
    px(ctx, A[0] - 2, A[1] - 2, 5, 3, shade(spec.pauldrons, -0.25));
  }
  return C;
}

function drawLeg(ctx, spec, M, hip, target, isFront) {
  const k = ik(hip[0], hip[1], hip[0] + target[0], hip[1] + target[1], 14, 14, -1);
  const dim = isFront ? 0 : -0.22;
  const bt = spec.bottom || { style: 'pants', color: '#444' };
  const boots = spec.boots || { style: 'bare' };
  const skin = spec.skin;
  const bare = bt.style === 'loin' || bt.style === 'shorts' || bt.style === 'skirt';
  const thighCol = (bt.style === 'loin' || bt.style === 'skirt') ? skin : bt.color;
  const shinCol = (bt.style === 'pants' || bt.style === 'hakama') ? bt.color : skin;
  const w = M.thigh;
  const A = [hip[0], hip[1]], B = [k.ex, k.ey], C = [k.hx, k.hy];

  brush(ctx, A[0], A[1], B[0], B[1], w + 2, OUT);
  brush(ctx, B[0], B[1], C[0], C[1], w - 1, OUT);
  brush(ctx, A[0], A[1], B[0], B[1], w, shade(thighCol, dim));
  brush(ctx, B[0], B[1], C[0], C[1], w - 2, shade(shinCol, dim));
  brush(ctx, A[0] + 1, A[1] - 1, B[0] + 1, B[1] - 1, 2, shade(thighCol, 0.2 + dim));
  brush(ctx, B[0] + 1, B[1] - 1, C[0] + 1, C[1] - 1, 1, shade(shinCol, 0.2 + dim));

  // trim stripe on trousers / shorts hem
  if (bt.trim) {
    const hx = lerp(A[0], B[0], 0.82), hy = lerp(A[1], B[1], 0.82);
    brush(ctx, hx, hy, B[0], B[1], w, shade(bt.trim, dim));
  }

  // boots / wraps / greaves
  const bs = boots.style || 'bare';
  if (bs !== 'bare') {
    const sx = lerp(B[0], C[0], 0.45), sy = lerp(B[1], C[1], 0.45);
    const bw = bs === 'greave' ? w - 1 : w - 1;
    brush(ctx, sx, sy, C[0], C[1], bw + 2, OUT);
    brush(ctx, sx, sy, C[0], C[1], bw, shade(boots.color, dim));
    brush(ctx, sx + 1, sy - 1, C[0] + 1, C[1] - 1, 1, shade(boots.color, 0.3 + dim));
    if (boots.trim) px(ctx, sx - bw / 2, sy, bw, 1, shade(boots.trim, dim));
  }
  // foot (always points forward)
  const footCol = bs === 'bare' ? skin : boots.color;
  px(ctx, C[0] - 3, C[1] - 2, 10, 5, OUT);
  px(ctx, C[0] - 2, C[1] - 1, 8, 3, shade(footCol, dim));
  px(ctx, C[0] - 2, C[1] - 1, 8, 1, shade(footCol, 0.25 + dim));
  px(ctx, C[0] - 2, C[1] + 1, 8, 1, shade(footCol, -0.35 + dim));
  // knee pad for armoured designs
  if (spec.kneePads && isFront) {
    px(ctx, B[0] - 2, B[1] - 2, 5, 5, OUT);
    px(ctx, B[0] - 1, B[1] - 1, 3, 3, spec.kneePads);
  }
  return { foot: C, knee: B };
}

function drawTorso(ctx, spec, M, hip, sc, state, t) {
  const top = spec.top || { style: 'bare' };
  const sw = M.sw, hw = M.hw;
  const skin = spec.skin;
  const main = top.style === 'bare' ? skin : (top.color || '#555');
  const L = [sc[0] - sw, sc[1]], R = [sc[0] + sw, sc[1]];
  const HL = [hip[0] - hw, hip[1] + 1], HR = [hip[0] + hw, hip[1] + 1];
  const neck = [sc[0], sc[1] - 2];

  // outline + base fill
  const outline = [[L[0] - 1, L[1] - 1], [R[0] + 1, R[1] - 1], [HR[0] + 1, HR[1] + 1], [HL[0] - 1, HL[1] + 1]];
  poly(ctx, outline, OUT);
  poly(ctx, [L, R, HR, HL], main);
  // shading: rear third darker, front sliver lighter
  const midL = [lerp(L[0], R[0], 0.38), L[1]], midLb = [lerp(HL[0], HR[0], 0.38), HL[1]];
  poly(ctx, [L, midL, midLb, HL], shade(main, -0.28));
  const midR = [lerp(L[0], R[0], 0.85), L[1]], midRb = [lerp(HL[0], HR[0], 0.85), HL[1]];
  poly(ctx, [midR, R, HR, midRb], shade(main, 0.14));

  const cx = (sc[0] + hip[0]) / 2;
  switch (top.style) {
    case 'bare': {
      // pecs + abs
      px(ctx, sc[0] - 4, sc[1] + 3, 4, 1, shade(skin, -0.35));
      px(ctx, sc[0] + 1, sc[1] + 3, 5, 1, shade(skin, -0.35));
      px(ctx, cx, sc[1] + 4, 1, hip[1] - sc[1] - 4, shade(skin, -0.3));
      for (let r = 0; r < 3; r++) px(ctx, cx - 3, sc[1] + 8 + r * 3, 7, 1, shade(skin, -0.25));
      break;
    }
    case 'vest': case 'jacket': case 'robe': {
      // open front showing under-layer + lapel trim
      const under = top.under || skin;
      poly(ctx, [[sc[0] + 1, sc[1]], [sc[0] + 5, sc[1]], [hip[0] + 4, hip[1]], [hip[0], hip[1]]], under);
      brush(ctx, sc[0] + 1, sc[1], hip[0], hip[1] - 1, 1, shade(top.trim || main, 0.1));
      brush(ctx, sc[0] + 5, sc[1], hip[0] + 4, hip[1] - 1, 1, shade(top.trim || main, 0.1));
      if (top.style === 'jacket') {
        px(ctx, sc[0] - sw, sc[1], 2, 3, shade(main, 0.3)); // collar bits
      }
      if (top.stars) {
        for (let s = 0; s < 6; s++) {
          const sx = L[0] + 2 + (s * 5) % (sw * 2 - 3), sy = sc[1] + 3 + ((s * 7) % 14);
          px(ctx, sx, sy, 1, 1, '#fde68a');
        }
      }
      break;
    }
    case 'tank': {
      px(ctx, sc[0] - 3, sc[1], 6, 1, skin);
      px(ctx, sc[0] - 2, sc[1] + 1, 4, 1, skin);
      break;
    }
    case 'wraps': {
      // bandeau / bandage wraps
      for (let r = 0; r < 4; r++) px(ctx, L[0] + (r % 2), sc[1] + 2 + r * 3, sw * 2 - 1, 1, shade(main, -0.3));
      break;
    }
    case 'armor': {
      // breastplate with lacing / plates
      const trim = top.trim || shade(main, 0.35);
      px(ctx, sc[0] - sw + 1, sc[1] + 1, sw * 2 - 2, 1, shade(main, 0.45));
      brush(ctx, sc[0] + 1, sc[1] + 2, hip[0] + 1, hip[1] - 3, 1, shade(main, -0.4));
      for (let r = 0; r < 4; r++) {
        px(ctx, L[0] + 1, sc[1] + 5 + r * 3, sw * 2 - 2, 1, shade(main, -0.38));
        px(ctx, sc[0] + 3, sc[1] + 6 + r * 3, 1, 1, trim);
      }
      px(ctx, sc[0] - 1, sc[1] + 2, 3, 3, trim); // chest crest
      break;
    }
  }

  // belt / sash
  const belt = spec.belt;
  if (belt) {
    const by = hip[1] - 2;
    px(ctx, hip[0] - hw - 1, by - 1, hw * 2 + 3, 5, OUT);
    px(ctx, hip[0] - hw, by, hw * 2 + 1, 3, belt.color);
    px(ctx, hip[0] - hw, by, hw * 2 + 1, 1, shade(belt.color, 0.35));
    if (belt.buckle) px(ctx, hip[0] + 1, by, 3, 3, belt.buckle);
    if (belt.tails) {
      const sway = Math.sin(t * 1.3) * 1.5;
      brush(ctx, hip[0] - hw + 1, by + 2, hip[0] - hw - 3 + sway, by + 10, 2, belt.color);
      brush(ctx, hip[0] - hw + 2, by + 2, hip[0] - hw - 1 + sway, by + 12, 2, shade(belt.color, -0.25));
    }
  }
  // fur / high collar
  if (spec.fur) {
    px(ctx, sc[0] - sw - 1, sc[1] - 3, sw * 2 + 3, 4, OUT);
    px(ctx, sc[0] - sw, sc[1] - 2, sw * 2 + 1, 3, spec.fur);
    for (let f = 0; f < sw * 2; f += 2) px(ctx, sc[0] - sw + f, sc[1] + 1, 1, 1, shade(spec.fur, -0.3));
    px(ctx, sc[0] - sw + 1, sc[1] - 2, sw * 2 - 1, 1, shade(spec.fur, 0.35));
  }
  // bandolier
  if (spec.bandolier) {
    brush(ctx, L[0] + 1, sc[1] + 1, HR[0] - 1, hip[1] - 2, 2, OUT);
    brush(ctx, L[0] + 1, sc[1] + 1, HR[0] - 1, hip[1] - 2, 1, spec.bandolier);
    for (let b = 0; b < 4; b++) {
      const bx = lerp(L[0] + 2, HR[0] - 2, (b + 0.5) / 4), by = lerp(sc[1] + 2, hip[1] - 3, (b + 0.5) / 4);
      px(ctx, bx, by, 2, 2, '#fbbf24');
    }
  }
  return { neck };
}

function drawBottomOver(ctx, spec, M, hip, t) {
  const bt = spec.bottom || {};
  const hw = M.hw;
  const sway = Math.sin(t * 1.1) * 1.2;
  if (bt.style === 'hakama') {
    // long flowing skirt-trousers hanging to the shins
    const col = bt.color;
    const pts = [[hip[0] - hw - 1, hip[1]], [hip[0] + hw + 2, hip[1]], [hip[0] + hw + 6 + sway, hip[1] + 25], [hip[0] - hw - 6 + sway, hip[1] + 25]];
    poly(ctx, [[pts[0][0] - 1, pts[0][1] - 1], [pts[1][0] + 1, pts[1][1] - 1], [pts[2][0] + 1, pts[2][1] + 1], [pts[3][0] - 1, pts[3][1] + 1]], OUT);
    poly(ctx, pts, col);
    poly(ctx, [pts[0], [hip[0] - 1, hip[1]], [hip[0] - 2 + sway, hip[1] + 25], pts[3]], shade(col, -0.25));
    if (bt.trim) px(ctx, pts[3][0], hip[1] + 22, pts[2][0] - pts[3][0], 2, bt.trim);
    brush(ctx, hip[0] + 2, hip[1] + 2, hip[0] + 3 + sway, hip[1] + 24, 1, shade(col, 0.2));
  } else if (bt.style === 'skirt') {
    // armoured tassets / cloth skirt
    const col = bt.color;
    const pts = [[hip[0] - hw - 1, hip[1]], [hip[0] + hw + 2, hip[1]], [hip[0] + hw + 5 + sway, hip[1] + 12], [hip[0] - hw - 5 + sway, hip[1] + 12]];
    poly(ctx, [[pts[0][0] - 1, pts[0][1] - 1], [pts[1][0] + 1, pts[1][1] - 1], [pts[2][0] + 1, pts[2][1] + 1], [pts[3][0] - 1, pts[3][1] + 1]], OUT);
    poly(ctx, pts, col);
    poly(ctx, [pts[0], [hip[0] - 1, hip[1]], [hip[0] - 2 + sway, hip[1] + 12], pts[3]], shade(col, -0.25));
    for (let s = 0; s < 4; s++) px(ctx, pts[3][0] + s * 4, hip[1] + 4, 1, 8, shade(col, -0.35));
    if (bt.trim) px(ctx, pts[3][0], hip[1] + 11, pts[2][0] - pts[3][0], 1, bt.trim);
  } else if (bt.style === 'loin') {
    const col = bt.color;
    poly(ctx, [[hip[0] + 1, hip[1]], [hip[0] + hw + 1, hip[1]], [hip[0] + hw + 2 + sway, hip[1] + 14], [hip[0] + 2 + sway, hip[1] + 14]], OUT);
    poly(ctx, [[hip[0] + 2, hip[1] + 1], [hip[0] + hw, hip[1] + 1], [hip[0] + hw + 1 + sway, hip[1] + 13], [hip[0] + 3 + sway, hip[1] + 13]], col);
  } else {
    // pants/shorts: hip block joining both legs
    px(ctx, hip[0] - hw - 1, hip[1] - 1, hw * 2 + 3, 7, OUT);
    px(ctx, hip[0] - hw, hip[1], hw * 2 + 1, 5, bt.color || '#444');
    px(ctx, hip[0] - hw, hip[1], hw * 2 + 1, 1, shade(bt.color || '#444', 0.25));
  }
}

// ---------- head ----------
function drawHead(ctx, spec, M, hc, pose, t, state) {
  const [hx, hy] = hc;
  const skin = spec.skin;
  const hairC = spec.hair ? spec.hair.color : '#222';
  const hs = (spec.hair && spec.hair.style) || 'none';
  const hd = spec.head || { type: 'none' };
  const mask = spec.mask;
  const w = M.headW;
  const sway = Math.sin(t * 1.4) * 2;
  const hurt = pose.expr === 'pain';
  const rage = pose.expr === 'rage';

  // ---- behind-the-head elements ----
  if (hs === 'long' || hs === 'braids') {
    brush(ctx, hx - 4, hy - 3, hx - 7 + sway, hy + 12, 5, OUT);
    brush(ctx, hx - 4, hy - 3, hx - 7 + sway, hy + 12, 3, hairC);
    brush(ctx, hx - 4, hy - 3, hx - 6 + sway, hy + 12, 1, shade(hairC, 0.3));
    if (hs === 'braids') for (let b = 0; b < 5; b++) px(ctx, hx - 8 + sway * 0.8, hy + 2 + b * 2, 3, 1, shade(hairC, -0.4));
  }
  if (hs === 'ponytail') {
    brush(ctx, hx - 5, hy - 4, hx - 12 + sway, hy + 6, 4, OUT);
    brush(ctx, hx - 5, hy - 4, hx - 12 + sway, hy + 6, 2, hairC);
  }
  if (hd.type === 'band' && hd.tails) {
    brush(ctx, hx - 5, hy - 3, hx - 12 + sway, hy + 3, 3, OUT);
    brush(ctx, hx - 5, hy - 3, hx - 12 + sway, hy + 3, 1, hd.color);
    brush(ctx, hx - 5, hy - 2, hx - 11 - sway, hy + 8, 3, OUT);
    brush(ctx, hx - 5, hy - 2, hx - 11 - sway, hy + 8, 1, shade(hd.color, -0.2));
  }
  if (hd.type === 'hood') {
    // cloth hood draped behind & over the head
    poly(ctx, [[hx - 8, hy - 8], [hx + 6, hy - 9], [hx + 8, hy + 1], [hx + 5, hy + 8], [hx - 9, hy + 10]], OUT);
    poly(ctx, [[hx - 7, hy - 7], [hx + 5, hy - 8], [hx + 7, hy + 1], [hx + 4, hy + 7], [hx - 8, hy + 9]], hd.color);
    poly(ctx, [[hx - 7, hy - 7], [hx - 1, hy - 8], [hx - 3, hy + 8], [hx - 8, hy + 9]], shade(hd.color, -0.3));
  }

  // ---- face ----
  px(ctx, hx - w / 2 - 1, hy - 7, w + 2, 14, OUT);
  const faceRows = [[3, 6], [2, 8], [1, 10], [0, 11], [0, 11], [0, 11], [0, 11], [1, 10], [1, 9], [2, 8], [3, 6]];
  // draw skin with soft rounded silhouette
  for (let r = 0; r < faceRows.length; r++) {
    const [o, wd] = faceRows[r];
    const rw = Math.round((wd / 11) * w);
    px(ctx, hx - w / 2 + Math.round((o / 11) * w), hy - 6 + r, rw, 1, skin);
  }
  px(ctx, hx - w / 2 + 1, hy - 5, 3, 9, shade(skin, -0.25)); // rear shading
  px(ctx, hx + w / 2 - 3, hy - 2, 2, 5, shade(skin, 0.18)); // cheek highlight
  px(ctx, hx + 2, hy + 1, 2, 2, shade(skin, -0.12)); // nose

  // eyes
  const eyeC = spec.eyes || '#111';
  const ey = hy - 1;
  if (mask && mask.type === 'blindfold') {
    px(ctx, hx - w / 2, ey - 1, w, 3, OUT);
    px(ctx, hx - w / 2, ey, w, 2, mask.color);
    px(ctx, hx - w / 2, ey, w, 1, shade(mask.color, 0.3));
    brush(ctx, hx - w / 2, ey, hx - w / 2 - 6 + sway, ey + 5, 2, mask.color);
  } else if (hurt) {
    px(ctx, hx + 1, ey, 3, 1, '#111'); px(ctx, hx + 5, ey, 3, 1, '#111');
  } else {
    px(ctx, hx + 1, ey - 1, 3, 3, '#f8fafc');
    px(ctx, hx + 5, ey - 1, 3, 3, '#f8fafc');
    px(ctx, hx + 3, ey - 1, 1, 3, eyeC); px(ctx, hx + 7, ey - 1, 1, 3, eyeC);
    // brows
    px(ctx, hx + 1, ey - 3, 4, 1, shade(hairC, -0.1));
    px(ctx, hx + 5, ey - 3 + (rage ? 1 : 0), 4, 1, shade(hairC, -0.1));
  }
  // mouth
  if (!mask || mask.type === 'blindfold') {
    if (hurt) px(ctx, hx + 3, hy + 4, 3, 2, '#450a0a');
    else if (rage) px(ctx, hx + 3, hy + 4, 4, 2, '#7f1d1d');
    else px(ctx, hx + 3, hy + 4, 3, 1, shade(skin, -0.5));
  }

  // masks
  if (mask && mask.type === 'lower') {
    poly(ctx, [[hx - w / 2, hy + 1], [hx + w / 2, hy + 1], [hx + w / 2 - 2, hy + 6], [hx - w / 2 + 2, hy + 6]], OUT);
    poly(ctx, [[hx - w / 2 + 1, hy + 1], [hx + w / 2 - 1, hy + 1], [hx + w / 2 - 3, hy + 5], [hx - w / 2 + 3, hy + 5]], mask.color);
    px(ctx, hx - w / 2 + 1, hy + 3, w - 3, 1, shade(mask.color, -0.3));
    px(ctx, hx + w / 2 - 4, hy + 1, 3, 1, shade(mask.color, 0.35));
  } else if (mask && mask.type === 'full') {
    px(ctx, hx - w / 2, hy - 6, w, 12, mask.color);
    px(ctx, hx - w / 2, hy - 6, 3, 12, shade(mask.color, -0.3));
    px(ctx, hx + w / 2 - 3, hy - 4, 2, 6, shade(mask.color, 0.18));
    // glowing eye slit
    const gc = spec.glow || '#fff';
    px(ctx, hx - 1, hy - 2, w / 2 + 3, 3, '#000');
    ctx.globalAlpha = 0.55; px(ctx, hx - 2, hy - 3, w / 2 + 5, 5, gc); ctx.globalAlpha = 1;
    px(ctx, hx, hy - 1, w / 2 + 1, 1, hurt ? '#e5e7eb' : '#ffffff');
    px(ctx, hx - w / 2 + 2, hy + 3, w - 4, 1, shade(mask.color, -0.35));
  } else if (mask && mask.type === 'burlap') {
    px(ctx, hx - w / 2, hy - 7, w, 14, mask.color);
    px(ctx, hx - w / 2, hy - 7, 3, 14, shade(mask.color, -0.28));
    for (let r = 0; r < 14; r += 3) px(ctx, hx - w / 2, hy - 7 + r, w, 1, shade(mask.color, -0.18));
    px(ctx, hx + 1, hy - 2, 3, 3, '#0a0a0a'); px(ctx, hx + 6, hy - 2, 3, 3, '#0a0a0a');
    px(ctx, hx + 2, hy + 4, 6, 1, '#0a0a0a');
    for (let s = 0; s < 3; s++) px(ctx, hx + 2 + s * 2, hy + 3, 1, 3, '#0a0a0a');
    px(ctx, hx - w / 2 - 1, hy + 6, w + 2, 2, shade(mask.color, -0.3)); // knotted neck tie
  }

  // hair (front)
  if (hs === 'spiky') {
    poly(ctx, [[hx - 7, hy - 3], [hx - 6, hy - 11], [hx - 3, hy - 7], [hx - 1, hy - 14], [hx + 2, hy - 8], [hx + 5, hy - 12], [hx + 7, hy - 5], [hx + 6, hy - 3]], OUT);
    poly(ctx, [[hx - 6, hy - 4], [hx - 5, hy - 10], [hx - 3, hy - 6], [hx - 1, hy - 12], [hx + 2, hy - 7], [hx + 5, hy - 10], [hx + 6, hy - 5], [hx + 5, hy - 4]], hairC);
    px(ctx, hx - 1, hy - 11, 1, 3, shade(hairC, 0.35));
  } else if (hs === 'short' || hs === 'long' || hs === 'braids' || hs === 'ponytail') {
    poly(ctx, [[hx - 7, hy - 2], [hx - 6, hy - 8], [hx, hy - 9], [hx + 6, hy - 7], [hx + 7, hy - 3], [hx + 3, hy - 4], [hx, hy - 5], [hx - 4, hy - 3]], OUT);
    poly(ctx, [[hx - 6, hy - 3], [hx - 5, hy - 7], [hx, hy - 8], [hx + 5, hy - 6], [hx + 6, hy - 4], [hx + 3, hy - 5], [hx, hy - 6], [hx - 4, hy - 4]], hairC);
    px(ctx, hx - 2, hy - 7, 4, 1, shade(hairC, 0.35));
  } else if (hs === 'mohawk') {
    poly(ctx, [[hx - 3, hy - 6], [hx - 2, hy - 13], [hx + 3, hy - 14], [hx + 4, hy - 6]], OUT);
    poly(ctx, [[hx - 2, hy - 7], [hx - 1, hy - 12], [hx + 2, hy - 13], [hx + 3, hy - 7]], hairC);
  } else if (hs === 'topknot') {
    px(ctx, hx - 2, hy - 13, 5, 5, OUT);
    px(ctx, hx - 1, hy - 12, 3, 3, hairC);
    px(ctx, hx - 6, hy - 7, 12, 3, OUT);
    px(ctx, hx - 5, hy - 6, 10, 2, hairC);
  } else if (hs === 'bun') {
    px(ctx, hx - 3, hy - 13, 6, 6, OUT); px(ctx, hx - 2, hy - 12, 4, 4, hairC);
    px(ctx, hx - 6, hy - 7, 12, 3, OUT); px(ctx, hx - 5, hy - 6, 10, 2, hairC);
  }

  // headgear
  if (hd.type === 'band') {
    px(ctx, hx - w / 2 - 1, hy - 5, w + 2, 4, OUT);
    px(ctx, hx - w / 2, hy - 4, w, 2, hd.color);
    px(ctx, hx - w / 2, hy - 4, w, 1, shade(hd.color, 0.35));
    if (hd.trim) px(ctx, hx + 3, hy - 4, 2, 2, hd.trim);
  } else if (hd.type === 'hat') {
    poly(ctx, [[hx - 15, hy - 4], [hx, hy - 15], [hx + 15, hy - 4]], OUT);
    poly(ctx, [[hx - 14, hy - 5], [hx, hy - 14], [hx + 14, hy - 5]], hd.color);
    poly(ctx, [[hx - 14, hy - 5], [hx - 2, hy - 13], [hx - 2, hy - 5]], shade(hd.color, -0.25));
    px(ctx, hx - 15, hy - 5, 30, 2, shade(hd.color, -0.4));
    for (let r = 0; r < 4; r++) px(ctx, hx - 10 + r * 6, hy - 9 + (r % 2), 3, 1, shade(hd.color, 0.3));
  } else if (hd.type === 'kabuto') {
    poly(ctx, [[hx - 8, hy - 2], [hx - 7, hy - 10], [hx, hy - 12], [hx + 7, hy - 10], [hx + 8, hy - 2]], OUT);
    poly(ctx, [[hx - 7, hy - 3], [hx - 6, hy - 9], [hx, hy - 11], [hx + 6, hy - 9], [hx + 7, hy - 3]], hd.color);
    poly(ctx, [[hx - 7, hy - 3], [hx - 6, hy - 9], [hx - 2, hy - 10], [hx - 3, hy - 3]], shade(hd.color, -0.3));
    px(ctx, hx - 8, hy - 4, 16, 2, shade(hd.color, -0.35));
    // crescent crest
    brush(ctx, hx - 5, hy - 12, hx - 1, hy - 17, 1, hd.trim || '#fbbf24');
    brush(ctx, hx + 5, hy - 12, hx + 1, hy - 17, 1, hd.trim || '#fbbf24');
    // neck guard
    poly(ctx, [[hx - 9, hy], [hx - 5, hy - 2], [hx - 4, hy + 7], [hx - 10, hy + 9]], shade(hd.color, -0.15));
    px(ctx, hx - 10, hy + 2, 5, 1, hd.trim || '#fbbf24');
  } else if (hd.type === 'helm') {
    poly(ctx, [[hx - 8, hy + 4], [hx - 8, hy - 6], [hx - 3, hy - 10], [hx + 4, hy - 9], [hx + 8, hy - 4], [hx + 8, hy + 4]], OUT);
    poly(ctx, [[hx - 7, hy + 3], [hx - 7, hy - 5], [hx - 3, hy - 9], [hx + 3, hy - 8], [hx + 7, hy - 4], [hx + 7, hy + 3]], hd.color);
    px(ctx, hx - 7, hy - 5, 4, 8, shade(hd.color, -0.3));
    px(ctx, hx + 1, hy - 2, 7, 3, '#000'); // visor slit
    const gc = spec.glow || '#fff';
    ctx.globalAlpha = 0.6; px(ctx, hx + 3, hy - 1, 5, 1, gc); ctx.globalAlpha = 1;
    px(ctx, hx - 1, hy - 9, 3, 2, shade(hd.color, 0.4));
  } else if (hd.type === 'turban') {
    poly(ctx, [[hx - 8, hy - 1], [hx - 7, hy - 9], [hx, hy - 11], [hx + 7, hy - 9], [hx + 8, hy - 1]], OUT);
    poly(ctx, [[hx - 7, hy - 2], [hx - 6, hy - 8], [hx, hy - 10], [hx + 6, hy - 8], [hx + 7, hy - 2]], hd.color);
    for (let r = 0; r < 4; r++) px(ctx, hx - 7 + r, hy - 8 + r * 2, 14 - r * 2, 1, shade(hd.color, -0.25));
    brush(ctx, hx - 6, hy - 3, hx - 12 + sway, hy + 7, 3, OUT);
    brush(ctx, hx - 6, hy - 3, hx - 12 + sway, hy + 7, 1, hd.color);
    // face wrap covering lower face
    if (hd.veil) {
      px(ctx, hx - w / 2, hy + 1, w, 5, OUT);
      px(ctx, hx - w / 2 + 1, hy + 2, w - 2, 3, hd.veil);
    }
  } else if (hd.type === 'horns') {
    poly(ctx, [[hx - 6, hy - 5], [hx - 9, hy - 15], [hx - 3, hy - 7]], OUT);
    poly(ctx, [[hx + 2, hy - 6], [hx + 6, hy - 16], [hx + 7, hy - 6]], OUT);
    poly(ctx, [[hx - 6, hy - 6], [hx - 8, hy - 14], [hx - 4, hy - 7]], hd.color);
    poly(ctx, [[hx + 3, hy - 7], [hx + 6, hy - 15], [hx + 6, hy - 7]], hd.color);
  } else if (hd.type === 'hood') {
    // hood brim over the forehead, face stays in shadow
    poly(ctx, [[hx - 8, hy - 8], [hx + 7, hy - 9], [hx + 9, hy - 2], [hx + 4, hy - 3], [hx - 2, hy - 4], [hx - 8, hy - 2]], OUT);
    poly(ctx, [[hx - 7, hy - 7], [hx + 6, hy - 8], [hx + 8, hy - 3], [hx + 4, hy - 4], [hx - 2, hy - 5], [hx - 7, hy - 3]], hd.color);
    px(ctx, hx - 6, hy - 6, 6, 1, shade(hd.color, 0.3));
    // cast a shadow on the upper face
    ctx.globalAlpha = 0.55; px(ctx, hx - w / 2 + 1, hy - 4, w - 1, 3, '#000'); ctx.globalAlpha = 1;
    if (hd.cowl) {
      poly(ctx, [[hx - 8, hy + 3], [hx + 8, hy + 3], [hx + 9, hy + 9], [hx - 9, hy + 9]], OUT);
      poly(ctx, [[hx - 7, hy + 3], [hx + 7, hy + 3], [hx + 8, hy + 8], [hx - 8, hy + 8]], hd.cowl);
    }
  }
  // glowing eyes through hood shadow
  if (hd.type === 'hood' && spec.glow && !hurt) {
    ctx.globalAlpha = 0.9;
    px(ctx, hx + 2, hy - 1, 2, 1, spec.glow); px(ctx, hx + 6, hy - 1, 2, 1, spec.glow);
    ctx.globalAlpha = 1;
  }
}

// ---------- back accessories ----------
function drawBackStuff(ctx, spec, hip, sc, t, state, pose) {
  const sway = Math.sin(t * 1.2) * 3;
  const fast = state === 'dash' ? 6 : 0;
  if (spec.wings) {
    const w = spec.wings;
    const flap = Math.sin(t * 1.5) * 4;
    poly(ctx, [[sc[0] - 2, sc[1] + 2], [sc[0] - 14 - fast, sc[1] - 16 + flap], [sc[0] - 30 - fast, sc[1] - 6 + flap], [sc[0] - 22 - fast, sc[1] + 4], [sc[0] - 26 - fast, sc[1] + 14], [sc[0] - 8, sc[1] + 12]], OUT);
    poly(ctx, [[sc[0] - 2, sc[1] + 3], [sc[0] - 14 - fast, sc[1] - 14 + flap], [sc[0] - 28 - fast, sc[1] - 5 + flap], [sc[0] - 21 - fast, sc[1] + 4], [sc[0] - 24 - fast, sc[1] + 12], [sc[0] - 8, sc[1] + 11]], w.membrane);
    brush(ctx, sc[0] - 3, sc[1] + 3, sc[0] - 14 - fast, sc[1] - 14 + flap, 2, w.bone);
    brush(ctx, sc[0] - 3, sc[1] + 3, sc[0] - 28 - fast, sc[1] - 5 + flap, 1, w.bone);
    brush(ctx, sc[0] - 3, sc[1] + 3, sc[0] - 24 - fast, sc[1] + 12, 1, w.bone);
  }
  if (spec.tail) {
    const col = spec.tail;
    const pts = [[hip[0] - 4, hip[1] + 2], [hip[0] - 11, hip[1] + 6 + sway * 0.3], [hip[0] - 18, hip[1] + 10 + sway * 0.6], [hip[0] - 24, hip[1] + 6 + sway]];
    for (let i = 0; i < pts.length - 1; i++) brush(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 5 - i, OUT);
    for (let i = 0; i < pts.length - 1; i++) brush(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3 - Math.floor(i / 2), col);
    px(ctx, pts[3][0] - 2, pts[3][1] - 1, 3, 3, spec.tailTip || shade(col, 0.4));
  }
  if (spec.cape) {
    const col = spec.cape;
    const len = spec.capeLen || 38;
    const back = state === 'dash' ? 12 : 0;
    const pts = [[sc[0] - 4, sc[1] - 1], [sc[0] + 2, sc[1]], [hip[0] - 8 - back + sway, hip[1] + len - 14], [hip[0] - 16 - back + sway * 1.5, hip[1] + len - 10]];
    poly(ctx, [[pts[0][0] - 1, pts[0][1] - 1], [pts[1][0] + 1, pts[1][1] - 1], [pts[2][0] + 1, pts[2][1] + 1], [pts[3][0] - 1, pts[3][1] + 1]], OUT);
    poly(ctx, pts, col);
    poly(ctx, [pts[0], [lerp(pts[0][0], pts[1][0], 0.4), pts[0][1]], [lerp(pts[3][0], pts[2][0], 0.4), pts[3][1]], pts[3]], shade(col, -0.3));
    // ragged hem
    for (let r = 0; r < 4; r++) px(ctx, pts[3][0] + r * 3, pts[3][1] + (r % 2), 2, 2, shade(col, -0.2));
    brush(ctx, pts[1][0] - 1, pts[1][1] + 2, pts[2][0] - 2, pts[2][1], 1, shade(col, 0.25));
  }
  if (spec.scarf) {
    const col = spec.scarf;
    const nk = [sc[0] - 1, sc[1] - 1];
    const rear = state === 'dash' ? 8 : 0;
    brush(ctx, nk[0], nk[1], nk[0] - 9 - rear + sway * 0.6, nk[1] + 3, 4, OUT);
    brush(ctx, nk[0], nk[1], nk[0] - 17 - rear + sway, nk[1] + 9 + sway * 0.4, 4, OUT);
    brush(ctx, nk[0], nk[1], nk[0] - 9 - rear + sway * 0.6, nk[1] + 3, 2, col);
    brush(ctx, nk[0] - 9 - rear + sway * 0.6, nk[1] + 3, nk[0] - 17 - rear + sway, nk[1] + 9 + sway * 0.4, 2, shade(col, -0.2));
  }
  if (spec.backsword) {
    const sword = spec.backsword;
    brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] - 14, sc[1] + 20, 4, OUT);
    brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] - 14, sc[1] + 20, 2, sword.blade || '#cbd5e1');
    brush(ctx, sc[0] + 4, sc[1] - 12, sc[0] - 13, sc[1] + 20, 1, '#f8fafc');
    brush(ctx, sc[0] - 1, sc[1] - 5, sc[0] + 5, sc[1] - 3, 3, OUT);
    brush(ctx, sc[0], sc[1] - 5, sc[0] + 4, sc[1] - 3, 1, sword.guard || '#fbbf24');
    brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] + 5, sc[1] - 17, 3, OUT);
    brush(ctx, sc[0] + 3, sc[1] - 12, sc[0] + 5, sc[1] - 17, 1, sword.grip || '#7c2d12');
  }
}


// ---------- effects ----------
/** fx: { orb: radius, orbPulse, aura: 0..1, arc: bool, lines: bool, dash: bool } */
function drawEffects(ctx, spec, fx, handPos, footPos, sc, hip) {
  if (!fx) return;
  const glow = spec.glow || '#ffffff';
  if (fx.aura) {
    // faint front tint (the main halo is drawn behind the body by drawAura)
    ctx.globalAlpha = 0.04 + fx.aura * 0.05;
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(hip[0], sc[1] + 8, 18 + fx.aura * 8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (fx.orb) {
    const r = fx.orb;
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin((fx.orbPulse || 0) * 1.6);
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(handPos[0] + 2, handPos[1], r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(handPos[0] + 2, handPos[1], r * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (fx.arc) {
    // impact arc traced by the striking foot
    const cx = hip[0] + 2, cy = hip[1] + 2;
    const a1 = Math.atan2(footPos[1] - cy, footPos[0] - cx);
    const r = Math.max(18, Math.hypot(footPos[0] - cx, footPos[1] - cy) + 2);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = glow; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, a1 + 0.9, a1 + 0.05, true); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, r + 1, a1 + 0.7, a1 + 0.1, true); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (fx.lines) {
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(handPos[0] - 13, handPos[1] - 3); ctx.lineTo(handPos[0] - 3, handPos[1] - 1);
    ctx.moveTo(handPos[0] - 15, handPos[1] + 1); ctx.lineTo(handPos[0] - 4, handPos[1] + 1);
    ctx.moveTo(handPos[0] - 11, handPos[1] + 4); ctx.lineTo(handPos[0] - 4, handPos[1] + 3);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (fx.dash) {
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 3; s++) ctx.fillRect(hip[0] - 30 - s * 6, sc[1] + s * 8, 14 + s * 3, 1);
    ctx.globalAlpha = 1;
  }
}

/** World-space end point of a limb for a pose (same maths as the IK in drawArm / drawLeg). */
function limbEnd(pose0, limb) {
  const p = plantFeet(pose0);
  const hip = [40, 59 + p.hy], sc = [hip[0] + p.lean, hip[1] - 19];
  let root, v, reach;
  if (limb === 'fa') { root = [sc[0] + 4, sc[1] + 2]; v = p.fa; reach = 19.95; }
  else if (limb === 'ra') { root = [sc[0] - 4, sc[1] + 2]; v = p.ra; reach = 19.95; }
  else if (limb === 'ff') { root = [hip[0] + 3, hip[1] + 2]; v = p.ff; reach = 27.95; }
  else { root = [hip[0] - 3, hip[1] + 2]; v = p.rf; reach = 27.95; }
  const d = Math.hypot(v[0], v[1]);
  const k = d > reach ? reach / d : 1;
  return { root, end: [root[0] + v[0] * k, root[1] + v[1] * k] };
}

/** Classic smear: a translucent sweep from where the limb was to where it is, plus a stretched limb ghost. */
function drawSmear(ctx, spec, M, sm, pose) {
  const a = limbEnd(sm.from, sm.limb), b = limbEnd(pose, sm.limb);
  const glow = spec.glow || '#ffffff';
  const isArm = sm.limb === 'fa' || sm.limb === 'ra';
  const gl = spec.gloves || {};
  const boots = spec.boots || {};
  const col = isArm ? ((gl.style === 'glove' || gl.style === 'claws') ? gl.color : spec.skin) : (boots.style && boots.style !== 'bare' ? boots.color : spec.skin);
  // sweep wedge between the old and new extremity
  ctx.globalAlpha = 0.3;
  poly(ctx, [b.root, a.end, b.end], glow);
  // stretched limb ghost trailing the extremity
  ctx.globalAlpha = 0.55;
  brush(ctx, lerp(a.end[0], b.end[0], 0.15), lerp(a.end[1], b.end[1], 0.15), b.end[0], b.end[1], isArm ? M.limb - 1 : M.thigh - 2, col);
  // speed streaks
  const nx = -(b.end[1] - a.end[1]), ny = b.end[0] - a.end[0];
  const nl = Math.hypot(nx, ny) || 1;
  for (const [o, al, c] of [[-4, 0.75, '#ffffff'], [0, 0.6, glow], [4, 0.75, '#ffffff']]) {
    const ox = (nx / nl) * o, oy = (ny / nl) * o;
    ctx.globalAlpha = al;
    brush(ctx, lerp(a.end[0], b.end[0], 0.05) + ox, lerp(a.end[1], b.end[1], 0.05) + oy, lerp(a.end[0], b.end[0], 0.75) + ox, lerp(a.end[1], b.end[1], 0.75) + oy, 1, c);
  }
  ctx.globalAlpha = 1;
}

// ---------- full figure ----------
/**
 * Draw one posed figure. o: { sway, backState, noShadow, smear, fx }.
 * Returns joint anchors (sprite space) used for overlays such as battle damage.
 */
function renderFigure(ctx, spec, pose0, o = {}) {
  const pose = plantFeet(pose0);
  const M = buildMetrics(spec);
  const hip = [40, 59 + pose.hy];
  const sc = [hip[0] + pose.lean, hip[1] - M.torso];
  const hc = [sc[0] + 2 + pose.hdx, sc[1] - 9 + pose.hdy];
  const t = o.sway || 0;

  // soft ground shadow (only when standing on the floor; the engine draws the travelling shadow)
  if (!pose.air && !o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(40 + pose.lean * 0.3, 87, 17, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  }

  if (o.fx && o.fx.aura) {
    const e = o.fx.aura;
    ctx.globalAlpha = 0.16 + e * 0.16;
    ctx.fillStyle = spec.glow || '#ffffff';
    ctx.beginPath(); ctx.arc(hip[0], sc[1] + 8, 18 + e * 8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.22 + e * 0.15;
    ctx.beginPath(); ctx.arc(hip[0], sc[1] + 8, 11 + e * 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  drawBackStuff(ctx, spec, hip, sc, t, o.backState || '', pose);
  if (o.smear) drawSmear(ctx, spec, M, o.smear, pose);

  const shF = [sc[0] + 4, sc[1] + 2], shR = [sc[0] - 4, sc[1] + 2];
  drawArm(ctx, spec, M, shR, pose.ra, false);
  drawLeg(ctx, spec, M, [hip[0] - 3, hip[1] + 2], pose.rf, false);
  const leg = drawLeg(ctx, spec, M, [hip[0] + 3, hip[1] + 2], pose.ff, true);

  drawBottomOver(ctx, spec, M, hip, t);
  drawTorso(ctx, spec, M, hip, sc, '', t);
  drawHead(ctx, spec, M, hc, pose, t, '');
  const handPos = drawArm(ctx, spec, M, shF, pose.fa, true);

  drawEffects(ctx, spec, o.fx, handPos, leg.foot, sc, hip);
  return {
    head: [hc[0], hc[1]], chest: [(sc[0] + hip[0]) / 2, (sc[1] + hip[1]) / 2 + 1],
    hip: [hip[0], hip[1]], knee: [leg.knee[0], leg.knee[1]], rot: 0
  };
}

/**
 * Render a pose into its own W×H canvas. o.rot = { ang, piv, center } draws the figure rotated
 * (knock-down tumbles, somersaults); o.tint flashes the body white; o.wideShadow for lying bodies.
 */
function renderPoseFrame(createCanvas, spec, pose, o, W, H) {
  const { canvas, ctx } = createCanvas(W, H);
  let anchors;
  if (o.rot) {
    const tmp = createCanvas(W, H);
    const a = renderFigure(tmp.ctx, spec, pose, { ...o, noShadow: true });
    const { ang, piv, center } = o.rot;
    ctx.save();
    ctx.translate(piv[0], piv[1]);
    ctx.rotate(ang);
    ctx.translate(-center[0], -center[1]);
    ctx.drawImage(tmp.canvas, 0, 0);
    ctx.restore();
    const cs = Math.cos(ang), sn = Math.sin(ang);
    const tf = (p) => [piv[0] + (p[0] - center[0]) * cs - (p[1] - center[1]) * sn, piv[1] + (p[0] - center[0]) * sn + (p[1] - center[1]) * cs];
    anchors = { head: tf(a.head), chest: tf(a.chest), hip: tf(a.hip), knee: tf(a.knee), rot: ang };
  } else {
    anchors = renderFigure(ctx, spec, pose, o);
  }
  if (o.wideShadow) {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(36, 88, 28, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (o.tint) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = o.tint;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  canvas.__a = anchors;
  return canvas;
}

// Knock-down geometry: angle 0 = upright (rotation about the hip), PI/2 = flat on the back.
function tumbleRot(ang) {
  const k = Math.min(1, ang / (Math.PI / 2));
  return { ang: -ang, center: [40, 60], piv: [lerp(40, 46, k), lerp(60, 77, k)] };
}
// Somersault: tuck rotated about the middle of the ball.
function flipRot(ang) { return { ang, center: [42, 46], piv: [41, 46] }; }

// ---------- frame options per state ----------
function attackFx(state, phase, idx) {
  const d = ATTACKS[state];
  const fx = {};
  if (d.orb) {
    fx.orb = phase === 'startup' ? [4, 6, 8][idx] : phase === 'active' ? [9, 10, 9][idx] : [6, 4, 0][idx];
    fx.orbPulse = idx + (phase === 'active' ? 3 : 0);
  }
  if (phase === 'active' && idx === 1) {
    if (d.arc) fx.arc = d.limb === 'ff';
    if (d.lines) fx.lines = true;
  }
  return fx;
}

// ---------- key frames ----------
export const RIG_STATE_COUNTS = {
  idle: 4, walk: 6, jump: 3, crouch: 2, hit: 2, knockdown: 3, block: 2,
  light_punch: 3, heavy_punch: 4, light_kick: 3, heavy_kick: 4,
  crouch_lp: 3, crouch_hp: 4, crouch_lk: 3, crouch_hk: 4,
  jump_punch: 2, jump_kick: 2,
  special_1: 5, special_2: 5, special_3: 4,
  ultimate: 8, dirty: 3, dash: 3,
  // dedicated sets for states that used to borrow another state's frames (same lengths as before)
  hit_crouch: 2, hit_air: 2, stun: 2, crouch_block: 2, dash_back: 3, victory: 4, winded: 4
};

const UPPER_MAP = {
  idle: ['IDLE'],
  winded: ['WINDED'],
  victory: ['VICTORY'],
  walk: ['WALK_FWD', 'WALK_BACK'],
  jump: ['JUMP', 'FALL', 'LAND', 'WALL_REBOUND'],
  crouch: ['CROUCH'],
  hit: ['HIT', 'SUBMISSION_LOCK'],
  hit_crouch: ['HIT_CROUCH'],
  hit_air: ['HIT_AIR'],
  stun: ['BLIND_STUN', 'OVERHEAT_STUN'],
  knockdown: ['KNOCKDOWN', 'DEFEAT'],
  block: ['BLOCK'],
  crouch_block: ['CROUCH_BLOCK'],
  light_punch: ['ATTACK_LP', 'ATTACK_LIGHT_PUNCH'],
  heavy_punch: ['ATTACK_HP', 'ATTACK_HEAVY_PUNCH', 'PICKUP_ATTACK'],
  light_kick: ['ATTACK_LK', 'ATTACK_LIGHT_KICK'],
  heavy_kick: ['ATTACK_HK', 'ATTACK_HEAVY_KICK'],
  crouch_lp: ['CROUCH_LP', 'CROUCH_LIGHT_PUNCH'],
  crouch_hp: ['CROUCH_HP', 'CROUCH_HEAVY_PUNCH'],
  crouch_lk: ['CROUCH_LK', 'CROUCH_LIGHT_KICK'],
  crouch_hk: ['CROUCH_HK', 'CROUCH_HEAVY_KICK'],
  jump_punch: ['JUMP_PUNCH'],
  jump_kick: ['JUMP_KICK'],
  special_1: ['SPECIAL_1'],
  special_2: ['SPECIAL_2'],
  special_3: ['SPECIAL_3'],
  ultimate: ['ULTIMATE', 'SUPER'],
  dirty: ['DIRTY_TACTIC'],
  dash: ['DASH_FWD'],
  dash_back: ['DASH_BACK']
};

function keyOptions(state, i, n) {
  const o = { sway: state === 'idle' ? i : i * 1.5 };
  if (state === 'dash') { o.backState = 'dash'; o.fx = { dash: true }; }
  if (state === 'hit' || state === 'hit_crouch' || state === 'hit_air') o.tint = i === 0 ? 0.16 : 0.06;
  if (state === 'ultimate') {
    const e = Math.min(1, (i + 1) / 5);
    o.fx = { orb: 6 + i * 2, orbPulse: i, aura: e };
  } else if (ATTACKS[state]) {
    const d = ATTACKS[state];
    const strikeIdx = n <= 3 ? 1 : 2;
    o.fx = {};
    if (d.orb) { o.fx.orb = 5 + i * 1.5; o.fx.orbPulse = i; }
    if (i === strikeIdx) { if (d.arc) o.fx.arc = d.limb === 'ff'; if (d.lines) o.fx.lines = true; }
  }
  return o;
}

function renderKey(createCanvas, spec, state, i, n, W, H) {
  if (state === 'knockdown') {
    if (i < 2) return renderPoseFrame(createCanvas, spec, FLUNG, { rot: tumbleRot([0.8, 1.25][i]) }, W, H);
    return renderPoseFrame(createCanvas, spec, LIE, { rot: tumbleRot(Math.PI / 2), wideShadow: true }, W, H);
  }
  return renderPoseFrame(createCanvas, spec, keyPose(state, i, n), keyOptions(state, i, n), W, H);
}

/** Build the complete sprite dictionary (lowercase + engine UPPERCASE keys) for a design. */
// Dedicated key sets that only matter in a fight. At load they alias the frames these states always used
// (same array length), and are redrawn in place with their own poses by the deferred motion build — so
// menus and previews pay nothing for them.
const DEFERRED_KEYS = { hit_crouch: 'hit', hit_air: 'hit', stun: 'hit', crouch_block: 'block', dash_back: 'dash', victory: 'idle', winded: 'idle' };

export function buildRigFrames(spec, createCanvas, W = 80, H = 90) {
  const frames = {};
  for (const [state, count] of Object.entries(RIG_STATE_COUNTS)) {
    if (DEFERRED_KEYS[state]) continue;
    frames[state] = [];
    for (let i = 0; i < count; i++) frames[state].push(renderKey(createCanvas, spec, state, i, count, W, H));
  }
  for (const [state, from] of Object.entries(DEFERRED_KEYS)) {
    const src = frames[from];
    frames[state] = Array.from({ length: RIG_STATE_COUNTS[state] }, (_, i) => src[i % src.length]);
  }
  for (const [s, keys] of Object.entries(UPPER_MAP)) {
    for (const k of keys) frames[k] = frames[s];
  }
  // Remember how to draw the in-between motion frames; they are built lazily (see stepRigMotion)
  Object.defineProperty(frames, '__rig', { value: { spec, createCanvas, W, H, jobs: null, done: false, built: 0 }, enumerable: false, writable: true });
  return frames;
}

// ---------- motion (in-between) frames ----------
// Each key array gets `.motion = { kind, tracks: { name: [canvas|null...] } }`. Tracks are only ever read by
// the renderer (MotionAnimator); the key arrays themselves keep their original lengths and index semantics.
function planMotion(frames) {
  const jobs = [];
  // deferred dedicated key poses are redrawn in place first (array identity and length never change)
  for (const state of Object.keys(DEFERRED_KEYS)) {
    const arr = frames[state];
    if (!arr) continue;
    const n = arr.length;
    for (let i = 0; i < n; i++) jobs.push({ track: arr, i, pose: keyPose(state, i, n), o: keyOptions(state, i, n) });
  }
  const add = (state, kind, trackDefs, extra = {}) => {
    const arr = frames[state];
    if (!arr) return;
    const tracks = {};
    for (const [name, list] of Object.entries(trackDefs)) {
      tracks[name] = new Array(list.length).fill(null);
      list.forEach((item, i) => jobs.push({ track: tracks[name], i, pose: item[0], o: item[1] || {} }));
    }
    Object.defineProperty(arr, 'motion', { value: { kind, tracks, ...extra }, enumerable: false, writable: true });
  };
  const N = (k) => Array.from({ length: k }, (_, i) => i);

  // locomotion first: these are on screen the most
  add('idle', 'idle', {
    loop: N(8).map(i => [idlePose(i / 8), { sway: i * 0.5 }]),
    land: LAND_POSES.map((p, i) => [p, { sway: i }])
  });
  add('walk', 'walk', { loop: N(12).map(i => [walkPose(i / 12), { sway: i * 0.5 }]) });
  add('jump', 'jump', {
    air: ['takeoff', 'rise', 'apex', 'fall', 'preland'].map((k, i) => [JUMP_POSES[k], { sway: i }]),
    flip: N(8).map(i => [JUMP_POSES.tuck, { rot: flipRot((i / 8) * Math.PI * 2), sway: i }])
  });
  add('crouch', 'crouch', {
    enter: [[blendPose(mergePose(BASE, {}), mergePose(CROUCH, {}), 0.5), {}], [C({ hy: 15, lean: 3, fa: [12, 8], ra: [8, 10], hdy: 1 }), {}]],
    loop: [[mergePose(CROUCH, {}), { sway: 0 }], [C({ hy: 13.6, fa: [12, 6.6], ra: [8, 8.6] }), { sway: 1 }], [C({ hy: 14.2, fa: [12, 7.2], ra: [8, 9.2] }), { sway: 2 }], [C({ hy: 13.6, fa: [12, 6.6], ra: [8, 8.6] }), { sway: 3 }]]
  });
  // reactions
  add('hit', 'react', { seq: HIT_POSES.map((p, i) => [p, { tint: i === 0 ? 0.18 : 0, sway: i }]) });
  add('hit_crouch', 'react', { seq: HIT_CROUCH_POSES.map((p, i) => [p, { tint: i === 0 ? 0.18 : 0, sway: i }]) });
  add('hit_air', 'react', { seq: HIT_AIR_POSES.map((p, i) => [p, { tint: i === 0 ? 0.18 : 0, sway: i }]) });
  add('block', 'block', {});
  add('crouch_block', 'block', {});
  // attacks: startup (anticipation) / active (smear, overshoot, contact) / recovery (follow-through, settle)
  for (const state of Object.keys(ATTACKS)) {
    const a = attackPoses(state);
    const d = ATTACKS[state];
    const def = {
      startup: [a.a1, a.wind, a.deep].map((p, i) => [p, { fx: attackFx(state, 'startup', i), sway: i }]),
      active: [
        [a.smear, { smear: { from: a.deep, limb: d.limb }, fx: attackFx(state, 'active', 0), sway: 3 }],
        [a.over, { fx: attackFx(state, 'active', 1), sway: 4 }],
        [a.strike, { fx: attackFx(state, 'active', 2), sway: 5 }]
      ],
      recovery: [a.follow, a.rec, a.settle].map((p, i) => [p, { fx: attackFx(state, 'recovery', i), sway: 6 + i }])
    };
    if (a.alt) {
      def.alt = [
        [a.altSmear, { smear: { from: a.strike, limb: d.limb }, fx: attackFx(state, 'active', 0), sway: 4 }],
        [a.alt, { fx: attackFx(state, 'active', 2), sway: 5 }]
      ];
    }
    add(state, 'attack', def, { release: d.release != null ? d.release : null, heavy: !!d.heavy });
  }
  // dashes
  add('dash', 'dash', {
    seq: ['launch', 'glide', 'glide2', 'brake'].map((k, i) => [DASH_POSES[k], { backState: k === 'brake' ? '' : 'dash', fx: k === 'brake' ? null : { dash: true }, sway: i * 1.5 }])
  });
  add('dash_back', 'dash_back', { seq: ['hop', 'float', 'land'].map((k, i) => [DASH_POSES[k], { sway: i * 1.5 }]) });
  // knock-down tumble, impact, get-up
  add('knockdown', 'knockdown', {
    tumble: [0.35, 0.8, 1.2].map((ang, i) => [FLUNG, { rot: tumbleRot(ang), sway: i }]),
    lie: [[LIE, { rot: tumbleRot(1.45), wideShadow: true }], [LIE, { rot: tumbleRot(Math.PI / 2), wideShadow: true, sway: 1 }]],
    getup: GETUP_POSES.map((p, i) => [p, { sway: i }])
  });
  // ultimate (cinematic phases: windup / lunge / flurry / recover)
  const ultFx = (r, e, i) => ({ orb: r, orbPulse: i, aura: e });
  const base = mergePose(BASE, {});
  add('ultimate', 'ult', {
    windup: [[blendPose(base, ULT.charge, 0.5), { fx: ultFx(6, 0.3, 0) }], [ULT.charge, { fx: ultFx(9, 0.7, 1), sway: 1 }], [ULT.chargeB, { fx: ultFx(11, 1, 2), sway: 2 }]],
    lunge: [[blendPose(ULT.chargeB, ULT.lunge, 0.6), { smear: { from: ULT.chargeB, limb: 'fa' }, fx: ultFx(8, 1, 3), backState: 'dash' }], [ULT.lunge, { fx: { ...ultFx(10, 1, 4), lines: true }, backState: 'dash', sway: 4 }]],
    jab: [[blendPose(ULT.kick, ULT.jab, 0.6), { smear: { from: ULT.kick, limb: 'fa' }, fx: ultFx(8, 0.8, 5) }], [ULT.jab, { fx: { ...ultFx(9, 0.8, 6), lines: true }, sway: 5 }]],
    kick: [[blendPose(ULT.jab, ULT.kick, 0.6), { smear: { from: ULT.jab, limb: 'ff' }, fx: ultFx(6, 0.8, 7) }], [ULT.kick, { fx: { ...ultFx(6, 0.8, 8), arc: true }, sway: 6 }]],
    recover: [[ULT.finisher, { fx: ultFx(10, 1, 9), sway: 7 }], [blendPose(ULT.finisher, base, 0.65), { fx: ultFx(4, 0.4, 10), sway: 8 }], [blendPose(ULT.lunge, base, 0.5), { sway: 9 }]]
  });
  // flavour states
  add('victory', 'victory', { enter: [[blendPose(base, VICTORY_POSE(0), 0.35), {}], [blendPose(base, VICTORY_POSE(0), 0.75), { sway: 1 }]] });
  add('winded', 'cycle', {}, { period: 8 });
  add('stun', 'stun', { loop: N(6).map(i => [STUN_POSE(Math.sin((i / 6) * Math.PI * 2)), { sway: i }]) });
  return jobs;
}

/**
 * Build pending motion frames for a sprite dictionary, spending at most `budgetMs` (Infinity = all).
 * Returns true once everything is built.
 */
export function stepRigMotion(frames, budgetMs = Infinity) {
  const rig = frames && frames.__rig;
  if (!rig) return true;
  if (rig.done) return true;
  if (!rig.jobs) { rig.jobs = planMotion(frames); rig.next = 0; }
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  const now = () => (typeof performance !== 'undefined' ? performance : Date).now();
  while (rig.next < rig.jobs.length) {
    const j = rig.jobs[rig.next++];
    j.track[j.i] = renderPoseFrame(rig.createCanvas, rig.spec, j.pose, j.o, rig.W, rig.H);
    rig.built++;
    if (budgetMs !== Infinity && now() - t0 >= budgetMs) break;
  }
  if (rig.next >= rig.jobs.length) { rig.done = true; rig.jobs = null; }
  return rig.done;
}

export function rigMotionFrameCount(frames) {
  return frames && frames.__rig ? frames.__rig.built : 0;
}

// ---------- render-time animator ----------
const CROUCHY = new Set(['CROUCH', 'CROUCH_BLOCK', 'HIT_CROUCH', 'CROUCH_LP', 'CROUCH_HP', 'CROUCH_LK', 'CROUCH_HK']);
const AIRY = new Set(['JUMP', 'FALL', 'JUMP_PUNCH', 'JUMP_KICK', 'HIT_AIR', 'WALL_REBOUND']);

/**
 * Chooses which pre-rendered frame to show for a fighter each render and adds procedural motion
 * (squash & stretch, lunge offsets, recoil shake, smear ghosts). It only READS fighter state; the
 * gameplay-driven animFrame keeps selecting the key pose and the animator fills in the motion around it.
 */
export class MotionAnimator {
  constructor() {
    this.state = null; this.prevState = null; this.timer = -1; this.tick = 0;
    this.key = -1; this.keyT0 = 0;
    this.phase = 'startup'; this.phaseT0 = 0; this.seenActive = false; this.activeKey = -1; this.alt = false; this.altT0 = 0;
    this.hitMax = 20; this.walkPh = 0; this.lastX = null; this.air = false; this.landTick = -99; this.groundTick = null;
    this.ultPhase = null; this.ultT0 = 0;
    this.lastImg = null; this.prevImg = null; this.startupImg = null; this.smearImg = null;
  }

  _enter(f) {
    this.prevState = this.state;
    this.state = f.state;
    this.phase = 'startup'; this.phaseT0 = f.stateTimer; this.seenActive = false; this.activeKey = -1; this.alt = false;
    this.key = -1;
    this.hitMax = Math.max(f.hitStun || 0, f.blockStun || 0, 1);
    if (this.hitMax <= 1) this.hitMax = 20;
    this.groundTick = null;
    this.ultPhase = null;
    this.startupImg = null; this.smearImg = null;
  }

  /** Most recent frame shown that differs from `img` (source for motion-blur ghosts). */
  _ghostSrc(img) {
    return (this.lastImg && this.lastImg !== img) ? this.lastImg : (this.prevImg !== img ? this.prevImg : null);
  }

  update(f, frames, keyImg) {
    const vis = { img: keyImg, ghosts: null, ox: 0, oy: 0, sx: 1, sy: 1 };
    // finish this fighter's in-between frames a few milliseconds at a time (one-off, cached afterwards)
    const sp = f.sprites;
    if (sp && sp.__rig && !sp.__rig.done) stepRigMotion(sp, 3);
    if (!frames) return vis;
    const timer = f.stateTimer || 0;
    // --- tick bookkeeping (render may run more often than the 60Hz simulation) ---
    let dt = 0;
    if (f.state !== this.state || timer < this.timer) { this._enter(f); dt = 1; }
    else dt = Math.max(0, timer - this.timer);
    this.timer = timer;
    this.tick += dt;
    // freeze detection: the combat system's global hit-freeze stops the simulation without telling the
    // fighters, so treat "no tick for a few renders / ~3 frames of wall time" as a frozen impact
    const nowMs = (typeof performance !== 'undefined' ? performance : Date).now();
    if (dt > 0 || this.advMs === undefined) { this.stillRenders = 0; this.advMs = nowMs; }
    else this.stillRenders++;
    this.frozen = f.hitStop > 0 || this.stillRenders >= 3 || nowMs - this.advMs > 45;
    const keyIdx = f.animFrame || 0;
    let keyChanged = false;
    if (keyIdx !== this.key) { keyChanged = this.key !== -1; this.key = keyIdx; this.keyT0 = timer; }

    // landing detection (for squash and the landing crouch)
    const nowAir = !f.isGrounded;
    if (this.air && !nowAir && this.state !== 'KNOCKDOWN' && this.state !== 'DEFEAT') this.landTick = this.tick;
    this.air = nowAir;

    // walk phase follows the distance actually travelled so steps stay in sync with movement speed
    const dir = f.facingRight ? 1 : -1;
    if (this.lastX !== null && dt > 0 && (f.state === 'WALK_FWD' || f.state === 'WALK_BACK')) {
      const ws = Math.max(1, f.walkSpeed || 3.6);
      const dx = (f.x - this.lastX) * dir;
      const mv = Math.max(Math.abs(dx), 0.55 * ws * dt);
      const sgn = Math.abs(dx) > 0.05 ? Math.sign(dx) : (f.state === 'WALK_BACK' ? -1 : 1);
      this.walkPh = (this.walkPh + sgn * mv / (24 * ws) + 1) % 1;
    }
    this.lastX = f.x;

    const m = frames.motion;
    const T = m ? m.tracks : null;
    const pick = (track, i) => (track && track[Math.max(0, Math.min(track.length - 1, i))]) || null;
    let img = null;
    const t = timer;

    if (m) {
      switch (m.kind) {
        case 'idle': {
          const lt = this.tick - this.landTick;
          if (lt < 7 && t < 7 && (this.prevState === 'JUMP' || AIRY.has(this.prevState))) {
            img = pick(T.land, lt < 3 ? 0 : 1);
            const q = Math.max(0, 1 - lt / 7);
            vis.sy = 1 - 0.13 * q; vis.sx = 1 + 0.09 * q;
          } else {
            img = pick(T.loop, Math.floor(((this.tick % 56) / 56) * 8));
          }
          break;
        }
        case 'walk':
          img = pick(T.loop, Math.floor(this.walkPh * 12) % 12);
          break;
        case 'jump': {
          const vy = f.vy || 0, vx = (f.vx || 0) * dir;
          const v0 = Math.min(-4, f.jumpForce || -13.5);
          const p = Math.max(0, Math.min(1, (vy - v0) / (-2 * v0)));
          if (f.state === 'JUMP' && t < 3 && vy < 0) { img = pick(T.air, 0); vis.sy = 1.1; vis.sx = 0.92; }
          else if (f.state === 'JUMP' && Math.abs(vx) > 1.5 && p > 0.16 && p < 0.84) {
            let i = Math.floor(((p - 0.16) / 0.68) * 8) % 8;
            if (vx < 0) i = (8 - i) % 8;
            img = pick(T.flip, i);
          } else {
            img = pick(T.air, vy < -7 ? 1 : vy < 2.5 ? 2 : vy < 7 ? 3 : 4);
            if (vy < 0) { const k = Math.min(1, -vy / 14); vis.sy = 1 + 0.06 * k; vis.sx = 1 - 0.04 * k; }
            else if (vy > 8) { vis.sy = 1.04; vis.sx = 0.97; }
          }
          break;
        }
        case 'crouch': {
          const fromLow = CROUCHY.has(this.prevState);
          if (!fromLow && t < 2) img = pick(T.enter, 0);
          else if (!fromLow && t < 5) { img = pick(T.enter, 1); vis.sy = 0.96; vis.sx = 1.04; }
          else img = pick(T.loop, Math.floor(((this.tick % 48) / 48) * 4));
          break;
        }
        case 'react': {
          const dur = this.hitMax;
          img = t < 2 ? pick(T.seq, 0) : t < dur * 0.45 ? pick(T.seq, 1) : t < dur * 0.75 ? pick(T.seq, 2) : pick(T.seq, 3);
          if (t < 6) vis.ox = -[3, 2.5, 2, 1.5, 1, 0.5][t];
          if (t < 2) { vis.sx = 0.94; vis.sy = 1.04; }
          break;
        }
        case 'block':
          img = (f.blockStun > 0 && t < 4) ? frames[1] : frames[0];
          if (f.blockStun > 0 && t < 3) vis.ox = -1.5 + t * 0.5;
          break;
        case 'attack': img = this._attack(f, frames, m, vis, keyChanged); break;
        case 'dash': {
          img = t < 2 ? pick(T.seq, 0) : t < 10 ? pick(T.seq, 1 + (Math.floor(t / 3) % 2)) : pick(T.seq, 3);
          if (t >= 2 && t < 10) { vis.sx = 1.05; vis.sy = 0.97; }
          break;
        }
        case 'dash_back':
          img = t < 3 ? pick(T.seq, 0) : t < 10 ? pick(T.seq, 1) : pick(T.seq, 2);
          if (t >= 10 && t < 13) { vis.sy = 0.95; vis.sx = 1.04; }
          break;
        case 'knockdown': {
          if (!f.isGrounded) {
            const vy = f.vy || 0;
            img = pick(T.tumble, vy < -3 ? 0 : vy < 3 ? 1 : 2);
          } else {
            if (this.groundTick === null) this.groundTick = this.tick;
            const gt = this.tick - this.groundTick;
            if (!f.isDead && f.state === 'KNOCKDOWN' && (f.knockdownTimer || 0) <= 12 && gt > 4) {
              img = pick(T.getup, (f.knockdownTimer || 0) > 6 ? 0 : 1);
            } else {
              img = pick(T.lie, gt < 3 ? 0 : 1);
              if (gt < 3) { vis.sy = 0.9; vis.sx = 1.06; }
            }
          }
          break;
        }
        case 'ult': img = this._ult(f, frames, m, vis, keyChanged); break;
        case 'victory': {
          img = t < 4 ? pick(T.enter, 0) : t < 8 ? pick(T.enter, 1) : frames[Math.floor((t - 8) / 10) % frames.length];
          break;
        }
        case 'cycle': img = frames[Math.floor(this.tick / (m.period || 8)) % frames.length]; break;
        case 'stun': img = pick(T.loop, Math.floor(((this.tick % 42) / 42) * 6)); break;
        default: break;
      }
    }
    if (img) vis.img = img;

    // impact shake while frozen in hit-stop
    if (this.frozen && (f.hitStun > 0 || f.state === 'KNOCKDOWN')) {
      const ph = Math.floor((typeof performance !== 'undefined' ? performance.now() : Date.now()) / 34) % 2;
      vis.ox += ph ? 1.5 : -1.5;
    }
    if (this.frozen) vis.ghosts = null; // frozen impact: crisp pose, no trailing blur
    if (vis.img !== this.lastImg) { this.prevImg = this.lastImg; this.lastImg = vis.img; }
    return vis;
  }

  _attack(f, frames, m, vis, keyChanged) {
    const T = m.tracks;
    const t = f.stateTimer || 0;
    const key = this.key;
    const active = !!f.activeHitbox;
    // --- phase tracking: hitbox presence decides startup / active / recovery, whatever the per-fighter timing ---
    if (active) {
      if (this.phase !== 'active') { this.phase = 'active'; this.phaseT0 = t; this.activeKey = key; this.alt = false; }
      else if (keyChanged && key !== this.activeKey) { this.alt = !this.alt; this.activeKey = key; this.altT0 = t; }
      this.seenActive = true;
    } else if (this.seenActive) {
      if (this.phase === 'active' && key !== this.activeKey) { this.phase = 'recovery'; this.phaseT0 = t; }
    } else if (m.release != null && key >= m.release) {
      // projectile moves never raise a hitbox: the release key marks the throw
      const want = key === m.release ? 'active' : 'recovery';
      if (this.phase !== want) { this.phase = want; this.phaseT0 = t; this.activeKey = m.release; }
    } else if (this.phase !== 'startup') { this.phase = 'startup'; this.phaseT0 = t; }

    const heavy = m.heavy ? 1.5 : 1;
    const pick = (track, i) => (track && track[Math.max(0, Math.min(track.length - 1, i))]) || null;
    let img = null;
    if (this.phase === 'startup') {
      const i = t <= 0 ? 0 : t <= 2 ? 1 : 2;
      img = pick(T.startup, i);
      if (i === 2) vis.ox = -1 * heavy;
      if (img) this.startupImg = img;
    } else if (this.phase === 'active') {
      if (this.alt && T.alt) {
        const ta = t - this.altT0;
        img = pick(T.alt, ta < 1 ? 0 : 1);
        if (ta < 2 && this._ghostSrc(img)) vis.ghosts = [{ img: this._ghostSrc(img), alpha: 0.3, dx: -2 }];
        vis.ox = 1.5 * heavy;
      } else {
        // in hit-stop the strike freezes on its most extended (overshoot) pose
        const ta = this.frozen ? Math.max(1, t - this.phaseT0) : t - this.phaseT0;
        img = pick(T.active, ta < 1 ? 0 : ta < 3 ? 1 : 2);
        vis.ox = (ta < 1 ? 2 : ta < 3 ? 3 : 1.5) * heavy;
        if (ta < 2) { vis.sx = 1 + 0.04 * heavy; vis.sy = 1 - 0.025 * heavy; }
        if (ta < 3 && this.startupImg) {
          vis.ghosts = [{ img: this.startupImg, alpha: ta < 1 ? 0.35 : 0.2, dx: -1 }];
          const sm = T.active[0];
          if (ta >= 1 && sm) vis.ghosts.push({ img: sm, alpha: 0.3, dx: 0 });
        }
      }
    } else {
      const tr = t - this.phaseT0;
      img = pick(T.recovery, tr < 2 ? 0 : tr < 5 ? 1 : 2);
      vis.ox = Math.max(0, 1.5 - tr * 0.3) * heavy;
    }
    return img || frames[Math.min(key, frames.length - 1)];
  }

  _ult(f, frames, m, vis, keyChanged) {
    const T = m.tracks;
    const t = f.stateTimer || 0;
    const pick = (track, i) => (track && track[Math.max(0, Math.min(track.length - 1, i))]) || null;
    const u = f.ult;
    if (!u || !u.phase) {
      // move-specific ultimates: gameplay key poses, with a ghost on every key change
      const img = frames[Math.min(this.key, frames.length - 1)];
      if (t - this.keyT0 < 2 && this._ghostSrc(img)) vis.ghosts = [{ img: this._ghostSrc(img), alpha: 0.3, dx: -2 }];
      return img;
    }
    if (u.phase !== this.ultPhase) { this.ultPhase = u.phase; this.ultT0 = t; }
    const tp = t - this.ultT0;
    switch (u.phase) {
      case 'windup': return pick(T.windup, t < 3 ? 0 : t < 6 ? 1 : 1 + (Math.floor(t / 2) % 2));
      case 'lunge':
        vis.ox = tp < 1 ? 2 : 3;
        if (tp < 2) { vis.sx = 1.06; vis.sy = 0.97; }
        if (tp < 2 && this._ghostSrc(null)) vis.ghosts = [{ img: this._ghostSrc(null), alpha: 0.3, dx: -3 }];
        return pick(T.lunge, tp < 1 ? 0 : 1);
      case 'lock': {
        const tk = t - this.keyT0;
        const tr = this.key === 2 ? T.kick : T.jab;
        if (tk < 2 && this._ghostSrc(null)) vis.ghosts = [{ img: this._ghostSrc(null), alpha: 0.28, dx: -2 }];
        vis.ox = tk < 1 ? 1 : 2;
        return pick(tr, tk < 1 ? 0 : 1);
      }
      case 'recover':
        if ((u.hits || 0) > 0) return pick(T.recover, (u.recoverT || 0) < 12 ? 0 : 1);
        return pick(T.recover, (u.recoverT || 0) < 10 ? 2 : 1);
      default: return frames[Math.min(this.key, frames.length - 1)];
    }
  }
}
