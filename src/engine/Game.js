// Final Impact - Central Match Engine & State Machine
import { GAME_WIDTH, GAME_HEIGHT, STAGE_WIDTH, FIGHTER_STATE, HIT_TYPE, ATTACK_HEIGHT, LIMB_ZONE, STATUS_EFFECT } from './Constants.js';
import { input } from './Input.js';
import { soundFX } from '../audio/SoundFX.js';
import { Stage } from '../graphics/Stage.js';
import { HUD } from '../ui/HUD.js';
import { TitleScreen } from '../ui/TitleScreen.js';
import { ModeSelect } from '../ui/ModeSelect.js';
import { CharacterSelect } from '../ui/CharacterSelect.js';
import { HitboxSystem } from './Hitbox.js';
import { AIController } from './AI.js';
import { SettingsManager } from '../ui/SettingsModal.js';
import { Kazuki } from '../fighters/Kazuki.js';
import { Raven } from '../fighters/Raven.js';
import { Kagura } from '../fighters/Kagura.js';
import { AlleyPickup } from './Projectiles.js';

// Boss Imports
import { RiotCop } from '../fighters/bosses/RiotCop.js';
import { Promoter } from '../fighters/bosses/Promoter.js';
import { BorisBouncer, ViktorBouncer } from '../fighters/bosses/BouncerTwins.js';
import { Matriarch } from '../fighters/bosses/Matriarch.js';
import { StreetLord } from '../fighters/bosses/StreetLord.js';
import { UrbanLegend } from '../fighters/bosses/UrbanLegend.js';
import { Champion } from '../fighters/bosses/Champion.js';

export const GAME_SCREENS = {
  TITLE: 'TITLE',
  MODE_SELECT: 'MODE_SELECT',
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
    this.modeSelect = new ModeSelect();
    this.charSelect = new CharacterSelect();
    this.hud = new HUD();

    // AI Controllers for multi-fighter brawl and campaign
    this.ai = new AIController('normal');
    this.ai2 = new AIController('normal');
    this.ai3 = new AIController('normal');

    this.settingsManager = new SettingsManager(this);
    window.__GAME_SETTINGS = this.settingsManager;
    this.gameSpeedTick = 0;

    this.stage = new Stage('suzaku');
    this.f1 = null;
    this.f2 = null;
    this.f3 = null;
    this.f4 = null;
    this.allFighters = [];
    this.pickups = [];
    this.projectiles = [];
    this.cameraX = 0;

    this.round = 1;
    this.roundOverTimer = 0;
    this.slowMotion = false;
    this.slowMotionCounter = 0;
    this.winner = null;
    this.showHitboxes = false;

    // Mode Flags & Campaign Queue
    this.isCampaign = false;
    this.is2v2 = false;
    this.isTraining = false;
    this.bossQueue = ['riot_cop', 'promoter', 'bouncer_twins', 'matriarch', 'street_lord', 'urban_legend', 'champion'];
    this.bossIndex = 0;

    // Victory quotes for all fighters & bosses
    this.victoryQuotes = {
      kazuki: '"The true strength comes from mastering oneself in battle!"',
      raven: '"Mission accomplished. Standard tactical superiority."',
      kagura: '"You cannot strike what your eyes cannot follow."',
      riot_cop: '"Law and order will be maintained by any means necessary."',
      promoter: '"Everyone has a price. You just couldn\'t afford mine."',
      boris: '"Hahaha! Weak bones break easily under Russian muscle!"',
      viktor: '"Speed and precision dismantle raw brute force every time."',
      matriarch: '"A predictable blade cuts only the fool who swings it."',
      street_lord: '"Flesh and bone are obsolete. Cybernetics are forever."',
      urban_legend: '"I am the reflection you cannot defeat."',
      champion: '"Tape your hands and step aside. You never stood a chance."'
    };

    // Global Key Listener for Debug & Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH') {
        this.showHitboxes = !this.showHitboxes;
        window.__GAME_HITBOXES = this.showHitboxes;
      }
      if (e.code === 'KeyT') {
        input.easyInputs = !input.easyInputs;
        window.__GAME_EASY = input.easyInputs;
      }
      if (e.code === 'KeyM') {
        if (soundFX.musicPlaying) soundFX.stopMusic();
        else soundFX.startMusic('fight');
      }
      if (e.code === 'Escape') {
        if (this.settingsManager.isOpen) {
          this.settingsManager.toggle();
        } else if (this.screen === GAME_SCREENS.MODE_SELECT) {
          this.screen = GAME_SCREENS.TITLE;
        } else if (this.screen === GAME_SCREENS.CHAR_SELECT) {
          this.screen = GAME_SCREENS.MODE_SELECT;
        } else if (this.screen === GAME_SCREENS.FIGHT) {
          this.settingsManager.toggle();
        }
      }
      if (e.code === 'KeyP') {
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
      this.screen = GAME_SCREENS.MODE_SELECT;
      return;
    }

    if (this.screen === GAME_SCREENS.MODE_SELECT) {
      soundFX.playGong();
      this.charSelect.setMode(this.modeSelect.selectedMode, this.modeSelect.currentDifficulty);
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
      this.screen = GAME_SCREENS.MODE_SELECT;
    }
  }

  startMatch() {
    const p1Id = this.charSelect.characters[this.charSelect.p1Index].id;
    const stageId = this.charSelect.stages[this.charSelect.stageIndex].id;
    const mode = this.charSelect.gameMode;

    this.stage = new Stage(stageId);
    this.round = 1;
    this.projectiles = [];
    this.spawnDefaultPickups();

    this.isCampaign = (mode === 'campaign');
    this.is2v2 = (mode === '2v2');
    this.isTraining = (mode === 'training');

    if (this.isCampaign) {
      this.bossIndex = 0;
      this.setupCampaignStage(p1Id);
    } else if (this.is2v2) {
      // 2V2 Team Brawl: Team 1 (P1 + CPU Ally) vs Team 2 (CPU Enemy 1 + CPU Enemy 2)
      const p1AllyId = p1Id === 'kazuki' ? 'raven' : (p1Id === 'raven' ? 'kagura' : 'kazuki');
      const enemy1Id = this.charSelect.characters[this.charSelect.p2Index].id;
      const enemy2Id = enemy1Id === 'kagura' ? 'raven' : 'kagura';

      this.f1 = this.createFighter(p1Id, 180, true, 1, false);
      this.f3 = this.createFighter(p1AllyId, 100, true, 3, true); // Team 1 Ally
      this.f2 = this.createFighter(enemy1Id, 720, false, 2, true);
      this.f4 = this.createFighter(enemy2Id, 810, false, 4, true);

      this.ai.setDifficulty('normal');
      this.ai2.setDifficulty('normal');
      this.ai3.setDifficulty('normal');

      this.allFighters = [this.f1, this.f2, this.f3, this.f4];
    } else {
      // Standard 1v1 (CPU, 2P, Training)
      const p2Id = this.charSelect.characters[this.charSelect.p2Index].id;
      const isCpu = mode !== '2p';

      this.f1 = this.createFighter(p1Id, 220, true, 1, false);
      this.f2 = this.createFighter(p2Id, 700, false, 2, isCpu);
      this.f3 = null;
      this.f4 = null;
      this.allFighters = [this.f1, this.f2];

      if (this.isTraining) {
        this.ai.setDifficulty('easy');
      } else {
        this.ai.setDifficulty(this.charSelect.cpuDifficulty || 'normal');
      }
    }

    this.hud.reset(this.round);
    this.screen = GAME_SCREENS.FIGHT;
  }

  setupCampaignStage(p1Id) {
    const currentBossId = this.bossQueue[this.bossIndex];
    const stageNum = this.bossIndex + 1;
    this.projectiles = [];
    this.spawnDefaultPickups();

    // Scale AI difficulty progressively per stage (1 to 7)
    this.ai.setDifficulty('campaign', stageNum);
    this.ai3.setDifficulty('campaign', stageNum);

    if (currentBossId === 'bouncer_twins') {
      // Stage 3: 2v1 Bouncer Twins Encounter! Boris & Viktor
      if (!this.f1) {
        this.f1 = this.createFighter(p1Id, 200, true, 1, false);
      } else {
        this.f1.x = 200;
        this.f1.y = 300;
        this.f1.vx = 0;
        this.f1.vy = 0;
        this.f1.isGrounded = true;
        this.f1.isDead = false;
        this.f1.changeState(FIGHTER_STATE.IDLE);
      }

      this.f2 = this.createFighter('boris', 680, false, 2, true);
      this.f4 = this.createFighter('viktor', 780, false, 4, true);
      this.f3 = null;
      this.allFighters = [this.f1, this.f2, this.f4];
      this.hud.setAnnouncement(`STAGE 3: THE BOUNCER TWINS (2v1)`, 120);
    } else {
      if (!this.f1) {
        this.f1 = this.createFighter(p1Id, 220, true, 1, false);
      } else {
        this.f1.x = 220;
        this.f1.y = 300;
        this.f1.vx = 0;
        this.f1.vy = 0;
        this.f1.isGrounded = true;
        this.f1.isDead = false;
        this.f1.changeState(FIGHTER_STATE.IDLE);
      }

      this.f2 = this.createFighter(currentBossId, 700, false, 2, true);

      // Progressive Boss Stat Scaling for each level
      if (currentBossId === 'riot_cop') {
        this.f2.maxHealth = 850;
        this.f2.health = 850;
      } else if (currentBossId === 'promoter') {
        this.f2.maxHealth = 950;
        this.f2.health = 950;
        this.f2.walkSpeed = 4.4;
      } else if (currentBossId === 'matriarch') {
        this.f2.maxHealth = 1050;
        this.f2.health = 1050;
      } else if (currentBossId === 'street_lord') {
        this.f2.maxHealth = 1250;
        this.f2.health = 1250;
      } else if (currentBossId === 'urban_legend') {
        this.f2.maxHealth = 1100;
        this.f2.health = 1100;
        this.f2.walkSpeed = 4.4;
      } else if (currentBossId === 'champion') {
        this.f2.maxHealth = 1000;
        this.f2.health = 1000;
      }

      this.f3 = null;
      this.f4 = null;
      this.allFighters = [this.f1, this.f2];
      const bossName = this.f2.name;
      this.hud.setAnnouncement(`STAGE ${stageNum}: ${bossName}`, 120);
    }
  }

  spawnDefaultPickups() {
    this.pickups = [
      new AlleyPickup('bottle', 270),
      new AlleyPickup('brick', 670),
      new AlleyPickup('lumber', 470)
    ];
  }

  createFighter(id, x, facingRight, playerNum, isCpu) {
    const opts = { x, facingRight, playerNum, isCpu };
    let fighter;

    if (id === 'kazuki') fighter = new Kazuki(opts);
    else if (id === 'raven') fighter = new Raven(opts);
    else if (id === 'kagura') fighter = new Kagura(opts);
    else if (id === 'riot_cop') fighter = new RiotCop(opts);
    else if (id === 'promoter') fighter = new Promoter(opts);
    else if (id === 'boris') fighter = new BorisBouncer(opts);
    else if (id === 'viktor') fighter = new ViktorBouncer(opts);
    else if (id === 'matriarch') fighter = new Matriarch(opts);
    else if (id === 'street_lord') fighter = new StreetLord(opts);
    else if (id === 'urban_legend') fighter = new UrbanLegend(opts);
    else if (id === 'champion') fighter = new Champion(opts);
    else fighter = new Kazuki(opts);

    // Team 1: playerNum 1 & 3. Team 2: playerNum 2 & 4
    fighter.team = (playerNum === 1 || playerNum === 3) ? 1 : 2;

    // Wire projectile creation callback
    fighter.spawnProjectile = (proj) => {
      this.projectiles.push(proj);
    };

    return fighter;
  }

  resetRound() {
    this.round++;
    this.allFighters.forEach(f => {
      f.health = f.maxHealth;
      f.stamina = f.maxStamina;
      f.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
      f.statusEffects = [];
      f.heldPickup = null;
      f.vx = 0;
      f.vy = 0;
      f.y = 300;
      f.isGrounded = true;
      f.isDead = false;
      f.changeState(FIGHTER_STATE.IDLE);
    });

    if (this.is2v2) {
      this.f1.x = 180;
      this.f3.x = 100;
      this.f2.x = 720;
      this.f4.x = 810;
    } else if (this.isCampaign && this.bossQueue[this.bossIndex] === 'bouncer_twins') {
      this.f1.x = 200;
      this.f2.x = 680;
      if (this.f4) this.f4.x = 780;
    } else {
      this.f1.x = 220;
      this.f2.x = 700;
    }

    this.projectiles = [];
    this.spawnDefaultPickups();
    this.hud.reset(this.round);
    this.slowMotion = false;
    this.screen = GAME_SCREENS.FIGHT;
    soundFX.playAnnouncer(this.round === 2 ? 'ROUND2' : 'FINALROUND');
  }

  getNearestOpponent(fighter) {
    let nearest = null;
    let minDist = Infinity;
    for (const other of this.allFighters) {
      if (other !== fighter && other.team !== fighter.team && !other.isDead) {
        const d = Math.abs(fighter.x - other.x);
        if (d < minDist) {
          minDist = d;
          nearest = other;
        }
      }
    }
    return nearest || (fighter.team === 1 ? this.f2 : this.f1);
  }

  update() {
    if (this.settingsManager.isOpen) {
      return; // Paused while settings menu is open
    }

    if (this.screen === GAME_SCREENS.TITLE) {
      return;
    }

    // 1. Mode Select Navigation (Discrete single-tap checks)
    if (this.screen === GAME_SCREENS.MODE_SELECT) {
      if (input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp')) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        this.modeSelect.handleInput({ up: true });
      } else if (input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown')) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        this.modeSelect.handleInput({ down: true });
      }

      if (input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft')) {
        input.consumeKey('KeyA');
        input.consumeKey('ArrowLeft');
        this.modeSelect.handleInput({ left: true });
      } else if (input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight')) {
        input.consumeKey('KeyD');
        input.consumeKey('ArrowRight');
        this.modeSelect.handleInput({ right: true });
      }
      return;
    }

    // 2. Character Select Navigation (Discrete single-tap checks)
    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      if (input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft')) {
        input.consumeKey('KeyA');
        input.consumeKey('ArrowLeft');
        this.charSelect.handleInput({ left: true }, true);
      } else if (input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight')) {
        input.consumeKey('KeyD');
        input.consumeKey('ArrowRight');
        this.charSelect.handleInput({ right: true }, true);
      }

      if (input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp')) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        this.charSelect.handleInput({ up: true }, true);
      } else if (input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown')) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        this.charSelect.handleInput({ down: true }, true);
      }

      // Player 2 selection in 2P mode
      if (this.charSelect.gameMode === '2p') {
        if (input.isJustPressed('Numpad4')) {
          input.consumeKey('Numpad4');
          this.charSelect.handleInput({ left: true }, false);
        } else if (input.isJustPressed('Numpad6')) {
          input.consumeKey('Numpad6');
          this.charSelect.handleInput({ right: true }, false);
        }
      }
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

    // Training Mode Infinite Resources
    if (this.isTraining) {
      if (this.f1) {
        this.f1.health = this.f1.maxHealth;
        this.f1.stamina = this.f1.maxStamina;
        this.f1.superMeter = this.f1.maxSuperMeter;
      }
      if (this.f2) {
        this.f2.health = this.f2.maxHealth;
        this.f2.stamina = this.f2.maxStamina;
      }
    }

    // FIGHT & ROUND_OVER states
    if (this.slowMotion) {
      this.slowMotionCounter++;
      if (this.slowMotionCounter % 3 !== 0) return; // 1/3 speed during slow-mo KO
    }

    // 1. Update Input Manager
    input.update(this.f1.facingRight, this.f2 ? this.f2.facingRight : false);

    // 2. Process Player 1 Inputs
    const p1Input = input.getState(1, this.f1.facingRight);
    const targetForP1 = this.getNearestOpponent(this.f1);
    this.f1.handleInput(p1Input, input, targetForP1);

    // Submission struggle button mash for P1
    if (this.f1.state === FIGHTER_STATE.SUBMISSION_LOCK) {
      if (p1Input.lpJust || p1Input.hpJust || p1Input.lkJust || p1Input.hkJust || p1Input.dirtyJust) {
        this.f1.submissionStruggle = Math.min(100, (this.f1.submissionStruggle || 0) + 14);
        soundFX.playWhoosh('light');
      }
    }

    // 3. Process Player 2 / Main Opponent Inputs
    if (this.f2 && !this.f2.isDead) {
      let p2Input;
      const targetForF2 = this.getNearestOpponent(this.f2);
      if (this.f2.isCpu) {
        p2Input = this.ai.update(this.f2, targetForF2);
        if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
          this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 1.2);
        }
      } else {
        p2Input = input.getState(2, this.f2.facingRight);
        if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
          if (p2Input.lpJust || p2Input.hpJust || p2Input.lkJust || p2Input.hkJust || p2Input.dirtyJust) {
            this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 14);
            soundFX.playWhoosh('light');
          }
        }
      }
      this.f2.handleInput(p2Input, input, targetForF2);
    }

    // 4. Process Extra Combatants (Ally f3, Second Boss/Enemy f4)
    if (this.f3 && !this.f3.isDead) {
      const targetForF3 = this.getNearestOpponent(this.f3);
      const f3Input = this.ai2.update(this.f3, targetForF3);
      this.f3.handleInput(f3Input, input, targetForF3);
    }
    if (this.f4 && !this.f4.isDead) {
      const targetForF4 = this.getNearestOpponent(this.f4);
      const f4Input = this.ai3.update(this.f4, targetForF4);
      this.f4.handleInput(f4Input, input, targetForF4);
    }

    // 5. Environmental Pickup Check (Down + Dirty / C to collect)
    this.checkPickups();

    // 6. Update Active Fighters
    this.allFighters.forEach(f => {
      if (!f.isDead || f.state === FIGHTER_STATE.KNOCKDOWN) {
        const opp = this.getNearestOpponent(f);
        f.update(opp, STAGE_WIDTH);
        this.checkCornerCrowdRebound(f);
      }
    });

    // 7. Bouncer Twins Blood Rage Synergy
    if (this.isCampaign && this.bossQueue[this.bossIndex] === 'bouncer_twins') {
      if (this.f2 && this.f2.isDead && this.f4 && !this.f4.isDead && !this.f4.isBloodRage) {
        this.f4.isBloodRage = true;
        this.f4.walkSpeed = 5.2;
        this.f4.dashSpeed = 10.5;
        soundFX.playRageIgnite();
        this.hud.showDirtyBanner('VIKTOR ENTERED BLOOD RAGE!');
      } else if (this.f4 && this.f4.isDead && this.f2 && !this.f2.isDead && !this.f2.isBloodRage) {
        this.f2.isBloodRage = true;
        this.f2.walkSpeed = 3.6;
        this.f2.dashSpeed = 7.2;
        soundFX.playRageIgnite();
        this.hud.showDirtyBanner('BORIS ENTERED BLOOD RAGE!');
      }
    }

    // 8. Separate Pushboxes between all pairs
    for (let i = 0; i < this.allFighters.length; i++) {
      for (let j = i + 1; j < this.allFighters.length; j++) {
        const fa = this.allFighters[i];
        const fb = this.allFighters[j];
        if (!fa.isDead && !fb.isDead) {
          HitboxSystem.resolvePushboxes(fa, fb, 40, STAGE_WIDTH);
        }
      }
    }

    // 9. Check Attacks & Hit Collisions
    this.checkAttacks();

    // 10. Update Projectiles & Pickups
    this.updateProjectiles();
    this.updatePickups();

    // 11. Camera Midpoint Tracking
    this.updateCamera();

    // 12. Update Stage & HUD
    this.stage.update();
    const primaryEnemy = (this.f2 && !this.f2.isDead) ? this.f2 : (this.f4 || this.f2);
    this.hud.update(this.f1, primaryEnemy);

    // 13. Check Match End / Round Over / Campaign
    this.checkMatchEnd();
  }

  checkPickups() {
    this.allFighters.forEach(f => {
      if (f.isDead || f.heldPickup) return;
      for (const p of this.pickups) {
        if (p.active && !p.isAirborne && Math.abs(f.x - p.x) < 45) {
          const isP1 = f.playerNum === 1;
          const wantsPickup = isP1
            ? (input.isDown('KeyS') && input.isJustPressed('KeyC'))
            : (f.isCpu && Math.random() < 0.04);

          if (wantsPickup) {
            f.heldPickup = p.type;
            p.active = false;
            soundFX.playWhoosh('light');
            this.hud.showDirtyBanner(`${f.name} ARMED: ${p.type.toUpperCase()}!`);
            break;
          }
        }
      }
    });
  }

  updatePickups() {
    for (const p of this.pickups) {
      if (!p.active) continue;
      p.update();

      if (p.isAirborne) {
        const pHit = p.getHitbox();
        for (const target of this.allFighters) {
          if (target !== p.owner && target.team !== p.owner?.team && !target.isDead) {
            for (const hurt of target.getGlobalHurtboxes()) {
              if (HitboxSystem.testOverlap(pHit, hurt)) {
                p.active = false;
                const attackData = {
                  damage: p.damage,
                  hitStun: 26,
                  blockStun: 14,
                  pushback: 6,
                  height: ATTACK_HEIGHT.MID,
                  hitType: HIT_TYPE.KNOCKDOWN,
                  chipDamage: 10
                };

                if (p.type === 'bottle') {
                  attackData.hitType = HIT_TYPE.BLEED_SLASH;
                  target.applyStatusEffect(STATUS_EFFECT.BLEED, 180);
                  target.damageLimb(LIMB_ZONE.HEAD, 20);
                } else if (p.type === 'brick') {
                  target.damageLimb(LIMB_ZONE.HEAD, 35);
                } else if (p.type === 'lumber') {
                  target.damageLimb(LIMB_ZONE.TORSO, 30);
                }

                const hitType = target.takeHit(attackData, p.vx > 0 ? 1 : -1);
                this.hud.addHitSpark(p.x, p.y, hitType === 'blocked' ? 'block' : 'hit');
                this.hud.triggerShake(7);
                break;
              }
            }
          }
        }
      }
    }
  }

  checkCornerCrowdRebound(fighter) {
    if (fighter.isDead) return;
    const isLeftWall = fighter.x <= 55;
    const isRightWall = fighter.x >= 885;
    const inHitState = fighter.state === FIGHTER_STATE.KNOCKDOWN ||
                       fighter.state === FIGHTER_STATE.HIT ||
                       fighter.state === FIGHTER_STATE.HIT_AIR ||
                       fighter.state === FIGHTER_STATE.HIT_CROUCH;

    if ((isLeftWall || isRightWall) && inHitState && fighter.state !== FIGHTER_STATE.WALL_REBOUND) {
      if ((isLeftWall && fighter.vx < -1.0) || (isRightWall && fighter.vx > 1.0)) {
        fighter.changeState(FIGHTER_STATE.WALL_REBOUND);
        fighter.isInvincible = false;
        fighter.isGrounded = false;
        fighter.vx = isLeftWall ? 6.5 : -6.5;
        fighter.vy = -5.0;
        this.hud.triggerShake(8);
        this.hud.addHitSpark(fighter.x + 40, fighter.y - 45, 'hit');
        this.hud.showCrowdBanner('CROWD SHOVE!');
        soundFX.playCrowdCheer();
      }
    }
  }

  checkAttacks() {
    for (const attacker of this.allFighters) {
      if (attacker.activeHitbox && !attacker.hasHitThisAttack && !attacker.isDead) {
        for (const defender of this.allFighters) {
          if (defender !== attacker && defender.team !== attacker.team && !defender.isDead) {
            const hitResult = HitboxSystem.checkAttackHit(attacker, defender);
            if (hitResult) {
              attacker.hasHitThisAttack = true;

              const attackData = attacker.isRageMode
                ? { ...hitResult.attack, damage: Math.round(hitResult.attack.damage * 1.25) }
                : hitResult.attack;

              attacker.addSuper(attackData.damage * 0.08);
              const hitType = defender.takeHit(attackData, attacker.facingRight ? 1 : -1);

              if (attacker.state === FIGHTER_STATE.DIRTY_TACTIC || attackData.hitType === HIT_TYPE.DIRTY_STUN) {
                this.hud.showDirtyBanner(attacker.name);
              }

              const isHeavy = attackData.hitType === HIT_TYPE.HEAVY || attackData.hitType === HIT_TYPE.KNOCKDOWN;
              attacker.hitStop = isHeavy ? 4 : 2;

              this.hud.addHitSpark(hitResult.hitX, hitResult.hitY, hitType === 'blocked' ? 'block' : 'hit');
              if (hitType !== 'blocked') {
                this.hud.recordHit(attacker.playerNum);
                const shakeMult = this.settingsManager.settings.screenShake === 'off' ? 0 : (this.settingsManager.settings.screenShake === 'low' ? 0.4 : 1.0);
                this.hud.triggerShake((attackData.damage > 80 ? 7 : 3) * shakeMult);
              }
              break;
            }
          }
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

      for (const target of this.allFighters) {
        if (target !== p.owner && target.team !== p.owner?.team && !target.isDead) {
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
          if (hitTarget) break;
        }
      }

      // Check projectile clash (two fireballs meeting in mid-air!)
      for (let j = 0; j < this.projectiles.length; j++) {
        const other = this.projectiles[j];
        if (p !== other && p.owner?.team !== other.owner?.team && p.active && other.active) {
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

  updateCamera() {
    const living = this.allFighters.filter(f => !f.isDead);
    if (living.length === 0) return;
    const minX = Math.min(...living.map(f => f.x));
    const maxX = Math.max(...living.map(f => f.x));
    const midX = (minX + maxX) / 2;
    const targetCamX = Math.max(0, Math.min(STAGE_WIDTH - GAME_WIDTH, midX - GAME_WIDTH / 2));
    this.cameraX += (targetCamX - this.cameraX) * 0.15;
  }

  checkMatchEnd() {
    // 1. Campaign Progression Check
    if (this.isCampaign) {
      const isBouncerStage = this.bossQueue[this.bossIndex] === 'bouncer_twins';
      const isChampionStage = this.bossQueue[this.bossIndex] === 'champion';

      // Elden Ring Phase 1 transition guard: do not end if Rex Gannon is transitioning to Phase 2
      if (isChampionStage && this.f2 && this.f2.phase === 1 && this.f2.hasTransitioned) {
        return; // Fight continues in Phase 2!
      }

      const enemiesDefeated = isBouncerStage
        ? (this.f2.isDead && (!this.f4 || this.f4.isDead))
        : (this.f2.isDead);

      const playerDefeated = this.f1.isDead;

      if ((enemiesDefeated || playerDefeated) && this.screen === GAME_SCREENS.FIGHT) {
        this.screen = GAME_SCREENS.ROUND_OVER;
        this.slowMotion = true;
        this.roundOverTimer = 160;

        if (enemiesDefeated && isChampionStage && this.f2.phase === 2) {
          this.hud.setAnnouncement('LEGEND VANQUISHED', 150);
        } else {
          this.hud.setAnnouncement(enemiesDefeated ? 'STAGE CLEAR!' : 'DEFEAT', 120);
        }
        this.hud.triggerShake(14);
      }

      if (this.screen === GAME_SCREENS.ROUND_OVER) {
        this.roundOverTimer--;
        if (this.roundOverTimer <= 0) {
          if (enemiesDefeated) {
            this.bossIndex++;
            if (this.bossIndex < this.bossQueue.length) {
              // Advance to next boss! Heal player 50%
              this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
              this.f1.stamina = this.f1.maxStamina;
              this.setupCampaignStage(this.f1.id);
              this.screen = GAME_SCREENS.FIGHT;
              this.slowMotion = false;
              soundFX.playAnnouncer('ROUND1');
            } else {
              // All 7 bosses defeated! Campaign Champion!
              this.screen = GAME_SCREENS.VICTORY;
              this.winner = this.f1;
              soundFX.playAnnouncer('YOU_WIN');
            }
          } else {
            // Player lost campaign
            this.screen = GAME_SCREENS.VICTORY;
            this.winner = this.f2;
          }
        }
      }
      return;
    }

    // 2. 2V2 Team Brawl End Check
    if (this.is2v2) {
      const team1Dead = this.f1.isDead && (!this.f3 || this.f3.isDead);
      const team2Dead = this.f2.isDead && (!this.f4 || this.f4.isDead);

      if ((team1Dead || team2Dead || this.hud.timer <= 0) && this.screen === GAME_SCREENS.FIGHT) {
        this.screen = GAME_SCREENS.ROUND_OVER;
        this.slowMotion = true;
        this.roundOverTimer = 160;
        this.hud.setAnnouncement('TEAM K.O.', 120);
        this.hud.triggerShake(14);
        this.winner = team2Dead ? this.f1 : this.f2;
      }

      if (this.screen === GAME_SCREENS.ROUND_OVER) {
        this.roundOverTimer--;
        if (this.roundOverTimer <= 0) {
          this.screen = GAME_SCREENS.VICTORY;
          soundFX.playAnnouncer('YOU_WIN');
        }
      }
      return;
    }

    // 3. Standard 1v1 End Check (Best of 3)
    const isKO = this.f1.isDead || this.f2.isDead || this.hud.timer <= 0;

    if (isKO && this.screen === GAME_SCREENS.FIGHT) {
      this.screen = GAME_SCREENS.ROUND_OVER;
      this.slowMotion = true;
      this.roundOverTimer = 160;
      this.hud.setAnnouncement('K.O.', 120);
      this.hud.triggerShake(14);

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

    if (this.screen === GAME_SCREENS.MODE_SELECT) {
      this.modeSelect.render(ctx, W, H);
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

    // 2. Render Fighters & Pickups with camera offset
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Ground Pickups
    this.pickups.forEach(p => p.render(ctx));

    // All active fighters
    this.allFighters.forEach(f => f.render(ctx));

    // Projectiles
    this.projectiles.forEach(p => p.render(ctx));

    // Debug Hitbox / Hurtbox Visualizer
    if (this.showHitboxes) {
      this.renderHitboxDebug(ctx);
    }

    ctx.restore();

    // 3. Render HUD (Health, Stamina, Timer, Super, Announcements)
    const primaryEnemy = (this.f2 && !this.f2.isDead) ? this.f2 : (this.f4 || this.f2);
    this.hud.render(ctx, this.f1, primaryEnemy, W, H);

    ctx.restore();
  }

  renderHitboxDebug(ctx) {
    // Green Hurtboxes
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    this.allFighters.forEach(f => {
      f.getGlobalHurtboxes().forEach(b => {
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
    });

    // Red Attack Hitboxes
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    this.allFighters.forEach(f => {
      const hit = f.getGlobalHitbox();
      if (hit) ctx.strokeRect(hit.x, hit.y, hit.w, hit.h);
    });

    // Yellow Pushboxes
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    this.allFighters.forEach(f => {
      const p = f.getPushbox();
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    });
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

    if (this.isCampaign && this.winner === this.f1) {
      ctx.fillText('CAMPAIGN CONQUEROR!', W / 2, 85);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px monospace';
      ctx.fillText('ALL 7 BOSSES & THE PRIMEVAL APEX FELLED', W / 2, 106);
    } else {
      ctx.fillText(`${this.winner ? this.winner.name : 'PLAYER'} WINS!`, W / 2, 85);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px monospace';
      ctx.fillText('FINAL IMPACT CHAMPION', W / 2, 106);
    }

    // Winner Sprite Large Display
    if (this.winner) {
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
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('PRESS [ENTER] OR [SPACE] TO RETURN TO MODE SELECT', W / 2, H - 15);

    ctx.textAlign = 'left';
  }
}
