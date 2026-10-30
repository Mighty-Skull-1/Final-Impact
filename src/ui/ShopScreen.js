// Final Impact - Skin Item Shop UI & Screen
// Allows players to preview, purchase, and equip fighter skins using earned coins.

import { SKIN_CATALOG, AURA_CATALOG, SPARK_CATALOG, TITLE_CATALOG, EconomyManager } from '../shop/SkinCatalog.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';
import { isMightyUnlocked } from '../utils/CryptoAuth.js';
import { achievements } from '../engine/Achievements.js';
import { input } from '../engine/Input.js';
import {
  COLORS, FONTS, approach, wrapLines, cleanLabel, hexToRgba, slantPath,
  drawText, drawLabel, drawBackdrop, drawScreenHeader, drawPromptBar, drawPanel, drawKeyCap,
  drawPlatform, drawFighterSprite, drawActionButton, drawStatusBar, drawChip
} from './Theme.js';

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
      { id: 'oracle', name: 'ORACLE' },
      { id: 'bandit', name: 'BANDIT' },
      { id: 'confessor', name: 'CONFESSOR' },
      { id: 'valka', name: 'VALKA' },
      { id: 'convict', name: 'CONVICT' },
      { id: 'prophet', name: 'PROPHET' },
      { id: 'ronin', name: 'RONIN' },
      { id: 'vagabond', name: 'VAGABOND' },
      { id: 'warden', name: 'WARDEN' },
      { id: 'wretch', name: 'WRETCH' },
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
        if (skin.unlock === 'campaign') {
          this.showMessage(`BEAT THE CAMPAIGN AS ${fighter.name || fighter.id.toUpperCase()} TO EARN THIS`, '#ff4d6d');
          soundFX.playBlock();
          return;
        }
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

  // Shared layout (640x360 logical canvas) for rendering and hit-testing
  layout(W = 640) {
    const tabW = 78, tabH = 18, tabY = 52;
    const tabsW = this.categories.length * tabW + (this.categories.length - 1) * 4;
    const tabX0 = W / 2 - tabsW / 2;
    return {
      back: { x: W - 16 - 64, y: 14, w: 64, h: 18 },
      wallet: { x: W - 16 - 64 - 8 - 112, y: 14, w: 112, h: 18 },
      tabs: { x0: tabX0, y: tabY, w: tabW, h: tabH, gap: 4 },
      prevTab: { x: tabX0 - 30, y: tabY, w: 24, h: tabH },
      nextTab: { x: tabX0 + tabsW + 6, y: tabY, w: 24, h: tabH },
      list: { x: 16, y: 82, w: 150, h: 244, rowY: 102, rowH: 22 },
      stage: { x: 174, y: 82, w: 284, h: 244 },
      leftArrow: { x: 180, y: 176, w: 22, h: 40 },
      rightArrow: { x: 430, y: 176, w: 22, h: 40 },
      detail: { x: 466, y: 82, w: W - 466 - 16, h: 244 },
      action: { x: 474, y: 296, w: W - 466 - 16 - 16, h: 22 }
    };
  }

  handleMouseClick(x, y, W, H) {
    W = W || 640;
    const L = this.layout(W);
    const inR = (r, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;

    if (inR(L.back, 3)) {
      soundFX.playMenuSelect();
      return { action: 'back' };
    }

    if (inR(L.prevTab, 2)) {
      this.currentCategoryIndex = (this.currentCategoryIndex - 1 + this.categories.length) % this.categories.length;
      this.selectedItemIndex = 0;
      this.selectedSkinIndex = 0;
      this.focusZone = 'CATEGORIES';
      soundFX.playWhoosh('light');
      return { action: 'change_category' };
    }
    if (inR(L.nextTab, 2)) {
      this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
      this.selectedItemIndex = 0;
      this.selectedSkinIndex = 0;
      this.focusZone = 'CATEGORIES';
      soundFX.playWhoosh('light');
      return { action: 'change_category' };
    }
    for (let c = 0; c < this.categories.length; c++) {
      const r = { x: L.tabs.x0 + c * (L.tabs.w + L.tabs.gap), y: L.tabs.y, w: L.tabs.w, h: L.tabs.h };
      if (inR(r)) {
        this.currentCategoryIndex = c;
        this.selectedItemIndex = 0;
        this.selectedSkinIndex = 0;
        this.focusZone = 'CATEGORIES';
        soundFX.playWhoosh('light');
        return { action: 'change_category' };
      }
    }

    const rows = this.currentCategory === 'SKINS' ? this.availableFighters().length : this.availableItems.length;
    const scroll = this._listScroll || 0;
    const visible = this.visibleListRows(L.list);
    for (let i = scroll; i < Math.min(rows, scroll + visible); i++) {
      const r = { x: L.list.x + 4, y: L.list.rowY + (i - scroll) * L.list.rowH, w: L.list.w - 8, h: L.list.rowH - 2 };
      if (inR(r)) {
        if (this.currentCategory === 'SKINS') {
          this.selectedFighterIndex = i;
          this.selectedSkinIndex = 0;
          this.focusZone = 'ITEMS';
          soundFX.playWhoosh('light');
          return { action: 'select_fighter' };
        }
        this.selectedItemIndex = i;
        this.focusZone = 'ITEMS';
        soundFX.playWhoosh('light');
        return { action: 'select_item' };
      }
    }

    if (this.currentCategory === 'SKINS') {
      if (inR(L.leftArrow, 4)) {
        const skins = this.availableSkins;
        this.selectedSkinIndex = (this.selectedSkinIndex - 1 + skins.length) % skins.length;
        this.focusZone = 'ITEMS';
        soundFX.playWhoosh('light');
        return { action: 'prev_skin' };
      }
      if (inR(L.rightArrow, 4)) {
        const skins = this.availableSkins;
        this.selectedSkinIndex = (this.selectedSkinIndex + 1) % skins.length;
        this.focusZone = 'ITEMS';
        soundFX.playWhoosh('light');
        return { action: 'next_skin' };
      }
    }

    if (inR(L.action, 3)) {
      this.focusZone = 'ITEMS';
      this.triggerSkinAction();
      return { action: 'buy_equip' };
    }

    return null;
  }

  visibleListRows(LS) {
    return Math.max(1, Math.floor((LS.y + LS.h - LS.rowY) / LS.rowH));
  }

  availableFighters() {
    const mightyOpen = isMightyUnlocked();
    return this.fighters.filter(f => f.id !== 'mighty' || mightyOpen);
  }

  hasGamepad() {
    try { return input.hasGamepadConnected(); } catch (e) { return false; }
  }

  drawCoin(ctx, x, y, r = 5) {
    ctx.save();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r);
    g.addColorStop(0, COLORS.goldPale);
    g.addColorStop(1, COLORS.goldDeep);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,50,0,0.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  render(ctx, W, H) {
    this.update();
    const t = this.animTimer;
    const L = this.layout(W);
    const gp = this.hasGamepad();
    const isSkinCat = this.currentCategory === 'SKINS';
    const currentSkin = this.currentSkin;
    const currentItem = this.currentItem;
    const displayItem = isSkinCat ? currentSkin : currentItem;
    const tierColor = displayItem.tierColor || COLORS.p1;
    const fighter = this.currentFighter;
    const coins = EconomyManager.getCoins();

    drawBackdrop(ctx, W, H, t, { tint: COLORS.goldDeep });
    drawScreenHeader(ctx, W, 'ITEM SHOP', "FIGHTER'S VAULT", t);

    // Wallet + back chip
    const wl = L.wallet;
    slantPath(ctx, wl.x, wl.y, wl.w, wl.h, 5);
    ctx.fillStyle = 'rgba(10,10,16,0.8)';
    ctx.fill();
    ctx.strokeStyle = hexToRgba(COLORS.gold, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    this.drawCoin(ctx, wl.x + 16, wl.y + wl.h / 2, 5);
    drawText(ctx, coins.toLocaleString(), wl.x + 26, wl.y + 13, { font: FONTS.display(12), color: COLORS.goldPale });
    drawText(ctx, 'COINS', wl.x + wl.w - 10, wl.y + 12.5, { font: FONTS.ui(8, 800), color: COLORS.textDim, align: 'right', letterSpacing: 1 });
    drawChip(ctx, L.back.x, L.back.y, L.back.w, L.back.h, gp ? 'B' : 'ESC', 'BACK');

    // ---- Category tabs ----
    const T = L.tabs;
    const catFocus = this.focusZone === 'CATEGORIES';
    this._tabX = approach(this._tabX, T.x0 + this.currentCategoryIndex * (T.w + T.gap), 0.3);
    for (let c = 0; c < this.categories.length; c++) {
      const x = T.x0 + c * (T.w + T.gap);
      slantPath(ctx, x, T.y, T.w, T.h, 6);
      ctx.fillStyle = 'rgba(14,13,20,0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    {
      const g = ctx.createLinearGradient(0, T.y, 0, T.y + T.h);
      g.addColorStop(0, COLORS.crimson);
      g.addColorStop(1, COLORS.crimsonDeep);
      slantPath(ctx, this._tabX, T.y, T.w, T.h, 6);
      ctx.fillStyle = g;
      ctx.fill();
      if (catFocus) {
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    for (let c = 0; c < this.categories.length; c++) {
      const x = T.x0 + c * (T.w + T.gap);
      const cur = c === this.currentCategoryIndex;
      drawText(ctx, this.categories[c], x + T.w / 2, T.y + 13, { font: FONTS.display(11), color: cur ? '#fff' : COLORS.textDim, align: 'center' });
    }
    drawKeyCap(ctx, gp ? 'LB' : 'Q', L.prevTab.x + 4, L.prevTab.y + 3);
    drawKeyCap(ctx, gp ? 'RB' : 'E', L.nextTab.x + 4, L.nextTab.y + 3);

    // ---- Left list ----
    const LS = L.list;
    drawPanel(ctx, LS.x, LS.y, LS.w, LS.h, { fill: 'rgba(12, 11, 18, 0.88)', stroke: 'rgba(255,255,255,0.08)' });
    drawLabel(ctx, isSkinCat ? 'ROSTER' : this.currentCategory, LS.x + 10, LS.y + 13, { color: COLORS.textDim, size: 8 });
    const itemsFocus = this.focusZone === 'ITEMS';
    const rows = isSkinCat ? this.availableFighters() : this.availableItems;
    const selIdx = isSkinCat ? Math.min(this.selectedFighterIndex, rows.length - 1) : Math.min(this.selectedItemIndex, rows.length - 1);
    const cosType = this.currentCategory === 'AURAS' ? 'aura' : (this.currentCategory === 'SPARKS' ? 'spark' : 'title');
    const equippedCos = EconomyManager.getEquippedCosmetics();
    // Scroll long lists so the selection stays visible
    const visible = this.visibleListRows(LS);
    const maxScroll = Math.max(0, rows.length - visible);
    this._listScroll = Math.max(0, Math.min(maxScroll, Math.max(Math.min(this._listScroll || 0, selIdx - 1), selIdx - visible + 2)));
    const scroll = this._listScroll;
    this._rowY = approach(this._rowY, LS.rowY + (selIdx - scroll) * LS.rowH, 0.3);
    {
      const g = ctx.createLinearGradient(LS.x, 0, LS.x + LS.w, 0);
      g.addColorStop(0, hexToRgba(COLORS.crimson, itemsFocus ? 0.9 : 0.35));
      g.addColorStop(1, hexToRgba(COLORS.crimsonDeep, 0.1));
      slantPath(ctx, LS.x + 4, this._rowY, LS.w - 8, LS.rowH - 2, 6);
      ctx.fillStyle = g;
      ctx.fill();
      if (itemsFocus) {
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(LS.x + 4, this._rowY + 2, 2, LS.rowH - 6);
      }
    }
    rows.forEach((row, i) => {
      if (i < scroll || i >= scroll + visible) return;
      const y = LS.rowY + (i - scroll) * LS.rowH;
      const sel = i === selIdx;
      drawText(ctx, cleanLabel(row.name), LS.x + 14, y + 14, {
        font: FONTS.display(sel ? 11 : 10), color: sel ? '#fff' : COLORS.textDim, maxWidth: LS.w - 36
      });
      const eq = isSkinCat ? EconomyManager.getEquippedSkin(row.id) : (equippedCos[cosType] === row.id);
      if (eq) {
        ctx.fillStyle = COLORS.good;
        ctx.beginPath();
        ctx.arc(LS.x + LS.w - 14, y + 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (scroll > 0) drawText(ctx, '▲', LS.x + LS.w - 12, LS.y + 14, { font: FONTS.ui(8, 900), color: COLORS.textDim, align: 'center' });
    if (scroll + visible < rows.length) drawText(ctx, '▼', LS.x + LS.w - 12, LS.y + LS.h - 4, { font: FONTS.ui(8, 900), color: COLORS.textDim, align: 'center' });

    // ---- Centre stage ----
    const S = L.stage;
    drawPanel(ctx, S.x, S.y, S.w, S.h, { fill: 'rgba(6, 6, 10, 0.75)', stroke: 'rgba(255,255,255,0.08)' });
    const scx = S.x + S.w / 2;
    const groundY = S.y + 196;
    ctx.save();
    ctx.beginPath();
    ctx.rect(S.x, S.y, S.w, S.h);
    ctx.clip();
    drawPlatform(ctx, scx, groundY, 70, tierColor, t);
    const skinIdToLoad = currentSkin.isDefault ? null : currentSkin.id;
    const sprites = this.getPreviewSprite(fighter.id, skinIdToLoad);
    const frames = sprites && (sprites.idle || sprites.IDLE);
    const img = frames && frames.length ? frames[this.animFrame % frames.length] : null;

    // Live cosmetic preview effects (behind / around the fighter)
    if (this.currentCategory === 'AURAS' && currentItem.color && currentItem.color !== 'transparent') {
      const col = currentItem.color;
      const ag = ctx.createRadialGradient(scx, groundY - 70, 5, scx, groundY - 70, 90);
      ag.addColorStop(0, hexToRgba(col, 0.25));
      ag.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ag;
      ctx.fillRect(S.x, S.y, S.w, S.h);
      for (let p = 0; p < 22; p++) {
        const px = scx + Math.sin(t * 0.1 + p * 1.3) * 38;
        const py = groundY - ((t * 2 + p * 18) % 160);
        ctx.globalAlpha = 0.65 * (1 - ((t * 2 + p * 18) % 160) / 160);
        ctx.fillStyle = col;
        ctx.fillRect(px, py, 3, 5);
      }
      ctx.globalAlpha = 1;
    }
    drawFighterSprite(ctx, img, scx, groundY + 2, 2.2, { rim: tierColor, glow: 8 });
    if (this.currentCategory === 'SPARKS') {
      const col = currentItem.color || COLORS.gold;
      const cy = groundY - 100;
      for (let s = 0; s < 12; s++) {
        const ang = s * (Math.PI / 6) + t * 0.05;
        const rad = 25 + Math.sin(t * 0.2 + s) * 15;
        ctx.fillStyle = col;
        ctx.fillRect(scx + 40 + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 3, 3);
      }
    } else if (this.currentCategory === 'TITLES') {
      drawText(ctx, '★ ' + currentItem.name + ' ★', scx, S.y + 24, {
        font: FONTS.display(12), color: tierColor, align: 'center', outline: 3, maxWidth: S.w - 24
      });
    }
    ctx.restore();

    if (isSkinCat) {
      const skins = this.availableSkins;
      const si = Math.max(0, Math.min(this.selectedSkinIndex, skins.length - 1));
      const nudge = Math.sin(t * 0.15) * 1.5;
      drawText(ctx, '◀', L.leftArrow.x + L.leftArrow.w / 2 - nudge, L.leftArrow.y + L.leftArrow.h / 2 + 4, { font: FONTS.ui(12, 800), color: COLORS.gold, align: 'center' });
      drawText(ctx, '▶', L.rightArrow.x + L.rightArrow.w / 2 + nudge, L.rightArrow.y + L.rightArrow.h / 2 + 4, { font: FONTS.ui(12, 800), color: COLORS.gold, align: 'center' });
      // skin pager dots
      const dotsW = skins.length * 10;
      skins.forEach((sk, i) => {
        const dx = scx - dotsW / 2 + i * 10 + 5;
        ctx.fillStyle = i === si ? (sk.tierColor || COLORS.gold) : 'rgba(255,255,255,0.18)';
        slantPath(ctx, dx - 3, S.y + 216, 7, 4, 2);
        ctx.fill();
      });
      drawText(ctx, `${fighter.name}  ·  SKIN ${si + 1} / ${skins.length}`, scx, S.y + 234, {
        font: FONTS.ui(8, 800), color: COLORS.textDim, align: 'center', letterSpacing: 1
      });
    }

    // ---- Right details ----
    const D = L.detail;
    drawPanel(ctx, D.x, D.y, D.w, D.h, { fill: 'rgba(12, 11, 18, 0.9)', stroke: 'rgba(255,255,255,0.08)' });
    ctx.fillStyle = tierColor;
    ctx.fillRect(D.x, D.y, D.w, 2);
    const dx = D.x + 10, dw = D.w - 20;
    // tier badge
    const tier = displayItem.tier || 'COMMON';
    ctx.font = FONTS.ui(8, 800);
    const bw = ctx.measureText(tier).width + 16;
    slantPath(ctx, dx, D.y + 10, bw, 12, 4);
    ctx.fillStyle = hexToRgba(tierColor, 0.22);
    ctx.fill();
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    drawText(ctx, tier, dx + bw / 2, D.y + 19, { font: FONTS.ui(8, 800), color: tierColor, align: 'center', letterSpacing: 1 });
    ctx.font = FONTS.display(14);
    const nameLines = wrapLines(ctx, cleanLabel(displayItem.name), dw).slice(0, 2);
    nameLines.forEach((ln, i) => drawText(ctx, ln, dx, D.y + 42 + i * 15, { font: FONTS.display(14), color: '#fff', maxWidth: dw }));
    let y = D.y + 42 + nameLines.length * 15 - 3;
    drawText(ctx, isSkinCat ? `FIGHTER: ${fighter.name}` : `CATEGORY: ${this.currentCategory}`, dx, y, { font: FONTS.ui(8, 700), color: COLORS.textDim, letterSpacing: 1 });
    y += 8;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(dx, y, dw, 1);
    ctx.font = FONTS.ui(9, 600);
    wrapLines(ctx, displayItem.desc || '', dw).slice(0, 6).forEach((ln, i) => {
      drawText(ctx, ln, dx, y + 15 + i * 12, { font: FONTS.ui(9, 600), color: COLORS.text });
    });

    // ownership state
    let isEquipped = false;
    let isOwned = false;
    if (isSkinCat) {
      const equippedSkinId = EconomyManager.getEquippedSkin(fighter.id);
      isEquipped = (equippedSkinId === currentSkin.id) || (!equippedSkinId && currentSkin.isDefault);
      isOwned = currentSkin.isDefault || EconomyManager.isSkinOwned(currentSkin.id);
    } else {
      isEquipped = (equippedCos[cosType] === currentItem.id);
      isOwned = (currentItem.price === 0) || EconomyManager.isSkinOwned(currentItem.id);
    }
    const A = L.action;
    const key = gp ? 'A' : 'ENTER';
    if (isEquipped) {
      drawStatusBar(ctx, A.x, A.y, A.w, A.h, '✔ EQUIPPED', { color: COLORS.good, time: t, size: 9 });
    } else if (isOwned) {
      drawActionButton(ctx, A.x, A.y, A.w, A.h, 'EQUIP', { key, time: t, size: 12, color: '#2563eb', deep: '#1e3a8a' });
    } else if (isSkinCat && currentSkin.unlock === 'campaign') {
      drawStatusBar(ctx, A.x, A.y, A.w, A.h, '🔒 CLEAR CAMPAIGN AS THIS FIGHTER', { color: '#ff4d6d', time: t, size: 8 });
    } else {
      const price = displayItem.price || 0;
      const canAfford = coins >= price;
      // price row
      this.drawCoin(ctx, dx + 5, A.y - 12, 5);
      drawText(ctx, price.toLocaleString(), dx + 15, A.y - 8, { font: FONTS.display(13), color: canAfford ? COLORS.goldPale : COLORS.bad });
      if (!canAfford) drawText(ctx, 'NEED ' + (price - coins).toLocaleString() + ' MORE', dx + dw, A.y - 8.5, { font: FONTS.ui(8, 800), color: COLORS.bad, align: 'right' });
      drawActionButton(ctx, A.x, A.y, A.w, A.h, 'BUY', { key, time: t, size: 12, disabled: !canAfford });
    }

    // ---- Footer: feedback toast or prompts ----
    if (this.messageTimer > 0 && this.message) {
      const fade = Math.min(1, this.messageTimer / 20, (180 - this.messageTimer + 1) / 8);
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade);
      const msg = cleanLabel(this.message).replace(/[✨\u{1F389}❌]/gu, '').trim();
      drawStatusBar(ctx, W / 2 - 170, H - 26, 340, 18, msg, { color: this.messageColor || COLORS.gold, time: t, size: 8 });
      ctx.restore();
    } else {
      const items = gp
        ? [{ key: 'LB/RB', label: 'CATEGORY' }, { key: 'D-PAD', label: 'BROWSE' }, { key: 'A', label: 'BUY / EQUIP' }, { key: 'B', label: 'BACK' }]
        : [{ key: 'Q/E', label: 'CATEGORY' }, { key: 'W/S', label: 'LIST' }, ...(isSkinCat ? [{ key: 'A/D', label: 'SKIN' }] : []), { key: 'ENTER', label: 'BUY / EQUIP' }, { key: 'ESC', label: 'BACK' }];
      drawPromptBar(ctx, items, W / 2, H - 8);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
