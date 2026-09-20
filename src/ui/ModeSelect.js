// Final Impact - Mode Select Menu Screen
import { soundFX } from '../audio/SoundFX.js';

export class ModeSelect {
  constructor() {
    this.modes = [
      {
        id: 'campaign',
        badge: 'STORY MODE',
        title: '🏆 CAMPAIGN',
        subtitle: 'THE 7 UNDERGROUND BOSSES',
        description: 'Battle through 7 scaling urban crime bosses. Overcome corrupt armor, 2v1 brawls, and the brutal 2-Phase Elden Ring Primeval Apex final boss.',
        color: '#facc15'
      },
      {
        id: 'cpu',
        badge: 'SOLO BATTLE',
        title: '⚔️ 1V1 VS CPU',
        subtitle: 'ARCADE SINGLE MATCH',
        description: 'Classic 1v1 fighting game match against tactical AI. Choose your opponent, arena, and calibrate AI reaction speed.',
        color: '#38bdf8'
      },
      {
        id: '2p',
        badge: 'LOCAL VERSUS',
        title: '🥊 1V1 VS FRIEND',
        subtitle: 'COUCH 2-PLAYER VERSUS',
        description: 'Settle the score on one keyboard or twin gamepads. Player 1 (WASD + UIJK) vs Player 2 (Arrows + Numpad).',
        color: '#ec4899'
      },
      {
        id: '2v2',
        badge: 'SIMULTANEOUS',
        title: '🔥 2V2 TEAM BRAWL',
        subtitle: '4-FIGHTER TAG WAR',
        description: 'Two teams of two fighters battle simultaneously on screen with cel-shaded rim lighting, team pushboxes, and multi-target threat AI.',
        color: '#f97316'
      },
      {
        id: 'online',
        badge: 'NETPLAY P2P',
        title: '🌐 ONLINE VERSUS',
        subtitle: 'BATTLE A FRIEND VIA ROOM CODE',
        description: 'Connect directly with a friend online using zero-setup WebRTC peer-to-peer. Low-latency input streaming with room codes and instant invite links.',
        color: '#c084fc'
      },
      {
        id: 'training',
        badge: 'DOJO LAB',
        title: '🥋 PRACTICE MODE',
        subtitle: 'TRAINING & COMBO LAB',
        description: 'Unlimited health, infinite EX super gauge, and stamina. Master special moves, frame traps, cancel strings, and corner juggle combos.',
        color: '#4ade80'
      }
    ];

    this.selectedIndex = 0;
    this.difficultyOptions = ['easy', 'normal', 'hard'];
    this.difficultyIndex = 1; // 'normal'
    this.animTimer = 0;
  }

  get selectedMode() {
    return this.modes[this.selectedIndex].id;
  }

  get currentDifficulty() {
    return this.difficultyOptions[this.difficultyIndex];
  }

  handleInput(inputState) {
    if (inputState.up) {
      this.selectedIndex = (this.selectedIndex - 1 + this.modes.length) % this.modes.length;
      soundFX.playWhoosh('light');
    } else if (inputState.down) {
      this.selectedIndex = (this.selectedIndex + 1) % this.modes.length;
      soundFX.playWhoosh('light');
    }

    // Toggle CPU difficulty with Left / Right if 1v1 vs CPU is highlighted
    if (this.selectedMode === 'cpu') {
      if (inputState.left) {
        this.difficultyIndex = (this.difficultyIndex - 1 + this.difficultyOptions.length) % this.difficultyOptions.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyOptions.length;
        soundFX.playWhoosh('light');
      }
    }
  }

  handleClick(x, y, onBack, onConfirm, W = 640) {
    // Check Top-Left Back button
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    // Check Mode Cards
    const startY = 48;
    const cardH = 35;
    const cardGap = 5;
    const cardW = 540;
    const cardX = (W - cardW) / 2;

    if (x >= cardX && x <= cardX + cardW) {
      for (let idx = 0; idx < this.modes.length; idx++) {
        const cy = startY + idx * (cardH + cardGap);
        if (y >= cy && y <= cy + cardH) {
          if (this.selectedIndex === idx) {
            if (onConfirm) onConfirm();
          } else {
            this.selectedIndex = idx;
            soundFX.playWhoosh('light');
          }
          return true;
        }
      }
    }
    return false;
  }

  render(ctx, W, H) {
    this.animTimer++;

    // 1. Dark Neon Retro Grid Background
    ctx.fillStyle = '#070512';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#1e1338';
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

    // Top-Left Back Button: [ ⬅️ TITLE (B) ]
    ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
    ctx.fillRect(12, 10, 95, 22);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 10, 95, 22);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⬅️ TITLE [B]', 60, 24);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SELECT GAME MODE', W / 2, 26);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CHOOSE YOUR DISCIPLINE FOR THE CONCRETE ARENA', W / 2, 40);

    // 2. Mode Cards Layout
    const startY = 48;
    const cardH = 35;
    const cardGap = 5;
    const cardW = 540;
    const cardX = (W - cardW) / 2;

    this.modes.forEach((m, idx) => {
      const isSelected = idx === this.selectedIndex;
      const y = startY + idx * (cardH + cardGap);

      // Card Background
      if (isSelected) {
        ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
        ctx.fillRect(cardX, y, cardW, cardH);

        // Animated Neon Glowing Border
        const pulse = Math.sin(this.animTimer * 0.15) * 0.5 + 0.5;
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(cardX, y, cardW, cardH);

        // Neon side indicator bar
        ctx.fillStyle = m.color;
        ctx.fillRect(cardX, y, 6, cardH);

        // Little arrow cursor
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('▶', cardX - 8, y + cardH / 2 + 5);
      } else {
        ctx.fillStyle = 'rgba(15, 12, 30, 0.65)';
        ctx.fillRect(cardX, y, cardW, cardH);
        ctx.strokeStyle = '#272044';
        ctx.lineWidth = 1;
        ctx.strokeRect(cardX, y, cardW, cardH);
      }

      // Badge
      ctx.textAlign = 'left';
      ctx.fillStyle = isSelected ? m.color : '#64748b';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`[ ${m.badge} ]`, cardX + 16, y + 12);

      // Title
      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = isSelected ? 'bold 13px monospace' : '12px monospace';
      ctx.fillText(m.title, cardX + 16, y + 27);

      // Subtitle / Difficulty on Right
      if (m.id === 'cpu') {
        const diffColor = this.currentDifficulty === 'hard' ? '#ef4444' : (this.currentDifficulty === 'normal' ? '#f59e0b' : '#22c55e');
        ctx.textAlign = 'right';
        ctx.fillStyle = diffColor;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`DIFFICULTY: ◄ ${this.currentDifficulty.toUpperCase()} ►`, cardX + cardW - 14, y + 22);
      } else {
        ctx.textAlign = 'right';
        ctx.fillStyle = isSelected ? '#38bdf8' : '#475569';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(m.subtitle, cardX + cardW - 14, y + 22);
      }
    });

    // 3. Selected Mode Description Box
    const descY = H - 62;
    const current = this.modes[this.selectedIndex];
    ctx.fillStyle = 'rgba(10, 8, 22, 0.9)';
    ctx.fillRect(cardX, descY, cardW, 34);
    ctx.strokeStyle = '#332a58';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, descY, cardW, 34);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px monospace';
    ctx.fillText(current.description, W / 2, descY + 21);

    // 4. Controls Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('▲/▼ [W/S] NAVIGATE    ◄/► [A/D] DIFFICULTY    [ENTER/SPACE] CONFIRM    [B / ESC] BACK', W / 2, H - 10);
  }
}
