// Final Impact - Elden Ring Boss Mechanics & Presentation Engine
// Implements Poise/Stance Break, Critical Riposte, "YOU DIED" sequence,
// "GREAT ENEMY FELLED" / "GOD SLAIN" banners, and Site of Grace resting checkpoints.

import { soundFX } from '../audio/SoundFX.js';
import { announcer } from '../audio/Announcer.js';
import { EconomyManager } from '../shop/SkinCatalog.js';

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

    // Atmospheric Dusk background
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(0, 0, W, H);

    // Glowing Golden Grace Spire in center
    const spireX = W / 2;
    const spireY = H - 80;
    const grad = ctx.createRadialGradient(spireX, spireY - 60, 5, spireX, spireY - 60, 140);
    grad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(spireX, spireY - 60, 140, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Ray Spire
    ctx.fillStyle = '#fde047';
    ctx.fillRect(spireX - 3, spireY - 120, 6, 120);

    // Golden site base
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(spireX, spireY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Floating Grace particles
    const time = Date.now() * 0.003;
    for (let i = 0; i < 24; i++) {
      const a = i * 0.4 + time;
      const r = 20 + (i % 6) * 12;
      const gx = spireX + Math.cos(a) * r;
      const gy = spireY - 60 + Math.sin(a) * (r * 0.6) - (i % 8) * 8;
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#f59e0b';
      ctx.fillRect(gx, gy, 2.5, 2.5);
    }

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = '900 16px serif';
    ctx.fillText('S I T E   O F   G R A C E', W / 2, 34);

    ctx.font = '7px "Press Start 2P"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('REST, LEVEL UP ATTRIBUTES, AND PREPARE FOR THE NEXT TRIAL', W / 2, 48);

    // Wallet display
    const coins = EconomyManager.getCoins();
    ctx.fillStyle = '#facc15';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(`RUNES / COINS: 🪙 ${coins.toLocaleString()}`, W / 2, 66);

    // Menu options
    const options = [
      { id: 'rest', label: `REST & REFILL FLASK (${this.flaskCharges}/${this.maxFlaskCharges} CHARGES)` },
      { id: 'vigor', label: `LEVEL UP VIGOR (HP +100) — [🪙 ${this.getUpgradeCost('vigor')} COINS]` },
      { id: 'strength', label: `LEVEL UP STRENGTH (DMG +8%) — [🪙 ${this.getUpgradeCost('strength')} COINS]` },
      { id: 'venture', label: `VENTURE FORTH (ENTER NEXT ARENA)` }
    ];

    const menuY0 = 100;
    const itemH = 26;
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const isSel = (i === this.graceMenuIndex);
      const iy = menuY0 + i * itemH;

      if (isSel) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.fillRect(W / 2 - 200, iy, 400, 20);
        ctx.strokeStyle = '#facc15';
        ctx.strokeRect(W / 2 - 200, iy, 400, 20);
        ctx.fillStyle = '#fde047';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`▶ ${opt.label}`, W / 2, iy + 14);
      } else {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '7.5px "Press Start 2P"';
        ctx.fillText(`  ${opt.label}`, W / 2, iy + 14);
      }
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '6px "Press Start 2P"';
    ctx.fillText('[W/S or UP/DOWN] SELECT  |  [ENTER/SPACE] CONFIRM', W / 2, H - 16);
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
