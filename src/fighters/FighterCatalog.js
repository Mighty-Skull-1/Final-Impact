// Final Impact - Complete Fighter Moves & Character Catalog
// Single source of truth for character bios, special moves, input commands, and descriptions

export const UNIVERSAL_MECHANICS = {
  movement: [
    { name: 'Walk / Step', keyboard: 'A / D', gamepad: 'Left Stick / D-Pad', desc: 'Approach or retreat' },
    { name: 'Jump', keyboard: 'W', gamepad: 'Up / Stick Up', desc: 'Airborne attacks and jump-ins' },
    { name: 'Crouch', keyboard: 'S', gamepad: 'Down / Stick Down', desc: 'Duck under high strikes and block low' },
    { name: 'Dash (Fwd / Back)', keyboard: 'Double-tap A or D', gamepad: 'Double-tap Stick / D-Pad', desc: 'Quick evasive burst or rapid gap closer' }
  ],
  normals: [
    { name: 'Light Punch (LP)', keyboard: 'U', gamepad: 'X (Square)', desc: 'Fast, low-risk jab. Great for combo starters & poking' },
    { name: 'Heavy Punch (HP)', keyboard: 'I', gamepad: 'Y (Triangle)', desc: 'Heavy damaging strike with high hitstun and poise damage' },
    { name: 'Light Kick (LK)', keyboard: 'J', gamepad: 'A (Cross)', desc: 'Swift kick. Low crouch version hits crouching opponents' },
    { name: 'Heavy Kick (HK)', keyboard: 'K', gamepad: 'B (Circle)', desc: 'Hard roundhouse or sweep. Crouch HK knocks down!' }
  ],
  defense: [
    { name: 'High Block', keyboard: 'Hold BACK (A / D away)', gamepad: 'Hold Stick / D-Pad Back', desc: 'Blocks high and mid attacks, projectiles, and jump-ins' },
    { name: 'Low Block', keyboard: 'Hold DOWN + BACK', gamepad: 'Hold Stick / D-Pad Down-Back', desc: 'Crouch block. Shields against low sweeps and slide kicks' },
    { name: 'Stance / Poise Break', keyboard: 'Continuous Attacks', gamepad: 'Continuous Attacks', desc: 'Deplete foe poise bar to trigger Stance Break & 2.5× Critical Riposte' },
    { name: 'Limb / Rib Break', keyboard: 'Torso & Limb Strikes', gamepad: 'Torso & Limb Strikes', desc: 'Damaging torso limbs cracks ribs and permanently weakens defense' },
    { name: 'Throw', keyboard: 'U + J (up close)', gamepad: 'X + A (up close)', desc: 'Grab a blocking opponent. Hold BACK while throwing to swap sides' },
    { name: 'Throw Tech', keyboard: 'U + J when grabbed', gamepad: 'X + A when grabbed', desc: 'Press within a split second of being grabbed to break free' },
    { name: 'Combo Breaker', keyboard: 'C while being hit', gamepad: 'LT while being hit', desc: 'Spend 50% Super to burst out of a combo and blow the attacker away' },
    { name: 'Counter Hit', keyboard: 'Hit them mid-attack', gamepad: 'Hit them mid-attack', desc: 'Striking during an enemy attack start-up deals +20% damage and extra stun' }
  ],
  tactical: [
    { name: 'Dirty Tactic', keyboard: 'C', gamepad: 'LT (Left Trigger)', desc: 'Unblockable blinding gambit (pocket sand, taser, flash). Recharges for 9s after use — watch the D icon' },
    { name: 'Secret Ougi Ultimate', keyboard: 'SPACE', gamepad: 'R3 (Stick Click) / LB+RB', desc: 'Requires 100% Super. Invincible lunge — on hit it locks the foe into a cinematic flurry. Whiff it and you are wide open' },
    { name: 'Finish Him / Fatality', keyboard: 'SPACE or I + K', gamepad: 'R3 or Y + B', desc: 'During "FINISH HIM" stagger, execute lethal cinematic finishing move' },
    { name: 'Stage Fatality', keyboard: 'C', gamepad: 'LT', desc: 'Knock staggered foe into stage deathtraps (molten forge, subway train, crusher)' },
    { name: 'Controls Helper Toggle', keyboard: 'TAB', gamepad: '—', desc: 'Toggles the beginner on-screen controls HUD overlay in real-time' },
    { name: 'Pause / Move List', keyboard: 'P', gamepad: 'START / MENU', desc: 'Pauses the match and opens the full Command List & Move Guide' }
  ]
};

export const FIGHTER_CATALOG = [
  {
    id: 'kazuki',
    name: 'KAZUKI',
    kanji: '龍神 一輝',
    title: 'THE DRAGON STRIKER',
    style: 'Ansatsuken Karate',
    origin: 'Japan',
    power: 4,
    speed: 4,
    defense: 4,
    quote: '"The dragon within burns brighter with every strike."',
    specials: [
      { name: 'Hadouken', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Ki Fireball projectile — controls ground space and pressures from distance' },
      { name: 'Shoryuken', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible rising dragon uppercut — supreme anti-air reversal' },
      { name: 'Tatsumaki', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Spinning horizontal whirlwind kick — breaks guards, bypasses projectiles & juggles' }
    ],
    ultimate: {
      name: 'Ryujin Gotenha',
      kanji: '奥義・龍神轟天破',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Summons a colossal fiery dragon avatar that incinerates the opponent across the arena'
    },
    fatality: {
      name: 'Dragon Cremation',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Calls down a blazing pillar of celestial dragon fire, reducing the opponent to ash'
    }
  },
  {
    id: 'raven',
    name: 'RAVEN',
    kanji: 'レイヴン',
    title: 'TACTICAL COMMANDO',
    style: 'Military Brawling',
    origin: 'USA',
    power: 5,
    speed: 3,
    defense: 5,
    quote: '"Mission objective: neutralize threat. Commencing operation."',
    specials: [
      { name: 'Sonic Blade', cmd: '← (hold) → + P (or SP1)', cmdKeyboard: 'Q (or Hold A → D + P)', cmdGamepad: 'RB (or Charge ← → + X/Y)', desc: 'Spinning sonic razor projectile — high projectile durability' },
      { name: 'Flash Somersault', cmd: '↓ (hold) ↑ + K (or SP2)', cmdKeyboard: 'E (or Hold S → W + K)', cmdGamepad: 'RT (or Charge ↓ ↑ + A/B)', desc: 'Anti-air acrobatic backflip razor slash — knocks foes out of the sky' },
      { name: 'Blitz Knuckle', cmd: '↓ ↘ → + P (or SP3)', cmdKeyboard: 'R (or ↓ ↘ → + P)', cmdGamepad: 'LB (or ↓ ↘ → + X/Y)', desc: 'Rocket-assisted straight armor punch — absorbs one hit while lunging forward' }
    ],
    ultimate: {
      name: 'Tactical Overdrive',
      kanji: '超戦術・雷光撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Targeting laser locks on foe for a high-intensity multi-hit explosive orbital barrage'
    },
    fatality: {
      name: 'Orbital Annihilation',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Calls a tactical laser strike from a low-orbit defense satellite that vaporizes the target'
    }
  },
  {
    id: 'kagura',
    name: 'KAGURA',
    kanji: '神楽 蓮',
    title: 'CYBER KUNOICHI',
    style: 'Shadow Ninjutsu',
    origin: 'Neo Tokyo',
    power: 3,
    speed: 5,
    defense: 3,
    quote: '"You fight what your eyes see. I strike from where they cannot."',
    specials: [
      { name: 'Shadow Warp', cmd: '↓ ↙ ← + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↙ ← + P)', cmdGamepad: 'RB (or ↓ ↙ ← + X/Y)', desc: 'Smokeless ninja teleport behind opponent — instantly bypasses zoning' },
      { name: 'Crescent Gale', cmd: '↓ ↘ → + K (or SP2)', cmdKeyboard: 'E (or ↓ ↘ → + K)', cmdGamepad: 'RT (or ↓ ↘ → + A/B)', desc: 'Triple rising cyclone wind kick — excellent multi-hit combo ender' },
      { name: 'Ki Kunai', cmd: '↓ ↘ → + P (or SP3)', cmdKeyboard: 'R (or ↓ ↘ → + P)', cmdGamepad: 'LB (or ↓ ↘ → + X/Y)', desc: 'Rapid throwing kunai energy volley — rapid poke to check advancing enemies' }
    ],
    ultimate: {
      name: 'Lotus Clones',
      kanji: '秘術・千夜蓮華',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Splits into six shadow clones that surround the foe in a dizzying omnidirectional storm of blades'
    },
    fatality: {
      name: 'Shadow Decapitation',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Phantom shadow blitz slices through darkness, cleanly severing the foe in a flash of crimson'
    }
  },
  {
    id: 'fang',
    name: 'FANG',
    kanji: 'ファング',
    title: 'THE LETHAL STRIKER',
    style: 'Muay Thai / Lethwei',
    origin: 'Thailand',
    power: 4,
    speed: 4,
    defense: 4,
    quote: '"Eight limbs. Eight weapons. None shall be spared."',
    specials: [
      { name: 'Tiger Knee', cmd: '↓ ↘ → + K (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + K)', cmdGamepad: 'RB (or ↓ ↘ → + A/B)', desc: 'Forward leaping diagonal knee strike — crushes crouch blockers and closes gaps' },
      { name: 'Cyclone Elbow', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Double spinning slicing elbow — inflicts massive limb and rib damage' },
      { name: 'Iron Teep', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Heavy pushback front kick — shoves foes across the arena into corners' }
    ],
    ultimate: {
      name: 'Siam Rampage',
      kanji: '奥義・猛虎連撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Unleashes the devastating Nine Tigers Lethwei combo of shattering knees and elbows'
    },
    fatality: {
      name: 'Bone Crusher',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A devastating flying double knee impact that shatters the ribcage with thunderous force'
    }
  },
  {
    id: 'zephyr',
    name: 'ZEPHYR',
    kanji: 'ゼファー',
    title: 'THE WIND DANCER',
    style: 'Capoeira Acrobat',
    origin: 'Brazil',
    power: 3,
    speed: 5,
    defense: 3,
    quote: '"Catch the rhythm or fall to the floor. The choice is yours."',
    specials: [
      { name: 'Windmill Kick', cmd: '↓ ↘ → + K (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + K)', cmdGamepad: 'RB (or ↓ ↘ → + A/B)', desc: 'Spinning ground sweep kick — ducks under high projectiles while hitting low' },
      { name: 'Handstand Axe', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Overhead handstand heel drop — cracks standing guards open from above' },
      { name: 'Flare Slide', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Low evasive sliding sweep — passes beneath enemy strikes to hit legs' }
    ],
    ultimate: {
      name: 'Carnival Tempest',
      kanji: '秘技・旋風乱舞',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'A dazzling acrobatic hurricane of spiraling rhythmic capoeira strikes'
    },
    fatality: {
      name: 'Spine Breaker',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A high-velocity corkscrew axe kick that drives the opponent through the floor'
    }
  },
  {
    id: 'colossus',
    name: 'COLOSSUS',
    kanji: 'コロッサス',
    title: 'THE IRON WALL',
    style: 'Heavyweight Boxing',
    origin: 'USA',
    power: 5,
    speed: 2,
    defense: 5,
    quote: '"Stand in front of me and you get put to sleep. Simple as that."',
    specials: [
      { name: 'Dempsey Blow', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Armored heavy body blow — absorbs enemy attacks and deals devastating poise damage' },
      { name: 'Corkscrew', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Rising spiral uppercut — lifts airborne foes for high-damage corner juggles' },
      { name: 'Gazelle Punch', cmd: '↓ ↙ ← + P (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + P)', cmdGamepad: 'LB (or ↓ ↙ ← + X/Y)', desc: 'Leaping heavy hook punch — lunges forward with unstoppable momentum' }
    ],
    ultimate: {
      name: 'Titan Impact',
      kanji: '剛拳・剛震天撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Charges maximum boxing power and unloads a shockwave straight punch that rattles the stadium'
    },
    fatality: {
      name: 'Decapitating Hook',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A full-weight Dempsey left hook that blasts the opponent clean off the screen'
    }
  },
  {
    id: 'cinder',
    name: 'CINDER',
    kanji: 'シンダー',
    title: 'EMBER SHINOBI',
    style: 'Flame Ninjutsu',
    origin: 'Ash Province',
    power: 3,
    speed: 5,
    defense: 3,
    quote: '"Burn bright, burn fast. Then burn out."',
    specials: [
      { name: 'Flame Warp', cmd: '↓ ↙ ← + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↙ ← + P)', cmdGamepad: 'RB (or ↓ ↙ ← + X/Y)', desc: 'Vanishes in blazing smoke, reappearing instantly behind the foe' },
      { name: 'Ember Gale', cmd: '↓ ↘ → + K (or SP2)', cmdKeyboard: 'E (or ↓ ↘ → + K)', cmdGamepad: 'RT (or ↓ ↘ → + A/B)', desc: 'Triple rising fire kick leaving trails of burning ash in the air' },
      { name: 'Fire Kunai', cmd: '↓ ↘ → + P (or SP3)', cmdKeyboard: 'R (or ↓ ↘ → + P)', cmdGamepad: 'LB (or ↓ ↘ → + X/Y)', desc: 'Rapid volley of blazing kunai that ignite upon contact' }
    ],
    ultimate: {
      name: 'Infernal Bloom',
      kanji: '秘術・劫火連華',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Creates a vortex of scorching petals that erupts into an inferno'
    },
    fatality: {
      name: 'Ashen Pyre',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Engulfs the staggered opponent in white-hot flame, leaving only smoldering embers'
    }
  },
  {
    id: 'glacier',
    name: 'GLACIER',
    kanji: 'グレイシア',
    title: 'FROSTBOUND ASSASSIN',
    style: 'Ice Ansatsuken',
    origin: 'Frozen North',
    power: 4,
    speed: 4,
    defense: 4,
    quote: '"Cold steel and colder resolve. You are already frozen."',
    specials: [
      { name: 'Ice Shard', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Sharp freezing ki projectile that chills and slows foe movement' },
      { name: 'Frost Rise', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible rising ice uppercut cloaked in frozen frost needles' },
      { name: 'Blizzard Kick', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Spinning icy horizontal kick that freezes airborne opponents' }
    ],
    ultimate: {
      name: 'Zero Absolute',
      kanji: '奥義・絶対零度',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Freezes time and temperature in a single lethal crystalline strike'
    },
    fatality: {
      name: 'Shattered Frost',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Flash freezes the target into solid ice and shatters them into a thousand crystalline shards'
    }
  },
  {
    id: 'oracle',
    name: 'ORACLE',
    kanji: 'オラクル',
    title: 'STAR-READER',
    style: 'Astral Sorcery',
    origin: 'Observatory Ruins',
    power: 2,
    speed: 4,
    defense: 3,
    quote: '"The stars wrote your defeat long before you were born."',
    specials: [
      { name: 'Star Step', cmd: '↓ ↙ ← + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↙ ← + P)', cmdGamepad: 'RB (or ↓ ↙ ← + X/Y)', desc: 'Blinks through cosmic dimensional space behind the opponent' },
      { name: 'Comet Fall', cmd: '↓ ↘ → + K (or SP2)', cmdKeyboard: 'E (or ↓ ↘ → + K)', cmdGamepad: 'RT (or ↓ ↘ → + A/B)', desc: 'Triple rising starlight strike that cascades down like meteors' },
      { name: 'Astral Dart', cmd: '↓ ↘ → + P (or SP3)', cmdKeyboard: 'R (or ↓ ↘ → + P)', cmdGamepad: 'LB (or ↓ ↘ → + X/Y)', desc: 'Rapid homing starlight darts that track advancing enemies' }
    ],
    ultimate: {
      name: 'Supernova Collapse',
      kanji: '天術・星霊崩壊',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Draws down a miniature dying star that implodes violently upon the opponent'
    },
    fatality: {
      name: 'Astral Rift',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Opens a dimensional void that pulls the opponent into eternal cosmic emptiness'
    }
  },
  {
    id: 'bandit',
    name: 'BANDIT',
    kanji: 'バンディット',
    title: 'ROAD REAVER',
    style: 'Dirty Brawling',
    origin: 'Wastelands',
    power: 4,
    speed: 4,
    defense: 3,
    quote: '"Nothing personal. I just take what I want."',
    specials: [
      { name: 'Razor Toss', cmd: '← (hold) → + P (or SP1)', cmdKeyboard: 'Q (or Hold A → D + P)', cmdGamepad: 'RB (or Charge ← → + X/Y)', desc: 'Spinning jagged thrown cleaver projectile' },
      { name: 'Back Flip Slash', cmd: '↓ (hold) ↑ + K (or SP2)', cmdKeyboard: 'E (or Hold S → W + K)', cmdGamepad: 'RT (or Charge ↓ ↑ + A/B)', desc: 'Anti-air flip slash that catches jump-ins with dirty razor boots' },
      { name: 'Knuckle Dust', cmd: '↓ ↘ → + P (or SP3)', cmdKeyboard: 'R (or ↓ ↘ → + P)', cmdGamepad: 'LB (or ↓ ↘ → + X/Y)', desc: 'Armored brass knuckle straight punch that breaks through guards' }
    ],
    ultimate: {
      name: 'Highway Massacre',
      kanji: '凶刃・狂乱乱撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Unleashes an unpredictable bar-fight flurry of knives, chains, and boots'
    },
    fatality: {
      name: 'Roadkill',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Knocks the opponent down and drives over them with a roaring wasteland buggy'
    }
  },
  {
    id: 'confessor',
    name: 'CONFESSOR',
    kanji: '告解者',
    title: 'HOODED INQUISITOR',
    style: 'Penitent Striking',
    origin: 'Hollow Cathedral',
    power: 4,
    speed: 3,
    defense: 4,
    quote: '"Kneel. Your sins end here."',
    specials: [
      { name: 'Penance Knee', cmd: '↓ ↘ → + K (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + K)', cmdGamepad: 'RB (or ↓ ↘ → + A/B)', desc: 'Leaping knee strike infused with penitent kinetic force' },
      { name: 'Judgement Elbow', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Double spinning holy elbow that cracks enemy posture' },
      { name: 'Silent Teep', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Heavy pushback kick that drives heretics into stage boundaries' }
    ],
    ultimate: {
      name: 'Grand Inquisitive',
      kanji: '神罰・断罪の鉄槌',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Chants sacred verses as golden cathedral chains pin and crush the sinner'
    },
    fatality: {
      name: 'Righteous Pyre',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Impales the opponent upon a holy stake as golden divine fire consumes them'
    }
  },
  {
    id: 'valka',
    name: 'VALKA',
    kanji: 'ヴァルカ',
    title: 'SHIELD-SISTER',
    style: 'Warrior Karate',
    origin: 'Northern Hold',
    power: 3,
    speed: 5,
    defense: 3,
    quote: '"Sing of my victory in the halls of the fallen!"',
    specials: [
      { name: 'War Cry', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Ki shockwave roar that stuns and travels full screen' },
      { name: 'Valkyrie Rise', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible soaring strike that launches foes into the clouds' },
      { name: 'Storm Spin', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Spinning horizontal axe kick with crushing rotational speed' }
    ],
    ultimate: {
      name: 'Valhalla Descent',
      kanji: '英霊・戦乙女の降臨',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Leaps high into the northern storm and crashes down like Mjolnir'
    },
    fatality: {
      name: 'Blood Eagle',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A devastating dual-axe strike that seals the enemy in an eternal northern tomb'
    }
  },
  {
    id: 'convict',
    name: 'CONVICT',
    kanji: 'コンヴィクト',
    title: 'THE SACKED ONE',
    style: 'Prison Boxing',
    origin: 'Black Gaol',
    power: 5,
    speed: 2,
    defense: 5,
    quote: '"Years in the dark taught me how to hit back."',
    specials: [
      { name: 'Chain Hook', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Armored body blow swinging heavy iron penitentiary chains' },
      { name: 'Breakout', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Rising spiral uppercut that shatters airborne defenses' },
      { name: 'Cell Rush', cmd: '↓ ↙ ← + P (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + P)', cmdGamepad: 'LB (or ↓ ↙ ← + X/Y)', desc: 'Leaping heavyweight hook with unstoppable forward momentum' }
    ],
    ultimate: {
      name: 'Solitary Confinement',
      kanji: '暗黒・鎖牢獄撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Wraps the foe in rusted chains and pounds them into the cobblestones'
    },
    fatality: {
      name: 'Death Row',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Snaps an iron chain around the target and executes an earth-shattering choke slam'
    }
  },
  {
    id: 'prophet',
    name: 'PROPHET',
    kanji: '予言者',
    title: 'THE BLIND SEER',
    style: 'Mystic Capoeira',
    origin: 'Dune Temple',
    power: 3,
    speed: 4,
    defense: 3,
    quote: '"I did not need eyes to see how this would end."',
    specials: [
      { name: 'Sand Wheel', cmd: '↓ ↘ → + K (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + K)', cmdGamepad: 'RB (or ↓ ↘ → + A/B)', desc: 'Spinning ground sweep cloaked in abrasive desert sand' },
      { name: 'Vision Axe', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Overhead heel drop that predicts and punishes crouch blocking' },
      { name: 'Dust Slide', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Low evasive slide that leaves a blinding cloud of dust' }
    ],
    ultimate: {
      name: 'Mirage of Doom',
      kanji: '幻影・砂嵐の蜃気楼',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Summons three sand illusions that barrage the foe before a giant dune collapses'
    },
    fatality: {
      name: 'Entombed in Sand',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A mystical desert whirlwind buries the staggered foe alive in an ancient sand sarcophagus'
    }
  },
  {
    id: 'ronin',
    name: 'RONIN',
    kanji: '浪人',
    title: 'CRIMSON BLADE',
    style: 'Bushido Karate',
    origin: 'Feudal Japan',
    power: 4,
    speed: 4,
    defense: 4,
    quote: '"A masterless blade still cuts true."',
    specials: [
      { name: 'Wave Cutter', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Razor-sharp ki slash projectile flying across the floor' },
      { name: 'Rising Katana', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible rising katana draw that slices airborne foes' },
      { name: 'Whirl Kick', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Spinning horizontal martial kick that clears space and juggles' }
    ],
    ultimate: {
      name: 'Crimson Eclipse',
      kanji: '奥義・紅月一閃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Sheathes blade, dashes past enemy in a flash of red moonlight, splitting the screen in two'
    },
    fatality: {
      name: 'Iai Execution',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A single hyper-speed draw cuts the screen in half before the foe collapses into ribbons'
    }
  },
  {
    id: 'vagabond',
    name: 'VAGABOND',
    kanji: 'バガボンド',
    title: 'WANDERING KNIGHT',
    style: 'Heavy Blade Brawling',
    origin: 'Fallen Kingdom',
    power: 5,
    speed: 3,
    defense: 5,
    quote: '"Another battle. Another road. Move aside."',
    specials: [
      { name: 'Edge Wave', cmd: '← (hold) → + P (or SP1)', cmdKeyboard: 'Q (or Hold A → D + P)', cmdGamepad: 'RB (or Charge ← → + X/Y)', desc: 'Heavy greatsword ground shockwave projectile' },
      { name: 'Knight Flip', cmd: '↓ (hold) ↑ + K (or SP2)', cmdKeyboard: 'E (or Hold S → W + K)', cmdGamepad: 'RT (or Charge ↓ ↑ + A/B)', desc: 'Anti-air backflip greatsword slash with high vertical reach' },
      { name: 'Shield Ram', cmd: '↓ ↘ → + P (or SP3)', cmdKeyboard: 'R (or ↓ ↘ → + P)', cmdGamepad: 'LB (or ↓ ↘ → + X/Y)', desc: 'Armored iron shield rush that plows through incoming strikes' }
    ],
    ultimate: {
      name: 'Kingdom Fall',
      kanji: '覇王・王宮崩落撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Charges maximum greatsword force and executes an earth-shattering seismic cleave'
    },
    fatality: {
      name: 'Greatsword Guillotine',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Brings down a five-foot greatsword like a medieval executioner guillotine'
    }
  },
  {
    id: 'warden',
    name: 'WARDEN',
    kanji: 'ウォーデン',
    title: 'WALL OF THE DESERT',
    style: 'Desert Boxing Kicks',
    origin: 'Sand Citadel',
    power: 4,
    speed: 3,
    defense: 5,
    quote: '"The wall does not break. You do."',
    specials: [
      { name: 'Citadel Knee', cmd: '↓ ↘ → + K (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + K)', cmdGamepad: 'RB (or ↓ ↘ → + A/B)', desc: 'Forward leaping fortified knee that batters through guard' },
      { name: 'Twin Blades', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Double spinning slicing elbow strikes with high poise damage' },
      { name: 'Iron Gate', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Unmovable pushback front kick that drives enemies into wall bounces' }
    ],
    ultimate: {
      name: 'Bastion Collapse',
      kanji: '要塞・城壁崩壊',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Summons iron gates that trap the foe before crushing them in a fortified vise'
    },
    fatality: {
      name: 'Gate Crusher',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Slams two massive iron portcullis doors together upon the staggered victim'
    }
  },
  {
    id: 'wretch',
    name: 'WRETCH',
    kanji: 'レッチ',
    title: 'THE UNBROKEN',
    style: 'Desperate Scrapping',
    origin: 'Nowhere',
    power: 2,
    speed: 5,
    defense: 2,
    quote: '"Even the weakest can bite when cornered."',
    specials: [
      { name: 'Scramble Spin', cmd: '↓ ↘ → + K (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + K)', cmdGamepad: 'RB (or ↓ ↘ → + A/B)', desc: 'Erratic low spinning sweep that confuses opponent blocking' },
      { name: 'Crow Drop', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Overhead leaping heel drop strike that hits from unexpected angles' },
      { name: 'Gutter Slide', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Rapid low sliding tackle that passes beneath projectile attacks' }
    ],
    ultimate: {
      name: 'Desperate Fury',
      kanji: '狂気・死中求活撃',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Unleashes an uncontrollable, feral flurry of wild scratching and biting strikes'
    },
    fatality: {
      name: 'Feral Mauling',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'A savage, unrelenting tackle that leaves nothing but a silhouette on the asphalt'
    }
  },
  {
    id: 'echo',
    name: 'ECHO',
    kanji: 'エコー',
    title: 'THE AFTERIMAGE',
    style: 'Chrono Kunst',
    origin: 'Year 2091',
    power: 3,
    speed: 5,
    defense: 3,
    isNew: true,
    mechanic: 'Her ghost replays your last 2 seconds — do a combo, then press SP1 and the ghost does it again.',
    quote: '"I already won this fight. I\'m just here to watch it happen again."',
    specials: [
      { name: 'Echo Step', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'A ghost of ECHO steps out and replays everything she did in the last 2 seconds — its hits land too (half damage). 5s recharge' },
      { name: 'Déjà Vu', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible rising palm. If it hits, the same hit lands again a moment later' },
      { name: 'Phase Shift', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Slips straight through the opponent and their projectiles, then strikes from the other side' }
    ],
    ultimate: {
      name: 'Time Collapse',
      kanji: '時間崩壊',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Rewinds ECHO 3 seconds (position and lost health), then time snaps back on a nearby opponent — every hit she landed in that window replays at once'
    },
    fatality: {
      name: 'Paradox',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Erases the opponent from every second of the fight at once'
    }
  },
  {
    id: 'glitch',
    name: 'GLITCH',
    kanji: 'グリッチ',
    title: 'THE CORRUPTED',
    style: 'Code Injection',
    origin: 'The Deep Web',
    power: 3,
    speed: 4,
    defense: 3,
    isNew: true,
    mechanic: 'Hit with SP2 to copy their last special, then press SP3 to use it against them.',
    quote: '"Your moves? Nice. Mine now."',
    specials: [
      { name: 'Lag Spike', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Blinks through the opponent and leaves a corrupted packet behind that detonates a moment later' },
      { name: 'Ctrl+C', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: "Long reaching data-hand. On hit it COPIES the opponent's last-used special" },
      { name: 'Ctrl+V', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Runs the copied special as GLITCH. With nothing copied: a point-blank corrupting burst. Getting hit wipes the copy' }
    ],
    ultimate: {
      name: 'Blue Screen of Death',
      kanji: '致命的例外',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Cinematic beat-down; the victim\'s controls are scrambled for 5 seconds (directions, punches/kicks and SP1/SP3 swap)'
    },
    fatality: {
      name: 'Delete',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Pixelates the opponent and deletes them from the server'
    }
  },
  {
    id: 'tempo',
    name: 'TEMPO',
    kanji: 'テンポ',
    title: 'THE BEAT',
    style: 'Breaking & Rhythm Boxing',
    origin: 'Bronx Underground',
    power: 4,
    speed: 4,
    defense: 3,
    isNew: true,
    mechanic: 'Start moves on the beat (the floor pulses and you hear a tick). On-beat hits build x1 → x4 damage; an off-beat move or getting hit resets it.',
    quote: '"Stay on beat or get knocked off it."',
    specials: [
      { name: 'Drop the Bass', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Soundwave projectile. Started on the beat it is bigger, faster and dazes' },
      { name: 'Scratch', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible rising spin kick — anti-air' },
      { name: 'Breakdown', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Low windmill sweep. Started on the beat it spins twice' }
    ],
    ultimate: {
      name: 'Encore',
      kanji: 'アンコール',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Cinematic beat-down timed to the rhythm; damage grows with the multiplier'
    },
    fatality: {
      name: 'Mic Drop',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'The beat drops — and so does the opponent'
    }
  },
  {
    id: 'atlas',
    name: 'ATLAS',
    kanji: 'アトラス',
    title: 'THE ARCHITECT',
    style: 'Demolition Brawling',
    origin: 'Megacity Skyline',
    power: 5,
    speed: 2,
    defense: 5,
    isNew: true,
    mechanic: 'Build walls and platforms that change the arena for BOTH players; splat opponents into your walls.',
    quote: '"I don\'t fight in your arena. I build my own."',
    specials: [
      { name: 'Raise Wall', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'A concrete wall erupts in front of ATLAS — launches anyone on that spot, blocks movement and projectiles, and can be stood on' },
      { name: 'Scaffold', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible upward hammer swing that leaves a platform overhead (both fighters can use it; hold DOWN to drop through)' },
      { name: 'Wrecking Swing', cmd: '↓ ↙ ← + K (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + K)', cmdGamepad: 'LB (or ↓ ↙ ← + A/B)', desc: 'Armoured haymaker. Knock a foe into a wall or corner for a WALL SPLAT that shatters the wall' }
    ],
    ultimate: {
      name: 'Ceiling Drop',
      kanji: '天井崩落',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'A slab of ceiling hunts the opponent, then crashes down — dash out of its shadow or stand-block it'
    },
    fatality: {
      name: 'Demolition',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Buries the opponent under a collapsing skyscraper'
    }
  },
  {
    id: 'mighty',
    name: 'M1GHTY',
    kanji: '神威・無敗',
    title: 'DIVINE ANNIHILATOR',
    style: 'One-Hit Extinction',
    origin: 'Astral Realm',
    power: 5,
    speed: 5,
    defense: 5,
    isSecret: true,
    quote: '"Your mortal struggles amuse me. Cease your existence."',
    specials: [
      { name: 'God Palm', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Instant 9999 KO Solar Palm that erases whatever it contacts' },
      { name: 'Apex Shatter', cmd: '→ ↓ ↘ + P (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + P)', cmdGamepad: 'RT (or → ↓ ↘ + X/Y)', desc: 'Invincible 9999 Uppercut that launches foes beyond orbit' },
      { name: 'Void Tremor', cmd: '↓ ↙ ← + P (or SP3)', cmdKeyboard: 'R (or ↓ ↙ ← + P)', cmdGamepad: 'LB (or ↓ ↙ ← + X/Y)', desc: 'Instant 9999 Warp Strike that tears through time and space' }
    ],
    ultimate: {
      name: 'Grand Celestial Ruin',
      kanji: '神威奥義・天界消滅破',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Tears a hole in reality, obliterating the entire stage and opponent instantaneously'
    },
    fatality: {
      name: 'Void Singularity',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Creates a cosmic gravitational singularity that collapses the foe into nothingness'
    }
  },
  {
    id: 'endless_dragon',
    name: 'ENDLESS DRAGON',
    kanji: '太古の終焉竜',
    title: 'ANCIENT VOID EMPEROR',
    style: 'Draconic Cataclysm & Flight',
    origin: 'Primeval Realm',
    power: 5,
    speed: 4,
    defense: 5,
    isBoss: true,
    quote: '"Eons pass as seconds before my roar. Burn in eternity."',
    specials: [
      { name: 'Dragon Claw', cmd: '↓ ↘ → + P (or SP1)', cmdKeyboard: 'Q (or ↓ ↘ → + P)', cmdGamepad: 'RB (or ↓ ↘ → + X/Y)', desc: 'Brutal rending void claw slash with enormous horizontal reach' },
      { name: 'Tail Sweep', cmd: '→ ↓ ↘ + K (or SP2)', cmdKeyboard: 'E (or → ↓ ↘ + K)', cmdGamepad: 'RT (or → ↓ ↘ + A/B)', desc: 'Low seismic knockdown tail whip that sweeps the entire floor' },
      { name: 'Dragon Flight', cmd: 'SP3 (or Aerial)', cmdKeyboard: 'R (or Aerial Jump)', cmdGamepad: 'LB (or Aerial Jump)', desc: 'Soars freely across the arena, raining down draconic meteors' }
    ],
    ultimate: {
      name: 'Primordial Cataclysm',
      kanji: '神話奥義・太古の天変地異',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Channels ancient celestial flame, blanketing the battlefield in cataclysmic fire'
    },
    fatality: {
      name: 'Dragon Maw Devour',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Swallows the staggered mortal whole and exhales cosmic void flames into the sky'
    }
  }
];

export const PLAYABLE_ROSTER = FIGHTER_CATALOG;

export const CAMPAIGN_BOSS_CATALOG = [
  {
    id: 'riot_cop',
    name: 'SGT. MARCUS VANCE',
    kanji: '機動隊 警部',
    title: 'THE CORRUPT ENFORCER',
    style: 'Riot Shield & Shock Baton',
    origin: 'Metro City Police',
    power: 4,
    speed: 3,
    defense: 5,
    isBoss: true,
    quote: '"Order is whatever I beat into you. Stand down!"',
    specials: [
      { name: 'Riot Shield Bash', cmd: 'Charge / SP1', cmdKeyboard: 'Q (or Forward + P)', cmdGamepad: 'RB (or Forward + X)', desc: 'Bulletproof barrier rush that absorbs incoming strikes and knocks foes down' },
      { name: 'Shock Baton Discharge', cmd: 'SP2', cmdKeyboard: 'E (or Uppercut)', cmdGamepad: 'RT (or Uppercut)', desc: 'Electrified overhead stun strike with lingering paralysis sparks' },
      { name: 'Tear Gas Canister', cmd: 'SP3', cmdKeyboard: 'R (or Back + K)', cmdGamepad: 'LB (or Back + A)', desc: 'Rolls a chemical gas bomb across the floor that blocks visibility and chips damage' }
    ],
    ultimate: {
      name: 'Code Red Martial Law',
      kanji: '非常事態戒厳令',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Calls in a police tactical blockade and unleashes continuous stun barrages'
    },
    fatality: {
      name: 'Lethal Brutality',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Pinned under the riot shield while a shock baton discharges maximum voltage'
    }
  },
  {
    id: 'promoter',
    name: 'DANTE CRUZ',
    kanji: '裏格闘 興行主',
    title: 'THE UNDERGROUND PROMOTER',
    style: 'Street Savate & Acrobatic Parkour',
    origin: 'The Cage Arena',
    power: 3,
    speed: 5,
    defense: 3,
    isBoss: true,
    quote: '"Every fighter has a price, kid. Yours is cheap."',
    specials: [
      { name: 'Cash Scatter Blinding', cmd: 'SP1', cmdKeyboard: 'Q (or P)', cmdGamepad: 'RB (or X)', desc: 'Throws fluttering greenback banknotes that distract and blind the opponent' },
      { name: 'Cage Wall Rebound Leap', cmd: 'SP2 (Wall Jump)', cmdKeyboard: 'E (or Jump near Wall)', cmdGamepad: 'RT (or Jump near Wall)', desc: 'Springs off the edge of the arena with an airborne diving dropkick' },
      { name: 'Switchblade Flash', cmd: 'SP3', cmdKeyboard: 'R (or Kick)', cmdGamepad: 'LB (or A)', desc: 'Swift multi-hit slashing rush with high bleed damage' }
    ],
    ultimate: {
      name: 'Blood Money Payout',
      kanji: '裏金の狂宴',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Buries the opponent under a mountain of heavy silver suitcases and explosive fireworks'
    },
    fatality: {
      name: 'Contract Terminated',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Slips a gold coin into the victim\'s mouth before dropping them into the cage pit'
    }
  },
  {
    id: 'boris',
    name: 'BORIS THE BOUNCER',
    kanji: '鉄腕 ボリス',
    title: 'THE IRON DOORMAN',
    style: 'Heavy Sambo & Command Throws',
    origin: 'The Neon Pit',
    power: 5,
    speed: 2,
    defense: 5,
    isBoss: true,
    quote: '"Nobody enters. Nobody leaves alive."',
    specials: [
      { name: 'Crushing Bearhug', cmd: 'Command Grab / SP1', cmdKeyboard: 'Q (or Close + P)', cmdGamepad: 'RB (or Close + X)', desc: 'Armored unblockable grapple that shatters ribs and depletes stamina' },
      { name: 'Overhead Haymaker', cmd: 'SP2', cmdKeyboard: 'E (or Heavy P)', cmdGamepad: 'RT (or Y)', desc: 'Heavy downward clubbing fist with ground-bounce juggle potential' },
      { name: 'Twin Intercept Charge', cmd: 'SP3', cmdKeyboard: 'R (or Forward + K)', cmdGamepad: 'LB (or Forward + A)', desc: 'Bull-rush shoulder tackle that pins foes against arena walls' }
    ],
    ultimate: {
      name: 'Siberian Spinebreaker',
      kanji: '極北の断罪',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Hoists the enemy high overhead and crushes their spine across an iron knee'
    },
    fatality: {
      name: 'VIP Eviction',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Hurls the victim headfirst through the double reinforced steel club doors'
    }
  },
  {
    id: 'viktor',
    name: 'VIKTOR THE BOUNCER',
    kanji: '金剛 ヴィクトル',
    title: 'THE STEEL ENFORCER',
    style: 'Heavy Sambo & Power Slams',
    origin: 'The Neon Pit',
    power: 5,
    speed: 2,
    defense: 5,
    isBoss: true,
    quote: '"My brother breaks your bones. I bury you."',
    specials: [
      { name: 'Seismic Chokeslam', cmd: 'SP1', cmdKeyboard: 'Q (or Close + P)', cmdGamepad: 'RB (or Close + X)', desc: 'Grabs foe by the neck and slams them into the concrete floor' },
      { name: 'Heavy Boot Stomp', cmd: 'SP2', cmdKeyboard: 'E (or Down + K)', cmdGamepad: 'RT (or Down + A)', desc: 'Floor-shattering low sweep and OTG ground strike' },
      { name: 'Twin Crossfire Punch', cmd: 'SP3', cmdKeyboard: 'R (or P)', cmdGamepad: 'LB (or X)', desc: 'Synergized cross-counter punch that sandwiches the target' }
    ],
    ultimate: {
      name: 'Double Impact Slam',
      kanji: '双頭の破滅',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Synchronized dual powerbomb executed alongside Boris for maximum damage'
    },
    fatality: {
      name: 'Last Call',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Dual haymakers that take the victim\'s head clean off their shoulders'
    }
  },
  {
    id: 'matriarch',
    name: 'MADAM CHEN',
    kanji: '夜桜 夫人',
    title: 'THE SYNDICATE MATRIARCH',
    style: 'Wushu Hidden Blade & Mirror Counters',
    origin: 'Chinatown Enclave',
    power: 4,
    speed: 5,
    defense: 4,
    isBoss: true,
    quote: '"You danced right into my web, little moth."',
    specials: [
      { name: 'Mirror Counter Reversal', cmd: 'SP1 (Parry)', cmdKeyboard: 'Q (or Back + P)', cmdGamepad: 'RB (or Back + X)', desc: 'Instant counter-stance that parries strikes into a devastating counter-throw' },
      { name: 'Concealed Fan Blade Rush', cmd: 'SP2', cmdKeyboard: 'E (or Forward + P)', cmdGamepad: 'RT (or Forward + X)', desc: 'Graceful multi-slash slide with poisoned bladed folding fans' },
      { name: 'Shadow Needle Flurry', cmd: 'SP3', cmdKeyboard: 'R (or Down-Back + K)', cmdGamepad: 'LB (or Down-Back + A)', desc: 'Throws fine acupressure needles that paralyze foe limbs' }
    ],
    ultimate: {
      name: 'Thousand Petal Execution',
      kanji: '千花繚乱斬',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Vanishes into a crimson storm of cherry blossom petals, delivering 50 lethal cuts'
    },
    fatality: {
      name: 'Black Lotus Poison',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Strikes the five fatal pressure points, causing internal heart collapse'
    }
  },
  {
    id: 'street_lord',
    name: 'KRUGER',
    kanji: '鋼鉄肺 クルーガー',
    title: 'THE CYBER STREET LORD',
    style: 'Cybernetic Brawling & Overheat Steam',
    origin: 'The Slums',
    power: 5,
    speed: 3,
    defense: 5,
    isBoss: true,
    quote: '"Flesh is weak. My iron engine runs on pure adrenaline!"',
    specials: [
      { name: 'Pneumatic Piston Punch', cmd: 'SP1', cmdKeyboard: 'Q (or Forward + P)', cmdGamepad: 'RB (or Forward + X)', desc: 'Hydraulic punch with massive knockback and armor on startup' },
      { name: 'Steam Vent Purge', cmd: 'SP2', cmdKeyboard: 'E (or Down + P)', cmdGamepad: 'RT (or Down + X)', desc: 'Scalding pressurized steam blast that punishes close-range pressure' },
      { name: 'Cyber Iron Armor', cmd: 'SP3', cmdKeyboard: 'R (or Guard)', cmdGamepad: 'LB (or Guard)', desc: 'Activates hyper-armor phase; only dirty stun or heavy hits can stagger' }
    ],
    ultimate: {
      name: 'Full Throttle Meltdown',
      kanji: '暴走炉心爆破',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Overclocks the cyber-heart engine, discharging a cataclysmic shockwave'
    },
    fatality: {
      name: 'Hydraulic Crush',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Crushes opponent inside a mechanized hydraulic press clamp'
    }
  },
  {
    id: 'urban_legend',
    name: 'THE SHADE',
    kanji: '影法師',
    title: 'THE URBAN LEGEND',
    style: 'Phase Shifting & Glitch Ninjutsu',
    origin: 'The Void Subways',
    power: 4,
    speed: 5,
    defense: 3,
    isBoss: true,
    quote: '"You fight what you cannot touch. I am the city\'s echo."',
    specials: [
      { name: 'Glitch Shadow Warp', cmd: 'SP1', cmdKeyboard: 'Q (or Back-Forward + P)', cmdGamepad: 'RB (or Back-Forward + X)', desc: 'Phases out of reality and teleports instantly behind the opponent' },
      { name: 'Phantom Clones Strike', cmd: 'SP2', cmdKeyboard: 'E (or Down-Forward + K)', cmdGamepad: 'RT (or Down-Forward + A)', desc: 'Sends two holographic afterimages to confuse guard timing' },
      { name: 'Void Knife Sever', cmd: 'SP3', cmdKeyboard: 'R (or P)', cmdGamepad: 'LB (or X)', desc: 'Lightning-fast overhead slash that leaves a trail of distortion' }
    ],
    ultimate: {
      name: 'Infinite Mirage Protocol',
      kanji: '無限幻影結界',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Traps opponent in a fractured dimension of eight attacking shadow clones'
    },
    fatality: {
      name: 'Erased From Memory',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Phases directly through the victim\'s torso, disintegrating them into digital noise'
    }
  },
  {
    id: 'champion',
    name: 'REX GANNON',
    kanji: '頂点 雷電',
    title: 'THE PRIMEVAL APEX CHAMPION',
    style: 'Two-Phase MMA & Bloodfire Elden Beast',
    origin: 'Final Impact Colosseum',
    power: 5,
    speed: 4,
    defense: 5,
    isBoss: true,
    quote: '"I have slain a thousand challengers. You are merely the next."',
    specials: [
      { name: 'Apex Kimura Submission Lock', cmd: 'SP1 (Submission)', cmdKeyboard: 'Q (or Close + P)', cmdGamepad: 'RB (or Close + X)', desc: 'MMA submission lock targeting arms or legs; victim must mash buttons to break free' },
      { name: 'Bloodfire Roar (Phase 2)', cmd: 'SP2', cmdKeyboard: 'E (or Down-Forward + P)', cmdGamepad: 'RT (or Down-Forward + X)', desc: 'Lord of Cinders explosion that summons erupting lava geysers across the stage' },
      { name: 'Colosseum Earthbreaker', cmd: 'SP3', cmdKeyboard: 'R (or Down + K)', cmdGamepad: 'LB (or Down + A)', desc: 'Leaping seismic elbow drop creating full-screen ground shockwaves' }
    ],
    ultimate: {
      name: 'Unbroken Apex Calamity',
      kanji: '不屈なる覇王の劫火',
      cmdKeyboard: 'SPACE (100% Super)',
      cmdGamepad: 'R3 / LB+RB (100% Super)',
      desc: 'Phase II Elden Ring god-strike; blankets the arena in bloodfire cinders and obliterates guards'
    },
    fatality: {
      name: 'Apex Decapitation',
      cmdKeyboard: 'SPACE or I + K (Finish Him)',
      cmdGamepad: 'R3 or Y + B (Finish Him)',
      desc: 'Lifts foe into a flying spinning piledriver that crushes them through the arena stage'
    }
  }
];

export const ALL_FIGHTERS_CATALOG = [...PLAYABLE_ROSTER, ...CAMPAIGN_BOSS_CATALOG];

export function getFighterCatalogEntry(id) {
  if (!id) return null;
  const target = String(id).toLowerCase();
  return ALL_FIGHTERS_CATALOG.find(f => f.id.toLowerCase() === target) || null;
}
