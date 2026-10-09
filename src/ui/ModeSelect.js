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
        description: 'Battle through 7 scaling crime bosses and face the 2-Phase Primeval Apex & Endless Dragon.',
        color: '#facc15'
      },
      {
        id: 'coop_campaign',
        badge: '2P CO-OP RAID',
        title: '🤝 CO-OP CAMPAIGN',
        subtitle: 'ONLINE 2-PLAYER BOSS RAID',
        description: 'Team up with an online friend to conquer all 8 campaign bosses together in simultaneous 2v1 and 2v2 boss battles.',
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
        description: 'Two teams of two battle simultaneously on-screen with cel-shaded rim lighting and team pushboxes.',
        color: '#f97316'
      },
      {
        id: 'online',
        badge: 'NETPLAY P2P',
        title: '🌐 ONLINE VERSUS',
        subtitle: 'BATTLE A FRIEND VIA ROOM CODE',
        description: 'Connect directly with a friend online using zero-setup WebRTC peer-to-peer. Low-latency input streaming with room codes.',
        color: '#c084fc'
      },
      {
        id: 'training',
        badge: 'DOJO LAB',
        title: '🥋 PRACTICE MODE',
        subtitle: 'TRAINING & COMBO LAB',
        description: 'Unlimited health, infinite EX super gauge, and stamina. Master special moves, frame traps, and cancel strings.',
        color: '#4ade80'
      },
      {
        id: 'shop',
        badge: 'CUSTOM SKINS',
        title: '🛍️ ITEM SHOP',
        subtitle: 'PREVIEW & EQUIP SKINS',
        description: 'Browse, unlock, and equip custom fighter skins, auras, hitsparks, and titles with your earned tournament fight coins.',
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

  // Spacious layout constants across full vertical height (H=360, usable: 48 to 330)
  static get LIST() { return { x: 18, y: 48, w: 256, h: 32, gap: 3.5 }; }

  handleClick(x, y, onBack, onConfirm, W = 640) {
    // 1. Back button (top-left)
    if (x >= 10 && x <= 125 && y >= 6 && y <= 38) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    // 2. Left buttons list hit testing (generous hit boundaries)
    const L = ModeSelect.LIST;
    if (x >= 12 && x <= L.x + L.w + 20) {
      for (let idx = 0; idx < this.modes.length; idx++) {
        const cy = L.y + idx * (L.h + L.gap);
        if (y >= cy - 1 && y <= cy + L.h + L.gap) {
          const wasSelected = (this.selectedIndex === idx);
          this.selectedIndex = idx;
          soundFX.playWhoosh('light');
          if (wasSelected) {
            // Second click on already-highlighted item immediately launches!
            soundFX.playGong();
            if (onConfirm) onConfirm();
          }
          return true;
        }
      }
    }

    // 3. Right-hand panel & Start Button clicks
    const px = 286, py = 48, pw = W - 18 - px, ph = 282;
    if (x >= px && x <= px + pw && y >= py && y <= py + ph) {
      // Check if clicking difficulty arrows in 1v1 CPU
      if (this.selectedMode === 'cpu' && y >= py + ph - 85 && y <= py + ph - 52) {
        if (x < px + pw / 2) {
          this.difficultyIndex = (this.difficultyIndex - 1 + this.difficultyOptions.length) % this.difficultyOptions.length;
        } else {
          this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyOptions.length;
        }
        soundFX.playWhoosh('light');
        return true;
      }

      // Any click on the right action card launches the selected mode!
      soundFX.playGong();
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

    // 1. Blood-red temple background with ambient tinting
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#150303');
    bg.addColorStop(0.55, '#220808');
    bg.addColorStop(1, '#050101');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.16 + pulse * 0.08;
    const glow = ctx.createRadialGradient(W * 0.70, H * 0.5, 10, W * 0.70, H * 0.5, 280);
    glow.addColorStop(0, cur.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // Rising atmospheric embers
    for (let i = 0; i < 30; i++) {
      const ex = (i * 73 + Math.sin(t * 0.02 + i) * 14) % W;
      const ey = H - ((t * (0.4 + (i % 5) * 0.14) + i * 53) % H);
      ctx.globalAlpha = 0.22 + (i % 4) * 0.10;
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#f97316';
      ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Top & bottom banner bars
    ctx.fillStyle = '#0a0101';
    ctx.fillRect(0, 0, W, 42);
    ctx.fillRect(0, H - 26, W, 26);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 42, W, 2);
    ctx.fillRect(0, H - 28, W, 2);

    // Top-left Back button
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(12, 8, 102, 26);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(12.5, 8.5, 101, 25);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('< TITLE [B]', 63, 24);

    // Header Title
    ctx.fillStyle = '#facc15';
    ctx.font = '900 18px monospace';
    ctx.fillText('CHOOSE YOUR DESTINY', W / 2 + 10, 26);

    // 2. Left: Spacious Mode Plaque List
    const L = ModeSelect.LIST;
    this.modes.forEach((m, idx) => {
      const sel = idx === this.selectedIndex;
      const y = L.y + idx * (L.h + L.gap);
      const x = L.x + (sel ? 8 : 0);
      const w = L.w - (sel ? 8 : 0);

      // Card background
      ctx.fillStyle = sel ? 'rgba(127, 29, 29, 0.95)' : 'rgba(20, 8, 8, 0.82)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w - 12, y);
      ctx.lineTo(x + w, y + L.h / 2);
      ctx.lineTo(x + w - 12, y + L.h);
      ctx.lineTo(x, y + L.h);
      ctx.closePath();
      ctx.fill();

      // Border outline
      ctx.strokeStyle = sel ? m.color : '#3f1d1d';
      ctx.lineWidth = sel ? 2 : 1;
      ctx.stroke();

      // Active selection indicator bar on left
      if (sel) {
        ctx.fillStyle = m.color;
        ctx.fillRect(x - 6, y + 3, 4, L.h - 6);
      }

      // Main mode title (e.g. CAMPAIGN)
      const label = m.title.replace(/^[^A-Za-z0-9]+/, '');
      ctx.textAlign = 'left';
      ctx.fillStyle = sel ? '#ffffff' : '#a8a29e';
      ctx.font = sel ? 'bold 12px monospace' : 'bold 11px monospace';
      ctx.fillText(label, x + 14, y + 14);

      // Sub-badge pill (e.g. STORY MODE)
      ctx.fillStyle = sel ? m.color : '#78716c';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(m.badge, x + 14, y + 26);
    });

    // 3. Right: Large Information & Action Card
    const px = 286, py = 48, pw = W - 18 - px, ph = 282;
    ctx.fillStyle = 'rgba(10, 3, 3, 0.92)';
    ctx.fillRect(px, py, pw, ph);

    // Dynamic border tinted by selected mode color
    ctx.strokeStyle = cur.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    // Gold inner ornamental frame
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10);

    // Faded dragon emblem watermark behind text
    ctx.globalAlpha = 0.10 + pulse * 0.05;
    ctx.fillStyle = cur.color;
    ctx.font = '900 160px serif';
    ctx.textAlign = 'center';
    ctx.fillText('龍', px + pw / 2, py + 185);
    ctx.globalAlpha = 1;

    // Mode Tagline & Pill
    ctx.fillStyle = cur.color;
    ctx.font = 'bold 9px monospace';
    ctx.fillText('~ ' + cur.badge + ' ~', px + pw / 2, py + 26);

    // Big Mode Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px monospace';
    ctx.fillText(cur.title.replace(/^[^A-Za-z0-9]+/, ''), px + pw / 2, py + 50);

    // Subtitle in warm amber
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText(cur.subtitle, px + pw / 2, py + 68);

    // Subtle divider line
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
    ctx.beginPath();
    ctx.moveTo(px + 24, py + 78);
    ctx.lineTo(px + pw - 24, py + 78);
    ctx.stroke();

    // Mode Description (spaced comfortably)
    ctx.fillStyle = '#e7e5e4';
    ctx.font = '11px monospace';
    this.wrapText(ctx, cur.description, pw - 36).forEach((ln, i) => {
      ctx.fillText(ln, px + pw / 2, py + 100 + i * 18);
    });

    // Special Section: Campaign Boss Rush Preview
    if (cur.id === 'campaign') {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
      ctx.fillRect(px + 16, py + 148, pw - 32, 60);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 16, py + 148, pw - 32, 60);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('⚔️ CAMPAIGN CHAPTER ROADMAP (8 BOSSES):', px + pw / 2, py + 162);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText('1: SGT. VANCE  ➔  2: PROMOTER  ➔  3: BOUNCER TWINS', px + pw / 2, py + 178);
      ctx.fillText('4: MATRIARCH  ➔  5: STREET LORD  ➔  6: URBAN LEGEND', px + pw / 2, py + 190);
      ctx.fillText('7: THE CHAMPION  ➔  8: PRIMEVAL ENDLESS DRAGON 🐉', px + pw / 2, py + 201);
    }

    // Special Section: CPU Difficulty Selector
    if (cur.id === 'cpu') {
      const d = this.currentDifficulty;
      const dColor = d === 'hard' ? '#ef4444' : (d === 'normal' ? '#f59e0b' : '#22c55e');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(px + 20, py + ph - 88, pw - 40, 26);
      ctx.strokeStyle = dColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 20, py + ph - 88, pw - 40, 26);
      ctx.fillStyle = dColor;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('◀  DIFFICULTY: ' + d.toUpperCase() + '  ▶', px + pw / 2, py + ph - 71);
    }

    // Prominent Action Button: [ ▶ START (CLICK OR ENTER) ]
    const btnW = pw - 32;
    const btnH = 34;
    const btnX = px + 16;
    const btnY = py + ph - 44;

    const btnPulse = Math.floor(t / 25) % 2 === 0;
    ctx.fillStyle = btnPulse ? 'rgba(185, 28, 28, 0.9)' : 'rgba(153, 27, 27, 0.85)';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    const actionVerb = cur.id === 'shop' ? 'ENTER ITEM SHOP' : `START ${cur.title.replace(/^[^A-Za-z0-9]+/, '')}`;
    ctx.fillText(`▶  ${actionVerb}  [ENTER / CLICK]`, px + pw / 2, btnY + 22);

    // 4. Footer controls
    ctx.fillStyle = '#d6d3d1';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('W/S NAVIGATE   A/D DIFFICULTY   ENTER CONFIRM   B/ESC BACK', W / 2, H - 10);
    ctx.textAlign = 'left';
  }
}