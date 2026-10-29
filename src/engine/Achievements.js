// Final Impact - Steam Achievements Engine & Sliding Toast Notification System
import { soundFX } from '../audio/SoundFX.js';

export const ACHIEVEMENTS = [
  {
    id: 'FIRST_BLOOD',
    title: 'FIRST IMPACT',
    desc: 'Land your first strike in tournament combat.',
    icon: '🥊'
  },
  {
    id: 'STANCE_BREAKER',
    title: 'SHATTERED POISE',
    desc: 'Deplete an opponent\'s poise bar to trigger a Stance Break.',
    icon: '💥'
  },
  {
    id: 'CRITICAL_RIPOSTE',
    title: 'TARNISHED RIPOSTE',
    desc: 'Execute a devastating Critical Riposte on a stance-broken foe.',
    icon: '🗡️'
  },
  {
    id: 'ULTIMATE_JUTSU',
    title: 'SECRET OUGI',
    desc: 'Unleash a cinematic Naruto Ultimate Secret Technique.',
    icon: '⚡'
  },
  {
    id: 'FATALITY_EXECUTOR',
    title: 'FLAWLESS EXECUTION',
    desc: 'Execute a lethal character-specific Fatality sequence.',
    icon: '💀'
  },
  {
    id: 'PERFECT_ROUND',
    title: 'UNTOUCHABLE',
    desc: 'Win a combat round with 100% full health (Flawless Victory).',
    icon: '👑'
  },
  {
    id: 'FASHION_ICON',
    title: 'DRIP LEGEND',
    desc: 'Equip custom battle aura, hit sparks, and prestigious title badge.',
    icon: '✨'
  },
  {
    id: 'BIG_SPENDER',
    title: 'HIGH ROLLER',
    desc: 'Purchase an exclusive cosmetic skin from the Fighter\'s Vault.',
    icon: '🪙'
  },
  {
    id: 'DRAGON_SLAYER',
    title: 'GOD SLAIN',
    desc: 'Slay the Mythic Endless Dragon in Campaign mode.',
    icon: '🐉'
  },
  {
    id: 'VOID_AWAKENING',
    title: 'VOID ASCENSION',
    desc: 'Awaken the secret primordial deity M1GHTY in combat.',
    icon: '🌌'
  },
  {
    id: 'CAMPAIGN_CHAMPION',
    title: 'STREET GRANDMASTER',
    desc: 'Conquer all 8 brutal boss stages of the arcade Campaign.',
    icon: '🏆'
  }
];

const STORAGE_KEY = 'final_impact_achievements';

export class Achievements {
  constructor() {
    this.unlocked = {};
    this.toastQueue = [];
    this.activeToast = null;
    this.toastTimer = 0;
    this.toastSlide = 0; // 0 (hidden off-screen) to 1 (fully visible)
    this.load();
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.unlocked = JSON.parse(raw);
        }
      }
    } catch (e) {
      this.unlocked = {};
    }
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.unlocked));
      }
    } catch (e) {}
  }

  isUnlocked(id) {
    return !!this.unlocked[id];
  }

  unlock(id) {
    if (this.unlocked[id]) return false;

    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return false;

    this.unlocked[id] = Date.now();
    this.save();

    // Queue for sliding toast notification
    this.toastQueue.push(ach);

    // Audio chime
    try {
      soundFX.playAnnouncer('FLAWLESS');
    } catch (e) {
      try { soundFX.playMenuSelect(); } catch (err) {}
    }

    return true;
  }

  update() {
    // Process toast queue
    if (!this.activeToast && this.toastQueue.length > 0) {
      this.activeToast = this.toastQueue.shift();
      this.toastTimer = 180; // 3 seconds at 60fps
      this.toastSlide = 0;
    }

    if (this.activeToast) {
      this.toastTimer--;

      // Slide in (first 20 frames)
      if (this.toastTimer > 160) {
        this.toastSlide = Math.min(1, this.toastSlide + 0.05);
      }
      // Slide out (last 20 frames)
      else if (this.toastTimer < 20) {
        this.toastSlide = Math.max(0, this.toastSlide - 0.05);
      } else {
        this.toastSlide = 1;
      }

      if (this.toastTimer <= 0) {
        this.activeToast = null;
        this.toastSlide = 0;
      }
    }
  }

  render(ctx, W, H) {
    if (!this.activeToast || this.toastSlide <= 0) return;

    ctx.save();
    const toastW = 196;
    const toastH = 34;
    const margin = 10;
    // Slides in from the right, just under the P2 name plate (clear of meters and the guide)
    const targetX = W - toastW - margin;
    const offscreenX = W + 10;
    const x = offscreenX + (targetX - offscreenX) * this.toastSlide;
    const y = 64;
    const UI = '"Bahnschrift", "Segoe UI", "Inter", Arial, sans-serif';

    ctx.globalAlpha = Math.min(1, this.toastSlide * 1.5);
    ctx.fillStyle = 'rgba(8, 7, 12, 0.92)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y); ctx.lineTo(x + toastW, y); ctx.lineTo(x + toastW - 8, y + toastH); ctx.lineTo(x, y + toastH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#f5c542';
    ctx.fillRect(x + 4, y + 4, 2, toastH - 8);

    // Icon
    ctx.font = '15px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.activeToast.icon || '🏆', x + 22, y + toastH / 2 + 1);

    const textX = x + 38;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 6.5px ${UI}`;
    ctx.fillStyle = '#f5c542';
    ctx.fillText('ACHIEVEMENT UNLOCKED', textX, y + 11);
    ctx.font = `900 10px ${UI}`;
    ctx.fillStyle = '#f4efe4';
    ctx.fillText(this.activeToast.title, textX, y + 22, toastW - 50);
    ctx.font = `600 6.5px ${UI}`;
    ctx.fillStyle = '#a7a1b3';
    const desc = this.activeToast.desc.length > 44 ? this.activeToast.desc.substring(0, 42) + '…' : this.activeToast.desc;
    ctx.fillText(desc, textX, y + 30, toastW - 50);
    ctx.restore();
  }
}

export const achievements = new Achievements();
