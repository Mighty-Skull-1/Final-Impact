// Final Impact - Central Match Engine & State Machine
import { GAME_WIDTH, GAME_HEIGHT, STAGE_WIDTH, FIGHTER_STATE } from './Constants.js';
import { input } from './Input.js';
import { soundFX } from '../audio/SoundFX.js';
import { Stage } from '../graphics/Stage.js';
import { HUD } from '../ui/HUD.js';
import { TitleScreen } from '../ui/TitleScreen.js';
import { CharacterSelect } from '../ui/CharacterSelect.js';
import { HitboxSystem } from './Hitbox.js';
import { AIController } from './AI.js';
import { SettingsManager } from '../ui/SettingsModal.js';
import { Kazuki } from '../fighters/Kazuki.js';
import { Raven } from '../fighters/Raven.js';
import { Kagura } from '../fighters/Kagura.js';

export const GAME_SCREENS = {
  TITLE: 'TITLE',
  CHAR_SELECT: 'CHAR_SELECT',
  FIGHT: 'FIGHT',
  ROUND_OVER: 'ROUND_OVER',
  VICTORY: 'VICTORY'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.screen = GAME_SCREENS.TITLE;
    this.titleScreen = new TitleScreen();
    this.charSelect = new CharacterSelect();
    this.hud = new HUD();
    this.ai = new AIController('normal');
    this.settingsManager = new SettingsManager(this);
    window.__GAME_SETTINGS = this.settingsManager;
    this.gameSpeedTick = 0;

    this.stage = new Stage('suzaku');
    this.f1 = null;
    this.f2 = null;
    this.projectiles = [];
    this.cameraX = 0;

    this.round = 1;
    this.roundOverTimer = 0;
    this.slowMotion = false;
    this.slowMotionCounter = 0;
    this.winner = null;

    this.showHitboxes = false;

    // Victory quotes
    this.victoryQuotes = {
      kazuki: '"The true strength comes from mastering oneself in battle!"',
      raven: '"Mission accomplished. Standard tactical superiority."',
      kagura: '"You cannot strike what your eyes cannot follow."'
    };

    // Global Key Listener for Debug & Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH') {
        this.showHitboxes = !this.showHitboxes;
        window.__GAME_HITBOXES = this.showHitboxes;
      }
      if (e.code === 'KeyE') {
        input.easyInputs = !input.easyInputs;
        window.__GAME_EASY = input.easyInputs;
      }
      if (e.code === 'KeyM') {
        if (soundFX.musicPlaying) soundFX.stopMusic();
        else soundFX.startMusic('fight');
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.settingsManager.toggle();
      }

      // Screen navigation on enter / space
      if (['Space', 'Enter'].includes(e.code) && !this.settingsManager.isOpen) {
        this.handleConfirmPress();
      }
    });
  }

  handleConfirmPress() {
    soundFX.ensureContext();

    if (this.screen === GAME_SCREENS.TITLE) {
      soundFX.playGong();
      this.screen = GAME_SCREENS.CHAR_SELECT;
      return;
    }

    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      soundFX.playAnnouncer('ROUND1');
      soundFX.startMusic('fight');
      this.startMatch();
      return;
    }

    if (this.screen === GAME_SCREENS.VICTORY) {
      this.screen = GAME_SCREENS.CHAR_SELECT;
    }
  }

  startMatch() {
    const p1Id = this.charSelect.characters[this.charSelect.p1Index].id;
    const p2Id = this.charSelect.characters[this.charSelect.p2Index].id;
    const stageId = this.charSelect.stages[this.charSelect.stageIndex].id;
    const isCpu = this.charSelect.gameMode !== '2p';

    this.stage = new Stage(stageId);
    this.round = 1;

    this.f1 = this.createFighter(p1Id, 220, true, 1, false);
    this.f2 = this.createFighter(p2Id, 700, false, 2, isCpu);

    this.projectiles = [];
    this.hud.reset(this.round);
    this.screen = GAME_SCREENS.FIGHT;
  }

  createFighter(id, x, facingRight, playerNum, isCpu) {
    const opts = { x, facingRight, playerNum, isCpu };
    let fighter;
    if (id === 'kazuki') fighter = new Kazuki(opts);
    else if (id === 'raven') fighter = new Raven(opts);
    else fighter = new Kagura(opts);

    // Wire projectile creation callback
    fighter.spawnProjectile = (proj) => {
      this.projectiles.push(proj);
    };

    return fighter;
  }

  resetRound() {
    this.round++;
    this.f1.health = this.f1.maxHealth;
    this.f2.health = this.f2.maxHealth;
    this.f1.x = 220;
    this.f2.x = 700;
    this.f1.y = 290;
    this.f2.y = 290;
    this.f1.vx = 0;
    this.f2.vx = 0;
    this.f1.vy = 0;
    this.f2.vy = 0;
    this.f1.isGrounded = true;
    this.f2.isGrounded = true;
    this.f1.isDead = false;
    this.f2.isDead = false;
    this.f1.changeState(FIGHTER_STATE.IDLE);
    this.f2.changeState(FIGHTER_STATE.IDLE);
    this.projectiles = [];
    this.hud.reset(this.round);
    this.slowMotion = false;
    this.screen = GAME_SCREENS.FIGHT;
    soundFX.playAnnouncer(this.round === 2 ? 'ROUND2' : 'FINALROUND');
  }

  update() {
    if (this.settingsManager.isOpen) {
      return; // Paused while settings menu is open
    }

    if (this.screen === GAME_SCREENS.TITLE) {
      return;
    }

    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      const s1 = input.getState(1);
      if (input.isDown('KeyA')) this.charSelect.handleInput({ left: true }, true);
      else if (input.isDown('KeyD')) this.charSelect.handleInput({ right: true }, true);

      if (input.isDown('KeyW')) this.throttleNav(() => this.charSelect.handleInput({ up: true }, true));
      if (input.isDown('KeyS')) this.throttleNav(() => this.charSelect.handleInput({ down: true }, true));
      if (input.isDown('KeyJ')) this.throttleNav(() => this.charSelect.handleInput({ lk: true }, true));
      return;
    }

    if (this.screen === GAME_SCREENS.VICTORY) {
      return;
    }

    // Game Speed scaling ("Turn down the game" - 50% slow-mo, 75% relaxed)
    this.gameSpeedTick++;
    const speed = this.settingsManager.settings.gameSpeed;
    if (speed === 50 && this.gameSpeedTick % 2 !== 0) return;
    if (speed === 75 && this.gameSpeedTick % 4 === 0) return;

    // FIGHT & ROUND_OVER states
    if (this.slowMotion) {
      this.slowMotionCounter++;
      if (this.slowMotionCounter % 3 !== 0) return; // 1/3 speed during slow-mo KO
    }

    // 1. Update Input Manager
    input.update(this.f1.facingRight, this.f2.facingRight);

    // 2. Process Player 1 Inputs
    const p1Input = input.getState(1, this.f1.facingRight);
    this.f1.handleInput(p1Input, input, this.f2);

    // 3. Process Player 2 / CPU Inputs
    let p2Input;
    if (this.f2.isCpu) {
      p2Input = this.ai.update(this.f2, this.f1);
    } else {
      p2Input = input.getState(2, this.f2.facingRight);
    }
    this.f2.handleInput(p2Input, input, this.f1);

    // 4. Update Fighters
    this.f1.update(this.f2, STAGE_WIDTH);
    this.f2.update(this.f1, STAGE_WIDTH);

    // 5. Separate Pushboxes
    HitboxSystem.resolvePushboxes(this.f1, this.f2, 40, STAGE_WIDTH);

    // 6. Check Attacks & Hit Collisions
    this.checkAttacks();

    // 7. Update Projectiles
    this.updateProjectiles();

    // 8. Update Camera to track midpoint between fighters
    const midX = (this.f1.x + this.f2.x) / 2;
    const targetCamX = Math.max(0, Math.min(STAGE_WIDTH - GAME_WIDTH, midX - GAME_WIDTH / 2));
    this.cameraX += (targetCamX - this.cameraX) * 0.15;

    // 9. Update Stage & HUD
    this.stage.update();
    this.hud.update(this.f1, this.f2);

    // 10. Check Round Over / KO
    this.checkMatchEnd();
  }

  throttleNav(callback) {
    if (!this.lastNav || Date.now() - this.lastNav > 220) {
      this.lastNav = Date.now();
      callback();
    }
  }

  checkAttacks() {
    // Check F1 attacking F2
    if (this.f1.activeHitbox && !this.f1.hasHitThisAttack) {
      const hitResult = HitboxSystem.checkAttackHit(this.f1, this.f2);
      if (hitResult) {
        this.f1.hasHitThisAttack = true;
        this.f1.addSuper(hitResult.attack.damage * 0.08);
        const hitType = this.f2.takeHit(hitResult.attack, this.f1.facingRight ? 1 : -1);

        this.hud.addHitSpark(hitResult.hitX, hitResult.hitY, hitType === 'blocked' ? 'block' : 'hit');
        if (hitType !== 'blocked') {
          this.hud.recordHit(1);
          const shakeMult = this.settingsManager.settings.screenShake === 'off' ? 0 : (this.settingsManager.settings.screenShake === 'low' ? 0.4 : 1.0);
          this.hud.triggerShake((hitResult.attack.damage > 80 ? 7 : 3) * shakeMult);
        }
      }
    }

    // Check F2 attacking F1
    if (this.f2.activeHitbox && !this.f2.hasHitThisAttack) {
      const hitResult = HitboxSystem.checkAttackHit(this.f2, this.f1);
      if (hitResult) {
        this.f2.hasHitThisAttack = true;
        this.f2.addSuper(hitResult.attack.damage * 0.08);
        const hitType = this.f1.takeHit(hitResult.attack, this.f2.facingRight ? 1 : -1);

        this.hud.addHitSpark(hitResult.hitX, hitResult.hitY, hitType === 'blocked' ? 'block' : 'hit');
        if (hitType !== 'blocked') {
          this.hud.recordHit(2);
          const shakeMult = this.settingsManager.settings.screenShake === 'off' ? 0 : (this.settingsManager.settings.screenShake === 'low' ? 0.4 : 1.0);
          this.hud.triggerShake((hitResult.attack.damage > 80 ? 7 : 3) * shakeMult);
        }
      }
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update();

      if (!p.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const pHit = p.getHitbox();

      // Check collision with opponent
      const target = p.owner === this.f1 ? this.f2 : this.f1;
      const targetHurtboxes = target.getGlobalHurtboxes();

      let hitTarget = false;
      for (const hurt of targetHurtboxes) {
        if (HitboxSystem.testOverlap(pHit, hurt)) {
          hitTarget = true;
          p.active = false;

          const hitType = target.takeHit({
            damage: p.damage,
            hitStun: 22,
            blockStun: 14,
            pushback: 5,
            height: p.attackHeight,
            hitType: 'HEAVY',
            chipDamage: 12
          }, p.vx > 0 ? 1 : -1);

          this.hud.addHitSpark(p.x + p.width / 2, p.y + p.height / 2, hitType === 'blocked' ? 'block' : 'hit');
          this.hud.recordHit(p.owner.playerNum);
          this.hud.triggerShake(5);
          break;
        }
      }

      // Check projectile clash (two fireballs meeting in mid-air!)
      for (let j = 0; j < this.projectiles.length; j++) {
        const other = this.projectiles[j];
        if (p !== other && p.owner !== other.owner && p.active && other.active) {
          if (HitboxSystem.testOverlap(pHit, other.getHitbox())) {
            p.active = false;
            other.active = false;
            this.hud.addHitSpark((p.x + other.x) / 2, (p.y + other.y) / 2, 'hit');
            soundFX.playNoiseCrack(0.2, 800, 0.4);
            break;
          }
        }
      }
    }
  }

  checkMatchEnd() {
    const isKO = this.f1.isDead || this.f2.isDead || this.hud.timer <= 0;

    if (isKO && this.screen === GAME_SCREENS.FIGHT) {
      this.screen = GAME_SCREENS.ROUND_OVER;
      this.slowMotion = true;
      this.roundOverTimer = 160;
      this.hud.setAnnouncement('K.O.', 120);
      this.hud.triggerShake(14);

      // Determine round winner
      if (this.f1.health > this.f2.health) {
        this.f1.roundsWon++;
        this.f1.changeState(FIGHTER_STATE.VICTORY);
      } else if (this.f2.health > this.f1.health) {
        this.f2.roundsWon++;
        this.f2.changeState(FIGHTER_STATE.VICTORY);
      }
    }

    if (this.screen === GAME_SCREENS.ROUND_OVER) {
      this.roundOverTimer--;
      if (this.roundOverTimer <= 0) {
        // Check if match won (best 2 out of 3)
        if (this.f1.roundsWon >= 2 || this.f2.roundsWon >= 2) {
          this.screen = GAME_SCREENS.VICTORY;
          this.winner = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
          soundFX.playAnnouncer('YOU_WIN');
        } else {
          this.resetRound();
        }
      }
    }
  }

  render() {
    const { ctx } = this;
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    ctx.clearRect(0, 0, W, H);

    if (this.screen === GAME_SCREENS.TITLE) {
      this.titleScreen.render(ctx, W, H);
      return;
    }

    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      this.charSelect.render(ctx, W, H);
      return;
    }

    if (this.screen === GAME_SCREENS.VICTORY) {
      this.renderVictoryScreen();
      return;
    }

    // FIGHT & ROUND_OVER
    ctx.save();
    const shake = this.hud.getShakeOffset();
    ctx.translate(shake.x, shake.y);

    // 1. Render Parallax Stage
    this.stage.render(ctx, this.cameraX, W, H);

    // 2. Render Fighters with camera offset
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    this.f1.render(ctx);
    this.f2.render(ctx);

    // 3. Render Projectiles
    this.projectiles.forEach(p => p.render(ctx));

    // 4. Debug Hitbox / Hurtbox Visualizer
    if (this.showHitboxes) {
      this.renderHitboxDebug(ctx);
    }

    ctx.restore(); // restore camera translation

    // 5. Render HUD (Health, Timer, Super, Announcements)
    this.hud.render(ctx, this.f1, this.f2, W, H);

    ctx.restore(); // restore screen shake
  }

  renderHitboxDebug(ctx) {
    // Green Hurtboxes
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    [...this.f1.getGlobalHurtboxes(), ...this.f2.getGlobalHurtboxes()].forEach(b => {
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    });

    // Red Attack Hitboxes
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    const hit1 = this.f1.getGlobalHitbox();
    const hit2 = this.f2.getGlobalHitbox();
    if (hit1) ctx.strokeRect(hit1.x, hit1.y, hit1.w, hit1.h);
    if (hit2) ctx.strokeRect(hit2.x, hit2.y, hit2.w, hit2.h);

    // Yellow Pushboxes
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    const p1 = this.f1.getPushbox();
    const p2 = this.f2.getPushbox();
    ctx.strokeRect(p1.x, p1.y, p1.w, p1.h);
    ctx.strokeRect(p2.x, p2.y, p2.w, p2.h);
  }

  renderVictoryScreen() {
    const { ctx } = this;
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);

    // Victory Banner
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 40, W, 80);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 38, W, 2);
    ctx.fillRect(0, 120, W, 2);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`${this.winner.name} WINS!`, W / 2, 85);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.fillText('FINAL IMPACT CHAMPION', W / 2, 106);

    // Winner Sprite Large Display
    const sprites = this.winner.sprites?.VICTORY || this.winner.sprites?.IDLE || [];
    const winImg = sprites[0];
    if (winImg) {
      ctx.drawImage(winImg, W / 2 - 80, 140, 160, 180);
    }

    // Classic Street Fighter Victory Quote
    const quote = this.victoryQuotes[this.winner.id] || '"Victory belongs to the swift and disciplined!"';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 13px monospace';
    ctx.fillText(quote, W / 2, H - 35);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('PRESS [ENTER] OR [SPACE] TO RETURN TO CHARACTER SELECT', W / 2, H - 15);

    ctx.textAlign = 'left';
  }
}
