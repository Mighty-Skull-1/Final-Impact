import { STAGE_CATALOG } from '../graphics/StageCatalog.js';
// Final Impact - Character Select Screen
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';
import { isMightyUnlocked, setMightyUnlocked, isStealthMode, isAdminAuthenticated } from '../utils/CryptoAuth.js';
import { EconomyManager, SKIN_CATALOG } from '../shop/SkinCatalog.js';

export class CharacterSelect {
  constructor() {
    this.characters = [
      {
        id: 'kazuki',
        name: 'KAZUKI',
        title: 'THE DRAGON STRIKER',
        style: 'Ansatsuken Karate',
        origin: 'Japan',
        power: 4,
        speed: 4,
        defense: 4,
        specials: [
          { name: 'Hadouken', cmd: '↓ ↘ → + P (or SP1)', desc: 'Ki Fireball projectile' },
          { name: 'Shoryuken', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Invincible rising uppercut' },
          { name: 'Tatsumaki', cmd: '↓ ↙ ← + K', desc: 'Spinning horizontal kick' }
        ]
      },
      {
        id: 'raven',
        name: 'RAVEN',
        title: 'TACTICAL COMMANDO',
        style: 'Military Brawling',
        origin: 'USA',
        power: 5,
        speed: 3,
        defense: 5,
        specials: [
          { name: 'Sonic Blade', cmd: '← (hold) → + P (or SP1)', desc: 'Spinning sonic razor blade' },
          { name: 'Flash Somersault', cmd: '↓ (hold) ↑ + K (or SP2)', desc: 'Anti-air backflip slash' },
          { name: 'Blitz Knuckle', cmd: '↓ ↘ → + P', desc: 'Rocket-assisted straight punch' }
        ]
      },
      {
        id: 'kagura',
        name: 'KAGURA',
        title: 'CYBER KUNOICHI',
        style: 'Shadow Ninjutsu',
        origin: 'Neo Tokyo',
        power: 3,
        speed: 5,
        defense: 3,
        specials: [
          { name: 'Shadow Warp', cmd: '↓ ↙ ← + P (or SP1)', desc: 'Teleports behind opponent' },
          { name: 'Crescent Gale', cmd: '↓ ↘ → + K (or SP2)', desc: 'Triple rising wind kick' },
          { name: 'Ki Kunai', cmd: '↓ ↘ → + P', desc: 'Rapid glowing energy kunai' }
        ]
      },
      {
        id: 'fang',
        name: 'FANG',
        title: 'THE LETHAL STRIKER',
        style: 'Muay Thai / Lethwei',
        origin: 'Thailand',
        power: 4,
        speed: 4,
        defense: 4,
        specials: [
          { name: 'Tiger Knee', cmd: '↓ ↘ → + K (or SP1)', desc: 'Forward leaping knee strike' },
          { name: 'Cyclone Elbow', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Double spinning slicing elbow' },
          { name: 'Iron Teep', cmd: '↓ ↙ ← + K (or SP3)', desc: 'High pushback front kick' }
        ]
      },
      {
        id: 'zephyr',
        name: 'ZEPHYR',
        title: 'THE WIND DANCER',
        style: 'Capoeira Acrobat',
        origin: 'Brazil',
        power: 3,
        speed: 5,
        defense: 3,
        specials: [
          { name: 'Windmill Kick', cmd: '↓ ↘ → + K (or SP1)', desc: 'Spinning ground sweep kick' },
          { name: 'Handstand Axe', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Overhead handstand heel drop' },
          { name: 'Flare Slide', cmd: '↓ ↙ ← + K (or SP3)', desc: 'Low evasive sliding sweep' }
        ]
      },
      {
        id: 'colossus',
        name: 'COLOSSUS',
        title: 'THE IRON WALL',
        style: 'Heavyweight Boxing',
        origin: 'USA',
        power: 5,
        speed: 2,
        defense: 5,
        specials: [
          { name: 'Dempsey Blow', cmd: '↓ ↘ → + P (or SP1)', desc: 'Armored heavy body blow' },
          { name: 'Corkscrew', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Rising spiral uppercut' },
          { name: 'Gazelle Punch', cmd: '↓ ↙ ← + P (or SP3)', desc: 'Leaping heavy hook' }
        ]
      },
      { id: 'cinder', name: 'CINDER', title: 'EMBER SHINOBI', style: 'Flame Ninjutsu', origin: 'Ash Province', power: 3, speed: 5, defense: 3,
        specials: [
          { name: 'Flame Warp', cmd: '↓ ↙ ← + P (or SP1)', desc: 'Vanishes in smoke, reappears behind foe' },
          { name: 'Ember Gale', cmd: '↓ ↘ → + K (or SP2)', desc: 'Triple rising fire kick' },
          { name: 'Fire Kunai', cmd: '↓ ↘ → + P', desc: 'Rapid blazing kunai' }
        ] },
      { id: 'glacier', name: 'GLACIER', title: 'FROSTBOUND ASSASSIN', style: 'Ice Ansatsuken', origin: 'Frozen North', power: 4, speed: 4, defense: 4,
        specials: [
          { name: 'Ice Shard', cmd: '↓ ↘ → + P (or SP1)', desc: 'Freezing ki projectile' },
          { name: 'Frost Rise', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Invincible rising uppercut' },
          { name: 'Blizzard Kick', cmd: '↓ ↙ ← + K', desc: 'Spinning icy kick' }
        ] },
      { id: 'oracle', name: 'ORACLE', title: 'STAR-READER', style: 'Astral Sorcery', origin: 'Observatory Ruins', power: 2, speed: 4, defense: 3,
        specials: [
          { name: 'Star Step', cmd: '↓ ↙ ← + P (or SP1)', desc: 'Blinks behind the opponent' },
          { name: 'Comet Fall', cmd: '↓ ↘ → + K (or SP2)', desc: 'Triple rising comet strike' },
          { name: 'Astral Dart', cmd: '↓ ↘ → + P', desc: 'Rapid starlight darts' }
        ] },
      { id: 'bandit', name: 'BANDIT', title: 'ROAD REAVER', style: 'Dirty Brawling', origin: 'Wastelands', power: 4, speed: 4, defense: 3,
        specials: [
          { name: 'Razor Toss', cmd: '← (hold) → + P (or SP1)', desc: 'Spinning thrown blade' },
          { name: 'Back Flip Slash', cmd: '↓ (hold) ↑ + K (or SP2)', desc: 'Anti-air flip slash' },
          { name: 'Knuckle Dust', cmd: '↓ ↘ → + P', desc: 'Armoured straight punch' }
        ] },
      { id: 'confessor', name: 'CONFESSOR', title: 'HOODED INQUISITOR', style: 'Penitent Striking', origin: 'Hollow Cathedral', power: 4, speed: 3, defense: 4,
        specials: [
          { name: 'Penance Knee', cmd: '↓ ↘ → + K (or SP1)', desc: 'Leaping knee strike' },
          { name: 'Judgement Elbow', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Double spinning elbow' },
          { name: 'Silent Teep', cmd: '↓ ↙ ← + K (or SP3)', desc: 'Heavy pushback kick' }
        ] },
      { id: 'valka', name: 'VALKA', title: 'SHIELD-SISTER', style: 'Warrior Karate', origin: 'Northern Hold', power: 3, speed: 5, defense: 3,
        specials: [
          { name: 'War Cry', cmd: '↓ ↘ → + P (or SP1)', desc: 'Ki shockwave projectile' },
          { name: 'Valkyrie Rise', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Invincible rising strike' },
          { name: 'Storm Spin', cmd: '↓ ↙ ← + K', desc: 'Spinning horizontal kick' }
        ] },
      { id: 'convict', name: 'CONVICT', title: 'THE SACKED ONE', style: 'Prison Boxing', origin: 'Black Gaol', power: 5, speed: 2, defense: 5,
        specials: [
          { name: 'Chain Hook', cmd: '↓ ↘ → + P (or SP1)', desc: 'Armoured heavy body blow' },
          { name: 'Breakout', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Rising spiral uppercut' },
          { name: 'Cell Rush', cmd: '↓ ↙ ← + P (or SP3)', desc: 'Leaping heavy hook' }
        ] },
      { id: 'prophet', name: 'PROPHET', title: 'THE BLIND SEER', style: 'Mystic Capoeira', origin: 'Dune Temple', power: 3, speed: 4, defense: 3,
        specials: [
          { name: 'Sand Wheel', cmd: '↓ ↘ → + K (or SP1)', desc: 'Spinning ground sweep' },
          { name: 'Vision Axe', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Overhead heel drop' },
          { name: 'Dust Slide', cmd: '↓ ↙ ← + K (or SP3)', desc: 'Low evasive slide' }
        ] },
      { id: 'ronin', name: 'RONIN', title: 'CRIMSON BLADE', style: 'Bushido Karate', origin: 'Feudal Japan', power: 4, speed: 4, defense: 4,
        specials: [
          { name: 'Wave Cutter', cmd: '↓ ↘ → + P (or SP1)', desc: 'Ki slash projectile' },
          { name: 'Rising Katana', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Invincible rising slash' },
          { name: 'Whirl Kick', cmd: '↓ ↙ ← + K', desc: 'Spinning horizontal kick' }
        ] },
      { id: 'vagabond', name: 'VAGABOND', title: 'WANDERING KNIGHT', style: 'Heavy Blade Brawling', origin: 'Fallen Kingdom', power: 5, speed: 3, defense: 5,
        specials: [
          { name: 'Edge Wave', cmd: '← (hold) → + P (or SP1)', desc: 'Spinning blade wave' },
          { name: 'Knight Flip', cmd: '↓ (hold) ↑ + K (or SP2)', desc: 'Anti-air backflip slash' },
          { name: 'Shield Ram', cmd: '↓ ↘ → + P', desc: 'Armoured straight punch' }
        ] },
      { id: 'warden', name: 'WARDEN', title: 'WALL OF THE DESERT', style: 'Desert Boxing Kicks', origin: 'Sand Citadel', power: 4, speed: 3, defense: 5,
        specials: [
          { name: 'Citadel Knee', cmd: '↓ ↘ → + K (or SP1)', desc: 'Forward leaping knee' },
          { name: 'Twin Blades', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Double spinning elbow' },
          { name: 'Iron Gate', cmd: '↓ ↙ ← + K (or SP3)', desc: 'Pushback front kick' }
        ] },
      { id: 'wretch', name: 'WRETCH', title: 'THE UNBROKEN', style: 'Desperate Scrapping', origin: 'Nowhere', power: 2, speed: 5, defense: 2,
        specials: [
          { name: 'Scramble Spin', cmd: '↓ ↘ → + K (or SP1)', desc: 'Spinning ground sweep' },
          { name: 'Crow Drop', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Overhead heel drop' },
          { name: 'Gutter Slide', cmd: '↓ ↙ ← + K (or SP3)', desc: 'Low sliding sweep' }
        ] },
      {
        id: 'mighty',
        name: 'M1GHTY',
        title: 'DIVINE ANNIHILATOR',
        style: 'One-Hit Extinction',
        origin: 'Astral Realm',
        power: 5,
        speed: 5,
        defense: 5,
        isSecret: true,
        specials: [
          { name: 'God Palm', cmd: '↓ ↘ → + P (or SP1)', desc: 'Instant 9999 KO Solar Palm' },
          { name: 'Apex Shatter', cmd: '→ ↓ ↘ + P (or SP2)', desc: 'Invincible 9999 Uppercut' },
          { name: 'Void Tremor', cmd: '↓ ↙ ← + P (or SP3)', desc: 'Instant 9999 Warp Strike' }
        ]
      },
      {
        id: 'endless_dragon',
        name: 'ENDLESS DRAGON',
        title: 'ANCIENT VOID EMPEROR',
        style: 'Draconic Cataclysm & Flight',
        origin: 'Primeval Realm',
        power: 5,
        speed: 4,
        defense: 5,
        isBoss: true,
        specials: [
          { name: 'Dragon Claw', cmd: '↓ ↘ → + P (or SP1)', desc: 'Brutal Rend Slash' },
          { name: 'Tail Sweep', cmd: '→ ↓ ↘ + K (or SP2)', desc: 'Low Knockdown Sweep' },
          { name: 'Dragon Flight', cmd: 'SP3 (or Aerial)', desc: 'Fly freely & divebomb' }
        ]
      }
    ];

    this.stages = STAGE_CATALOG;

    this.p1Index = 0;
    this.p2Index = 1;
    this.stageIndex = 0;
    this.gameMode = 'campaign'; // 'campaign', 'cpu', '2p', '2v2', 'training', 'coop_campaign'
    this.cpuDifficulty = 'normal';
    this.localPlayerNum = 1;
    this.p1Locked = false;
    this.p2Locked = false;
    this.animTimer = 0;
    this.animFrame = 0;

    // Admin feedback state
    this.codeFeedback = '';
    this.codeFeedbackColor = '#38bdf8';
    this.onOpenAdmin = null;

    // Cache sprites for previews (taking into account equipped skins)
    this.previewSprites = {};
    this.refreshPreviews();
  }

  refreshPreviews() {
    this.characters.forEach(c => {
      const equippedSkin = EconomyManager.getEquippedSkin(c.id);
      this.previewSprites[c.id] = spriteGenerator.generateFighterSprites(c.id, equippedSkin);
    });
  }

  isMightyUnlocked() {
    return isMightyUnlocked();
  }

  unlockMighty() {
    setMightyUnlocked(true);
    const equipped = EconomyManager.getEquippedSkin('mighty');
    this.previewSprites['mighty'] = spriteGenerator.generateFighterSprites('mighty', equipped);
  }

  lockMighty() {
    setMightyUnlocked(false);
  }

  openAdminPortal() {
    if (typeof this.onOpenAdmin === 'function') {
      this.onOpenAdmin();
    } else if (typeof window !== 'undefined' && typeof window.openAdminPortal === 'function') {
      window.openAdminPortal();
    }
  }

  isDragonUnlocked() {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_unlocked_dragon') === 'true';
    } catch (e) {
      return false;
    }
  }

  hasBeatenDragon() {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_beaten_dragon') === 'true';
    } catch (e) {
      return false;
    }
  }

  unlockDragon() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_unlocked_dragon', 'true');
        localStorage.setItem('final_impact_beaten_dragon', 'true');
      }
      if (!this.previewSprites['endless_dragon']) {
        this.previewSprites['endless_dragon'] = spriteGenerator.generateFighterSprites('endless_dragon');
      }
    } catch (e) {}
  }

  isCurrentSelectionLocked(isP1 = true) {
    const idx = isP1 ? this.p1Index : this.p2Index;
    const char = this.characters[idx];
    if (!char) return false;
    if (char.id === 'mighty' && !this.isMightyUnlocked()) return 'mighty';
    if (char.id === 'endless_dragon' && !this.isDragonUnlocked()) return 'dragon';
    return false;
  }

  setMode(mode, difficulty = 'normal', localPlayerNum = 1) {
    this.gameMode = mode;
    this.cpuDifficulty = difficulty;
    this.localPlayerNum = localPlayerNum;
  }

  gridCols() {
    return Math.ceil(this.characters.length / 2);
  }

  /** Roster grid geometry (shared by hit-testing and rendering). */
  gridLayout(W = 640) {
    const cols = this.gridCols();
    const tileW = 50, tileH = 36, gap = 3;
    const totalW = cols * tileW + (cols - 1) * gap;
    return { cols, tileW, tileH, gap, x0: Math.round((W - totalW) / 2), y0: 248 };
  }

  handleInput(inputState, isP1 = true) {
    if (this.showCodeModal) return;

    if (isP1) {
      if (inputState.left) {
        this.p1Index = (this.p1Index - 1 + this.characters.length) % this.characters.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.p1Index = (this.p1Index + 1) % this.characters.length;
        soundFX.playWhoosh('light');
      }

      // Move between roster rows with Up / Down
      if (inputState.up || inputState.down) {
        this.p1Index = (this.p1Index + this.gridCols()) % this.characters.length;
        soundFX.playWhoosh('light');
      }
    } else {
      // Player 2 selection in 2P mode
      if (inputState.up || inputState.down) {
        this.p2Index = (this.p2Index + this.gridCols()) % this.characters.length;
        soundFX.playWhoosh('light');
      }
      if (inputState.left) {
        this.p2Index = (this.p2Index - 1 + this.characters.length) % this.characters.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.p2Index = (this.p2Index + 1) % this.characters.length;
        soundFX.playWhoosh('light');
      }
    }
  }

  handleClick(x, y, onBack, onConfirm, W = 640, H = 360) {
    // Top-Left Back button
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    // Top-Right Admin Portal Button: [ 🔒 ADMIN PORTAL (A) ]
    const isStealth = isStealthMode() && !isAdminAuthenticated();
    if (!isStealth && x >= W - 165 && x <= W - 12 && y >= 10 && y <= 34) {
      this.openAdminPortal();
      return true;
    }

    // Check roster tiles
    const G = this.gridLayout(W);
    for (let idx = 0; idx < this.characters.length; idx++) {
      const col = idx % G.cols, row = Math.floor(idx / G.cols);
      const tx = G.x0 + col * (G.tileW + G.gap), ty = G.y0 + row * (G.tileH + G.gap);
      if (x >= tx && x <= tx + G.tileW && y >= ty && y <= ty + G.tileH) {
        const char = this.characters[idx];
        const prevIdx = (this.gameMode === 'online' && this.localPlayerNum === 2) ? this.p2Index : this.p1Index;
        const wasAlreadySelected = (prevIdx === idx);

        if (this.gameMode === 'online' && this.localPlayerNum === 2) {
          this.p2Index = idx;
        } else {
          this.p1Index = idx;
        }
        soundFX.playWhoosh('light');
        if (char.id === 'mighty' && !this.isMightyUnlocked()) {
          if (isStealth) {
            this.codeFeedback = '🔒 CLASSIFIED TOURNAMENT FIGHTER: LOCKED';
            this.codeFeedbackColor = '#ef4444';
          } else {
            this.codeFeedback = '🔒 M1GHTY RESTRICTED TO ADMINS! CLICK ADMIN PORTAL [A] TO LOG IN.';
            this.codeFeedbackColor = '#fbbf24';
            this.openAdminPortal();
          }
          return true;
        } else if (char.id === 'endless_dragon' && !this.isDragonUnlocked()) {
          try { soundFX.playBlock(); } catch (e) {}
          return true;
        }

        // Clicking an already-selected fighter instantly confirms
        if (wasAlreadySelected && onConfirm && (this.gameMode !== 'online' || this.localPlayerNum === 1)) {
          onConfirm();
        }
        return true;
      }
    }

    // Check Center Profile Panel click -> also confirms selection
    const px0 = 218, pw = W - 2 * px0, py0 = 62, ph0 = 176;
    if (x >= px0 && x <= px0 + pw && y >= py0 && y <= py0 + ph0) {
      if (this.gameMode !== 'online' || this.localPlayerNum === 1) {
        const lockedType = this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1);
        if (!lockedType && onConfirm) {
          onConfirm();
          return true;
        }
      }
    }

    // Check Bottom Start Battle Button
    const btnW = 380;
    const btnH = 34;
    const btnX = (W - btnW) / 2;
    const btnY = H - 38;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      if (this.gameMode !== 'online' || this.localPlayerNum === 1) {
        // Prevent starting if current selection is locked
        const lockedType = this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1);
        if (lockedType) {
          try { soundFX.playBlock(); } catch (e) {}
          if (lockedType === 'mighty') {
            if (isStealth) {
              this.codeFeedback = '🔒 CLASSIFIED TOURNAMENT FIGHTER: LOCKED';
              this.codeFeedbackColor = '#ef4444';
            } else {
              this.codeFeedback = '🔒 M1GHTY RESTRICTED TO ADMINS! CLICK ADMIN PORTAL [A] TO LOG IN.';
              this.codeFeedbackColor = '#fbbf24';
              this.openAdminPortal();
            }
          }
          return true;
        }
        if (onConfirm) onConfirm();
        return true;
      }
    }

    return false;
  }

  render(ctx, W, H) {
    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 4;
    }

    const mightyUnlocked = this.isMightyUnlocked();
    const dragonUnlocked = this.isDragonUnlocked();
    const hasBeatenDragon = this.hasBeatenDragon();

    const t = this.animTimer;

    // 1. Crimson tournament backdrop with spotlight + embers
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#12040a');
    bg.addColorStop(0.55, '#2a0a12');
    bg.addColorStop(1, '#070204');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const spot = ctx.createRadialGradient(W / 2, 150, 10, W / 2, 150, 260);
    spot.addColorStop(0, 'rgba(220, 38, 38, 0.28)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 28; i++) {
      const ex = (i * 67 + Math.sin(t * 0.02 + i) * 12 + W) % W;
      const ey = H - ((t * (0.35 + (i % 5) * 0.12) + i * 41) % H);
      ctx.globalAlpha = 0.2 + (i % 4) * 0.1;
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#f97316';
      ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Top bar
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, 38);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 38, W, 2);

    // Back button
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(12, 10, 98, 24);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(12.5, 10.5, 97, 23);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('< BACK [B]', 61, 25);

    // Admin Portal button (completely hidden in Steam stealth mode unless authenticated)
    const isStealth = isStealthMode() && !isAdminAuthenticated();
    if (!isStealth) {
      const codeBtnX = W - 158;
      const codeBtnW = 146;
      ctx.fillStyle = mightyUnlocked ? 'rgba(22, 101, 52, 0.9)' : 'rgba(69, 10, 10, 0.9)';
      ctx.fillRect(codeBtnX, 10, codeBtnW, 24);
      ctx.strokeStyle = mightyUnlocked ? '#22c55e' : '#dc2626';
      ctx.strokeRect(codeBtnX + 0.5, 10.5, codeBtnW - 1, 23);
      ctx.fillStyle = mightyUnlocked ? '#86efac' : '#fca5a5';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(mightyUnlocked ? '⚡ ADMIN ACTIVE [A]' : '🔒 ADMIN PORTAL [A]', codeBtnX + codeBtnW / 2, 25);
    }

    // Title
    ctx.fillStyle = '#facc15';
    ctx.font = '900 18px monospace';
    ctx.fillText(hasBeatenDragon ? 'CHOOSE YOUR FIGHTER  *' : 'CHOOSE YOUR FIGHTER', W / 2, 26);

    // Mode label
    const modeLabels = {
      campaign: 'CAMPAIGN  -  8 BOSSES & THE ENDLESS DRAGON',
      coop_campaign: 'CO-OP CAMPAIGN  -  ONLINE BOSS RAID',
      cpu: 'VS CPU  -  AI: ' + (this.cpuDifficulty || 'normal').toUpperCase(),
      '2p': 'LOCAL 2-PLAYER VERSUS',
      '2v2': '2V2 TEAM BRAWL',
      online: 'ONLINE VERSUS',
      training: 'TRAINING DOJO'
    };
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(modeLabels[this.gameMode] || modeLabels.campaign, W / 2, 52);

    const showP2 = ['2p', 'online', 'coop_campaign', 'cpu', '2v2', 'training'].includes(this.gameMode);
    const p2Controlled = ['2p', 'online', 'coop_campaign'].includes(this.gameMode);
    const lockedOf = (ch) => (ch.id === 'mighty' && !mightyUnlocked) || (ch.id === 'endless_dragon' && !dragonUnlocked);

    // 2. Big fighter showcases (P1 left, P2 right mirrored)
    const drawShowcase = (idx, cx, mirror, tag, tagColor) => {
      const ch = this.characters[idx];
      const locked = lockedOf(ch);
      const scale = 1.85;
      // platform glow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath(); ctx.ellipse(cx, 236, 62, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = tagColor; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, 236, 62, 9, 0, 0, Math.PI * 2); ctx.stroke();

      if (locked) {
        ctx.fillStyle = '#1f1620';
        ctx.fillRect(cx - 50, 100, 100, 130);
        ctx.fillStyle = '#6b7280';
        ctx.font = '900 64px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', cx, 190);
      } else {
        const sprites = this.previewSprites[ch.id];
        const frames = sprites?.idle || sprites?.IDLE || [];
        const img = frames[this.animFrame % (frames.length || 1)];
        if (img) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(cx, 238);
          if (mirror) ctx.scale(-1, 1);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -40, -88);
          ctx.restore();
        }
      }
      // name plate
      ctx.textAlign = 'center';
      ctx.fillStyle = tagColor;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(tag, cx, 66);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px monospace';
      ctx.fillText(locked ? '???' : ch.name, cx, 82);
      ctx.fillStyle = '#d6d3d1';
      ctx.font = '8px monospace';
      ctx.fillText(locked ? 'LOCKED' : ch.title, cx, 93);
    };

    let p1Tag = 'PLAYER 1', p2Tag = p2Controlled ? 'PLAYER 2' : 'CPU';
    if (this.gameMode === 'online') { p1Tag = this.localPlayerNum === 2 ? 'HOST' : 'YOU'; p2Tag = this.localPlayerNum === 2 ? 'YOU' : 'RIVAL'; }
    if (this.gameMode === 'coop_campaign') { p1Tag = this.localPlayerNum === 2 ? 'HOST' : 'YOU (P1)'; p2Tag = this.localPlayerNum === 2 ? 'YOU (ALLY)' : 'ALLY (P2)'; }
    drawShowcase(this.p1Index, 110, false, p1Tag, '#38bdf8');
    if (showP2 && this.gameMode !== 'campaign') drawShowcase(this.p2Index, W - 110, true, p2Tag, '#ef4444');
    else {
      ctx.fillStyle = '#7f1d1d'; ctx.font = '900 64px monospace'; ctx.textAlign = 'center';
      ctx.fillText('?', W - 110, 190);
      ctx.fillStyle = '#fca5a5'; ctx.font = 'bold 9px monospace'; ctx.fillText('BOSS RUSH AWAITS', W - 110, 82);
    }

    // 3. Centre profile panel for the fighter you are choosing right now
    const focusIdx = (this.gameMode === 'online' && this.localPlayerNum === 2) ? this.p2Index : this.p1Index;
    const fc = this.characters[focusIdx];
    const px0 = 218, pw = W - 2 * px0, py0 = 62;
    ctx.fillStyle = 'rgba(8, 3, 4, 0.82)';
    ctx.fillRect(px0, py0, pw, 176);
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1.5;
    ctx.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, 175);
    ctx.fillStyle = '#facc15'; ctx.textAlign = 'center';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FIGHTER PROFILE', W / 2, py0 + 13);
    if (lockedOf(fc)) {
      ctx.fillStyle = '#fde047'; ctx.font = 'bold 10px monospace';
      ctx.fillText(fc.id === 'mighty' ? 'CLASSIFIED ADMIN FIGHTER' : 'FINAL BOSS', W / 2, py0 + 55);
      ctx.fillStyle = '#f87171'; ctx.font = '9px monospace';
      ctx.fillText(fc.id === 'mighty' ? '🔒 RESTRICTED: ADMIN ACCESS ONLY' : 'BEAT THE ENDLESS DRAGON', W / 2, py0 + 75);
      ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
      ctx.fillText(fc.id === 'mighty' ? 'LOG IN VIA ADMIN PORTAL [A]' : 'IN CAMPAIGN TO UNLOCK', W / 2, py0 + 92);
    } else {
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px monospace';
      ctx.fillText(fc.name, W / 2, py0 + 28);
      const equippedSkinId = EconomyManager.getEquippedSkin(fc.id);
      if (equippedSkinId) {
        const skinObj = SKIN_CATALOG.find(s => s.id === equippedSkinId);
        ctx.fillStyle = skinObj ? skinObj.tierColor : '#38bdf8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(`★ SKIN: ${skinObj ? skinObj.name : equippedSkinId}`, W / 2, py0 + 38);
      }
      ctx.fillStyle = '#a8a29e'; ctx.font = '8px monospace';
      ctx.fillText(fc.style + ' - ' + fc.origin, W / 2, py0 + (equippedSkinId ? 48 : 42));
      const stat = (label, val, y) => {
        ctx.textAlign = 'left'; ctx.fillStyle = '#a8a29e'; ctx.font = 'bold 8px monospace';
        ctx.fillText(label, px0 + 14, y);
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i < val ? '#f59e0b' : '#3f2a2a';
          ctx.fillRect(px0 + 48 + i * 18, y - 7, 15, 7);
        }
      };
      stat('POWER', fc.power, py0 + 60);
      stat('SPEED', fc.speed, py0 + 74);
      stat('DEFEN', fc.defense, py0 + 88);
      ctx.textAlign = 'left';
      fc.specials.forEach((sp, i) => {
        const y = py0 + 108 + i * 19;
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 8px monospace';
        ctx.fillText('* ' + sp.name, px0 + 14, y);
        ctx.fillStyle = '#9ca3af'; ctx.font = '7px monospace';
        ctx.fillText(sp.cmd.split(' (')[0], px0 + 22, y + 9);
      });
      ctx.textAlign = 'center';
    }

    // 4. Roster grid (two rows of portrait tiles)
    const G = this.gridLayout(W);
    this.characters.forEach((char, idx) => {
      const col = idx % G.cols, row = Math.floor(idx / G.cols);
      const tx = G.x0 + col * (G.tileW + G.gap), ty = G.y0 + row * (G.tileH + G.gap);
      const locked = lockedOf(char);
      const isP1 = this.p1Index === idx;
      const isP2 = this.p2Index === idx && showP2 && this.gameMode !== 'campaign';

      ctx.fillStyle = locked ? '#120a12' : '#1a0b10';
      ctx.fillRect(tx, ty, G.tileW, G.tileH);
      if (locked) {
        ctx.fillStyle = '#4b5563'; ctx.font = '900 22px monospace'; ctx.textAlign = 'center';
        ctx.fillText('?', tx + G.tileW / 2, ty + 26);
      } else {
        const sprites = this.previewSprites[char.id];
        const frames = sprites?.idle || sprites?.IDLE || [];
        const img = frames[0];
        if (img) {
          ctx.save();
          ctx.beginPath(); ctx.rect(tx + 1, ty + 1, G.tileW - 2, G.tileH - 2); ctx.clip();
          ctx.drawImage(img, 19, 8, 42, 34, tx + 2, ty + 2, G.tileW - 4, G.tileH - 4);
          ctx.restore();
        }
        if (char.id === 'mighty' || char.id === 'endless_dragon') {
          ctx.fillStyle = char.id === 'mighty' ? 'rgba(250, 204, 21, 0.18)' : 'rgba(168, 85, 247, 0.2)';
          ctx.fillRect(tx, ty, G.tileW, G.tileH);
        }
      }
      ctx.strokeStyle = '#4a1d24'; ctx.lineWidth = 1;
      ctx.strokeRect(tx + 0.5, ty + 0.5, G.tileW - 1, G.tileH - 1);
      if (isP1 || isP2) {
        const pulse = 0.6 + Math.sin(t * 0.2) * 0.4;
        if (isP1) { ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.globalAlpha = pulse; ctx.strokeRect(tx - 1, ty - 1, G.tileW + 2, G.tileH + 2); ctx.globalAlpha = 1; }
        if (isP2) { ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.globalAlpha = isP1 ? 1 : pulse; ctx.strokeRect(tx + (isP1 ? 1 : -1), ty + (isP1 ? 1 : -1), G.tileW + (isP1 ? -2 : 2), G.tileH + (isP1 ? -2 : 2)); ctx.globalAlpha = 1; }
        ctx.font = 'bold 7px monospace'; ctx.textAlign = 'left';
        if (isP1) { ctx.fillStyle = '#0c4a6e'; ctx.fillRect(tx + 1, ty + 1, 12, 8); ctx.fillStyle = '#e0f2fe'; ctx.fillText('P1', tx + 2, ty + 8); }
        if (isP2) { ctx.fillStyle = '#7f1d1d'; ctx.fillRect(tx + G.tileW - 13, ty + 1, 12, 8); ctx.fillStyle = '#fee2e2'; ctx.fillText(p2Controlled ? 'P2' : 'CPU', tx + G.tileW - 12, ty + 8); }
        ctx.textAlign = 'center';
      }
    });
    // Interactive Start Button / Instructions Footer
    ctx.textAlign = 'center';
    const btnW = 360;
    const btnH = 26;
    const btnX = (W - btnW) / 2;
    const btnY = H - 33;

    const currentLocked = this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1);

    if (currentLocked === 'mighty') {
      ctx.fillStyle = 'rgba(120, 53, 15, 0.9)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('🔒 M1GHTY IS LOCKED! PRESS [A] FOR ADMIN PORTAL', W / 2, btnY + 17);
    } else if (currentLocked === 'dragon') {
      ctx.fillStyle = 'rgba(88, 28, 135, 0.9)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 10.5px monospace';
      ctx.fillText('🔒 DEFEAT THE ENDLESS DRAGON IN CAMPAIGN TO UNLOCK', W / 2, btnY + 17);
    } else if (this.gameMode === 'online' && this.localPlayerNum === 2) {
      const pulse = Math.floor(Date.now() / 350) % 2 === 0;
      ctx.fillStyle = pulse ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⏳ WAITING FOR HOST TO START THE BATTLE...', W / 2, btnY + 17);
    } else {
      ctx.fillStyle = 'rgba(22, 101, 52, 0.85)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px monospace';
      ctx.fillText((["cpu","2p","2v2","training"].includes(this.gameMode) ? '⚔️ CHOOSE STAGE [ENTER / CLICK]' : '⚔️ START BATTLE [ENTER / CLICK]') + '  |  [B / ESC] BACK', W / 2, btnY + 17);
    }

    // Floating Feedback Toast (if any)
    if (this.codeFeedback) {
      const fbW = 440;
      const fbH = 24;
      const fbX = (W - fbW) / 2;
      const fbY = H - 64;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillRect(fbX, fbY, fbW, fbH);
      ctx.strokeStyle = this.codeFeedbackColor || '#fde047';
      ctx.lineWidth = 1;
      ctx.strokeRect(fbX, fbY, fbW, fbH);
      ctx.fillStyle = this.codeFeedbackColor || '#fde047';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.codeFeedback, W / 2, fbY + 16);
    }

    ctx.textAlign = 'left';
  }
}
