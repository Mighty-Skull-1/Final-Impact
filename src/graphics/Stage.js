// Final Impact - Parallax Stage Rendering Engine
// Authentic 16-bit multi-layered arcade stages

export class Stage {
  constructor(stageId = 'suzaku') {
    this.stageId = stageId;
    this.time = 0;
    this.trainX = -300;
    this.lightningTimer = 0;
    this.isLightning = false;
    this.petals = [];
    this.steamParticles = [];

    // Initialize decorative particles
    this.initParticles();
  }

  initParticles() {
    // Cherry blossom petals for Suzaku
    for (let i = 0; i < 30; i++) {
      this.petals.push({
        x: Math.random() * 1000,
        y: Math.random() * 360,
        speedX: 0.8 + Math.random() * 1.2,
        speedY: 0.4 + Math.random() * 0.8,
        size: 2 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: 0.02 + Math.random() * 0.03
      });
    }

    // Steam vents for Neo Tokyo
    for (let i = 0; i < 20; i++) {
      this.steamParticles.push({
        x: 400 + Math.random() * 40 - 20,
        y: 290,
        speedY: -0.4 - Math.random() * 0.5,
        speedX: -0.2 + Math.random() * 0.4,
        size: 2 + Math.random() * 4,
        alpha: 0.6,
        life: Math.random() * 60
      });
    }
  }

  update() {
    this.time++;

    // Stage 1: Petals
    if (this.stageId === 'suzaku') {
      this.petals.forEach(p => {
        p.x -= p.speedX;
        p.y += p.speedY;
        p.angle += p.rotSpeed;
        if (p.x < -10) p.x = 1000;
        if (p.y > 360) p.y = -10;
      });
    }

    // Stage 2: Neo Tokyo Train & Steam
    if (this.stageId === 'neo_tokyo') {
      this.trainX += 8;
      if (this.trainX > 1400) {
        if (Math.random() < 0.01) this.trainX = -500;
      }

      this.steamParticles.forEach(s => {
        s.y += s.speedY;
        s.x += s.speedX;
        s.size += 0.05;
        s.alpha -= 0.008;
        s.life++;
        if (s.alpha <= 0 || s.y < 230) {
          s.x = 400 + Math.random() * 30 - 15;
          s.y = 290;
          s.alpha = 0.6;
          s.size = 2 + Math.random() * 3;
          s.life = 0;
        }
      });
    }

    // Stage 3: Thunder Dojo Lightning
    if (this.stageId === 'thunder_dojo') {
      this.lightningTimer++;
      if (this.lightningTimer > 200 && Math.random() < 0.03) {
        this.isLightning = true;
        this.lightningTimer = 0;
        setTimeout(() => { this.isLightning = false; }, 80);
      }
    }
  }

  render(ctx, cameraX, canvasWidth, canvasHeight) {
    if (this.stageId === 'suzaku') {
      this.renderSuzaku(ctx, cameraX, canvasWidth, canvasHeight);
    } else if (this.stageId === 'neo_tokyo') {
      this.renderNeoTokyo(ctx, cameraX, canvasWidth, canvasHeight);
    } else {
      this.renderThunderDojo(ctx, cameraX, canvasWidth, canvasHeight);
    }
  }

  // ==========================================
  // STAGE 1: SUZAKU ROOFTOP (Sunset)
  // ==========================================
  renderSuzaku(ctx, cameraX, W, H) {
    // 1. Sky Gradient (Sunset)
    const sky = ctx.createLinearGradient(0, 0, 0, 240);
    sky.addColorStop(0, '#31103f');
    sky.addColorStop(0.3, '#781d42');
    sky.addColorStop(0.65, '#c73e3a');
    sky.addColorStop(0.85, '#e67e22');
    sky.addColorStop(1, '#f39c12');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Distant Sunset Japanese Red Sun
    const sunX = 420 - cameraX * 0.05;
    ctx.fillStyle = '#ff3838';
    ctx.beginPath();
    ctx.arc(sunX, 130, 48, 0, Math.PI * 2);
    ctx.fill();

    // Sunset Clouds (Parallax 0.1)
    ctx.fillStyle = 'rgba(120, 29, 66, 0.4)';
    const cloudOffset = (this.time * 0.2 - cameraX * 0.1) % W;
    ctx.fillRect(cloudOffset - W, 80, 180, 24);
    ctx.fillRect(cloudOffset + 100, 60, 240, 30);
    ctx.fillRect(cloudOffset + 420, 95, 200, 22);

    // 2. Far Skyline Silhouette (Pagodas + Distant Tokyo Tower) (Parallax 0.2)
    const farX = -cameraX * 0.2;
    ctx.fillStyle = '#2b0c2c';
    for (let x = -100; x < W + 200; x += 120) {
      const px = x + farX;
      // Pagoda roof silhouettes
      ctx.beginPath();
      ctx.moveTo(px, 200);
      ctx.lineTo(px + 40, 160);
      ctx.lineTo(px + 80, 200);
      ctx.fill();
      ctx.fillRect(px + 20, 180, 40, 60);

      // Distant blinking antenna towers
      ctx.fillRect(px + 95, 140, 3, 70);
      if (this.time % 60 < 30) {
        ctx.fillStyle = '#ff2a4b';
        ctx.fillRect(px + 94, 138, 5, 3);
        ctx.fillStyle = '#2b0c2c';
      }
    }

    // 3. Midground Rooftops & Stone Lanterns (Parallax 0.5)
    const midX = -cameraX * 0.5;
    ctx.fillStyle = '#1a081e';
    ctx.fillRect(0, 220, W, 80);

    // Roof ridges
    for (let x = -80; x < W + 100; x += 90) {
      const rx = x + midX;
      ctx.fillStyle = '#3a1740';
      ctx.fillRect(rx, 215, 80, 10);
      // Traditional curved ridge ends
      ctx.fillRect(rx - 4, 212, 6, 6);
      ctx.fillRect(rx + 78, 212, 6, 6);
    }

    // Swaying Paper Lantern with warm flame
    const lanternX = 260 - cameraX * 0.5;
    const sway = Math.sin(this.time * 0.05) * 4;
    ctx.fillStyle = '#3d1620';
    ctx.fillRect(lanternX, 160, 2, 30);
    // Lantern body
    ctx.fillStyle = '#d9381e';
    ctx.fillRect(lanternX - 10 + sway, 190, 22, 28);
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(lanternX - 6 + sway, 196, 14, 16); // Glowing core

    // 4. Foreground Arena: Suzaku Tiled Castle Rooftop (Parallax 1.0)
    const floorY = 290;
    const fgX = -cameraX * 1.0;

    // Main roof platform
    ctx.fillStyle = '#1e1022';
    ctx.fillRect(0, floorY, W, H - floorY);

    // Large roof tiles
    for (let x = -60; x < W + 80; x += 40) {
      const tx = x + (fgX % 40);
      ctx.fillStyle = '#331a38';
      ctx.fillRect(tx, floorY, 36, 12);
      ctx.fillStyle = '#4c2654';
      ctx.fillRect(tx + 2, floorY + 2, 32, 4);
      // Wooden beam supports
      ctx.fillStyle = '#59292b';
      ctx.fillRect(tx + 16, floorY + 12, 8, 58);
    }

    // Drifting Cherry Blossom Petals
    ctx.fillStyle = '#f472b6';
    this.petals.forEach(p => {
      const screenX = (p.x - cameraX * 0.8) % (W + 80);
      ctx.save();
      ctx.translate(screenX, p.y);
      ctx.rotate(p.angle);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    });
  }

  // ==========================================
  // STAGE 2: NEO TOKYO UNDERPASS (Cyberpunk)
  // ==========================================
  renderNeoTokyo(ctx, cameraX, W, H) {
    // 1. Dark Metropolis Rain Sky
    ctx.fillStyle = '#080914';
    ctx.fillRect(0, 0, W, H);

    // Distant Neon Skyscrapers (Parallax 0.2)
    const farX = -cameraX * 0.2;
    for (let i = 0; i < 12; i++) {
      const bx = i * 90 + farX;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx, 60 + (i % 3) * 20, 70, 200);

      // Lit windows
      ctx.fillStyle = (i % 2 === 0) ? '#06b6d4' : '#ec4899';
      for (let wy = 80; wy < 220; wy += 18) {
        if ((i + wy) % 5 === 0) {
          ctx.fillRect(bx + 10, wy, 8, 6);
          ctx.fillRect(bx + 30, wy, 8, 6);
          ctx.fillRect(bx + 50, wy, 8, 6);
        }
      }
    }

    // 2. High-speed Elevated Railway & Passing Train (Parallax 0.4)
    const railY = 170;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, railY, W, 8);
    // Rail pillars
    for (let px = -50; px < W + 100; px += 140) {
      const rx = px - cameraX * 0.4;
      ctx.fillRect(rx, railY + 8, 16, 60);
    }

    // High speed bullet train
    const trainScreenX = this.trainX - cameraX * 0.4;
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(trainScreenX, railY - 14, 280, 14);
    // Glowing train passenger windows
    ctx.fillStyle = '#fef08a';
    for (let wx = 10; wx < 260; wx += 24) {
      ctx.fillRect(trainScreenX + wx, railY - 10, 16, 6);
    }

    // 3. Huge Cyberpunk Billboard Signs (Parallax 0.6)
    const bbX = 320 - cameraX * 0.6;
    ctx.fillStyle = '#111827';
    ctx.fillRect(bbX, 80, 140, 60);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(bbX, 80, 140, 60);
    // Neon text
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('FINAL IMPACT', bbX + 10, 105);
    ctx.fillStyle = '#06b6d4';
    ctx.font = '11px monospace';
    ctx.fillText('NEO-TOKYO // 2099', bbX + 12, 125);

    // 4. Foreground: Wet Asphalt & Puddle Reflections (Parallax 1.0)
    const floorY = 290;
    const fgX = -cameraX * 1.0;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, floorY, W, H - floorY);

    // Wet road sheen & lane markers
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, floorY, W, 4);

    for (let x = -60; x < W + 100; x += 100) {
      const lx = x + (fgX % 100);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.fillRect(lx, floorY + 16, 50, 6);
    }

    // Neon Puddle reflections on ground
    ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
    ctx.beginPath();
    ctx.ellipse(360 - cameraX * 0.9, floorY + 24, 70, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.beginPath();
    ctx.ellipse(180 - cameraX * 0.9, floorY + 36, 50, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rising steam from subway vent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    this.steamParticles.forEach(s => {
      const sx = s.x - cameraX * 0.9;
      ctx.beginPath();
      ctx.arc(sx, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ==========================================
  // STAGE 3: THUNDER DOJO
  // ==========================================
  renderThunderDojo(ctx, cameraX, W, H) {
    // 1. Dark Storm Wall / Shoji Windows
    ctx.fillStyle = this.isLightning ? '#e2e8f0' : '#14141d';
    ctx.fillRect(0, 0, W, H);

    // Distant lightning flash outside windows
    if (this.isLightning) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 40, W, 180);
    }

    // Traditional Shoji Window Lattice (Parallax 0.3)
    const winX = -cameraX * 0.3;
    for (let x = -80; x < W + 100; x += 110) {
      const sx = x + winX;
      ctx.fillStyle = this.isLightning ? '#ffffff' : '#2b2b3b';
      ctx.fillRect(sx, 50, 95, 140);
      // Shoji grid wood
      ctx.fillStyle = '#451a03';
      ctx.fillRect(sx, 50, 95, 4);
      ctx.fillRect(sx, 186, 95, 4);
      ctx.fillRect(sx, 50, 4, 140);
      ctx.fillRect(sx + 91, 50, 4, 140);
      // Crossbars
      ctx.fillRect(sx, 95, 95, 3);
      ctx.fillRect(sx, 140, 95, 3);
      ctx.fillRect(sx + 30, 50, 3, 140);
      ctx.fillRect(sx + 60, 50, 3, 140);
    }

    // 2. Dragon Scroll Hanging Tapestry (Parallax 0.6)
    const tapX = 280 - cameraX * 0.6;
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(tapX, 60, 80, 130);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(tapX + 6, 66, 68, 118);
    // Golden Dragon Crest
    ctx.fillStyle = '#facc15';
    ctx.fillRect(tapX + 24, 85, 32, 40);
    ctx.fillStyle = '#7f1d1d';
    ctx.font = 'bold 24px serif';
    ctx.fillText('竜', tapX + 28, 115); // "Dragon" Kanji

    // Katana Display Stand
    const swordX = 480 - cameraX * 0.6;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(swordX, 170, 50, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(swordX - 10, 166, 70, 3); // Silver Katana blade

    // 3. Foreground: Polished Tatami Mats & Wood Floor (Parallax 1.0)
    const floorY = 290;
    const fgX = -cameraX * 1.0;

    // Wooden border
    ctx.fillStyle = '#291307';
    ctx.fillRect(0, floorY, W, 8);

    // Tatami Mats
    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, floorY + 8, W, H - floorY - 8);

    // Tatami woven borders
    for (let x = -80; x < W + 120; x += 120) {
      const tx = x + (fgX % 120);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(tx, floorY + 8, 10, H - floorY - 8);
      // Tatami green weave
      ctx.fillStyle = '#57534e';
      ctx.fillRect(tx + 10, floorY + 8, 110, H - floorY - 8);
    }
  }
}
