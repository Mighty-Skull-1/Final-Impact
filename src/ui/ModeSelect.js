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
        description: 'Battle through 7 scaling crime bosses and face the 2-Phase Elden Ring Primeval Apex & Endless Dragon.',
        color: '#facc15'
      },
      {
        id: 'coop_campaign',
        badge: '2P CO-OP RAID',
        title: '🤝 CO-OP CAMPAIGN',
        subtitle: 'ONLINE 2-PLAYER BOSS RAID',
        description: 'Team up with an online friend to conquer all 8 campaign bosses together. Face 2v1 boss raids, 2v2 Bouncer Twins, and the Ascended Endless Dragon.',
        color: '#a855f7'
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
      },
      {
        id: 'shop',
        badge: 'CUSTOM SKINS',
        title: '🛍️ ITEM SHOP',
        subtitle: 'PREVIEW & EQUIP SKINS',
        description: 'Browse, unlock, and equip custom fighter skins with your earned tournament fight coins. Live animated character model preview.',
        color: '#eab308'
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

  // Layout constants (shared by click hit-testing and rendering)
  static get LIST() { return { x: 26, y: 52, w: 250, h: 30, gap: 3 }; }

  handleClick(x, y, onBack, onConfirm, W = 640) {
    // Back button (top-left)
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    const L = ModeSelect.LIST;
    if (x >= L.x && x <= L.x + L.w) {
      for (let idx = 0; idx < this.modes.length; idx++) {
        const cy = L.y + idx * (L.h + L.gap);
        if (y >= cy && y <= cy + L.h) {
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

    // Right-hand panel acts as a big confirm button
    if (x >= 296 && x <= W - 24 && y >= 62 && y <= 318) {
      if (onConfirm) onConfirm();
      return true;
    }
    return false;
  }

  wrapText(ctx, text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  render(ctx, W, H) {
    this.animTimer++;
    const t = this.animTimer;
    const cur = this.modes[this.selectedIndex];
    const pulse = Math.sin(t * 0.12) * 0.5 + 0.5;

    // 1. Blood-red temple background with a glow tinted by the selected mode
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1a0505');
    bg.addColorStop(0.6, '#2a0a0a');
    bg.addColorStop(1, '#050101');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.18 + pulse * 0.08;
    const glow = ctx.createRadialGradient(W * 0.68, H * 0.5, 10, W * 0.68, H * 0.5, 260);
    glow.addColorStop(0, cur.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // Rising embers
    for (let i = 0; i < 36; i++) {
      const ex = (i * 71 + Math.sin(t * 0.02 + i) * 14) % W;
      const ey = H - ((t * (0.4 + (i % 5) * 0.15) + i * 53) % H);
      ctx.globalAlpha = 0.25 + (i % 4) * 0.12;
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#f97316';
      ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Top & bottom banner bars
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, 44);
    ctx.fillRect(0, H - 26, W, 26);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 44, W, 2);
    ctx.fillRect(0, H - 28, W, 2);

    // Back button
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(12, 10, 98, 24);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(12.5, 10.5, 97, 23);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('< TITLE [B]', 61, 25);

    // Header
    ctx.fillStyle = '#facc15';
    ctx.font = '900 20px monospace';
    ctx.fillText('CHOOSE YOUR DESTINY', W / 2 + 10, 28);

    // 2. Left: stone plaque list
    const L = ModeSelect.LIST;
    this.modes.forEach((m, idx) => {
      const sel = idx === this.selectedIndex;
      const y = L.y + idx * (L.h + L.gap);
      const x = L.x + (sel ? 10 : 0);
      const w = L.w - (sel ? 10 : 0);

      ctx.fillStyle = sel ? 'rgba(127, 29, 29, 0.92)' : 'rgba(20, 8, 8, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w - 10, y);
      ctx.lineTo(x + w, y + L.h / 2);
      ctx.lineTo(x + w - 10, y + L.h);
      ctx.lineTo(x, y + L.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = sel ? m.color : '#3f1d1d';
      ctx.lineWidth = sel ? 2 : 1;
      ctx.stroke();

      if (sel) {
        ctx.fillStyle = m.color;
        ctx.fillRect(x - 8, y + 4, 4, L.h - 8);
      }

      // plain label: strip emoji lead from the title
      const label = m.title.replace(/^[^A-Za-z0-9]+/, '');
      ctx.textAlign = 'left';
      ctx.fillStyle = sel ? '#ffffff' : '#a8a29e';
      ctx.font = sel ? 'bold 12px monospace' : 'bold 11px monospace';
      ctx.fillText(label, x + 12, y + 15);
      ctx.fillStyle = sel ? m.color : '#78716c';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(m.badge, x + 12, y + 27);
    });

    // 3. Right: large info panel
    const px = 296, py = 62, pw = W - 24 - px, ph = 256;
    ctx.fillStyle = 'rgba(10, 3, 3, 0.88)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = cur.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 6, py + 6, pw - 12, ph - 12);

    // Giant faded kanji-style emblem behind the text
    ctx.globalAlpha = 0.10 + pulse * 0.05;
    ctx.fillStyle = cur.color;
    ctx.font = '900 150px serif';
    ctx.textAlign = 'center';
    ctx.fillText('龍', px + pw / 2, py + 175);
    ctx.globalAlpha = 1;

    ctx.fillStyle = cur.color;
    ctx.font = 'bold 10px monospace';
    ctx.fillText('~ ' + cur.badge + ' ~', px + pw / 2, py + 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px monospace';
    ctx.fillText(cur.title.replace(/^[^A-Za-z0-9]+/, ''), px + pw / 2, py + 58);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(cur.subtitle, px + pw / 2, py + 78);

    ctx.fillStyle = '#e7e5e4';
    ctx.font = '11px monospace';
    this.wrapText(ctx, cur.description, pw - 48).forEach((ln, i) => {
      ctx.fillText(ln, px + pw / 2, py + 108 + i * 16);
    });

    if (cur.id === 'cpu') {
      const d = this.currentDifficulty;
      ctx.fillStyle = d === 'hard' ? '#ef4444' : (d === 'normal' ? '#f59e0b' : '#22c55e');
      ctx.font = 'bold 13px monospace';
      ctx.fillText('<  DIFFICULTY: ' + d.toUpperCase() + '  >', px + pw / 2, py + ph - 62);
    }

    // FIGHT call-to-action
    if (Math.floor(t / 25) % 2 === 0) {
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('[ ENTER / CLICK ] TO ENTER', px + pw / 2, py + ph - 24);
    }

    // 4. Footer controls
    ctx.fillStyle = '#d6d3d1';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('W/S NAVIGATE   A/D DIFFICULTY   ENTER CONFIRM   B/ESC BACK', W / 2, H - 10);
    ctx.textAlign = 'left';
  }
}