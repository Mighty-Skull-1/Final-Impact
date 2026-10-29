// Final Impact - Versus Intro Screen (split-diagonal "VS" splash before round 1)
import { soundFX } from '../audio/SoundFX.js';
import { input } from '../engine/Input.js';
import { getFighterCatalogEntry } from '../fighters/FighterCatalog.js';
import {
  COLORS, FONTS, ease, hexToRgba, slantPath,
  drawText, drawTitleText, drawKeyCap, drawVignette, drawFighterSprite, getSilhouette
} from './Theme.js';

const easeOutCubic = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const SLAM = 40;      // frame the VS lands
const SLANT = 46;     // half-width of the diagonal split at top/bottom

export class VersusScreen {
  constructor() {
    this.active = false;
    this.t = 0;
    this.duration = 150;
    this.data = null;
  }

  start(data = {}) {
    this.active = true;
    this.t = 0;
    this.duration = data.duration || 150;
    this.data = data;
    this.slammed = false;
  }

  skip() {
    if (this.active && this.t > 30) {
      this.t = Math.max(this.t, this.duration - 12);
      return true;
    }
    return false;
  }

  // Returns true when the intro has finished
  update() {
    if (!this.active) return true;
    this.t++;
    if (!this.slammed && this.t >= SLAM) {
      this.slammed = true;
      try { soundFX.playUltimateActivation && soundFX.playUltimateActivation(); } catch (e) {}
    }
    if (this.t >= this.duration) {
      this.active = false;
      return true;
    }
    return false;
  }

  getSprite(fighter) {
    if (!fighter || !fighter.sprites) return null;
    const s = fighter.sprites;
    const frames = s.IDLE || s.idle || [];
    if (!frames.length) return null;
    return frames[Math.floor(this.t / 10) % frames.length];
  }

  catalogEntry(fighter) {
    try { return fighter && fighter.id ? getFighterCatalogEntry(fighter.id) : null; } catch (e) { return null; }
  }

  // Path of one half of the split (left = P1 side)
  sidePath(ctx, side, W, H, offset) {
    const mid = W / 2;
    ctx.beginPath();
    if (side === 'left') {
      ctx.moveTo(-10 + offset, 0);
      ctx.lineTo(mid + SLANT + offset, 0);
      ctx.lineTo(mid - SLANT + offset, H);
      ctx.lineTo(-10 + offset, H);
    } else {
      ctx.moveTo(mid + SLANT + offset, 0);
      ctx.lineTo(W + 10 + offset, 0);
      ctx.lineTo(W + 10 + offset, H);
      ctx.lineTo(mid - SLANT + offset, H);
    }
    ctx.closePath();
  }

  drawSide(ctx, side, W, H, t) {
    const left = side === 'left';
    const k = easeOutCubic(t / 18);
    const offset = (1 - k) * (left ? -W * 0.65 : W * 0.65);
    const color = left ? COLORS.p1 : COLORS.p2;
    const deep = left ? COLORS.p1Deep : COLORS.p2Deep;

    ctx.save();
    this.sidePath(ctx, side, W, H, offset);
    const g = ctx.createLinearGradient(left ? 0 : W, 0, W / 2, 0);
    g.addColorStop(0, hexToRgba(deep, 0.78));
    g.addColorStop(1, hexToRgba(deep, 0.35));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    // speed lines streaking toward the centre
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = color;
    for (let i = 0; i < 14; i++) {
      const y = (i * 53 + 17) % H;
      const len = 60 + (i % 4) * 40;
      const speed = 6 + (i % 3) * 3;
      const span = W / 2 + len;
      let x = ((t * speed + i * 97) % span);
      x = left ? x - len : W - x;
      ctx.fillRect(x + offset, y, len, i % 3 === 0 ? 2 : 1);
    }
    ctx.restore();
  }

  drawFighter(ctx, fighter, side, W, H, t) {
    const left = side === 'left';
    const img = this.getSprite(fighter);
    const color = left ? COLORS.p1 : COLORS.p2;
    const k = easeOutCubic((t - 6) / 26);
    const baseX = left ? W * 0.25 : W * 0.75;
    const drift = Math.min(1, Math.max(0, (t - 32) / 120)) * 6 * (left ? 1 : -1);
    const slide = (1 - k) * (left ? -W * 0.5 : W * 0.5);
    const x = baseX + slide + drift;
    const groundY = H - 8;

    if (img && img.height) {
      // big team-coloured echo silhouette behind, lagging the fighter
      const ek = easeOutCubic((t - 2) / 34);
      const ex = baseX + (1 - ek) * (left ? -W * 0.6 : W * 0.6) + (left ? -38 : 38) - drift * 2;
      const sil = getSilhouette(img, color);
      if (sil) {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.imageSmoothingEnabled = false;
        ctx.translate(ex, groundY + 24);
        if (!left) ctx.scale(-1, 1);
        ctx.scale(3.9, 3.9);
        ctx.drawImage(sil, -img.width / 2, -88);
        ctx.restore();
      }
      // floor glow
      const fg = ctx.createRadialGradient(x, groundY, 2, x, groundY, 120);
      fg.addColorStop(0, hexToRgba(color, 0.35));
      fg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(x - 130, groundY - 50, 260, 60);
      drawFighterSprite(ctx, img, x, groundY, 2.9, { mirror: !left, rim: color, glow: 12 });
    } else {
      // Fallback silhouette when a fighter has no sprite sheet
      ctx.save();
      ctx.fillStyle = left ? COLORS.p1Deep : COLORS.p2Deep;
      slantPath(ctx, x - 34, groundY - 200, 68, 200, 10);
      ctx.fill();
      ctx.restore();
      drawText(ctx, '?', x, groundY - 90, { font: FONTS.display(54), color: COLORS.text, align: 'center' });
    }
  }

  drawNameBlock(ctx, fighter, fallbackName, tag, side, W, H, t) {
    const left = side === 'left';
    const color = left ? COLORS.p1 : COLORS.p2;
    const k = easeOutCubic((t - 16) / 22);
    if (k <= 0) return;
    const slide = (1 - k) * (left ? -160 : 160);
    const name = String((fighter && fighter.name) || fallbackName || '???').toUpperCase();
    const entry = this.catalogEntry(fighter);
    const title = entry && entry.title ? entry.title : '';
    const x = (left ? 22 : W - 22) + slide;
    const align = left ? 'left' : 'right';

    ctx.save();
    ctx.globalAlpha = k;
    // tag chip + title
    ctx.font = FONTS.ui(8, 800);
    const tw = ctx.measureText(tag).width + 14;
    const cx = left ? x : x - tw;
    ctx.fillStyle = color;
    slantPath(ctx, cx, H - 66, tw, 12, 4);
    ctx.fill();
    drawText(ctx, tag, cx + tw / 2, H - 57, { font: FONTS.ui(8, 800), color: '#08080c', align: 'center', letterSpacing: 1 });
    if (title) {
      drawText(ctx, title, left ? cx + tw + 7 : cx - 7, H - 57, { font: FONTS.ui(8, 800), color: COLORS.gold, align, letterSpacing: 1.5, outline: 2.5 });
    }
    drawText(ctx, name, x, H - 22, {
      font: FONTS.display(36), color: '#fff', align, outline: 5, maxWidth: W * 0.42,
      shadow: { color: hexToRgba(color, 0.55), x: left ? 3 : -3, y: 2 }
    });
    // underline accent
    const lw = Math.min(W * 0.36, 180) * k;
    ctx.fillStyle = color;
    ctx.fillRect(left ? x : x - lw, H - 15, lw, 2);
    ctx.restore();
  }

  drawVS(ctx, W, H, t) {
    if (t < SLAM) return;
    const cx = W / 2, cy = H / 2 - 18;
    const k = Math.min(1, (t - SLAM) / 10);
    const scale = (2.8 - 1.8 * ease.outBack(k)) * (1 + Math.sin(t * 0.16) * 0.02);

    // shockwave rings
    const rk = (t - SLAM) / 22;
    if (rk < 1) {
      ctx.save();
      ctx.strokeStyle = `rgba(255, 236, 190, ${1 - rk})`;
      ctx.lineWidth = 3 * (1 - rk) + 0.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 30 + rk * 260, 18 + rk * 150, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = hexToRgba(COLORS.crimson, (1 - rk) * 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 20 + rk * 170, 12 + rk * 100, 0, 0, Math.PI * 2);
      ctx.stroke();
      // spark rays
      ctx.strokeStyle = `rgba(255, 220, 140, ${(1 - rk) * 0.9})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + 0.2;
        const r0 = 30 + rk * 120, r1 = r0 + 20 + (i % 3) * 14;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.6);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.6);
        ctx.stroke();
      }
      ctx.restore();
    }

    // dark burst behind the letters
    const bg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 90);
    bg.addColorStop(0, 'rgba(0,0,0,0.6)');
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(cx - 100, cy - 90, 200, 180);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = Math.min(1, k * 2.5);
    drawTitleText(ctx, 'VS', 4, 28, 80, { outline: 10 });
    ctx.restore();
  }

  render(ctx, W, H, stage = null, cameraX = 0) {
    if (!this.data) return;
    const d = this.data;
    const t = this.t;

    // Backdrop: the actual arena, heavily dimmed
    if (stage) {
      try { stage.render(ctx, cameraX, W, H); } catch (e) { ctx.fillStyle = COLORS.ink; ctx.fillRect(0, 0, W, H); }
    } else {
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = 'rgba(6, 5, 10, 0.72)';
    ctx.fillRect(0, 0, W, H);

    // Slam shake window
    ctx.save();
    if (t >= SLAM && t < SLAM + 14) {
      const s = (SLAM + 14 - t) * 0.5;
      ctx.translate(Math.sin(t * 9.1) * s, Math.cos(t * 7.7) * s);
    }

    // Split panels
    this.drawSide(ctx, 'left', W, H, t);
    this.drawSide(ctx, 'right', W, H, t);

    // Fighters
    this.drawFighter(ctx, d.f1, 'left', W, H, t);
    this.drawFighter(ctx, d.f2, 'right', W, H, t);

    // Centre slash (drawn after fighters so it reads as the dividing blade)
    const sk = easeOutCubic((t - 10) / 14);
    if (sk > 0) {
      const x0 = W / 2 + SLANT, x1 = W / 2 - SLANT;
      const ex = x0 + (x1 - x0) * sk, ey = H * sk;
      ctx.save();
      ctx.shadowColor = COLORS.gold;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = COLORS.goldPale;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }

    // Bottom shade so the name blocks stay legible over the fighters
    const shade = ctx.createLinearGradient(0, H - 100, 0, H);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = shade;
    ctx.fillRect(-20, H - 100, W + 40, 120);

    // Name blocks
    const p1Tag = d.p1Label || 'P1';
    const p2Tag = d.p2Label || 'P2';
    this.drawNameBlock(ctx, d.f1, d.p1Label, p1Tag === 'P1' ? 'PLAYER 1' : p1Tag, 'left', W, H, t);
    this.drawNameBlock(ctx, d.f2, d.p2Label, p2Tag === 'P2' ? 'PLAYER 2' : p2Tag, 'right', W, H, t);

    // VS emblem
    this.drawVS(ctx, W, H, t);

    // Top: mode / stage label + arena name
    const topK = easeOutCubic(t / 24);
    if (d.topLabel) {
      ctx.save();
      ctx.font = FONTS.display(12);
      const lw = ctx.measureText(d.topLabel).width + 34;
      const y = 12 + (1 - topK) * -30;
      slantPath(ctx, W / 2 - lw / 2, y, lw, 18, 7);
      ctx.fillStyle = COLORS.crimson;
      ctx.fill();
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(W / 2 - lw / 2 + 7, y, lw - 7, 1);
      drawText(ctx, d.topLabel, W / 2, y + 13.5, { font: FONTS.display(12), color: '#fff', align: 'center', letterSpacing: 1 });
      ctx.restore();
    }
    if (d.stageName) {
      const ak = easeOutCubic((t - 18) / 26);
      ctx.save();
      ctx.globalAlpha = ak;
      drawText(ctx, String(d.stageName).toUpperCase(), W / 2, 46 + (1 - ak) * 6, {
        font: FONTS.ui(10, 800), color: COLORS.text, align: 'center', letterSpacing: 2.5, outline: 3
      });
      if (d.stageLocation) {
        drawText(ctx, d.stageLocation, W / 2, 58 + (1 - ak) * 6, {
          font: FONTS.ui(8, 600), color: COLORS.textDim, align: 'center', letterSpacing: 1, outline: 2
        });
      }
      ctx.restore();
    }
    ctx.restore(); // shake

    drawVignette(ctx, W, H, 0.45);

    // Impact flash on VS slam
    if (t >= SLAM && t < SLAM + 9) {
      ctx.fillStyle = `rgba(255, 248, 230, ${((SLAM + 9 - t) / 9) * 0.85})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Opening fade from black
    if (t < 10) {
      ctx.fillStyle = `rgba(0, 0, 0, ${1 - t / 10})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Final fade to the fight
    const remaining = this.duration - t;
    if (remaining < 14) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(14 - remaining) / 14})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Skip hint
    if (t > 30) {
      const hk = easeOutCubic((t - 30) / 12) * (remaining < 14 ? remaining / 14 : 1);
      let gp = false;
      try { gp = input.hasGamepadConnected(); } catch (e) {}
      ctx.save();
      ctx.globalAlpha = hk * 0.85;
      ctx.font = FONTS.ui(8, 800);
      const key = gp ? 'A' : 'ENTER';
      const kw = Math.max(12, Math.ceil(ctx.measureText(key).width) + 8);
      const lx = W - 16 - 26;
      drawKeyCap(ctx, key, lx - kw - 5, 12);
      drawText(ctx, 'SKIP', W - 16, 21, { font: FONTS.ui(8, 800), color: COLORS.textDim, align: 'right', letterSpacing: 1.5 });
      ctx.restore();
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
