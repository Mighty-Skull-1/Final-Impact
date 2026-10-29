// Final Impact - Shared UI Theme
// One place for colours, fonts and the small drawing helpers every screen uses,
// so the title, menus, HUD and results all read as one game.

// Bahnschrift ships with Windows 10/11 (condensed DIN look); the rest are fallbacks.
const DISPLAY_STACK = '"Bahnschrift", "Inter Display", "Arial Narrow", "Segoe UI", sans-serif';
const UI_STACK = '"Bahnschrift", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif';
const MONO_STACK = '"Cascadia Mono", Consolas, "DejaVu Sans Mono", monospace';

export const COLORS = {
  ink: '#07070b',
  ink2: '#0e0e15',
  panel: 'rgba(14, 13, 20, 0.86)',
  panelSolid: '#121119',
  panelHi: '#1b1a25',
  line: 'rgba(255, 255, 255, 0.10)',
  text: '#f4efe4',
  textDim: '#a7a1b3',
  textMute: '#6b6578',
  gold: '#f5c542',
  goldDeep: '#c8901c',
  goldPale: '#fde9a8',
  crimson: '#e5243b',
  crimsonDeep: '#8f1022',
  ember: '#ff7a1a',
  p1: '#3fb6ff',
  p1Deep: '#155e9c',
  p2: '#ff4d6d',
  p2Deep: '#9c1530',
  good: '#4ade80',
  warn: '#fbbf24',
  bad: '#ef4444',
  meter: '#38d8ff',
  meterFull: '#ffe066'
};

export const FONTS = {
  display: (size, weight = 900, italic = true) => `${italic ? 'italic ' : ''}${weight} ${size}px ${DISPLAY_STACK}`,
  ui: (size, weight = 700) => `${weight} ${size}px ${UI_STACK}`,
  mono: (size, weight = 700) => `${weight} ${size}px ${MONO_STACK}`
};

export const ease = {
  outCubic: t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3),
  outBack: t => {
    t = Math.min(1, Math.max(0, t));
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inOut: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  pulse: (time, speed = 0.08) => Math.sin(time * speed) * 0.5 + 0.5
};

// Parallelogram path (the signature "slashed" shape used across the UI)
export function slantPath(ctx, x, y, w, h, slant = 8) {
  ctx.beginPath();
  ctx.moveTo(x + slant, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - slant, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

export function drawSlantPanel(ctx, x, y, w, h, opts = {}) {
  const { fill = COLORS.panel, stroke = null, slant = 8, lineWidth = 1, glow = null } = opts;
  ctx.save();
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 14;
  }
  slantPath(ctx, x, y, w, h, slant);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowBlur = 0;
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPanel(ctx, x, y, w, h, opts = {}) {
  const { fill = COLORS.panel, stroke = COLORS.line, accent = null, corner = 0 } = opts;
  ctx.save();
  ctx.fillStyle = fill;
  if (corner > 0 && ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, corner);
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  } else {
    ctx.fillRect(x, y, w, h);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  }
  if (accent) {
    ctx.fillStyle = accent;
    ctx.fillRect(x, y, 3, h);
  }
  ctx.restore();
}

// Text with optional dark outline + drop shadow, for legibility over busy backgrounds.
export function drawText(ctx, text, x, y, opts = {}) {
  const {
    font = FONTS.ui(12), color = COLORS.text, align = 'left', baseline = 'alphabetic',
    outline = 0, outlineColor = 'rgba(0,0,0,0.85)', shadow = null, alpha = 1, maxWidth = undefined,
    letterSpacing = 0
  } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (letterSpacing && 'letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`;
  if (shadow) {
    ctx.fillStyle = shadow.color || 'rgba(0,0,0,0.7)';
    ctx.fillText(text, x + (shadow.x ?? 2), y + (shadow.y ?? 2), maxWidth);
  }
  if (outline > 0) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = outline;
    ctx.strokeStyle = outlineColor;
    ctx.strokeText(text, x, y, maxWidth);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

// Big gradient title text (gold → ember) with a dark outline.
export function drawTitleText(ctx, text, x, y, size, opts = {}) {
  const { align = 'center', top = COLORS.goldPale, mid = COLORS.gold, bottom = COLORS.crimson, outline = Math.max(3, size / 9) } = opts;
  ctx.save();
  ctx.font = FONTS.display(size);
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = outline;
  ctx.strokeStyle = '#000';
  ctx.strokeText(text, x, y);
  const g = ctx.createLinearGradient(0, y - size * 0.85, 0, y);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Small keycap / button glyph used for control prompts ("[ENTER] CONFIRM").
export function drawKeyCap(ctx, label, x, y, opts = {}) {
  const { h = 12, color = COLORS.text, bg = 'rgba(255,255,255,0.10)', border = 'rgba(255,255,255,0.35)', font = FONTS.ui(8, 800) } = opts;
  ctx.save();
  ctx.font = font;
  const w = Math.max(h, Math.ceil(ctx.measureText(label).width) + 8);
  ctx.fillStyle = bg;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, 2); ctx.fill(); }
  else ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 2); ctx.stroke(); }
  else ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
  ctx.restore();
  return w;
}

// A row of "[KEY] action" prompts, centred on cx. items = [{ key, label }]
export function drawPromptBar(ctx, items, cx, y, opts = {}) {
  const { gap = 14, font = FONTS.ui(8, 700), color = COLORS.textDim } = opts;
  ctx.save();
  ctx.font = font;
  const widths = items.map(it => {
    ctx.font = FONTS.ui(8, 800);
    const kw = Math.max(12, Math.ceil(ctx.measureText(it.key).width) + 8);
    ctx.font = font;
    return kw + 4 + ctx.measureText(it.label).width;
  });
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - total / 2;
  items.forEach((it, i) => {
    const kw = drawKeyCap(ctx, it.key, x, y - 9);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.label, x + kw + 4, y - 3);
    x += widths[i] + gap;
  });
  ctx.restore();
}

// Shared animated backdrop: ink gradient, faint diagonal hatching, drifting embers.
export function drawBackdrop(ctx, W, H, time, opts = {}) {
  const { tint = COLORS.crimsonDeep, embers = true, vignette = true } = opts;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#09070d');
  g.addColorStop(1, '#030305');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.5, H * 1.05, 10, W * 0.5, H * 1.05, W * 0.75);
  glow.addColorStop(0, hexToRgba(tint, 0.55));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  const off = (time * 0.25) % 24;
  for (let x = -H; x < W + H; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + off, 0);
    ctx.lineTo(x + off - H * 0.6, H);
    ctx.stroke();
  }
  ctx.restore();

  if (embers) {
    for (let i = 0; i < 36; i++) {
      const ex = (i * 97.3 + Math.sin(time * 0.015 + i) * 20 + W * 2) % W;
      const ey = H - ((time * (0.25 + (i % 5) * 0.12) + i * 53) % (H + 20));
      ctx.globalAlpha = 0.15 + (i % 4) * 0.1;
      ctx.fillStyle = i % 3 === 0 ? COLORS.gold : COLORS.ember;
      ctx.fillRect(ex, ey, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
  }

  if (vignette) drawVignette(ctx, W, H, 0.7);
}

export function drawVignette(ctx, W, H, strength = 0.6) {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// Header strip used by menu screens: title on the left, optional back hint.
export function drawScreenHeader(ctx, W, title, subtitle = '', time = 0) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, 40);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 46);
  // red slash accent
  ctx.fillStyle = COLORS.crimson;
  slantPath(ctx, 18, 14, 6, 22, 3);
  ctx.fill();
  drawText(ctx, title, 32, 33, { font: FONTS.display(24), color: COLORS.text, outline: 4 });
  if (subtitle) {
    ctx.font = FONTS.display(24);
    const tw = ctx.measureText(title).width;
    drawText(ctx, subtitle, 32 + tw + 12, 32, { font: FONTS.ui(9, 700), color: COLORS.gold, letterSpacing: 1.5 });
  }
  // hairline
  const lg = ctx.createLinearGradient(0, 0, W, 0);
  lg.addColorStop(0, hexToRgba(COLORS.gold, 0.8));
  lg.addColorStop(0.6, hexToRgba(COLORS.gold, 0.15));
  lg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(18, 42, W - 36, 1);
  ctx.restore();
}

export function hexToRgba(hex, a = 1) {
  if (!hex || hex[0] !== '#') return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// Stat pips (e.g. POWER ■■■■□)
export function drawStatPips(ctx, x, y, value, max = 5, opts = {}) {
  const { w = 14, h = 5, gap = 2, on = COLORS.gold, off = 'rgba(255,255,255,0.12)', slant = 2 } = opts;
  for (let i = 0; i < max; i++) {
    ctx.fillStyle = i < value ? on : off;
    slantPath(ctx, x + i * (w + gap), y, w, h, slant);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Front-end helpers (menus, select screens, VS). Append-only additions.
// ---------------------------------------------------------------------------

// Frame-rate independent-ish smoothing toward a target (call once per frame).
export function approach(current, target, k = 0.25) {
  if (current === undefined || current === null || isNaN(current)) return target;
  const v = current + (target - current) * k;
  return Math.abs(target - v) < 0.05 ? target : v;
}

// Word-wrap a string into lines that fit maxW with the ctx's current font.
export function wrapLines(ctx, text, maxW) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Strips leading emoji / symbols from legacy labels ("🏆 CAMPAIGN" -> "CAMPAIGN").
export function cleanLabel(text) {
  return String(text || '').replace(/^[^A-Za-z0-9?]+/, '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
}

// Four L-shaped corner brackets around a rect (selection cursor look).
export function drawCornerBrackets(ctx, x, y, w, h, opts = {}) {
  const { color = COLORS.gold, len = 6, lw = 2, alpha = 1, glow = null } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 10; }
  const o = lw / 2;
  const L = Math.min(len, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + o, y + L); ctx.lineTo(x + o, y + o); ctx.lineTo(x + L, y + o);
  ctx.moveTo(x + w - L, y + o); ctx.lineTo(x + w - o, y + o); ctx.lineTo(x + w - o, y + L);
  ctx.moveTo(x + w - o, y + h - L); ctx.lineTo(x + w - o, y + h - o); ctx.lineTo(x + w - L, y + h - o);
  ctx.moveTo(x + L, y + h - o); ctx.lineTo(x + o, y + h - o); ctx.lineTo(x + o, y + h - L);
  ctx.stroke();
  ctx.restore();
}

// Small letter-spaced caption with a short accent tick in front of it.
export function drawLabel(ctx, text, x, y, opts = {}) {
  const { color = COLORS.gold, size = 8, align = 'left', tick = true, alpha = 1, spacing = 1.5 } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  let tx = x;
  if (tick && align === 'left') {
    ctx.fillStyle = color;
    slantPath(ctx, x, y - size + 1, 4, size - 1, 2);
    ctx.fill();
    tx = x + 8;
  }
  drawText(ctx, text, tx, y, { font: FONTS.ui(size, 800), color, align, letterSpacing: spacing });
  ctx.restore();
}

// Tinted silhouette of a sprite (cached). Used for rim lights, locked fighters and VS echoes.
const _silCache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
export function getSilhouette(img, color) {
  if (!img || !img.width || typeof document === 'undefined' || !_silCache) return null;
  let byColor = _silCache.get(img);
  if (!byColor) { byColor = new Map(); _silCache.set(img, byColor); }
  let c = byColor.get(color);
  if (c) return c;
  try {
    c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    byColor.set(color, c);
    return c;
  } catch (e) {
    return null;
  }
}

// Lit platform (shadow + glowing team-coloured disc) a fighter stands on.
export function drawPlatform(ctx, cx, groundY, rx, color, time = 0, opts = {}) {
  const { alpha = 1, beam = true } = opts;
  const ry = Math.max(4, rx * 0.17);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (beam) {
    // soft light column from above
    const bg = ctx.createLinearGradient(0, groundY - rx * 3.2, 0, groundY);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, hexToRgba(color, 0.16));
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.45, groundY - rx * 3.2);
    ctx.lineTo(cx + rx * 0.45, groundY - rx * 3.2);
    ctx.lineTo(cx + rx, groundY);
    ctx.lineTo(cx - rx, groundY);
    ctx.closePath();
    ctx.fill();
  }
  // floor glow
  const g = ctx.createRadialGradient(cx, groundY, 1, cx, groundY, rx * 1.25);
  g.addColorStop(0, hexToRgba(color, 0.55));
  g.addColorStop(0.5, hexToRgba(color, 0.18));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.save();
  ctx.translate(cx, groundY);
  ctx.scale(1, ry / rx);
  ctx.beginPath();
  ctx.arc(0, 0, rx * 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // contact shadow
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY, rx * 0.55, ry * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // rim ring
  const pulse = 0.55 + Math.sin(time * 0.06) * 0.2;
  ctx.strokeStyle = hexToRgba(color, pulse);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// Draws a fighter frame (80x90 sprite, feet at local (0,0) when drawn at -40,-88)
// with a team-coloured rim light. opts.silhouette draws it as a dark locked shape.
export function drawFighterSprite(ctx, img, cx, groundY, scale, opts = {}) {
  const { mirror = false, rim = null, alpha = 1, silhouette = false, glow = 10 } = opts;
  if (!img || !img.width) return false;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, groundY);
  if (mirror) ctx.scale(-1, 1);
  ctx.scale(scale, scale);
  const ox = -img.width / 2, oy = -88;
  if (rim) {
    const sil = getSilhouette(img, rim);
    if (sil) {
      ctx.save();
      ctx.shadowColor = rim;
      ctx.shadowBlur = glow * 2;
      ctx.globalAlpha *= 0.9;
      ctx.drawImage(sil, ox - 1, oy - 0.5);
      ctx.drawImage(sil, ox + 1, oy - 0.5);
      ctx.restore();
    }
  }
  if (silhouette) {
    const dark = getSilhouette(img, '#0b0910');
    if (dark) ctx.drawImage(dark, ox, oy);
  } else {
    ctx.drawImage(img, ox, oy);
  }
  ctx.restore();
  return true;
}

// Primary call-to-action button: slanted crimson bar with a gold edge and keycap.
export function drawActionButton(ctx, x, y, w, h, label, opts = {}) {
  const { key = 'ENTER', time = 0, color = COLORS.crimson, deep = COLORS.crimsonDeep, textColor = COLORS.text, disabled = false, size = 11 } = opts;
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, disabled ? '#2a2630' : color);
  g.addColorStop(1, disabled ? '#16141b' : deep);
  slantPath(ctx, x, y, w, h, h * 0.45);
  ctx.fillStyle = g;
  ctx.fill();
  // moving sheen
  if (!disabled) {
    ctx.save();
    slantPath(ctx, x, y, w, h, h * 0.45);
    ctx.clip();
    const sx = x - 60 + ((time * 2.2) % (w + 160));
    const sg = ctx.createLinearGradient(sx, 0, sx + 50, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  ctx.fillStyle = disabled ? 'rgba(255,255,255,0.15)' : COLORS.gold;
  ctx.fillRect(x + h * 0.45, y, w - h * 0.45, 1);
  ctx.font = FONTS.display(size);
  const lw = ctx.measureText(label).width;
  let kw = 0;
  if (key) {
    ctx.font = FONTS.ui(8, 800);
    kw = Math.max(12, Math.ceil(ctx.measureText(key).width) + 8) + 6;
  }
  const total = kw + lw;
  let tx = x + w / 2 - total / 2;
  if (key) {
    drawKeyCap(ctx, key, tx, y + h / 2 - 6, { bg: 'rgba(0,0,0,0.35)', border: 'rgba(255,255,255,0.45)' });
    tx += kw;
  }
  drawText(ctx, label, tx, y + h / 2 + size * 0.36, { font: FONTS.display(size), color: textColor, shadow: { color: 'rgba(0,0,0,0.5)', x: 1, y: 1 } });
  ctx.restore();
}

// Status strip (same footprint as an action button) for waiting / locked states.
export function drawStatusBar(ctx, x, y, w, h, text, opts = {}) {
  const { color = COLORS.p1, time = 0, size = 9 } = opts;
  ctx.save();
  slantPath(ctx, x, y, w, h, h * 0.45);
  ctx.fillStyle = 'rgba(8,8,14,0.88)';
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, 0.55 + Math.sin(time * 0.1) * 0.25);
  ctx.lineWidth = 1;
  ctx.stroke();
  drawText(ctx, text, x + w / 2, y + h / 2 + size * 0.36, { font: FONTS.ui(size, 800), color, align: 'center', letterSpacing: 1, maxWidth: w - h });
  ctx.restore();
}

// Compact "[KEY] LABEL" chip used for header buttons (back / admin). Returns its width.
export function drawChip(ctx, x, y, w, h, key, label, opts = {}) {
  const { color = COLORS.textDim, border = 'rgba(255,255,255,0.18)', fill = 'rgba(10,10,16,0.75)', hot = false } = opts;
  ctx.save();
  slantPath(ctx, x, y, w, h, 5);
  ctx.fillStyle = hot ? hexToRgba(COLORS.crimson, 0.35) : fill;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = FONTS.ui(8, 800);
  const kw = key ? Math.max(12, Math.ceil(ctx.measureText(key).width) + 8) : 0;
  ctx.font = FONTS.ui(8, 800);
  // account for the 1px letter spacing used when drawing the label
  const lw = ctx.measureText(label).width + Math.max(0, label.length - 1);
  const total = kw + (key ? 5 : 0) + lw;
  let tx = x + w / 2 - total / 2;
  if (key) { drawKeyCap(ctx, key, tx, y + h / 2 - 6); tx += kw + 5; }
  drawText(ctx, label, tx, y + h / 2 + 3, { font: FONTS.ui(8, 800), color, letterSpacing: 1 });
  ctx.restore();
}
