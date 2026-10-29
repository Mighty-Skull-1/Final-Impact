// Final Impact - Battleground Select Screen (Mortal Kombat style arena picker)
import { Stage } from '../graphics/Stage.js';
import { soundFX } from '../audio/SoundFX.js';
import { input } from '../engine/Input.js';
import {
  COLORS, FONTS, ease, approach, wrapLines, hexToRgba, slantPath,
  drawText, drawLabel, drawBackdrop, drawScreenHeader, drawPromptBar, drawPanel,
  drawCornerBrackets, drawActionButton, drawStatusBar, drawChip
} from './Theme.js';

const MODE_LABELS = {
  cpu: '1V1 VS CPU',
  '2p': '1V1 LOCAL VERSUS',
  '2v2': '2V2 TEAM BRAWL',
  online: 'ONLINE VERSUS',
  training: 'TRAINING DOJO'
};

export class StageSelect {
  constructor(catalog) {
    this.catalog = catalog;
    this.index = 0;
    this.tick = 0;
    this.thumbs = {};
    this.liveStage = null;
    this.liveStageId = null;

    // Match context (set before the screen opens)
    this.mode = 'cpu';
    this.p1Name = 'P1';
    this.p2Name = 'CPU';
    this.canChoose = true; // false for the online challenger (host picks the arena)

    // Layout (640x360 logical canvas) - shared by rendering and hit-testing
    this.layout = {
      preview: { x: 16, y: 54, w: 384, h: 216 },
      info: { x: 412, y: 54, w: 212, h: 216 },
      tileW: 74,
      tileH: 42,
      tileGap: 8,
      tileY: 286,
      back: { x: 640 - 16 - 64, y: 14, w: 64, h: 18 },
      btn: { x: 424, y: 240, w: 188, h: 20 }
    };

    // visual-only animation state
    this._hiX = null;
    this._swapT = -100;
    this._swapDir = 1;
    this._lastPreviewId = null;
    this._lastIndex = 0;
  }

  // Total selectable tiles = every arena + the RANDOM tile
  get count() {
    return this.catalog.length + 1;
  }

  get isRandom() {
    return this.index === this.catalog.length;
  }

  setContext({ mode = 'cpu', p1Name = 'P1', p2Name = 'CPU', canChoose = true } = {}) {
    this.mode = mode;
    this.p1Name = p1Name;
    this.p2Name = p2Name;
    this.canChoose = canChoose;
    this.tick = 0;
    this.liveStage = null;
    this.liveStageId = null;
  }

  setIndex(idx) {
    if (typeof idx !== 'number' || isNaN(idx)) return;
    this.index = ((idx % this.count) + this.count) % this.count;
  }

  move(dir) {
    this.index = (this.index + dir + this.count) % this.count;
    try { soundFX.playWhoosh('light'); } catch (e) {}
  }

  handleInput(inputState) {
    if (!this.canChoose) return false;
    if (inputState.left) {
      this.move(-1);
      return true;
    }
    if (inputState.right) {
      this.move(1);
      return true;
    }
    // Rows are a single strip, so up/down page by half the strip for quick travel
    if (inputState.up) {
      this.move(-4);
      return true;
    }
    if (inputState.down) {
      this.move(4);
      return true;
    }
    return false;
  }

  // Resolve the current tile into a concrete catalog index (RANDOM picks one)
  resolveSelection() {
    if (this.isRandom) {
      return Math.floor(Math.random() * this.catalog.length);
    }
    return this.index;
  }

  getTileX(i, W = 640) {
    const { tileW, tileGap } = this.layout;
    const total = this.count * tileW + (this.count - 1) * tileGap;
    return (W - total) / 2 + i * (tileW + tileGap);
  }

  handleClick(x, y, W = 640, H = 360, callbacks = {}) {
    const { onBack, onConfirm } = callbacks;
    const { back, tileW, tileH, tileY, preview, btn } = this.layout;
    const bx = W - (640 - back.x);

    if (x >= bx - 3 && x <= bx + back.w + 3 && y >= back.y - 3 && y <= back.y + back.h + 3) {
      try { soundFX.playWhoosh('light'); } catch (e) {}
      if (onBack) onBack();
      return true;
    }

    if (!this.canChoose) return false;

    // Arena filmstrip
    if (y >= tileY - 4 && y <= tileY + tileH + 2) {
      for (let i = 0; i < this.count; i++) {
        const tx = this.getTileX(i, W);
        if (x >= tx && x <= tx + tileW) {
          if (this.index === i) {
            if (onConfirm) onConfirm();
          } else {
            this.index = i;
            try { soundFX.playWhoosh('light'); } catch (e) {}
          }
          return true;
        }
      }
    }

    // Clicking the big preview or the fight button confirms
    const inPreview = x >= preview.x && x <= preview.x + preview.w && y >= preview.y && y <= preview.y + preview.h;
    const inBtn = x >= btn.x && x <= btn.x + btn.w && y >= btn.y - 2 && y <= btn.y + btn.h + 2;
    if (inPreview || inBtn) {
      if (onConfirm) onConfirm();
      return true;
    }
    return false;
  }

  // Which arena the big preview shows right now
  getPreviewCatalogIndex() {
    if (this.isRandom) {
      return Math.floor(this.tick / 40) % this.catalog.length;
    }
    return this.index;
  }

  update() {
    this.tick++;
    const entry = this.catalog[this.getPreviewCatalogIndex()];
    if (!entry) return;
    if (this.liveStageId !== entry.id) {
      this.liveStage = new Stage(entry.id);
      this.liveStageId = entry.id;
      // Warm the particles a bit so the preview never starts from a blank state
      for (let i = 0; i < 20; i++) this.liveStage.update();
    }
    if (this.liveStage) this.liveStage.update();
  }

  // Lazily bake one cached thumbnail per call so opening the screen never hitches
  bakeNextThumb() {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
    const next = this.catalog.find(s => !this.thumbs[s.id]);
    if (!next) return;
    try {
      const c = document.createElement('canvas');
      c.width = 168;
      c.height = 95;
      const tctx = c.getContext('2d');
      tctx.imageSmoothingEnabled = false;
      tctx.scale(168 / 640, 95 / 360);
      const st = new Stage(next.id);
      for (let i = 0; i < 40; i++) st.update();
      st.render(tctx, 160, 640, 360);
      this.thumbs[next.id] = c;
    } catch (e) {
      this.thumbs[next.id] = null;
    }
  }

  wrapText(ctx, text, maxWidth) {
    return wrapLines(ctx, text, maxWidth);
  }

  hasGamepad() {
    try { return input.hasGamepadConnected(); } catch (e) { return false; }
  }

  drawBackground(ctx, W, H) {
    drawBackdrop(ctx, W, H, this.tick, { tint: COLORS.crimsonDeep });
  }

  drawPreview(ctx, W, H, accent) {
    const pv = this.layout.preview;
    const t = this.tick;
    const previewEntry = this.catalog[this.getPreviewCatalogIndex()];
    if (previewEntry && previewEntry.id !== this._lastPreviewId) {
      if (this._lastPreviewId !== null) this._swapT = t;
      this._lastPreviewId = previewEntry.id;
    }
    const k = ease.outCubic((t - this._swapT) / 14);

    // drop shadow + frame base
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(pv.x + 3, pv.y + 4, pv.w, pv.h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(pv.x, pv.y, pv.w, pv.h);
    ctx.clip();
    ctx.fillStyle = '#000';
    ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
    ctx.translate(pv.x + (1 - k) * 18 * this._swapDir, pv.y);
    const s = pv.w / 640;
    ctx.scale(s, s);
    if (this.liveStage) {
      const camX = 160 + Math.sin(t * 0.012) * 150;
      try { this.liveStage.render(ctx, camX, 640, 360); } catch (e) {}
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(pv.x, pv.y, pv.w, pv.h);
    ctx.clip();
    // swap flash: quick dark-in plus a light wipe
    if (k < 1) {
      ctx.fillStyle = `rgba(0,0,0,${(1 - k) * 0.85})`;
      ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
      const wx = pv.x + k * (pv.w + 80) - 40;
      const wg = ctx.createLinearGradient(wx - 40, 0, wx + 40, 0);
      wg.addColorStop(0, 'rgba(255,255,255,0)');
      wg.addColorStop(0.5, `rgba(255,240,210,${0.35 * (1 - k)})`);
      wg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = wg;
      ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
    }
    // cinematic grade: bottom fade + soft vignette
    const bg = ctx.createLinearGradient(0, pv.y + pv.h * 0.55, 0, pv.y + pv.h);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = bg;
    ctx.fillRect(pv.x, pv.y, pv.w, pv.h);

    if (this.isRandom) {
      ctx.fillStyle = 'rgba(6,6,10,0.55)';
      ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
      const bob = Math.sin(t * 0.08) * 3;
      drawText(ctx, '?', pv.x + pv.w / 2, pv.y + pv.h / 2 + 26 + bob, {
        font: FONTS.display(84), color: COLORS.gold, align: 'center', outline: 6
      });
      drawText(ctx, 'FATE WILL DECIDE', pv.x + pv.w / 2, pv.y + pv.h / 2 + 50, {
        font: FONTS.ui(9, 800), color: COLORS.goldPale, align: 'center', letterSpacing: 3
      });
    }

    // live tag
    const tagA = 0.6 + Math.sin(t * 0.08) * 0.4;
    ctx.fillStyle = `rgba(229,36,59,${tagA})`;
    ctx.beginPath();
    ctx.arc(pv.x + 12, pv.y + 12, 2.5, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, this.isRandom ? 'SHUFFLE' : 'LIVE', pv.x + 19, pv.y + 15, { font: FONTS.ui(8, 800), color: COLORS.text, letterSpacing: 1.5, outline: 2 });
    ctx.restore();

    // frame
    ctx.strokeStyle = hexToRgba(accent, 0.55);
    ctx.lineWidth = 1;
    ctx.strokeRect(pv.x - 0.5, pv.y - 0.5, pv.w + 1, pv.h + 1);
    drawCornerBrackets(ctx, pv.x - 4, pv.y - 4, pv.w + 8, pv.h + 8, { color: COLORS.gold, len: 10, lw: 2 });
  }

  drawInfo(ctx, W, H, entry, accent) {
    const ip = this.layout.info;
    const t = this.tick;
    const k = ease.outCubic((t - this._swapT) / 14);
    drawPanel(ctx, ip.x, ip.y, ip.w, ip.h, { fill: 'rgba(12, 11, 18, 0.9)', stroke: 'rgba(255,255,255,0.08)' });
    const tg = ctx.createLinearGradient(ip.x, 0, ip.x + ip.w, 0);
    tg.addColorStop(0, accent);
    tg.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = tg;
    ctx.fillRect(ip.x, ip.y, ip.w, 2);

    const x = ip.x + 14;
    const maxW = ip.w - 28;
    ctx.save();
    ctx.globalAlpha = this.isRandom ? 1 : 0.3 + 0.7 * k;
    const ox = this.isRandom ? 0 : (1 - k) * 10;
    drawLabel(ctx, this.isRandom ? 'FATE DECIDES' : `ARENA ${String(this.index + 1).padStart(2, '0')} / ${String(this.catalog.length).padStart(2, '0')}`,
      x, ip.y + 20, { color: accent, size: 8 });
    drawText(ctx, this.isRandom ? 'RANDOM ARENA' : entry.name, x + ox, ip.y + 44, {
      font: FONTS.display(20), color: '#fff', outline: 3, maxWidth: maxW
    });
    drawText(ctx, this.isRandom ? 'Unknown Location' : entry.location, x + ox, ip.y + 57, {
      font: FONTS.ui(9, 700), color: COLORS.gold, maxWidth: maxW
    });
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, ip.y + 66, maxW, 1);
    ctx.fillStyle = accent;
    ctx.fillRect(x, ip.y + 66, 36, 1);

    const blurb = this.isRandom
      ? 'Let the tournament gods choose. Any arena can be drawn - you will not know until the fight begins!'
      : entry.blurb;
    ctx.font = FONTS.ui(9, 600);
    this.wrapText(ctx, blurb, maxW).slice(0, 4).forEach((ln, i) => {
      drawText(ctx, ln, x + ox, ip.y + 83 + i * 12, { font: FONTS.ui(9, 600), color: COLORS.textDim });
    });
    ctx.restore();

    // Matchup
    const my = ip.y + 148;
    drawLabel(ctx, 'MATCHUP', x, my, { color: COLORS.textDim, size: 8 });
    const p1 = String(this.p1Name || 'P1').toUpperCase();
    const p2 = String(this.p2Name || 'CPU').toUpperCase();
    ctx.font = FONTS.display(13);
    const vsW = 22;
    const half = (maxW - vsW) / 2;
    drawText(ctx, p1, x + half, my + 19, { font: FONTS.display(13), color: COLORS.p1, align: 'right', maxWidth: half - 2 });
    drawText(ctx, 'VS', x + half + vsW / 2, my + 19, { font: FONTS.display(11), color: COLORS.gold, align: 'center' });
    drawText(ctx, p2, x + half + vsW, my + 19, { font: FONTS.display(13), color: COLORS.p2, maxWidth: half - 2 });

    // Confirm button / waiting status
    const b = this.layout.btn;
    const bx = W - (640 - b.x);
    if (this.canChoose) {
      drawActionButton(ctx, bx, b.y, b.w, b.h, 'FIGHT HERE', { key: this.hasGamepad() ? 'A' : 'ENTER', time: t, size: 12 });
    } else {
      const dots = '.'.repeat(1 + Math.floor(t / 20) % 3);
      drawStatusBar(ctx, bx, b.y, b.w, b.h, 'HOST IS CHOOSING' + dots, { color: COLORS.p1, time: t, size: 8 });
    }
  }

  drawFilmstrip(ctx, W, H) {
    const L = this.layout;
    const t = this.tick;
    const selX = this.getTileX(this.index, W);
    this._hiX = approach(this._hiX, selX, 0.3);

    for (let i = 0; i < this.count; i++) {
      const tx = this.getTileX(i, W);
      const ty = L.tileY;
      const isSel = i === this.index;
      const isRandTile = i === this.catalog.length;
      const tEntry = isRandTile ? null : this.catalog[i];
      const lift = isSel ? -3 : 0;

      ctx.save();
      ctx.translate(0, lift);
      ctx.beginPath();
      ctx.rect(tx, ty, L.tileW, L.tileH);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#0b0a10';
      ctx.fillRect(tx, ty, L.tileW, L.tileH);
      if (isRandTile) {
        const cyc = this.catalog[Math.floor(t / 12) % this.catalog.length];
        const th = cyc && this.thumbs[cyc.id];
        if (th) {
          ctx.globalAlpha = 0.35;
          ctx.drawImage(th, tx, ty, L.tileW, L.tileH);
          ctx.globalAlpha = 1;
        }
        drawText(ctx, '?', tx + L.tileW / 2, ty + L.tileH / 2 + 8, { font: FONTS.display(24), color: COLORS.gold, align: 'center', outline: 3 });
      } else {
        const th = this.thumbs[tEntry.id];
        if (th) ctx.drawImage(th, tx, ty, L.tileW, L.tileH);
      }
      // name strip
      const ng = ctx.createLinearGradient(0, ty + L.tileH - 16, 0, ty + L.tileH);
      ng.addColorStop(0, 'rgba(0,0,0,0)');
      ng.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = ng;
      ctx.fillRect(tx, ty + L.tileH - 16, L.tileW, 16);
      if (!isSel) {
        ctx.fillStyle = 'rgba(6,6,10,0.45)';
        ctx.fillRect(tx, ty, L.tileW, L.tileH);
      }
      drawText(ctx, isRandTile ? 'RANDOM' : tEntry.name, tx + L.tileW / 2, ty + L.tileH - 4, {
        font: FONTS.ui(8, 800), color: isSel ? '#fff' : COLORS.textDim, align: 'center', maxWidth: L.tileW - 6
      });
      ctx.restore();
      ctx.strokeStyle = isSel ? hexToRgba(isRandTile ? COLORS.gold : tEntry.accent, 0.9) : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + 0.5, ty + 0.5, L.tileW - 1, L.tileH - 1);
      ctx.restore();
    }

    // gliding selection brackets
    const pad = 3 + Math.sin(t * 0.15) * 1;
    drawCornerBrackets(ctx, this._hiX - pad, L.tileY - 3 - pad, L.tileW + pad * 2, L.tileH + pad * 2, {
      color: COLORS.gold, len: 8, lw: 2, glow: hexToRgba(COLORS.gold, 0.6)
    });

    if (this.canChoose) {
      const nudge = Math.sin(t * 0.15) * 2;
      const first = this.getTileX(0, W);
      const last = this.getTileX(this.count - 1, W) + L.tileW;
      drawText(ctx, '◀', first - 12 - nudge, L.tileY + L.tileH / 2 + 3, { font: FONTS.ui(10, 800), color: COLORS.gold, align: 'center' });
      drawText(ctx, '▶', last + 12 + nudge, L.tileY + L.tileH / 2 + 3, { font: FONTS.ui(10, 800), color: COLORS.gold, align: 'center' });
    }
  }

  render(ctx, W, H) {
    this.bakeNextThumb();
    if (this.index !== this._lastIndex) {
      const d = this.index - this._lastIndex;
      this._swapDir = (d > 0 && d < this.count / 2) || d < -this.count / 2 ? 1 : -1;
      this._lastIndex = this.index;
    }
    const entry = this.isRandom ? null : this.catalog[this.index];
    const previewEntry = this.catalog[this.getPreviewCatalogIndex()];
    const accent = this.isRandom ? COLORS.gold : (entry || previewEntry || { accent: COLORS.gold }).accent;
    const gp = this.hasGamepad();

    this.drawBackground(ctx, W, H);
    const glow = ctx.createRadialGradient(208, 160, 10, 208, 160, 300);
    glow.addColorStop(0, hexToRgba(accent, 0.12));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    drawScreenHeader(ctx, W, 'SELECT STAGE', MODE_LABELS[this.mode] || 'CHOOSE YOUR BATTLEFIELD', this.tick);
    const back = this.layout.back;
    drawChip(ctx, W - (640 - back.x), back.y, back.w, back.h, gp ? 'B' : 'ESC', 'BACK');

    this.drawPreview(ctx, W, H, accent);
    this.drawInfo(ctx, W, H, entry, accent);
    this.drawFilmstrip(ctx, W, H);

    const items = this.canChoose
      ? (gp
        ? [{ key: 'D-PAD', label: 'SELECT' }, { key: 'A', label: 'FIGHT' }, { key: 'B', label: 'BACK' }]
        : [{ key: 'A/D', label: 'SELECT' }, { key: 'ENTER', label: 'FIGHT' }, { key: 'ESC', label: 'BACK' }])
      : [{ key: gp ? 'B' : 'ESC', label: 'LEAVE' }];
    drawPromptBar(ctx, items, W / 2, H - 8);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
