// Final Impact - Skin Item Shop UI & Screen
// Allows players to preview, purchase, and equip fighter skins using earned coins.

import { SKIN_CATALOG, AURA_CATALOG, SPARK_CATALOG, TITLE_CATALOG, EconomyManager } from '../shop/SkinCatalog.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';
import { isMightyUnlocked } from '../utils/CryptoAuth.js';
import { achievements } from '../engine/Achievements.js';

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

    this.categories = ['SKINS', 'AURAS', 'SPARKS', 'TITLES'];
    this.currentCategoryIndex = 0;
    this.selectedFighterIndex = 0;
    this.selectedSkinIndex = 0; // for skins
    this.selectedItemIndex = 0; // for auras, sparks, titles
    this.focusZone = 'ITEMS'; // 'CATEGORIES' | 'ITEMS'
    this.animTimer = 0;
    this.animFrame = 0;

    this.message = '';
    this.messageColor = '#38bdf8';
    this.messageTimer = 0;

    // Cache of preview sprites for the shop
    this.previewSprites = new Map();
  }

  get currentCategory() {
    return this.categories[this.currentCategoryIndex];
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

  get availableItems() {
    if (this.currentCategory === 'SKINS') return this.availableSkins;
    if (this.currentCategory === 'AURAS') return AURA_CATALOG;
    if (this.currentCategory === 'SPARKS') return SPARK_CATALOG;
    return TITLE_CATALOG;
  }

  get currentItem() {
    const items = this.availableItems;
    const idx = this.currentCategory === 'SKINS' ? this.selectedSkinIndex : this.selectedItemIndex;
    const safeIdx = Math.max(0, Math.min(idx, items.length - 1));
    return items[safeIdx] || items[0];
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
    const mightyOpen = isMightyUnlocked();
    const availableFighters = this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);

    // 1. Direct Bumper / Trigger / Tab Category Switching (Available anytime!)
    if (inputState.prevTab || inputState.special3 || inputState.q) {
      this.currentCategoryIndex = (this.currentCategoryIndex - 1 + this.categories.length) % this.categories.length;
      this.selectedItemIndex = 0;
      this.selectedSkinIndex = 0;
      soundFX.playWhoosh('light');
      return;
    }
    if (inputState.nextTab || inputState.tab || inputState.special1 || inputState.e) {
      this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
      this.selectedItemIndex = 0;
      this.selectedSkinIndex = 0;
      soundFX.playWhoosh('light');
      return;
    }

    // 2. Action Confirm (A / Enter / Space / X / Y)
    if (inputState.confirm || inputState.lp || inputState.hp) {
      if (this.focusZone === 'CATEGORIES') {
        // Drop focus down into items of selected category
        this.focusZone = 'ITEMS';
        if (this.currentCategory === 'SKINS') {
          this.selectedFighterIndex = 0;
          this.selectedSkinIndex = 0;
        } else {
          this.selectedItemIndex = 0;
        }
        soundFX.playMenuSelect();
      } else {
        this.triggerSkinAction();
      }
      return;
    }

    // 3. Navigation when focused on Top Category Bar
    if (this.focusZone === 'CATEGORIES') {
      if (inputState.left) {
        this.currentCategoryIndex = (this.currentCategoryIndex - 1 + this.categories.length) % this.categories.length;
        this.selectedItemIndex = 0;
        this.selectedSkinIndex = 0;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
        this.selectedItemIndex = 0;
        this.selectedSkinIndex = 0;
        soundFX.playWhoosh('light');
      } else if (inputState.down) {
        // Drop down into items
        this.focusZone = 'ITEMS';
        if (this.currentCategory === 'SKINS') {
          this.selectedFighterIndex = 0;
          this.selectedSkinIndex = 0;
        } else {
          this.selectedItemIndex = 0;
        }
        soundFX.playWhoosh('light');
      }
      return;
    }

    // 4. Navigation when focused on ITEMS
    if (this.currentCategory === 'SKINS') {
      if (inputState.up) {
        if (this.selectedFighterIndex === 0) {
          // Go UP to the Category Bar!
          this.focusZone = 'CATEGORIES';
          soundFX.playMenuSelect();
        } else {
          this.selectedFighterIndex--;
          this.selectedSkinIndex = 0;
          soundFX.playWhoosh('light');
        }
      } else if (inputState.down) {
        if (this.selectedFighterIndex < availableFighters.length - 1) {
          this.selectedFighterIndex++;
          this.selectedSkinIndex = 0;
          soundFX.playWhoosh('light');
        }
      }

      const skins = this.availableSkins;
      if (inputState.left) {
        this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
        soundFX.playWhoosh('light');
      }
    } else {
      const items = this.availableItems;
      if (inputState.up) {
        if (this.selectedItemIndex === 0) {
          // Go UP to the Category Bar!
          this.focusZone = 'CATEGORIES';
          soundFX.playMenuSelect();
        } else {
          this.selectedItemIndex--;
          soundFX.playWhoosh('light');
        }
      } else if (inputState.down) {
        if (this.selectedItemIndex < items.length - 1) {
          this.selectedItemIndex++;
          soundFX.playWhoosh('light');
        }
      } else if (inputState.left) {
        if (this.selectedItemIndex > 0) {
          this.selectedItemIndex--;
          soundFX.playWhoosh('light');
        }
      } else if (inputState.right) {
        if (this.selectedItemIndex < items.length - 1) {
          this.selectedItemIndex++;
          soundFX.playWhoosh('light');
        }
      }
    }
  }

  triggerSkinAction() {
    if (this.currentCategory === 'SKINS') {
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
          try { achievements.unlock('BIG_SPENDER'); } catch (e) {}
        } else {
          this.showMessage('❌ INSUFFICIENT COINS! WIN MATCHES TO EARN MORE.', '#ef4444');
          soundFX.playBlock();
        }
      }
    } else {
      // Cosmetics (Aura, Spark, Title)
      const item = this.currentItem;
      const cat = this.currentCategory;
      const cosType = cat === 'AURAS' ? 'aura' : (cat === 'SPARKS' ? 'spark' : 'title');
      const equippedCos = EconomyManager.getEquippedCosmetics();
      const isEquipped = equippedCos[cosType] === item.id;

      if (isEquipped) {
        this.showMessage('ALREADY EQUIPPED!', '#fbbf24');
        soundFX.playBlock();
        return;
      }

      const isOwned = item.price === 0 || EconomyManager.isSkinOwned(item.id);
      if (isOwned) {
        EconomyManager.equipCosmetic(cosType, item.id);
        this.showMessage(`✨ ${item.name} EQUIPPED! ✨`, '#4ade80');
        soundFX.playUltimateActivation();
        const curEq = EconomyManager.getEquippedCosmetics();
        if (curEq.aura && curEq.spark && curEq.title) {
          try { achievements.unlock('FASHION_ICON'); } catch (e) {}
        }
      } else {
        if (EconomyManager.spendCoins(item.price)) {
          const owned = EconomyManager.getOwnedSkins();
          owned.add(item.id);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('final_impact_owned_skins', JSON.stringify(Array.from(owned)));
            }
          } catch (e) {}
          EconomyManager.equipCosmetic(cosType, item.id);
          this.showMessage(`🎉 UNLOCKED & EQUIPPED: ${item.name}!`, '#facc15');
          soundFX.playUltimateActivation();
          try { achievements.unlock('BIG_SPENDER'); } catch (e) {}
          const curEq = EconomyManager.getEquippedCosmetics();
          if (curEq.aura && curEq.spark && curEq.title) {
            try { achievements.unlock('FASHION_ICON'); } catch (e) {}
          }
        } else {
          this.showMessage('❌ INSUFFICIENT COINS! WIN MATCHES TO EARN MORE.', '#ef4444');
          soundFX.playBlock();
        }
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

    // Category Navigation Pills (Center top)
    const catTabW = 64;
    const catTabH = 20;
    const catTabY = 28;
    const catStartX = W / 2 - (this.categories.length * catTabW) / 2;

    // LB button hit test
    const lbX = catStartX - 36;
    if (x >= lbX && x <= lbX + 32 && y >= catTabY && y <= catTabY + catTabH) {
      this.currentCategoryIndex = (this.currentCategoryIndex - 1 + this.categories.length) % this.categories.length;
      this.selectedItemIndex = 0;
      this.selectedSkinIndex = 0;
      this.focusZone = 'CATEGORIES';
      soundFX.playWhoosh('light');
      return { action: 'change_category' };
    }

    // RB button hit test
    const rbX = catStartX + this.categories.length * catTabW + 4;
    if (x >= rbX && x <= rbX + 32 && y >= catTabY && y <= catTabY + catTabH) {
      this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
      this.selectedItemIndex = 0;
      this.selectedSkinIndex = 0;
      this.focusZone = 'CATEGORIES';
      soundFX.playWhoosh('light');
      return { action: 'change_category' };
    }

    for (let c = 0; c < this.categories.length; c++) {
      const cx = catStartX + c * catTabW;
      if (x >= cx + 2 && x <= cx + catTabW - 2 && y >= catTabY && y <= catTabY + catTabH) {
        this.currentCategoryIndex = c;
        this.selectedItemIndex = 0;
        this.selectedSkinIndex = 0;
        this.focusZone = 'CATEGORIES';
        soundFX.playWhoosh('light');
        return { action: 'change_category' };
      }
    }

    if (this.currentCategory === 'SKINS') {
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
          this.focusZone = 'ITEMS';
          soundFX.playWhoosh('light');
          return { action: 'select_fighter' };
        }
      }
    } else {
      const items = this.availableItems;
      const listY0 = 60;
      const itemH = 28;
      for (let i = 0; i < items.length; i++) {
        const iy = listY0 + i * itemH;
        if (x >= 20 && x <= 160 && y >= iy && y <= iy + itemH - 4) {
          this.selectedItemIndex = i;
          this.focusZone = 'ITEMS';
          soundFX.playWhoosh('light');
          return { action: 'select_item' };
        }
      }
    }

    // Left arrow for skin carousel (x: 180 to 220, y: 150 to 200)
    if (x >= 180 && x <= 220 && y >= 150 && y <= 200) {
      const skins = this.availableSkins;
      this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
      this.focusZone = 'ITEMS';
      soundFX.playWhoosh('light');
      return { action: 'prev_skin' };
    }

    // Right arrow for skin carousel (x: 430 to 470, y: 150 to 200)
    if (x >= 430 && x <= 470 && y >= 150 && y <= 200) {
      const skins = this.availableSkins;
      this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
      this.focusZone = 'ITEMS';
      soundFX.playWhoosh('light');
      return { action: 'next_skin' };
    }

    // Main action button (BUY / EQUIP) at bottom right: x: 470 to 620, y: 280 to 325
    if (x >= 470 && x <= 620 && y >= 280 && y <= 325) {
      this.focusZone = 'ITEMS';
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
    ctx.font = '9px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText('🛍️ FIGHTER\'S VAULT & ITEM SHOP', W / 2, 17);
    ctx.shadowBlur = 0;

    // Wallet / Coin Display (top right)
    const coins = EconomyManager.getCoins();
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.fillRect(W - 165, 12, 148, 26);
    ctx.strokeRect(W - 165, 12, 148, 26);

    ctx.fillStyle = '#fde047';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'right';
    ctx.fillText(`🪙 ${coins.toLocaleString()} COINS`, W - 24, 25);

    // Category Navigation Pills (Center top)
    const catTabW = 64;
    const catTabH = 20;
    const catTabY = 28;
    const catStartX = W / 2 - (this.categories.length * catTabW) / 2;

    // LB Bumper Button badge
    const lbX = catStartX - 36;
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1;
    ctx.fillRect(lbX, catTabY + 1, 30, catTabH - 2);
    ctx.strokeRect(lbX, catTabY + 1, 30, catTabH - 2);
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('◀ LB', lbX + 15, catTabY + 13);

    // RB Bumper Button badge
    const rbX = catStartX + this.categories.length * catTabW + 6;
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1;
    ctx.fillRect(rbX, catTabY + 1, 30, catTabH - 2);
    ctx.strokeRect(rbX, catTabY + 1, 30, catTabH - 2);
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('RB ▶', rbX + 15, catTabY + 13);

    for (let c = 0; c < this.categories.length; c++) {
      const catName = this.categories[c];
      const cx = catStartX + c * catTabW;
      const isCur = (c === this.currentCategoryIndex);
      const isFocused = isCur && (this.focusZone === 'CATEGORIES');

      if (isFocused) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 2, catTabY, catTabW - 4, catTabH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + 2, catTabY, catTabW - 4, catTabH);

        ctx.fillStyle = '#000000';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(catName, cx + catTabW / 2, catTabY + 13);

        // Animated cursor arrow pointing down to items
        const arrowBounce = Math.sin(this.animTimer * 0.2) * 2;
        ctx.fillStyle = '#fde047';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText('▼', cx + catTabW / 2, catTabY + catTabH + 8 + arrowBounce);
      } else if (isCur) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx + 2, catTabY, catTabW - 4, catTabH);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx + 2, catTabY, catTabW - 4, catTabH);

        ctx.fillStyle = '#fef08a';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(catName, cx + catTabW / 2, catTabY + 13);
      } else {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(cx + 2, catTabY, catTabW - 4, catTabH);
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 2, catTabY, catTabW - 4, catTabH);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(catName, cx + catTabW / 2, catTabY + 13);
      }
    }

    // 3. Left Panel: Item / Fighter List
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
    ctx.fillText(this.currentCategory === 'SKINS' ? 'ROSTER SELECT' : `${this.currentCategory} LIST`, listX + 8, listY + 14);

    const itemH = 26;

    if (this.currentCategory === 'SKINS') {
      const mightyOpen = isMightyUnlocked();
      const availableFighters = this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);

      for (let i = 0; i < availableFighters.length; i++) {
        const f = availableFighters[i];
        const isSelected = (i === this.selectedFighterIndex);
        const iy = listY + 24 + i * itemH;

        if (isSelected) {
          const isItemActive = (this.focusZone === 'ITEMS');
          ctx.fillStyle = isItemActive ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 179, 8, 0.08)';
          ctx.fillRect(listX + 4, iy, listW - 8, itemH - 4);
          ctx.strokeStyle = isItemActive ? '#eab308' : '#52525b';
          ctx.lineWidth = isItemActive ? 1.5 : 1;
          ctx.strokeRect(listX + 4, iy, listW - 8, itemH - 4);

          ctx.fillStyle = isItemActive ? '#fde047' : '#e2e8f0';
          ctx.font = '8px "Press Start 2P"';
          ctx.fillText(`▶ ${f.name}`, listX + 12, iy + 14);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '7px "Press Start 2P"';
          ctx.fillText(`  ${f.name}`, listX + 12, iy + 14);
        }

        const eq = EconomyManager.getEquippedSkin(f.id);
        if (eq) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(listX + listW - 14, iy + 11, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      const items = this.availableItems;
      const cosType = this.currentCategory === 'AURAS' ? 'aura' : (this.currentCategory === 'SPARKS' ? 'spark' : 'title');
      const equippedCos = EconomyManager.getEquippedCosmetics();

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const isSelected = (i === this.selectedItemIndex);
        const iy = listY + 24 + i * itemH;

        if (isSelected) {
          const isItemActive = (this.focusZone === 'ITEMS');
          ctx.fillStyle = isItemActive ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 179, 8, 0.08)';
          ctx.fillRect(listX + 4, iy, listW - 8, itemH - 4);
          ctx.strokeStyle = isItemActive ? '#eab308' : '#52525b';
          ctx.lineWidth = isItemActive ? 1.5 : 1;
          ctx.strokeRect(listX + 4, iy, listW - 8, itemH - 4);

          ctx.fillStyle = isItemActive ? '#fde047' : '#e2e8f0';
          ctx.font = '7px "Press Start 2P"';
          ctx.fillText(`▶ ${it.name.substring(0, 11)}`, listX + 8, iy + 14);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '6.5px "Press Start 2P"';
          ctx.fillText(`  ${it.name.substring(0, 11)}`, listX + 8, iy + 14);
        }

        if (equippedCos[cosType] === it.id) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(listX + listW - 14, iy + 11, 3, 0, Math.PI * 2);
          ctx.fill();
        }
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
    const currentItem = this.currentItem;
    const isSkinCat = (this.currentCategory === 'SKINS');
    const displayItem = isSkinCat ? currentSkin : currentItem;

    const auraColor = displayItem.tierColor || '#38bdf8';
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

    // Dynamic Live Cosmetic Preview Effects
    if (this.currentCategory === 'AURAS' && currentItem.color !== 'transparent') {
      const col = currentItem.color;
      for (let p = 0; p < 16; p++) {
        const px = centerStageX + centerStageW / 2 + Math.sin(this.animTimer * 0.1 + p * 1.3) * 35;
        const py = centerStageY + 180 - ((this.animTimer * 2 + p * 18) % 120);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.65;
        ctx.fillRect(px, py, 3, 5);
      }
      ctx.globalAlpha = 1.0;
    } else if (this.currentCategory === 'SPARKS') {
      const col = currentItem.color;
      for (let s = 0; s < 12; s++) {
        const ang = s * (Math.PI / 6) + this.animTimer * 0.05;
        const rad = 25 + Math.sin(this.animTimer * 0.2 + s) * 15;
        const sx = centerStageX + centerStageW / 2 + Math.cos(ang) * rad;
        const sy = centerStageY + 120 + Math.sin(ang) * rad;
        ctx.fillStyle = col;
        ctx.fillRect(sx, sy, 3, 3);
      }
    } else if (this.currentCategory === 'TITLES') {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(centerStageX + 20, centerStageY + 20, centerStageW - 40, 24);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerStageX + 20, centerStageY + 20, centerStageW - 40, 24);
      ctx.fillStyle = '#fde047';
      ctx.font = '7px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${currentItem.name} ★`, centerStageX + centerStageW / 2, centerStageY + 36);
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

    // 5. Right Panel: Details, Rarity, Lore, Buy / Equip Action
    const detailX = 472;
    const detailY = 56;
    const detailW = W - detailX - 16;
    const detailH = 268;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(detailX, detailY, detailW, detailH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(detailX, detailY, detailW, detailH);

    // Rarity Badge Pill
    ctx.fillStyle = `${displayItem.tierColor || '#38bdf8'}22`;
    ctx.strokeStyle = displayItem.tierColor || '#38bdf8';
    ctx.lineWidth = 1;
    ctx.fillRect(detailX + 12, detailY + 14, 80, 16);
    ctx.strokeRect(detailX + 12, detailY + 14, 80, 16);
    ctx.fillStyle = displayItem.tierColor || '#38bdf8';
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(displayItem.tier || 'COMMON', detailX + 52, detailY + 24);

    // Item Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(displayItem.name.substring(0, 14), detailX + 12, detailY + 46);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '6px "Press Start 2P"';
    ctx.fillText(isSkinCat ? `FIGHTER: ${fighter.name}` : `CATEGORY: ${this.currentCategory}`, detailX + 12, detailY + 58);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(detailX + 12, detailY + 68);
    ctx.lineTo(detailX + detailW - 12, detailY + 68);
    ctx.stroke();

    // Lore Description (wrapped)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '6px "Press Start 2P"';
    const words = (displayItem.desc || '').split(' ');
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
    let isEquipped = false;
    let isOwned = false;

    if (isSkinCat) {
      const equippedSkinId = EconomyManager.getEquippedSkin(fighter.id);
      isEquipped = (equippedSkinId === currentSkin.id) || (!equippedSkinId && currentSkin.isDefault);
      isOwned = currentSkin.isDefault || EconomyManager.isSkinOwned(currentSkin.id);
    } else {
      const cosType = this.currentCategory === 'AURAS' ? 'aura' : (this.currentCategory === 'SPARKS' ? 'spark' : 'title');
      const equippedCos = EconomyManager.getEquippedCosmetics();
      isEquipped = (equippedCos[cosType] === currentItem.id);
      isOwned = (currentItem.price === 0) || EconomyManager.isSkinOwned(currentItem.id);
    }

    const actionBoxY = detailY + 180;
    if (isEquipped) {
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
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
      ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('EQUIP ITEM', detailX + detailW / 2, actionBoxY + 18);
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = '#bfdbfe';
      ctx.fillText('[A / ENTER TO EQUIP]', detailX + detailW / 2, actionBoxY + 28);
    } else {
      const canAfford = coins >= displayItem.price;
      ctx.fillStyle = canAfford ? '#78350f' : '#3f3f46';
      ctx.strokeStyle = canAfford ? '#f59e0b' : '#71717a';
      ctx.lineWidth = 1.5;
      ctx.fillRect(detailX + 12, actionBoxY, detailW - 24, 36);
      ctx.strokeRect(detailX + 12, actionBoxY, detailW - 24, 36);

      ctx.fillStyle = canAfford ? '#fde047' : '#d4d4d8';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(`BUY: 🪙 ${displayItem.price}`, detailX + detailW / 2, actionBoxY + 16);
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = canAfford ? '#fef08a' : '#ef4444';
      ctx.fillText(canAfford ? '[A / ENTER TO BUY]' : 'NEED MORE COINS', detailX + detailW / 2, actionBoxY + 28);
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
      // Help Footer with dynamic controller & keyboard guidance
      ctx.fillStyle = '#94a3b8';
      ctx.font = '6px "Press Start 2P"';
      ctx.textAlign = 'center';
      if (this.focusZone === 'CATEGORIES') {
        ctx.fillText('[D-PAD ◄/►] SELECT CATEGORY  |  [▼ / A] ENTER ITEMS  |  [LB/RB] SWITCH  |  [B / ESC] BACK', W / 2, H - 12);
      } else {
        ctx.fillText('[LB/RB] SWITCH CATEGORY  |  [▲ TO TOP] TABS  |  [◄/►] SKINS  |  [A / ENTER] BUY/EQUIP  |  [B / ESC] BACK', W / 2, H - 12);
      }
    }
  }
}
