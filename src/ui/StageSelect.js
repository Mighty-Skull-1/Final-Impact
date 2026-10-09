// Final Impact - Battleground Select Screen (Mortal Kombat style arena picker)
import { Stage } from '../graphics/Stage.js';
import { soundFX } from '../audio/SoundFX.js';

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

    // Layout (640x360 logical canvas)
    this.layout = {
      preview: { x: 20, y: 52, w: 312, h: 176 },
      info: { x: 346, y: 52, w: 274, h: 176 },
      tileW: 84,
      tileH: 47,
      tileGap: 4,
      tileY: 242,
      back: { x: 12, y: 10, w: 95, h: 22 },
      btn: { w: 360, h: 26 }
    };
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

    if (x >= back.x && x <= back.x + back.w && y >= back.y && y <= back.y + back.h) {
      try { soundFX.playWhoosh('light'); } catch (e) {}
      if (onBack) onBack();
      return true;
    }

    if (!this.canChoose) return false;

    // Arena tiles
    if (y >= tileY && y <= tileY + tileH) {
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
    const btnX = (W - btn.w) / 2;
    const btnY = H - 34;
    const inPreview = x >= preview.x && x <= preview.x + preview.w && y >= preview.y && y <= preview.y + preview.h;
    const inBtn = x >= btnX && x <= btnX + btn.w && y >= btnY && y <= btnY + btn.h;
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
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach(w => {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  drawBackground(ctx, W, H) {
    const t = this.tick;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#140306');
    bg.addColorStop(0.55, '#2b0808');
    bg.addColorStop(1, '#0a0102');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Giant faded dragon medallion behind everything
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 10, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 10, 128, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#facc15';
    ctx.font = '900 190px serif';
    ctx.textAlign = 'center';
    ctx.fillText('龍', W / 2, H / 2 + 76);
    ctx.restore();

    // Rising embers
    for (let i = 0; i < 36; i++) {
      const ex = (i * 71 + Math.sin(t * 0.01 + i) * 14 + 640) % W;
      const ey = H - ((i * 53 + t * (0.4 + (i % 5) * 0.18)) % (H + 20));
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : (i % 3 === 1 ? '#f97316' : '#ef4444');
      ctx.globalAlpha = 0.25 + (i % 4) * 0.12;
      ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 380);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  render(ctx, W, H) {
    this.bakeNextThumb();
    const L = this.layout;
    const entry = this.isRandom ? null : this.catalog[this.index];
    const previewEntry = this.catalog[this.getPreviewCatalogIndex()];
    const accent = (entry || previewEntry || { accent: '#facc15' }).accent;

    this.drawBackground(ctx, W, H);

    // ---- Header --------------------------------------------------------
    ctx.fillStyle = 'rgba(30, 27, 75, 0.0)';
    ctx.fillStyle = 'rgba(127, 29, 29, 0.55)';
    ctx.fillRect(0, 6, W, 36);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 6, W, 2);
    ctx.fillRect(0, 40, W, 2);

    // Back button
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(L.back.x, L.back.y, L.back.w, L.back.h);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(L.back.x, L.back.y, L.back.w, L.back.h);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⬅️ BACK [B]', L.back.x + L.back.w / 2, L.back.y + 14);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.font = '900 22px monospace';
    ctx.fillText('CHOOSE YOUR BATTLEFIELD', W / 2 + 2, 31);
    const tg = ctx.createLinearGradient(0, 14, 0, 34);
    tg.addColorStop(0, '#fef08a');
    tg.addColorStop(0.55, '#f59e0b');
    tg.addColorStop(1, '#b91c1c');
    ctx.fillStyle = tg;
    ctx.fillText('CHOOSE YOUR BATTLEFIELD', W / 2, 29);

    // ---- Big live preview ----------------------------------------------
    const pv = L.preview;
    ctx.save();
    ctx.beginPath();
    ctx.rect(pv.x, pv.y, pv.w, pv.h);
    ctx.clip();
    ctx.translate(pv.x, pv.y);
    const s = pv.w / 640;
    ctx.scale(s, s);
    if (this.liveStage) {
      const camX = 160 + Math.sin(this.tick * 0.012) * 150;
      this.liveStage.render(ctx, camX, 640, 360);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 640, 360);
    }
    ctx.restore();

    // Scanline sheen for that arcade monitor feel
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = pv.y; y < pv.y + pv.h; y += 3) ctx.fillRect(pv.x, y, pv.w, 1);

    // Ornate frame
    const pulse = 0.65 + Math.sin(this.tick * 0.1) * 0.35;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    ctx.strokeRect(pv.x - 3, pv.y - 3, pv.w + 6, pv.h + 6);
    ctx.lineWidth = 2;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = pulse;
    ctx.strokeRect(pv.x - 2, pv.y - 2, pv.w + 4, pv.h + 4);
    ctx.globalAlpha = 1;
    // Gold corner studs
    ctx.fillStyle = '#facc15';
    [[pv.x - 5, pv.y - 5], [pv.x + pv.w - 3, pv.y - 5], [pv.x - 5, pv.y + pv.h - 3], [pv.x + pv.w - 3, pv.y + pv.h - 3]]
      .forEach(([cx, cy]) => ctx.fillRect(cx, cy, 8, 8));

    // Random shuffle overlay
    if (this.isRandom) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
      ctx.fillStyle = '#fde047';
      ctx.font = '900 54px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', pv.x + pv.w / 2, pv.y + pv.h / 2 + 18);
    }

    // ---- Info panel -----------------------------------------------------
    const ip = L.info;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(ip.x, ip.y, ip.w, ip.h);
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.strokeRect(ip.x, ip.y, ip.w, ip.h);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(ip.x + 3, ip.y + 3, ip.w - 6, ip.h - 6);

    ctx.textAlign = 'left';
    ctx.fillStyle = accent;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(this.isRandom ? 'FATE DECIDES' : `ARENA ${String(this.index + 1).padStart(2, '0')} / ${String(this.catalog.length).padStart(2, '0')}`, ip.x + 12, ip.y + 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px monospace';
    ctx.fillText(this.isRandom ? 'RANDOM ARENA' : entry.name, ip.x + 12, ip.y + 42);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(this.isRandom ? 'Unknown Location' : entry.location, ip.x + 12, ip.y + 58);

    // Divider
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(ip.x + 12, ip.y + 66, ip.w - 24, 2);
    ctx.fillStyle = accent;
    ctx.fillRect(ip.x + 12, ip.y + 66, 46, 2);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    const blurb = this.isRandom
      ? 'Let the tournament gods choose. Any arena can be drawn - you will not know until the fight begins!'
      : entry.blurb;
    this.wrapText(ctx, blurb, ip.w - 28).slice(0, 4).forEach((ln, i) => {
      ctx.fillText(ln, ip.x + 12, ip.y + 84 + i * 13);
    });

    // Matchup block
    ctx.fillStyle = 'rgba(127, 29, 29, 0.45)';
    ctx.fillRect(ip.x + 10, ip.y + 134, ip.w - 20, 32);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(MODE_LABELS[this.mode] || 'MATCH', ip.x + 16, ip.y + 146);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.p1Name}  VS  ${this.p2Name}`, ip.x + ip.w / 2, ip.y + 160);

    // ---- Arena tile strip ----------------------------------------------
    for (let i = 0; i < this.count; i++) {
      const tx = this.getTileX(i, W);
      const ty = L.tileY;
      const isSel = i === this.index;
      const isRandTile = i === this.catalog.length;
      const tEntry = isRandTile ? null : this.catalog[i];

      ctx.save();
      if (isSel) {
        const lift = Math.sin(this.tick * 0.2) * 1.5 - 3;
        ctx.translate(0, lift);
      }

      // Thumbnail
      ctx.fillStyle = '#000';
      ctx.fillRect(tx, ty, L.tileW, L.tileH);
      if (isRandTile) {
        const cyc = this.catalog[Math.floor(this.tick / 12) % this.catalog.length];
        const th = cyc && this.thumbs[cyc.id];
        if (th) {
          ctx.globalAlpha = 0.45;
          ctx.drawImage(th, tx, ty, L.tileW, L.tileH);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = '#fde047';
        ctx.font = '900 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', tx + L.tileW / 2, ty + L.tileH / 2 + 9);
      } else {
        const th = this.thumbs[tEntry.id];
        if (th) {
          ctx.drawImage(th, tx, ty, L.tileW, L.tileH);
        } else {
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(tx, ty, L.tileW, L.tileH);
        }
      }

      if (!isSel) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(tx, ty, L.tileW, L.tileH);
      }

      // Frame
      const col = isSel ? (isRandTile ? '#fde047' : tEntry.accent) : '#44403c';
      ctx.lineWidth = isSel ? 3 : 1;
      ctx.strokeStyle = '#000';
      ctx.strokeRect(tx - 1, ty - 1, L.tileW + 2, L.tileH + 2);
      ctx.strokeStyle = col;
      ctx.strokeRect(tx, ty, L.tileW, L.tileH);
      if (isSel) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx - 3, ty - 3, L.tileW + 6, L.tileH + 6);
      }
      ctx.restore();

      // Label
      ctx.textAlign = 'center';
      ctx.fillStyle = isSel ? '#ffffff' : '#78716c';
      ctx.font = `${isSel ? 'bold ' : ''}7px monospace`;
      ctx.fillText(isRandTile ? 'RANDOM' : tEntry.name, tx + L.tileW / 2, ty + L.tileH + 12);
    }

    // Selection arrows
    if (this.canChoose) {
      const arrowPulse = Math.sin(this.tick * 0.2) * 3;
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◀', 7 - arrowPulse * 0.4, L.tileY + 30);
      ctx.fillText('▶', W - 7 + arrowPulse * 0.4, L.tileY + 30);
    }

    // ---- Footer button --------------------------------------------------
    const btnX = (W - L.btn.w) / 2;
    const btnY = H - 34;
    ctx.textAlign = 'center';
    if (!this.canChoose) {
      const blink = Math.floor(this.tick / 18) % 2 === 0;
      ctx.fillStyle = blink ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(btnX, btnY, L.btn.w, L.btn.h);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, L.btn.w, L.btn.h);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⏳ HOST IS CHOOSING THE BATTLEFIELD...', W / 2, btnY + 17);
    } else {
      ctx.fillStyle = 'rgba(127, 29, 29, 0.92)';
      ctx.fillRect(btnX, btnY, L.btn.w, L.btn.h);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, L.btn.w, L.btn.h);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⚔️ FIGHT HERE [ENTER]   ◀ ▶ CHOOSE   [B] BACK', W / 2, btnY + 17);
    }

    ctx.textAlign = 'left';
  }
}
