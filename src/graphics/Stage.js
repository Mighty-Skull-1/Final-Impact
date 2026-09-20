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
    } else if (this.stageId === 'dragon_shrine') {
      this.renderDragonShrine(ctx, cameraX, canvasWidth, canvasHeight);
    } else {
      this.renderThunderDojo(ctx, cameraX, canvasWidth, canvasHeight);
    }
    // Arena Edge Crowd Spectators
    this.renderCrowd(ctx, cameraX, canvasWidth, canvasHeight);
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

  // ==========================================
  // ARENA EDGE CROWD SPECTATORS
  // ==========================================
  renderCrowd(ctx, cameraX, W, H) {
    const leftX = 15 - cameraX;
    const rightX = 890 - cameraX;

    // 1. Left Corner Crowd
    if (leftX > -90 && leftX < 240) {
      ctx.save();
      // Metal guard rail
      ctx.fillStyle = '#475569';
      ctx.fillRect(leftX - 10, 248, 70, 5);
      ctx.fillRect(leftX, 253, 4, 47);
      ctx.fillRect(leftX + 45, 253, 4, 47);

      // Punk with Mohawk
      const b1 = Math.sin(this.time * 0.16) * 3.5;
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(leftX + 6, 204 + b1, 14, 14); // face
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(leftX + 10, 194 + b1, 6, 11); // red mohawk
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(leftX + 14, 212 + b1, 4, 3); // mouth
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(leftX + 4, 218 + b1, 18, 30); // vest
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(leftX + 18, 198 + b1, 6, 14); // arm up
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(leftX + 17, 194 + b1, 8, 5); // fist wrap

      // Hype fan with cap
      const b2 = Math.cos(this.time * 0.22) * 3;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(leftX + 28, 208 + b2, 18, 6); // orange cap brim
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(leftX + 30, 214 + b2, 14, 12); // face
      ctx.fillStyle = '#15803d';
      ctx.fillRect(leftX + 26, 226 + b2, 22, 22); // green shirt
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(leftX + 24, 205 + b2 * 1.3, 6, 8); // left waving arm
      ctx.fillRect(leftX + 44, 207 + b2 * 1.3, 6, 8); // right waving arm
      ctx.restore();
    }

    // 2. Right Corner Crowd
    if (rightX > 400 && rightX < W + 90) {
      ctx.save();
      // Metal guard rail
      ctx.fillStyle = '#475569';
      ctx.fillRect(rightX - 5, 248, 70, 5);
      ctx.fillRect(rightX + 5, 253, 4, 47);
      ctx.fillRect(rightX + 50, 253, 4, 47);

      // Martial Arts Fan with White Headband
      const b3 = Math.sin(this.time * 0.18 + 1.2) * 3;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(rightX + 10, 202 + b3, 16, 7); // dark hair
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rightX + 9, 208 + b3, 18, 4); // white headband
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(rightX + 11, 212 + b3, 14, 12); // face
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(rightX + 8, 224 + b3, 20, 24); // red tank top
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(rightX + 4, 198 + b3 * 1.2, 6, 12); // raised arm
      ctx.fillRect(rightX + 24, 198 + b3 * 1.2, 6, 12); // raised arm

      // Street Brawler in Sunglasses
      const b4 = Math.cos(this.time * 0.14) * 2.5;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(rightX + 32, 204 + b4, 16, 7); // blonde hair
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rightX + 34, 211 + b4, 14, 4); // cool sunglasses
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(rightX + 34, 215 + b4, 13, 10); // face
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(rightX + 28, 225 + b4, 24, 23); // purple jacket
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(rightX + 20, 228 + b4, 10, 6); // pointing finger
      ctx.restore();
    }
  }

  // ==========================================
  // STAGE 8: DRAGON SHRINE (Crimson Twilight)
  // ==========================================
  renderDragonShrine(ctx, cameraX, W, H) {
    // 1. Crimson Dark Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 240);
    sky.addColorStop(0, '#0c0015');
    sky.addColorStop(0.25, '#1a0a2e');
    sky.addColorStop(0.5, '#3b0764');
    sky.addColorStop(0.75, '#7f1d1d');
    sky.addColorStop(1, '#450a0a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // 2. Ominous Blood Moon
    const moonX = W * 0.75 - cameraX * 0.05;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.3)';
    ctx.beginPath();
    ctx.arc(moonX, 55, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(moonX, 55, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(moonX + 6, 52, 26, 0, Math.PI * 2);
    ctx.fill();

    // 3. Dark Storm Clouds
    for (let i = 0; i < 8; i++) {
      const cx = (i * 140 + this.time * 0.15) % (W + 200) - 100;
      ctx.fillStyle = `rgba(30, 5, 56, ${0.5 + Math.sin(i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(cx, 30 + i * 8, 55 + i * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draconic Lightning (occasional)
    if (this.isLightning) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const lx = 200 + Math.random() * (W - 400);
      ctx.moveTo(lx, 0);
      for (let y = 0; y < 200; y += 15) {
        ctx.lineTo(lx + (Math.random() - 0.5) * 40, y);
      }
      ctx.stroke();
      // Flash
      ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.fillRect(0, 0, W, H);
    }

    // 5. Distant Mountain Silhouettes
    ctx.fillStyle = '#1e0538';
    ctx.beginPath();
    ctx.moveTo(0, 180);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x - cameraX * 0.08, 140 + Math.sin(x * 0.015) * 35);
    }
    ctx.lineTo(W, 300);
    ctx.lineTo(0, 300);
    ctx.fill();

    // 6. Ancient Stone Shrine Pillars
    const pillarColor = '#292524';
    const pillarHighlight = '#44403c';
    // Left pillar
    const lp = 60 - cameraX * 0.3;
    ctx.fillStyle = pillarColor;
    ctx.fillRect(lp, 120, 30, 180);
    ctx.fillStyle = pillarHighlight;
    ctx.fillRect(lp + 4, 120, 6, 180);
    // Pillar top
    ctx.fillStyle = '#78350f';
    ctx.fillRect(lp - 8, 112, 46, 12);
    // Rune glow on pillar
    ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(this.time * 0.04) * 0.3})`;
    ctx.fillRect(lp + 10, 160, 10, 3);
    ctx.fillRect(lp + 8, 200, 14, 3);
    ctx.fillRect(lp + 12, 240, 8, 3);

    // Right pillar
    const rp = W - 90 - cameraX * 0.3;
    ctx.fillStyle = pillarColor;
    ctx.fillRect(rp, 120, 30, 180);
    ctx.fillStyle = pillarHighlight;
    ctx.fillRect(rp + 20, 120, 6, 180);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(rp - 8, 112, 46, 12);
    ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(this.time * 0.05 + 1) * 0.3})`;
    ctx.fillRect(rp + 10, 170, 10, 3);
    ctx.fillRect(rp + 6, 210, 14, 3);
    ctx.fillRect(rp + 12, 250, 8, 3);

    // 7. Ground Platform (dark stone with glowing rune cracks)
    const groundGrad = ctx.createLinearGradient(0, 290, 0, H);
    groundGrad.addColorStop(0, '#1c1917');
    groundGrad.addColorStop(0.3, '#292524');
    groundGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 290, W, H - 290);

    // Glowing rune cracks in the ground
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(this.time * 0.03) * 0.25})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const rx = 80 + i * 150 - cameraX * 0.2;
      ctx.beginPath();
      ctx.moveTo(rx, 295);
      ctx.lineTo(rx + 15, 305);
      ctx.lineTo(rx + 5, 315);
      ctx.lineTo(rx + 20, 325);
      ctx.stroke();
    }

    // 8. Floating Ember/Ash Particles
    ctx.globalAlpha = 0.6;
    for (const p of this.petals) {
      const ex = p.x - cameraX * 0.1;
      ctx.fillStyle = Math.random() < 0.5 ? '#ef4444' : '#f97316';
      ctx.fillRect(ex, p.y, p.size * 0.7, p.size * 0.7);
    }
    ctx.globalAlpha = 1.0;

    // 9. Dark fog at bottom
    ctx.fillStyle = 'rgba(12, 0, 21, 0.4)';
    ctx.fillRect(0, 270, W, 25);
  }
}
