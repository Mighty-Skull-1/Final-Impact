// Final Impact - "FINISH HIM!" Finisher System (Mortal Kombat style, arcade-clean - no gore)
// After a decisive final-round K.O. the winning human gets a short window to unleash FINAL IMPACT.
import { input } from '../engine/Input.js';
import { soundFX } from '../audio/SoundFX.js';
import { FIGHTER_STATE } from '../engine/Constants.js';

export const FINISH_PROMPT_FRAMES = 300; // 5 seconds to execute
export const FINISH_EXECUTE_FRAMES = 170;
export const FINISH_END_FRAMES = 110;

export class FinishHim {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.phase = 'none'; // 'prompt' | 'execute' | 'end'
    this.t = 0;
    this.winner = null;
    this.loser = null;
    this.flawless = false;
    this.executed = false;
    this.flash = 0;
    this.rings = [];
    this.sparks = [];
    this.hud = null;
  }

  // winner/loser: Fighter instances. hud: HUD (for screen shake)
  start(winner, loser, hud, { flawless = false } = {}) {
    this.reset();
    this.active = true;
    this.phase = 'prompt';
    this.t = 0;
    this.winner = winner;
    this.loser = loser;
    this.hud = hud;
    this.flawless = flawless;
    try { soundFX.playAnnouncer('FINISH_HIM'); } catch (e) {}
    if (hud && hud.triggerShake) hud.triggerShake(10);
  }

  // True while Game should skip normal fighter input processing
  get blocksInput() {
    return this.active;
  }

  winnerPressedFinisher() {
    if (!this.winner) return false;
    const num = this.winner.playerNum === 2 ? 2 : 1;
    try {
      const st = input.getState(num, this.winner.facingRight);
      return !!st.ultimateJust;
    } catch (e) {
      return false;
    }
  }

  beginExecute() {
    this.phase = 'execute';
    this.t = 0;
    this.executed = true;
    const w = this.winner;
    const l = this.loser;
    if (w && l) {
      const dir = l.x >= w.x ? 1 : -1;
      w.facingRight = dir === 1;
      w.x = Math.max(60, Math.min(900, l.x - dir * 70));
      w.vx = 0;
      w.changeState(FIGHTER_STATE.VICTORY, true);
    }
    try { soundFX.playUltimateActivation(); } catch (e) {}
    if (this.hud && this.hud.triggerShake) this.hud.triggerShake(8);
  }

  spawnRing(x, y, color, speed = 3, life = 40) {
    this.rings.push({ x, y, r: 6, vr: speed, life, maxLife: life, color });
  }

  spawnSparks(x, y, count = 28) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 7;
      this.sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        life: 30 + Math.random() * 30,
        size: 2 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#fde047' : (Math.random() < 0.5 ? '#ffffff' : '#f97316')
      });
    }
  }

  // Advances one logical frame. Returns true once the whole sequence has finished.
  update() {
    if (!this.active) return true;
    this.t++;
    if (this.flash > 0) this.flash -= 0.06;

    // FX physics
    this.rings = this.rings.filter(r => {
      r.r += r.vr;
      r.life--;
      return r.life > 0 && r.r > 0;
    });
    this.sparks = this.sparks.filter(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.25;
      s.life--;
      return s.life > 0;
    });

    const w = this.winner;
    const l = this.loser;

    if (this.phase === 'prompt') {
      if (this.winnerPressedFinisher()) {
        this.beginExecute();
      } else if (this.t >= FINISH_PROMPT_FRAMES) {
        this.phase = 'end';
        this.t = 0;
        if (this.flawless) { try { soundFX.playAnnouncer('FLAWLESS'); } catch (e) {} }
      }
    } else if (this.phase === 'execute') {
      // 0-60: charge - converging aura rings around the winner
      if (this.t < 60 && w) {
        if (this.t % 8 === 0) this.spawnRing(w.x, w.y - 50, '#38bdf8', -1.6, 20);
        if (this.hud && this.t % 12 === 0) this.hud.triggerShake(3);
      }
      // 60: impact
      if (this.t === 60 && l && w) {
        const dir = w.facingRight ? 1 : -1;
        this.flash = 1;
        l.vx = dir * 10;
        l.vy = -16;
        l.isGrounded = false;
        try {
          soundFX.playUltimateFinisher();
          soundFX.playHitHeavy();
        } catch (e) {}
        this.spawnRing(l.x, l.y - 50, '#ffffff', 7, 34);
        this.spawnRing(l.x, l.y - 50, '#facc15', 4.5, 44);
        this.spawnRing(l.x, l.y - 50, '#ef4444', 3, 54);
        this.spawnSparks(l.x, l.y - 50, 40);
        if (this.hud && this.hud.triggerShake) this.hud.triggerShake(24);
      }
      // Trailing sparks as the opponent tumbles away
      if (this.t > 62 && this.t < 110 && l && this.t % 3 === 0) {
        this.spawnSparks(l.x, l.y - 40, 4);
      }
      if (this.t >= FINISH_EXECUTE_FRAMES) {
        this.phase = 'end';
        this.t = 0;
        if (this.flawless) { try { soundFX.playAnnouncer('FLAWLESS'); } catch (e) {} }
      }
    } else if (this.phase === 'end') {
      if (this.t >= FINISH_END_FRAMES) {
        this.active = false;
        this.phase = 'none';
        return true;
      }
    }
    return false;
  }

  // Skips straight to the end (e.g. player quit)
  forceFinish() {
    this.active = false;
    this.phase = 'none';
  }

  // World-space effects (drawn inside the camera translate)
  renderWorld(ctx) {
    if (!this.active) return;
    this.rings.forEach(r => {
      const a = Math.max(0, r.life / r.maxLife);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, Math.max(1, r.r), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    this.sparks.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Charge aura around the winner
    if (this.phase === 'execute' && this.t < 60 && this.winner) {
      const w = this.winner;
      const k = this.t / 60;
      ctx.save();
      ctx.globalAlpha = 0.18 + k * 0.3;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(w.x, w.y - 48, 26 + k * 12, 56 + k * 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Screen-space overlay (text, letterbox, flash)
  renderOverlay(ctx, W, H) {
    if (!this.active) return;
    const t = this.t;
    const pulse = Math.sin(Date.now() / 90);

    ctx.save();
    ctx.textAlign = 'center';

    if (this.phase === 'prompt') {
      // Red vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 380);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, `rgba(127, 0, 0, ${0.45 + pulse * 0.08})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      const appear = Math.min(1, t / 14);
      const scale = 1 + (1 - appear) * 2.2 + pulse * 0.02;
      ctx.save();
      ctx.translate(W / 2, H / 2 - 36);
      ctx.scale(scale, scale);
      ctx.globalAlpha = appear;
      ctx.fillStyle = '#000';
      ctx.font = '900 46px monospace';
      ctx.fillText('FINISH HIM!', 3, 3);
      const g = ctx.createLinearGradient(0, -34, 0, 6);
      g.addColorStop(0, '#fca5a5');
      g.addColorStop(0.5, '#dc2626');
      g.addColorStop(1, '#450a0a');
      ctx.fillStyle = g;
      ctx.fillText('FINISH HIM!', 0, 0);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#fde047';
      ctx.strokeText('FINISH HIM!', 0, 0);
      ctx.restore();

      // Countdown bar
      const remain = Math.max(0, 1 - t / FINISH_PROMPT_FRAMES);
      const bw = 220;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(W / 2 - bw / 2, H / 2 + 2, bw, 8);
      ctx.fillStyle = remain < 0.25 ? '#ef4444' : '#facc15';
      ctx.fillRect(W / 2 - bw / 2 + 1, H / 2 + 3, (bw - 2) * remain, 6);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(W / 2 - bw / 2, H / 2 + 2, bw, 8);

      // Hint
      const isP2 = this.winner && this.winner.playerNum === 2;
      const key = isP2 ? 'NUMPAD 0' : 'SPACE';
      if (Math.floor(t / 20) % 2 === 0) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`PRESS [${key}] / [HP+HK] / [R3] FOR FINAL IMPACT`, W / 2, H / 2 + 28);
      }
    }

    if (this.phase === 'execute') {
      // Cinematic letterbox
      const bar = Math.min(1, t / 14) * 34;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, bar);
      ctx.fillRect(0, H - bar, W, bar);

      // Darken + converging speed lines during charge
      if (t < 60) {
        ctx.fillStyle = `rgba(0, 10, 30, ${Math.min(0.5, (t / 60) * 0.5)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < Math.PI * 2; a += 0.3) {
          const r1 = 220 - (t % 20) * 6;
          ctx.beginPath();
          ctx.moveTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1);
          ctx.lineTo(W / 2 + Math.cos(a) * (r1 + 80), H / 2 + Math.sin(a) * (r1 + 80));
          ctx.stroke();
        }
      }

      // Title card
      if (t >= 66) {
        const k = Math.min(1, (t - 66) / 12);
        ctx.save();
        ctx.translate(W / 2, H / 2 - 6);
        ctx.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k);
        ctx.globalAlpha = k;
        ctx.fillStyle = '#000';
        ctx.font = '900 40px monospace';
        ctx.fillText('FINAL IMPACT', 3, 3);
        const tg = ctx.createLinearGradient(0, -30, 0, 8);
        tg.addColorStop(0, '#fef9c3');
        tg.addColorStop(0.5, '#facc15');
        tg.addColorStop(1, '#b91c1c');
        ctx.fillStyle = tg;
        ctx.fillText('FINAL IMPACT', 0, 0);
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 16px serif';
        ctx.fillText('終　撃', 0, 24);
        ctx.restore();
      }
    }

    if (this.phase === 'end') {
      const k = Math.min(1, t / 18);
      const fade = t > FINISH_END_FRAMES - 20 ? Math.max(0, (FINISH_END_FRAMES - t) / 20) : 1;
      ctx.globalAlpha = k * fade;
      if (this.flawless) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, H / 2 - 38, W, 66);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(0, H / 2 - 38, W, 2);
        ctx.fillRect(0, H / 2 + 26, W, 2);
        ctx.fillStyle = '#000';
        ctx.font = '900 34px monospace';
        ctx.fillText('FLAWLESS VICTORY', W / 2 + 2, H / 2 + 6);
        const fg = ctx.createLinearGradient(0, H / 2 - 24, 0, H / 2 + 10);
        fg.addColorStop(0, '#fef9c3');
        fg.addColorStop(1, '#f59e0b');
        ctx.fillStyle = fg;
        ctx.fillText('FLAWLESS VICTORY', W / 2, H / 2 + 4);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(this.executed ? 'AND A PERFECT FINISH' : 'NOT A SCRATCH TAKEN', W / 2, H / 2 + 20);
      } else if (this.winner) {
        const nm = `${String(this.winner.name).toUpperCase()} WINS`;
        ctx.fillStyle = '#000';
        ctx.font = '900 30px monospace';
        ctx.fillText(nm, W / 2 + 2, H / 2 + 4);
        ctx.fillStyle = '#fde047';
        ctx.fillText(nm, W / 2, H / 2 + 2);
      }
      ctx.globalAlpha = 1;
    }

    // White impact flash
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.flash)})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }
}
