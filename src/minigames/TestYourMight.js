// Final Impact - Mortal Kombat "Test Your Might" Button Mash Minigame
// Players mash attack keys to build meter above the chop threshold, then chop through
// materials (Wood, Stone, Steel, Diamond) to earn coins and tower glory.

import { soundFX } from '../audio/SoundFX.js';
import { announcer } from '../audio/Announcer.js';
import { EconomyManager } from '../shop/SkinCatalog.js';

export const TEST_MATERIALS = [
  { id: 'wood', name: 'PINE WOOD', requiredPower: 42, reward: 250, color: '#b45309', debrisColor: '#d97706' },
  { id: 'stone', name: 'GRANITE STONE', requiredPower: 58, reward: 500, color: '#64748b', debrisColor: '#94a3b8' },
  { id: 'steel', name: 'TEMPERED STEEL', requiredPower: 74, reward: 1000, color: '#0284c7', debrisColor: '#38bdf8' },
  { id: 'diamond', name: 'ELDEN DIAMOND', requiredPower: 88, reward: 2500, color: '#eab308', debrisColor: '#fef08a' }
];

export class TestYourMight {
  constructor() {
    this.reset();
  }

  reset(tier = 0) {
    this.active = false;
    this.tier = Math.max(0, Math.min(tier, TEST_MATERIALS.length - 1));
    this.material = TEST_MATERIALS[this.tier];
    this.power = 0;
    this.maxPower = 100;
    this.decayRate = 0.55 + this.tier * 0.18;
    this.timer = 300; // 5 seconds at 60fps
    this.state = 'playing'; // 'playing' | 'chop_success' | 'chop_fail' | 'done'
    this.animTimer = 0;
    this.debris = [];
    this.resultDelay = 0;
  }

  start(tier = 0) {
    this.reset(tier);
    this.active = true;
    try {
      announcer.testYourMight();
      soundFX.playGong();
    } catch (e) {}
  }

  handleInput(inputState) {
    if (!this.active || this.state !== 'playing') return;

    // Any attack button press builds power
    if (inputState.lp || inputState.hp || inputState.lk || inputState.hk || inputState.special1 || inputState.special2) {
      this.power = Math.min(this.maxPower, this.power + 5.5);
      try { soundFX.playHitLight(); } catch (e) {}
    }

    // Chop trigger (Space or Confirm or Down+HP)
    if (inputState.confirm || inputState.space || inputState.chop) {
      this.executeChop();
    }
  }

  executeChop() {
    if (this.state !== 'playing') return;

    if (this.power >= this.material.requiredPower) {
      // SUCCESS
      this.state = 'chop_success';
      this.resultDelay = 120;
      EconomyManager.addCoins(this.material.reward);
      try {
        soundFX.playUltimateFinisher();
        soundFX.playLowGong();
      } catch (e) {}
      this.spawnDebris(320, 220, this.material.debrisColor, 40);
    } else {
      // FAILURE
      this.state = 'chop_fail';
      this.resultDelay = 100;
      try {
        soundFX.playBlock();
      } catch (e) {}
    }
  }

  spawnDebris(x, y, color, count = 30) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 8;
      this.debris.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 3,
        color,
        size: 3 + Math.random() * 5,
        life: 40 + Math.random() * 30
      });
    }
  }

  update() {
    if (!this.active) return false;
    this.animTimer++;

    // Debris physics
    this.debris = this.debris.filter(d => {
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.3; // gravity
      d.life--;
      return d.life > 0;
    });

    if (this.state === 'playing') {
      // Meter decay
      this.power = Math.max(0, this.power - this.decayRate);

      // Timer countdown
      this.timer--;
      if (this.timer <= 0) {
        this.executeChop();
      }
    } else if (this.state === 'chop_success' || this.state === 'chop_fail') {
      this.resultDelay--;
      if (this.resultDelay <= 0) {
        this.active = false;
        return true; // Finished
      }
    }

    return false;
  }

  render(ctx, W = 640, H = 360) {
    if (!this.active) return;
    const t = this.animTimer;

    // Dark moody dojo background
    ctx.fillStyle = '#0f0a0d';
    ctx.fillRect(0, 0, W, H);

    // Stone pillars in background
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(40, 40, 50, H - 40);
    ctx.fillRect(W - 90, 40, 50, H - 40);

    // Title banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 24px serif';
    ctx.fillText('TEST YOUR MIGHT', W / 2, 44);

    ctx.fillStyle = '#fef08a';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(`MATERIAL: ${this.material.name}  |  REWARD: 🪙 ${this.material.reward}`, W / 2, 64);

    // Countdown clock
    const secRemain = Math.max(0, (this.timer / 60)).toFixed(1);
    ctx.fillStyle = this.timer < 60 ? '#ef4444' : '#ffffff';
    ctx.font = '900 18px monospace';
    ctx.fillText(`TIME: ${secRemain}s`, W / 2, 92);

    // Center Karate Stand & Material Block
    const blockX = W / 2;
    const blockY = 220;

    // Pedestal
    ctx.fillStyle = '#292524';
    ctx.fillRect(blockX - 60, blockY, 120, 70);
    ctx.strokeStyle = '#44403c';
    ctx.strokeRect(blockX - 60, blockY, 120, 70);

    // Target Material Block
    if (this.state !== 'chop_success') {
      ctx.fillStyle = this.material.color;
      ctx.fillRect(blockX - 45, blockY - 30, 90, 30);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(blockX - 45, blockY - 30, 90, 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(this.material.name, blockX, blockY - 12);
    }

    // Render flying debris
    this.debris.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.size, d.size);
    });

    // Vertical Power Meter (MK Arcade Thermometer Style)
    const meterX = 140;
    const meterY = 90;
    const meterW = 28;
    const meterH = 170;

    // Meter frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(meterX, meterY, meterW, meterH);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterW, meterH);

    // Power fill
    const fillH = (this.power / this.maxPower) * (meterH - 4);
    const fillY = meterY + meterH - 2 - fillH;
    const isReady = this.power >= this.material.requiredPower;

    const meterGrad = ctx.createLinearGradient(0, meterY + meterH, 0, meterY);
    meterGrad.addColorStop(0, '#22c55e');
    meterGrad.addColorStop(0.6, '#facc15');
    meterGrad.addColorStop(1, '#ef4444');

    ctx.fillStyle = isReady ? '#22c55e' : meterGrad;
    ctx.fillRect(meterX + 2, fillY, meterW - 4, fillH);

    // Threshold indicator line
    const threshY = meterY + meterH - 2 - (this.material.requiredPower / this.maxPower) * (meterH - 4);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(meterX - 6, threshY);
    ctx.lineTo(meterX + meterW + 6, threshY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('CHOP LINE', meterX + meterW / 2 + 50, threshY + 3);

    // Mash button prompt
    if (this.state === 'playing') {
      const pulse = Math.floor(t / 10) % 2 === 0 ? 1 : 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = isReady ? '#4ade80' : '#fde047';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(isReady ? 'PRESS [SPACE] TO CHOP NOW!' : 'MASH [U / I / J / K] RAPIDLY!', W / 2, H - 36);
      ctx.globalAlpha = 1.0;
    } else if (this.state === 'chop_success') {
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 18px monospace';
      ctx.fillText('FLAWLESS CHOP! EXCELLENT!', W / 2, H - 36);
      ctx.fillStyle = '#fde047';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`+${this.material.reward} TOURNAMENT COINS EARNED`, W / 2, H - 18);
    } else if (this.state === 'chop_fail') {
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 16px monospace';
      ctx.fillText('CHOP FAILED! WEAK IMPACT!', W / 2, H - 36);
    }
  }
}

export const testYourMight = new TestYourMight();
