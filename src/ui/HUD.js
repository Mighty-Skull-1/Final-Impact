// Final Impact - In-fight HUD
// Angled health bars with lingering damage, timer badge, round pips, two-stage super meter
// (50% = Breaker, 100% = Ultimate), combo counter, announcements and the ultimate cut-in.
import { input } from '../engine/Input.js';
import { getFighterCatalogEntry } from '../fighters/FighterCatalog.js';
import { COLORS, FONTS, slantPath, drawText, drawKeyCap, hexToRgba, ease } from './Theme.js';
import { vfx } from '../graphics/VFX.js';

const BREAKER_COST = 50;

export class HUD {
  constructor() {
    this.timer = 99;
    this.timerTicks = 0;
    this.announcement = null;
    this.announcementTimer = 0;
    this.announcementMax = 0;
    this.hitSparks = []; // legacy (sparks now live in the VFX system)
    this.screenShake = 0;
    this.p1RedHealth = 1000;
    this.p2RedHealth = 1000;
    this.comboP1 = 0;
    this.comboTimerP1 = 0;
    this.comboP2 = 0;
    this.comboTimerP2 = 0;
    this.combo = { 1: null, 2: null };
    this.frame = 0;
    this.prevMeterFull = { 1: false, 2: false };
    this.meterFlash = { 1: 0, 2: 0 };

    // Beginner Controls Helper HUD Overlay (default ON for newcomers)
    try {
      const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('final_impact_controls_helper') : null;
      this.showControlsHelper = saved !== 'false';
    } catch (e) {
      this.showControlsHelper = true;
    }

    // Ultimate cut-in (triggered by Game after it resolves the fighter object)
    this.ultimateCinematic = null;

    // Elden Ring 2-Phase Boss & Legend Vanquished Banners
    this.eldenRingBanner = null;
    this.legendVanquishedBanner = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('elden-ring-phase2', (e) => {
        this.triggerEldenRingPhase2(e.detail.boss);
      });
      window.addEventListener('legend-vanquished', () => {
        this.triggerLegendVanquished();
      });
    }

    this.dirtyBanner = null;
    this.crowdBanner = null;

    this.gamepadToast = null;
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepad-notification', (e) => {
        const detail = e.detail || {};
        const text = detail.connected
          ? `CONTROLLER ${detail.playerNum || 1} CONNECTED`
          : `CONTROLLER ${detail.playerNum || 1} DISCONNECTED`;
        this.gamepadToast = { text, connected: detail.connected, timer: 140 };
      });
    }
  }

  triggerEldenRingPhase2(boss) {
    this.eldenRingBanner = { timer: 160, boss };
    this.triggerShake(16);
  }

  triggerLegendVanquished() {
    this.legendVanquishedBanner = { timer: 220 };
    this.triggerShake(14);
  }

  toggleControlsHelper() {
    this.showControlsHelper = !this.showControlsHelper;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_controls_helper', this.showControlsHelper ? 'true' : 'false');
      }
    } catch (e) {}
    return this.showControlsHelper;
  }

  showDirtyBanner(text) {
    this.dirtyBanner = { name: text, timer: 70 };
  }

  showCrowdBanner(text = 'CROWD SHOVE!') {
    this.crowdBanner = { text, timer: 75 };
  }

  triggerUltimateCinematic(detail) {
    this.ultimateCinematic = { ...detail, frame: 0, maxFrames: 44 };
    this.triggerShake(6);
  }

  reset(roundNumber = 1) {
    this.timer = 99;
    this.timerTicks = 0;
    this.hitSparks = [];
    this.screenShake = 0;
    this.ultimateCinematic = null;
    this.dirtyBanner = null;
    this.crowdBanner = null;
    this.combo = { 1: null, 2: null };
    this.comboP1 = 0;
    this.comboP2 = 0;
    this.setAnnouncement(roundNumber === 1 ? 'ROUND 1' : (roundNumber === 2 ? 'ROUND 2' : 'FINAL ROUND'), 62);
  }

  setAnnouncement(text, duration = 90) {
    this.announcement = text;
    this.announcementTimer = duration;
    this.announcementMax = duration;
  }

  // Legacy API: sparks are world-space VFX now
  addHitSpark(x, y, type = 'hit') {
    if (type === 'block') vfx.blockSpark(x, y, { dir: 1 });
    else vfx.hitSpark(x, y, { dir: 1 });
  }

  triggerShake(intensity = 8) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  recordHit(attackerPlayerNum) {
    // Kept for compatibility; the real combo counter is fed by setCombo()
  }

  setCombo(side, hits, damage, counter = false) {
    if (hits >= 2 || counter) {
      const prev = this.combo[side];
      this.combo[side] = { hits, damage, counter: counter || (prev && prev.counter && hits > 1), timer: 70, pop: 8 };
    }
    if (side === 1) { this.comboP1 = hits; this.comboTimerP1 = 70; } else { this.comboP2 = hits; this.comboTimerP2 = 70; }
  }

  // Effects that should keep animating during hit-stop
  updateFx() {
    this.frame++;
    if (this.screenShake > 0) {
      this.screenShake *= 0.84;
      if (this.screenShake < 0.4) this.screenShake = 0;
    }
    if (this.ultimateCinematic) {
      this.ultimateCinematic.frame++;
      if (this.ultimateCinematic.frame >= this.ultimateCinematic.maxFrames) this.ultimateCinematic = null;
    }
    for (const side of [1, 2]) {
      const c = this.combo[side];
      if (c) {
        if (c.pop > 0) c.pop--;
      }
      if (this.meterFlash[side] > 0) this.meterFlash[side]--;
    }
  }

  update(f1, f2, game = null) {
    const introLock = game && game.combat && game.combat.introTimer > 0;
    const training = game && game.isTraining;
    // Round timer countdown
    if (!introLock && !training) {
      this.timerTicks++;
      if (this.timerTicks >= 60 && this.timer > 0 && !f1.isDead && !f2.isDead) {
        this.timerTicks = 0;
        this.timer--;
      }
    }

    // Lingering red damage drains after a short delay
    const drain = (cur, red) => (red > cur ? Math.max(cur, red - Math.max(2.5, (red - cur) * 0.06)) : cur);
    this.p1RedHealth = drain(f1.health, this.p1RedHealth);
    this.p2RedHealth = drain(f2.health, this.p2RedHealth);

    // Announcement timer (ROUND x → FIGHT!)
    if (this.announcementTimer > 0) {
      this.announcementTimer--;
      if (this.announcementTimer === 0) {
        if (this.announcement && (this.announcement.startsWith('ROUND') || this.announcement.startsWith('FINAL'))) {
          this.setAnnouncement('FIGHT!', 40);
        } else {
          this.announcement = null;
        }
      }
    }

    // Combo display timers (count down only once the combo has ended)
    for (const side of [1, 2]) {
      const c = this.combo[side];
      if (!c) continue;
      const victim = side === 1 ? f2 : f1;
      const live = victim && victim.comboHits >= 2;
      if (!live) {
        c.timer--;
        if (c.timer <= 0) this.combo[side] = null;
      }
    }
    if (this.comboTimerP1 > 0 && --this.comboTimerP1 === 0) this.comboP1 = 0;
    if (this.comboTimerP2 > 0 && --this.comboTimerP2 === 0) this.comboP2 = 0;

    // Meter-full flash
    for (const [side, f] of [[1, f1], [2, f2]]) {
      if (!f) continue;
      const full = f.superMeter >= f.maxSuperMeter;
      if (full && !this.prevMeterFull[side]) this.meterFlash[side] = 30;
      this.prevMeterFull[side] = full;
    }

    if (this.dirtyBanner && --this.dirtyBanner.timer <= 0) this.dirtyBanner = null;
    if (this.crowdBanner && --this.crowdBanner.timer <= 0) this.crowdBanner = null;
  }

  getShakeOffset() {
    if (this.screenShake <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() * 2 - 1) * this.screenShake,
      y: (Math.random() * 2 - 1) * this.screenShake * 0.6
    };
  }

  // =====================================================================
  // RENDER
  // =====================================================================
  render(ctx, f1, f2, W, H, f3 = null, f4 = null, game = null) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';

    this.renderHealthBars(ctx, f1, f2, W, game);
    this.renderTimer(ctx, W, game);
    if (f3 || f4) this.renderAllyBars(ctx, f3, f4, W);
    this.renderMeters(ctx, f1, f2, W, H);
    this.renderCombo(ctx, W);
    this.renderAnnouncement(ctx, W, H);
    this.renderBanners(ctx, f1, f2, W, H);
    if (this.ultimateCinematic) this.renderCutIn(ctx, W, H);
    this.renderControlsHelper(ctx, f1, W, H);

    ctx.restore();
  }

  // ---------- Health ----------
  renderHealthBars(ctx, f1, f2, W, game) {
    const barW = 252;
    const barH = 15;
    const y = 14;
    const gap = 34; // space for the timer badge
    const p1X = W / 2 - gap - barW;
    const p2X = W / 2 + gap;

    this.drawHealthBar(ctx, f1, p1X, y, barW, barH, true, this.p1RedHealth);
    this.drawHealthBar(ctx, f2, p2X, y, barW, barH, false, this.p2RedHealth);

    // Names + round pips + status row
    this.drawNamePlate(ctx, f1, p1X, y + barH + 3, barW, true, game);
    this.drawNamePlate(ctx, f2, p2X, y + barH + 3, barW, false, game);
  }

  drawHealthBar(ctx, f, x, y, w, h, isLeft, redHealth) {
    const slant = 8;
    const pct = Math.max(0, Math.min(1, f.health / f.maxHealth));
    const redPct = Math.max(0, Math.min(1, redHealth / f.maxHealth));
    const isBossP2 = f.phase === 2;
    const rage = f.isRageMode;

    ctx.save();
    // Frame
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    slantPathDir(ctx, x - 3, y - 3, w + 6, h + 6, slant + 1, isLeft);
    ctx.fill();
    ctx.strokeStyle = rage ? hexToRgba(COLORS.ember, 0.9) : 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clip to bar shape
    slantPathDir(ctx, x, y, w, h, slant, isLeft);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#16131d';
    ctx.fillRect(x - slant, y, w + slant * 2, h);

    // Lingering damage (drains toward current health)
    const redW = w * redPct;
    ctx.fillStyle = '#d9263f';
    if (isLeft) ctx.fillRect(x + w - redW, y, redW, h);
    else ctx.fillRect(x, y, redW, h);

    // Current health with colour shifting as it drops
    const curW = w * pct;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    if (isBossP2) {
      g.addColorStop(0, '#fca5a5'); g.addColorStop(0.5, '#dc2626'); g.addColorStop(1, '#581c87');
    } else if (pct <= 0.3 || rage) {
      g.addColorStop(0, '#ffe2b8'); g.addColorStop(0.45, '#ff8a1f'); g.addColorStop(1, '#c2410c');
    } else {
      g.addColorStop(0, '#fff6c2'); g.addColorStop(0.45, '#f7c948'); g.addColorStop(1, '#c48a12');
    }
    ctx.fillStyle = g;
    if (isLeft) ctx.fillRect(x + w - curW, y, curW, h);
    else ctx.fillRect(x, y, curW, h);

    // Gloss + tick marks every 10%
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(x - slant, y + 1, w + slant * 2, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let i = 1; i < 10; i++) ctx.fillRect(x + (w * i) / 10, y + h - 4, 1, 4);

    // Low-health pulse
    if (pct > 0 && pct <= 0.25) {
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(this.frame * 0.25);
      ctx.fillStyle = '#ff2d2d';
      ctx.fillRect(x - slant, y, w + slant * 2, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Stamina (thin bar under health)
    const sy = y + h + 1;
    const st = Math.max(0, Math.min(1, (f.stamina ?? 100) / (f.maxStamina || 100)));
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, sy, w, 2);
    ctx.fillStyle = f.state === 'WINDED' ? COLORS.bad : (st < 0.3 ? COLORS.warn : '#3ccf8e');
    if (isLeft) ctx.fillRect(x + w * (1 - st), sy, w * st, 2);
    else ctx.fillRect(x, sy, w * st, 2);

    // Poise (stance) — only shown once it has been chipped; flashes when broken
    const poise = f.poise === undefined ? 100 : f.poise;
    if (poise < 99.5 || f.isStanceBroken) {
      const py = sy + 3;
      const pw = w * 0.45;
      const px = isLeft ? x + w - pw : x;
      const pp = f.isStanceBroken ? 1 : Math.max(0, poise / 100);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(px, py, pw, 2);
      ctx.fillStyle = f.isStanceBroken ? (Math.floor(this.frame / 4) % 2 ? '#ff4d4d' : '#ffe066') : (pp < 0.3 ? '#ff9f43' : '#e8d7a5');
      if (isLeft) ctx.fillRect(px + pw * (1 - pp), py, pw * pp, 2);
      else ctx.fillRect(px, py, pw * pp, 2);
    }
    ctx.restore();
  }

  drawNamePlate(ctx, f, x, y, w, isLeft, game) {
    const nameX = isLeft ? x + 4 : x + w - 4;
    const align = isLeft ? 'left' : 'right';
    const accent = isLeft ? COLORS.p1 : COLORS.p2;
    const label = isLeft ? 'P1' : (f.isCpu ? 'CPU' : 'P2');

    // Small player tag + name
    ctx.save();
    ctx.font = FONTS.ui(7, 800);
    const tagW = ctx.measureText(label).width + 8;
    const tagX = isLeft ? nameX : nameX - tagW;
    ctx.fillStyle = accent;
    slantPath(ctx, tagX, y + 2, tagW, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#05060a';
    ctx.textAlign = 'center';
    ctx.fillText(label, tagX + tagW / 2, y + 10);
    ctx.restore();

    const nameStart = isLeft ? nameX + tagW + 5 : nameX - tagW - 5;
    drawText(ctx, f.name, nameStart, y + 12, { font: FONTS.display(13, 900), color: COLORS.text, align, outline: 3 });

    // Status tags (rage / phase II)
    ctx.font = FONTS.display(13, 900);
    const nameW = ctx.measureText(f.name).width;
    let tag = null;
    if (f.phase === 2) tag = { t: 'PHASE II', c: '#f87171' };
    else if (f.isRageMode) tag = { t: 'RAGE', c: COLORS.ember };
    if (tag) {
      const tx = isLeft ? nameStart + nameW + 6 : nameStart - nameW - 6;
      const flick = Math.floor(this.frame / 8) % 2 === 0;
      drawText(ctx, tag.t, tx, y + 11, { font: FONTS.ui(7.5, 900), color: flick ? tag.c : COLORS.goldPale, align, outline: 2.5 });
    }

    // Round win pips (beside the timer)
    const wins = f.roundsWon || 0;
    for (let r = 0; r < 2; r++) {
      const px = isLeft ? x + w - 10 - r * 13 : x + 10 + r * 13;
      const on = r < wins;
      ctx.save();
      ctx.translate(px, y + 7);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = on ? COLORS.gold : 'rgba(0,0,0,0.6)';
      ctx.strokeStyle = on ? COLORS.goldPale : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.strokeRect(-3.5, -3.5, 7, 7);
      ctx.restore();
    }

    // Limb damage: only shown once something is actually hurt
    const limbs = f.limbs || {};
    const parts = [
      { k: 'ARM', v: limbs.leadArm, broken: limbs.leadArm <= 0 },
      { k: 'LEG', v: limbs.leadLeg, broken: limbs.leadLeg <= 0 },
      { k: 'RIB', v: limbs.torso, broken: limbs.torso <= 30 }
    ].filter(p => p.v !== undefined && p.v < 70);
    if (parts.length) {
      let lx = isLeft ? x + 4 : x + w - 4;
      const ly = y + 24;
      parts.forEach(p => {
        const col = p.broken ? COLORS.bad : COLORS.warn;
        const txt = p.broken ? `${p.k} BROKEN` : `${p.k} ${Math.round(p.v)}%`;
        ctx.font = FONTS.ui(7, 800);
        const tw = ctx.measureText(txt).width + 8;
        const bx = isLeft ? lx : lx - tw;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(bx, ly - 7, tw, 10);
        ctx.fillStyle = col;
        ctx.fillRect(bx, ly - 7, 2, 10);
        drawText(ctx, txt, bx + 5, ly + 1, { font: FONTS.ui(7, 800), color: col });
        lx += isLeft ? tw + 4 : -(tw + 4);
      });
    }
  }

  renderTimer(ctx, W, game) {
    const cx = W / 2;
    const y = 8;
    ctx.save();
    // Badge
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.beginPath();
    ctx.moveTo(cx - 26, y);
    ctx.lineTo(cx + 26, y);
    ctx.lineTo(cx + 20, y + 34);
    ctx.lineTo(cx - 20, y + 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hexToRgba(COLORS.gold, 0.55);
    ctx.lineWidth = 1;
    ctx.stroke();
    const training = game && game.isTraining;
    const low = this.timer <= 10 && !training;
    const txt = training ? '∞' : String(this.timer).padStart(2, '0');
    const pulse = low ? 1 + 0.08 * Math.max(0, Math.sin(this.frame * 0.3)) : 1;
    ctx.translate(cx, y + 28);
    ctx.scale(pulse, pulse);
    drawText(ctx, txt, 0, 0, { font: FONTS.display(26, 900, false), color: low ? '#ff5a5a' : COLORS.goldPale, align: 'center', outline: 3 });
    ctx.restore();
  }

  renderAllyBars(ctx, f3, f4, W) {
    const w = 120;
    const y = 72;
    const draw = (f, x, color, alignRight) => {
      if (!f) return;
      const pct = Math.max(0, Math.min(1, f.health / f.maxHealth));
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x - 1, y - 1, w + 2, 7);
      ctx.fillStyle = f.isDead ? '#475569' : color;
      if (alignRight) ctx.fillRect(x + w * (1 - pct), y, w * pct, 5);
      else ctx.fillRect(x, y, w * pct, 5);
      drawText(ctx, f.name, alignRight ? x + w : x, y - 3, { font: FONTS.ui(7.5, 800), color: COLORS.textDim, align: alignRight ? 'right' : 'left', outline: 2 });
    };
    draw(f3, W / 2 - 34 - 252 + 4, '#3ccf8e', false);
    draw(f4, W / 2 + 34 + 252 - 4 - w, '#ff8a3d', true);
  }

  // ---------- Super meter ----------
  renderMeters(ctx, f1, f2, W, H) {
    this.drawMeter(ctx, f1, 18, H - 22, true, 1);
    this.drawMeter(ctx, f2, W - 18, H - 22, false, 2);
  }

  drawMeter(ctx, f, anchorX, y, isLeft, side) {
    const w = 170;
    const h = 9;
    const x = isLeft ? anchorX : anchorX - w;
    const pct = Math.max(0, Math.min(1, f.superMeter / f.maxSuperMeter));
    const full = pct >= 1;
    const canBreak = f.superMeter >= BREAKER_COST;

    ctx.save();
    // Frame
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    slantPathDir(ctx, x - 2, y - 2, w + 4, h + 4, 6, !isLeft);
    ctx.fill();
    ctx.strokeStyle = full ? COLORS.meterFull : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    slantPathDir(ctx, x, y, w, h, 5, !isLeft);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#0e1520';
    ctx.fillRect(x - 6, y, w + 12, h);
    const fillW = w * pct;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    if (full) {
      const t = this.frame * 0.15;
      g.addColorStop(0, '#ffb703');
      g.addColorStop((Math.sin(t) * 0.5 + 0.5) * 0.8 + 0.1, '#fff4b0');
      g.addColorStop(1, '#ffb703');
    } else {
      g.addColorStop(0, '#0ea5e9');
      g.addColorStop(1, COLORS.meter);
    }
    ctx.fillStyle = g;
    if (isLeft) ctx.fillRect(x, y, fillW, h);
    else ctx.fillRect(x + w - fillW, y, fillW, h);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x - 6, y + 1, w + 12, 2);
    // Half-way notch (Breaker threshold)
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(x + w / 2 - 1, y, 2, h);
    if (this.meterFlash[side] > 0) {
      ctx.globalAlpha = this.meterFlash[side] / 30;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 6, y, w + 12, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Labels above the bar
    const labelY = y - 4;
    const lx = isLeft ? x + 2 : x + w - 2;
    const align = isLeft ? 'left' : 'right';
    let label = 'SUPER';
    let col = COLORS.textDim;
    if (full) { label = 'ULTIMATE READY'; col = COLORS.meterFull; }
    else if (canBreak) { label = 'BREAKER READY'; col = COLORS.meter; }
    drawText(ctx, label, lx, labelY, { font: FONTS.ui(7.5, 900), color: col, align, outline: 2.5 });
    if (full && f.playerNum === 1 && !f.isCpu) {
      const hint = input.hasGamepadConnected && input.hasGamepadConnected() ? 'R3' : 'SPACE';
      ctx.font = FONTS.ui(7.5, 900);
      const lw = ctx.measureText(label).width;
      drawKeyCap(ctx, hint, lx + lw + 5, labelY - 8, { h: 10, font: FONTS.ui(7, 900), color: '#05060a', bg: COLORS.meterFull, border: COLORS.goldPale });
    }

    // Dirty Tactic charge pip (next to the meter)
    const cd = f.dirtyCooldown || 0;
    const ready = cd <= 0;
    const px = isLeft ? x + w + 14 : x - 14;
    const py = y + h / 2;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fill();
    if (!ready) {
      const frac = 1 - cd / 540;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.closePath();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.strokeStyle = ready ? COLORS.warn : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    drawText(ctx, 'D', px, py + 3, { font: FONTS.ui(7.5, 900), color: ready ? COLORS.warn : COLORS.textMute, align: 'center' });
    ctx.restore();
  }

  // ---------- Combo counter ----------
  renderCombo(ctx, W) {
    for (const side of [1, 2]) {
      const c = this.combo[side];
      if (!c || c.hits < 2) continue;
      const isLeft = side === 1;
      const fadeIn = 1;
      const alpha = Math.min(1, c.timer / 20) * fadeIn;
      const x = isLeft ? 22 : W - 22;
      const y = 104;
      const pop = 1 + (c.pop / 8) * 0.35;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(pop, pop);
      const align = isLeft ? 'left' : 'right';
      drawText(ctx, String(c.hits), 0, 0, { font: FONTS.display(34), color: COLORS.goldPale, align, outline: 5 });
      ctx.font = FONTS.display(34);
      const nw = ctx.measureText(String(c.hits)).width;
      const hx = isLeft ? nw + 5 : -nw - 5;
      drawText(ctx, 'HITS', hx, -14, { font: FONTS.display(13), color: COLORS.gold, align, outline: 3 });
      drawText(ctx, `${Math.round(c.damage)} DMG`, hx, 0, { font: FONTS.ui(8, 800), color: COLORS.text, align, outline: 2.5 });
      if (c.counter) drawText(ctx, 'COUNTER', 0, 12, { font: FONTS.ui(8, 900), color: '#ff5a5a', align, outline: 2.5 });
      ctx.restore();
    }
  }

  // ---------- Announcements ----------
  renderAnnouncement(ctx, W, H) {
    if (!this.announcement) return;
    const text = this.announcement;
    const total = this.announcementMax || 60;
    const elapsed = total - this.announcementTimer;
    const inT = Math.min(1, elapsed / 10);
    const outT = Math.min(1, this.announcementTimer / 10);
    const vis = Math.min(inT, outT);
    const cy = H / 2 - 22;
    const isKO = text === 'K.O.' || text === 'TEAM K.O.';
    const isFight = text === 'FIGHT!';
    const size = isKO ? 64 : (isFight ? 54 : (text.length > 14 ? 24 : 40));

    ctx.save();
    // Band
    ctx.globalAlpha = 0.85 * vis;
    const bandH = size * 0.95;
    const bg = ctx.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(0.25, 'rgba(0,0,0,0.75)');
    bg.addColorStop(0.75, 'rgba(0,0,0,0.75)');
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, cy - bandH * 0.78, W, bandH);
    ctx.fillStyle = isKO ? COLORS.crimson : COLORS.gold;
    ctx.fillRect(W * 0.2, cy - bandH * 0.78, W * 0.6 * inT, 1.5);
    ctx.fillRect(W * 0.8 - W * 0.6 * inT, cy + bandH * 0.22, W * 0.6 * inT, 1.5);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = vis;
    const scale = isFight || isKO ? 1 + (1 - ease.outBack(inT)) * 0.6 : 1;
    const slide = (1 - ease.outCubic(inT)) * 60;
    ctx.translate(W / 2 + slide, cy);
    ctx.scale(scale, scale);
    if (isKO) {
      drawText(ctx, text, 0, 0, { font: FONTS.display(size), color: '#ff3b4a', align: 'center', outline: 7, shadow: { color: 'rgba(120,0,10,0.8)', x: 3, y: 3 } });
    } else {
      ctx.font = FONTS.display(size);
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(4, size / 8);
      ctx.strokeStyle = '#000';
      ctx.strokeText(text, 0, 0);
      const g = ctx.createLinearGradient(0, -size * 0.8, 0, 0);
      g.addColorStop(0, COLORS.goldPale);
      g.addColorStop(0.55, isFight ? COLORS.ember : COLORS.gold);
      g.addColorStop(1, isFight ? COLORS.crimson : COLORS.goldDeep);
      ctx.fillStyle = g;
      ctx.fillText(text, 0, 0);
    }
    ctx.restore();
  }

  // ---------- Banners / overlays ----------
  renderBanners(ctx, f1, f2, W, H) {
    if (this.dirtyBanner && this.dirtyBanner.timer > 0) {
      const a = Math.min(1, this.dirtyBanner.timer / 15);
      const txt = this.dirtyBanner.name.includes('!') || this.dirtyBanner.name.includes(':') ? this.dirtyBanner.name : `DIRTY TACTIC — ${this.dirtyBanner.name}`;
      this.drawToast(ctx, W / 2, 84, txt, COLORS.warn, a);
    }
    if (this.crowdBanner && this.crowdBanner.timer > 0) {
      this.drawToast(ctx, W / 2, 100, this.crowdBanner.text, COLORS.good, Math.min(1, this.crowdBanner.timer / 15));
    }

    // Submission struggle
    if (f1.state === 'SUBMISSION_LOCK' || f2.state === 'SUBMISSION_LOCK') {
      const victim = f1.state === 'SUBMISSION_LOCK' ? f1 : f2;
      const sY = H / 2 + 30;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 6, 12, 0.88)';
      slantPath(ctx, W / 2 - 130, sY - 20, 260, 40, 10);
      ctx.fill();
      ctx.strokeStyle = COLORS.crimson;
      ctx.stroke();
      drawText(ctx, 'MASH ATTACK BUTTONS TO ESCAPE!', W / 2, sY - 5, { font: FONTS.ui(9, 900), color: COLORS.goldPale, align: 'center' });
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(W / 2 - 100, sY + 3, 200, 8);
      ctx.fillStyle = COLORS.meter;
      ctx.fillRect(W / 2 - 100, sY + 3, Math.min(200, ((victim.submissionStruggle || 0) / 100) * 200), 8);
      ctx.restore();
    }

    // Elden Ring phase-2 title card
    if (this.eldenRingBanner && this.eldenRingBanner.timer > 0) {
      this.eldenRingBanner.timer--;
      const b = this.eldenRingBanner;
      const a = Math.min(1, b.timer / 20, (160 - b.timer) / 15);
      ctx.save();
      ctx.globalAlpha = a;
      const barH = 96;
      const barY = H / 2 - barH / 2;
      ctx.fillStyle = 'rgba(10, 2, 8, 0.92)';
      ctx.fillRect(0, barY, W, barH);
      ctx.fillStyle = COLORS.crimson;
      ctx.fillRect(0, barY, W, 2);
      ctx.fillRect(0, barY + barH - 2, W, 2);
      const bossName = (b.boss && b.boss.name) ? b.boss.name : 'REX GANNON, PRIMEVAL APEX';
      drawText(ctx, 'LORD OF BLOOD & CINDERS', W / 2, barY + 26, { font: FONTS.ui(9, 800), color: '#f87171', align: 'center', letterSpacing: 3 });
      drawText(ctx, bossName, W / 2, barY + 58, { font: FONTS.display(26), color: COLORS.goldPale, align: 'center', outline: 4 });
      drawText(ctx, 'PHASE II — THE UNBROKEN WILL', W / 2, barY + 80, { font: FONTS.ui(9, 800), color: '#fca5a5', align: 'center', letterSpacing: 2 });
      ctx.restore();
    }

    if (this.legendVanquishedBanner && this.legendVanquishedBanner.timer > 0) {
      this.legendVanquishedBanner.timer--;
      ctx.save();
      ctx.globalAlpha = Math.min(1.0, this.legendVanquishedBanner.timer / 40);
      drawText(ctx, 'LEGEND VANQUISHED', W / 2, H / 2 - 8, { font: FONTS.display(38), color: COLORS.goldPale, align: 'center', outline: 5 });
      drawText(ctx, 'CAMPAIGN CHAMPION OF FINAL IMPACT', W / 2, H / 2 + 16, { font: FONTS.ui(10, 800), color: COLORS.meter, align: 'center', outline: 2 });
      ctx.restore();
    }

    if (this.gamepadToast && this.gamepadToast.timer > 0) {
      this.gamepadToast.timer--;
      this.drawToast(ctx, W / 2, 66, this.gamepadToast.text, this.gamepadToast.connected ? COLORS.meter : COLORS.warn, Math.min(1, this.gamepadToast.timer / 25));
    }
  }

  drawToast(ctx, cx, y, text, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = FONTS.ui(9, 900);
    const w = ctx.measureText(text).width + 30;
    ctx.fillStyle = 'rgba(8, 7, 12, 0.88)';
    slantPath(ctx, cx - w / 2, y - 12, w, 18, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(cx - w / 2 + 6, y - 12, 3, 18);
    drawText(ctx, text, cx + 3, y + 1, { font: FONTS.ui(9, 900), color, align: 'center' });
    ctx.restore();
  }

  // ---------- Ultimate cut-in ----------
  renderCutIn(ctx, W, H) {
    const u = this.ultimateCinematic;
    const f = u.fighter && typeof u.fighter === 'object' ? u.fighter : null;
    const t = u.frame / u.maxFrames;
    const inT = ease.outCubic(Math.min(1, u.frame / 8));
    const outT = t > 0.82 ? (t - 0.82) / 0.18 : 0;
    const fromLeft = !f || f.team !== 2;
    const glow = (f && f._glow) || COLORS.gold;

    const bandY = 96;
    const bandH = 112;
    ctx.save();
    ctx.globalAlpha = 1 - outT;
    const slideIn = (1 - inT) * W * (fromLeft ? -1 : 1);
    const slideOut = outT * W * (fromLeft ? 1 : -1);
    ctx.translate(slideIn + slideOut, 0);

    // Skewed band
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-20, bandY + 14);
    ctx.lineTo(W + 20, bandY);
    ctx.lineTo(W + 20, bandY + bandH - 14);
    ctx.lineTo(-20, bandY + bandH);
    ctx.closePath();
    const bg = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
    bg.addColorStop(0, 'rgba(10, 6, 18, 0.96)');
    bg.addColorStop(1, 'rgba(24, 8, 14, 0.96)');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.clip();
    // Speed lines inside the band
    ctx.strokeStyle = hexToRgba(glow, 0.35);
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const ly = bandY + ((i * 37) % bandH);
      const off = ((u.frame * 22 + i * 61) % (W + 200)) - 100;
      const lx = fromLeft ? off : W - off;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + (fromLeft ? -80 : 80), ly);
      ctx.stroke();
    }
    // Fighter render, large, with glow
    const sprites = f && f.sprites ? (f.sprites.ULTIMATE || f.sprites.ATTACK_HP || f.sprites.VICTORY || f.sprites.IDLE) : null;
    const img = sprites ? sprites[Math.min(sprites.length - 1, 1)] || sprites[0] : null;
    if (img) {
      const sc = 2.1;
      const iw = 80 * sc, ih = 90 * sc;
      const ix = fromLeft ? 26 : W - 26 - iw;
      ctx.save();
      ctx.shadowColor = glow;
      ctx.shadowBlur = 18;
      ctx.imageSmoothingEnabled = false;
      if (!fromLeft) {
        ctx.translate(ix + iw, bandY - 20);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, iw, ih);
      } else {
        ctx.drawImage(img, ix, bandY - 20, iw, ih);
      }
      ctx.restore();
    }
    ctx.restore();

    // Edges
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, bandY + 14); ctx.lineTo(W + 20, bandY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-20, bandY + bandH); ctx.lineTo(W + 20, bandY + bandH - 14); ctx.stroke();

    // Text
    const tx = fromLeft ? W - 30 : 30;
    const align = fromLeft ? 'right' : 'left';
    const name = u.ultimateName || u.name || 'ULTIMATE';
    if (u.kanji) drawText(ctx, u.kanji, tx, bandY + 44, { font: `900 30px "Yu Mincho", "MS Mincho", "IPAGothic", serif`, color: hexToRgba(glow, 0.9), align, outline: 3 });
    drawText(ctx, name, tx, bandY + 72, { font: FONTS.display(name.length > 26 ? 15 : 19), color: COLORS.text, align, outline: 4 });
    if (u.subtitle) drawText(ctx, u.subtitle, tx, bandY + 90, { font: FONTS.ui(8, 800), color: COLORS.gold, align, letterSpacing: 1.5 });
    ctx.restore();
  }

  // ---------- Controls helper ----------
  renderControlsHelper(ctx, f1, W, H) {
    if (!f1) return;
    const hasGamepad = input.hasGamepadConnected ? input.hasGamepadConnected() : false;

    // Bottom-centre pill: [TAB] GUIDE | [P] MOVE LIST (click areas in Game.js: y 336..358, x 210..440)
    const pillW = 210;
    const pillH = 15;
    const pillX = Math.round(W / 2 - pillW / 2);
    const pillY = H - 19;
    ctx.save();
    ctx.fillStyle = 'rgba(8, 7, 12, 0.8)';
    slantPath(ctx, pillX, pillY, pillW, pillH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(pillX + pillW * 0.55, pillY + 3, 1, pillH - 6);
    drawText(ctx, `TAB  GUIDE ${this.showControlsHelper ? 'ON' : 'OFF'}`, pillX + pillW * 0.28, pillY + 10.5, { font: FONTS.ui(7.5, 800), color: this.showControlsHelper ? COLORS.meter : COLORS.textDim, align: 'center' });
    drawText(ctx, hasGamepad ? 'START  MOVE LIST' : 'P  MOVE LIST', pillX + pillW * 0.78, pillY + 10.5, { font: FONTS.ui(7.5, 800), color: COLORS.gold, align: 'center' });
    ctx.restore();

    if (!this.showControlsHelper) return;

    const cat = getFighterCatalogEntry(f1.id);
    const sp = (i) => (cat && cat.specials && cat.specials[i] ? cat.specials[i].name : `Special ${i + 1}`);
    const items = hasGamepad
      ? [
        { key: 'X', label: 'LP' }, { key: 'Y', label: 'HP' }, { key: 'A', label: 'LK' }, { key: 'B', label: 'HK' },
        { key: 'RB', label: sp(0) }, { key: 'RT', label: sp(1) }, { key: 'LB', label: sp(2) },
        { key: 'X+A', label: 'Throw' }, { key: 'R3', label: 'Ultimate' }, { key: 'LT', label: 'Dirty / Breaker' }
      ]
      : [
        { key: 'U', label: 'LP' }, { key: 'I', label: 'HP' }, { key: 'J', label: 'LK' }, { key: 'K', label: 'HK' },
        { key: 'Q', label: sp(0) }, { key: 'E', label: sp(1) }, { key: 'R', label: sp(2) },
        { key: 'U+J', label: 'Throw' }, { key: 'SPACE', label: 'Ultimate' }, { key: 'C', label: 'Dirty / Breaker' }
      ];
    const y = H - 42;
    ctx.save();
    const grad = ctx.createLinearGradient(0, y - 14, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 12, W, 16);
    ctx.restore();
    drawPromptRow(ctx, items, W / 2, y);
  }
}

// Parallelogram that leans toward the centre of the screen for mirrored bars
function slantPathDir(ctx, x, y, w, h, slant, leanRight) {
  ctx.beginPath();
  if (leanRight) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w + slant, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x - slant, y + h);
  } else {
    ctx.moveTo(x - slant, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + slant, y + h);
    ctx.lineTo(x, y + h);
  }
  ctx.closePath();
}

// Compact single-line prompt row that shrinks to fit
function drawPromptRow(ctx, items, cx, y) {
  ctx.save();
  const keyFont = FONTS.ui(7, 900);
  const labelFont = FONTS.ui(7, 700);
  const gap = 7;
  const measure = () => items.map(it => {
    ctx.font = keyFont;
    const kw = Math.max(11, Math.ceil(ctx.measureText(it.key).width) + 6);
    ctx.font = labelFont;
    return { kw, lw: ctx.measureText(it.label).width };
  });
  const m = measure();
  const total = m.reduce((a, b) => a + b.kw + 3 + b.lw, 0) + gap * (items.length - 1);
  const maxW = 600;
  const sc = Math.min(1, maxW / total);
  ctx.translate(cx, y);
  ctx.scale(sc, sc);
  let x = -total / 2;
  items.forEach((it, i) => {
    drawKeyCap(ctx, it.key, x, -8, { h: 10, font: keyFont, color: COLORS.text, bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.3)' });
    ctx.font = labelFont;
    ctx.fillStyle = COLORS.textDim;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.label, x + m[i].kw + 3, -2.5);
    x += m[i].kw + 3 + m[i].lw + gap;
  });
  ctx.restore();
}
