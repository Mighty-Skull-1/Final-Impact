// Final Impact - 16-Bit Pixel Art Sprite Engine & Generator
// Generates authentic retro arcade pixel spritesheets on offscreen canvases

export class SpriteGenerator {
  constructor() {
    this.cache = new Map();
  }

  // Helper to create an offscreen canvas
  createCanvas(width, height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  }

  // Draw a pixel rect on a grid
  drawPixel(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // Pre-generate all sprite frames for a fighter
  generateFighterSprites(fighterId) {
    const key = `fighter_${fighterId}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const sprites = {};
    const width = 80;
    const height = 90;

    // Define color palettes
    const palettes = {
      kazuki: {
        skinHighlight: '#ffe2c7',
        skinMid: '#f4ba86',
        skinShadow: '#c47d4e',
        skinDeep: '#7a421e',
        giWhite: '#ffffff',
        giMid: '#dbe4ed',
        giShadow: '#8ea0b5',
        giDeep: '#49596b',
        belt: '#1e212d',
        beltShadow: '#0c0d12',
        hair: '#241b18',
        hairShadow: '#100c0b',
        redBright: '#ff2d55',
        redShadow: '#a60a28',
        glow: '#38bdf8'
      },
      raven: {
        skinHighlight: '#ffe3cb',
        skinMid: '#f0b784',
        skinShadow: '#b87747',
        skinDeep: '#74401c',
        hairHighlight: '#fde047',
        hairMid: '#eab308',
        hairShadow: '#a16207',
        vestMid: '#334155',
        vestDark: '#1e293b',
        vestDeep: '#0f172a',
        camoLight: '#84cc16',
        camoMid: '#4d7c0f',
        camoDark: '#1a4106',
        bootDark: '#18181b',
        bootDeep: '#09090b',
        glow: '#facc15'
      },
      kagura: {
        skinHighlight: '#fff1e6',
        skinMid: '#f6c7a3',
        skinShadow: '#c58564',
        skinDeep: '#78462d',
        hair: '#1e1b4b',
        hairShadow: '#0f0c2e',
        suitLight: '#7c3aed',
        suitMid: '#581c87',
        suitDark: '#3b0764',
        suitDeep: '#1e0538',
        scarfBright: '#f43f5e',
        scarfShadow: '#9f1239',
        neonGlow: '#06b6d4',
        bladeMetal: '#e2e8f0',
        bladeShadow: '#64748b'
      },
      fang: {
        skinHighlight: '#e8c4a0',
        skinMid: '#c99b6d',
        skinShadow: '#8b6239',
        skinDeep: '#5a3a1e',
        hair: '#1a1a1a',
        hairShadow: '#0a0a0a',
        wrapsWhite: '#f5f0e8',
        wrapsShadow: '#c4b8a8',
        shortsRed: '#dc2626',
        shortsShadow: '#991b1b',
        mongkolGold: '#fbbf24',
        mongkolShadow: '#b45309',
        glow: '#ef4444'
      },
      zephyr: {
        skinHighlight: '#8b6c4a',
        skinMid: '#6b4c30',
        skinShadow: '#4a3420',
        skinDeep: '#2d1f12',
        hair: '#f5f5f5',
        hairShadow: '#a3a3a3',
        tankGreen: '#22c55e',
        tankShadow: '#15803d',
        pantsWhite: '#fafafa',
        pantsShadow: '#d4d4d4',
        shoesYellow: '#facc15',
        shoesShadow: '#a16207',
        glow: '#4ade80'
      },
      colossus: {
        skinHighlight: '#fde8d0',
        skinMid: '#e8b88a',
        skinShadow: '#b8845a',
        skinDeep: '#7a5230',
        hair: '#78350f',
        hairShadow: '#451a03',
        glovesRed: '#b91c1c',
        glovesShadow: '#7f1d1d',
        shortsBlack: '#1c1917',
        shortsShadow: '#0c0a09',
        bootsBlack: '#18181b',
        bootsShadow: '#09090b',
        beltGold: '#d97706',
        glow: '#fbbf24'
      },
      endless_dragon: {
        skinHighlight: '#6b21a8',
        skinMid: '#581c87',
        skinShadow: '#3b0764',
        skinDeep: '#1e0538',
        scalesLight: '#7c3aed',
        scalesMid: '#6d28d9',
        scalesDark: '#4c1d95',
        eyeGlow: '#fbbf24',
        hornBone: '#f5f0e8',
        hornShadow: '#a3a3a3',
        flameCore: '#ef4444',
        flameMid: '#f97316',
        flameOuter: '#fbbf24',
        glow: '#a855f7'
      },
      mighty: {
        skinHighlight: '#fef08a',
        skinMid: '#facc15',
        skinShadow: '#ca8a04',
        skinDeep: '#854d0e',
        hair: '#fbbf24',
        hairShadow: '#b45309',
        armorGold: '#f59e0b',
        tankGreen: '#0f172a',
        tankShadow: '#020617',
        glovesRed: '#eab308',
        glovesShadow: '#ca8a04',
        beltGold: '#fde047',
        shortsRed: '#1e1b4b',
        shortsShadow: '#0f172a',
        shoesYellow: '#f59e0b',
        eyeGlow: '#38bdf8',
        glow: '#facc15'
      }
    };

    const p = palettes[fighterId] || palettes.kazuki;

    // Build frame definitions
    const frameBuilders = {
      kazuki: this.buildKazukiFrames.bind(this),
      raven: this.buildRavenFrames.bind(this),
      kagura: this.buildKaguraFrames.bind(this),
      fang: this.buildGenericFrames.bind(this),
      zephyr: this.buildGenericFrames.bind(this),
      colossus: this.buildGenericFrames.bind(this),
      endless_dragon: this.buildGenericFrames.bind(this),
      mighty: this.buildGenericFrames.bind(this)
    };

    const builder = frameBuilders[fighterId] || frameBuilders.kazuki;
    const frameList = builder(p, width, height);

    for (const [animName, frames] of Object.entries(frameList)) {
      sprites[animName] = frames;
    }

    this.cache.set(key, sprites);
    return sprites;
  }

  // ==========================================
  // KAZUKI - The Ansatsuken Striker
  // ==========================================
  buildKazukiFrames(p, W, H) {
    const anims = {};

    const renderFrame = (drawFn) => {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawFn(ctx);
      return canvas;
    };

    // IDLE (4 Frames)
    anims.IDLE = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      const bob = [0, 1, 0, -1][frame];
      const flutter = [0, 1, 2, 1][frame];

      // Shadow on ground
      this.drawShadow(ctx, 40, H - 4, 18, 4);

      // Legs / Feet
      ctx.fillStyle = p.skinShadow;
      ctx.fillRect(29, 68, 8, 16); // Left leg
      ctx.fillRect(44, 68, 9, 16); // Right leg
      // Feet wraps
      ctx.fillStyle = p.giMid;
      ctx.fillRect(27, 82, 11, 5);
      ctx.fillRect(43, 82, 11, 5);

      // Pants (Gi bottom)
      ctx.fillStyle = p.giDeep;
      ctx.fillRect(26, 50 + bob, 28, 22);
      ctx.fillStyle = p.giShadow;
      ctx.fillRect(27, 50 + bob, 12, 20);
      ctx.fillRect(42, 50 + bob, 12, 20);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(29, 52 + bob, 8, 16);
      ctx.fillRect(44, 52 + bob, 8, 16);

      // Black Belt & Knots
      ctx.fillStyle = p.beltShadow;
      ctx.fillRect(28, 48 + bob, 24, 5);
      ctx.fillStyle = p.belt;
      ctx.fillRect(29, 49 + bob, 22, 3);
      // Hanging belt tails
      ctx.fillRect(36 + flutter, 52 + bob, 3, 12);
      ctx.fillRect(40 + flutter, 52 + bob, 3, 10);

      // Torso / Gi Top (Open V-neck showing muscular chest)
      ctx.fillStyle = p.giDeep;
      ctx.fillRect(26, 28 + bob, 28, 21);
      ctx.fillStyle = p.giShadow;
      ctx.fillRect(27, 29 + bob, 10, 19);
      ctx.fillRect(43, 29 + bob, 10, 19);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 30 + bob, 8, 17);
      ctx.fillRect(44, 30 + bob, 8, 17);
      
      // Muscular Chest (V-neck)
      ctx.fillStyle = p.skinDeep;
      ctx.fillRect(36, 29 + bob, 8, 14);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(37, 30 + bob, 6, 12);
      ctx.fillStyle = p.skinHighlight;
      ctx.fillRect(38, 31 + bob, 4, 6); // Pec highlight

      // Left Arm (Back, raised martial guard)
      ctx.fillStyle = p.skinShadow;
      ctx.fillRect(20, 31 + bob, 8, 14);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(21, 32 + bob, 6, 12);
      // Fist & Hand wraps
      ctx.fillStyle = p.redBright;
      ctx.fillRect(20, 24 + bob, 8, 8); // Red sparring glove

      // Right Arm (Forward guard)
      ctx.fillStyle = p.skinDeep;
      ctx.fillRect(48, 32 + bob, 9, 14);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(49, 33 + bob, 7, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(51, 26 + bob, 9, 8); // Red glove

      // Head & Neck
      ctx.fillStyle = p.skinShadow;
      ctx.fillRect(37, 22 + bob, 6, 7);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 11 + bob, 12, 13);
      ctx.fillStyle = p.skinHighlight;
      ctx.fillRect(36, 13 + bob, 9, 7);

      // Facial Features (Focused warrior brow & eyes)
      ctx.fillStyle = p.hairShadow;
      ctx.fillRect(39, 16 + bob, 5, 2); // Brow
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 18 + bob, 3, 2); // Sclera
      ctx.fillStyle = '#000000';
      ctx.fillRect(42, 18 + bob, 2, 2); // Pupil

      // Spiky Dark Hair
      ctx.fillStyle = p.hairShadow;
      ctx.fillRect(32, 6 + bob, 16, 7);
      ctx.fillRect(30, 8 + bob, 5, 5);
      ctx.fillRect(44, 7 + bob, 6, 5);
      ctx.fillStyle = p.hair;
      ctx.fillRect(34, 7 + bob, 12, 5);
      ctx.fillRect(38, 4 + bob, 6, 4); // Top spikes

      // Red Headband & Fluttering Tails
      ctx.fillStyle = p.redShadow;
      ctx.fillRect(33, 13 + bob, 15, 4);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(34, 14 + bob, 13, 2);
      // Headband tails blowing back
      ctx.fillStyle = p.redBright;
      ctx.fillRect(23 - flutter * 2, 14 + bob + flutter, 11, 3);
      ctx.fillRect(19 - flutter * 3, 16 + bob + flutter * 2, 9, 3);
    }));

    // WALK FORWARD (4 Frames)
    anims.WALK_FWD = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      const step = [0, 2, 0, -2][frame];
      const legStride = [-4, 0, 4, 0][frame];

      this.drawShadow(ctx, 40, H - 4, 18, 4);

      // Moving Legs
      ctx.fillStyle = p.giDeep;
      ctx.fillRect(26 - legStride, 50, 12, 22);
      ctx.fillRect(42 + legStride, 50, 12, 22);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28 - legStride, 52, 8, 18);
      ctx.fillRect(44 + legStride, 52, 8, 18);
      // Feet
      ctx.fillStyle = p.giMid;
      ctx.fillRect(27 - legStride, 80, 10, 6);
      ctx.fillRect(43 + legStride, 80, 10, 6);

      // Belt
      ctx.fillStyle = p.belt;
      ctx.fillRect(28, 48 + step, 24, 4);
      ctx.fillRect(37 + step, 52, 3, 10);

      // Torso
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 30 + step, 24, 19);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(37, 30 + step, 6, 12);

      // Arms swinging with stride
      ctx.fillStyle = p.redBright;
      ctx.fillRect(20 + legStride, 28 + step, 8, 8);
      ctx.fillRect(52 - legStride, 26 + step, 8, 8);

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(35, 12 + step, 12, 13);
      ctx.fillStyle = p.hair;
      ctx.fillRect(33, 7 + step, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(33, 14 + step, 15, 3);
      // Headband blowing
      ctx.fillRect(22, 15 + step, 11, 3);
    }));

    // WALK BACK (4 Frames)
    anims.WALK_BACK = anims.WALK_FWD;

    // CROUCH (2 Frames)
    anims.CROUCH = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);

      // Deep squat legs
      ctx.fillStyle = p.giDeep;
      ctx.fillRect(20, 58, 40, 18);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(22, 60, 16, 14);
      ctx.fillRect(42, 60, 16, 14);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(18, 78, 14, 6);
      ctx.fillRect(48, 78, 14, 6);

      // Lowered Torso
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(26, 40, 28, 20);
      ctx.fillStyle = p.belt;
      ctx.fillRect(27, 56, 26, 4);

      // Guarding arms
      ctx.fillStyle = p.redBright;
      ctx.fillRect(28, 36, 10, 10);
      ctx.fillRect(42, 34, 10, 10);

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 24, 12, 12);
      ctx.fillStyle = p.hair;
      ctx.fillRect(32, 18, 15, 7);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(32, 25, 15, 3);
    }));

    // JUMP (3 Frames)
    anims.JUMP = [0, 1, 2].map(frame => renderFrame(ctx => {
      const yOff = [6, -18, -4][frame];
      this.drawShadow(ctx, 40, H - 4, 12, 3);

      // Tucked aerial legs
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 48 + yOff, 12, 16);
      ctx.fillRect(42, 52 + yOff, 12, 14);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(26, 62 + yOff, 10, 6);
      ctx.fillRect(44, 64 + yOff, 10, 6);

      // Torso
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 26 + yOff, 26, 22);
      ctx.fillStyle = p.belt;
      ctx.fillRect(28, 46 + yOff, 26, 4);

      // Arms raised
      ctx.fillStyle = p.redBright;
      ctx.fillRect(22, 18 + yOff, 8, 8);
      ctx.fillRect(50, 16 + yOff, 8, 8);

      // Head & blowing headband
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(35, 10 + yOff, 12, 12);
      ctx.fillStyle = p.hair;
      ctx.fillRect(33, 5 + yOff, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(33, 12 + yOff, 15, 3);
      ctx.fillRect(18, 16 + yOff, 15, 4);
    }));

    // LIGHT PUNCH / JAB (3 Frames)
    anims.ATTACK_LP = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 20, 4);
      const reach = [0, 16, 4][frame];

      // Lower body
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(26, 50, 28, 24);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(25, 80, 11, 5);
      ctx.fillRect(45, 80, 11, 5);

      // Upper Body
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 30, 24, 20);

      // Extending Punch Fist
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(46, 32, 8 + reach, 8);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(52 + reach, 31, 10, 10); // Red boxing glove impact!

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(35, 12, 12, 13);
      ctx.fillStyle = p.hair;
      ctx.fillRect(33, 7, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(33, 14, 15, 3);
    }));

    // HEAVY PUNCH / FIERCE STRAIGHT (4 Frames)
    anims.ATTACK_HP = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 42, H - 4, 24, 5);
      const step = [0, 6, 12, 4][frame];
      const fistX = [48, 56, 72, 54][frame];

      // Deep lunging stance
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(22, 52, 16, 24);
      ctx.fillRect(40 + step, 54, 18, 22);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(20, 80, 12, 6);
      ctx.fillRect(44 + step, 80, 14, 6);

      // Angled Torso lunging forward
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28 + step / 2, 30, 26, 22);

      // Massive step-in straight punch with Ki flare
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(42 + step / 2, 33, fistX - 42, 9);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(fistX, 31, 12, 12);
      
      // Impact flare on full extension (frame 2)
      if (frame === 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fistX + 10, 29, 6, 16);
        ctx.fillStyle = p.glow;
        ctx.fillRect(fistX + 12, 27, 4, 20);
      }

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(35 + step / 2, 13, 12, 13);
      ctx.fillStyle = p.hair;
      ctx.fillRect(33 + step / 2, 8, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(33 + step / 2, 15, 15, 3);
      ctx.fillRect(20 + step / 2, 16, 14, 3);
    }));

    // LIGHT KICK (3 Frames)
    anims.ATTACK_LK = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 36, H - 4, 16, 4);
      const reach = [0, 18, 6][frame];

      // Standing on back leg
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 48, 12, 28);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(27, 80, 12, 6);

      // Kicking leg extending snappy forward
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(38, 54 - reach / 2, 14 + reach, 10);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(50 + reach, 52 - reach / 2, 12, 12); // Foot

      // Torso
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 28, 22, 20);
      // Guard
      ctx.fillStyle = p.redBright;
      ctx.fillRect(36, 26, 8, 8);
      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(32, 12, 12, 12);
      ctx.fillStyle = p.hair;
      ctx.fillRect(30, 7, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(30, 14, 15, 3);
    }));

    // HEAVY KICK / ROUNDHOUSE (4 Frames)
    anims.ATTACK_HK = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 36, H - 4, 18, 4);
      const angle = [0, 1, 2, 0][frame];

      // Support Leg
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(30, 50, 12, 26);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(28, 80, 12, 6);

      // High Arc Roundhouse Kick
      if (angle === 1 || angle === 2) {
        // High extended leg
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(38, 26, 28, 12);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(64, 24, 14, 14); // High foot
        // Wind arc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(66, 16, 6, 8);
        ctx.fillStyle = p.glow;
        ctx.fillRect(68, 12, 4, 6);
      } else {
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(36, 44, 18, 14);
      }

      // Torso tilted back
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(24, 30, 20, 20);
      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(22, 14, 12, 12);
      ctx.fillStyle = p.hair;
      ctx.fillRect(20, 9, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(20, 16, 15, 3);
    }));

    // CROUCH LIGHT PUNCH (3 Frames)
    anims.CROUCH_LP = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);
      const reach = [0, 14, 4][frame];

      ctx.fillStyle = p.giWhite;
      ctx.fillRect(22, 58, 36, 20);
      ctx.fillRect(26, 40, 24, 20);
      // Low punch
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(44, 48, 8 + reach, 7);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(50 + reach, 46, 9, 9);
      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 24, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(32, 26, 15, 3);
    }));

    // CROUCH HEAVY KICK / SWEEP (3 Frames)
    anims.CROUCH_HK = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 44, H - 4, 30, 5);
      const sweepReach = [0, 24, 8][frame];

      // Hand on floor supporting low sweep
      ctx.fillStyle = p.redBright;
      ctx.fillRect(20, 72, 8, 8);

      // Low crouch torso
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(24, 52, 24, 18);

      // Sweeping leg extended across floor
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(34, 72, 20 + sweepReach, 10);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(52 + sweepReach, 70, 14, 12); // Sweep foot

      // Dust puff on full sweep
      if (frame === 1) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(66 + sweepReach, 66, 6, 6);
        ctx.fillRect(62 + sweepReach, 78, 8, 4);
      }

      // Head low
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(28, 38, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(26, 40, 15, 3);
    }));

    // JUMP PUNCH (2 Frames)
    anims.JUMP_PUNCH = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 12, 3);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 32, 24, 24);
      // Downward diagonal punch
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(46, 42, 14, 8);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(58, 44, 10, 10);
      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 18, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(32, 20, 15, 3);
    }));

    // JUMP KICK (2 Frames)
    anims.JUMP_KICK = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 12, 3);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(26, 30, 22, 22);
      // Flying kick extension
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(40, 40, 24, 10);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(62, 42, 14, 12);
      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30, 16, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(28, 18, 15, 3);
    }));

    // SPECIAL 1: HADOUKEN (4 Frames)
    anims.SPECIAL_1 = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 24, 5);

      if (frame === 0 || frame === 1) {
        // Gathering Ki - pulls hands back to hip
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(24, 50, 28, 26);
        ctx.fillRect(26, 30, 24, 20);
        // Hands cupped at hip with glowing Ki ball
        ctx.fillStyle = p.redBright;
        ctx.fillRect(16, 38, 12, 12);
        // Ki gathering aura
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 36, 12, 12);
        ctx.fillStyle = p.glow;
        ctx.fillRect(10, 34, 16, 16);
      } else {
        // Thrust hands forward shouting HADOUKEN!
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22, 50, 32, 26);
        ctx.fillRect(28, 30, 28, 20);
        // Thrust arms
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(48, 32, 16, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(62, 30, 12, 14);
        // Glowing muzzle flash of fireball release
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(72, 26, 8, 22);
        ctx.fillStyle = p.glow;
        ctx.fillRect(70, 24, 12, 26);
      }

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 14, 12, 12);
      ctx.fillStyle = p.hair;
      ctx.fillRect(32, 9, 15, 6);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(32, 16, 15, 3);
      ctx.fillRect(18, 16, 14, 4); // Headband trailing
    }));

    // SPECIAL 2: SHORYUKEN / DRAGON PUNCH (5 Frames)
    anims.SPECIAL_2 = [0, 1, 2, 3, 4].map(frame => renderFrame(ctx => {
      const heights = [4, -10, -28, -20, -6][frame];
      this.drawShadow(ctx, 40, H - 4, Math.max(8, 20 - Math.abs(heights) / 2), 4);

      if (frame === 0) {
        // Deep crouch crouched before explosion
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(24, 54, 32, 22);
        ctx.fillRect(26, 38, 26, 18);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(46, 44, 10, 10);
      } else {
        // Soaring uppercut
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(30, 44 + heights, 14, 26); // Straight trailing body
        ctx.fillStyle = p.giMid;
        ctx.fillRect(28, 70 + heights, 10, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(28, 26 + heights, 22, 20);

        // Skyward fist with dragon flame
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(40, 6 + heights, 8, 22);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(39, 0 + heights, 10, 12); // Raised fist

        // Rising Dragon flame aura
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(38, -4 + heights, 12, 10);
        ctx.fillStyle = p.glow;
        ctx.fillRect(36, -8 + heights, 16, 14);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(37, -12 + heights, 14, 8);
      }

      // Head tilted upward
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(32, 14 + (frame === 0 ? 20 : heights), 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(30, 16 + (frame === 0 ? 20 : heights), 15, 3);
    }));

    // SPECIAL 3: TATSUMAKI SENPUUKYAKU / HURRICANE KICK (4 Frames)
    anims.SPECIAL_3 = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 14, 3);
      const rot = frame;

      // Airborne spinning kick
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(30, 26, 20, 22);

      // Spinning extended legs
      if (rot % 2 === 0) {
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(10, 36, 60, 12);
        ctx.fillStyle = p.giMid;
        ctx.fillRect(8, 35, 10, 14);
        ctx.fillRect(62, 35, 10, 14);
        // Whirlwind wind trails
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 38, 12, 4);
        ctx.fillRect(66, 38, 12, 4);
      } else {
        ctx.fillStyle = p.giDeep;
        ctx.fillRect(24, 34, 32, 14);
      }

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 12, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(32, 14, 15, 3);
      ctx.fillRect(18, 14, 14, 4);
    }));

    // HURT (2 Frames)
    anims.HIT = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 36, H - 4, 18, 4);
      const recoil = [4, 8][frame];

      // Staggered back
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(20 - recoil, 52, 26, 24);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(22 - recoil, 30, 24, 22);
      // Head snapping back in pain
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(26 - recoil * 1.5, 12, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(24 - recoil * 1.5, 14, 15, 3);
      ctx.fillRect(12 - recoil * 1.5, 14, 12, 4);
    }));

    anims.HIT_CROUCH = anims.HIT;
    anims.HIT_AIR = anims.HIT;

    // BLOCK (1 Frame)
    anims.BLOCK = [renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 18, 4);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(26, 50, 26, 26);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(28, 30, 24, 20);
      // Crossed forearm block
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(38, 26, 12, 16);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(40, 24, 12, 14);
      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30, 14, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(28, 16, 15, 3);
    })];

    anims.CROUCH_BLOCK = [renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(22, 58, 36, 20);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(38, 40, 14, 14); // Low cross guard
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30, 24, 12, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(28, 26, 15, 3);
    })];

    // KNOCKDOWN (4 Frames: falling, ground hit, bounce, rise)
    anims.KNOCKDOWN = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      if (frame === 0) {
        // Airborne horizontal tumble
        this.drawShadow(ctx, 36, H - 4, 22, 4);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(16, 44, 48, 16);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(10, 42, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(8, 43, 14, 3);
      } else if (frame === 1) {
        // Flat on back ground impact
        this.drawShadow(ctx, 40, H - 4, 44, 6);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(14, 74, 52, 10);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(8, 72, 10, 10);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(6, 73, 12, 3);
        // Ground dust
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 68, 6, 6);
        ctx.fillRect(58, 68, 6, 6);
      } else {
        // Pushing up / Wakeup
        this.drawShadow(ctx, 40, H - 4, 30, 5);
        ctx.fillStyle = p.giWhite;
        ctx.fillRect(22, 64, 34, 16);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(26, 48, 12, 12);
        ctx.fillStyle = p.redBright;
        ctx.fillRect(24, 50, 15, 3);
      }
    }));

    // VICTORY POSE (2 Frames)
    anims.VICTORY = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 20, 4);
      // Confident upright stance, arms crossed
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(26, 48, 28, 28);
      ctx.fillStyle = p.giMid;
      ctx.fillRect(25, 80, 12, 6);
      ctx.fillRect(45, 80, 12, 6);
      // Torso
      ctx.fillStyle = p.giWhite;
      ctx.fillRect(26, 26, 28, 24);
      // Arms crossed across chest
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(26, 34, 28, 12);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(24, 36, 10, 8);
      ctx.fillRect(46, 36, 10, 8);
      // Proud smiling head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 10, 12, 14);
      ctx.fillStyle = p.hair;
      ctx.fillRect(32, 5, 16, 7);
      ctx.fillStyle = p.redBright;
      ctx.fillRect(32, 12, 16, 3);
      // Headband blowing majestic in the wind
      ctx.fillRect(14 - frame * 2, 12 + frame, 18, 4);
    }));

    return anims;
  }

  // ==========================================
  // RAVEN - The Tactical Commando
  // ==========================================
  buildRavenFrames(p, W, H) {
    const anims = {};

    const renderFrame = (drawFn) => {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawFn(ctx);
      return canvas;
    };

    // IDLE (4 Frames)
    anims.IDLE = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      const bob = [0, 1, 0, -1][frame];

      this.drawShadow(ctx, 40, H - 4, 22, 5);

      // Combat boots
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(26, 76, 12, 10);
      ctx.fillRect(44, 76, 12, 10);

      // Camo Cargo Pants
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(24, 48 + bob, 14, 28);
      ctx.fillRect(42, 48 + bob, 14, 28);
      // Camo patches
      ctx.fillStyle = p.camoLight;
      ctx.fillRect(26, 54 + bob, 6, 6);
      ctx.fillRect(46, 60 + bob, 6, 6);
      ctx.fillStyle = p.camoDark;
      ctx.fillRect(28, 64 + bob, 7, 5);
      ctx.fillRect(44, 52 + bob, 7, 6);

      // Broad Torso / Tactical Combat Harness
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 26 + bob, 32, 22);
      // Muscular shading
      ctx.fillStyle = p.skinHighlight;
      ctx.fillRect(28, 28 + bob, 10, 8); // Left pec
      ctx.fillRect(42, 28 + bob, 10, 8); // Right pec
      // Tactical shoulder harness & Dog tags
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(26, 26 + bob, 5, 22); // Strap left
      ctx.fillRect(49, 26 + bob, 5, 22); // Strap right
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(38, 34 + bob, 4, 5); // Silver dog tag

      // Arms (Heavy Biceps & Combat Tape)
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(16, 28 + bob, 10, 16);
      ctx.fillRect(52, 28 + bob, 10, 16);
      // Heavy Fists
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(16, 22 + bob, 10, 9); // Left guard fist
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(52, 20 + bob, 10, 9); // Right guard fist

      // Square Jaw & Face
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 11 + bob, 14, 14);
      // Chiseled brow & eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(38, 16 + bob, 8, 2);
      // Blonde Flat-top Hair (Iconic Guile / Military flat top)
      ctx.fillStyle = p.hairShadow;
      ctx.fillRect(31, 3 + bob, 18, 9);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 2 + bob, 16, 8);
      ctx.fillStyle = p.hairHighlight;
      ctx.fillRect(33, 1 + bob, 14, 3); // Crisp flat-top razor line
    }));

    // WALK FORWARD (4 Frames)
    anims.WALK_FWD = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      const step = [0, 2, 0, -2][frame];
      const stride = [-5, 0, 5, 0][frame];

      this.drawShadow(ctx, 40, H - 4, 22, 5);

      // Stride legs
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(24 - stride, 48, 14, 28);
      ctx.fillRect(42 + stride, 48, 14, 28);
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(24 - stride, 76, 14, 10);
      ctx.fillRect(42 + stride, 76, 14, 10);

      // Torso
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 26 + step, 32, 22);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(26, 26 + step, 5, 22);
      ctx.fillRect(49, 26 + step, 5, 22);

      // Heavy arms swinging
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(16 + stride, 24 + step, 10, 9);
      ctx.fillRect(52 - stride, 22 + step, 10, 9);

      // Head
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 11 + step, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 2 + step, 16, 9);
    }));

    anims.WALK_BACK = anims.WALK_FWD;

    // CROUCH (2 Frames)
    anims.CROUCH = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 26, 5);

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(18, 56, 44, 20);
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(16, 76, 14, 10);
      ctx.fillRect(48, 76, 14, 10);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 36, 32, 22);
      // Low boxer guard
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(30, 28, 10, 10);
      ctx.fillRect(44, 26, 10, 10);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(34, 18, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(33, 9, 16, 9);
    }));

    // JUMP (3 Frames)
    anims.JUMP = [0, 1, 2].map(frame => renderFrame(ctx => {
      const yOff = [4, -18, -4][frame];
      this.drawShadow(ctx, 40, H - 4, 14, 4);

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(26, 46 + yOff, 28, 20);
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(28, 64 + yOff, 11, 8);
      ctx.fillRect(41, 64 + yOff, 11, 8);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 24 + yOff, 32, 22);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(18, 16 + yOff, 10, 10);
      ctx.fillRect(52, 14 + yOff, 10, 10);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 10 + yOff, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 1 + yOff, 16, 9);
    }));

    // LIGHT PUNCH (Military Jab)
    anims.ATTACK_LP = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);
      const reach = [0, 18, 4][frame];

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(24, 48, 30, 28);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 26, 30, 22);

      // Extending Tactical Fist
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(48, 28, 10 + reach, 9);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(56 + reach, 27, 12, 11);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 11, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 2, 16, 9);
    }));

    // HEAVY PUNCH (Spinning Backfist with Shockwave)
    anims.ATTACK_HP = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 42, H - 4, 26, 5);
      const step = [0, 8, 14, 6][frame];
      const fistX = [46, 58, 74, 56][frame];

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(22, 50, 16, 26);
      ctx.fillRect(42 + step, 52, 18, 24);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(26 + step / 2, 28, 30, 22);

      // Huge Backfist
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(44 + step / 2, 30, fistX - 44, 10);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(fistX, 28, 14, 14);

      // Sonic burst shockwave on frame 2
      if (frame === 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fistX + 12, 24, 6, 22);
        ctx.fillStyle = p.glow;
        ctx.fillRect(fistX + 16, 20, 4, 30);
      }

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33 + step / 2, 12, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32 + step / 2, 3, 16, 9);
    }));

    // LIGHT KICK
    anims.ATTACK_LK = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 36, H - 4, 18, 4);
      const reach = [0, 16, 4][frame];

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(26, 48, 14, 28);
      ctx.fillRect(38, 54, 16 + reach, 12);
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(52 + reach, 52, 14, 12); // Combat boot kick

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 26, 28, 22);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 11, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 2, 16, 9);
    }));

    // HEAVY KICK (Axe Kick)
    anims.ATTACK_HK = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(28, 50, 14, 26);

      if (frame === 1 || frame === 2) {
        // High Axe Kick slamming down
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(38, 22, 14, 36);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(44, 14, 14, 14); // High boot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(56, 18, 4, 28); // Slicing arc
      } else {
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(36, 46, 16, 20);
      }

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 28, 26, 22);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30, 12, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(29, 3, 16, 9);
    }));

    // CROUCH LIGHT PUNCH
    anims.CROUCH_LP = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 26, 5);
      const reach = [0, 16, 4][frame];
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(20, 56, 40, 20);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 36, 28, 20);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(48 + reach, 42, 12, 10);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(32, 18, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(31, 9, 16, 9);
    }));

    // CROUCH HEAVY KICK (Low sweep)
    anims.CROUCH_HK = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 44, H - 4, 32, 5);
      const sweepReach = [0, 24, 8][frame];
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(22, 54, 24, 18);
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(34, 70, 22 + sweepReach, 12);
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(54 + sweepReach, 68, 16, 14); // Heavy combat boot sweep
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(26, 38, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(25, 29, 16, 9);
    }));

    // JUMP PUNCH & JUMP KICK
    anims.JUMP_PUNCH = [0, 1].map(frame => renderFrame(ctx => {
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(26, 32, 28, 22);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(52, 42, 12, 12);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(32, 16, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(31, 7, 16, 9);
    }));

    anims.JUMP_KICK = [0, 1].map(frame => renderFrame(ctx => {
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(24, 30, 24, 22);
      ctx.fillStyle = p.bootDeep;
      ctx.fillRect(58, 40, 16, 14);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(28, 16, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(27, 7, 16, 9);
    }));

    // SPECIAL 1: SONIC BLADE (Dual arm swipe projectile)
    anims.SPECIAL_1 = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 42, H - 4, 26, 5);
      if (frame < 2) {
        // Arms crossed in front charging sonic energy
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(24, 48, 30, 28);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26, 30, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(32, 28, 14, 14);
        ctx.fillStyle = p.glow;
        ctx.fillRect(30, 26, 18, 18);
      } else {
        // Slashing arms wide open releasing spinning Sonic Blade
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(22, 48, 34, 28);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 26, 30, 22);
        ctx.fillStyle = p.vestDark;
        ctx.fillRect(56, 26, 14, 12);
        // Golden sonic crescent release flare
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(68, 18, 8, 28);
        ctx.fillStyle = p.glow;
        ctx.fillRect(72, 12, 6, 40);
      }
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 11, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 2, 16, 9);
    }));

    // SPECIAL 2: FLASH SOMERSAULT (Backflip sonic kick)
    anims.SPECIAL_2 = [0, 1, 2, 3, 4].map(frame => renderFrame(ctx => {
      const yOff = [2, -14, -28, -18, -4][frame];
      this.drawShadow(ctx, 40, H - 4, 14, 4);

      if (frame === 0) {
        // Deep crouch
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(20, 54, 40, 22);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(24, 36, 30, 20);
      } else {
        // Inverted backflip somersault cutting sonic crescent
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(28, 34 + yOff, 24, 24);
        ctx.fillStyle = p.bootDeep;
        ctx.fillRect(24, 14 + yOff, 14, 16);
        ctx.fillRect(42, 14 + yOff, 14, 16);

        // Huge golden somersault crescent blade
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 4 + yOff, 40, 8);
        ctx.fillStyle = p.glow;
        ctx.fillRect(16, -2 + yOff, 48, 12);
      }

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(33, 20 + yOff, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(32, 11 + yOff, 16, 9);
    }));

    // SPECIAL 3: BLITZ KNUCKLE (Jet rush punch)
    anims.SPECIAL_3 = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 44, H - 4, 28, 5);
      const rush = [0, 12, 24, 16][frame];

      ctx.fillStyle = p.camoMid;
      ctx.fillRect(20 + rush / 2, 52, 34, 24);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24 + rush / 2, 30, 28, 22);

      // Jet punch fist
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(52 + rush, 32, 16, 14);
      // Thrust trail
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16 + rush / 2, 36, 8, 8);
      ctx.fillStyle = p.glow;
      ctx.fillRect(10 + rush / 2, 38, 12, 6);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(32 + rush / 2, 14, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(31 + rush / 2, 5, 16, 9);
    }));

    // HIT, BLOCK, KNOCKDOWN, VICTORY
    anims.HIT = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 36, H - 4, 20, 5);
      const recoil = [4, 8][frame];
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(20 - recoil, 50, 30, 26);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24 - recoil, 28, 28, 22);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30 - recoil * 1.5, 12, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(29 - recoil * 1.5, 3, 16, 9);
    }));

    anims.HIT_CROUCH = anims.HIT;
    anims.HIT_AIR = anims.HIT;

    anims.BLOCK = [renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(24, 48, 30, 28);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 26, 30, 22);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(40, 24, 14, 16); // Heavy cross guard
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30, 12, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(29, 3, 16, 9);
    })];

    anims.CROUCH_BLOCK = [renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 26, 5);
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(18, 56, 44, 20);
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(40, 38, 14, 16);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(30, 20, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(29, 11, 16, 9);
    })];

    anims.KNOCKDOWN = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      if (frame === 0) {
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(16, 46, 50, 16);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(10, 44, 12, 12);
      } else if (frame === 1) {
        this.drawShadow(ctx, 40, H - 4, 48, 6);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(14, 74, 54, 11);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(8, 72, 12, 12);
      } else {
        this.drawShadow(ctx, 40, H - 4, 32, 5);
        ctx.fillStyle = p.camoMid;
        ctx.fillRect(22, 62, 36, 18);
        ctx.fillStyle = p.skinMid;
        ctx.fillRect(28, 44, 14, 14);
      }
    }));

    anims.VICTORY = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);
      // Stands tall, military salute + dog tags gleam
      ctx.fillStyle = p.camoMid;
      ctx.fillRect(24, 48, 28, 28);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(24, 24, 30, 24);
      // Hand saluting temple
      ctx.fillStyle = p.vestDark;
      ctx.fillRect(44, 10, 10, 8);
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(38, 18, 8, 12);
      // Dog tag gleam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(38, 32, 6, 6);

      ctx.fillStyle = p.skinMid;
      ctx.fillRect(32, 8, 14, 14);
      ctx.fillStyle = p.hairMid;
      ctx.fillRect(31, -1, 16, 9);
    }));

    return anims;
  }

  // ==========================================
  // KAGURA - The Cyber Kunoichi
  // ==========================================
  buildKaguraFrames(p, W, H) {
    const anims = {};

    const renderFrame = (drawFn) => {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawFn(ctx);
      return canvas;
    };

    // IDLE (4 Frames)
    anims.IDLE = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      const bob = [0, 1, 0, -1][frame];
      const flutter = [0, 1, 2, 1][frame];

      this.drawShadow(ctx, 40, H - 4, 16, 4);

      // Agile Shinobi Boots
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(28, 70, 8, 14);
      ctx.fillRect(44, 70, 8, 14);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(28, 80, 8, 3); // Cyan glow trims
      ctx.fillRect(44, 80, 8, 3);

      // Sleek Ninja Trousers
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(26, 48 + bob, 12, 24);
      ctx.fillRect(42, 48 + bob, 12, 24);

      // Slender Torso / Kunoichi Armor
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 28 + bob, 24, 20);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 30 + bob, 16, 16);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(39, 32 + bob, 2, 12); // Glowing cyber spine

      // Wakizashi / Twin Kunai sheathed at hips
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(24, 46 + bob, 6, 2);
      ctx.fillRect(50, 46 + bob, 6, 2);

      // Arms & Fingerless Shinobi Gloves
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(20, 32 + bob, 8, 14);
      ctx.fillRect(52, 32 + bob, 8, 14);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(20, 26 + bob, 8, 8);
      ctx.fillRect(52, 24 + bob, 8, 8);

      // Head & Shinobi Cowl
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(34, 10 + bob, 12, 14);
      // Glowing Cyan Visor / Ninja Mask
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(38, 16 + bob, 6, 3);

      // Dark Ponytail
      ctx.fillStyle = p.hairShadow;
      ctx.fillRect(30, 8 + bob, 6, 12);

      // Crimson Long Scarf Rippling
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(32, 22 + bob, 16, 6);
      // Scarf tails flowing in wind
      ctx.fillRect(18 - flutter * 2, 24 + bob + flutter, 14, 5);
      ctx.fillRect(10 - flutter * 3, 28 + bob + flutter * 2, 12, 4);
    }));

    // WALK FORWARD (4 Frames)
    anims.WALK_FWD = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      const step = [0, 2, 0, -2][frame];
      const stride = [-6, 0, 6, 0][frame];

      this.drawShadow(ctx, 40, H - 4, 16, 4);

      ctx.fillStyle = p.suitMid;
      ctx.fillRect(26 - stride, 48, 12, 24);
      ctx.fillRect(42 + stride, 48, 12, 24);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(26 - stride, 72, 8, 12);
      ctx.fillRect(42 + stride, 72, 8, 12);

      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 28 + step, 24, 20);

      // Flowing Scarf
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(32, 22 + step, 16, 6);
      ctx.fillRect(16, 24 + step, 16, 5);

      ctx.fillStyle = p.suitDark;
      ctx.fillRect(34, 10 + step, 12, 14);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(38, 16 + step, 6, 3);
    }));

    anims.WALK_BACK = anims.WALK_FWD;

    // CROUCH (2 Frames)
    anims.CROUCH = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 20, 4);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(20, 56, 38, 20);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(26, 38, 24, 18);
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(28, 34, 16, 5);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 20, 12, 14);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(36, 26, 6, 3);
    }));

    // JUMP (Acrobatic Ninja Flip)
    anims.JUMP = [0, 1, 2].map(frame => renderFrame(ctx => {
      const yOff = [4, -20, -6][frame];
      this.drawShadow(ctx, 40, H - 4, 12, 3);

      ctx.fillStyle = p.suitMid;
      ctx.fillRect(28, 44 + yOff, 22, 18);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 26 + yOff, 22, 18);
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(16, 30 + yOff, 16, 5);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 12 + yOff, 12, 14);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(36, 18 + yOff, 6, 3);
    }));

    // LIGHT PUNCH (Palm Strike with Ki)
    anims.ATTACK_LP = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 18, 4);
      const reach = [0, 16, 4][frame];

      ctx.fillStyle = p.suitMid;
      ctx.fillRect(26, 48, 24, 26);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 28, 22, 20);

      // Agile Palm Thrust
      ctx.fillStyle = p.skinMid;
      ctx.fillRect(48, 32, 10 + reach, 6);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(56 + reach, 30, 8, 10); // Glowing palm

      ctx.fillStyle = p.suitDark;
      ctx.fillRect(34, 10, 12, 14);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(38, 16, 6, 3);
    }));

    // HEAVY PUNCH (Dual Kunai Slash)
    anims.ATTACK_HP = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 22, 5);
      const reach = [0, 12, 22, 10][frame];

      ctx.fillStyle = p.suitMid;
      ctx.fillRect(24, 48, 26, 26);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 28, 22, 20);

      // Dual Kunai Daggers
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(48, 28, 12 + reach, 4);
      ctx.fillRect(46, 36, 14 + reach, 4);
      // Energy Slash Arc
      if (frame === 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(66 + reach, 18, 6, 28);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(70 + reach, 14, 4, 36);
      }

      ctx.fillStyle = p.suitDark;
      ctx.fillRect(34, 10, 12, 14);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(38, 16, 6, 3);
    }));

    // LIGHT KICK (Snap Kick)
    anims.ATTACK_LK = [0, 1, 2].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 36, H - 4, 16, 4);
      const reach = [0, 18, 6][frame];
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(26, 48, 12, 26);
      ctx.fillRect(38, 52, 14 + reach, 8);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(50 + reach, 50, 10, 10);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 28, 20, 20);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 12, 12, 12);
    }));

    // HEAVY KICK (Crescent Heel Drop)
    anims.ATTACK_HK = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 38, H - 4, 18, 4);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(28, 50, 12, 24);

      if (frame === 1 || frame === 2) {
        // High vertical axe kick
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(36, 18, 12, 34);
        ctx.fillStyle = p.neonGlow;
        ctx.fillRect(44, 12, 12, 12); // Glowing heel
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(52, 16, 4, 30);
      } else {
        ctx.fillStyle = p.suitMid;
        ctx.fillRect(34, 46, 14, 16);
      }

      ctx.fillStyle = p.suitLight;
      ctx.fillRect(24, 28, 20, 20);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(28, 12, 12, 12);
    }));

    // CROUCH LP & CROUCH HK
    anims.CROUCH_LP = [0, 1, 2].map(frame => renderFrame(ctx => {
      const reach = [0, 14, 4][frame];
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(20, 56, 36, 20);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(24, 38, 22, 18);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(46 + reach, 44, 10, 8);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(30, 22, 12, 12);
    }));

    anims.CROUCH_HK = [0, 1, 2].map(frame => renderFrame(ctx => {
      const reach = [0, 26, 8][frame];
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(22, 54, 22, 18);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(34, 70, 20 + reach, 10);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(52 + reach, 68, 12, 12);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(26, 38, 12, 12);
    }));

    // JUMP PUNCH & JUMP KICK
    anims.JUMP_PUNCH = [0, 1].map(frame => renderFrame(ctx => {
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(26, 30, 22, 22);
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(48, 40, 14, 4);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 14, 12, 12);
    }));

    anims.JUMP_KICK = [0, 1].map(frame => renderFrame(ctx => {
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(24, 28, 22, 22);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(54, 42, 14, 10);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(28, 14, 12, 12);
    }));

    // SPECIAL 1: SHADOW WARP (Teleport)
    anims.SPECIAL_1 = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 16, 4);
      const alpha = [0.8, 0.2, 0.2, 0.9][frame];
      ctx.globalAlpha = alpha;

      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 30, 24, 38);
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(24, 28, 28, 6);

      // Dark purple smoke puff
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(18, 24, 12, 12);
      ctx.fillRect(48, 20, 14, 14);
      ctx.fillRect(34, 10, 16, 16);

      ctx.globalAlpha = 1.0;
    }));

    // SPECIAL 2: CRESCENT GALE (Triple Rising Flip Kick)
    anims.SPECIAL_2 = [0, 1, 2, 3, 4].map(frame => renderFrame(ctx => {
      const yOff = [2, -12, -26, -18, -6][frame];
      this.drawShadow(ctx, 40, H - 4, 12, 3);

      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 30 + yOff, 22, 22);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(32, 48 + yOff, 12, 20);

      // Violet Wind Blade trail
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(48, 16 + yOff, 8, 26);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(52, 10 + yOff, 10, 36);

      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 14 + yOff, 12, 12);
    }));

    // SPECIAL 3: KI KUNAI (Throws glowing kunai projectile)
    anims.SPECIAL_3 = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 38, H - 4, 18, 4);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(26, 30, 24, 22);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(26, 50, 24, 26);

      // Throws two kunai forward
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(52, 30, 16, 4);
      ctx.fillRect(54, 38, 16, 4);
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(66, 29, 6, 6);
      ctx.fillRect(68, 37, 6, 6);

      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 12, 12, 14);
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(16, 24, 14, 5);
    }));

    // HIT, BLOCK, KNOCKDOWN, VICTORY
    anims.HIT = [0, 1].map(frame => renderFrame(ctx => {
      const recoil = [4, 8][frame];
      this.drawShadow(ctx, 36, H - 4, 16, 4);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(24 - recoil, 30, 24, 22);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(24 - recoil, 50, 22, 26);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(28 - recoil * 1.5, 14, 12, 12);
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(16 - recoil * 1.5, 22, 14, 5);
    }));

    anims.HIT_CROUCH = anims.HIT;
    anims.HIT_AIR = anims.HIT;

    anims.BLOCK = [renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 18, 4);
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(26, 30, 22, 22);
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(38, 24, 4, 16); // Crossed kunai block
      ctx.fillRect(44, 24, 4, 16);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(30, 14, 12, 12);
    })];

    anims.CROUCH_BLOCK = [renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 20, 4);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(20, 56, 38, 20);
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(38, 40, 4, 14);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(30, 22, 12, 12);
    })];

    anims.KNOCKDOWN = [0, 1, 2, 3].map(frame => renderFrame(ctx => {
      if (frame === 0) {
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(16, 44, 46, 14);
      } else if (frame === 1) {
        this.drawShadow(ctx, 40, H - 4, 44, 5);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(14, 76, 50, 9);
      } else {
        this.drawShadow(ctx, 40, H - 4, 28, 4);
        ctx.fillStyle = p.suitLight;
        ctx.fillRect(24, 62, 32, 16);
      }
    }));

    anims.VICTORY = [0, 1].map(frame => renderFrame(ctx => {
      this.drawShadow(ctx, 40, H - 4, 18, 4);
      // Elegant ninja pose, twirling kunai
      ctx.fillStyle = p.suitLight;
      ctx.fillRect(28, 26, 22, 24);
      ctx.fillStyle = p.suitMid;
      ctx.fillRect(28, 48, 22, 28);
      ctx.fillStyle = p.bladeMetal;
      ctx.fillRect(48, 22, 4, 16); // Kunai held upright
      ctx.fillStyle = p.neonGlow;
      ctx.fillRect(49, 18, 2, 6);
      ctx.fillStyle = p.suitDark;
      ctx.fillRect(32, 10, 12, 14);
      ctx.fillStyle = p.scarfBright;
      ctx.fillRect(16 - frame * 2, 20 + frame, 16, 5);
    }));

    return anims;
  }

  // Draw ground shadow ellipse
  drawShadow(ctx, cx, cy, rx, ry) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Generic frame builder for new characters (Fang, Zephyr, Colossus, Endless Dragon)
  buildGenericFrames(p, width, height) {
    const frames = {};
    const stateConfigs = {
      idle: 4, walk: 6, jump: 3, crouch: 2, hit: 2, knockdown: 3, block: 2,
      light_punch: 3, heavy_punch: 4, light_kick: 3, heavy_kick: 4,
      crouch_lp: 3, crouch_hp: 4, crouch_lk: 3, crouch_hk: 4,
      jump_punch: 2, jump_kick: 2,
      special_1: 5, special_2: 5, special_3: 4,
      ultimate: 8, dirty: 3, dash: 3
    };

    // Determine body proportions based on palette
    const isMighty = !!p.armorGold;
    const isColossus = !isMighty && !!p.glovesRed;
    const isDragon = !!p.scalesLight;
    const bodyW = (isColossus || isMighty) ? 36 : (isDragon ? 34 : 28);
    const bodyH = (isColossus || isMighty) ? 28 : 26;

    // Pick main colors from whatever palette keys exist
    const skinH = p.skinHighlight || p.scalesLight || '#ccc';
    const skinM = p.skinMid || p.scalesMid || '#aaa';
    const skinS = p.skinShadow || p.scalesDark || '#777';
    const hairC = p.hair || p.hornBone || '#333';
    const glowC = p.glow || '#fff';

    // Torso color
    const torsoC = p.wrapsWhite || p.tankGreen || p.glovesRed || p.scalesLight || skinH;
    const torsoS = p.wrapsShadow || p.tankShadow || p.glovesShadow || p.scalesDark || skinS;
    // Legs color
    const legsC = p.shortsRed || p.pantsWhite || p.shortsBlack || p.scalesMid || '#555';
    const legsS = p.shortsShadow || p.pantsShadow || p.shortsShadow || p.scalesDark || '#333';
    // Feet color
    const feetC = p.skinShadow || p.shoesYellow || p.bootsBlack || p.scalesDark || '#444';

    for (const [state, count] of Object.entries(stateConfigs)) {
      frames[state] = [];
      for (let i = 0; i < count; i++) {
        const { canvas, ctx } = this.createCanvas(width, height);

        // Animation offsets
        const bob = state === 'idle' ? Math.sin(i * 1.57) * 2 : 0;
        const walkShift = state === 'walk' ? Math.sin(i * 1.05) * 3 : 0;
        const hitShift = state === 'hit' ? 4 : 0;
        const crouchY = (state === 'crouch' || state.startsWith('crouch_')) ? 8 : 0;
        const jumpY = state === 'jump' ? -10 : 0;

        const bx = 26 - (isColossus ? 4 : 0); // body x offset
        const by = 24 + bob + crouchY + jumpY;

        // Shadow
        this.drawShadow(ctx, 40, 88, isColossus ? 22 : 18, 4);

        // Hair / Horns
        if (isDragon) {
          this.drawPixel(ctx, bx + 2, by - 16, 8, 10, p.hornBone);
          this.drawPixel(ctx, bx + bodyW - 10, by - 16, 8, 10, p.hornBone);
          this.drawPixel(ctx, bx + 4, by - 8, bodyW - 8, 10, hairC);
        } else {
          this.drawPixel(ctx, bx + 4, by - 10, bodyW - 8, 12, hairC);
          this.drawPixel(ctx, bx + 6, by - 8, bodyW - 12, 8, p.hairShadow || '#111');
        }

        // Head
        this.drawPixel(ctx, bx + 2, by, bodyW - 4, 12, skinH);
        this.drawPixel(ctx, bx + 4, by + 2, bodyW - 8, 8, skinM);

        // Eyes
        if (isMighty) {
          this.drawPixel(ctx, bx + 7, by + 3, 4, 3, '#38bdf8');
          this.drawPixel(ctx, bx + bodyW - 11, by + 3, 4, 3, '#38bdf8');
        } else if (isDragon) {
          this.drawPixel(ctx, bx + 8, by + 4, 4, 3, p.eyeGlow);
          this.drawPixel(ctx, bx + bodyW - 12, by + 4, 4, 3, p.eyeGlow);
        } else {
          this.drawPixel(ctx, bx + 8, by + 4, 3, 2, '#111');
          this.drawPixel(ctx, bx + bodyW - 11, by + 4, 3, 2, '#111');
        }

        // Torso
        this.drawPixel(ctx, bx, by + 12, bodyW, bodyH, torsoC);
        this.drawPixel(ctx, bx + 2, by + 14, bodyW - 4, bodyH - 4, torsoS);

        // Arms
        const armExtend = (state.includes('punch') || state.includes('special')) ? 14 + i * 4 : 0;
        const kickExtend = state.includes('kick') ? 8 : 0;
        // Left arm
        this.drawPixel(ctx, bx - 6 - hitShift, by + 14, 8, 18 + (state.includes('punch') && i > 0 ? 6 : 0), skinM);
        // Right arm (extends on attacks)
        this.drawPixel(ctx, bx + bodyW - 2, by + 14, 8 + armExtend, 8, skinM);

        // Gloves for Colossus
        if (isColossus) {
          this.drawPixel(ctx, bx - 8, by + 28, 10, 8, p.glovesRed);
          this.drawPixel(ctx, bx + bodyW + armExtend - 2, by + 14, 10, 10, p.glovesRed);
        }
        // Hand wraps for Fang
        if (p.wrapsWhite && !isColossus) {
          this.drawPixel(ctx, bx - 6, by + 28, 8, 6, p.wrapsWhite);
          this.drawPixel(ctx, bx + bodyW + armExtend, by + 16, 8, 6, p.wrapsWhite);
        }

        // Belt / Mongkol
        if (p.mongkolGold) {
          this.drawPixel(ctx, bx, by + 12 + bodyH, bodyW, 4, p.mongkolGold);
        } else if (p.beltGold) {
          this.drawPixel(ctx, bx + 2, by + 12 + bodyH, bodyW - 4, 4, p.beltGold);
        }

        // Legs
        const legY = by + 14 + bodyH;
        this.drawPixel(ctx, bx + 2 + walkShift, legY, 10, 16 + kickExtend, legsC);
        this.drawPixel(ctx, bx + bodyW - 12 - walkShift, legY, 10, 16 + kickExtend, legsC);
        this.drawPixel(ctx, bx + 4 + walkShift, legY + 2, 6, 12, legsS);
        this.drawPixel(ctx, bx + bodyW - 10 - walkShift, legY + 2, 6, 12, legsS);

        // Feet
        this.drawPixel(ctx, bx + walkShift, legY + 16 + kickExtend, 12, 5, feetC);
        this.drawPixel(ctx, bx + bodyW - 14 - walkShift, legY + 16 + kickExtend, 12, 5, feetC);

        // Attack effects
        if (state.includes('special') || state === 'ultimate') {
          ctx.globalAlpha = 0.5 + Math.sin(i * 1.2) * 0.3;
          ctx.fillStyle = glowC;
          ctx.beginPath();
          ctx.arc(40 + armExtend, by + 20, 8 + i * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Divine God Aura for M1GHTY
        if (isMighty) {
          ctx.globalAlpha = 0.35 + Math.sin(i * 1.5) * 0.2;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(40, by + 18, 30 + Math.sin(i * 2.0) * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Dragon flame aura
        if (isDragon && (state === 'idle' || state.includes('special') || state === 'ultimate')) {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = p.flameCore;
          ctx.beginPath();
          ctx.arc(40, by + 20, 22 + Math.sin(i * 1.5) * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = p.flameOuter;
          ctx.beginPath();
          ctx.arc(40, by + 16, 28 + Math.sin(i * 1.2) * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Hit flash
        if (state === 'hit' || state === 'knockdown') {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx, by, bodyW, bodyH + 20);
          ctx.globalAlpha = 1.0;
        }

        frames[state].push(canvas);
      }
    }

    // Map to uppercase FIGHTER_STATE keys for engine rendering
    const upperMap = {
      idle: ['IDLE', 'WINDED', 'VICTORY'],
      walk: ['WALK_FWD', 'WALK_BACK'],
      jump: ['JUMP', 'FALL', 'LAND', 'WALL_REBOUND'],
      crouch: ['CROUCH'],
      hit: ['HIT', 'HIT_CROUCH', 'HIT_AIR', 'BLIND_STUN', 'SUBMISSION_LOCK', 'OVERHEAT_STUN'],
      knockdown: ['KNOCKDOWN', 'DEFEAT'],
      block: ['BLOCK', 'CROUCH_BLOCK'],
      light_punch: ['ATTACK_LP', 'ATTACK_LIGHT_PUNCH'],
      heavy_punch: ['ATTACK_HP', 'ATTACK_HEAVY_PUNCH', 'PICKUP_ATTACK'],
      light_kick: ['ATTACK_LK', 'ATTACK_LIGHT_KICK'],
      heavy_kick: ['ATTACK_HK', 'ATTACK_HEAVY_KICK'],
      crouch_lp: ['CROUCH_LP', 'CROUCH_LIGHT_PUNCH'],
      crouch_hp: ['CROUCH_HP', 'CROUCH_HEAVY_PUNCH'],
      crouch_lk: ['CROUCH_LK', 'CROUCH_LIGHT_KICK'],
      crouch_hk: ['CROUCH_HK', 'CROUCH_HEAVY_KICK'],
      jump_punch: ['JUMP_PUNCH'],
      jump_kick: ['JUMP_KICK'],
      special_1: ['SPECIAL_1'],
      special_2: ['SPECIAL_2'],
      special_3: ['SPECIAL_3'],
      ultimate: ['ULTIMATE', 'SUPER'],
      dirty: ['DIRTY_TACTIC'],
      dash: ['DASH_FWD', 'DASH_BACK']
    };
    for (const [s, keys] of Object.entries(upperMap)) {
      if (frames[s]) {
        for (const k of keys) {
          frames[k] = frames[s];
        }
      }
    }
    // Guarantee IDLE is always present
    if (!frames.IDLE && frames.idle) frames.IDLE = frames.idle;

    return frames;
  }
}

export const spriteGenerator = new SpriteGenerator();
