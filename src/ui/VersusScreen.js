// Final Impact - Versus Intro Screen (Mortal Kombat style "VS" splash before round 1)
import { soundFX } from '../audio/SoundFX.js';

const easeOutCubic = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export class VersusScreen {
  constructor() {
    this.active = false;
    this.t = 0;
    this.duration = 150;
    this.data = null;
  }

  start(data = {}) {
    this.active = true;
    this.t = 0;
    this.duration = data.duration || 150;
    this.data = data;
    this.slammed = false;
  }

  skip() {
    if (this.active && this.t > 30) {
      this.t = Math.max(this.t, this.duration - 12);
      return true;
    }
    return false;
  }

  // Returns true when the intro has finished
  update() {
    if (!this.active) return true;
    this.t++;
    if (!this.slammed && this.t >= 40) {
      this.slammed = true;
      try { soundFX.playUltimateActivation && soundFX.playUltimateActivation(); } catch (e) {}
    }
    if (this.t >= this.duration) {
      this.active = false;
      return true;
    }
    return false;
  }

  getSprite(fighter) {
    if (!fighter || !fighter.sprites) return null;
    const s = fighter.sprites;
    const frames = s.IDLE || s.idle || [];
    if (!frames.length) return null;
    return frames[Math.floor(this.t / 10) % frames.length];
  }

  drawPortrait(ctx, fighter, side, W, H, progress) {
    const img = this.getSprite(fighter);
    const baseX = side === 'left' ? W * 0.26 : W * 0.74;
    const slide = (1 - easeOutCubic(progress)) * (side === 'left' ? -W * 0.6 : W * 0.6);
    const groundY = H - 78;

    ctx.save();
    ctx.translate(baseX + slide, groundY);
    if (side === 'right') ctx.scale(-1, 1);

    if (img && img.height) {
      const scale = Math.min(3.2, 215 / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      // Rim light silhouette behind the fighter
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = side === 'left' ? '#38bdf8' : '#ef4444';
      ctx.fillRect(-w / 2 - 4, -h - 2, w + 8, h + 4);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, -w / 2, -h, w, h);
    } else {
      // Fallback silhouette when a fighter has no sprite sheet
      ctx.fillStyle = side === 'left' ? '#1e3a5f' : '#5f1e1e';
      ctx.fillRect(-34, -190, 68, 190);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '900 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', 0, -90);
    }
    ctx.restore();
  }

  drawNamePlate(ctx, fighter, fallbackName, side, W, H, progress) {
    const plateW = 250;
    const plateH = 34;
    const y = H - 60;
    const slide = (1 - easeOutCubic((progress - 0.15) / 0.85)) * (side === 'left' ? -plateW - 20 : plateW + 20);
    const x = side === 'left' ? 14 + slide : W - plateW - 14 + slide;
    const name = (fighter && fighter.name) || fallbackName || '???';

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(x, y, plateW, plateH);
    ctx.fillStyle = side === 'left' ? '#0ea5e9' : '#dc2626';
    ctx.fillRect(side === 'left' ? x : x + plateW - 5, y, 5, plateH);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, plateW, plateH);

    ctx.textAlign = side === 'left' ? 'left' : 'right';
    const tx = side === 'left' ? x + 14 : x + plateW - 14;
    ctx.fillStyle = '#000';
    ctx.font = '900 18px monospace';
    ctx.fillText(String(name).toUpperCase(), tx + 1, y + 23);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(name).toUpperCase(), tx, y + 22);
    ctx.restore();
  }

  render(ctx, W, H, stage = null, cameraX = 0) {
    if (!this.data) return;
    const d = this.data;
    const t = this.t;

    // Backdrop: the actual arena, dimmed blood-red
    if (stage) {
      stage.render(ctx, cameraX, W, H);
    } else {
      ctx.fillStyle = '#0a0102';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = 'rgba(30, 0, 0, 0.62)';
    ctx.fillRect(0, 0, W, H);

    // Diagonal light streaks
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#facc15';
    for (let i = -2; i < 10; i++) {
      const sx = i * 90 + (t * 3) % 90;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + 26, 0);
      ctx.lineTo(sx - 70, H);
      ctx.lineTo(sx - 96, H);
      ctx.fill();
    }
    ctx.restore();

    // Slam shake window
    ctx.save();
    if (t >= 40 && t < 54) {
      const k = (54 - t) * 0.5;
      ctx.translate((Math.random() * 2 - 1) * k, (Math.random() * 2 - 1) * k);
    }

    // Fighters
    const inProg = Math.min(1, t / 36);
    this.drawPortrait(ctx, d.f1, 'left', W, H, inProg);
    this.drawPortrait(ctx, d.f2, 'right', W, H, inProg);

    // Name plates
    this.drawNamePlate(ctx, d.f1, d.p1Label, 'left', W, H, Math.min(1, t / 50));
    this.drawNamePlate(ctx, d.f2, d.p2Label, 'right', W, H, Math.min(1, t / 50));

    // Huge VS emblem
    if (t >= 40) {
      const k = Math.min(1, (t - 40) / 10);
      const scale = 3.2 - 2.2 * easeOutCubic(k);
      const pulse = 1 + Math.sin(t * 0.18) * 0.03;
      ctx.save();
      ctx.translate(W / 2, H / 2 - 24);
      ctx.scale(scale * pulse, scale * pulse);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.font = '900 70px monospace';
      ctx.fillText('VS', 3, 25);
      const vg = ctx.createLinearGradient(0, -30, 0, 30);
      vg.addColorStop(0, '#fef08a');
      vg.addColorStop(0.5, '#f59e0b');
      vg.addColorStop(1, '#b91c1c');
      ctx.fillStyle = vg;
      ctx.fillText('VS', 0, 22);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#7f1d1d';
      ctx.strokeText('VS', 0, 22);
      ctx.restore();
    }

    // Top banner: campaign stage / mode label
    if (d.topLabel) {
      const bw = 300;
      const by = 14;
      const slide = (1 - easeOutCubic(t / 28)) * -60;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
      ctx.fillRect(W / 2 - bw / 2, by + slide, bw, 24);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(W / 2 - bw / 2, by + slide, bw, 24);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(d.topLabel, W / 2, by + 16 + slide);
    }

    // Arena banner
    if (d.stageName) {
      const aw = 260;
      const ay = H - 30;
      const aProg = easeOutCubic((t - 20) / 30);
      ctx.save();
      ctx.globalAlpha = aProg;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(W / 2 - aw / 2, ay, aw, 22);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(W / 2 - aw / 2, ay, aw, 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`ARENA: ${d.stageName}${d.stageLocation ? '  -  ' + d.stageLocation : ''}`, W / 2, ay + 15);
      ctx.restore();
    }
    ctx.restore();

    // Impact flash on VS slam
    if (t >= 40 && t < 48) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(48 - t) / 10})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Opening curtains
    const curtain = Math.max(0, 1 - t / 22);
    if (curtain > 0) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, (H / 2) * curtain);
      ctx.fillRect(0, H - (H / 2) * curtain, W, (H / 2) * curtain);
    }

    // Final fade to the fight
    const remaining = this.duration - t;
    if (remaining < 14) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(14 - remaining) / 14})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Skip hint
    if (t > 30 && Math.floor(t / 20) % 2 === 0) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('PRESS ENTER TO SKIP', W - 8, 10);
    }
    ctx.textAlign = 'left';
  }
}
