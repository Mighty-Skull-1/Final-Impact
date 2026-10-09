// Final Impact - Battleground Catalog
// Single source of truth for every selectable arena (used by Stage Select, Character Select & netplay sync).

export const STAGE_CATALOG = [
  {
    id: 'suzaku',
    name: 'SUZAKU ROOFTOP',
    location: 'Tokyo Sunset',
    blurb: 'Falling cherry blossoms drift across a blood-red sunset skyline.',
    accent: '#f97316'
  },
  {
    id: 'neo_tokyo',
    name: 'NEO UNDERPASS',
    location: 'Cyberpunk District',
    blurb: 'Neon steam vents and a roaring bullet train shake the concrete.',
    accent: '#22d3ee'
  },
  {
    id: 'thunder_dojo',
    name: 'THUNDER DOJO',
    location: 'Ancient Storm Hall',
    blurb: 'Lightning flashes through shoji screens above polished tatami.',
    accent: '#facc15'
  },
  {
    id: 'dragon_shrine',
    name: 'DRAGON SHRINE',
    location: 'Crimson Twilight',
    blurb: 'Rune-lit pillars glow beneath a blood moon and violet storm.',
    accent: '#a855f7'
  },
  {
    id: 'ember_forge',
    name: 'EMBER FORGE',
    location: 'Volcanic Foundry',
    blurb: 'Molten rivers roar behind a forge where legends were hammered.',
    accent: '#ef4444'
  },
  {
    id: 'bamboo_night',
    name: 'MOONLIT BAMBOO',
    location: 'Silent Midnight Grove',
    blurb: 'Fireflies drift between swaying bamboo under a silver moon.',
    accent: '#34d399'
  }
];

export function getStageIndexById(id) {
  const idx = STAGE_CATALOG.findIndex(s => s.id === id);
  return idx >= 0 ? idx : 0;
}
