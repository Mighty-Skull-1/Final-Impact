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
import { Fang } from '../fighters/Fang.js';
import { Zephyr } from '../fighters/Zephyr.js';
import { Colossus } from '../fighters/Colossus.js';
import { Mighty } from '../fighters/Mighty.js';
import { AlleyPickup } from './Projectiles.js';

// Boss Imports
import { RiotCop } from '../fighters/bosses/RiotCop.js';
import { Promoter } from '../fighters/bosses/Promoter.js';
import { BorisBouncer, ViktorBouncer } from '../fighters/bosses/BouncerTwins.js';
import { Matriarch } from '../fighters/bosses/Matriarch.js';
import { StreetLord } from '../fighters/bosses/StreetLord.js';
import { UrbanLegend } from '../fighters/bosses/UrbanLegend.js';
import { Champion } from '../fighters/bosses/Champion.js';
import { EndlessDragon } from '../fighters/bosses/EndlessDragon.js';
import { Netplay } from '../network/Netplay.js';
import { OnlineLobby } from '../ui/OnlineLobby.js';
import { StageSelect } from '../ui/StageSelect.js';
import { VersusScreen } from '../ui/VersusScreen.js';
import { FinishHim } from '../ui/FinishHim.js';
import { STAGE_CATALOG } from '../graphics/StageCatalog.js';
import { ROSTER_CLASSES, ROSTER_QUOTES } from '../fighters/RosterFighters.js';
import { getFighterCatalogEntry } from '../fighters/FighterCatalog.js';
import { ShopScreen } from '../ui/ShopScreen.js';
import { AdminModal } from '../ui/AdminModal.js';
import { EconomyManager } from '../shop/SkinCatalog.js';
import { getAdminCheats, isStealthMode, isAdminAuthenticated, setStealthMode } from '../utils/CryptoAuth.js';
import { announcer } from '../audio/Announcer.js';
import { eldenManager } from '../elden/EldenRingMechanics.js';
import { CampaignDialogue } from '../combat/CampaignDialogue.js';
import { achievements } from './Achievements.js';
import { CombatDirector } from '../combat/CombatSystem.js';
import { TrainingController } from '../modes/TrainingMode.js';
import { dailyChallenges } from '../modes/Challenges.js';
import { EndingScreen } from '../modes/Endings.js';
import { vfx } from '../graphics/VFX.js';
import { COLORS as THEME_COLORS, FONTS, ease, drawBackdrop, drawSlantPanel, drawText, drawTitleText, drawKeyCap, drawPromptBar, hexToRgba } from '../ui/Theme.js';

export const GAME_SCREENS = {
  TITLE: 'TITLE',
  MODE_SELECT: 'MODE_SELECT',
  ONLINE_LOBBY: 'ONLINE_LOBBY',
  CHAR_SELECT: 'CHAR_SELECT',
  STAGE_SELECT: 'STAGE_SELECT',
  VERSUS: 'VERSUS',
  CAMPAIGN_DIALOGUE: 'CAMPAIGN_DIALOGUE',
  FIGHT: 'FIGHT',
  ROUND_OVER: 'ROUND_OVER',
  VICTORY: 'VICTORY',
  SHOP: 'SHOP',
  SITE_OF_GRACE: 'SITE_OF_GRACE',
  CHALLENGES: 'CHALLENGES',
  ENDING: 'ENDING'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderScale = 2; // 2x Super-Sampling HD Clarity Engine (1280x720 internal buffer)
    if (this.canvas) {
      this.canvas.width = GAME_WIDTH * this.renderScale;
      this.canvas.height = GAME_HEIGHT * this.renderScale;
    }
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.screen = GAME_SCREENS.TITLE;
    this.titleScreen = new TitleScreen();
    this.modeSelect = new ModeSelect();
    this.charSelect = new CharacterSelect();
    this.shopScreen = new ShopScreen();
    this.adminModal = new AdminModal(this);
    this.charSelect.onOpenAdmin = () => this.adminModal.open();
    if (typeof window !== 'undefined') {
      window.openAdminPortal = () => this.adminModal.open();
    }
    this.hud = new HUD();
    this.stageSelect = new StageSelect(STAGE_CATALOG);
    this.versus = new VersusScreen();
    this.finish = new FinishHim();
    this.campaignDialogue = new CampaignDialogue();
    this.achievements = achievements;
    this.cameraZoom = 1.0;
    this.targetCameraZoom = 1.0;
    this.zoomTimer = 0;
    this.elden = eldenManager;
    this.announcer = announcer;
    this.combat = new CombatDirector(this);
    this.training = new TrainingController(this);
    this.challenges = dailyChallenges;
    this.ending = new EndingScreen();
    this.isTutorial = false;
    this.vfx = vfx;
    this.camZoom = 1.0;
    this.camTop = 0;
    this.slowMoElapsed = 0;
    this.syncStealthUI();

    if (typeof window !== 'undefined') {
      window.addEventListener('ultimate-activated', (e) => {
        try {
          let f = e.detail && e.detail.fighter;
          if (typeof f === 'string') {
            const pn = e.detail.playerNum;
            f = (this.allFighters || []).find(x => x && x.id === f && (pn === undefined || x.playerNum === pn)) || null;
            if (f && e.detail) e.detail.fighter = f;
          }
          if (f && f.playerNum === 1) this.achievements.unlock('ULTIMATE_JUTSU');
          if (f && f.id === 'mighty') {
            this.achievements.unlock('VOID_AWAKENING');
          }
          const cat = f ? getFighterCatalogEntry(f.id) : null;
          const detail = { ...(e.detail || {}), fighter: f };
          if (cat && cat.ultimate) {
            detail.ultimateName = String(cat.ultimate.name || '').toUpperCase();
            detail.kanji = cat.ultimate.kanji || detail.kanji;
            detail.subtitle = cat.title ? `${cat.title} // SECRET ART` : (detail.subtitle || 'SECRET ART');
          }
          if (this.hud && typeof this.hud.triggerUltimateCinematic === 'function') this.hud.triggerUltimateCinematic(detail);
          if (this.screen === GAME_SCREENS.FIGHT) this.combat.onUltimate(f);
          this.triggerCameraZoom(1.18, 70);
        } catch (err) {}
      });
    }

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
      const isCoop = this.onlineLobby && this.onlineLobby.matchMode === 'coop_campaign';
      this.isCoopCampaign = isCoop;
      const modeToSet = isCoop ? 'coop_campaign' : 'online';
      this.charSelect.setMode(modeToSet, 'normal', isHost ? 1 : 2);
      this.screen = GAME_SCREENS.CHAR_SELECT;
      soundFX.playMenuSelect();
    });

    // Listen for Netplay disconnect / connection loss
    this.netplay.onDisconnect(() => {
      if (this.isOnline) {
        this.isOnline = false;
        this.isCoopCampaign = false;
        soundFX.playBlock();
        if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.CHAR_SELECT || this.screen === GAME_SCREENS.ROUND_OVER || this.screen === GAME_SCREENS.VERSUS || this.screen === GAME_SCREENS.STAGE_SELECT) {
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
          if (msg.matchMode) {
            this.onlineLobby.matchMode = msg.matchMode;
            this.isCoopCampaign = (msg.matchMode === 'coop_campaign');
            this.charSelect.gameMode = msg.matchMode;
          }
        } else {
          if (msg.p2Index !== undefined) this.charSelect.p2Index = msg.p2Index;
        }
        if (msg.startMatch) {
          this.startMatch();
        }
      } else if (msg.type === 'STAGE_SCREEN') {
        if (!this.netplay.isHost) {
          if (msg.p1Index !== undefined) this.charSelect.p1Index = msg.p1Index;
          if (msg.matchMode) {
            this.onlineLobby.matchMode = msg.matchMode;
            this.charSelect.gameMode = msg.matchMode;
          }
          this.goToStageSelect();
          if (msg.index !== undefined) this.stageSelect.setIndex(msg.index);
        }
      } else if (msg.type === 'STAGE_NAV') {
        if (!this.netplay.isHost && this.screen === GAME_SCREENS.STAGE_SELECT) this.stageSelect.setIndex(msg.index);
      } else if (msg.type === 'STAGE_BACK') {
        if (!this.netplay.isHost && this.screen === GAME_SCREENS.STAGE_SELECT) {
          this.screen = GAME_SCREENS.CHAR_SELECT;
          soundFX.playWhoosh('light');
        }
      } else if (msg.type === 'CAMPAIGN_NEXT_STAGE') {
        this.bossIndex = msg.bossIndex;
        if (this.f1) this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
        if (this.f3) this.f3.health = Math.min(this.f3.maxHealth, this.f3.health + 500);
        this.setupCampaignStage(this.f1 ? this.f1.id : 'kazuki', false);
        this.slowMotion = false;
        this.beginVersus();
      } else if (msg.type === 'CAMPAIGN_VICTORY') {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem('final_impact_unlocked_dragon', 'true');
            window.localStorage.setItem('final_impact_beaten_dragon', 'true');
          } catch (e) {}
        }
        if (this.charSelect) this.charSelect.unlockDragon();
        this.initVictoryScreen();
        this.winner = this.f1;
        soundFX.playAnnouncer('YOU_WIN');
      } else if (msg.type === 'REMATCH_VOTE') {
        this.handleOpponentRematchVote(msg.vote);
      } else if (msg.type === 'REMATCH') {
        this.startMatch();
      }
    });

    // Universal canvas click delegation across screens
    if (this.canvas && typeof this.canvas.addEventListener === 'function') {
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect ? this.canvas.getBoundingClientRect() : { left: 0, top: 0, width: rect?.width || GAME_WIDTH, height: rect?.height || GAME_HEIGHT };
        const scaleX = GAME_WIDTH / (rect.width || 1);
        const scaleY = GAME_HEIGHT / (rect.height || 1);
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

      if (this.screen === GAME_SCREENS.MODE_SELECT) {
        this.modeSelect.handleClick(x, y, () => {
          this.screen = GAME_SCREENS.TITLE;
        }, () => {
          this.handleConfirmPress();
        }, GAME_WIDTH);
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
        }, GAME_WIDTH, GAME_HEIGHT);
      } else if (this.screen === GAME_SCREENS.STAGE_SELECT) {
        this.stageSelect.handleClick(x, y, GAME_WIDTH, GAME_HEIGHT, {
          onBack: () => this.handleBackPress(),
          onConfirm: () => this.handleConfirmPress()
        });
        if (this.isOnline && this.netplay.isHost && this.screen === GAME_SCREENS.STAGE_SELECT) {
          this.netplay.send({ type: 'STAGE_NAV', index: this.stageSelect.index });
        }
      } else if (this.screen === GAME_SCREENS.SHOP) {
        const res = this.shopScreen.handleMouseClick(x, y, GAME_WIDTH, GAME_HEIGHT);
        if (res && res.action === 'back') {
          this.handleBackPress();
        }
      } else if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        this.onlineLobby.handleClick(x, y);
      } else if (this.screen === GAME_SCREENS.VICTORY) {
        this.handleVictoryClick(x, y);
      } else if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
        const res = this.elden.executeGraceSelection();
        if (res && res.action === 'proceed') {
          this.startNextCampaignStage();
        }
      } else if (this.screen === GAME_SCREENS.CAMPAIGN_DIALOGUE) {
        if (this.campaignDialogue) {
          this.campaignDialogue.handleClick(x, y, GAME_WIDTH, GAME_HEIGHT);
        }
      } else if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.ROUND_OVER) {
        // Bottom Center Pill: [TAB] GUIDE (x: 210..325, y: 338..358) | [P] MOVE LIST (x: 326..440, y: 338..358)
        if (y >= 336 && y <= 358) {
          if (x >= 210 && x <= 325) {
            if (this.hud && typeof this.hud.toggleControlsHelper === 'function') {
              this.hud.toggleControlsHelper();
            }
          } else if (x >= 326 && x <= 440) {
            if (this.settingsManager) {
              this.settingsManager.toggle();
            }
          }
        } else if (this.hud && this.hud.showControlsHelper && y >= 305 && y <= 335 && x >= 20 && x <= 620) {
          // Clicking on the helper ribbon opens the Move List
          if (this.settingsManager) {
            this.settingsManager.toggle();
          }
        }
      }
    });
    }

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
    window.__GAME_INSTANCE = this;
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
    this.isCoopCampaign = false;
    this.is2v2 = false;
    this.isTraining = false;
    this.bossQueue = ['riot_cop', 'promoter', 'bouncer_twins', 'matriarch', 'street_lord', 'urban_legend', 'champion', 'endless_dragon'];
    this.bossIndex = 0;
    this.campaignStageWon = false;

    // Victory quotes for all fighters & bosses
    this.victoryQuotes = {
      ...ROSTER_QUOTES,
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
      champion: '"Tape your hands and step aside. You never stood a chance."',
      fang: '"Eight limbs of devastation. That is the art of Muay Thai."',
      zephyr: '"Can\'t hit what flows like the wind, my friend."',
      colossus: '"Iron fists. Iron will. You never had a chance."',
      endless_dragon: '"Mortals cannot extinguish an eternal flame."',
      mighty: '"Absolute divinity. One hit is all reality allows."'
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

      if (e.code === 'KeyF' && this.isTraining && (this.screen === GAME_SCREENS.FIGHT) && this.training) {
        e.preventDefault();
        this.training.toggleMenu();
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
      // Tab key toggles Beginner Controls Helper in fight
      if (e.code === 'Tab') {
        if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.ROUND_OVER) {
          e.preventDefault();
          e.stopPropagation();
          if (this.hud && typeof this.hud.toggleControlsHelper === 'function') {
            this.hud.toggleControlsHelper();
          }
          return;
        }
      }

      const isBackKey = e.code === 'Escape' || (e.code === 'Tab' && this.screen !== GAME_SCREENS.FIGHT && this.screen !== GAME_SCREENS.ROUND_OVER) || e.code === 'Backquote' || (e.code === 'KeyB' && this.screen !== GAME_SCREENS.FIGHT && (this.screen !== GAME_SCREENS.ONLINE_LOBBY || this.onlineLobby.subState !== 'JOINING'));
      if (isBackKey) {
        e.preventDefault();
        e.stopPropagation();
        this.handleBackPress();
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        this.settingsManager.toggle();
      }

      // Online Lobby Key forwarding (C to copy link in HOSTING, typing in JOINING, M to toggle mode)
      if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
        if (e.code === 'KeyC' && this.onlineLobby.subState === 'HOSTING') {
          this.onlineLobby.handleInput({ copy: true });
        } else if (e.code === 'KeyM' && (this.onlineLobby.subState === 'MENU' || this.onlineLobby.subState === 'HOSTING')) {
          this.onlineLobby.handleInput({ toggleMode: true });
        } else if (this.onlineLobby.subState === 'JOINING' && e.code !== 'Space' && e.code !== 'Enter') {
          this.onlineLobby.handleInput({ key: e.key });
        }
      }

      // Developer Stealth Shortcut [Ctrl + Shift + A] or [Ctrl + Shift + Alt + A]
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        this.adminModal.open();
        return;
      }

      // Admin Portal Shortcut [KeyA] (Shift+A or A on menus/screens)
      if (e.code === 'KeyA' && (!isStealthMode() || isAdminAuthenticated()) && (this.screen !== GAME_SCREENS.FIGHT || e.shiftKey)) {
        e.preventDefault();
        this.adminModal.toggle();
        return;
      }

      // Screen navigation on enter / space
      if (['Space', 'Enter'].includes(e.code) && !this.settingsManager.isOpen) {
        this.handleConfirmPress();
      }
    });
  }

  syncStealthUI() {
    try {
      if (typeof document === 'undefined') return;
      const stealth = isStealthMode();
      const topbarAdminBtn = document.getElementById('topbarAdminBtn');
      if (topbarAdminBtn) {
        topbarAdminBtn.style.display = stealth ? 'none' : 'inline-block';
      }
      const adminGroup = document.getElementById('adminPortalLauncherGroup');
      if (adminGroup) {
        adminGroup.style.display = stealth ? 'none' : 'block';
      }
    } catch (e) {}
  }

  handleConfirmPress() {
    soundFX.ensureContext();

    if (this.screen === GAME_SCREENS.ENDING) {
      this.ending.advance();
      return;
    }

    if (this.screen === GAME_SCREENS.TITLE) {
      soundFX.playGong();
      this.screen = GAME_SCREENS.MODE_SELECT;
      return;
    }

    if (this.screen === GAME_SCREENS.MODE_SELECT) {
      soundFX.playGong();
      if (this.modeSelect.selectedMode === 'movelist') {
        this.settingsManager.open('movelist');
        soundFX.playMenuSelect();
        return;
      }
      if (this.modeSelect.selectedMode === 'settings') {
        this.settingsManager.open();
        soundFX.playMenuSelect();
        return;
      }
      if (this.modeSelect.selectedMode === 'challenges') {
        this.screen = GAME_SCREENS.CHALLENGES;
        soundFX.playMenuSelect();
        return;
      }
      if (this.modeSelect.selectedMode === 'tutorial') {
        this.startTutorial();
        return;
      }
      if (this.modeSelect.selectedMode === 'shop') {
        this.screen = GAME_SCREENS.SHOP;
        soundFX.playMenuSelect();
        return;
      }
      if (this.modeSelect.selectedMode === 'coop_campaign') {
        this.onlineLobby.reset(true);
        this.onlineLobby.matchMode = 'coop_campaign';
        this.isCoopCampaign = true;
        this.screen = GAME_SCREENS.ONLINE_LOBBY;
        return;
      }
      if (this.modeSelect.selectedMode === 'online') {
        this.onlineLobby.reset(true);
        this.onlineLobby.matchMode = 'versus';
        this.isCoopCampaign = false;
        this.screen = GAME_SCREENS.ONLINE_LOBBY;
        return;
      }
      this.charSelect.setMode(this.modeSelect.selectedMode, this.modeSelect.currentDifficulty);
      this.charSelect.refreshPreviews();
      this.screen = GAME_SCREENS.CHAR_SELECT;
      return;
    }

    if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
      const res = this.elden.executeGraceSelection();
      if (res && res.action === 'proceed') {
        this.startNextCampaignStage();
      }
      return;
    }

    if (this.screen === GAME_SCREENS.SHOP) {
      this.shopScreen.handleInput({ confirm: true });
      return;
    }

    if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      this.onlineLobby.handleInput({ confirm: true });
      return;
    }

    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      const isP1 = !this.isOnline || this.netplay.isHost;
      if (this.charSelect.isCurrentSelectionLocked(isP1)) {
        try { soundFX.playBlock(); } catch (e) {}
        this.charSelect.codeFeedback = '🔒 M1GHTY RESTRICTED TO ADMINS! LOG IN VIA ADMIN PORTAL [A]';
        this.charSelect.codeFeedbackColor = '#fbbf24';
        this.adminModal.open();
        return;
      }
      if (this.isOnline) {
        if (this.netplay.isHost) {
          if (this.onlineLobby.matchMode === 'coop_campaign') {
            this.netplay.send({
              type: 'CHAR_SYNC',
              p1Index: this.charSelect.p1Index,
              stageIndex: this.charSelect.stageIndex,
              matchMode: this.onlineLobby.matchMode,
              startMatch: true
            });
            this.startMatch();
          } else {
            // Versus: host picks the arena on the Stage Select screen
            this.goToStageSelect();
            this.netplay.send({ type: 'STAGE_SCREEN', p1Index: this.charSelect.p1Index, p2Index: this.charSelect.p2Index, matchMode: this.onlineLobby.matchMode, index: this.stageSelect.index });
          }
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
      if (['cpu', '2p', '2v2', 'training'].includes(this.charSelect.gameMode)) {
        this.goToStageSelect();
        return;
      }
      this.startMatch();
      return;
    }

    if (this.screen === GAME_SCREENS.STAGE_SELECT) {
      this.confirmStage();
      return;
    }

    if (this.screen === GAME_SCREENS.VERSUS) {
      this.versus.skip();
      return;
    }

    if (this.screen === GAME_SCREENS.CAMPAIGN_DIALOGUE) {
      if (this.campaignDialogue && this.campaignDialogue.active) {
        this.campaignDialogue.advanceOrComplete();
      }
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
        soundFX.stopMusic();
        this.startMatch(true);
      } else if (this.victoryMenuIndex === 1) {
        // Character Select
        soundFX.stopMusic();
        soundFX.playMenuSelect();
        this.bossIndex = 0;
        this.screen = GAME_SCREENS.CHAR_SELECT;
      } else {
        // Mode Select / Main Menu
        soundFX.stopMusic();
        soundFX.playMenuSelect();
        this.bossIndex = 0;
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
    }
  }

  handleBackPress() {
    if (this.settingsManager && this.settingsManager.isOpen) {
      this.settingsManager.close();
      return;
    }
    if (this.screen === GAME_SCREENS.CAMPAIGN_DIALOGUE) {
      if (this.campaignDialogue && this.campaignDialogue.active) {
        this.campaignDialogue.skip();
      }
      return;
    }
    if (this.screen === GAME_SCREENS.CHALLENGES) {
      soundFX.playWhoosh('light');
      this.screen = GAME_SCREENS.MODE_SELECT;
      return;
    }
    if (this.screen === GAME_SCREENS.ENDING) {
      this.ending.advance();
      return;
    }
    if (this.screen === GAME_SCREENS.SHOP) {
      soundFX.playWhoosh('light');
      this.screen = GAME_SCREENS.MODE_SELECT;
      this.charSelect.refreshPreviews();
      return;
    }
    if (this.screen === GAME_SCREENS.MODE_SELECT) {
      soundFX.playWhoosh('light');
      this.screen = GAME_SCREENS.TITLE;
    } else if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      if (this.onlineLobby.subState === 'MENU') {
        soundFX.playWhoosh('light');
        this.screen = GAME_SCREENS.MODE_SELECT;
      } else {
        this.onlineLobby.handleInput({ back: true });
      }
    } else if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      soundFX.playWhoosh('light');
      if (this.isOnline) {
        this.netplay.disconnect();
        this.isOnline = false;
        this.screen = GAME_SCREENS.ONLINE_LOBBY;
      } else {
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
    } else if (this.screen === GAME_SCREENS.STAGE_SELECT) {
      if (this.isOnline && !this.netplay.isHost) return;
      soundFX.playWhoosh('light');
      this.screen = GAME_SCREENS.CHAR_SELECT;
      if (this.isOnline) this.netplay.send({ type: 'STAGE_BACK' });
    } else if (this.screen === GAME_SCREENS.VICTORY) {
      soundFX.playWhoosh('light');
      if (this.isOnline) {
        this.voteRematch('no');
      } else {
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
    } else if (this.screen === GAME_SCREENS.FIGHT || this.screen === GAME_SCREENS.ROUND_OVER) {
      this.settingsManager.toggle();
    }
  }

  initVictoryScreen() {
    if (this.finish) this.finish.reset();
    soundFX.stopMusic();
    try { soundFX.startMusic('victory'); } catch (e) {}
    this.screen = GAME_SCREENS.VICTORY;
    this.victoryAnim = 0;
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
    // Top-Left Back Button
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      if (this.isOnline) {
        this.voteRematch('no');
      } else {
        soundFX.stopMusic();
        soundFX.playWhoosh('light');
        this.bossIndex = 0;
        this.screen = GAME_SCREENS.MODE_SELECT;
      }
      return true;
    }
    const rx = 330;
    if (this.isOnline) {
      if (this.myRematchVote === null && y >= 214 && y <= 244) {
        if (x >= rx && x <= rx + 135) { this.onlineRematchOption = 0; this.voteRematch('yes'); return true; }
        if (x >= rx + 145 && x <= rx + 280) { this.onlineRematchOption = 1; this.voteRematch('no'); return true; }
      }
    } else if (x >= rx && x <= rx + 268) {
      for (let i = 0; i < 3; i++) {
        const by = 206 + i * 30;
        if (y >= by && y <= by + 24) {
          this.victoryMenuIndex = i;
          this.handleConfirmPress();
          return true;
        }
      }
    }
    return false;
  }

  leaveGame(target = 'MODE_SELECT') {
    // 1. Close settings modal if open
    if (this.settingsManager) {
      this.settingsManager.close();
    }

    // 2. Stop battle music & play retro menu chime
    try {
      soundFX.stopMusic();
      soundFX.playMenuSelect();
    } catch (e) {}

    // 3. Clean up online match & disconnect P2P session
    if (this.isOnline) {
      try {
        if (this.netplay) {
          this.netplay.send({ type: 'FORFEIT' });
          this.netplay.disconnect();
        }
      } catch (e) {}
      this.isOnline = false;
      if (this.onlineLobby) {
        this.onlineLobby.reset();
      }
    }

    // 4. Reset match entities and campaign/mode trackers
    this.f1 = null;
    this.f2 = null;
    this.f3 = null;
    this.f4 = null;
    this.allFighters = [];
    this.projectiles = [];
    this.pickups = [];
    this.isCampaign = false;
    this.isCoopCampaign = false;
    this.is2v2 = false;
    this.isTraining = false;
    this.bossIndex = 0;
    this.round = 1;
    this.slowMotion = false;
    this.winner = null;

    // 5. Navigate to destination screen
    if (target === 'CHAR_SELECT') {
      this.screen = GAME_SCREENS.CHAR_SELECT;
    } else {
      this.screen = GAME_SCREENS.MODE_SELECT;
    }
  }

  startMatch(isRematch = false) {
    soundFX.stopMusic();
    if (this.charSelect.gameMode !== 'training') this.isTutorial = false;
    if (this.combat) this.combat.resetMatchStats();
    const p1Id = this.charSelect.characters[this.charSelect.p1Index].id;
    const stageId = this.charSelect.stages[this.charSelect.stageIndex].id;
    const mode = this.charSelect.gameMode;

    this.stage = new Stage(stageId);
    this.round = 1;
    this.projectiles.forEach(p => { if (p && p.destroy) p.destroy(); });
    this.projectiles = [];
    this.spawnDefaultPickups();

    this.isCoopCampaign = (mode === 'coop_campaign') || (this.isOnline && this.onlineLobby?.matchMode === 'coop_campaign');
    this.isCampaign = (mode === 'campaign') || this.isCoopCampaign;
    this.is2v2 = (mode === '2v2');
    this.isTraining = (mode === 'training');
    this.isOnline = (mode === 'online') || this.isCoopCampaign || (this.netplay && this.netplay.isConnected);

    if (this.isCampaign) {
      // If rematching after defeat, keep current boss stage; otherwise reset to Stage 1
      if (!isRematch || this.campaignStageWon) {
        this.bossIndex = 0;
      }
      this.setupCampaignStage(p1Id, true);
    } else if (this.is2v2) {
      // 2V2 Team Brawl: Team 1 (P1 + CPU Ally) vs Team 2 (CPU Enemy 1 + CPU Enemy 2)
      const p1AllyId = p1Id === 'kazuki' ? 'raven' : (p1Id === 'raven' ? 'kagura' : 'kazuki');
      const enemy1Id = this.charSelect.characters[this.charSelect.p2Index].id;
      const enemy2Id = enemy1Id === 'kagura' ? 'raven' : 'kagura';

      this.f1 = this.createFighter(p1Id, 300, true, 1, false);
      this.f3 = this.createFighter(p1AllyId, 220, true, 3, true); // Team 1 Ally
      this.f2 = this.createFighter(enemy1Id, 580, false, 2, true);
      this.f4 = this.createFighter(enemy2Id, 660, false, 4, true);

      this.ai.setDifficulty('normal');
      this.ai2.setDifficulty('normal');
      this.ai3.setDifficulty('normal');

      this.allFighters = [this.f1, this.f2, this.f3, this.f4];
    } else {
      // Standard 1v1 (CPU, 2P, Online, Training)
      const p2Id = this.charSelect.characters[this.charSelect.p2Index].id;
      const isCpu = !this.isOnline && (mode !== '2p');

      this.f1 = this.createFighter(p1Id, 330, true, 1, false);
      this.f2 = this.createFighter(p2Id, 550, false, 2, isCpu);
      this.f3 = null;
      this.f4 = null;
      this.allFighters = [this.f1, this.f2];

      if (this.isTraining) {
        this.ai.setDifficulty('normal'); // used when the dummy is set to "CPU fights back"
      } else if (!this.isOnline) {
        this.ai.setDifficulty(this.charSelect.cpuDifficulty || 'normal');
      }
    }

    this.hud.reset(this.round);
    this.hud.p1RedHealth = this.f1 ? this.f1.health : 1000;
    this.hud.p2RedHealth = this.f2 ? this.f2.health : 1000;
    this.beginVersus();
  }

  /** Shows the MK-style VS splash, then hands over to the fight. */
  beginVersus() {
    soundFX.stopMusic();
    this.finish.reset();
    const info = STAGE_CATALOG.find(s => s.id === (this.stage && this.stage.stageId)) || {};
    let topLabel = 'FIGHT';
    if (this.isCampaign) topLabel = 'STAGE ' + ((this.bossIndex || 0) + 1);
    else if (this.isCoopCampaign) topLabel = '2P RAID';
    else if (this.isTraining) topLabel = 'TRAINING';
    this.versus.start({
      f1: this.f1,
      f2: this.f2,
      p1Label: 'P1',
      p2Label: this.isOnline ? 'P2' : (this.isCampaign || this.isTraining ? 'CPU' : (this.charSelect.gameMode === '2p' ? 'P2' : 'CPU')),
      stageName: info.name || '',
      stageLocation: info.location || '',
      topLabel,
      duration: this.isOnline ? 100 : 150
    });
    this.screen = GAME_SCREENS.VERSUS;
  }

  triggerCameraZoom(level = 1.2, duration = 40) {
    this.targetCameraZoom = level;
    this.zoomTimer = duration;
  }

  finishVersus() {
    if (this.isCampaign) {
      const bossKey = this.bossQueue[this.bossIndex] || 'riot_cop';
      this.screen = GAME_SCREENS.CAMPAIGN_DIALOGUE;
      this.campaignDialogue.start(bossKey, this.f1, this.f2, () => {
        this.startFight();
      });
    } else {
      this.startFight();
    }
  }

  startFight() {
    this.screen = GAME_SCREENS.FIGHT;
    if (this.isTraining && this.training) this.training.startSession({ tutorial: !!this.isTutorial });
    this.combat.resetRound();
    this.cameraZoom = 1.0;
    this.targetCameraZoom = 1.0;
    this.updateCamera(true);
    soundFX.startMusic(this.isCampaign ? 'boss' : 'fight');
    soundFX.playAnnouncer('ROUND1');
    try { this.announcer.round1(); } catch (e) {}
  }

  startNextCampaignStage() {
    this.bossIndex++;
    if (this.bossIndex < this.bossQueue.length) {
      this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
      this.f1.stamina = this.f1.maxStamina;
      if (this.f3) {
        this.f3.health = Math.min(this.f3.maxHealth, this.f3.health + 500);
        this.f3.stamina = this.f3.maxStamina;
      }
      this.setupCampaignStage(this.f1.id, false);
      this.slowMotion = false;
      this.beginVersus();
    } else {
      EconomyManager.addCoins(1000);
      this.initVictoryScreen();
      this.winner = this.f1;
      soundFX.playAnnouncer('YOU_WIN');
    }
  }

  goToStageSelect() {
    const gm = this.charSelect.gameMode;
    const p2Name = gm === '2p' ? 'PLAYER 2' : (gm === 'training' ? 'DUMMY' : (this.isOnline ? 'CHALLENGER' : 'CPU'));
    const names = this.charSelect.characters || [];
    const nm = (i) => (names[i] && names[i].name) ? names[i].name : '';
    this.stageSelect.setContext({ mode: gm, p1Name: nm(this.charSelect.p1Index), p2Name: (gm === '2p' || this.isOnline) ? (nm(this.charSelect.p2Index) || p2Name) : p2Name, canChoose: !this.isOnline || this.netplay.isHost });
    this.stageSelect.setIndex(this.charSelect.stageIndex || 0);
    this.screen = GAME_SCREENS.STAGE_SELECT;
    soundFX.playMenuSelect();
  }

  confirmStage() {
    if (this.isOnline && !this.netplay.isHost) return; // only the host picks the arena
    this.charSelect.stageIndex = this.stageSelect.resolveSelection();
    soundFX.playGong();
    if (this.isOnline) {
      this.netplay.send({
        type: 'CHAR_SYNC',
        p1Index: this.charSelect.p1Index,
        stageIndex: this.charSelect.stageIndex,
        matchMode: this.onlineLobby.matchMode,
        startMatch: true
      });
    }
    this.startMatch();
  }

  setupCampaignStage(p1Id, isFreshStart = false) {
    const currentBossId = this.bossQueue[this.bossIndex];
    const stageNum = this.bossIndex + 1;
    const isCoop = this.isCoopCampaign;
    this.projectiles.forEach(p => { if (p && p.destroy) p.destroy(); });
    this.projectiles = [];
    this.spawnDefaultPickups();

    // Thematic stage backgrounds for each boss
    const stageThemes = ['neo_tokyo', 'suzaku', 'thunder_dojo', 'suzaku', 'neo_tokyo', 'thunder_dojo', 'suzaku', 'dragon_shrine'];
    const stageId = stageThemes[this.bossIndex] || 'suzaku';
    this.stage = new Stage(stageId);

    // Scale AI difficulty progressively per stage (1 to 8)
    this.ai.setDifficulty('campaign', stageNum);
    this.ai3.setDifficulty('campaign', stageNum);

    const p1StartX = currentBossId === 'bouncer_twins' ? (isCoop ? 230 : 280) : (isCoop ? 290 : 320);
    const p3StartX = isCoop ? (p1StartX - 90) : 100;

    // Always create a fresh P1 instance if starting anew, on stage 1, or after defeat
    if (!this.f1 || isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f1.health <= 0) {
      this.f1 = this.createFighter(p1Id, p1StartX, true, 1, false);
    } else {
      this.f1.x = p1StartX;
      this.f1.y = 300;
      this.f1.vx = 0;
      this.f1.vy = 0;
      this.f1.isGrounded = true;
      this.f1.isDead = false;
      this.f1.changeState(FIGHTER_STATE.IDLE);
    }

    if (isCoop) {
      const p2AllyId = this.charSelect.characters[this.charSelect.p2Index]?.id || 'raven';
      if (!this.f3 || isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f3.health <= 0) {
        this.f3 = this.createFighter(p2AllyId, p3StartX, true, 3, false);
      } else {
        this.f3.x = p3StartX;
        this.f3.y = 300;
        this.f3.vx = 0;
        this.f3.vy = 0;
        this.f3.isGrounded = true;
        this.f3.isDead = false;
        this.f3.changeState(FIGHTER_STATE.IDLE);
      }
    } else {
      this.f3 = null;
    }

    const hpScale = isCoop ? 1.25 : 1.0;

    if (currentBossId === 'bouncer_twins') {
      // Stage 3: Bouncer Twins Encounter! Boris & Viktor
      this.f2 = this.createFighter('boris', 580, false, 2, true);
      this.f4 = this.createFighter('viktor', 670, false, 4, true);
      this.allFighters = isCoop ? [this.f1, this.f3, this.f2, this.f4] : [this.f1, this.f2, this.f4];
    } else {
      this.f2 = this.createFighter(currentBossId, 560, false, 2, true);
      this.f4 = null;

      // Progressive Boss Stat Scaling for each level
      if (currentBossId === 'riot_cop') {
        this.f2.maxHealth = Math.round(850 * hpScale);
        this.f2.health = this.f2.maxHealth;
      } else if (currentBossId === 'promoter') {
        this.f2.maxHealth = Math.round(950 * hpScale);
        this.f2.health = this.f2.maxHealth;
        this.f2.walkSpeed = 4.4;
      } else if (currentBossId === 'matriarch') {
        this.f2.maxHealth = Math.round(1050 * hpScale);
        this.f2.health = this.f2.maxHealth;
      } else if (currentBossId === 'street_lord') {
        this.f2.maxHealth = Math.round(1250 * hpScale);
        this.f2.health = this.f2.maxHealth;
      } else if (currentBossId === 'urban_legend') {
        this.f2.maxHealth = Math.round(1100 * hpScale);
        this.f2.health = this.f2.maxHealth;
        this.f2.walkSpeed = 4.4;
      } else if (currentBossId === 'champion') {
        this.f2.maxHealth = Math.round(1000 * hpScale);
        this.f2.health = this.f2.maxHealth;
      } else if (currentBossId === 'endless_dragon') {
        this.f2.maxHealth = Math.round(2500 * hpScale);
        this.f2.health = this.f2.maxHealth;
      }

      this.allFighters = isCoop ? [this.f1, this.f3, this.f2] : [this.f1, this.f2];
    }

    // Restore P1 physical limbs, health, and state for the stage
    if (this.f1) {
      if (isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f1.health <= 0) {
        this.f1.health = this.f1.maxHealth;
      } else {
        // Guarantee at least 500 HP when advancing in campaign
        this.f1.health = Math.max(500, Math.min(this.f1.maxHealth, this.f1.health));
      }
      this.f1.stamina = this.f1.maxStamina;
      this.f1.isDead = false;
      this.f1.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
      this.f1.statusEffects = [];
      this.f1.heldPickup = null;
      this.f1.submissionStruggle = 0;
      this.f1.isRageMode = false;
      this.f1.isInvincible = false;
      this.f1.hitStun = 0;
      this.f1.blockStun = 0;
      this.f1.projectileCooldown = 0;
      this.f1.activeProjectileCount = 0;
    }

    // Restore P2 Ally physical limbs, health, and state in Co-op Campaign
    if (this.f3) {
      if (isFreshStart || this.bossIndex === 0 || !this.campaignStageWon || this.f3.health <= 0) {
        this.f3.health = this.f3.maxHealth;
      } else {
        this.f3.health = Math.max(500, Math.min(this.f3.maxHealth, this.f3.health));
      }
      this.f3.stamina = this.f3.maxStamina;
      this.f3.isDead = false;
      this.f3.limbs = { leadArm: 100, rearArm: 100, leadLeg: 100, rearLeg: 100, torso: 100, head: 100 };
      this.f3.statusEffects = [];
      this.f3.heldPickup = null;
      this.f3.submissionStruggle = 0;
      this.f3.isRageMode = false;
      this.f3.isInvincible = false;
      this.f3.hitStun = 0;
      this.f3.blockStun = 0;
      this.f3.projectileCooldown = 0;
      this.f3.activeProjectileCount = 0;
    }

    this.projectiles = [];
    input.consumeBuffer(1);
    input.consumeBuffer(2);
    input.consumeBuffer(3);
    this.cameraX = 0;

    // Reset HUD timer to full 99 seconds for the stage and calibrate red health bars
    this.hud.reset(1);
    this.hud.p1RedHealth = this.f1 ? this.f1.health : 1000;
    this.hud.p2RedHealth = this.f2 ? this.f2.health : 1000;

    const raidTag = isCoop ? ' [2P RAID]' : '';
    const bossName = currentBossId === 'bouncer_twins' ? (isCoop ? 'THE BOUNCER TWINS (2v2)' : 'THE BOUNCER TWINS (2v1)') : this.f2.name;
    this.hud.setAnnouncement(`STAGE ${stageNum}: ${bossName}${raidTag}`, 120);
  }

  spawnDefaultPickups() {
    this.pickups = [
      new AlleyPickup('bottle', 270),
      new AlleyPickup('brick', 670),
      new AlleyPickup('lumber', 470)
    ];
  }

  createFighter(id, x, facingRight, playerNum, isCpu, customSkinId = null) {
    const skinId = customSkinId || (playerNum === 1 ? EconomyManager.getEquippedSkin(id) : null);
    const opts = { x, facingRight, playerNum, isCpu, skinId };
    let fighter;

    if (id === 'kazuki') fighter = new Kazuki(opts);
    else if (id === 'raven') fighter = new Raven(opts);
    else if (id === 'kagura') fighter = new Kagura(opts);
    else if (id === 'fang') fighter = new Fang(opts);
    else if (id === 'zephyr') fighter = new Zephyr(opts);
    else if (id === 'colossus') fighter = new Colossus(opts);
    else if (id === 'mighty') fighter = new Mighty(opts);
    else if (id === 'riot_cop') fighter = new RiotCop(opts);
    else if (id === 'promoter') fighter = new Promoter(opts);
    else if (id === 'boris') fighter = new BorisBouncer(opts);
    else if (id === 'viktor') fighter = new ViktorBouncer(opts);
    else if (id === 'matriarch') fighter = new Matriarch(opts);
    else if (id === 'street_lord') fighter = new StreetLord(opts);
    else if (id === 'urban_legend') fighter = new UrbanLegend(opts);
    else if (id === 'champion') fighter = new Champion(opts);
    else if (id === 'endless_dragon') fighter = new EndlessDragon(opts);
    else if (ROSTER_CLASSES[id]) fighter = new ROSTER_CLASSES[id](opts);
    else fighter = new Kazuki(opts);

    // Team 1: playerNum 1 & 3. Team 2: playerNum 2 & 4
    fighter.team = (playerNum === 1 || playerNum === 3) ? 1 : 2;

    // Wire projectile creation callback
    fighter.spawnProjectile = (proj) => {
      this.projectiles.push(proj);
    };
    // Scripted hits (cinematic ultimates) go through the same combat rules as normal hits
    fighter.combatHit = (target, data, pos) => this.combat.applyHit(fighter, target, data, pos || { x: target.x + 40, y: target.y - 48 });

    // Universal mechanics (throws, breaker, dirty cooldown, intro lock) run before every
    // character's own input code, whichever path (local, CPU, online) drives it.
    const ownHandleInput = fighter.handleInput.bind(fighter);
    fighter.handleInput = (state, inputManager, opponent) => {
      const res = this.combat.preInput(fighter, state || {}, inputManager, opponent);
      if (res.consumed) return;
      ownHandleInput(res.input, inputManager, opponent);
    };
    this.combat.resetFighter(fighter);

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
      f.projectileCooldown = 0;
      f.activeProjectileCount = 0;
      f.changeState(FIGHTER_STATE.IDLE);
    });

    this.projectiles = [];
    input.consumeBuffer(1);
    input.consumeBuffer(2);

    if (this.is2v2) {
      this.f1.x = 300;
      this.f3.x = 220;
      this.f2.x = 580;
      this.f4.x = 660;
    } else if (this.isCoopCampaign) {
      this.f1.x = 290;
      if (this.f3) this.f3.x = 200;
      this.f2.x = 560;
      if (this.f4) this.f4.x = 650;
    } else if (this.isCampaign && this.bossQueue[this.bossIndex] === 'bouncer_twins') {
      this.f1.x = 280;
      this.f2.x = 580;
      if (this.f4) this.f4.x = 670;
    } else {
      this.f1.x = 330;
      this.f2.x = 550;
    }
    this.allFighters.forEach(f => { f.facingRight = f.team === 1; });
    this.combat.resetRound();
    this.updateCamera(true);

    this.projectiles = [];
    this.spawnDefaultPickups();
    this.hud.reset(this.round);
    this.slowMotion = false;
    this.screen = GAME_SCREENS.FIGHT;
    soundFX.playAnnouncer(this.round === 2 ? 'ROUND2' : 'FINALROUND');
  }

  // Daily challenge progress (never counts in Training / Tutorial)
  recordChallenge(event, info = {}) {
    if (this.isTraining || !this.challenges) return;
    try { this.challenges.record(event, info); } catch (e) {}
  }

  // Guided tutorial: Kazuki vs a training dummy in the Thunder Dojo
  startTutorial() {
    const cs = this.charSelect;
    cs.setMode('training', 'normal');
    cs.p1Index = Math.max(0, cs.characters.findIndex(c => c.id === 'kazuki'));
    cs.p2Index = Math.max(0, cs.characters.findIndex(c => c.id === 'raven'));
    const dojo = (cs.stages || []).findIndex(st => st.id === 'thunder_dojo');
    cs.stageIndex = dojo >= 0 ? dojo : 0;
    this.isTutorial = true;
    this.startMatch();
  }

  getAIFor(fighter) {
    if (!fighter) return null;
    if (fighter === this.f2) return this.ai;
    if (fighter === this.f3) return this.ai2;
    if (fighter === this.f4) return this.ai3;
    return null;
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

  // Menu music on front-end screens (fight/boss/victory tracks are started by their screens)
  syncMusic() {
    const menuScreens = [GAME_SCREENS.MODE_SELECT, GAME_SCREENS.CHAR_SELECT, GAME_SCREENS.STAGE_SELECT, GAME_SCREENS.SHOP,
      GAME_SCREENS.CHALLENGES, GAME_SCREENS.ONLINE_LOBBY];
    if (!menuScreens.includes(this.screen) || !soundFX.ctx) return;
    if (!soundFX.musicPlaying || soundFX.currentTrack !== 'menu') {
      try { soundFX.startMusic('menu'); } catch (e) {}
    }
  }

  update() {
    // 1. Always poll Gamepads at the start of every frame
    input.pollGamepads();
    if ((this._musicTick = (this._musicTick || 0) + 1) % 30 === 0) this.syncMusic();

    // Achievements update & notification handling
    if (this.achievements) {
      this.achievements.update();
    }

    // Camera zoom interpolation
    if (this.zoomTimer > 0) {
      this.zoomTimer--;
      if (this.zoomTimer <= 0) {
        this.targetCameraZoom = 1.0;
      }
    }
    this.cameraZoom += (this.targetCameraZoom - this.cameraZoom) * 0.12;

    // 2. Settings Modal handling
    if (this.settingsManager.isOpen) {
      if (typeof this.settingsManager.updateGamepad === 'function') {
        this.settingsManager.updateGamepad();
      }
      input.endFrame();
      return; // Paused while settings menu is open
    }

    // Check Pause / Options button on Gamepad during gameplay or anytime
    const gp1 = input.getGamepadState(0);
    const gp2 = input.getGamepadState(1);

    // Secret Gamepad Owner Developer Shortcut: LB + RB + LT + RT + Select
    const isOwnerChord = (gp) => gp && gp.sp1 && gp.sp2 && gp.sp3 && gp.dirty && gp.selectJust;
    if (isOwnerChord(gp1) || isOwnerChord(gp2)) {
      if (this.adminModal) this.adminModal.open();
      input.endFrame();
      return;
    }

    if ((gp1 && gp1.startJust) || (gp2 && gp2.startJust)) {
      this.settingsManager.toggle();
      input.endFrame();
      return;
    }

    const menuNav = input.getAnyMenuNav();

    if (this.screen === GAME_SCREENS.TITLE) {
      if (menuNav && (menuNav.confirm || menuNav.start)) {
        this.handleConfirmPress();
      }
      input.endFrame();
      return;
    }

    // 0. Online Lobby Navigation
    if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      const up = input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (menuNav && menuNav.up);
      const down = input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (menuNav && menuNav.down);
      if (up) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        this.onlineLobby.handleInput({ up: true });
      } else if (down) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        this.onlineLobby.handleInput({ down: true });
      }
      if (menuNav && menuNav.confirm) {
        this.handleConfirmPress();
      } else if (menuNav && menuNav.back) {
        this.handleBackPress();
      }
      input.endFrame();
      return;
    }

    // 1. Mode Select Navigation (Discrete single-tap checks)
    if (this.screen === GAME_SCREENS.MODE_SELECT) {
      const up = input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (menuNav && menuNav.up);
      const down = input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (menuNav && menuNav.down);
      const left = input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || (menuNav && menuNav.left);
      const right = input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || (menuNav && menuNav.right);

      if (up) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        this.modeSelect.handleInput({ up: true });
      } else if (down) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        this.modeSelect.handleInput({ down: true });
      }

      if (left) {
        input.consumeKey('KeyA');
        input.consumeKey('ArrowLeft');
        this.modeSelect.handleInput({ left: true });
      } else if (right) {
        input.consumeKey('KeyD');
        input.consumeKey('ArrowRight');
        this.modeSelect.handleInput({ right: true });
      }

      if (menuNav && menuNav.confirm) {
        this.handleConfirmPress();
      } else if (menuNav && menuNav.back) {
        this.handleBackPress();
      }
      input.endFrame();
      return;
    }

    // Shop Screen Navigation
    if (this.screen === GAME_SCREENS.SHOP) {
      const up = input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (menuNav && menuNav.up);
      const down = input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (menuNav && menuNav.down);
      const left = input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || (menuNav && menuNav.left);
      const right = input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || (menuNav && menuNav.right);

      const prevTab = input.isJustPressed('KeyQ') || (menuNav && menuNav.prevTab);
      const nextTab = input.isJustPressed('Tab') || input.isJustPressed('KeyE') || (menuNav && menuNav.nextTab);

      if (prevTab) {
        input.consumeKey('KeyQ');
        this.shopScreen.handleInput({ prevTab: true });
      } else if (nextTab) {
        input.consumeKey('Tab');
        input.consumeKey('KeyE');
        this.shopScreen.handleInput({ nextTab: true });
      } else if (up) {
        input.consumeKey('KeyW'); input.consumeKey('ArrowUp');
        this.shopScreen.handleInput({ up: true });
      } else if (down) {
        input.consumeKey('KeyS'); input.consumeKey('ArrowDown');
        this.shopScreen.handleInput({ down: true });
      } else if (left) {
        input.consumeKey('KeyA'); input.consumeKey('ArrowLeft');
        this.shopScreen.handleInput({ left: true });
      } else if (right) {
        input.consumeKey('KeyD'); input.consumeKey('ArrowRight');
        this.shopScreen.handleInput({ right: true });
      }

      if (menuNav && (menuNav.confirm || menuNav.extra)) {
        this.handleConfirmPress();
      } else if (menuNav && menuNav.back) {
        this.handleBackPress();
      }
      input.endFrame();
      return;
    }

    if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
      const up = input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (menuNav && menuNav.up);
      const down = input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (menuNav && menuNav.down);
      if (up) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        this.elden.handleGraceInput({ up: true });
      } else if (down) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        this.elden.handleGraceInput({ down: true });
      }
      if (input.isJustPressed('Space') || input.isJustPressed('Enter') || (menuNav && menuNav.confirm)) {
        const res = this.elden.executeGraceSelection();
        if (res && res.action === 'proceed') {
          this.startNextCampaignStage();
        }
      }
      input.endFrame();
      return;
    }

    // 2. Character Select Navigation (Discrete single-tap checks)
    if (this.screen === GAME_SCREENS.CHAR_SELECT) {
      const isHostOrLocal = !this.isOnline || this.netplay.isHost;
      const p1Nav = input.getMenuNav(0) || menuNav;
      const p2Nav = input.getMenuNav(1);

      const p1Left = input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || (p1Nav && p1Nav.left);
      const p1Right = input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || (p1Nav && p1Nav.right);
      const p1Up = input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (p1Nav && p1Nav.up);
      const p1Down = input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (p1Nav && p1Nav.down);

      if (p1Left) {
        input.consumeKey('KeyA');
        input.consumeKey('ArrowLeft');
        this.charSelect.handleInput({ left: true }, isHostOrLocal);
        if (this.isOnline) this.syncCharSelect();
      } else if (p1Right) {
        input.consumeKey('KeyD');
        input.consumeKey('ArrowRight');
        this.charSelect.handleInput({ right: true }, isHostOrLocal);
        if (this.isOnline) this.syncCharSelect();
      }

      if (p1Up) {
        input.consumeKey('KeyW');
        input.consumeKey('ArrowUp');
        if (isHostOrLocal) {
          this.charSelect.handleInput({ up: true }, true);
          if (this.isOnline) this.syncCharSelect();
        }
      } else if (p1Down) {
        input.consumeKey('KeyS');
        input.consumeKey('ArrowDown');
        if (isHostOrLocal) {
          this.charSelect.handleInput({ down: true }, true);
          if (this.isOnline) this.syncCharSelect();
        }
      }

      // Player 2 selection in 2P mode (Gamepad 1 or Numpad keys)
      if (this.charSelect.gameMode === '2p') {
        const p2Left = input.isJustPressed('Numpad4') || (p2Nav && p2Nav.left);
        const p2Right = input.isJustPressed('Numpad6') || (p2Nav && p2Nav.right);
        if (input.isJustPressed('Numpad8') || input.isJustPressed('Numpad5')) {
          const up8 = input.isJustPressed('Numpad8');
          input.consumeKey('Numpad8'); input.consumeKey('Numpad5');
          this.charSelect.handleInput(up8 ? { up: true } : { down: true }, false);
        }
        if (p2Left) {
          input.consumeKey('Numpad4');
          this.charSelect.handleInput({ left: true }, false);
        } else if (p2Right) {
          input.consumeKey('Numpad6');
          this.charSelect.handleInput({ right: true }, false);
        }
      }

      // Open secret code modal on controller X button
      if (p1Nav && p1Nav.extra) {
        if (!this.charSelect.showCodeModal) {
          this.charSelect.openCodeModal();
        }
      }

      if (p1Nav && p1Nav.confirm) {
        this.handleConfirmPress();
      } else if (p1Nav && p1Nav.back) {
        this.handleBackPress();
      }
      input.endFrame();
      return;
    }

    // 2b. Stage Select (MK-style arena picker)
    if (this.screen === GAME_SCREENS.STAGE_SELECT) {
      const nav = menuNav || {};
      const left = input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || input.isJustPressed('Numpad4') || nav.left;
      const right = input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || input.isJustPressed('Numpad6') || nav.right;
      const up = input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || nav.up;
      const down = input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || nav.down;
      if (left || right || up || down) {
        ['KeyA', 'ArrowLeft', 'Numpad4', 'KeyD', 'ArrowRight', 'Numpad6', 'KeyW', 'ArrowUp', 'KeyS', 'ArrowDown'].forEach(k => input.consumeKey(k));
        if (!this.isOnline || this.netplay.isHost) {
          this.stageSelect.handleInput({ left, right, up, down });
          soundFX.playWhoosh('light');
          if (this.isOnline) this.netplay.send({ type: 'STAGE_NAV', index: this.stageSelect.index });
        }
      }
      if (nav.confirm) this.handleConfirmPress();
      else if (nav.back) this.handleBackPress();
      this.stageSelect.update();
      input.endFrame();
      return;
    }

    // 2c. VS intro splash
    if (this.screen === GAME_SCREENS.VERSUS) {
      if (menuNav && menuNav.confirm) this.versus.skip();
      if (this.stage) this.stage.update();
      if (this.versus.update()) this.finishVersus();
      input.endFrame();
      return;
    }

    // 2d. Campaign Story Dialogue Banter
    if (this.screen === GAME_SCREENS.CAMPAIGN_DIALOGUE) {
      const p1Actions = input.getState(1);
      const gpState0 = input.getGamepadState(0);
      const gpState1 = input.getGamepadState(1);

      // Skip Dialogue: B (Button 1 / Circle), Select / Back, HK, Escape, Backspace, or B key
      const gpSkip = (gpState0 && (gpState0.bJust || gpState0.selectJust || gpState0.hkJust)) ||
                     (gpState1 && (gpState1.bJust || gpState1.selectJust || gpState1.hkJust));

      const isBack = (menuNav && menuNav.back) ||
        input.isJustPressed('Escape') ||
        input.isJustPressed('Backspace') ||
        input.isJustPressed('KeyB') ||
        gpSkip;

      // Advance typewriter / Next line: A (Button 0 / Cross), X (Button 2 / Square / LP), Start, Enter, Space, E, LP, LK
      const gpAdvance = (gpState0 && (gpState0.aJust || gpState0.xJust || gpState0.lpJust || gpState0.lkJust || gpState0.startJust)) ||
                        (gpState1 && (gpState1.aJust || gpState1.xJust || gpState1.lpJust || gpState1.lkJust || gpState1.startJust));

      const isAdvance = (menuNav && (menuNav.confirm || menuNav.start || menuNav.extra)) ||
        input.isJustPressed('Enter') ||
        input.isJustPressed('Space') ||
        input.isJustPressed('KeyE') ||
        input.isJustPressed('NumpadEnter') ||
        input.isJustPressed('KeyU') ||
        input.isJustPressed('KeyJ') ||
        !!p1Actions?.lpJust || !!p1Actions?.hpJust || !!p1Actions?.lkJust || !!p1Actions?.hkJust ||
        gpAdvance;

      if (isBack) {
        input.consumeKey('Escape');
        input.consumeKey('Backspace');
        input.consumeKey('KeyB');
        this.campaignDialogue.skip();
      } else if (isAdvance) {
        input.consumeKey('Enter');
        input.consumeKey('NumpadEnter');
        input.consumeKey('Space');
        input.consumeKey('KeyE');
        input.consumeKey('KeyU');
        input.consumeKey('KeyJ');
        this.campaignDialogue.advanceOrComplete();
      } else {
        this.campaignDialogue.update();
      }

      if (this.stage) this.stage.update();
      input.endFrame();
      return;
    }

    if (this.screen === GAME_SCREENS.VICTORY) {
      this.updateVictoryScreen();
      input.endFrame();
      return;
    }

    if (this.screen === GAME_SCREENS.CHALLENGES) {
      if (menuNav && menuNav.back) this.handleBackPress();
      input.endFrame();
      return;
    }

    if (this.screen === GAME_SCREENS.ENDING) {
      if (menuNav && (menuNav.confirm || menuNav.start)) this.ending.advance();
      input.endFrame();
      return;
    }

    // Game Speed scaling ("Turn down the game" - 50% slow-mo, 75% relaxed)
    this.gameSpeedTick++;
    const speed = this.settingsManager.settings.gameSpeed;
    if (speed === 50 && this.gameSpeedTick % 2 !== 0) return;
    if (speed === 75 && this.gameSpeedTick % 4 === 0) return;

    // Training lab: settings menu pauses the fight; resources follow the lab settings
    if (this.isTraining && this.training) {
      if (this.training.isPaused()) {
        const nav = input.getAnyMenuNav() || {};
        const kb = {
          up: input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || nav.up,
          down: input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || nav.down,
          left: input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || nav.left,
          right: input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || nav.right,
          confirm: input.isJustPressed('Enter') || input.isJustPressed('Space') || nav.confirm,
          back: input.isJustPressed('Escape') || nav.back
        };
        this.training.updateMenu(kb);
        input.endFrame();
        return;
      }
      if (gp1 && gp1.selectJust) this.training.toggleMenu();
      if (this.isTutorial && this.training.tutorial) {
        const skip = input.isJustPressed('Enter') || (gp1 && gp1.selectJust);
        if (this.training.tutorial.finished) {
          if (input.isJustPressed('Enter') || input.isJustPressed('Space') || (menuNav && menuNav.confirm)) {
            input.endFrame();
            this.leaveGame('MODE_SELECT');
            return;
          }
        } else if (skip) {
          this.training.skipLesson();
        }
      }
      this.training.applyResources();
    }

    // Administrator Combat Testing Cheats (Offline / Dev mode)
    if (!this.isOnline) {
      const cheats = getAdminCheats();
      if (cheats.godMode && this.f1) {
        this.f1.health = this.f1.maxHealth;
        this.f1.stamina = this.f1.maxStamina;
      }
      if (cheats.infiniteSuper && this.f1) {
        this.f1.superMeter = this.f1.maxSuperMeter;
      }
      if (cheats.oneHitKO && this.f1 && this.f1.hasHitThisAttack) {
        if (this.f2) { this.f2.health = 0; this.f2.isDead = true; }
        if (this.f4) { this.f4.health = 0; this.f4.isDead = true; }
      }
    }

    // FIGHT & ROUND_OVER states
    // Always animate world FX (they keep moving during hit-stop, like real fighting games)
    vfx.update();
    this.hud.updateFx && this.hud.updateFx();

    // Hit-stop / super freeze: the whole fight pauses for a few frames on impact.
    // Inputs are still read so presses made during the freeze are buffered.
    if (this.combat.isFrozen()) {
      input.update(this.f1.facingRight, this.f2 ? this.f2.facingRight : false);
      this.combat.tickFreeze();
      this.updateCamera();
      input.endFrame();
      return;
    }

    if (this.slowMotion) {
      this.slowMoElapsed++;
      if (this.slowMoElapsed > 48) {
        this.slowMotion = false; // short dramatic KO slow-mo, then normal speed for the victory pose
      } else {
        this.slowMotionCounter++;
        if (this.slowMotionCounter % 3 !== 0) return; // 1/3 speed during slow-mo KO
      }
    } else {
      this.slowMoElapsed = 0;
    }

    // 1. Update Input Manager
    input.update(this.f1.facingRight, this.f2 ? this.f2.facingRight : false);

    if (this.finish && this.finish.active) {
      // Fighters are frozen for input during the FINISH HIM sequence
    } else if (this.isOnline) {
      this.updateOnlineMatch();
    } else {
      // 2. Process Player 1 Inputs
      const p1Raw = input.getState(1, this.f1.facingRight);
      const p1Input = (this.isTraining && this.training) ? this.training.playerInput(p1Raw) : p1Raw;
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
          p2Input = (this.isTraining && this.training) ? this.training.dummyInput(this.f2, targetForF2, this.ai) : this.ai.update(this.f2, targetForF2);
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
        if (this.elden) this.elden.updateStance(f);
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

    // 9b. Throws, cooldowns, ability FX
    this.combat.postUpdate();
    if (this.isTraining && this.training) this.training.update();

    // 10. Update Projectiles & Pickups
    this.updateProjectiles();
    this.updatePickups();

    // 11. Camera Midpoint Tracking
    this.updateCamera();

    // 12. Update Stage & HUD
    this.stage.update();
    const primaryEnemy = (this.f2 && !this.f2.isDead) ? this.f2 : (this.f4 || this.f2);
    this.hud.update(this.f1, primaryEnemy, this);

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
        stageIndex: this.charSelect.stageIndex,
        matchMode: this.onlineLobby.matchMode
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

    // ==========================================
    // CO-OP CAMPAIGN RAID NETPLAY STREAMING
    // ==========================================
    if (this.isCoopCampaign) {
      const targetForP1 = this.getNearestOpponent(this.f1);
      const targetForF3 = this.f3 ? this.getNearestOpponent(this.f3) : targetForP1;

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

        // Challenger remote input drives f3 (Player 2 Ally)
        if (this.f3 && !this.f3.isDead) {
          const remoteInput = this.netplay.remoteInputState || {};
          if (remoteInput.ultimateJust) input.queueAction(3, 'ULTIMATE');
          else if (remoteInput.dirtyJust) input.queueAction(3, 'DIRTY');
          else if (remoteInput.sp3Just) input.queueAction(3, 'SP3');
          else if (remoteInput.sp2Just) input.queueAction(3, 'SP2');
          else if (remoteInput.sp1Just) input.queueAction(3, 'SP1');
          else if (remoteInput.hpJust) input.queueAction(3, 'HP');
          else if (remoteInput.hkJust) input.queueAction(3, 'HK');
          else if (remoteInput.lpJust) input.queueAction(3, 'LP');
          else if (remoteInput.lkJust) input.queueAction(3, 'LK');

          this.f3.handleInput(remoteInput, input, targetForF3);

          remoteInput.lpJust = false;
          remoteInput.hpJust = false;
          remoteInput.lkJust = false;
          remoteInput.hkJust = false;
          remoteInput.sp1Just = false;
          remoteInput.sp2Just = false;
          remoteInput.sp3Just = false;
          remoteInput.dirtyJust = false;
          remoteInput.ultimateJust = false;

          if (this.f3.state === FIGHTER_STATE.SUBMISSION_LOCK) {
            if (remoteInput.lpJust || remoteInput.hpJust || remoteInput.lkJust || remoteInput.hkJust || remoteInput.dirtyJust) {
              this.f3.submissionStruggle = Math.min(100, (this.f3.submissionStruggle || 0) + 14);
              soundFX.playWhoosh('light');
            }
          }
        }

        // Host AI simulates Boss (f2) and optional second boss (f4)
        if (this.f2 && !this.f2.isDead && this.f2.isCpu) {
          const targetForF2 = this.getNearestOpponent(this.f2);
          const f2Input = this.ai.update(this.f2, targetForF2);
          this.f2.handleInput(f2Input, input, targetForF2);
        }

        if (this.f4 && !this.f4.isDead && this.f4.isCpu) {
          const targetForF4 = this.getNearestOpponent(this.f4);
          const f4Input = this.ai3.update(this.f4, targetForF4);
          this.f4.handleInput(f4Input, input, targetForF4);
        }

        // Host streams authoritative snapshot
        this.onlineSyncTick++;
        if (this.onlineSyncTick % 4 === 0) {
          this.netplay.sendSnapshot({
            isCoop: true,
            bossIndex: this.bossIndex,
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
              isDead: this.f1.isDead
            },
            f3: this.f3 ? {
              x: Math.round(this.f3.x),
              y: Math.round(this.f3.y),
              vx: this.f3.vx,
              vy: this.f3.vy,
              health: this.f3.health,
              stamina: this.f3.stamina,
              superMeter: this.f3.superMeter,
              state: this.f3.state,
              facingRight: this.f3.facingRight,
              isDead: this.f3.isDead
            } : null,
            f2: this.f2 ? {
              x: Math.round(this.f2.x),
              y: Math.round(this.f2.y),
              vx: this.f2.vx,
              vy: this.f2.vy,
              health: this.f2.health,
              stamina: this.f2.stamina,
              superMeter: this.f2.superMeter,
              state: this.f2.state,
              facingRight: this.f2.facingRight,
              isDead: this.f2.isDead,
              phase: this.f2.phase,
              isFlying: this.f2.isFlying
            } : null,
            f4: this.f4 ? {
              x: Math.round(this.f4.x),
              y: Math.round(this.f4.y),
              vx: this.f4.vx,
              vy: this.f4.vy,
              health: this.f4.health,
              stamina: this.f4.stamina,
              superMeter: this.f4.superMeter,
              state: this.f4.state,
              facingRight: this.f4.facingRight,
              isDead: this.f4.isDead
            } : null,
            round: this.round,
            timer: this.hud.timer
          });
        }
      } else {
        // Client / Challenger controls f3 via local controls
        if (this.f3 && !this.f3.isDead) {
          const localInput = input.getState(1, this.f3.facingRight);
          if (localInput.ultimateJust) input.queueAction(3, 'ULTIMATE');
          else if (localInput.dirtyJust) input.queueAction(3, 'DIRTY');
          else if (localInput.sp3Just) input.queueAction(3, 'SP3');
          else if (localInput.sp2Just) input.queueAction(3, 'SP2');
          else if (localInput.sp1Just) input.queueAction(3, 'SP1');
          else if (localInput.hpJust) input.queueAction(3, 'HP');
          else if (localInput.hkJust) input.queueAction(3, 'HK');
          else if (localInput.lpJust) input.queueAction(3, 'LP');
          else if (localInput.lkJust) input.queueAction(3, 'LK');

          this.netplay.sendInput(localInput);
          this.f3.handleInput(localInput, input, targetForF3);

          if (this.f3.state === FIGHTER_STATE.SUBMISSION_LOCK) {
            if (localInput.lpJust || localInput.hpJust || localInput.lkJust || localInput.hkJust || localInput.dirtyJust) {
              this.f3.submissionStruggle = Math.min(100, (this.f3.submissionStruggle || 0) + 14);
              soundFX.playWhoosh('light');
            }
          }
        }

        // Challenger applies Host remote inputs to f1
        const remoteInput = this.netplay.remoteInputState || {};
        if (this.f1 && !this.f1.isDead) {
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

          remoteInput.lpJust = false;
          remoteInput.hpJust = false;
          remoteInput.lkJust = false;
          remoteInput.hkJust = false;
          remoteInput.sp1Just = false;
          remoteInput.sp2Just = false;
          remoteInput.sp3Just = false;
          remoteInput.dirtyJust = false;
          remoteInput.ultimateJust = false;
        }

        // Reconcile client fighters with authoritative host snapshot
        if (this.netplay.latestSnapshot) {
          const snap = this.netplay.latestSnapshot;
          if (snap.bossIndex !== undefined && snap.bossIndex !== this.bossIndex) {
            this.bossIndex = snap.bossIndex;
            this.setupCampaignStage(this.f1 ? this.f1.id : 'kazuki', false);
          }
          if (snap.f1 && this.f1) {
            this.f1.health = snap.f1.health;
            this.f1.stamina = snap.f1.stamina;
            this.f1.superMeter = snap.f1.superMeter;
            this.f1.isDead = snap.f1.isDead;
            if (Math.abs(this.f1.x - snap.f1.x) > 40) this.f1.x = snap.f1.x;
            else this.f1.x += (snap.f1.x - this.f1.x) * 0.25;
            if (Math.abs(this.f1.y - snap.f1.y) > 40) this.f1.y = snap.f1.y;
            else this.f1.y += (snap.f1.y - this.f1.y) * 0.25;
          }
          if (snap.f3 && this.f3) {
            this.f3.health = snap.f3.health;
            this.f3.stamina = snap.f3.stamina;
            this.f3.superMeter = snap.f3.superMeter;
            this.f3.isDead = snap.f3.isDead;
            if (Math.abs(this.f3.x - snap.f3.x) > 50) this.f3.x = snap.f3.x;
            else this.f3.x += (snap.f3.x - this.f3.x) * 0.2;
            if (Math.abs(this.f3.y - snap.f3.y) > 50) this.f3.y = snap.f3.y;
            else this.f3.y += (snap.f3.y - this.f3.y) * 0.2;
          }
          if (snap.f2 && this.f2) {
            this.f2.health = snap.f2.health;
            this.f2.stamina = snap.f2.stamina;
            this.f2.superMeter = snap.f2.superMeter;
            this.f2.isDead = snap.f2.isDead;
            if (snap.f2.phase !== undefined) this.f2.phase = snap.f2.phase;
            if (snap.f2.isFlying !== undefined) this.f2.isFlying = snap.f2.isFlying;
            if (Math.abs(this.f2.x - snap.f2.x) > 50) this.f2.x = snap.f2.x;
            else this.f2.x += (snap.f2.x - this.f2.x) * 0.2;
            if (Math.abs(this.f2.y - snap.f2.y) > 50) this.f2.y = snap.f2.y;
            else this.f2.y += (snap.f2.y - this.f2.y) * 0.2;
          }
          if (snap.f4 && this.f4) {
            this.f4.health = snap.f4.health;
            this.f4.stamina = snap.f4.stamina;
            this.f4.isDead = snap.f4.isDead;
            if (Math.abs(this.f4.x - snap.f4.x) > 50) this.f4.x = snap.f4.x;
            else this.f4.x += (snap.f4.x - this.f4.x) * 0.2;
            if (Math.abs(this.f4.y - snap.f4.y) > 50) this.f4.y = snap.f4.y;
            else this.f4.y += (snap.f4.y - this.f4.y) * 0.2;
          }
          if (snap.timer !== undefined && this.hud) {
            this.hud.timer = snap.timer;
          }
        }
      }
      return;
    }

    // ==========================================
    // STANDARD 1V1 ONLINE VERSUS
    // ==========================================
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
            let isLocal = false;
            if (this.isCoopCampaign) {
              isLocal = (this.netplay.isHost && f.playerNum === 1) || (!this.netplay.isHost && f.playerNum === 3);
            } else {
              isLocal = (this.netplay.isHost && f.playerNum === 1) || (!this.netplay.isHost && f.playerNum === 2);
            }
            if (isLocal) {
              const fInput = input.getState(f.playerNum, f.facingRight);
              wantsPickup = (input.isDown('KeyS') && input.isJustPressed('KeyC')) || (fInput.down && fInput.dirtyJust);
            } else {
              const remote = this.netplay.remoteInputState || {};
              wantsPickup = !!(remote.rawDown && remote.dirtyJust);
            }
          } else {
            const isP1 = f.playerNum === 1;
            const fInput = input.getState(f.playerNum, f.facingRight);
            wantsPickup = isP1
              ? ((input.isDown('KeyS') && input.isJustPressed('KeyC')) || (fInput.down && fInput.dirtyJust))
              : (f.isCpu ? (!(this.getAIFor(f) && this.getAIFor(f).profile && this.getAIFor(f).profile.passive) && Math.random() < 0.008) : ((input.isDown('Numpad2') && input.isJustPressed('Numpad3')) || (fInput.down && fInput.dirtyJust)));
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

    if ((isLeftWall || isRightWall) && inHitState && fighter.state !== FIGHTER_STATE.WALL_REBOUND && !fighter.wallBouncedInCombo) {
      if ((isLeftWall && fighter.vx < -1.0) || (isRightWall && fighter.vx > 1.0)) {
        fighter.changeState(FIGHTER_STATE.WALL_REBOUND);
        fighter.wallBouncedInCombo = true;
        fighter.isInvincible = false;
        fighter.isGrounded = false;
        fighter.vx = isLeftWall ? 6.5 : -6.5;
        fighter.vy = -5.0;
        this.hud.triggerShake(8 * this.combat.shakeMult());
        vfx.hitSpark(isLeftWall ? fighter.x + 20 : fighter.x + 60, fighter.y - 45, { dir: isLeftWall ? 1 : -1, heavy: true, color: '#ffffff' });
        vfx.popup(fighter.x + 40, fighter.y - 105, 'WALL BOUNCE', { color: '#4ade80', size: 12 });
        try { soundFX.playWallBounce(); } catch (e) {}
        this.combat.addFreeze(8);
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
              const wasStanceBroken = defender.isStanceBroken;
              const hitType = this.combat.resolveMelee(attacker, defender, hitResult);
              const attackData = hitResult.attack || {};
              const isHeavy = attackData.hitType === HIT_TYPE.HEAVY || attackData.hitType === HIT_TYPE.KNOCKDOWN;

              if (hitType && hitType !== 'blocked' && hitType !== 'armored') {
                if (attacker.playerNum === 1) {
                  try { this.achievements.unlock('FIRST_BLOOD'); } catch (e) {}
                }
                if (this.elden && !defender.isDead && hitType !== 'ko') {
                  const broke = !wasStanceBroken && this.elden.checkStanceBreak(defender, attackData.damage || 0);
                  if (broke) {
                    try { if (attacker.playerNum === 1) this.achievements.unlock('STANCE_BREAKER'); } catch (e) {}
                    // Dazed: a short stagger window to land a Critical Riposte (2× heavy hit)
                    if (defender.state !== FIGHTER_STATE.KNOCKDOWN && defender.isGrounded) {
                      defender.hitStun = 0;
                      defender.blindTimer = 48;
                      defender.changeState(FIGHTER_STATE.BLIND_STUN, true);
                    }
                    this.combat.addFreeze(14);
                    this.triggerCameraZoom(1.16, 50);
                    this.hud.triggerShake(9 * this.combat.shakeMult());
                    try { soundFX.playStanceBreak(); } catch (e) {}
                    vfx.popup(defender.x + 40, defender.y - 104, 'STANCE BREAK', { color: '#ffe066', size: 13, life: 45, rise: 0.35 });
                    vfx.burst(defender.x + 40, defender.y - 50, { color: '#ffe066', count: 22, speed: 6 });
                  }
                }
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
          if (typeof target.isProjectileInvulnerable === 'function' && target.isProjectileInvulnerable()) continue;
          if (p.hitTargets && p.hitTargets.has(target)) continue;
          const targetHurtboxes = target.getGlobalHurtboxes();
          let hitTarget = false;
          for (const hurt of targetHurtboxes) {
            if (HitboxSystem.testOverlap(pHit, hurt)) {
              hitTarget = true;
              if (p.pierce) {
                p.hitTargets = p.hitTargets || new Set();
                p.hitTargets.add(target);
              } else {
                p.destroy();
              }

              this.combat.resolveProjectile(p, target);
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
            // Heavier projectiles (durability > 1) survive a clash
            const pd = p.durability || 1, od = other.durability || 1;
            if (pd > od) { p.durability = pd - od; other.destroy(); }
            else if (od > pd) { other.durability = od - pd; p.destroy(); }
            else { p.destroy(); other.destroy(); }
            const cx = (p.x + p.width / 2 + other.x + other.width / 2) / 2;
            const cy = (p.y + p.height / 2 + other.y + other.height / 2) / 2;
            vfx.hitSpark(cx, cy, { dir: 1, heavy: true, color: '#ffffff' });
            vfx.burst(cx, cy, { color: '#ffe066', count: 14, speed: 5 });
            soundFX.playNoiseCrack(0.2, 800, 0.4);
            break;
          }
        }
      }
    }
  }

  // Dynamic fighting-game camera: frames the fighters, zooms in when they are close,
  // lifts to follow jumps, and folds in event zooms (ultimates, stance breaks, KOs).
  updateCamera(snap = false) {
    const living = this.allFighters.filter(f => f && (!f.isDead || f.state === FIGHTER_STATE.KNOCKDOWN));
    if (living.length === 0) return;
    const centers = living.map(f => f.x + 40);
    const minX = Math.min(...centers);
    const maxX = Math.max(...centers);
    const midX = (minX + maxX) / 2;
    const dist = maxX - minX;

    const zoomSetting = this.settingsManager && this.settingsManager.settings ? this.settingsManager.settings.cameraZoom : undefined;
    const maxBaseZoom = zoomSetting === 'off' ? 1.0 : (zoomSetting === 'far' ? 1.18 : 1.34);
    let baseZoom = maxBaseZoom - Math.max(0, dist - 110) * ((maxBaseZoom - 1.0) / 330);
    baseZoom = Math.min(baseZoom, GAME_WIDTH / (dist + 150));
    baseZoom = Math.max(1.0, Math.min(maxBaseZoom, baseZoom));

    this.baseZoom = snap || !this.baseZoom ? baseZoom : this.baseZoom + (baseZoom - this.baseZoom) * 0.06;
    const z = Math.max(1.0, Math.min(1.7, this.baseZoom * (this.cameraZoom || 1)));
    this.camZoom = z;

    const viewW = GAME_WIDTH / z;
    const viewH = GAME_HEIGHT / z;
    const targetCamX = Math.max(0, Math.min(STAGE_WIDTH - viewW, midX - viewW / 2));
    this.cameraX = snap ? targetCamX : this.cameraX + (targetCamX - this.cameraX) * 0.18;
    this.cameraX = Math.max(0, Math.min(STAGE_WIDTH - viewW, this.cameraX));

    // Vertical: anchor to the bottom of the stage, rise to keep jumpers in frame
    let targetTop = GAME_HEIGHT - viewH;
    const highest = Math.min(...living.map(f => f.y - 100));
    if (highest < targetTop + 6) targetTop = Math.max(0, highest - 6);
    this.camTop = snap ? targetTop : this.camTop + (targetTop - this.camTop) * 0.2;
    this.camTop = Math.max(0, Math.min(GAME_HEIGHT - viewH, this.camTop));
  }

  // Convert a world position to logical screen coordinates (used by HUD effects)
  worldToScreen(x, y) {
    const z = this.camZoom || 1;
    return { x: (x - this.cameraX) * z, y: (y - (this.camTop || 0)) * z };
  }

  checkMatchEnd() {
    // 1. Campaign Progression Check
    if (this.isCampaign) {
      const isBouncerStage = this.bossQueue[this.bossIndex] === 'bouncer_twins';
      const isChampionStage = this.bossQueue[this.bossIndex] === 'champion';
      const isDragonStage = this.bossQueue[this.bossIndex] === 'endless_dragon';

      // Elden Ring Phase 1 transition guard: do not end if Rex Gannon or Endless Dragon is transitioning to Phase 2
      if ((isChampionStage || isDragonStage) && this.f2 && ((this.f2.phase === 1 && this.f2.hasTransitioned) || this.f2.transitionTimer > 0)) {
        return; // Fight continues in Phase 2!
      }

      const bossDead = isBouncerStage
        ? (this.f2.isDead && (!this.f4 || this.f4.isDead))
        : (this.f2.isDead);
      const playerDead = this.isCoopCampaign
        ? (this.f1.isDead && (!this.f3 || this.f3.isDead))
        : (this.f1.isDead);
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
        const playerHealth = this.isCoopCampaign ? (this.f1.health + (this.f3 ? this.f3.health : 0)) : this.f1.health;
        if (playerHealth > bossHealth) {
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
        soundFX.stopMusic();

        if (stageWon && (isChampionStage || isDragonStage) && this.f2.phase === 2) {
          const vanquishMsg = isDragonStage ? (this.isCoopCampaign ? 'ANCIENT DRAGON SLAIN (2P RAID CLEAR!)' : 'ANCIENT DRAGON VANQUISHED') : 'LEGEND VANQUISHED';
          this.hud.setAnnouncement(vanquishMsg, 150);
        } else if (isTimeOver) {
          this.hud.setAnnouncement(stageWon ? 'TIME OVER - STAGE CLEAR!' : 'TIME OVER - DEFEAT', 130);
          soundFX.playAnnouncer('TIME_OVER');
        } else {
          this.hud.setAnnouncement(stageWon ? (this.isCoopCampaign ? 'STAGE CLEAR (DUO RAID)!' : 'STAGE CLEAR!') : 'DEFEAT', 120);
        }
        this.hud.triggerShake(14);
      }

      if (this.screen === GAME_SCREENS.ROUND_OVER) {
        this.roundOverTimer--;
        if (this.roundOverTimer <= 0) {
          if (this.campaignStageWon) {
            // Defeating Stage 8 Endless Dragon unlocks the dragon & Dragon Slayer badge!
            if (isDragonStage) {
              EconomyManager.addCoins(500);
              try { this.achievements.unlock('DRAGON_SLAYER'); } catch (e) {}
              if (typeof window !== 'undefined' && window.localStorage) {
                try {
                  window.localStorage.setItem('final_impact_unlocked_dragon', 'true');
                  window.localStorage.setItem('final_impact_beaten_dragon', 'true');
                } catch (e) {}
              }
              if (this.charSelect) {
                this.charSelect.unlockDragon();
              }
            } else {
              EconomyManager.addCoins(100);
            }
            this.recordChallenge('campaignStage');

            this.bossIndex++;
            if (this.bossIndex < this.bossQueue.length) {
              // Advance to next boss! Heal player 50%
              this.f1.health = Math.min(this.f1.maxHealth, this.f1.health + 500);
              this.f1.stamina = this.f1.maxStamina;
              if (this.f3) {
                this.f3.health = Math.min(this.f3.maxHealth, this.f3.health + 500);
                this.f3.stamina = this.f3.maxStamina;
              }
              this.setupCampaignStage(this.f1.id, false);
              this.slowMotion = false;
              this.beginVersus();

              // Sync next stage to Challenger in Co-Op Campaign
              if (this.isCoopCampaign && this.netplay.isHost) {
                this.netplay.send({
                  type: 'CAMPAIGN_NEXT_STAGE',
                  bossIndex: this.bossIndex
                });
              }
            } else {
              // All 8 bosses defeated! Campaign Champion & Dragon Slayer!
              try { this.achievements.unlock('CAMPAIGN_CHAMPION'); } catch (e) {}
              EconomyManager.addCoins(1000); // Grand champion bounty
              if (this.isCoopCampaign && this.netplay.isHost) {
                this.netplay.send({
                  type: 'CAMPAIGN_VICTORY'
                });
              }
              this.recordChallenge('matchWin', { fighter: this.f1.id });
              const champSkin = `${this.f1.id}_champion`;
              const newSkin = EconomyManager.grantSkin(champSkin);
              try {
                const clears = JSON.parse(localStorage.getItem('final_impact_campaign_clears') || '{}');
                clears[this.f1.id] = true;
                localStorage.setItem('final_impact_campaign_clears', JSON.stringify(clears));
              } catch (e) {}
              if (newSkin) {
                try { this.achievements.toast({ icon: '👑', header: 'NEW SKIN EARNED', title: 'CHAMPION REGALIA', desc: `Equip it on ${this.f1.name} in the Item Shop.` }); } catch (e) {}
              }
              this.winner = this.f1;
              soundFX.playAnnouncer('YOU_WIN');
              if (!this.isCoopCampaign) {
                this.ending.start(this.f1, () => {
                  this.initVictoryScreen();
                  this.winner = this.f1;
                });
                this.screen = GAME_SCREENS.ENDING;
              } else {
                this.initVictoryScreen();
              }
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
        if (team2Dead) { EconomyManager.addCoins(150); this.recordChallenge('matchWin', { fighter: this.f1.id }); }
        soundFX.stopMusic();
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
      const timeUp = !this.f1.isDead && !this.f2.isDead;
      this.hud.setAnnouncement(timeUp ? (this.f1.health === this.f2.health ? 'DRAW' : 'TIME') : 'K.O.', 120);
      if (timeUp) soundFX.playAnnouncer('TIME_OVER');
      this.hud.triggerShake(timeUp ? 4 : 14);

      if (this.f1.health > this.f2.health) {
        this.f1.roundsWon++;
        this.f1.changeState(FIGHTER_STATE.VICTORY);
        EconomyManager.addCoins(50); // Round win reward
        if (this.f1.health >= this.f1.maxHealth) this.recordChallenge('flawlessRound');
        if (this.f1.roundsWon >= 2) {
          this.recordChallenge('matchWin', { fighter: this.f1.id });
          const diff = this.charSelect.cpuDifficulty;
          if (this.f2.isCpu && (diff === 'hard' || diff === 'nightmare')) this.recordChallenge('hardWin');
        }
      } else if (this.f2.health > this.f1.health) {
        this.f2.roundsWon++;
        this.f2.changeState(FIGHTER_STATE.VICTORY);
      }

      if (this.f1.roundsWon >= 2 || this.f2.roundsWon >= 2) {
        soundFX.stopMusic();
        const w = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
        this.koFlawless = w.health >= w.maxHealth;
        if (w === this.f1) {
          if (this.koFlawless) {
            try { this.achievements.unlock('PERFECT_ROUND'); } catch (e) {}
          }
          EconomyManager.addCoins(150 + (this.koFlawless ? 200 : 0)); // Match win + flawless bonus
        }
      }
    }

    if (this.screen === GAME_SCREENS.ROUND_OVER) {
      // MK-style FINISH HIM sequence (offline 1v1, human winner only)
      if (this.finish.active) {
        if (this.finish.update()) {
          this.initVictoryScreen();
          this.winner = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
          soundFX.playAnnouncer('YOU_WIN');
        }
        return;
      }
      this.roundOverTimer--;
      if (this.roundOverTimer <= 0) {
        if (this.f1.roundsWon >= 2 || this.f2.roundsWon >= 2) {
          const fw = this.f1.roundsWon >= 2 ? this.f1 : this.f2;
          const fl = fw === this.f1 ? this.f2 : this.f1;
          if (!this.isOnline && !this.isTraining && !fw.isCpu && fl.isDead) {
            this.slowMotion = false;
            this.finish.start(fw, fl, this.hud, { flawless: !!this.koFlawless });
            return;
          }
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

      const menuNav = input.getAnyMenuNav();

      // Navigation if player hasn't voted yet
      if (this.myRematchVote === null) {
        if (input.isJustPressed('KeyA') || input.isJustPressed('ArrowLeft') || input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (menuNav && (menuNav.left || menuNav.up))) {
          input.consumeKey('KeyA');
          input.consumeKey('ArrowLeft');
          input.consumeKey('KeyW');
          input.consumeKey('ArrowUp');
          if (this.onlineRematchOption !== 0) {
            this.onlineRematchOption = 0;
            soundFX.playWhoosh('light');
          }
        } else if (input.isJustPressed('KeyD') || input.isJustPressed('ArrowRight') || input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (menuNav && (menuNav.right || menuNav.down))) {
          input.consumeKey('KeyD');
          input.consumeKey('ArrowRight');
          input.consumeKey('KeyS');
          input.consumeKey('ArrowDown');
          if (this.onlineRematchOption !== 1) {
            this.onlineRematchOption = 1;
            soundFX.playWhoosh('light');
          }
        }

        if (menuNav && menuNav.confirm) {
          this.voteRematch(this.onlineRematchOption === 0 ? 'yes' : 'no');
        } else if (menuNav && menuNav.back) {
          this.voteRematch('no');
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
    const menuNav = input.getAnyMenuNav();
    if (input.isJustPressed('KeyW') || input.isJustPressed('ArrowUp') || (menuNav && menuNav.up)) {
      input.consumeKey('KeyW');
      input.consumeKey('ArrowUp');
      this.victoryMenuIndex = (this.victoryMenuIndex - 1 + 3) % 3;
      soundFX.playWhoosh('light');
    } else if (input.isJustPressed('KeyS') || input.isJustPressed('ArrowDown') || (menuNav && menuNav.down)) {
      input.consumeKey('KeyS');
      input.consumeKey('ArrowDown');
      this.victoryMenuIndex = (this.victoryMenuIndex + 1) % 3;
      soundFX.playWhoosh('light');
    }

    if (menuNav && menuNav.confirm) {
      this.handleConfirmPress();
    } else if (menuNav && menuNav.back) {
      this.handleBackPress();
    }
  }

  render() {
    const { ctx } = this;
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;
    const scale = (this.canvas && this.canvas.width) ? (this.canvas.width / W) : 1;

    ctx.save();
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }
    ctx.imageSmoothingEnabled = false;

    try {
      if (typeof document !== 'undefined') {
        const coinEl = document.getElementById('topbarCoinVal');
        if (coinEl && this.gameSpeedTick % 30 === 0) {
          coinEl.textContent = EconomyManager.getCoins().toLocaleString();
        }
      }

      ctx.clearRect(0, 0, W, H);

      if (this.screen === GAME_SCREENS.TITLE) {
        this.titleScreen.render(ctx, W, H);
        return;
      }

    if (this.screen === GAME_SCREENS.ONLINE_LOBBY) {
      this.onlineLobby.render(ctx, W, H);
      return;
    }

    if (this.screen === GAME_SCREENS.SHOP) {
      this.shopScreen.render(ctx, W, H);
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

    if (this.screen === GAME_SCREENS.STAGE_SELECT) {
      this.stageSelect.render(ctx, W, H);
      return;
    }

    if (this.screen === GAME_SCREENS.VERSUS) {
      this.versus.render(ctx, W, H, this.stage, this.cameraX);
      return;
    }

    if (this.screen === GAME_SCREENS.CAMPAIGN_DIALOGUE) {
      if (this.stage) this.stage.render(ctx, this.cameraX, W, H);
      ctx.save();
      ctx.translate(-this.cameraX, 0);
      if (this.f1) this.f1.render(ctx);
      if (this.f2) this.f2.render(ctx);
      ctx.restore();
      this.campaignDialogue.render(ctx, W, H);
      return;
    }

    if (this.screen === GAME_SCREENS.SITE_OF_GRACE) {
      this.elden.renderSiteOfGrace(ctx, W, H);
      return;
    }

    if (this.screen === GAME_SCREENS.VICTORY) {
      this.renderVictoryScreen();
      return;
    }

    if (this.screen === GAME_SCREENS.CHALLENGES) {
      this.challenges.render(ctx, W, H, input.hasGamepadConnected && input.hasGamepadConnected());
      return;
    }

    if (this.screen === GAME_SCREENS.ENDING) {
      this.ending.render(ctx, W, H, input.hasGamepadConnected && input.hasGamepadConnected());
      if (this.achievements) this.achievements.render(ctx, W, H);
      return;
    }

    // FIGHT & ROUND_OVER
    ctx.save();
    const shake = this.hud.getShakeOffset();
    ctx.translate(shake.x, shake.y);

    // Camera: zoom + vertical follow (the stage is drawn in "screen" space under this transform)
    const z = this.camZoom || 1;
    ctx.scale(z, z);
    ctx.translate(0, -(this.camTop || 0));

    // 1. Render Parallax Stage
    this.stage.render(ctx, this.cameraX, W, H);

    // Super freeze darkens the arena so the ultimate pops
    if (this.combat && this.combat.superFreeze > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(4, 2, 10, ${Math.min(0.62, this.combat.superFreeze / 40 * 0.9)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // 2. Render Fighters & Pickups with camera offset
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Ground Pickups
    this.pickups.forEach(p => p.render(ctx));

    // All active fighters
    this.allFighters.forEach(f => f.render(ctx));

    // Projectiles
    this.projectiles.forEach(p => p.render(ctx));

    // Hit sparks, dust, shockwaves, ability trails
    vfx.render(ctx);

    // Finisher world-space FX (aura, shockwaves, sparks)
    if (this.finish && this.finish.active) {
      this.finish.renderWorld(ctx);
    }

    // Debug Hitbox / Hurtbox Visualizer
    if (this.showHitboxes) {
      this.renderHitboxDebug(ctx);
    }

    ctx.restore();

    // End of camera transform: everything below is screen space (never cropped by zoom)
    ctx.restore();
    ctx.save();
    vfx.renderScreen(ctx, W, H);

    // 3. Render HUD (Health, Stamina, Timer, Super, Announcements)
    const primaryEnemy = (this.f2 && !this.f2.isDead) ? this.f2 : (this.f4 || this.f2);
    this.hud.render(ctx, this.f1, primaryEnemy, W, H, this.f3, this.f4, this);
    if (this.isTraining && this.training) this.training.render(ctx, W, H);

    // 4. FINISH HIM overlay (text, letterbox, impact flash)
    if (this.finish && this.finish.active) {
      this.finish.renderOverlay(ctx, W, H);
    }

    // 5. Elden Ring Atmospheric Overlays ("YOU DIED", "GREAT ENEMY FELLED", "GOD SLAIN")
    if (this.elden) {
      this.elden.update();
      this.elden.renderFelledBanner(ctx, W, H);
      this.elden.renderYouDied(ctx, W, H);
    }

    // Online Connection & Ping Badge
    if (this.isOnline && this.netplay) {
      this.renderOnlineBadge(ctx, W, H);
    }

    ctx.restore();

    // 6. Sliding Steam Achievements Toast Overlay
    if (this.achievements) {
      this.achievements.render(ctx, W, H);
    }
    } finally {
      ctx.restore();
    }
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
    this.victoryAnim = (this.victoryAnim || 0) + 1;
    const t = this.victoryAnim;
    const winner = this.winner;
    const playerWon = winner && winner === this.f1;
    const glow = (winner && winner._glow) || THEME_COLORS.gold;

    drawBackdrop(ctx, W, H, t, { tint: playerWon ? '#7a4a06' : THEME_COLORS.crimsonDeep });

    // Diagonal light shaft behind the winner
    ctx.save();
    const shaft = ctx.createLinearGradient(80, 0, 260, H);
    shaft.addColorStop(0, hexToRgba(glow, 0.0));
    shaft.addColorStop(0.5, hexToRgba(glow, 0.22));
    shaft.addColorStop(1, hexToRgba(glow, 0.0));
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(110, 0); ctx.lineTo(250, 0); ctx.lineTo(300, H); ctx.lineTo(40, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Back button (click area 12..110 × 10..34)
    drawSlantPanel(ctx, 12, 10, 96, 22, { fill: 'rgba(0,0,0,0.6)', stroke: 'rgba(255,255,255,0.18)', slant: 6 });
    drawText(ctx, this.isOnline ? 'LOBBY' : 'MODES', 66, 25, { font: FONTS.ui(9, 800), color: THEME_COLORS.textDim, align: 'center' });
    drawKeyCap(ctx, 'B', 22, 15, { h: 12 });

    // Winner render on a lit platform
    const enter = ease.outCubic(Math.min(1, t / 22));
    if (winner) {
      const sprites = winner.sprites?.VICTORY || winner.sprites?.IDLE || [];
      const frame = sprites.length ? sprites[Math.floor(t / 10) % sprites.length] : null;
      const cx = 170;
      const baseY = 300;
      ctx.save();
      const plat = ctx.createRadialGradient(cx, baseY, 4, cx, baseY, 110);
      plat.addColorStop(0, hexToRgba(glow, 0.55));
      plat.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = plat;
      ctx.beginPath(); ctx.ellipse(cx, baseY, 110, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hexToRgba(glow, 0.8);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, baseY, 70, 11, 0, 0, Math.PI * 2); ctx.stroke();
      if (frame) {
        const sc = 2.5;
        const iw = 80 * sc, ih = 90 * sc;
        ctx.globalAlpha = enter;
        ctx.imageSmoothingEnabled = false;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 22;
        ctx.drawImage(frame, cx - iw / 2 - (1 - enter) * 60, baseY - ih + 8, iw, ih);
      }
      ctx.restore();
    }

    // Right column: result + quote + stats
    const rx = 330;
    const titleIn = ease.outBack(Math.min(1, Math.max(0, (t - 6) / 18)));
    let headline;
    let sub;
    if (this.isCampaign && playerWon) {
      headline = this.isCoopCampaign ? 'DRAGON SLAYERS' : 'CONQUEROR';
      sub = this.isCoopCampaign ? 'CO-OP RAID COMPLETE — THE ANCIENT DRAGON HAS FALLEN' : 'ALL 8 BOSSES & THE ENDLESS DRAGON FELLED';
    } else if (this.isCampaign) {
      headline = 'DEFEATED';
      sub = `FELL TO ${winner ? winner.name : 'THE BOSS'} — STAGE ${(this.bossIndex || 0) + 1}`;
    } else {
      headline = winner ? winner.name : 'PLAYER';
      sub = playerWon || this.charSelect.gameMode === '2p' || this.isOnline ? 'WINS THE MATCH' : 'CPU WINS THE MATCH';
    }
    ctx.save();
    ctx.translate(rx + (1 - titleIn) * 40, 0);
    ctx.globalAlpha = Math.min(1, titleIn);
    drawText(ctx, sub, 0, 62, { font: FONTS.ui(9, 800), color: THEME_COLORS.gold, letterSpacing: 2 });
    const hlSize = headline.length > 12 ? 30 : 42;
    drawTitleText(ctx, headline, 0, 62 + hlSize + 4, hlSize, { align: 'left' });
    ctx.restore();

    if (winner) {
      const quote = this.victoryQuotes[winner.id] || '"Victory belongs to the swift and disciplined!"';
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, (t - 14) / 16));
      ctx.fillStyle = hexToRgba(glow, 0.9);
      ctx.fillRect(rx, 124, 2, 26);
      wrapText(ctx, quote, rx + 10, 134, 280, 12, { font: `italic 600 10px ${'"Bahnschrift", "Segoe UI", "Inter", sans-serif'}`, color: THEME_COLORS.text });
      ctx.restore();
    }

    // Match stats chips
    const chips = [];
    if (!this.isCampaign && this.f1 && this.f2) chips.push(`ROUNDS ${this.f1.roundsWon || 0} – ${this.f2.roundsWon || 0}`);
    const best = this.combat && this.combat.matchStats ? this.combat.matchStats.bestCombo[1] : 0;
    if (best >= 2) chips.push(`BEST COMBO ${best} HITS`);
    if (this.koFlawless && playerWon) chips.push('FLAWLESS');
    if (typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_beaten_dragon') === 'true' && this.isCampaign) chips.push('DRAGON UNLOCKED');
    let cx2 = rx;
    chips.forEach(c => {
      ctx.font = FONTS.ui(8, 800);
      const w = ctx.measureText(c).width + 16;
      drawSlantPanel(ctx, cx2, 164, w, 16, { fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.15)', slant: 4 });
      drawText(ctx, c, cx2 + w / 2, 175, { font: FONTS.ui(8, 800), color: c === 'FLAWLESS' ? THEME_COLORS.gold : THEME_COLORS.textDim, align: 'center' });
      cx2 += w + 6;
    });

    if (this.isOnline) {
      // Online rematch vote (click areas: YES rx..rx+135, NO rx+145..rx+280, y 214..244)
      drawText(ctx, 'REMATCH?', rx, 204, { font: FONTS.display(16), color: THEME_COLORS.text });
      const opts = [
        { label: 'YES — REMATCH', voted: this.myRematchVote === 'yes', col: THEME_COLORS.good },
        { label: 'NO — LOBBY', voted: this.myRematchVote === 'no', col: THEME_COLORS.bad }
      ];
      opts.forEach((o, i) => {
        const bx = rx + i * 145;
        const sel = this.onlineRematchOption === i;
        drawSlantPanel(ctx, bx, 214, 135, 30, {
          fill: o.voted ? hexToRgba(o.col, 0.35) : (sel ? 'rgba(245, 197, 66, 0.16)' : 'rgba(0,0,0,0.55)'),
          stroke: sel ? THEME_COLORS.gold : (o.voted ? o.col : 'rgba(255,255,255,0.15)'), slant: 8, lineWidth: sel ? 1.5 : 1
        });
        drawText(ctx, o.label + (o.voted ? '  ✓' : ''), bx + 67, 233, { font: FONTS.ui(10, 900), color: sel || o.voted ? THEME_COLORS.text : THEME_COLORS.textDim, align: 'center' });
      });
      const vote = v => (v ? (v === 'yes' ? 'READY' : 'DECLINED') : 'DECIDING…');
      const vcol = v => (v === 'yes' ? THEME_COLORS.good : (v === 'no' ? THEME_COLORS.bad : THEME_COLORS.textDim));
      drawText(ctx, `YOU: ${vote(this.myRematchVote)}`, rx, 262, { font: FONTS.ui(9, 800), color: vcol(this.myRematchVote) });
      drawText(ctx, `OPPONENT: ${vote(this.oppRematchVote)}`, rx + 145, 262, { font: FONTS.ui(9, 800), color: vcol(this.oppRematchVote) });
      if (this.rematchStatusMessage) {
        drawText(ctx, this.rematchStatusMessage, rx, 282, { font: FONTS.ui(9, 900), color: THEME_COLORS.meter });
      }
      drawPromptBar(ctx, [{ key: 'A/D', label: 'Select' }, { key: 'ENTER', label: 'Vote' }, { key: 'Y', label: 'Yes' }, { key: 'N', label: 'No' }], W / 2, H - 10);
    } else {
      // Offline menu (click areas: x rx..rx+260, rows y = 206 + i*30, h 24)
      const menuOptions = ['REMATCH', 'CHARACTER SELECT', 'MAIN MENU'];
      menuOptions.forEach((label, idx) => {
        const sel = this.victoryMenuIndex === idx;
        const y = 206 + idx * 30;
        const slideIn = ease.outCubic(Math.min(1, Math.max(0, (t - 18 - idx * 4) / 14)));
        const x = rx + (1 - slideIn) * 50 + (sel ? 8 : 0);
        ctx.save();
        ctx.globalAlpha = slideIn;
        drawSlantPanel(ctx, x, y, 250, 24, {
          fill: sel ? 'rgba(245, 197, 66, 0.95)' : 'rgba(0,0,0,0.55)',
          stroke: sel ? THEME_COLORS.goldPale : 'rgba(255,255,255,0.14)', slant: 8
        });
        drawText(ctx, label, x + 18, y + 16.5, { font: FONTS.display(12, 900), color: sel ? '#120c04' : THEME_COLORS.textDim });
        if (sel) drawText(ctx, '▶', x + 236, y + 16, { font: FONTS.ui(9, 900), color: '#120c04', align: 'right' });
        ctx.restore();
      });
      drawPromptBar(ctx, [{ key: 'W/S', label: 'Select' }, { key: 'ENTER', label: 'Confirm' }, { key: 'ESC', label: 'Back' }], W / 2, H - 10);
    }
    ctx.textAlign = 'left';
  }
}

function wrapText(ctx, text, x, y, maxW, lineH, { font, color }) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  const words = String(text).split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineH;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

