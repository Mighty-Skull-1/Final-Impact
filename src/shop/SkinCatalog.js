// Final Impact - Skin Catalog & Economy Engine
// Manages fighter skins, coin transactions, inventory, and design overrides.

const COINS_KEY = 'final_impact_player_coins';
const OWNED_SKINS_KEY = 'final_impact_owned_skins';
const EQUIPPED_SKINS_KEY = 'final_impact_equipped_skins';
const DEFAULT_STARTING_COINS = 500;

export const SKIN_CATALOG = [
  // ===== KAZUKI SKINS =====
  {
    id: 'kazuki_shadow',
    fighterId: 'kazuki',
    name: 'SHADOW SHINOBI',
    tier: 'RARE',
    tierColor: '#38bdf8',
    price: 300,
    desc: 'Covert midnight shinobi robes tailored for silent elimination.',
    designOverrides: {
      top: { style: 'jacket', color: '#18181b', trim: '#ef4444', under: '#09090b' },
      bottom: { style: 'pants', color: '#09090b', trim: '#dc2626' },
      boots: { style: 'wrap', color: '#18181b', trim: '#dc2626' },
      arms: { style: 'sleeve', color: '#18181b' },
      gloves: { style: 'glove', color: '#dc2626' },
      head: { type: 'band', color: '#dc2626', trim: '#000000', tails: true },
      belt: { color: '#dc2626', buckle: '#09090b', tails: true },
      glow: '#ef4444'
    }
  },
  {
    id: 'kazuki_cyber',
    fighterId: 'kazuki',
    name: 'CYBER DRAGON',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'High-tech illuminated cyberweave gi pulsating with nanotech ki.',
    designOverrides: {
      hair: { style: 'spiky', color: '#06b6d4' },
      top: { style: 'jacket', color: '#0f172a', trim: '#06b6d4', under: '#0284c7' },
      bottom: { style: 'pants', color: '#0f172a', trim: '#06b6d4' },
      boots: { style: 'wrap', color: '#0284c7', trim: '#38bdf8' },
      arms: { style: 'sleeve', color: '#0f172a' },
      gloves: { style: 'glove', color: '#06b6d4' },
      head: { type: 'band', color: '#06b6d4', trim: '#38bdf8', tails: true },
      belt: { color: '#0284c7', buckle: '#38bdf8', tails: true },
      glow: '#38bdf8'
    }
  },
  {
    id: 'kazuki_gold',
    fighterId: 'kazuki',
    name: 'GOLDEN EMPEROR',
    tier: 'LEGENDARY',
    tierColor: '#facc15',
    price: 1000,
    desc: 'Imperial golden silk woven for tournament grand champions.',
    designOverrides: {
      hair: { style: 'spiky', color: '#fef08a' },
      top: { style: 'jacket', color: '#eab308', trim: '#fef08a', under: '#ca8a04' },
      bottom: { style: 'pants', color: '#ca8a04', trim: '#fef08a' },
      boots: { style: 'wrap', color: '#eab308', trim: '#fef08a' },
      arms: { style: 'sleeve', color: '#eab308' },
      gloves: { style: 'glove', color: '#ffffff' },
      head: { type: 'band', color: '#ffffff', trim: '#facc15', tails: true },
      belt: { color: '#ffffff', buckle: '#facc15', tails: true },
      glow: '#facc15'
    }
  },

  // ===== RAVEN SKINS =====
  {
    id: 'raven_urban',
    fighterId: 'raven',
    name: 'URBAN BLACK OPS',
    tier: 'RARE',
    tierColor: '#38bdf8',
    price: 300,
    desc: 'Low-profile stealth spec-ops armor with thermal crimson visor.',
    designOverrides: {
      hair: { style: 'short', color: '#18181b' },
      top: { style: 'vest', color: '#18181b', trim: '#ef4444', under: '#27272a' },
      bottom: { style: 'pants', color: '#27272a', trim: '#dc2626' },
      boots: { style: 'boot', color: '#09090b', trim: '#ef4444' },
      gloves: { style: 'glove', color: '#ef4444' },
      pauldrons: '#18181b',
      belt: { color: '#09090b', buckle: '#ef4444' },
      glow: '#ef4444'
    }
  },
  {
    id: 'raven_arctic',
    fighterId: 'raven',
    name: 'ARCTIC COMMANDO',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'Sub-zero cryo-insulated tactical rig designed for tundra operations.',
    designOverrides: {
      hair: { style: 'short', color: '#e2e8f0' },
      top: { style: 'vest', color: '#e2e8f0', trim: '#0284c7', under: '#cbd5e1' },
      bottom: { style: 'pants', color: '#94a3b8', trim: '#0284c7' },
      boots: { style: 'boot', color: '#1e293b', trim: '#38bdf8' },
      gloves: { style: 'glove', color: '#0284c7' },
      pauldrons: '#cbd5e1',
      belt: { color: '#0f172a', buckle: '#38bdf8' },
      glow: '#38bdf8'
    }
  },
  {
    id: 'raven_juggernaut',
    fighterId: 'raven',
    name: 'OBSIDIAN JUGGERNAUT',
    tier: 'LEGENDARY',
    tierColor: '#facc15',
    price: 1000,
    desc: 'Reinforced titanium heavy plated blast armor with gold trim.',
    designOverrides: {
      top: { style: 'vest', color: '#0a0a0a', trim: '#f59e0b', under: '#171717' },
      bottom: { style: 'pants', color: '#171717', trim: '#f59e0b' },
      boots: { style: 'boot', color: '#0a0a0a', trim: '#fbbf24' },
      gloves: { style: 'glove', color: '#f59e0b' },
      pauldrons: '#f59e0b',
      belt: { color: '#0a0a0a', buckle: '#fbbf24' },
      glow: '#fbbf24'
    }
  },

  // ===== KAGURA SKINS =====
  {
    id: 'kagura_bloodmoon',
    fighterId: 'kagura',
    name: 'BLOOD MOON',
    tier: 'RARE',
    tierColor: '#38bdf8',
    price: 300,
    desc: 'Crimson assassin vestments infused with dark moon ninja arts.',
    designOverrides: {
      hair: { style: 'ponytail', color: '#18181b' },
      head: { type: 'band', color: '#dc2626', trim: '#000000', tails: false },
      mask: { type: 'lower', color: '#991b1b' },
      top: { style: 'jacket', color: '#991b1b', trim: '#dc2626', under: '#450a0a' },
      bottom: { style: 'pants', color: '#450a0a', trim: '#dc2626' },
      boots: { style: 'boot', color: '#18181b', trim: '#dc2626' },
      gloves: { style: 'glove', color: '#991b1b' },
      belt: { color: '#dc2626', tails: true },
      scarf: '#dc2626',
      glow: '#ef4444'
    }
  },
  {
    id: 'kagura_neonghost',
    fighterId: 'kagura',
    name: 'NEON PHANTOM',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'Hyper-vibrant synthwave kunoichi suit with electric lime trails.',
    designOverrides: {
      hair: { style: 'ponytail', color: '#f43f5e' },
      head: { type: 'band', color: '#10b981', trim: '#f43f5e', tails: false },
      mask: { type: 'lower', color: '#10b981' },
      top: { style: 'jacket', color: '#022c22', trim: '#10b981', under: '#064e3b' },
      bottom: { style: 'pants', color: '#064e3b', trim: '#10b981' },
      boots: { style: 'boot', color: '#022c22', trim: '#10b981' },
      gloves: { style: 'glove', color: '#10b981' },
      belt: { color: '#f43f5e', tails: true },
      scarf: '#f43f5e',
      glow: '#10b981'
    }
  },
  {
    id: 'kagura_sovereign',
    fighterId: 'kagura',
    name: 'CELESTIAL EMPRESS',
    tier: 'LEGENDARY',
    tierColor: '#facc15',
    price: 1000,
    desc: 'Grand royal silk laced with iridescent starlight filaments.',
    designOverrides: {
      hair: { style: 'ponytail', color: '#ffffff' },
      head: { type: 'band', color: '#facc15', trim: '#ffffff', tails: false },
      mask: { type: 'lower', color: '#581c87' },
      top: { style: 'jacket', color: '#3b0764', trim: '#facc15', under: '#581c87' },
      bottom: { style: 'pants', color: '#581c87', trim: '#facc15' },
      boots: { style: 'boot', color: '#1e1b4b', trim: '#facc15' },
      gloves: { style: 'glove', color: '#facc15' },
      belt: { color: '#facc15', tails: true },
      scarf: '#facc15',
      glow: '#c084fc'
    }
  },

  // ===== FANG SKINS =====
  {
    id: 'fang_viper',
    fighterId: 'fang',
    name: 'EMERALD VIPER',
    tier: 'RARE',
    tierColor: '#38bdf8',
    price: 300,
    desc: 'Lethal jade silk fight trunks blessed by jungle Muay Thai masters.',
    designOverrides: {
      head: { type: 'band', color: '#10b981', trim: '#064e3b', tails: true },
      bottom: { style: 'shorts', color: '#047857', trim: '#10b981' },
      boots: { style: 'wrap', color: '#d1fae5', trim: '#10b981' },
      gloves: { style: 'wraps', color: '#d1fae5' },
      belt: { color: '#10b981', buckle: '#064e3b' },
      glow: '#10b981'
    }
  },
  {
    id: 'fang_kingcobra',
    fighterId: 'fang',
    name: 'BLACK COBRA',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'Pitch obsidian trunks stitched with golden dragon scales.',
    designOverrides: {
      head: { type: 'band', color: '#eab308', trim: '#18181b', tails: true },
      bottom: { style: 'shorts', color: '#18181b', trim: '#eab308' },
      boots: { style: 'wrap', color: '#27272a', trim: '#eab308' },
      gloves: { style: 'wraps', color: '#27272a' },
      belt: { color: '#eab308', buckle: '#18181b' },
      glow: '#facc15'
    }
  },

  // ===== ZEPHYR SKINS =====
  {
    id: 'zephyr_solar',
    fighterId: 'zephyr',
    name: 'SOLAR FLARE',
    tier: 'RARE',
    tierColor: '#38bdf8',
    price: 300,
    desc: 'Blazing sunset acrobat attire built for high-speed momentum.',
    designOverrides: {
      hair: { style: 'spiky', color: '#f97316' },
      top: { style: 'tank', color: '#ea580c' },
      bottom: { style: 'pants', color: '#431407', trim: '#fb923c' },
      boots: { style: 'boot', color: '#fb923c', trim: '#c2410c' },
      belt: { color: '#fb923c', tails: true },
      glow: '#f97316'
    }
  },
  {
    id: 'zephyr_electric',
    fighterId: 'zephyr',
    name: 'ELECTRIC SAMBA',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'High-frequency neon attire discharging kinetic spark arcs.',
    designOverrides: {
      hair: { style: 'spiky', color: '#38bdf8' },
      top: { style: 'tank', color: '#0284c7' },
      bottom: { style: 'pants', color: '#0f172a', trim: '#38bdf8' },
      boots: { style: 'boot', color: '#06b6d4', trim: '#0284c7' },
      belt: { color: '#38bdf8', tails: true },
      glow: '#38bdf8'
    }
  },

  // ===== COLOSSUS SKINS =====
  {
    id: 'colossus_titanium',
    fighterId: 'colossus',
    name: 'TITANIUM TITAN',
    tier: 'RARE',
    tierColor: '#38bdf8',
    price: 300,
    desc: 'Metallic chrome boxing shorts with reinforced shock gloves.',
    designOverrides: {
      bottom: { style: 'shorts', color: '#334155', trim: '#94a3b8' },
      boots: { style: 'boot', color: '#1e293b', trim: '#cbd5e1' },
      gloves: { style: 'glove', color: '#38bdf8' },
      belt: { color: '#94a3b8', buckle: '#e2e8f0' },
      glow: '#38bdf8'
    }
  },
  {
    id: 'colossus_gold',
    fighterId: 'colossus',
    name: 'GOLDEN GOLIATH',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'Heavy 24-karat championship trunks and jewel-encrusted knuckles.',
    designOverrides: {
      bottom: { style: 'shorts', color: '#ca8a04', trim: '#fef08a' },
      boots: { style: 'boot', color: '#854d0e', trim: '#fde047' },
      gloves: { style: 'glove', color: '#dc2626' },
      belt: { color: '#facc15', buckle: '#ffffff' },
      glow: '#facc15'
    }
  },

  // ===== CINDER SKINS =====
  {
    id: 'cinder_ghostfire',
    fighterId: 'cinder',
    name: 'COBALT GHOSTFIRE',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'Superheated cobalt blue spiritual flames and crystalline armor.',
    designOverrides: {
      top: { style: 'jacket', color: '#1e3a8a', trim: '#60a5fa', under: '#172554' },
      bottom: { style: 'pants', color: '#172554', trim: '#3b82f6' },
      boots: { style: 'boot', color: '#0f172a', trim: '#60a5fa' },
      head: { type: 'band', color: '#60a5fa', trim: '#93c5fd', tails: true },
      gloves: { style: 'glove', color: '#3b82f6' },
      scarf: '#60a5fa',
      belt: { color: '#3b82f6', tails: true },
      glow: '#60a5fa'
    }
  },

  // ===== GLACIER SKINS =====
  {
    id: 'glacier_magma',
    fighterId: 'glacier',
    name: 'VOLCANIC RIDGE',
    tier: 'EPIC',
    tierColor: '#c084fc',
    price: 600,
    desc: 'Molten obsidian crusted with bubbling core magma.',
    designOverrides: {
      top: { style: 'armor', color: '#7c2d12', trim: '#f97316' },
      bottom: { style: 'pants', color: '#431407', trim: '#ea580c' },
      boots: { style: 'greave', color: '#292524', trim: '#f97316' },
      arms: { style: 'gauntlet', color: '#ea580c' },
      gloves: { style: 'claws', color: '#f97316' },
      glow: '#ea580c'
    }
  },

  // ===== M1GHTY ADMIN SPECIAL SKINS =====
  {
    id: 'mighty_void',
    fighterId: 'mighty',
    name: 'VOID HARBINGER',
    tier: 'MYTHIC',
    tierColor: '#f43f5e',
    price: 2500,
    desc: 'Abyssal cosmic matter form with dimensional singularity energy.',
    designOverrides: {
      skin: '#cbd5e1',
      eyes: '#a855f7',
      hair: { style: 'spiky', color: '#6b21a8' },
      top: { style: 'armor', color: '#3b0764', trim: '#c084fc' },
      bottom: { style: 'skirt', color: '#1e1b4b', trim: '#a855f7' },
      boots: { style: 'greave', color: '#3b0764', trim: '#c084fc' },
      arms: { style: 'gauntlet', color: '#6b21a8' },
      gloves: { style: 'glove', color: '#c084fc' },
      pauldrons: '#6b21a8',
      cape: '#1e1b4b',
      belt: { color: '#a855f7', buckle: '#f43f5e' },
      glow: '#c084fc'
    }
  },
  {
    id: 'mighty_crimson',
    fighterId: 'mighty',
    name: 'CRIMSON GOD',
    tier: 'MYTHIC',
    tierColor: '#f43f5e',
    price: 2500,
    desc: 'Cataclysmic solar blood plate armor radiating pure annihilation.',
    designOverrides: {
      skin: '#fca5a5',
      eyes: '#ffffff',
      hair: { style: 'spiky', color: '#dc2626' },
      top: { style: 'armor', color: '#991b1b', trim: '#fca5a5' },
      bottom: { style: 'skirt', color: '#450a0a', trim: '#ef4444' },
      boots: { style: 'greave', color: '#991b1b', trim: '#fca5a5' },
      arms: { style: 'gauntlet', color: '#b91c1c' },
      gloves: { style: 'glove', color: '#ef4444' },
      pauldrons: '#b91c1c',
      cape: '#7f1d1d',
      belt: { color: '#ef4444', buckle: '#ffffff' },
      glow: '#ef4444'
    }
  }
];

export class EconomyManager {
  static getCoins() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(COINS_KEY);
        if (stored === null) {
          // Initialize starter coins
          localStorage.setItem(COINS_KEY, String(DEFAULT_STARTING_COINS));
          return DEFAULT_STARTING_COINS;
        }
        return Math.max(0, parseInt(stored, 10) || 0);
      }
    } catch (e) {}
    return DEFAULT_STARTING_COINS;
  }

  static addCoins(amount) {
    const cur = this.getCoins();
    const updated = Math.max(0, cur + Math.floor(amount));
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(COINS_KEY, String(updated));
      }
    } catch (e) {}
    return updated;
  }

  static spendCoins(amount) {
    const cur = this.getCoins();
    if (cur < amount) return false;
    const updated = cur - amount;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(COINS_KEY, String(updated));
      }
    } catch (e) {}
    return true;
  }

  static setCoins(amount) {
    const valid = Math.max(0, Math.floor(amount));
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(COINS_KEY, String(valid));
      }
    } catch (e) {}
    return valid;
  }

  static getOwnedSkins() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(OWNED_SKINS_KEY);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) return new Set(list);
        }
      }
    } catch (e) {}
    return new Set();
  }

  static isSkinOwned(skinId) {
    if (!skinId || skinId === 'default' || skinId.endsWith('_default')) return true;
    return this.getOwnedSkins().has(skinId);
  }

  static buySkin(skinId) {
    const skin = SKIN_CATALOG.find(s => s.id === skinId);
    if (!skin) return { success: false, reason: 'Skin not found' };
    if (this.isSkinOwned(skinId)) return { success: true, alreadyOwned: true };

    if (!this.spendCoins(skin.price)) {
      return { success: false, reason: 'Insufficient coins' };
    }

    const owned = this.getOwnedSkins();
    owned.add(skinId);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(Array.from(owned)));
      }
    } catch (e) {}

    return { success: true, skin };
  }

  static getEquippedSkin(fighterId) {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(EQUIPPED_SKINS_KEY);
        if (stored) {
          const map = JSON.parse(stored);
          return map[fighterId] || null;
        }
      }
    } catch (e) {}
    return null;
  }

  static equipSkin(fighterId, skinId) {
    try {
      if (typeof localStorage !== 'undefined') {
        let map = {};
        const stored = localStorage.getItem(EQUIPPED_SKINS_KEY);
        if (stored) map = JSON.parse(stored);
        
        if (!skinId || skinId === 'default' || skinId === `${fighterId}_default`) {
          delete map[fighterId];
        } else {
          map[fighterId] = skinId;
        }
        localStorage.setItem(EQUIPPED_SKINS_KEY, JSON.stringify(map));
      }
    } catch (e) {}
    return skinId;
  }

  static unlockAllSkins() {
    const allIds = SKIN_CATALOG.map(s => s.id);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(allIds));
      }
    } catch (e) {}
    return allIds.length;
  }

  static resetOwnedSkins() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(OWNED_SKINS_KEY);
        localStorage.removeItem(EQUIPPED_SKINS_KEY);
      }
    } catch (e) {}
  }
}

/**
 * Returns the effective fighter design by merging base design with equipped skin overrides.
 */
export function getSkinDesign(baseDesign, skinId) {
  if (!baseDesign) return baseDesign;
  if (!skinId || skinId === 'default' || skinId.endsWith('_default')) return baseDesign;

  const skin = SKIN_CATALOG.find(s => s.id === skinId);
  if (!skin || !skin.designOverrides) return baseDesign;

  // Deep clone and merge overrides
  const result = JSON.parse(JSON.stringify(baseDesign));
  const overrides = skin.designOverrides;

  for (const [k, v] of Object.entries(overrides)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && result[k] && typeof result[k] === 'object') {
      result[k] = { ...result[k], ...v };
    } else {
      result[k] = v;
    }
  }

  return result;
}
