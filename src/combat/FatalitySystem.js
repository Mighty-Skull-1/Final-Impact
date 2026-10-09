// Final Impact - Mortal Kombat Fatality & Finisher Presentation Engine
// Supports Character-Specific Fatalities, Hazardous Stage Fatalities, and Brutalities.

import { soundFX } from '../audio/SoundFX.js';
import { announcer } from '../audio/Announcer.js';
import { FIGHTER_STATE } from '../engine/Constants.js';

export const FATALITY_CATALOG = {
  kazuki: {
    id: 'dragon_cremation',
    name: 'DRAGON CREMATION',
    japanese: '龍 炎 葬',
    inputDesc: '↓ ↓ HP (or SPACE)',
    color: '#ef4444',
    secondaryColor: '#f59e0b',
    type: 'flame_pillar'
  },
  raven: {
    id: 'orbital_annihilation',
    name: 'ORBITAL ANNIHILATION',
    japanese: '軌 道 砲',
    inputDesc: '↓ → HP (or SPACE)',
    color: '#06b6d4',
    secondaryColor: '#38bdf8',
    type: 'orbital_laser'
  },
  kagura: {
    id: 'shadow_decapitation',
    name: 'SHADOW DECAPITATION',
    japanese: '影 刃 断',
    inputDesc: '← → HK (or SPACE)',
    color: '#a855f7',
    secondaryColor: '#e879f9',
    type: 'shadow_clone'
  },
  fang: {
    id: 'wolf_pack_massacre',
    name: 'WOLF PACK MASSACRE',
    japanese: '狼 群 殺',
    inputDesc: '→ → HP (or SPACE)',
    color: '#e11d48',
    secondaryColor: '#fb7185',
    type: 'spirit_slash'
  },
  zephyr: {
    id: 'tempest_slice',
    name: 'TEMPEST SLICE',
    japanese: '暴 風 裂',
    inputDesc: '↓ ↑ HK (or SPACE)',
    color: '#10b981',
    secondaryColor: '#6ee7b7',
    type: 'cyclone'
  },
  colossus: {
    id: 'seismic_crush',
    name: 'SEISMIC CRUSH',
    japanese: '地 震 圧',
    inputDesc: '↓ ↓ HK (or SPACE)',
    color: '#f97316',
    secondaryColor: '#fdba74',
    type: 'earth_crush'
  },
  cinder: {
    id: 'inferno_eruption',
    name: 'INFERNO ERUPTION',
    japanese: '業 火 噴',
    inputDesc: '→ ↓ HP (or SPACE)',
    color: '#dc2626',
    secondaryColor: '#facc15',
    type: 'magma_erupt'
  },
  glacier: {
    id: 'absolute_zero',
    name: 'ABSOLUTE ZERO',
    japanese: '絶 対 零',
    inputDesc: '↓ ← HP (or SPACE)',
    color: '#38bdf8',
    secondaryColor: '#e0f2fe',
    type: 'ice_shatter'
  },
  mighty: {
    id: 'void_singularity',
    name: 'VOID SINGULARITY',
    japanese: '虚 無 崩',
    inputDesc: '↓ ↓ SPACE',
    color: '#ec4899',
    secondaryColor: '#8b5cf6',
    type: 'black_hole'
  },
  endless_dragon: {
    id: 'primeval_extinction',
    name: 'PRIMEVAL EXTINCTION',
    japanese: '原 初 滅',
    inputDesc: '↓ ↓ HP',
    color: '#facc15',
    secondaryColor: '#ef4444',
    type: 'dragon_breath'
  }
};

export class FatalitySystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.phase = 'none'; // 'none' | 'cinematic' | 'banner' | 'done'
    this.t = 0;
    this.type = 'fatality'; // 'fatality' | 'stage_fatality' | 'brutality'
    this.finisherData = null;
    this.winner = null;
    this.loser = null;
    this.stageId = '';
    this.particles = [];
    this.flash = 0;
    this.slowMo = 1.0;
  }

  start(winner, loser, stageId, chosenType = 'fatality') {
    this.reset();
    this.active = true;
    this.phase = 'cinematic';
    this.winner = winner;
    this.loser = loser;
    this.stageId = stageId || 'cyber_city';
    this.type = chosenType;
    this.t = 0;

    const charId = winner ? winner.id : 'kazuki';
    this.finisherData = FATALITY_CATALOG[charId] || FATALITY_CATALOG.kazuki;

    if (winner && loser) {
      const dir = loser.x >= winner.x ? 1 : -1;
      winner.facingRight = dir === 1;
      winner.x = Math.max(80, Math.min(880, loser.x - dir * 85));
      winner.vx = 0;
      winner.changeState(FIGHTER_STATE.VICTORY, true);

      loser.vx = 0;
      loser.vy = 0;
      loser.isGrounded = true;
    }

    try {
      soundFX.stopMusic();
      soundFX.playUltimateActivation();
    } catch (e) {}
  }

  triggerStageFatality(winner, loser, stageId) {
    this.start(winner, loser, stageId, 'stage_fatality');
  }

  triggerBrutality(winner, loser, stageId) {
    this.start(winner, loser, stageId, 'brutality');
  }

  spawnParticle(x, y, vx, vy, color, size = 3, life = 45) {
    this.particles.push({ x, y, vx, vy, color, size, life, maxLife: life });
  }

  spawnBurst(x, y, color, count = 35, speedMax = 8) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * speedMax;
      this.spawnParticle(
        x, y,
        Math.cos(a) * sp,
        Math.sin(a) * sp - 2,
        color,
        2 + Math.random() * 4,
        30 + Math.random() * 35
      );
    }
  }

  update(hud) {
    if (!this.active) return false;
    this.t++;
    if (this.flash > 0) this.flash -= 0.05;

    // Particle physics
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.life--;
      return p.life > 0;
    });

    const w = this.winner;
    const l = this.loser;
    const data = this.finisherData;

    if (this.phase === 'cinematic') {
      // 0-40 frames: Charging energy, camera shake, sound buildup
      if (this.t < 40) {
        if (this.t % 4 === 0 && w) {
          const c = Math.random() < 0.6 ? data.color : data.secondaryColor;
          this.spawnParticle(w.x + (Math.random() - 0.5) * 40, w.y - 20, 0, -4 - Math.random() * 3, c, 3, 20);
        }
        if (hud && this.t % 8 === 0) hud.triggerShake(4);
      }

      // 40 frames: THE FATALITY IMPACT MOMENT
      if (this.t === 40 && l) {
        this.flash = 1.0;
        if (hud) hud.triggerShake(30);

        try {
          soundFX.playUltimateFinisher();
          soundFX.playHitHeavy();
        } catch (e) {}

        // Launch loser upward & backward
        const dir = (w && w.facingRight) ? 1 : -1;
        l.vx = dir * 12;
        l.vy = -18;
        l.isGrounded = false;

        // Big particle explosion
        this.spawnBurst(l.x, l.y - 50, data.color, 45, 9);
        this.spawnBurst(l.x, l.y - 50, data.secondaryColor, 35, 7);
        this.spawnBurst(l.x, l.y - 50, '#ffffff', 25, 11);
      }

      // 40-120 frames: Dramatic slow fall, trailing particles
      if (this.t > 40 && this.t < 120 && l) {
        if (this.t % 3 === 0) {
          this.spawnParticle(l.x, l.y - 40, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, data.color, 4, 30);
        }
      }

      // 120 frames: Transition to Gothic Banner phase & Announcer shout
      if (this.t >= 130) {
        this.phase = 'banner';
        this.t = 0;

        if (this.type === 'stage_fatality') {
          announcer.stageFatality();
        } else if (this.type === 'brutality') {
          announcer.brutality();
        } else {
          announcer.fatality();
        }

        try { soundFX.playLowGong(); } catch (e) {}
      }
    } else if (this.phase === 'banner') {
      // Hold banner for 180 frames (3 seconds)
      if (this.t >= 180) {
        this.phase = 'done';
        this.active = false;
        return true; // Sequence completed
      }
    }

    return false;
  }

  renderWorld(ctx) {
    if (!this.active) return;

    // Render particles
    this.particles.forEach(p => {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });

    const w = this.winner;
    const l = this.loser;
    const data = this.finisherData;

    // Flame Pillar (Kazuki / Cinder)
    if (this.phase === 'cinematic' && this.t >= 35 && this.t < 90 && l) {
      if (data.type === 'flame_pillar' || data.type === 'magma_erupt') {
        const h = Math.min(320, (this.t - 35) * 18);
        ctx.save();
        ctx.globalAlpha = 0.75;
        const grad = ctx.createLinearGradient(l.x - 40, 0, l.x + 40, 0);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        grad.addColorStop(0.3, '#f59e0b');
        grad.addColorStop(0.5, '#fef08a');
        grad.addColorStop(0.7, '#ef4444');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(l.x - 50, l.y - h, 100, h);
        ctx.restore();
      }

      // Orbital Laser (Raven)
      if (data.type === 'orbital_laser') {
        ctx.save();
        ctx.globalAlpha = 0.85;
        const beamGrad = ctx.createLinearGradient(l.x - 30, 0, l.x + 30, 0);
        beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        beamGrad.addColorStop(0.5, '#ffffff');
        beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(l.x - 35, 0, 70, l.y);
        ctx.restore();
      }

      // Void Singularity / Black Hole (M1GHTY)
      if (data.type === 'black_hole') {
        const r = Math.min(80, (this.t - 35) * 3);
        ctx.save();
        ctx.beginPath();
        ctx.arc(l.x, l.y - 50, r, 0, Math.PI * 2);
        ctx.fillStyle = '#09090b';
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  renderOverlay(ctx, W, H) {
    if (!this.active) return;
    const t = this.t;

    ctx.save();

    // Cinematic Letterbox Bars
    const barH = 46;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, barH);
    ctx.fillRect(0, H - barH, W, barH);

    // Flash
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, this.flash)})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (this.phase === 'cinematic') {
      // Subtitle of the finisher
      if (this.t > 45 && this.finisherData) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(this.finisherData.name, W / 2, barH + 24);

        if (this.finisherData.japanese) {
          ctx.font = '900 18px serif';
          ctx.fillStyle = '#dc2626';
          ctx.fillText(this.finisherData.japanese, W / 2, barH + 46);
        }
      }
    } else if (this.phase === 'banner') {
      // Blood-Red Mortal Kombat Banner
      const alpha = Math.min(1, t / 15);
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';

      let title = 'F A T A L I T Y';
      let sub = this.finisherData ? this.finisherData.name : 'PERFECT EXECUTION';
      let titleCol = '#dc2626';

      if (this.type === 'stage_fatality') {
        title = 'S T A G E   F A T A L I T Y';
        sub = 'HAZARDOUS ELIMINATION';
        titleCol = '#f97316';
      } else if (this.type === 'brutality') {
        title = 'B R U T A L I T Y';
        sub = 'SAVAGE UNBROKEN COMBO';
        titleCol = '#a855f7';
      }

      // Darkened backdrop ribbon
      ctx.fillStyle = 'rgba(10, 2, 4, 0.88)';
      ctx.fillRect(0, H / 2 - 50, W, 100);

      ctx.strokeStyle = titleCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H / 2 - 50);
      ctx.lineTo(W * 0.9, H / 2 - 50);
      ctx.moveTo(W * 0.1, H / 2 + 50);
      ctx.lineTo(W * 0.9, H / 2 + 50);
      ctx.stroke();

      // Big Title Shadow
      ctx.shadowColor = titleCol;
      ctx.shadowBlur = 25;
      ctx.fillStyle = titleCol;
      ctx.font = '900 42px serif';
      ctx.fillText(title, W / 2, H / 2 + 10);
      ctx.shadowBlur = 0;

      // Winner signature quote
      const winnerName = this.winner ? this.winner.name.toUpperCase() : 'PLAYER 1';
      ctx.fillStyle = '#fef08a';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`${winnerName} WINS`, W / 2, H / 2 + 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText(sub, W / 2, H / 2 - 28);
    }

    ctx.restore();
  }
}

export const fatalitySystem = new FatalitySystem();
