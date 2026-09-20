// Final Impact - Character Select Screen
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';

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
      }
    ];

    this.stages = [
      { id: 'suzaku', name: 'SUZAKU ROOFTOP', location: 'Tokyo Sunset' },
      { id: 'neo_tokyo', name: 'NEO UNDERPASS', location: 'Cyberpunk District' },
      { id: 'thunder_dojo', name: 'THUNDER DOJO', location: 'Ancient Storm Hall' },
      { id: 'dragon_shrine', name: 'DRAGON SHRINE', location: 'Crimson Twilight' }
    ];

    this.p1Index = 0;
    this.p2Index = 1;
    this.stageIndex = 0;
    this.gameMode = 'campaign'; // 'campaign', 'cpu', '2p', '2v2', 'training'
    this.cpuDifficulty = 'normal';
    this.localPlayerNum = 1;
    this.p1Locked = false;
    this.p2Locked = false;
    this.animTimer = 0;
    this.animFrame = 0;

    // Secret code modal state
    this.showCodeModal = false;
    this.enteredCode = '';
    this.codeFeedback = '';
    this.codeFeedbackColor = '#38bdf8';

    // Cache sprites for previews
    this.previewSprites = {};
    this.characters.forEach(c => {
      this.previewSprites[c.id] = spriteGenerator.generateFighterSprites(c.id);
    });
  }

  isMightyUnlocked() {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_unlocked_mighty') === 'true';
    } catch (e) {
      return false;
    }
  }

  unlockMighty() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_unlocked_mighty', 'true');
      }
      if (!this.previewSprites['mighty']) {
        this.previewSprites['mighty'] = spriteGenerator.generateFighterSprites('mighty');
      }
    } catch (e) {}
  }

  lockMighty() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('final_impact_unlocked_mighty');
      }
    } catch (e) {}
  }

  openCodeModal() {
    this.showCodeModal = true;
    this.enteredCode = '';
    this.codeFeedback = '';
    try { soundFX.playMenuSelect(); } catch (e) {}
  }

  closeCodeModal() {
    this.showCodeModal = false;
    this.enteredCode = '';
    this.codeFeedback = '';
  }

  handleChar(char) {
    if (this.enteredCode.length < 12 && /^[a-zA-Z0-9_]$/.test(char)) {
      this.enteredCode = (this.enteredCode + char).toUpperCase();
      try { soundFX.playWhoosh('light'); } catch (e) {}
    }
  }

  handleBackspace() {
    if (this.enteredCode.length > 0) {
      this.enteredCode = this.enteredCode.slice(0, -1);
      try { soundFX.playWhoosh('light'); } catch (e) {}
    }
  }

  submitCode() {
    const code = this.enteredCode.trim().toUpperCase();
    if (code === 'M1GHTY') {
      this.unlockMighty();
      this.codeFeedback = '✨ CODE ACCEPTED! M1GHTY UNLOCKED! ✨';
      this.codeFeedbackColor = '#4ade80';
      try { soundFX.playUltimateActivation(); } catch (e) {}
      setTimeout(() => {
        this.closeCodeModal();
      }, 1200);
    } else {
      this.codeFeedback = '❌ INVALID CODE. TRY AGAIN.';
      this.codeFeedbackColor = '#ef4444';
      try { soundFX.playBlock(); } catch (e) {}
    }
  }

  isCurrentSelectionLocked(isP1 = true) {
    const idx = isP1 ? this.p1Index : this.p2Index;
    const char = this.characters[idx];
    return char && char.id === 'mighty' && !this.isMightyUnlocked();
  }

  setMode(mode, difficulty = 'normal', localPlayerNum = 1) {
    this.gameMode = mode;
    this.cpuDifficulty = difficulty;
    this.localPlayerNum = localPlayerNum;
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

      // Stage change with Up / Down
      if (inputState.up || inputState.down || inputState.lk) {
        this.stageIndex = (this.stageIndex + 1) % this.stages.length;
        soundFX.playWhoosh('light');
      }
    } else {
      // Player 2 selection in 2P mode
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
    // If Secret Code Modal is open, handle its clicks
    if (this.showCodeModal) {
      const modalX = 140;
      const modalY = 80;
      const modalW = 360;
      const modalH = 200;

      // Close button (X) in top right of modal
      if (x >= modalX + modalW - 28 && x <= modalX + modalW - 6 && y >= modalY + 6 && y <= modalY + 28) {
        this.closeCodeModal();
        try { soundFX.playWhoosh('light'); } catch (e) {}
        return true;
      }

      // Input box click (allows browser prompt fallback)
      if (x >= modalX + 30 && x <= modalX + modalW - 30 && y >= modalY + 70 && y <= modalY + 110) {
        try {
          const res = window.prompt('Enter secret unlock code (e.g. M1GHTY):', this.enteredCode);
          if (res !== null) {
            this.enteredCode = res.trim().toUpperCase();
            this.submitCode();
          }
        } catch (e) {}
        return true;
      }

      // UNLOCK Button
      if (x >= modalX + 45 && x <= modalX + 165 && y >= modalY + 145 && y <= modalY + 175) {
        this.submitCode();
        return true;
      }

      // CANCEL Button
      if (x >= modalX + 195 && x <= modalX + 315 && y >= modalY + 145 && y <= modalY + 175) {
        this.closeCodeModal();
        try { soundFX.playWhoosh('light'); } catch (e) {}
        return true;
      }

      // Click outside modal closes it
      if (x < modalX || x > modalX + modalW || y < modalY || y > modalY + modalH) {
        this.closeCodeModal();
        return true;
      }

      return true;
    }

    // Top-Left Back button
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    // Top-Right Secret Code Button: [ 🔑 ENTER CODE (C) ]
    if (x >= W - 150 && x <= W - 12 && y >= 10 && y <= 34) {
      this.openCodeModal();
      return true;
    }

    // Check Stage selector bar
    if (y >= 54 && y <= 76 && x >= 150 && x <= 490) {
      this.stageIndex = (this.stageIndex + 1) % this.stages.length;
      soundFX.playWhoosh('light');
      return true;
    }

    // Check Character Cards (7 cards total)
    const cardW = 82;
    const cardH = 224;
    const gap = 6;
    const totalCardsW = this.characters.length * cardW + (this.characters.length - 1) * gap;
    const startX = (W - totalCardsW) / 2;
    const cardY = 80;

    if (y >= cardY && y <= cardY + cardH) {
      for (let idx = 0; idx < this.characters.length; idx++) {
        const cx = startX + idx * (cardW + gap);
        if (x >= cx && x <= cx + cardW) {
          const char = this.characters[idx];
          if (this.gameMode === 'online' && this.localPlayerNum === 2) {
            this.p2Index = idx;
          } else {
            this.p1Index = idx;
          }
          soundFX.playWhoosh('light');

          // If clicking locked Mighty, open the secret code modal!
          if (char.id === 'mighty' && !this.isMightyUnlocked()) {
            this.openCodeModal();
          }
          return true;
        }
      }
    }

    // Check Bottom Start Battle Button
    const btnW = 340;
    const btnH = 28;
    const btnX = (W - btnW) / 2;
    const btnY = H - 34;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      if (this.gameMode !== 'online' || this.localPlayerNum === 1) {
        // Prevent starting if current selection is locked
        if (this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1)) {
          try { soundFX.playBlock(); } catch (e) {}
          this.openCodeModal();
          this.codeFeedback = '🔒 M1GHTY IS LOCKED! ENTER CODE TO UNLOCK.';
          this.codeFeedbackColor = '#fbbf24';
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

    // 1. Arcade Background with grid
    ctx.fillStyle = '#090a15';
    ctx.fillRect(0, 0, W, H);

    // Glowing retro grid lines
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Top-Left Back Button: [ ⬅️ BACK (B) ]
    ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
    ctx.fillRect(12, 10, 95, 22);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 10, 95, 22);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⬅️ BACK [B]', 60, 24);

    // Top-Right Secret Code Button: [ 🔑 ENTER CODE (C) ]
    const codeBtnX = W - 148;
    const codeBtnW = 136;
    ctx.fillStyle = mightyUnlocked ? 'rgba(22, 101, 52, 0.85)' : 'rgba(120, 53, 15, 0.85)';
    ctx.fillRect(codeBtnX, 10, codeBtnW, 22);
    ctx.strokeStyle = mightyUnlocked ? '#22c55e' : '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(codeBtnX, 10, codeBtnW, 22);

    ctx.fillStyle = mightyUnlocked ? '#86efac' : '#fde047';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(mightyUnlocked ? '👑 M1GHTY UNLOCKED' : '🔑 SECRET CODE [C]', codeBtnX + codeBtnW / 2, 24);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SELECT YOUR FIGHTER', W / 2, 30);

    // Active Game Mode Display
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    const modeLabels = {
      campaign: '🏆 MODE: CAMPAIGN (8 Scaling Bosses & The Endless Dragon)',
      cpu: `⚔️ MODE: 1V1 VS CPU (AI Difficulty: ${(this.cpuDifficulty || 'normal').toUpperCase()})`,
      '2p': '🥊 MODE: 1V1 LOCAL 2-PLAYER VERSUS',
      '2v2': '🔥 MODE: 2V2 SIMULTANEOUS TEAM BRAWL',
      online: '🌐 MODE: ONLINE VERSUS (P2P WEBRTC NETPLAY)',
      training: '🥋 MODE: PRACTICE / TRAINING DOJO'
    };
    ctx.fillText(modeLabels[this.gameMode] || modeLabels.campaign, W / 2, 48);

    // Stage Selector & Navigation instructions
    ctx.fillStyle = '#ec4899';
    ctx.font = '10.5px monospace';
    ctx.fillText(`STAGE: ${this.stages[this.stageIndex].name}  [↑/↓ STAGE]  [A/D CHOOSE]  [C CODE]  [ENTER START]`, W / 2, 66);

    // 2. Character Cards (7 Fighters Roster)
    const cardW = 82;
    const cardH = 224;
    const gap = 6;
    const totalCardsW = this.characters.length * cardW + (this.characters.length - 1) * gap;
    const startX = (W - totalCardsW) / 2;
    const cardY = 78;

    this.characters.forEach((char, idx) => {
      const cx = startX + idx * (cardW + gap);
      const isP1Hover = this.p1Index === idx;
      const isP2Hover = this.p2Index === idx;
      const isSecretLocked = char.id === 'mighty' && !mightyUnlocked;

      // Card Background
      ctx.fillStyle = isSecretLocked ? '#0b0f19' : (char.id === 'mighty' ? '#1c1917' : '#111827');
      ctx.fillRect(cx, cardY, cardW, cardH);

      // Card Border & Highlight
      if (isP1Hover && isP2Hover && (this.gameMode === '2p' || this.gameMode === 'online')) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 2, cardY - 2, cardW + 4, cardH + 4);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('P1 & P2', cx + cardW / 2, cardY - 5);
      } else if (isP1Hover) {
        ctx.strokeStyle = isSecretLocked ? '#f59e0b' : (char.id === 'mighty' ? '#fbbf24' : '#38bdf8');
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 2, cardY - 2, cardW + 4, cardH + 4);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = 'bold 10px monospace';
        const p1Tag = this.gameMode === 'online' ? (this.localPlayerNum === 2 ? 'HOST' : 'YOU') : 'P1';
        ctx.fillText(p1Tag, cx + cardW / 2, cardY - 5);
      } else if (isP2Hover && (this.gameMode === '2p' || this.gameMode === 'online')) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 2, cardY - 2, cardW + 4, cardH + 4);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px monospace';
        const p2Tag = this.gameMode === 'online' ? (this.localPlayerNum === 2 ? 'YOU' : 'RIVAL') : 'P2';
        ctx.fillText(p2Tag, cx + cardW / 2, cardY - 5);
      } else {
        ctx.strokeStyle = isSecretLocked ? '#78350f' : (char.id === 'mighty' ? '#b45309' : '#334155');
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cardY, cardW, cardH);
      }

      if (isSecretLocked) {
        // Locked Card Rendering
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(cx + 2, cardY + 2, cardW - 4, cardH - 4);

        // Lock icon
        ctx.textAlign = 'center';
        ctx.font = '32px monospace';
        ctx.fillText('🔒', cx + cardW / 2, cardY + 58);

        // Status text
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('LOCKED', cx + cardW / 2, cardY + 84);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '7.5px monospace';
        ctx.fillText('SECRET FIGHTER', cx + cardW / 2, cardY + 98);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('M1GHTY', cx + cardW / 2, cardY + 116);

        // Code Box Button prompt
        ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
        ctx.fillRect(cx + 6, cardY + 135, cardW - 12, 45);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 6, cardY + 135, cardW - 12, 45);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText('ENTER CODE:', cx + cardW / 2, cardY + 150);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('"M1GHTY"', cx + cardW / 2, cardY + 162);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '6.5px monospace';
        ctx.fillText('PRESS [C] / CLICK', cx + cardW / 2, cardY + 173);

        ctx.fillStyle = '#64748b';
        ctx.font = '7px monospace';
        ctx.fillText('1-HIT KO GOD', cx + cardW / 2, cardY + 205);
        ctx.restore();
      } else {
        // Unlocked Fighter Sprite Preview
        const sprites = this.previewSprites[char.id];
        const idleFrames = sprites?.idle || sprites?.IDLE || [];
        const frameImg = idleFrames[this.animFrame % (idleFrames.length || 1)];
        if (frameImg) {
          ctx.drawImage(frameImg, cx + (cardW - 80) / 2, cardY + 8);
        }

        // God aura particle effect on card for Mighty
        if (char.id === 'mighty') {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
          ctx.fillRect(cx + 2, cardY + 2, cardW - 4, cardH - 4);
        }

        // Fighter Name & Bio
        ctx.textAlign = 'center';
        ctx.fillStyle = char.id === 'mighty' ? '#fde047' : '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(char.name, cx + cardW / 2, cardY + 104);

        ctx.fillStyle = char.id === 'mighty' ? '#facc15' : '#94a3b8';
        ctx.font = '7px monospace';
        ctx.fillText(char.title, cx + cardW / 2, cardY + 116);

        // Stat Bars
        const drawStat = (label, val, y) => {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 7px monospace';
          ctx.fillText(label, cx + 5, y);

          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i < val ? (char.id === 'mighty' ? '#f59e0b' : '#facc15') : '#334155';
            ctx.fillRect(cx + 28 + i * 9, y - 5, 7, 4);
          }
        };

        drawStat('PWR', char.power, cardY + 130);
        drawStat('SPD', char.speed, cardY + 141);
        drawStat('DEF', char.defense, cardY + 152);

        // Move list summary
        ctx.textAlign = 'left';
        ctx.fillStyle = char.id === 'mighty' ? '#fbbf24' : '#38bdf8';
        ctx.font = '6.5px monospace';
        ctx.fillText(`★ ${char.specials[0].name}`, cx + 4, cardY + 170);
        ctx.fillStyle = '#64748b';
        ctx.fillText(`  ${char.specials[0].cmd.split(' (')[0]}`, cx + 4, cardY + 180);

        ctx.fillStyle = char.id === 'mighty' ? '#fbbf24' : '#38bdf8';
        ctx.fillText(`★ ${char.specials[1].name}`, cx + 4, cardY + 194);
        ctx.fillStyle = '#64748b';
        ctx.fillText(`  ${char.specials[1].cmd.split(' (')[0]}`, cx + 4, cardY + 204);

        if (char.id === 'mighty') {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('⚡ 1-HIT OBLITERATION ⚡', cx + cardW / 2, cardY + 218);
        }
      }
    });

    // Interactive Start Button / Instructions Footer
    ctx.textAlign = 'center';
    const btnW = 360;
    const btnH = 26;
    const btnX = (W - btnW) / 2;
    const btnY = H - 33;

    const currentLocked = this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1);

    if (currentLocked) {
      ctx.fillStyle = 'rgba(120, 53, 15, 0.9)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('🔒 M1GHTY IS LOCKED! PRESS [C] TO ENTER UNLOCK CODE', W / 2, btnY + 17);
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
      ctx.fillText('⚔️ START BATTLE [ENTER / CLICK]  |  [B / ESC] BACK', W / 2, btnY + 17);
    }

    // 3. Secret Code In-Canvas Modal Overlay
    if (this.showCodeModal) {
      ctx.save();
      // Dimmed backdrop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, 0, W, H);

      const modalX = 140;
      const modalY = 75;
      const modalW = 360;
      const modalH = 205;

      // Outer gold box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(modalX, modalY, modalW, modalH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(modalX, modalY, modalW, modalH);

      // Inner accent frame
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8);

      // Close button (X)
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('✕', modalX + modalW - 18, modalY + 22);

      // Modal Title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('🔑 SECRET CHARACTER UNLOCK', modalX + modalW / 2, modalY + 30);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Enter the divine secret code to unlock M1GHTY', modalX + modalW / 2, modalY + 50);

      // Input Field Box
      const inputX = modalX + 35;
      const inputY = modalY + 68;
      const inputW = modalW - 70;
      const inputH = 36;

      ctx.fillStyle = '#020617';
      ctx.fillRect(inputX, inputY, inputW, inputH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(inputX, inputY, inputW, inputH);

      // Display entered text with blinking cursor
      const cursor = Math.floor(Date.now() / 400) % 2 === 0 ? '_' : ' ';
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 16px monospace';
      const displayCode = (this.enteredCode || '') + cursor;
      ctx.fillText(displayCode, modalX + modalW / 2, inputY + 24);

      // Instruction
      ctx.fillStyle = '#64748b';
      ctx.font = '8.5px monospace';
      ctx.fillText('TYPE ON YOUR KEYBOARD (OR CLICK TO PROMPT)', modalX + modalW / 2, modalY + 120);

      // Feedback Message
      if (this.codeFeedback) {
        ctx.fillStyle = this.codeFeedbackColor || '#fde047';
        ctx.font = 'bold 10.5px monospace';
        ctx.fillText(this.codeFeedback, modalX + modalW / 2, modalY + 138);
      }

      // Buttons: UNLOCK and CANCEL
      const btnYW = modalY + 152;

      // UNLOCK Button
      ctx.fillStyle = 'rgba(22, 101, 52, 0.95)';
      ctx.fillRect(modalX + 45, btnYW, 115, 28);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(modalX + 45, btnYW, 115, 28);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('UNLOCK [ENTER]', modalX + 102, btnYW + 18);

      // CANCEL Button
      ctx.fillStyle = 'rgba(71, 85, 105, 0.85)';
      ctx.fillRect(modalX + 195, btnYW, 115, 28);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(modalX + 195, btnYW, 115, 28);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText('CANCEL [ESC]', modalX + 252, btnYW + 18);

      ctx.restore();
    }

    ctx.textAlign = 'left';
  }
}
