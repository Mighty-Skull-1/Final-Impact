// Final Impact - Skin Item Shop UI & Screen
// Allows players to preview, purchase, and equip fighter skins using earned coins.

import { SKIN_CATALOG, EconomyManager } from '../shop/SkinCatalog.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';
import { isMightyUnlocked } from '../utils/CryptoAuth.js';

export class ShopScreen {
  constructor() {
    this.fighters = [
      { id: 'kazuki', name: 'KAZUKI' },
      { id: 'raven', name: 'RAVEN' },
      { id: 'kagura', name: 'KAGURA' },
      { id: 'fang', name: 'FANG' },
      { id: 'zephyr', name: 'ZEPHYR' },
      { id: 'colossus', name: 'COLOSSUS' },
      { id: 'cinder', name: 'CINDER' },
      { id: 'glacier', name: 'GLACIER' },
      { id: 'mighty', name: 'M1GHTY' }
    ];

    this.selectedFighterIndex = 0;
    this.selectedSkinIndex = 0; // 0 = Default, 1+ = Catalog skins
    this.animTimer = 0;
    this.animFrame = 0;

    this.message = '';
    this.messageColor = '#38bdf8';
    this.messageTimer = 0;

    // Cache of preview sprites for the shop
    this.previewSprites = new Map();
  }

  get currentFighter() {
    // If M1GHTY is locked, skip him if selected or filter
    const mightyOpen = isMightyUnlocked();
    const availableFighters = this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);
    const safeIndex = Math.min(this.selectedFighterIndex, availableFighters.length - 1);
    return availableFighters[Math.max(0, safeIndex)] || this.fighters[0];
  }

  get availableSkins() {
    const fighterId = this.currentFighter.id;
    // Default skin is always slot 0
    const defaultSkin = {
      id: `${fighterId}_default`,
      fighterId,
      name: 'CLASSIC ORIGINAL',
      tier: 'CORE',
      tierColor: '#94a3b8',
      price: 0,
      desc: 'The signature battle-tested classic arcade tournament attire.',
      isDefault: true
    };
    const catalogSkins = SKIN_CATALOG.filter(s => s.fighterId === fighterId);
    return [defaultSkin, ...catalogSkins];
  }

  get currentSkin() {
    const skins = this.availableSkins;
    const safeIndex = Math.min(this.selectedSkinIndex, skins.length - 1);
    return skins[Math.max(0, safeIndex)] || skins[0];
  }

  getPreviewSprite(fighterId, skinId) {
    const key = `${fighterId}_${skinId || 'default'}`;
    if (!this.previewSprites.has(key)) {
      const sp = spriteGenerator.generateFighterSprites(fighterId, skinId);
      this.previewSprites.set(key, sp);
    }
    return this.previewSprites.get(key);
  }

  handleInput(inputState) {
    const skins = this.availableSkins;
    const mightyOpen = isMightyUnlocked();
    const availableFighters = this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);

    if (inputState.up) {
      this.selectedFighterIndex = (this.selectedFighterIndex - 1 + availableFighters.length) % availableFighters.length;
      this.selectedSkinIndex = 0;
      soundFX.playWhoosh('light');
    } else if (inputState.down) {
      this.selectedFighterIndex = (this.selectedFighterIndex + 1) % availableFighters.length;
      this.selectedSkinIndex = 0;
      soundFX.playWhoosh('light');
    }

    if (inputState.left) {
      this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
      soundFX.playWhoosh('light');
    } else if (inputState.right) {
      this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
      soundFX.playWhoosh('light');
    }

    if (inputState.confirm || inputState.lp || inputState.hp) {
      this.triggerSkinAction();
    }
  }

  triggerSkinAction() {
    const skin = this.currentSkin;
    const fighter = this.currentFighter;
    const equipped = EconomyManager.getEquippedSkin(fighter.id);
    const isEquipped = (equipped === skin.id) || (!equipped && skin.isDefault);

    if (isEquipped) {
      this.showMessage('ALREADY EQUIPPED!', '#fbbf24');
      soundFX.playBlock();
      return;
    }

    const isOwned = skin.isDefault || EconomyManager.isSkinOwned(skin.id);

    if (isOwned) {
      EconomyManager.equipSkin(fighter.id, skin.isDefault ? null : skin.id);
      this.showMessage(`✨ ${skin.name} EQUIPPED! ✨`, '#4ade80');
      soundFX.playUltimateActivation();
    } else {
      const res = EconomyManager.buySkin(skin.id);
      if (res.success) {
        EconomyManager.equipSkin(fighter.id, skin.id);
        this.showMessage(`🎉 UNLOCKED & EQUIPPED: ${skin.name}!`, '#facc15');
        soundFX.playUltimateActivation();
      } else {
        this.showMessage('❌ INSUFFICIENT COINS! WIN MATCHES TO EARN MORE.', '#ef4444');
        soundFX.playBlock();
      }
    }
  }

  showMessage(text, color) {
    this.message = text;
    this.messageColor = color;
    this.messageTimer = 180; // 3 seconds at 60fps
  }

  update() {
    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 4;
    }
    if (this.messageTimer > 0) {
      this.messageTimer--;
    }
  }

  handleMouseClick(x, y, W, H) {
    // Back button hit test (top left: 16, 12, 100, 26)
    if (x >= 16 && x <= 126 && y >= 12 && y <= 38) {
      soundFX.playMenuSelect();
      return { action: 'back' };
    }

    const mightyOpen = isMightyUnlocked();
    const availableFighters = this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);

    // Fighter list items on left (x: 20 to 150, y starting around 60)
    const listY0 = 60;
    const itemH = 28;
    for (let i = 0; i < availableFighters.length; i++) {
      const iy = listY0 + i * itemH;
      if (x >= 20 && x <= 160 && y >= iy && y <= iy + itemH - 4) {
        this.selectedFighterIndex = i;
        this.selectedSkinIndex = 0;
        soundFX.playWhoosh('light');
        return { action: 'select_fighter' };
      }
    }

    // Left arrow for skin carousel (x: 180 to 215, y: 150 to 190)
    if (x >= 180 && x <= 220 && y >= 150 && y <= 200) {
      const skins = this.availableSkins;
      this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
      soundFX.playWhoosh('light');
      return { action: 'prev_skin' };
    }

    // Right arrow for skin carousel (x: 430 to 470, y: 150 to 190)
    if (x >= 430 && x <= 470 && y >= 150 && y <= 200) {
      const skins = this.availableSkins;
      this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
      soundFX.playWhoosh('light');
      return { action: 'next_skin' };
    }

    // Main action button (BUY / EQUIP) at bottom right: x: 480 to 620, y: 280 to 320
    if (x >= 470 && x <= 620 && y >= 280 && y <= 325) {
      this.triggerSkinAction();
      return { action: 'buy_equip' };
    }

    return null;
  }

  render(ctx, W, H) {
    this.update();

    // 1. Dark Tournament Backdrop
    ctx.fillStyle = '#08060a';
    ctx.fillRect(0, 0, W, H);

    // Cyber / Arcade Grid pattern
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Header Glow Bar
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(220, 38, 38, 0.8)');
    grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.9)');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 4);

    // 2. Top Header Bar
    // Back Button
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.fillRect(16, 12, 100, 26);
    ctx.strokeRect(16, 12, 100, 26);
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀ [ESC] BACK', 66, 25);

    // Title
    ctx.fillStyle = '#facc15';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText('🛍️ CUSTOM SKIN ITEM SHOP', W / 2, 22);
    ctx.shadowBlur = 0;

    ctx.font = '6px "Press Start 2P"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CHOOSE A FIGHTER — PREVIEW, UNLOCK & EQUIP BESPOKE PALETTES', W / 2, 36);

    // Wallet / Coin Display (top right)
    const coins = EconomyManager.getCoins();
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.fillRect(W - 170, 12, 154, 26);
    ctx.strokeRect(W - 170, 12, 154, 26);

    ctx.fillStyle = '#fde047';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'right';
    ctx.fillText(`🪙 ${coins.toLocaleString()} COINS`, W - 26, 25);

    // 3. Left Panel: Fighter Roster List
    const mightyOpen = isMightyUnlocked();
    const availableFighters = this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);
    const listX = 16;
    const listY = 56;
    const listW = 150;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(listX, listY, listW, 268);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(listX, listY, listW, 268);

    ctx.fillStyle = '#64748b';
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText('ROSTER SELECT', listX + 8, listY + 14);

    const itemH = 26;
    for (let i = 0; i < availableFighters.length; i++) {
      const f = availableFighters[i];
      const isSelected = (i === this.selectedFighterIndex);
      const iy = listY + 24 + i * itemH;

      if (isSelected) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.fillRect(listX + 4, iy, listW - 8, itemH - 4);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.strokeRect(listX + 4, iy, listW - 8, itemH - 4);

        ctx.fillStyle = '#fde047';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(`▶ ${f.name}`, listX + 12, iy + 14);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText(`  ${f.name}`, listX + 12, iy + 14);
      }

      // Small equipped badge dot
      const eq = EconomyManager.getEquippedSkin(f.id);
      if (eq) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(listX + listW - 14, iy + 11, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Center Stage: Fighter Live Animated Rig Sprite Preview
    const centerStageX = 180;
    const centerStageY = 56;
    const centerStageW = 280;
    const centerStageH = 268;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(centerStageX, centerStageY, centerStageW, centerStageH);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(centerStageX, centerStageY, centerStageW, centerStageH);

    // Stage spotlight circle
    const spotGrad = ctx.createRadialGradient(
      centerStageX + centerStageW / 2, centerStageY + 210, 10,
      centerStageX + centerStageW / 2, centerStageY + 210, 120
    );
    const currentSkin = this.currentSkin;
    const auraColor = currentSkin.tierColor || '#38bdf8';
    spotGrad.addColorStop(0, `${auraColor}33`);
    spotGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(centerStageX + centerStageW / 2, centerStageY + 215, 100, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw the fighter sprite (idle frame 0-3)
    const fighter = this.currentFighter;
    const skinIdToLoad = currentSkin.isDefault ? null : currentSkin.id;
    const sprites = this.getPreviewSprite(fighter.id, skinIdToLoad);

    if (sprites && sprites.idle && sprites.idle.length > 0) {
      const frameIdx = this.animFrame % sprites.idle.length;
      const img = sprites.idle[frameIdx];
      if (img) {
        const scale = 2.4;
        const sw = 80 * scale;
        const sh = 90 * scale;
        const sx = centerStageX + (centerStageW - sw) / 2;
        const sy = centerStageY + 195 - sh;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, sx, sy, sw, sh);
      }
    }

    // Carousel Left & Right Arrow Buttons
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(centerStageX + 8, centerStageY + 110, 24, 34);
    ctx.fillStyle = '#facc15';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('◀', centerStageX + 20, centerStageY + 132);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(centerStageX + centerStageW - 32, centerStageY + 110, 24, 34);
    ctx.fillStyle = '#facc15';
    ctx.fillText('▶', centerStageX + centerStageW - 20, centerStageY + 132);

    // Carousel Pips / Dots at bottom of center stage
    const totalSkins = this.availableSkins.length;
    const dotSpacing = 14;
    const dotStartX = centerStageX + (centerStageW - (totalSkins - 1) * dotSpacing) / 2;
    for (let di = 0; di < totalSkins; di++) {
      ctx.beginPath();
      ctx.arc(dotStartX + di * dotSpacing, centerStageY + centerStageH - 14, (di === this.selectedSkinIndex) ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = (di === this.selectedSkinIndex) ? '#facc15' : '#475569';
      ctx.fill();
    }

    // 5. Right Panel: Skin Details, Rarity, Lore, Buy / Equip Action
    const detailX = 472;
    const detailY = 56;
    const detailW = W - detailX - 16;
    const detailH = 268;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(detailX, detailY, detailW, detailH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(detailX, detailY, detailW, detailH);

    // Rarity Badge Pill
    ctx.fillStyle = `${currentSkin.tierColor}22`;
    ctx.strokeStyle = currentSkin.tierColor;
    ctx.lineWidth = 1;
    ctx.fillRect(detailX + 12, detailY + 14, 80, 16);
    ctx.strokeRect(detailX + 12, detailY + 14, 80, 16);
    ctx.fillStyle = currentSkin.tierColor;
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(currentSkin.tier, detailX + 52, detailY + 24);

    // Skin Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(currentSkin.name, detailX + 12, detailY + 46);

    // Fighter Name Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '6px "Press Start 2P"';
    ctx.fillText(`FIGHTER: ${fighter.name}`, detailX + 12, detailY + 58);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(detailX + 12, detailY + 68);
    ctx.lineTo(detailX + detailW - 12, detailY + 68);
    ctx.stroke();

    // Lore Description (wrapped)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '6px "Press Start 2P"';
    const words = (currentSkin.desc || '').split(' ');
    let line = '';
    let textY = detailY + 84;
    for (const w of words) {
      const test = line + (line ? ' ' : '') + w;
      if (test.length > 20) {
        ctx.fillText(line, detailX + 12, textY);
        textY += 12;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, detailX + 12, textY);

    // Ownership & Equip Status
    const equippedSkinId = EconomyManager.getEquippedSkin(fighter.id);
    const isEquipped = (equippedSkinId === currentSkin.id) || (!equippedSkinId && currentSkin.isDefault);
    const isOwned = currentSkin.isDefault || EconomyManager.isSkinOwned(currentSkin.id);

    const actionBoxY = detailY + 180;
    if (isEquipped) {
      // Equipped Badge
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
      ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);

      ctx.fillStyle = '#4ade80';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('✔ CURRENTLY EQUIPPED', detailX + detailW / 2, actionBoxY + 18);
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = '#86efac';
      ctx.fillText('ACTIVE IN ALL FIGHTS', detailX + detailW / 2, actionBoxY + 28);
    } else if (isOwned) {
      // Equip Button
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
      ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('EQUIP SKIN', detailX + detailW / 2, actionBoxY + 18);
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = '#bfdbfe';
      ctx.fillText('[ENTER / SPACE]', detailX + detailW / 2, actionBoxY + 28);
    } else {
      // Buy Button with Price Tag
      const canAfford = coins >= currentSkin.price;
      ctx.fillStyle = canAfford ? '#78350f' : '#3f3f46';
      ctx.strokeStyle = canAfford ? '#f59e0b' : '#71717a';
      ctx.lineWidth = 1.5;
      ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
      ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);

      ctx.fillStyle = canAfford ? '#fde047' : '#d4d4d8';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(`BUY: 🪙 ${currentSkin.price}`, detailX + detailW / 2, actionBoxY + 16);
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = canAfford ? '#fef08a' : '#ef4444';
      ctx.fillText(canAfford ? '[ENTER TO BUY]' : 'NEED MORE COINS', detailX + detailW / 2, actionBoxY + 28);
    }

    // 6. Floating Status / Feedback Message
    if (this.messageTimer > 0 && this.message) {
      const msgW = 380;
      const msgH = 28;
      const msgX = (W - msgW) / 2;
      const msgY = H - 38;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(msgX, msgY, msgW, msgH);
      ctx.strokeStyle = this.messageColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(msgX, msgY, msgW, msgH);

      ctx.fillStyle = this.messageColor;
      ctx.font = '7px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(this.message, W / 2, msgY + 16);
    } else {
      // Help Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '6px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('[W/S] ROSTER  |  [A/D] SKINS  |  [ENTER] BUY/EQUIP  |  [ESC] MENU', W / 2, H - 12);
    }
  }
}
