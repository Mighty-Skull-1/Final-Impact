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
const BASE = { hy: 1, lean: 0, fa: [12, 1], ra: [8, 3], ff: [10, 26], rf: [-9, 27], hdx: 0, hdy: 0, expr: 'normal' };
const CROUCH = { hy: 13, lean: 2, fa: [12, 6], ra: [8, 8], ff: [12, 14], rf: [-10, 14], hdx: 1, hdy: 0 };
const AIR = { hy: -10, lean: 0, fa: [10, -6], ra: [6, -4], ff: [10, 20], rf: [-6, 22], hdx: 0, hdy: 0 };

const ATTACKS = {
  light_punch: { base: BASE, wind: { fa: [4, 5], lean: -1 }, strike: { fa: [22, -2], lean: 2, ra: [6, 6] } },
  heavy_punch: { base: BASE, wind: { fa: [-3, 7], lean: -3, ra: [12, 0] }, strike: { fa: [25, -3], lean: 6, ff: [16, 26], rf: [-12, 27], hy: 2 } },
  light_kick: { base: BASE, wind: { ff: [12, 16], lean: -1 }, strike: { ff: [25, 4], lean: -3, ra: [0, -6] } },
  heavy_kick: { base: BASE, wind: { ff: [8, 12], lean: -4 }, strike: { ff: [27, -6], lean: -8, fa: [10, -8], ra: [-12, 0], hy: 0 } },
  crouch_lp: { base: CROUCH, wind: { fa: [6, 7] }, strike: { fa: [22, 5] } },
  crouch_hp: { base: CROUCH, wind: { fa: [6, 12], hy: 14 }, strike: { fa: [10, -22], hy: 9, ff: [10, 17] } },
  crouch_lk: { base: CROUCH, wind: { ff: [10, 12] }, strike: { ff: [24, 12] } },
  crouch_hk: { base: CROUCH, wind: { ff: [8, 12], lean: 3 }, strike: { ff: [30, 14], lean: -4, rf: [-12, 14], hy: 14 } },
  jump_punch: { base: AIR, wind: { fa: [6, -2] }, strike: { fa: [22, 8] } },
  jump_kick: { base: AIR, wind: { ff: [8, 14] }, strike: { ff: [24, 14], lean: -4 } },
  special_1: { base: BASE, wind: { fa: [3, 8], ra: [0, 8], lean: -3, hy: 3 }, strike: { fa: [24, 2], ra: [20, 4], lean: 4, ff: [14, 26], hy: 2 } },
  special_2: { base: BASE, wind: { hy: 6, fa: [6, 12], ra: [4, 12] }, strike: { fa: [8, -26], ra: [4, -12], hy: -6, ff: [8, 22], rf: [-6, 24], lean: 2 } },
  special_3: { base: BASE, wind: { ff: [8, 14], lean: -2 }, strike: { ff: [28, -2], lean: -6, hy: -3, fa: [8, -6] } },
  dirty: { base: CROUCH, wind: { fa: [0, 10] }, strike: { fa: [20, 12], lean: 3 } }
};
const PROFILES = {
  2: ['w', 1],
  3: ['w', 1, 0.45],
  4: ['w', 0.55, 1, 0.4],
  5: ['w', 0.3, 0.7, 1, 0.4]
};

function mergePose(base, over) { return { ...BASE, ...base, ...over }; }

function blendPose(a, b, t) {
  return {
    hy: lerp(a.hy, b.hy, t), lean: lerp(a.lean, b.lean, t), hdx: lerp(a.hdx || 0, b.hdx || 0, t), hdy: lerp(a.hdy || 0, b.hdy || 0, t),
    fa: lerpArr(a.fa, b.fa, t), ra: lerpArr(a.ra, b.ra, t), ff: lerpArr(a.ff, b.ff, t), rf: lerpArr(a.rf, b.rf, t),
    expr: b.expr || a.expr
  };
}

function poseFor(state, i, n) {
  const ph = (i / n) * Math.PI * 2;
  switch (state) {
    case 'idle': {
      const b = Math.sin(ph);
      return mergePose(BASE, { hy: 1 + Math.round(b * 0.8), fa: [12, 1 + b * 0.8], ra: [8, 3 - b * 0.5], lean: Math.round(b * 0.5) });
    }
    case 'walk': {
      const s = Math.sin(ph), c = Math.cos(ph);
      return mergePose(BASE, {
        hy: 1 + Math.abs(s) * 0.6,
        ff: [9 + 7 * s, 26 - Math.max(0, c) * 5],
        rf: [-9 - 7 * s, 26 - Math.max(0, -c) * 5],
        fa: [11 - 3 * s, 2], ra: [8 + 3 * s, 3]
      });
    }
    case 'jump': {
      const peak = i === 1 ? -14 : -8;
      return mergePose(AIR, { hy: peak, ff: i === 2 ? [8, 24] : [10, 18], rf: i === 2 ? [-8, 24] : [-6, 22] });
    }
    case 'crouch':
      return mergePose(CROUCH, { hy: 13 + (i === 0 ? -2 : 0) });
    case 'hit': {
      const k = i === 0 ? 0 : 1;
      return mergePose(BASE, { hy: 1 + k, lean: -3 - k * 2, fa: [-4, 8], ra: [-8, 6], hdx: -2, hdy: 1, ff: [8, 26], rf: [-12 - k * 2, 26], expr: 'pain' });
    }
    case 'block':
      return mergePose(BASE, { hy: 3 + (i % 2 === 1 ? 1 : 0), lean: -1, fa: [8, -6], ra: [10, -4], ff: [11, 24], rf: [-10, 25], hdx: -1, hdy: 1, expr: 'block' });
    case 'dash': {
      const k = i % 2;
      return mergePose(BASE, { hy: 4, lean: 8, ff: [18 - k * 3, 24], rf: [-16 + k * 3, 27 - k * 4], fa: [-6, 4], ra: [-8, 2], hdx: 2, hdy: 1 });
    }
    case 'ultimate': {
      const charge = { hy: 3, lean: -2, fa: [4, -18], ra: [-4, -16], ff: [13, 26], rf: [-12, 26], expr: 'rage' };
      const fin = { hy: 2, lean: 7, fa: [27, -2], ra: [24, 2], ff: [16, 26], rf: [-12, 26], expr: 'rage' };
      const base = mergePose(BASE, {});
      if (i < 4) return blendPose(base, mergePose(BASE, charge), (i + 1) / 4);
      const e = Math.min(1, (i - 3) / 2) * (i === 7 ? 0.6 : 1);
      return blendPose(mergePose(BASE, charge), mergePose(BASE, fin), e);
    }
    default: {
      const def = ATTACKS[state];
      if (!def) return mergePose(BASE, {});
      const base = mergePose(def.base, {});
      const prof = PROFILES[Math.min(5, Math.max(2, n))];
      const p = prof[Math.min(i, prof.length - 1)];
      if (p === 'w') return blendPose(base, mergePose(def.base, def.wind), 1);
      return blendPose(base, mergePose(def.base, def.strike), p);
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
  return C;
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
function drawEffects(ctx, spec, state, i, n, handPos, footPos, sc, hip) {
  const glow = spec.glow || '#ffffff';
  const e = state === 'ultimate' ? Math.min(1, (i + 1) / 5) : 0;
  if (state.startsWith('special') || state === 'ultimate') {
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin(i * 1.6);
    ctx.fillStyle = glow;
    const hp = handPos;
    const r = state === 'ultimate' ? 6 + i * 2 : 5 + i * 1.5;
    ctx.beginPath(); ctx.arc(hp[0] + 2, hp[1], r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(hp[0] + 2, hp[1], r * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (state === 'ultimate') {
    ctx.globalAlpha = 0.10 + e * 0.12;
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(hip[0], sc[1] + 8, 18 + i * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // slash arc trail for heavy kicks / special kicks
  if ((state === 'heavy_kick' || state === 'special_3' || state === 'special_2' || state === 'light_kick') && i > 0 && i < n - 1) {
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hip[0] + 2, hip[1] + 4, 26, -1.0, 0.25);
    ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(hip[0] + 2, hip[1] + 4, 27, -0.9, 0.1); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if ((state === 'heavy_punch' || state === 'light_punch') && i === 1 + (state === 'heavy_punch' ? 1 : 0)) {
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(handPos[0] - 12, handPos[1] - 2); ctx.lineTo(handPos[0] - 2, handPos[1]); ctx.moveTo(handPos[0] - 12, handPos[1] + 2); ctx.lineTo(handPos[0] - 3, handPos[1] + 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (state === 'dash') {
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 3; s++) ctx.fillRect(hip[0] - 30 - s * 6, sc[1] + s * 8, 14 + s * 3, 1);
    ctx.globalAlpha = 1;
  }
}

// ---------- full figure ----------
function renderFigure(ctx, spec, state, i, n) {
  const M = buildMetrics(spec);
  const pose = poseFor(state, i, n);
  const t = i;
  const hip = [40, 59 + pose.hy];
  const sc = [hip[0] + pose.lean, hip[1] - M.torso];
  const hc = [sc[0] + 2 + pose.hdx, sc[1] - 9 + pose.hdy];

  // soft ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(40 + pose.lean * 0.3, 87, 17, 3.2, 0, 0, Math.PI * 2); ctx.fill();

  drawBackStuff(ctx, spec, hip, sc, state === 'idle' ? i : i * 1.5, state, pose);

  const shF = [sc[0] + 4, sc[1] + 2], shR = [sc[0] - 4, sc[1] + 2];

  // rear arm + rear leg first
  drawArm(ctx, spec, M, shR, pose.ra, false);
  drawLeg(ctx, spec, M, [hip[0] - 3, hip[1] + 2], pose.rf, false);
  const footPos = drawLeg(ctx, spec, M, [hip[0] + 3, hip[1] + 2], pose.ff, true);

  drawBottomOver(ctx, spec, M, hip, t);
  drawTorso(ctx, spec, M, hip, sc, state, t);
  drawHead(ctx, spec, M, hc, pose, t, state);
  const handPos = drawArm(ctx, spec, M, shF, pose.fa, true);

  drawEffects(ctx, spec, state, i, n, handPos, footPos, sc, hip);
}

/** Render one animation frame; knockdown is rendered as a rotated falling body. */
function renderFrame(createCanvas, spec, state, i, n, W, H) {
  const { canvas, ctx } = createCanvas(W, H);
  if (state === 'knockdown') {
    const tmp = createCanvas(W, H);
    renderFigure(tmp.ctx, spec, 'hit', 1, 2);
    const ang = [0.8, 1.25, 1.5][Math.min(i, 2)];
    const piv = [[44, 70], [46, 77], [50, 80]][Math.min(i, 2)];
    ctx.save();
    ctx.translate(piv[0], piv[1]);
    ctx.rotate(-ang);
    ctx.translate(-40, -59);
    ctx.drawImage(tmp.canvas, 0, 0);
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(34, 88, 28, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    renderFigure(ctx, spec, state, i, n);
  }
  if (state === 'hit') {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = i === 0 ? 0.16 : 0.06;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  return canvas;
}

export const RIG_STATE_COUNTS = {
  idle: 4, walk: 6, jump: 3, crouch: 2, hit: 2, knockdown: 3, block: 2,
  light_punch: 3, heavy_punch: 4, light_kick: 3, heavy_kick: 4,
  crouch_lp: 3, crouch_hp: 4, crouch_lk: 3, crouch_hk: 4,
  jump_punch: 2, jump_kick: 2,
  special_1: 5, special_2: 5, special_3: 4,
  ultimate: 8, dirty: 3, dash: 3
};

const UPPER_MAP = {
  idle: ['IDLE', 'WINDED', 'VICTORY'],
  walk: ['WALK_FWD', 'WALK_BACK'],
  jump: ['JUMP', 'FALL', 'LAND', 'WALL_REBOUND'],
  crouch: ['CROUCH'],
  hit: ['HIT', 'HIT_CROUCH', 'HIT_AIR', 'BLIND_STUN', 'SUBMISSION_LOCK', 'OVERHEAT_STUN'],
  knockdown: ['KNOCKDOWN', 'DEFEAT'],
  block: ['BLOCK', 'CROUCH_BLOCK'],
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
  dash: ['DASH_FWD', 'DASH_BACK']
};

/** Build the complete sprite dictionary (lowercase + engine UPPERCASE keys) for a design. */
export function buildRigFrames(spec, createCanvas, W = 80, H = 90) {
  const frames = {};
  for (const [state, count] of Object.entries(RIG_STATE_COUNTS)) {
    frames[state] = [];
    for (let i = 0; i < count; i++) frames[state].push(renderFrame(createCanvas, spec, state, i, count, W, H));
  }
  for (const [s, keys] of Object.entries(UPPER_MAP)) {
    for (const k of keys) frames[k] = frames[s];
  }
  return frames;
}
