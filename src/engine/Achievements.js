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

    const toastW = 230;
    const toastH = 46;
    const margin = 12;

    // Slide in from bottom right
    const targetX = W - toastW - margin;
    const offscreenX = W + 10;
    const currentX = offscreenX + (targetX - offscreenX) * this.toastSlide;
    const currentY = H - toastH - margin;

    // Toast Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(currentX + 3, currentY + 3, toastW, toastH);

    // Dark Carbon Steel Body
    const grad = ctx.createLinearGradient(currentX, currentY, currentX, currentY + toastH);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = grad;
    ctx.fillRect(currentX, currentY, toastW, toastH);

    // Steam Golden Border Glow
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(currentX, currentY, toastW, toastH);

    // Left Icon Badge Box
    const iconBoxSize = 34;
    const iconBoxX = currentX + 6;
    const iconBoxY = currentY + 6;

    ctx.fillStyle = '#292524';
    ctx.fillRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1;
    ctx.strokeRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize);

    // Emoji / Icon
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.activeToast.icon || '🏆', iconBoxX + iconBoxSize / 2, iconBoxY + iconBoxSize / 2);

    // Header label: ACHIEVEMENT UNLOCKED
    const textX = currentX + iconBoxSize + 14;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('STEAM ACHIEVEMENT UNLOCKED', textX, currentY + 8);

    // Achievement Title
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.activeToast.title, textX, currentY + 18);

    // Achievement Description
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = '#a8a29e';
    const cleanDesc = this.activeToast.desc.length > 32 
      ? this.activeToast.desc.substring(0, 30) + '...' 
      : this.activeToast.desc;
    ctx.fillText(cleanDesc, textX, currentY + 30);

    ctx.restore();
  }
}

export const achievements = new Achievements();
