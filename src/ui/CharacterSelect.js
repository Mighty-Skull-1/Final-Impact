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
      }
    ];

    this.stages = [
      { id: 'suzaku', name: 'SUZAKU ROOFTOP', location: 'Tokyo Sunset' },
      { id: 'neo_tokyo', name: 'NEO UNDERPASS', location: 'Cyberpunk District' },
      { id: 'thunder_dojo', name: 'THUNDER DOJO', location: 'Ancient Storm Hall' }
    ];

    this.p1Index = 0;
    this.p2Index = 1;
    this.stageIndex = 0;
    this.gameMode = 'cpu'; // 'cpu', '2p', 'training'
    this.p1Locked = false;
    this.p2Locked = false;
    this.animTimer = 0;
    this.animFrame = 0;

    // Cache sprites for previews
    this.previewSprites = {};
    this.characters.forEach(c => {
      this.previewSprites[c.id] = spriteGenerator.generateFighterSprites(c.id);
    });
  }

  handleInput(inputState, isP1 = true) {
    if (isP1) {
      if (!this.p1Locked) {
        if (inputState.left) {
          this.p1Index = (this.p1Index - 1 + this.characters.length) % this.characters.length;
          soundFX.playWhoosh('light');
        } else if (inputState.right) {
          this.p1Index = (this.p1Index + 1) % this.characters.length;
          soundFX.playWhoosh('light');
        }

        // Change mode with Up/Down
        if (inputState.up) {
          const modes = ['cpu', '2p', 'training'];
          const idx = (modes.indexOf(this.gameMode) - 1 + modes.length) % modes.length;
          this.gameMode = modes[idx];
          soundFX.playWhoosh('light');
        } else if (inputState.down) {
          const modes = ['cpu', '2p', 'training'];
          const idx = (modes.indexOf(this.gameMode) + 1) % modes.length;
          this.gameMode = modes[idx];
          soundFX.playWhoosh('light');
        }

        // Stage change with LK/HK
        if (inputState.lk) {
          this.stageIndex = (this.stageIndex + 1) % this.stages.length;
          soundFX.playWhoosh('light');
        }
      }
    }
  }

  render(ctx, W, H) {
    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 4;
    }

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

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('SELECT YOUR FIGHTER', W / 2, 34);

    // Game Mode Selector
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    const modeLabels = {
      cpu: 'MODE: ARCADE [VS CPU]  (Press W/S to change)',
      '2p': 'MODE: VERSUS [LOCAL 2-PLAYER]  (Press W/S to change)',
      training: 'MODE: TRAINING [PRACTICE]  (Press W/S to change)'
    };
    ctx.fillText(modeLabels[this.gameMode], W / 2, 54);

    // Stage Selector
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`STAGE: ${this.stages[this.stageIndex].name} - ${this.stages[this.stageIndex].location} (Press J to change)`, W / 2, 72);

    // 2. The 3 Character Cards
    const cardW = 180;
    const cardH = 220;
    const startX = (W - (cardW * 3 + 40)) / 2;
    const cardY = 86;

    this.characters.forEach((char, idx) => {
      const cx = startX + idx * (cardW + 20);
      const isP1Hover = this.p1Index === idx;
      const isP2Hover = this.p2Index === idx;

      // Card Background
      ctx.fillStyle = '#111827';
      ctx.fillRect(cx, cardY, cardW, cardH);

      // Card Border & Highlight
      if (isP1Hover) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 2, cardY - 2, cardW + 4, cardH + 4);
        // P1 Marker
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('PLAYER 1', cx + cardW / 2, cardY - 8);
      } else if (isP2Hover && this.gameMode === '2p') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 2, cardY - 2, cardW + 4, cardH + 4);
        // P2 Marker
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('PLAYER 2', cx + cardW / 2, cardY - 8);
      } else {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cardY, cardW, cardH);
      }

      // Fighter Animated Sprite Preview
      const sprites = this.previewSprites[char.id];
      const idleFrames = sprites?.IDLE || [];
      const frameImg = idleFrames[this.animFrame % idleFrames.length];
      if (frameImg) {
        ctx.drawImage(frameImg, cx + (cardW - 80) / 2, cardY + 12);
      }

      // Fighter Name & Bio
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(char.name, cx + cardW / 2, cardY + 115);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(char.title, cx + cardW / 2, cardY + 128);

      // Stat Bars
      const drawStat = (label, val, y) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(label, cx + 12, y);

        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i < val ? '#facc15' : '#334155';
          ctx.fillRect(cx + 64 + i * 20, y - 7, 16, 6);
        }
      };

      drawStat('PWR', char.power, cardY + 146);
      drawStat('SPD', char.speed, cardY + 160);
      drawStat('DEF', char.defense, cardY + 174);

      // Move list summary
      ctx.fillStyle = '#38bdf8';
      ctx.font = '8px monospace';
      ctx.fillText(`★ ${char.specials[0].name}: ${char.specials[0].cmd}`, cx + 8, cardY + 194);
      ctx.fillText(`★ ${char.specials[1].name}: ${char.specials[1].cmd}`, cx + 8, cardY + 208);
    });

    // Instructions Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('PRESS [ENTER] OR [SPACE] TO START THE BATTLE', W / 2, H - 20);

    ctx.textAlign = 'left';
  }
}
