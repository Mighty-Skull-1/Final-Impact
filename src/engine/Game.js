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
import { Netplay } from '../network/Netplay.js';
import { OnlineLobby } from '../ui/OnlineLobby.js';

export const GAME_SCREENS = {
  TITLE: 'TITLE',
  MODE_SELECT: 'MODE_SELECT',
  ONLINE_LOBBY: 'ONLINE_LOBBY',
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

    // Online Multiplayer Netplay Engine & Lobby UI
    this.netplay = new Netplay();
    this.onlineLobby = new OnlineLobby(this.netplay, this);
    this.isOnline = false;
    this.onlineSyncTick = 0;

    // Victory Screen & Rematch State
    this.victoryMenuIndex = 0; // 0: Rematch, 1: Character Select, 2: Main Menu
    this.onlineRematchOption = 0; // 0: YES, 1: NO
    this.myRematchVote = null; // null | 'yes' | 'no'
    this.oppRematchVote = null; // null | 'yes' | 'no'
    this.rematchStatusMessage = '';
    this.rematchTimer = 0;

    // Listen for Netplay peer connection
    this.netplay.onConnect((isHost) => {
      this.isOnline = true;
      this.charSelect.setMode('online', 'normal', isHost ? 1 : 2);
      this.screen = GAME_SCREENS.CHAR_SELECT;
      soundFX.playMenuSelect();
    });

    // Listen for Netplay disconnect / connection loss
    this.netplay.onDisconnect(() => {
      if (this.isOnline) {
        this.isOnline = false;
        soundFX.playBlock();
        if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.CHAR_SELECT || this.screen === GAME_SCREENS.ROUND_OVER) {
          this.onlineLobby.reset();
          this.onlineLobby.subState = 'MENU';
          this.onlineLobby.netplay.statusMessage = 'CHALLENGER DISCONNECTED';
          this.screen = GAME_SCREENS.ONLINE_LOBBY;
        } else if (this.screen === GAME_SCREENS.VICTORY) {
          this.rematchStatusMessage = 'OPPONENT DISCONNECTED. RETURNING TO LOBBY...';
          if (!this.rematchTimer) this.rematchTimer = 60;
        }
      }
    });

    // Handle incoming Netplay sync messages
    this.netplay.onMessage((msg) => {
      if (msg.type === 'CHAR_SYNC') {
        if (!this.netplay.isHost) {
          if (msg.p1Index !== undefined) this.charSelect.p1Index = msg.p1Index;
          if (msg.stageIndex !== undefined) this.charSelect.stageIndex = msg.stageIndex;
        } else {
          if (msg.p2Index !== undefined) this.charSelect.p2Index = msg.p2Index;
        }
        if (msg.startMatch) {
          soundFX.playAnnouncer('ROUND1');
          soundFX.startMusic('fight');
          this.startMatch();
        }
      } else if (msg.type === 'REMATCH_VOTE') {
        this.handleOpponentRematchVote(msg.vote);
      } else if (msg.type === 'REMATCH') {
        soundFX.playAnnouncer('ROUND1');
        soundFX.startMusic('fight');
        this.startMatch();
      }
    });

    // Universal canvas click delegation across screens
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / (rect.width || 1);
      const scaleY = this.canvas.height / (rect.height || 1);
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (this.screen === GAME_SCREENS.MODE_SELECT) {
        this.modeSelect.handleClick(x, y, () => {
          this.screen = GAME_SCREENS.TITLE;
        }, () => {
          this.handleConfirmPress();
        }, this.canvas.width);
      } else if (this.screen === GAME_SCREENS.CHAR_SELECT) {
        this.charSelect.handleClick(x, y, () => {
          if (this.isOnline) {
            this.netplay.disconnect();
            this.isOnline = false;
            this.screen = GAME_SCREENS.ONLINE_LOBBY;
          } else {
            this.screen = GAME_SCREENS.MODE_SELECT;
          }
        }, () => {
          this.handleConfirmPress();
        }, this.canvas.width, this.canvas.height);
      } else if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        this.onlineLobby.handleClick(x, y);
      } else if (this.screen === GAME_SCREENS.VICTORY) {
        this.handleVictoryClick(x, y);
      }
    });

    // URL Query Parameter ?room=XXXX auto-join
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        if (room) {
          this.onlineLobby.subState = 'JOINING';
          this.onlineLobby.joinInputCode = room.toUpperCase();
          this.screen = GAME_SCREENS.ONLINE_LOBBY;
          setTimeout(() => {
            this.netplay.joinMatch(room);
          }, 600);
        }
      } catch (e) {
        console.warn('Failed to parse URL query params', e);
      }
    }

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
    this.campaignStageWon = false;

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
      // If settings modal is open, avoid triggering game shortcuts or screen changes
      if (this.settingsManager && this.settingsManager.isOpen) {
        if (this.settingsManager.isRebinding) {
          // Key is currently being captured by keybind rebinding
          return;
        }
        // ONLY P key resumes/pauses as requested
        if (e.code === 'KeyP') {
          e.preventDefault();
          this.settingsManager.close();
          return;
        }
        if (e.code === 'Escape') {
          e.preventDefault();
          return;
        }
        return;
      }

      // In a fight, Escape must NEVER pause or back out (P is the dedicated pause key)
      if (this.screen === GAME_SCREENS.FIGHT && e.code === 'Escape') {
        e.preventDefault();
        return;
      }

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
      const isBackKey = e.code === 'Escape' || e.code === 'Tab' || e.code === 'Backquote' || (e.code === 'KeyB' && this.screen !== GAME_SCREENS.FIGHT && (this.screen !== GAME_SCREENS.ONLINE_LOBBY || this.onlineLobby.subState !== 'JOINING'));
      if (isBackKey) {
        e.preventDefault();
        e.stopPropagation();
        if (this.screen === GAME_SCREENS.MODE_SELECT) {
          this.screen = GAME_SCREENS.TITLE;
        } else if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
          if (this.onlineLobby.subState === 'MENU') {
            this.screen = GAME_SCREENS.MODE_SELECT;
          } else {
            this.onlineLobby.handleInput({ back: true });
          }
        } else if (this.screen === GAME_SCREENS.CHAR_SELECT) {
          if (this.isOnline) {
            this.netplay.disconnect();
            this.isOnline = false;
            this.screen = GAME_SCREENS.ONLINE_LOBBY;
          } else {
            this.screen = GAME_SCREENS.MODE_SELECT;
          }
        } else if (this.screen === GAME_SCREENS.VICTORY) {
          if (this.isOnline) {
            this.voteRematch('no');
          } else {
            this.screen = GAME_SCREENS.MODE_SELECT;
          }
        }
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        this.settingsManager.toggle();
      }

      // Online Lobby Key forwarding (C to copy link in HOSTING, typing in JOINING)
      if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        if (e.code === 'KeyC' && this.onlineLobby.subState === 'HOSTING') {
          this.onlineLobby.handleInput({ copy: true });
        } else if (this.onlineLobby.subState === 'JOINING' && e.code !== 'Space' && e.code !== 'Enter') {
          this.onlineLobby.handleInput({ key: e.key });
        }
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
      if (this.modeSelect.selectedMode === 'online') {
        this.onlineLobby.reset();
        this.screen = GAME_SCREENS.ONLINE_LOBBY;
        return;
      }
      this.charSelect.setMode(this.modeSelect.selectedMode, this.modeSelect.currentDifficulty);
      this.screen = GAME_SCREENS.CHAR_SELECT;
      return;
    }

    if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      this.onlineLobby.handleInput({ confirm: true });
      return;
    }

    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      if (this.isOnline) {
        if (this.netplay.isHost) {
          this.netplay.send({
            type: 'CHAR_SYNC',
            p1Index: this.charSelect.p1Index,
            stageIndex: this.charSelect.stageIndex,
            startMatch: true
          });
          soundFX.playAnnouncer('ROUND1');
          soundFX.startMusic('fight');
          this.startMatch();
        } else {
          this.netplay.send({
            type: 'CHAR_SYNC',
            p2Index: this.charSelect.p2Index,
            p2Ready: true
          });
          soundFX.playMenuSelect();
        }
        return;
      }
      soundFX.playAnnouncer('ROUND1');
      soundFX.startMusic('fight');
      this.startMatch();
      return;
    }

    if (this.screen === GAME_SCREENS.VICTORY) {
      if (this.isOnline) {
        if (this.myRematchVote === null) {
          this.voteRematch(this.onlineRematchOption === 0 ? 'yes' : 'no');
        }
        return;
      }
      if (this.victoryMenuIndex === 0) {
        // Rematch
        soundFX.playAnnouncer('ROUND1');
        soundFX.startMusic('fight');
        this.startMatch();
      } else if (this.victoryMenuIndex === 1) {
        // Character Select
        soundFX.playMenuSelect();
        this.screen = GAME_SCREENS.CHAR_SELECT;
      } else {
        // Mode Select / Main Menu
        soundFX.playMenuSelect();
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
    }
  }

  initVictoryScreen() {
    this.screen = GAME_SCREENS.VICTORY;
    this.victoryMenuIndex = 0;
    this.onlineRematchOption = 0;
    this.myRematchVote = null;
    this.oppRematchVote = null;
    this.rematchStatusMessage = '';
    this.rematchTimer = 0;
  }

  voteRematch(vote) {
    if (this.myRematchVote !== null) return;
    this.myRematchVote = vote;
    if (this.netplay && this.netplay.isConnected) {
      this.netplay.sendRematchVote(vote);
    }
    if (vote === 'yes') {
      soundFX.playMenuSelect();
      if (this.oppRematchVote === 'yes') {
        this.rematchStatusMessage = '⚔️ BOTH PLAYERS ACCEPTED! REMATCH STARTING... ⚔️';
        this.rematchTimer = 60;
      } else {
        this.rematchStatusMessage = 'YOU VOTED YES. WAITING FOR OPPONENT...';
      }
    } else {
      soundFX.playWhoosh('light');
      this.rematchStatusMessage = 'YOU DECLINED REMATCH. RETURNING TO LOBBY...';
      this.rematchTimer = 75;
    }
  }

  handleOpponentRematchVote(vote) {
    this.oppRematchVote = vote;
    if (vote === 'yes') {
      if (this.myRematchVote === 'yes') {
        this.rematchStatusMessage = '⚔️ BOTH PLAYERS ACCEPTED! REMATCH STARTING... ⚔️';
        this.rematchTimer = 60;
      } else {
        this.rematchStatusMessage = 'OPPONENT WANTS A REMATCH! (VOTE YES OR NO)';
      }
    } else if (vote === 'no') {
      this.rematchStatusMessage = 'OPPONENT DECLINED REMATCH. RETURNING TO LOBBY...';
      this.rematchTimer = 75;
    }
  }

  handleVictoryClick(x, y) {
    const W = this.canvas.width;

    // Top-Left Back Button Check
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      if (this.isOnline) {
        this.voteRematch('no');
      } else {
        soundFX.playWhoosh('light');
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
      return true;
    }

    if (this.isOnline) {
      if (this.myRematchVote === null) {
        // YES Button
        if (x >= W / 2 - 195 && x <= W / 2 - 10 && y >= 262 && y <= 296) {
          this.onlineRematchOption = 0;
          this.voteRematch('yes');
          return true;
        }
        // NO Button
        if (x >= W / 2 + 10 && x <= W / 2 + 195 && y >= 262 && y <= 296) {
          this.onlineRematchOption = 1;
          this.voteRematch('no');
          return true;
        }
      }
    } else {
      // Offline 3 Options
      if (x >= W / 2 - 130 && x <= W / 2 + 130) {
        if (y >= 224 && y <= 248) {
          this.victoryMenuIndex = 0;
          this.handleConfirmPress();
          return true;
        } else if (y >= 254 && y <= 278) {
          this.victoryMenuIndex = 1;
          this.handleConfirmPress();
          return true;
        } else if (y >= 284 && y <= 308) {
          this.victoryMenuIndex = 2;
          this.handleConfirmPress();
          return true;
        }
      }
    }
    return false;
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
    this.isOnline = (mode === 'online') || (this.netplay && this.netplay.isConnected);

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
      // Standard 1v1 (CPU, 2P, Online, Training)
      const p2Id = this.charSelect.characters[this.charSelect.p2Index].id;
      const isCpu = !this.isOnline && (mode !== '2p');

      this.f1 = this.createFighter(p1Id, 220, true, 1, false);
      this.f2 = this.createFighter(p2Id, 700, false, 2, isCpu);
      this.f3 = null;
      this.f4 = null;
      this.allFighters = [this.f1, this.f2];

      if (this.isTraining) {
        this.ai.setDifficulty('easy');
      } else if (!this.isOnline) {
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

    // Thematic stage backgrounds for each boss
    const stageThemes = ['neo_tokyo', 'suzaku', 'thunder_dojo', 'suzaku', 'neo_tokyo', 'thunder_dojo', 'suzaku'];
    const stageId = stageThemes[this.bossIndex] || 'suzaku';
    this.stage = new Stage(stageId);

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
    }

    // Restore P1 physical limbs and state for the new stage
    if (this.f1) {
      this.f1.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
      this.f1.statusEffects = [];
      this.f1.heldPickup = null;
      this.f1.submissionStruggle = 0;
      this.f1.isRageMode = false;
      this.f1.isInvincible = false;
      this.f1.hitStun = 0;
      this.f1.blockStun = 0;
    }
    this.cameraX = 0;

    // Reset HUD timer to full 99 seconds for the stage and calibrate red health bars
    this.hud.reset(1);
    this.hud.p1RedHealth = this.f1 ? this.f1.health : 1000;
    this.hud.p2RedHealth = this.f2 ? this.f2.health : 1000;

    const bossName = currentBossId === 'bouncer_twins' ? 'THE BOUNCER TWINS (2v1)' : this.f2.name;
    this.hud.setAnnouncement(`STAGE ${stageNum}: ${bossName}`, 120);
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

    // 0. Online Lobby Navigation
    if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      if (input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp')) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        this.onlineLobby.handleInput({ up: true });
      } else if (input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown')) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        this.onlineLobby.handleInput({ down: true });
      }
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
      const isHostOrLocal = !this.isOnline || this.netplay.isHost;

      if (input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft')) {
        input.consumeKey('KeyA');
        input.consumeKey('ArrowLeft');
        this.charSelect.handleInput({ left: true }, isHostOrLocal);
        if (this.isOnline) this.syncCharSelect();
      } else if (input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight')) {
        input.consumeKey('KeyD');
        input.consumeKey('ArrowRight');
        this.charSelect.handleInput({ right: true }, isHostOrLocal);
        if (this.isOnline) this.syncCharSelect();
      }

      if (input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp')) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        if (isHostOrLocal) {
          this.charSelect.handleInput({ up: true }, true);
          if (this.isOnline) this.syncCharSelect();
        }
      } else if (input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown')) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        if (isHostOrLocal) {
          this.charSelect.handleInput({ down: true }, true);
          if (this.isOnline) this.syncCharSelect();
        }
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
      this.updateVictoryScreen();
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

    if (this.isOnline) {
      this.updateOnlineMatch();
    } else {
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

    // 14. End Input Frame (resets single-frame leading-edge triggers)
    input.endFrame();
  }

  syncCharSelect() {
    if (!this.isOnline || !this.netplay.isConnected) return;
    if (this.netplay.isHost) {
      this.netplay.send({
        type: 'CHAR_SYNC',
        p1Index: this.charSelect.p1Index,
        stageIndex: this.charSelect.stageIndex
      });
    } else {
      this.netplay.send({
        type: 'CHAR_SYNC',
        p2Index: this.charSelect.p2Index
      });
    }
  }

  updateOnlineMatch() {
    const isHost = this.netplay.isHost;
    const targetForP1 = this.getNearestOpponent(this.f1);
    const targetForF2 = this.f2 ? this.getNearestOpponent(this.f2) : this.f1;

    if (isHost) {
      // Host controls f1 via local P1 controls
      const localInput = input.getState(1, this.f1.facingRight);
      this.netplay.sendInput(localInput);
      this.f1.handleInput(localInput, input, targetForP1);

      if (this.f1.state === FIGHTER_STATE.SUBMISSION_LOCK) {
        if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
          this.f1.submissionStruggle = Math.min(100, (this.f1.submissionStruggle || 0) + 14);
          soundFX.playWhoosh('light');
        }
      }

      if (this.f2 && !this.f2.isDead) {
        const remoteInput = this.netplay.remoteInputState || {};

        // Bridge remote attack triggers into player 2 action buffer
        if (remoteInput.ultimateJust) input.queueAction(2, 'ULTIMATE');
        else if (remoteInput.dirtyJust) input.queueAction(2, 'DIRTY');
        else if (remoteInput.sp3Just) input.queueAction(2, 'SP3');
        else if (remoteInput.sp2Just) input.queueAction(2, 'SP2');
        else if (remoteInput.sp1Just) input.queueAction(2, 'SP1');
        else if (remoteInput.hpJust) input.queueAction(2, 'HP');
        else if (remoteInput.hkJust) input.queueAction(2, 'HK');
        else if (remoteInput.lpJust) input.queueAction(2, 'LP');
        else if (remoteInput.lkJust) input.queueAction(2, 'LK');

        this.f2.handleInput(remoteInput, input, targetForF2);

        // Clear remote one-shot triggers so attacks don't spam indefinitely
        remoteInput.lpJust = false;
        remoteInput.hpJust = false;
        remoteInput.lkJust = false;
        remoteInput.hkJust = false;
        remoteInput.sp1Just = false;
        remoteInput.sp2Just = false;
        remoteInput.sp3Just = false;
        remoteInput.dirtyJust = false;
        remoteInput.ultimateJust = false;

        if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
          if (remoteInput.lpJust || remoteInput.hpJust || remoteInput.lkJust || remoteInput.hkJust || remoteInput.dirtyJust) {
            this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 14);
            soundFX.playWhoosh('light');
          }
        }
      }

      // Host streams authoritative snapshot every 4 ticks (~15Hz)
      this.onlineSyncTick++;
      if (this.onlineSyncTick % 4 === 0 && this.f2) {
        this.netplay.sendSnapshot({
          f1: {
            x: Math.round(this.f1.x),
            y: Math.round(this.f1.y),
            vx: this.f1.vx,
            vy: this.f1.vy,
            health: this.f1.health,
            stamina: this.f1.stamina,
            superMeter: this.f1.superMeter,
            state: this.f1.state,
            facingRight: this.f1.facingRight,
            roundsWon: this.f1.roundsWon
          },
          f2: {
            x: Math.round(this.f2.x),
            y: Math.round(this.f2.y),
            vx: this.f2.vx,
            vy: this.f2.vy,
            health: this.f2.health,
            stamina: this.f2.stamina,
            superMeter: this.f2.superMeter,
            state: this.f2.state,
            facingRight: this.f2.facingRight,
            roundsWon: this.f2.roundsWon
          },
          round: this.round,
          timer: this.hud.timer
        });
      }
    } else {
      // Client controls f2 via local P1 controls
      if (this.f2 && !this.f2.isDead) {
        const localInput = input.getState(1, this.f2.facingRight);

        // Queue local client attack into player 2 action queue so f2 (playerNum: 2) registers it immediately
        if (localInput.ultimateJust) input.queueAction(2, 'ULTIMATE');
        else if (localInput.dirtyJust) input.queueAction(2, 'DIRTY');
        else if (localInput.sp3Just) input.queueAction(2, 'SP3');
        else if (localInput.sp2Just) input.queueAction(2, 'SP2');
        else if (localInput.sp1Just) input.queueAction(2, 'SP1');
        else if (localInput.hpJust) input.queueAction(2, 'HP');
        else if (localInput.hkJust) input.queueAction(2, 'HK');
        else if (localInput.lpJust) input.queueAction(2, 'LP');
        else if (localInput.lkJust) input.queueAction(2, 'LK');

        this.netplay.sendInput(localInput);
        this.f2.handleInput(localInput, input, targetForF2);

        if (this.f2.state === FIGHTER_STATE.SUBMISSION_LOCK) {
          if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
            this.f2.submissionStruggle = Math.min(100, (this.f2.submissionStruggle || 0) + 14);
            soundFX.playWhoosh('light');
          }
        }
      }

      // Challenger applies host remote inputs to f1
      const remoteInput = this.netplay.remoteInputState || {};

      // Queue host remote attacks for f1
      if (remoteInput.ultimateJust) input.queueAction(1, 'ULTIMATE');
      else if (remoteInput.dirtyJust) input.queueAction(1, 'DIRTY');
      else if (remoteInput.sp3Just) input.queueAction(1, 'SP3');
      else if (remoteInput.sp2Just) input.queueAction(1, 'SP2');
      else if (remoteInput.sp1Just) input.queueAction(1, 'SP1');
      else if (remoteInput.hpJust) input.queueAction(1, 'HP');
      else if (remoteInput.hkJust) input.queueAction(1, 'HK');
      else if (remoteInput.lpJust) input.queueAction(1, 'LP');
      else if (remoteInput.lkJust) input.queueAction(1, 'LK');

      this.f1.handleInput(remoteInput, input, targetForP1);

      // Clear remote triggers
      remoteInput.lpJust = false;
      remoteInput.hpJust = false;
      remoteInput.lkJust = false;
      remoteInput.hkJust = false;
      remoteInput.sp1Just = false;
      remoteInput.sp2Just = false;
      remoteInput.sp3Just = false;
      remoteInput.dirtyJust = false;
      remoteInput.ultimateJust = false;

      // Reconcile client with authoritative host snapshot
      if (this.netplay.latestSnapshot) {
        const snap = this.netplay.latestSnapshot;
        if (snap.f1 && this.f1) {
          this.f1.health = snap.f1.health;
          this.f1.stamina = snap.f1.stamina;
          this.f1.superMeter = snap.f1.superMeter;
          this.f1.roundsWon = snap.f1.roundsWon;
          if (Math.abs(this.f1.x - snap.f1.x) > 40) this.f1.x = snap.f1.x;
          else this.f1.x += (snap.f1.x - this.f1.x) * 0.25;
          if (Math.abs(this.f1.y - snap.f1.y) > 40) this.f1.y = snap.f1.y;
          else this.f1.y += (snap.f1.y - this.f1.y) * 0.25;
        }
        if (snap.f2 && this.f2) {
          this.f2.health = snap.f2.health;
          this.f2.stamina = snap.f2.stamina;
          this.f2.superMeter = snap.f2.superMeter;
          this.f2.roundsWon = snap.f2.roundsWon;
          if (Math.abs(this.f2.x - snap.f2.x) > 50) this.f2.x = snap.f2.x;
          else this.f2.x += (snap.f2.x - this.f2.x) * 0.2;
          if (Math.abs(this.f2.y - snap.f2.y) > 50) this.f2.y = snap.f2.y;
          else this.f2.y += (snap.f2.y - this.f2.y) * 0.2;
        }
        if (snap.timer !== undefined && this.hud) {
          this.hud.timer = snap.timer;
        }
      }
    }
  }

  checkPickups() {
    this.allFighters.forEach(f => {
      if (f.isDead || f.heldPickup) return;
      for (const p of this.pickups) {
        if (p.active && !p.isAirborne && Math.abs(f.x - p.x) < 45) {
          let wantsPickup = false;
          if (this.isOnline) {
            const isLocal = (this.netplay.isHost && f.playerNum === 1) || (!this.netplay.isHost && f.playerNum === 2);
            if (isLocal) {
              wantsPickup = (input.isDown('KeyS') && input.isJustPressed('KeyC'));
            } else {
              const remote = this.netplay.remoteInputState || {};
              wantsPickup = !!(remote.rawDown && remote.dirtyJust);
            }
          } else {
            const isP1 = f.playerNum === 1;
            wantsPickup = isP1
              ? (input.isDown('KeyS') && input.isJustPressed('KeyC'))
              : (f.isCpu ? Math.random() < 0.04 : (input.isDown('Numpad2') && input.isJustPressed('Numpad3')));
          }

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
      if (isChampionStage && this.f2 && ((this.f2.phase === 1 && this.f2.hasTransitioned) || this.f2.transitionTimer > 0)) {
        return; // Fight continues in Phase 2!
      }

      const bossDead = isBouncerStage
        ? (this.f2.isDead && (!this.f4 || this.f4.isDead))
        : (this.f2.isDead);
      const playerDead = this.f1.isDead;
      const isTimeOver = this.hud.timer <= 0;

      let stageWon = false;
      let stageLost = false;

      if (bossDead) {
        stageWon = true;
      } else if (playerDead) {
        stageLost = true;
      } else if (isTimeOver) {
        // Time Over resolution based on remaining health
        const bossHealth = isBouncerStage ? (this.f2.health + (this.f4 ? this.f4.health : 0)) : this.f2.health;
        if (this.f1.health > bossHealth) {
          stageWon = true;
        } else {
          stageLost = true;
        }
      }

      if ((stageWon || stageLost) && this.screen === GAME_SCREENS.FIGHT) {
        this.screen = GAME_SCREENS.ROUND_OVER;
        this.slowMotion = true;
        this.roundOverTimer = 160;
        this.campaignStageWon = stageWon;

        if (stageWon && isChampionStage && this.f2.phase === 2) {
          this.hud.setAnnouncement('LEGEND VANQUISHED', 150);
        } else if (isTimeOver) {
          this.hud.setAnnouncement(stageWon ? 'TIME OVER - STAGE CLEAR!' : 'TIME OVER - DEFEAT', 130);
          soundFX.playAnnouncer('TIME_OVER');
        } else {
          this.hud.setAnnouncement(stageWon ? 'STAGE CLEAR!' : 'DEFEAT', 120);
        }
        this.hud.triggerShake(14);
      }

      if (this.screen === GAME_SCREENS.ROUND_OVER) {
        this.roundOverTimer--;
        if (this.roundOverTimer <= 0) {
          if (this.campaignStageWon) {
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
              this.initVictoryScreen();
              this.winner = this.f1;
              soundFX.playAnnouncer('YOU_WIN');
            }
          } else {
            // Player lost campaign
            this.initVictoryScreen();
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
          this.initVictoryScreen();
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
          this.initVictoryScreen();
          this.winner = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
          soundFX.playAnnouncer('YOU_WIN');
        } else {
          this.resetRound();
        }
      }
    }
  }

  updateVictoryScreen() {
    if (this.isOnline) {
      // Netplay disconnect check
      if (!this.netplay || !this.netplay.isConnected) {
        if (!this.rematchStatusMessage.includes('DISCONNECTED')) {
          this.rematchStatusMessage = 'OPPONENT DISCONNECTED. RETURNING TO LOBBY...';
          if (!this.rematchTimer) this.rematchTimer = 60;
        }
      }

      // Rematch countdown timer
      if (this.rematchTimer > 0) {
        this.rematchTimer--;
        if (this.rematchTimer === 0) {
          if (this.myRematchVote === 'yes' && this.oppRematchVote === 'yes') {
            soundFX.playAnnouncer('ROUND1');
            soundFX.startMusic('fight');
            this.startMatch();
          } else {
            this.screen = GAME_SCREENS.ONLINE_LOBBY;
            this.onlineLobby.subState = 'MENU';
            this.myRematchVote = null;
            this.oppRematchVote = null;
          }
        }
        return;
      }

      // Navigation if player hasn't voted yet
      if (this.myRematchVote === null) {
        if (input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp')) {
          input.consumeKey('KeyA');
          input.consumeKey('ArrowLeft');
          input.consumeKey('KeyW');
          input.consumeKey('ArrowUp');
          if (this.onlineRematchOption !== 0) {
            this.onlineRematchOption = 0;
            soundFX.playWhoosh('light');
          }
        } else if (input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown')) {
          input.consumeKey('KeyD');
          input.consumeKey('ArrowRight');
          input.consumeKey('KeyS');
          input.consumeKey('ArrowDown');
          if (this.onlineRematchOption !== 1) {
            this.onlineRematchOption = 1;
            soundFX.playWhoosh('light');
          }
        }

        // Direct quick hotkeys
        if (input.isJustPressed('KeyY')) {
          input.consumeKey('KeyY');
          this.voteRematch('yes');
        } else if (input.isJustPressed('KeyN')) {
          input.consumeKey('KeyN');
          this.voteRematch('no');
        }
      }
      return;
    }

    // Offline Victory Menu Navigation
    if (input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp')) {
      input.consumeKey('KeyW');
      input.consumeKey('ArrowUp');
      this.victoryMenuIndex = (this.victoryMenuIndex - 1 + 3) % 3;
      soundFX.playWhoosh('light');
    } else if (input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown')) {
      input.consumeKey('KeyS');
      input.consumeKey('ArrowDown');
      this.victoryMenuIndex = (this.victoryMenuIndex + 1) % 3;
      soundFX.playWhoosh('light');
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

    if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      this.onlineLobby.render(ctx, W, H);
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

    // Online Connection & Ping Badge
    if (this.isOnline && this.netplay) {
      this.renderOnlineBadge(ctx, W, H);
    }

    ctx.restore();
  }

  renderOnlineBadge(ctx, W, H) {
    ctx.save();
    const ping = this.netplay.ping || 24;
    const isHost = this.netplay.isHost;
    const roleText = isHost ? 'HOST' : 'CLIENT';
    const pingColor = ping < 60 ? '#22c55e' : (ping < 120 ? '#eab308' : '#ef4444');

    const badgeX = W / 2 - 70;
    const badgeY = 6;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(badgeX, badgeY, 140, 15);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.strokeRect(badgeX, badgeY, 140, 15);

    // Online dot
    ctx.fillStyle = pingColor;
    ctx.beginPath();
    ctx.arc(badgeX + 8, badgeY + 7.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ONLINE [${roleText}] ${ping}ms`, badgeX + 16, badgeY + 11);
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

    ctx.fillStyle = '#08051a';
    ctx.fillRect(0, 0, W, H);

    // Retro Grid
    ctx.strokeStyle = '#181232';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Top-Left Back Button: [ ⬅️ LOBBY (B) ] or [ ⬅️ MODES (B) ]
    ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
    ctx.fillRect(12, 10, 95, 22);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 10, 95, 22);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.isOnline ? '⬅️ LOBBY [B]' : '⬅️ MODES [B]', 60, 24);

    // Victory Banner
    ctx.fillStyle = '#17113b';
    ctx.fillRect(0, 16, W, 46);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 15, W, 2);
    ctx.fillRect(0, 62, W, 2);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 18px monospace';

    if (this.isCampaign && this.winner === this.f1) {
      ctx.fillText('🏆 CAMPAIGN CONQUEROR! 🏆', W / 2, 38);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText('ALL 7 BOSSES & THE PRIMEVAL APEX FELLED', W / 2, 52);
    } else {
      ctx.fillText(`${this.winner ? this.winner.name : 'PLAYER'} WINS!`, W / 2, 38);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText('FINAL IMPACT CHAMPION', W / 2, 52);
    }

    // Winner Sprite Display
    if (this.winner) {
      const sprites = this.winner.sprites?.VICTORY || this.winner.sprites?.IDLE || [];
      const winImg = sprites[0];
      if (winImg) {
        ctx.drawImage(winImg, W / 2 - 45, 68, 90, 105);
      }

      // Victory Quote
      const quote = this.victoryQuotes[this.winner.id] || '"Victory belongs to the swift and disciplined!"';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 10px monospace';
      ctx.fillText(quote, W / 2, 184);
    }

    // Interactive Menu Area
    if (this.isOnline) {
      // Online Rematch Voting UI Card
      const cardW = 440;
      const cardH = 150;
      const cardX = (W - cardW) / 2;
      const cardY = 196;

      ctx.fillStyle = 'rgba(15, 12, 32, 0.95)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // Card Header
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('⚔️ ONLINE REMATCH VOTE ⚔️', W / 2, cardY + 18);

      // Status Notification Banner
      if (this.rematchStatusMessage) {
        let statusColor = '#38bdf8';
        if (this.rematchStatusMessage.includes('ACCEPTED')) statusColor = '#22c55e';
        else if (this.rematchStatusMessage.includes('DECLINED') || this.rematchStatusMessage.includes('DISCONNECTED')) statusColor = '#ef4444';
        else if (this.rematchStatusMessage.includes('WANTS A REMATCH')) statusColor = '#facc15';

        ctx.fillStyle = statusColor;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(this.rematchStatusMessage, W / 2, cardY + 36);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('WOULD YOU LIKE TO REMATCH YOUR OPPONENT?', W / 2, cardY + 36);
      }

      // YES / NO Buttons
      const btnW = 195;
      const btnH = 34;
      const btnY = cardY + 46;
      const yesX = W / 2 - btnW - 8;
      const noX = W / 2 + 8;

      // Option 0: YES
      const isYesHighlighted = this.onlineRematchOption === 0;
      const hasVotedYes = this.myRematchVote === 'yes';
      ctx.fillStyle = hasVotedYes ? 'rgba(22, 101, 52, 0.9)' : (isYesHighlighted ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.8)');
      ctx.fillRect(yesX, btnY, btnW, btnH);
      ctx.strokeStyle = isYesHighlighted ? '#fde047' : (hasVotedYes ? '#22c55e' : '#15803d');
      ctx.lineWidth = isYesHighlighted ? 2 : 1;
      ctx.strokeRect(yesX, btnY, btnW, btnH);

      ctx.fillStyle = hasVotedYes ? '#4ade80' : (isYesHighlighted ? '#ffffff' : '#cbd5e1');
      ctx.font = 'bold 11px monospace';
      const yesPrefix = isYesHighlighted ? '► ' : '';
      const yesSuffix = hasVotedYes ? ' [✓ VOTED]' : '';
      ctx.fillText(`${yesPrefix}YES - REMATCH${yesSuffix}`, yesX + btnW / 2, btnY + 21);

      // Option 1: NO
      const isNoHighlighted = this.onlineRematchOption === 1;
      const hasVotedNo = this.myRematchVote === 'no';
      ctx.fillStyle = hasVotedNo ? 'rgba(153, 27, 27, 0.9)' : (isNoHighlighted ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.8)');
      ctx.fillRect(noX, btnY, btnW, btnH);
      ctx.strokeStyle = isNoHighlighted ? '#fde047' : (hasVotedNo ? '#ef4444' : '#991b1b');
      ctx.lineWidth = isNoHighlighted ? 2 : 1;
      ctx.strokeRect(noX, btnY, btnW, btnH);

      ctx.fillStyle = hasVotedNo ? '#f87171' : (isNoHighlighted ? '#ffffff' : '#cbd5e1');
      ctx.font = 'bold 11px monospace';
      const noPrefix = isNoHighlighted ? '► ' : '';
      const noSuffix = hasVotedNo ? ' [✗ VOTED]' : '';
      ctx.fillText(`${noPrefix}NO - RETURN TO LOBBY${noSuffix}`, noX + btnW / 2, btnY + 21);

      // Live Player Vote Status Indicators
      const p1VoteText = this.myRematchVote ? (this.myRematchVote === 'yes' ? 'READY (YES)' : 'DECLINED (NO)') : 'DECIDING...';
      const p2VoteText = this.oppRematchVote ? (this.oppRematchVote === 'yes' ? 'READY (YES)' : 'DECLINED (NO)') : 'DECIDING...';
      const p1Color = this.myRematchVote === 'yes' ? '#22c55e' : (this.myRematchVote === 'no' ? '#ef4444' : '#94a3b8');
      const p2Color = this.oppRematchVote === 'yes' ? '#22c55e' : (this.oppRematchVote === 'no' ? '#ef4444' : '#94a3b8');

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = p1Color;
      ctx.fillText(`YOU: [ ${p1VoteText} ]`, W / 2 - 105, cardY + 104);

      ctx.fillStyle = '#64748b';
      ctx.fillText('|', W / 2, cardY + 104);

      ctx.fillStyle = p2Color;
      ctx.fillText(`OPPONENT: [ ${p2VoteText} ]`, W / 2 + 105, cardY + 104);

      // Controls Footer inside card
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('◄/► [A/D] SELECT  |  [ENTER] VOTE  |  [Y] YES  |  [N / B / ESC] NO', W / 2, cardY + 130);

    } else {
      // Offline 3-Option Interactive Menu
      const menuOptions = [
        { label: '⚔️ REMATCH', desc: 'Restart match immediately' },
        { label: '🥋 CHARACTER SELECT', desc: 'Return to character select' },
        { label: '🏆 MAIN MENU', desc: 'Return to Mode Select' }
      ];

      const btnW = 280;
      const btnH = 26;
      const startY = 208;
      const gapY = 32;

      menuOptions.forEach((opt, idx) => {
        const isSelected = this.victoryMenuIndex === idx;
        const y = startY + idx * gapY;
        const x = (W - btnW) / 2;

        ctx.fillStyle = isSelected ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(x, y, btnW, btnH);
        ctx.strokeStyle = isSelected ? '#fde047' : '#334155';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(x, y, btnW, btnH);

        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = isSelected ? 'bold 12px monospace' : '11px monospace';
        const cursor = isSelected ? '► ' : '';
        ctx.fillText(`${cursor}${opt.label}`, W / 2, y + 17);
      });

      // Controls Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('▲/▼ [W/S] SELECT  |  [ENTER / SPACE] CONFIRM  |  [B / ESC] BACK', W / 2, H - 12);
    }

    ctx.textAlign = 'left';
  }
}
