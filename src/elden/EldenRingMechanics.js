// Final Impact - Elden Ring Boss Mechanics & Presentation Engine
// Implements Poise/Stance Break, Critical Riposte, "YOU DIED" sequence,
// "GREAT ENEMY FELLED" / "GOD SLAIN" banners, and Site of Grace resting checkpoints.

import { soundFX } from '../audio/SoundFX.js';
import { announcer } from '../audio/Announcer.js';
import { EconomyManager } from '../shop/SkinCatalog.js';
import { COLORS, FONTS, hexToRgba, slantPath, drawText, drawTitleText, drawBackdrop, drawVignette, drawPromptBar } from '../ui/Theme.js';

export class EldenRingManager {
  constructor() {
    this.youDiedActive = false;
    this.youDiedTimer = 0;
    this.felledBannerActive = false;
    this.felledBannerText = 'GREAT ENEMY FELLED';
    this.felledBannerTimer = 0;

    // Site of Grace State
    this.graceActive = false;
    this.graceMenuIndex = 0; // 0: Rest & Refill, 1: Level Up Vigor, 2: Level Up Strength, 3: Venture Forth
    this.flaskCharges = 2; // Crimson Flask heals
    this.maxFlaskCharges = 2;

    // Player Elden RPG Upgrades (Persisted)
    this.upgrades = this.loadUpgrades();
  }

  loadUpgrades() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('final_impact_elden_upgrades');
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {}
    return { vigor: 0, strength: 0, dexterity: 0 };
  }

  saveUpgrades() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_elden_upgrades', JSON.stringify(this.upgrades));
      }
    } catch (e) {}
  }

  getUpgradeCost(stat) {
    const curLevel = this.upgrades[stat] || 0;
    return 200 + curLevel * 150;
  }

  triggerYouDied() {
    this.youDiedActive = true;
    this.youDiedTimer = 0;
    announcer.youDied();
    try { soundFX.playLowGong(); } catch (e) {}
  }

  triggerFelledBanner(bossId) {
    this.felledBannerActive = true;
    this.felledBannerTimer = 0;

    if (bossId === 'endless_dragon') {
      this.felledBannerText = 'G O D   S L A I N';
      announcer.godSlain();
    } else if (bossId === 'champion' || bossId === 'urban_legend') {
      this.felledBannerText = 'L E G E N D   F E L L E D';
      announcer.legendFelled();
    } else {
      this.felledBannerText = 'G R E A T   E N E M Y   F E L L E D';
      announcer.greatEnemyFelled();
    }

    try { soundFX.playUltimateActivation(); } catch (e) {}
  }

  // Applies Elden Ring stat upgrades to player fighter
  applyUpgradesToFighter(fighter) {
    if (!fighter) return;
    const bonusHp = (this.upgrades.vigor || 0) * 100;
    fighter.maxHealth += bonusHp;
    fighter.health = fighter.maxHealth;
    fighter.damageMultiplier = 1.0 + (this.upgrades.strength || 0) * 0.08;
    fighter.walkSpeed *= 1.0 + (this.upgrades.dexterity || 0) * 0.04;
  }

  // --- STANCE / POISE BREAK MECHANIC ---
  checkStanceBreak(target, damage) {
    if (!target) return false;
    if (target.poise === undefined) target.poise = 100;
    target.poise = Math.max(0, target.poise - damage * 0.35);

    if (target.poise <= 0 && !target.isStanceBroken) {
      target.isStanceBroken = true;
      target.stanceBreakTimer = 240; // 4 seconds dazed window
      try {
        soundFX.playParryChime();
        soundFX.playUltimateActivation();
      } catch (e) {}
      return true;
    }
    return false;
  }

  updateStance(fighter) {
    if (!fighter) return;
    if (fighter.isStanceBroken) {
      fighter.stanceBreakTimer--;
      if (fighter.stanceBreakTimer <= 0) {
        fighter.isStanceBroken = false;
        fighter.poise = 100;
      }
    } else if (fighter.poise < 100) {
      fighter.poise = Math.min(100, fighter.poise + 0.15); // Gradual poise recovery
    }
  }

  update() {
    if (this.youDiedActive) {
      this.youDiedTimer++;
    }
    if (this.felledBannerActive) {
      this.felledBannerTimer++;
      if (this.felledBannerTimer > 300) {
        this.felledBannerActive = false;
      }
    }
  }

  // Render "YOU DIED" fullscreen cinematic overlay
  renderYouDied(ctx, W, H) {
    if (!this.youDiedActive) return;
    const t = this.youDiedTimer;
    const alpha = Math.min(0.92, t * 0.02);

    // Deep black letterbox
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, W, H);

    // Cinematic Red Letterbox Bars
    const barH = 50;
    ctx.fillStyle = '#1c0505';
    ctx.fillRect(0, 0, W, barH);
    ctx.fillRect(0, H - barH, W, barH);

    // Crimson "YOU DIED" serif lettering
    if (t > 20) {
      const textAlpha = Math.min(1.0, (t - 20) * 0.03);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#b91c1c';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 18;
      ctx.font = '900 36px serif';
      ctx.fillText('Y O U   D I E D', W / 2, H / 2 + 8);
      ctx.shadowBlur = 0;

      // Subtitle prompt
      if (t > 80) {
        ctx.fillStyle = '#fca5a5';
        ctx.font = '8px "Press Start 2P", monospace';
        const pulse = Math.floor(t / 20) % 2 === 0 ? 1 : 0.6;
        ctx.globalAlpha = pulse;
        ctx.fillText('PRESS ANY KEY TO REVIVE AT SITE OF GRACE', W / 2, H / 2 + 54);
      }
      ctx.restore();
    }
  }

  // Render Golden "GREAT ENEMY FELLED / GOD SLAIN" banner
  renderFelledBanner(ctx, W, H) {
    if (!this.felledBannerActive) return;
    const t = this.felledBannerTimer;
    const alpha = t < 30 ? t / 30 : (t > 250 ? Math.max(0, (300 - t) / 50) : 1);

    ctx.save();
    ctx.globalAlpha = alpha * 0.95;

    // Shimmering Golden horizontal rules
    const bannerY = H * 0.35;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.15, bannerY - 30);
    ctx.lineTo(W * 0.85, bannerY - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(W * 0.15, bannerY + 20);
    ctx.lineTo(W * 0.85, bannerY + 20);
    ctx.stroke();

    // Golden text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
    ctx.shadowBlur = 16;
    ctx.font = '900 24px serif';
    ctx.fillText(this.felledBannerText, W / 2, bannerY);
    ctx.shadowBlur = 0;

    // Drifting Grace particles
    for (let i = 0; i < 16; i++) {
      const px = ((i * 47 + t * 2) % (W * 0.7)) + W * 0.15;
      const py = bannerY - 24 + Math.sin(t * 0.05 + i) * 16;
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px, py, 2, 2);
    }

    ctx.restore();
  }

  // Render Site of Grace Rest Screen
  renderSiteOfGrace(ctx, W, H) {
    if (!this.graceActive) return;
    this._graceT = (this._graceT || 0) + 1;
    const t = this._graceT;
    const time = t * 0.05;

    drawBackdrop(ctx, W, H, t, { tint: '#6b4a0c' });

    // ---- The grace: a golden spire of light on the left ----
    const spireX = 168;
    const baseY = 286;
    const pulse = 0.5 + Math.sin(t * 0.05) * 0.5;
    const halo = ctx.createRadialGradient(spireX, baseY - 80, 4, spireX, baseY - 80, 170);
    halo.addColorStop(0, hexToRgba(COLORS.gold, 0.32 + pulse * 0.1));
    halo.addColorStop(0.5, hexToRgba(COLORS.goldDeep, 0.12));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    // light column
    const col = ctx.createLinearGradient(0, baseY - 230, 0, baseY);
    col.addColorStop(0, 'rgba(255, 240, 190, 0)');
    col.addColorStop(0.6, hexToRgba(COLORS.goldPale, 0.55));
    col.addColorStop(1, hexToRgba(COLORS.goldPale, 0.95));
    ctx.fillStyle = col;
    ctx.fillRect(spireX - 2, baseY - 230, 4, 230);
    const beam = ctx.createLinearGradient(spireX - 14, 0, spireX + 14, 0);
    beam.addColorStop(0, 'rgba(0,0,0,0)');
    beam.addColorStop(0.5, hexToRgba(COLORS.gold, 0.22 + pulse * 0.08));
    beam.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beam;
    ctx.fillRect(spireX - 14, baseY - 200, 28, 200);
    // ground disc
    ctx.save();
    ctx.translate(spireX, baseY);
    ctx.scale(1, 0.22);
    const disc = ctx.createRadialGradient(0, 0, 2, 0, 0, 80);
    disc.addColorStop(0, hexToRgba(COLORS.goldPale, 0.9));
    disc.addColorStop(0.3, hexToRgba(COLORS.gold, 0.35));
    disc.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // drifting grace motes
    for (let i = 0; i < 30; i++) {
      const a = i * 0.7 + time * (0.4 + (i % 3) * 0.15);
      const r = 14 + (i % 7) * 9;
      const rise = (t * (0.3 + (i % 4) * 0.1) + i * 23) % 200;
      const gx = spireX + Math.cos(a) * r;
      const gy = baseY - rise;
      ctx.globalAlpha = Math.max(0, 1 - rise / 200) * 0.9;
      ctx.fillStyle = i % 2 === 0 ? COLORS.goldPale : COLORS.gold;
      ctx.fillRect(gx, gy, i % 5 === 0 ? 2 : 1.5, i % 5 === 0 ? 2 : 1.5);
    }
    ctx.globalAlpha = 1;
    drawVignette(ctx, W, H, 0.55);

    // ---- Title ----
    drawTitleText(ctx, 'SITE OF GRACE', spireX, 52, 26, { outline: 4 });
    drawText(ctx, 'REST  ·  GROW STRONGER  ·  VENTURE FORTH', spireX, 66, {
      font: FONTS.ui(8, 800), color: COLORS.textDim, align: 'center', letterSpacing: 1.5
    });

    // ---- Wallet ----
    const coins = EconomyManager.getCoins();
    const wx = W - 16 - 120, wy = 16;
    slantPath(ctx, wx, wy, 120, 18, 5);
    ctx.fillStyle = 'rgba(10,10,16,0.8)';
    ctx.fill();
    ctx.strokeStyle = hexToRgba(COLORS.gold, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(wx + 15, wy + 9, 4.5, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, coins.toLocaleString(), wx + 25, wy + 13.5, { font: FONTS.display(12), color: COLORS.goldPale });
    drawText(ctx, 'RUNES', wx + 110, wy + 12.5, { font: FONTS.ui(8, 800), color: COLORS.textDim, align: 'right', letterSpacing: 1 });

    // ---- Menu ----
    const vigorCost = this.getUpgradeCost('vigor');
    const strCost = this.getUpgradeCost('strength');
    const options = [
      { title: 'REST', desc: 'Refill your Crimson Flasks', right: `${this.flaskCharges}/${this.maxFlaskCharges} FLASKS`, rightColor: COLORS.crimson },
      { title: 'LEVEL UP VIGOR', desc: `Max HP +100  ·  currently LV ${this.upgrades.vigor || 0}`, cost: vigorCost },
      { title: 'LEVEL UP STRENGTH', desc: `Damage +8%  ·  currently LV ${this.upgrades.strength || 0}`, cost: strCost },
      { title: 'VENTURE FORTH', desc: 'Leave the grace and enter the next arena', right: '▶', rightColor: COLORS.gold }
    ];
    const mx = 318, mw = W - mx - 18, my0 = 92, rowH = 44, gap = 8;
    const targetY = my0 + this.graceMenuIndex * (rowH + gap);
    this._graceSelY = this._graceSelY === undefined ? targetY : this._graceSelY + (targetY - this._graceSelY) * 0.3;

    options.forEach((opt, i) => {
      const y = my0 + i * (rowH + gap);
      slantPath(ctx, mx, y, mw, rowH, 10);
      ctx.fillStyle = 'rgba(12, 11, 18, 0.82)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    // gliding selection
    {
      const sy = this._graceSelY;
      const g = ctx.createLinearGradient(mx, 0, mx + mw, 0);
      g.addColorStop(0, hexToRgba(COLORS.goldDeep, 0.6));
      g.addColorStop(1, hexToRgba(COLORS.goldDeep, 0.08));
      slantPath(ctx, mx, sy, mw, rowH, 10);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = hexToRgba(COLORS.gold, 0.8);
      ctx.stroke();
    }
    options.forEach((opt, i) => {
      const y = my0 + i * (rowH + gap);
      const sel = i === this.graceMenuIndex;
      drawText(ctx, opt.title, mx + 22, y + 19, { font: FONTS.display(14), color: sel ? '#fff' : COLORS.textDim });
      drawText(ctx, opt.desc, mx + 22, y + 33, { font: FONTS.ui(8, 600), color: sel ? COLORS.text : COLORS.textMute, maxWidth: mw - 120 });
      if (opt.cost !== undefined) {
        const afford = coins >= opt.cost;
        drawText(ctx, opt.cost.toLocaleString(), mx + mw - 18, y + 26, { font: FONTS.display(13), color: afford ? COLORS.goldPale : COLORS.bad, align: 'right' });
        ctx.font = FONTS.display(13);
        const cw = ctx.measureText(opt.cost.toLocaleString()).width;
        ctx.fillStyle = afford ? COLORS.gold : COLORS.bad;
        ctx.beginPath();
        ctx.arc(mx + mw - 18 - cw - 8, y + 22, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (opt.right) {
        drawText(ctx, opt.right, mx + mw - 18, y + 26, { font: FONTS.ui(9, 800), color: opt.rightColor || COLORS.text, align: 'right', letterSpacing: 1 });
      }
    });

    drawPromptBar(ctx, [{ key: 'W/S', label: 'SELECT' }, { key: 'ENTER', label: 'CONFIRM' }], W / 2, H - 8);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  handleGraceInput(inputState) {
    if (inputState.up) {
      this.graceMenuIndex = (this.graceMenuIndex - 1 + 4) % 4;
      soundFX.playWhoosh('light');
    } else if (inputState.down) {
      this.graceMenuIndex = (this.graceMenuIndex + 1) % 4;
      soundFX.playWhoosh('light');
    }

    if (inputState.confirm || inputState.lp) {
      return this.executeGraceSelection();
    }
    return null;
  }

  executeGraceSelection() {
    const idx = this.graceMenuIndex;
    if (idx === 0) {
      // Rest & Refill
      this.flaskCharges = this.maxFlaskCharges;
      try { soundFX.playUltimateActivation(); } catch (e) {}
      return { action: 'rest' };
    } else if (idx === 1) {
      // Vigor
      const cost = this.getUpgradeCost('vigor');
      if (EconomyManager.spendCoins(cost)) {
        this.upgrades.vigor = (this.upgrades.vigor || 0) + 1;
        this.saveUpgrades();
        try { soundFX.playUltimateActivation(); } catch (e) {}
        return { action: 'level_vigor' };
      } else {
        try { soundFX.playBlock(); } catch (e) {}
      }
    } else if (idx === 2) {
      // Strength
      const cost = this.getUpgradeCost('strength');
      if (EconomyManager.spendCoins(cost)) {
        this.upgrades.strength = (this.upgrades.strength || 0) + 1;
        this.saveUpgrades();
        try { soundFX.playUltimateActivation(); } catch (e) {}
        return { action: 'level_strength' };
      } else {
        try { soundFX.playBlock(); } catch (e) {}
      }
    } else if (idx === 3) {
      // Venture forth
      this.graceActive = false;
      try { soundFX.playMenuSelect(); } catch (e) {}
      return { action: 'proceed' };
    }
    return null;
  }
}

export const eldenManager = new EldenRingManager();
