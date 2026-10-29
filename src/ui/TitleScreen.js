// Final Impact - Title Screen
// Slash + impact-flash intro, gold→crimson slanted logo, single "press start" prompt.
import { input } from '../engine/Input.js';
import {
  COLORS, FONTS, ease, drawText, drawTitleText, drawKeyCap, drawBackdrop, drawVignette, hexToRgba, slantPath
} from './Theme.js';

const INTRO = 34;      // frames until the logo has fully landed
const SLASH_END = 12;  // slash streak finishes, impact happens here

export class TitleScreen {
  constructor() {
    this.time = 0;
    this._logo = null;      // cached logo bitmap (2x)
    this._glint = null;     // scratch canvas for the glint pass
  }

  hasGamepad() {
    try { return input.hasGamepadConnected(); } catch (e) { return false; }
  }

  // Bake the logo once into an offscreen canvas so we can shine a glint across it.
  buildLogo(W) {
    if (typeof document === 'undefined') return null;
    try {
      const S = 2;
      const c = document.createElement('canvas');
      c.width = W * S;
      c.height = 170 * S;
      const x = c.getContext('2d');
      x.scale(S, S);
      x.translate(W / 2, 0);
      x.transform(1, 0, -0.2, 1, 0, 0);
      // FINAL (smaller, sits on top-left of IMPACT)
      drawTitleText(x, 'FINAL', -6, 66, 50, { outline: 7 });
      // IMPACT (hero word)
      drawTitleText(x, 'IMPACT', 10, 138, 86, { outline: 9, top: '#fff3c4', mid: COLORS.gold, bottom: COLORS.crimson });
      this._logo = c;
      this._glint = document.createElement('canvas');
      this._glint.width = c.width;
      this._glint.height = c.height;
      return c;
    } catch (e) {
      return null;
    }
  }

  drawLogo(ctx, W, y, t) {
    const logo = this._logo || this.buildLogo(W);
    const k = Math.min(1, Math.max(0, (t - SLASH_END) / (INTRO - SLASH_END)));
    if (t < SLASH_END) return;
    const scale = 1.35 - 0.35 * ease.outBack(k);
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 3);
    ctx.translate(W / 2, y + 85);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -85);
    if (logo) {
      // periodic glint sweep across the letters
      const cycle = (t - INTRO) % 240;
      if (cycle > 0 && cycle < 50 && this._glint) {
        const g = this._glint.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'source-over';
        g.clearRect(0, 0, this._glint.width, this._glint.height);
        g.drawImage(logo, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        const gx = (cycle / 50) * (this._glint.width + 400) - 200;
        const gr = g.createLinearGradient(gx - 70, 0, gx + 70, 0);
        gr.addColorStop(0, 'rgba(255,255,255,0)');
        gr.addColorStop(0.5, 'rgba(255,250,225,0.75)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, this._glint.width, this._glint.height);
        ctx.drawImage(this._glint, 0, 0, W, 170);
      } else {
        ctx.drawImage(logo, 0, 0, W, 170);
      }
    } else {
      ctx.save();
      ctx.translate(W / 2, 0);
      ctx.transform(1, 0, -0.2, 1, 0, 0);
      drawTitleText(ctx, 'FINAL', -6, 66, 50);
      drawTitleText(ctx, 'IMPACT', 10, 138, 86);
      ctx.restore();
    }
    ctx.restore();
  }

  render(ctx, W, H) {
    this.time++;
    const t = this.time;
    const cx = W / 2;

    // Screen shake for a few frames right after the impact
    ctx.save();
    if (t >= SLASH_END && t < SLASH_END + 12) {
      const k = (SLASH_END + 12 - t) * 0.45;
      ctx.translate(Math.sin(t * 7.3) * k, Math.cos(t * 5.1) * k);
    }

    drawBackdrop(ctx, W, H, t, { tint: COLORS.crimsonDeep, vignette: false });

    // Eclipse sun behind the logo
    const pulse = ease.pulse(t, 0.03);
    const sunY = 140;
    const sun = ctx.createRadialGradient(cx, sunY, 8, cx, sunY, 220);
    sun.addColorStop(0, hexToRgba(COLORS.gold, 0.32 + pulse * 0.08));
    sun.addColorStop(0.25, hexToRgba(COLORS.crimson, 0.22));
    sun.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = hexToRgba(COLORS.gold, 0.18 + pulse * 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, sunY, 96 + pulse * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(COLORS.crimson, 0.14);
    ctx.beginPath();
    ctx.arc(cx, sunY, 118, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Layered mountain silhouettes for depth
    const ridge = (base, amp, seed, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) {
        const y = base - Math.abs(Math.sin(x * 0.011 + seed) * amp) - Math.abs(Math.sin(x * 0.031 + seed * 2)) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    };
    ridge(282, 46, 1.3, '#16070b');
    ridge(310, 30, 4.1, '#0c0407');
    const fog = ctx.createLinearGradient(0, 250, 0, H);
    fog.addColorStop(0, 'rgba(0,0,0,0)');
    fog.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 250, W, H - 250);

    drawVignette(ctx, W, H, 0.75);

    // ---- Logo ----
    const logoY = 50;
    this.drawLogo(ctx, W, logoY, t);

    // Tagline with rules either side
    const tagA = ease.outCubic((t - INTRO + 4) / 20);
    if (tagA > 0) {
      const ty = 214;
      const ruleW = 70 * tagA;
      ctx.save();
      ctx.globalAlpha = tagA;
      ctx.fillStyle = hexToRgba(COLORS.gold, 0.6);
      ctx.fillRect(cx - 98 - ruleW, ty - 3, ruleW, 1);
      ctx.fillRect(cx + 98, ty - 3, ruleW, 1);
      drawText(ctx, 'THE ULTIMATE TOURNAMENT', cx, ty, {
        font: FONTS.ui(9, 800), color: COLORS.goldPale, align: 'center', letterSpacing: 3
      });
      ctx.restore();
    }

    // ---- Press start ----
    const promptA = ease.outCubic((t - INTRO - 10) / 18);
    if (promptA > 0) {
      const py = 280;
      const breathe = 0.6 + ease.pulse(t, 0.07) * 0.4;
      ctx.save();
      ctx.globalAlpha = promptA;
      // soft band
      const band = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0);
      band.addColorStop(0, 'rgba(0,0,0,0)');
      band.addColorStop(0.5, 'rgba(0,0,0,0.55)');
      band.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = band;
      ctx.fillRect(cx - 150, py - 16, 300, 26);
      ctx.fillStyle = hexToRgba(COLORS.crimson, 0.7 * breathe);
      ctx.fillRect(cx - 110, py + 10, 220, 1);

      const gp = this.hasGamepad();
      const keyLabel = gp ? 'START' : 'ENTER';
      const before = 'PRESS';
      const after = 'TO BEGIN';
      ctx.font = FONTS.display(14);
      const bw = ctx.measureText(before).width;
      const aw = ctx.measureText(after).width;
      ctx.font = FONTS.ui(8, 800);
      const kw = Math.max(12, Math.ceil(ctx.measureText(keyLabel).width) + 10);
      const gap = 8;
      const total = bw + gap + kw + gap + aw;
      let x = cx - total / 2;
      ctx.globalAlpha = promptA * breathe;
      drawText(ctx, before, x, py + 3, { font: FONTS.display(14), color: COLORS.text, outline: 3 });
      x += bw + gap;
      drawKeyCap(ctx, keyLabel, x, py - 8, { h: 14, font: FONTS.ui(8, 800), bg: hexToRgba(COLORS.gold, 0.18), border: COLORS.gold, color: COLORS.goldPale });
      x += kw + gap;
      drawText(ctx, after, x, py + 3, { font: FONTS.display(14), color: COLORS.text, outline: 3 });
      ctx.restore();
    }

    // ---- Footer ----
    const footA = ease.outCubic((t - INTRO - 16) / 20);
    if (footA > 0) {
      ctx.save();
      ctx.globalAlpha = footA;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(18, H - 22, W - 36, 1);
      drawText(ctx, '© 2026 FINAL IMPACT ARCADE', 20, H - 9, { font: FONTS.ui(8, 700), color: COLORS.textMute, letterSpacing: 1 });
      drawText(ctx, 'WASD MOVE   ·   U I O PUNCH   ·   J K L KICK   ·   P MOVE LIST', cx, H - 9, {
        font: FONTS.ui(8, 700), color: COLORS.textDim, align: 'center', letterSpacing: 0.5
      });
      const gp = this.hasGamepad();
      ctx.fillStyle = gp ? COLORS.good : COLORS.textMute;
      ctx.beginPath();
      ctx.arc(W - 86, H - 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
      drawText(ctx, gp ? 'GAMEPAD READY' : 'KEYBOARD', W - 20, H - 9, {
        font: FONTS.ui(8, 700), color: gp ? COLORS.good : COLORS.textMute, align: 'right', letterSpacing: 1
      });
      ctx.restore();
    }

    ctx.restore(); // shake

    // ---- Intro: black, then a blade slash, then a white impact flash ----
    if (t < SLASH_END + 14) {
      if (t < SLASH_END) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        const k = ease.outCubic(t / (SLASH_END - 2));
        const x0 = -40, y0 = 210, x1 = W + 40, y1 = 70;
        const hx = x0 + (x1 - x0) * k, hy = y0 + (y1 - y0) * k;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.shadowColor = COLORS.gold;
        ctx.shadowBlur = 18;
        const sg = ctx.createLinearGradient(x0, y0, hx, hy);
        sg.addColorStop(0, 'rgba(229,36,59,0)');
        sg.addColorStop(0.7, COLORS.crimson);
        sg.addColorStop(1, '#fffbe8');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.restore();
      } else {
        // flash + a fading slash scar across the screen
        const f = 1 - (t - SLASH_END) / 14;
        ctx.save();
        ctx.fillStyle = `rgba(255, 246, 220, ${f * 0.85})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = f;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-40, 210 - 2);
        ctx.lineTo(W + 40, 70 - 3 * f);
        ctx.lineTo(W + 40, 70 + 3 * f);
        ctx.lineTo(-40, 210 + 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
