// Final Impact - Mortal Kombat "Choose Your Destiny" Arcade Towers
// Features classic vertical stone monolith towers (Novice, Warrior, Master)
// with floor progression, Test Your Might minigame checkpoints, and boss encounters.

import { soundFX } from '../audio/SoundFX.js';

export const ARCADE_TOWERS = [
  {
    id: 'novice',
    name: 'NOVICE TOWER',
    subtitle: '5 FLOORS',
    color: '#38bdf8',
    description: 'Entry tournament ladder for emerging warriors.',
    floors: [
      { type: 'fight', opponent: 'zephyr', stage: 'dojo' },
      { type: 'fight', opponent: 'fang', stage: 'underground_club' },
      { type: 'fight', opponent: 'glacier', stage: 'cyber_city' },
      { type: 'fight', opponent: 'cinder', stage: 'lava_shrine' },
      { type: 'fight', opponent: 'kazuki', stage: 'rooftop', isBoss: true }
    ]
  },
  {
    id: 'warrior',
    name: 'WARRIOR TOWER',
    subtitle: '8 FLOORS',
    color: '#eab308',
    description: 'Veteran tournament gauntlet with Test Your Might trial.',
    floors: [
      { type: 'fight', opponent: 'zephyr', stage: 'dojo' },
      { type: 'fight', opponent: 'fang', stage: 'underground_club' },
      { type: 'fight', opponent: 'colossus', stage: 'temple' },
      { type: 'minigame', minigame: 'test_your_might', tier: 1 },
      { type: 'fight', opponent: 'glacier', stage: 'cyber_city' },
      { type: 'fight', opponent: 'cinder', stage: 'lava_shrine' },
      { type: 'fight', opponent: 'raven', stage: 'neon_cyber' },
      { type: 'fight', opponent: 'kazuki', stage: 'rooftop', isBoss: true }
    ]
  },
  {
    id: 'master',
    name: 'MASTER TOWER',
    subtitle: '12 FLOORS',
    color: '#ef4444',
    description: 'Ultimate Mortal Kombat trial ending with the Endless Dragon.',
    floors: [
      { type: 'fight', opponent: 'zephyr', stage: 'dojo' },
      { type: 'fight', opponent: 'fang', stage: 'underground_club' },
      { type: 'fight', opponent: 'colossus', stage: 'temple' },
      { type: 'minigame', minigame: 'test_your_might', tier: 2 },
      { type: 'fight', opponent: 'glacier', stage: 'cyber_city' },
      { type: 'fight', opponent: 'cinder', stage: 'lava_shrine' },
      { type: 'fight', opponent: 'kagura', stage: 'shrine' },
      { type: 'fight', opponent: 'raven', stage: 'neon_cyber' },
      { type: 'minigame', minigame: 'test_your_might', tier: 3 },
      { type: 'fight', opponent: 'kazuki', stage: 'rooftop' },
      { type: 'fight', opponent: 'champion', stage: 'grand_shrine', isSubBoss: true },
      { type: 'fight', opponent: 'endless_dragon', stage: 'dragon_peak', isBoss: true }
    ]
  }
];

export class ArcadeTowerScreen {
  constructor() {
    this.selectedTowerIndex = 1; // Default to Warrior Tower
    this.currentFloor = 0;
    this.subState = 'SELECT'; // 'SELECT' | 'LADDER'
    this.animTimer = 0;
    this.playerCharId = 'kazuki';
  }

  get currentTower() {
    return ARCADE_TOWERS[this.selectedTowerIndex];
  }

  getCurrentFloorData() {
    const tower = this.currentTower;
    return tower.floors[this.currentFloor] || null;
  }

  advanceFloor() {
    this.currentFloor++;
    if (this.currentFloor >= this.currentTower.floors.length) {
      return { complete: true };
    }
    return { complete: false, next: this.getCurrentFloorData() };
  }

  resetProgress(charId = 'kazuki') {
    this.currentFloor = 0;
    this.subState = 'LADDER';
    this.playerCharId = charId;
  }

  handleInput(inputState) {
    if (this.subState === 'SELECT') {
      if (inputState.left) {
        this.selectedTowerIndex = (this.selectedTowerIndex - 1 + ARCADE_TOWERS.length) % ARCADE_TOWERS.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.selectedTowerIndex = (this.selectedTowerIndex + 1) % ARCADE_TOWERS.length;
        soundFX.playWhoosh('light');
      }
    }
  }

  handleClick(x, y, onBack, onSelectTower, W = 640, H = 360) {
    // Top-Left Back Button
    if (x >= 12 && x <= 110 && y >= 10 && y <= 34) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    if (this.subState === 'SELECT') {
      const cardW = 160;
      const cardH = 220;
      const cardY = 70;
      const gap = 20;
      const totalW = ARCADE_TOWERS.length * cardW + (ARCADE_TOWERS.length - 1) * gap;
      const startX = (W - totalW) / 2;

      for (let i = 0; i < ARCADE_TOWERS.length; i++) {
        const cx = startX + i * (cardW + gap);
        if (x >= cx && x <= cx + cardW && y >= cardY && y <= cardY + cardH) {
          if (this.selectedTowerIndex === i) {
            if (onSelectTower) onSelectTower(this.currentTower);
          } else {
            this.selectedTowerIndex = i;
            soundFX.playWhoosh('light');
          }
          return true;
        }
      }
    } else if (this.subState === 'LADDER') {
      // Bottom continue / battle button
      if (y >= H - 46 && y <= H - 12) {
        if (onSelectTower) onSelectTower(this.currentTower);
        return true;
      }
    }

    return false;
  }

  render(ctx, W = 640, H = 360) {
    this.animTimer++;
    const t = this.animTimer;

    // Dark moody temple background with embers
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0c070e');
    bg.addColorStop(0.6, '#180a18');
    bg.addColorStop(1, '#050206');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Drifting background fire embers
    for (let i = 0; i < 20; i++) {
      const ex = (i * 73 + Math.sin(t * 0.02 + i) * 16 + W) % W;
      const ey = H - ((t * (0.4 + (i % 4) * 0.15) + i * 37) % H);
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#f59e0b';
      ctx.globalAlpha = 0.25;
      ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.globalAlpha = 1.0;

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

    if (this.subState === 'SELECT') {
      this.renderTowerSelection(ctx, W, H);
    } else {
      this.renderLadderView(ctx, W, H);
    }
  }

  renderTowerSelection(ctx, W, H) {
    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.font = '900 20px serif';
    ctx.fillText('CHOOSE YOUR DESTINY', W / 2, 34);

    ctx.font = '7px "Press Start 2P"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SELECT AN ARCADE TOWER MONOLITH TO CLIMB', W / 2, 48);

    // Tower Pillars (Novice, Warrior, Master)
    const cardW = 160;
    const cardH = 220;
    const cardY = 65;
    const gap = 20;
    const totalW = ARCADE_TOWERS.length * cardW + (ARCADE_TOWERS.length - 1) * gap;
    const startX = (W - totalW) / 2;

    for (let i = 0; i < ARCADE_TOWERS.length; i++) {
      const tow = ARCADE_TOWERS[i];
      const cx = startX + i * (cardW + gap);
      const isSel = (i === this.selectedTowerIndex);

      // Stone Pillar Card
      ctx.fillStyle = isSel ? '#1c1917' : '#0c0a09';
      ctx.fillRect(cx, cardY, cardW, cardH);

      ctx.strokeStyle = isSel ? tow.color : '#44403c';
      ctx.lineWidth = isSel ? 2.5 : 1;
      ctx.strokeRect(cx, cardY, cardW, cardH);

      // Header Banner
      ctx.fillStyle = isSel ? tow.color : '#292524';
      ctx.fillRect(cx, cardY, cardW, 28);

      ctx.fillStyle = isSel ? '#000000' : '#d6d3d1';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(tow.name, cx + cardW / 2, cardY + 18);

      // Floor count
      ctx.fillStyle = tow.color;
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(tow.subtitle, cx + cardW / 2, cardY + 54);

      // Stacked miniature monolith stone blocks
      const blockH = 10;
      const numBlocks = tow.floors.length;
      const bY0 = cardY + 70;
      for (let f = 0; f < numBlocks; f++) {
        const by = bY0 + (numBlocks - 1 - f) * (blockH + 2);
        const fl = tow.floors[f];
        if (fl.type === 'minigame') {
          ctx.fillStyle = '#f59e0b';
        } else if (fl.isBoss) {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = '#57534e';
        }
        ctx.fillRect(cx + 20, by, cardW - 40, blockH);
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 20, by, cardW - 40, blockH);
      }

      // Description
      ctx.fillStyle = '#a8a29e';
      ctx.font = '7px monospace';
      ctx.fillText(isSel ? '▶ PRESS SPACE TO ASCEND ◀' : 'CLICK OR USE ARROWS', cx + cardW / 2, cardY + cardH - 12);
    }
  }

  renderLadderView(ctx, W, H) {
    const tower = this.currentTower;
    const floors = tower.floors;

    ctx.textAlign = 'center';
    ctx.fillStyle = tower.color;
    ctx.font = '900 16px serif';
    ctx.fillText(`${tower.name} — FLOOR ${this.currentFloor + 1} OF ${floors.length}`, W / 2, 30);

    // Monolith Stone Column in center
    const colW = 200;
    const colX = (W - colW) / 2;
    const rowH = 22;
    const startY = 50;

    for (let f = 0; f < floors.length; f++) {
      const fl = floors[f];
      const ry = startY + (floors.length - 1 - f) * (rowH + 2);
      const isCurrent = (f === this.currentFloor);
      const isBeaten = (f < this.currentFloor);

      ctx.fillStyle = isCurrent ? '#292524' : (isBeaten ? '#1c1917' : '#0c0a09');
      ctx.fillRect(colX, ry, colW, rowH);

      ctx.strokeStyle = isCurrent ? '#facc15' : '#44403c';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.strokeRect(colX, ry, colW, rowH);

      // Floor Label
      let label = fl.type === 'fight' ? fl.opponent.toUpperCase() : '★ TEST YOUR MIGHT ★';
      if (fl.isBoss) label = `👑 BOSS: ${label}`;

      ctx.fillStyle = isCurrent ? '#facc15' : (isBeaten ? '#6ee7b7' : '#94a3b8');
      ctx.font = isCurrent ? 'bold 9px monospace' : '8px monospace';
      ctx.fillText(label, colX + colW / 2, ry + 15);

      // Animated flaming pointer cursor on current floor
      if (isCurrent) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('▶', colX - 16, ry + 15);
        ctx.fillText('◀', colX + colW + 16, ry + 15);
      }
    }

    // Bottom action button
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(W / 2 - 120, H - 38, 240, 26);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W / 2 - 120, H - 38, 240, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('ENTER FLOOR BATTLE [SPACE]', W / 2, H - 22);
  }
}

export const arcadeTowerScreen = new ArcadeTowerScreen();
