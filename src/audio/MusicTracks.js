// Final Impact - Procedural Music Track Definitions
// Pure data consumed by MusicEngine.js. One step = one 16th note, 16 steps per bar.
//
// Drum pattern strings: 'x' = accent hit, 'o' = soft/ghost hit, '.' = rest.
// A pattern may be an array of strings (cycled per bar).
// bass.pattern: semitone offsets from the bar's bass root (null = rest).
// lead.phrases: one array per bar of [step, midiNote, lengthInSteps].
// sections: cycled every `sectionBars` bars, toggling layers so loops evolve.
// script (optional): explicit [bar, step, kind, ...args] events (used by `victory`).

const FIGHT = {
  name: 'fight',
  bpm: 140,
  loop: true,
  bars: 8,
  sectionBars: 8,
  sections: [
    { lead: false, arp: false, pad: true, drums: true, crash: true },
    { lead: true, arp: true, pad: true, drums: true, crash: true },
    { lead: false, arp: true, pad: true, drums: true, crash: true },
    { lead: true, arp: false, pad: true, drums: true, crash: true }
  ],
  progression: [
    { bass: 40, pad: [52, 55, 59, 62] }, // Em7
    { bass: 36, pad: [48, 52, 55, 59] }, // Cmaj7
    { bass: 38, pad: [50, 54, 57, 62] }, // D
    { bass: 35, pad: [47, 51, 54, 59] }  // B
  ],
  drums: {
    kick: ['x.....x...x.....', 'x.....x...x..x.o'],
    snare: ['....x.......x...', '....x..o....x..o'],
    hat: 'xoxoxoxoxoxoxoxo',
    ohat: ['................', '..............x.']
  },
  fill: { every: 8, snare: '....x.......xxxx', kick: 'x.....x.x.x.....' },
  bass: { style: 'drive', len: 1.7, pattern: [0, null, 0, 12, 0, null, 0, 12, 0, null, 0, 12, 0, 12, 7, 0] },
  pad: { style: 'saw', level: 0.8 },
  arp: { style: 'pluck', pattern: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 2, 1], octave: 12 },
  lead: {
    style: 'square',
    phrases: [
      [[0, 76, 3], [3, 74, 3], [6, 71, 2], [8, 74, 4], [12, 71, 2], [14, 69, 2]],
      [[0, 67, 6], [6, 69, 2], [8, 71, 6], [14, 67, 2]],
      [[0, 69, 3], [3, 71, 3], [6, 74, 2], [8, 78, 4], [12, 76, 4]],
      [[0, 75, 6], [6, 71, 2], [8, 78, 8]],
      [[0, 76, 3], [3, 74, 3], [6, 71, 2], [8, 74, 4], [12, 71, 2], [14, 69, 2]],
      [[0, 67, 6], [6, 69, 2], [8, 71, 6], [14, 72, 2]],
      [[0, 74, 3], [3, 76, 3], [6, 78, 2], [8, 79, 4], [12, 78, 4]],
      [[0, 75, 4], [4, 78, 4], [8, 83, 8]]
    ]
  }
};

const MENU = {
  name: 'menu',
  bpm: 84,
  loop: true,
  bars: 8,
  sectionBars: 8,
  sections: [
    { lead: false, arp: false, pad: true, drums: false, crash: false },
    { lead: true, arp: false, pad: true, drums: true, crash: false }
  ],
  progression: [
    { bass: 38, pad: [50, 53, 57, 60] }, // Dm7
    { bass: 34, pad: [46, 50, 53, 57] }, // Bbmaj7
    { bass: 43, pad: [50, 55, 58, 62] }, // Gm
    { bass: 45, pad: [49, 52, 57, 61] }  // A
  ],
  drums: {
    kick: 'x.........x.....',
    snare: '........o.......',
    hat: '..o...o...o...o.'
  },
  bass: { style: 'soft', pattern: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, 7, null], lens: { 0: 7.5, 8: 5.5, 14: 2 } },
  pad: { style: 'warm', level: 1.0 },
  lead: {
    style: 'bell',
    phrases: [
      [[0, 69, 6], [6, 65, 2], [8, 74, 8]],
      [[0, 74, 6], [6, 72, 2], [8, 69, 8]],
      [[0, 70, 6], [6, 69, 2], [8, 67, 6], [14, 65, 2]],
      [[0, 64, 8], [8, 73, 8]],
      [[0, 69, 6], [6, 65, 2], [8, 74, 8]],
      [[0, 74, 6], [6, 77, 2], [8, 76, 8]],
      [[0, 74, 6], [6, 72, 2], [8, 70, 6], [14, 69, 2]],
      [[0, 64, 4], [4, 69, 4], [8, 73, 4], [12, 76, 4]]
    ]
  }
};

const BOSS = {
  name: 'boss',
  bpm: 108,
  level: 0.72,
  loop: true,
  bars: 8,
  sectionBars: 8,
  sections: [
    { lead: false, arp: false, pad: true, drums: true, crash: true, taiko: true },
    { lead: true, arp: false, pad: true, drums: true, crash: true, taiko: true }
  ],
  progression: [
    { bass: 36, pad: [48, 51, 55, 60] }, // Cm
    { bass: 37, pad: [49, 53, 56, 61] }, // Db
    { bass: 44, pad: [48, 51, 56, 60] }, // Ab
    { bass: 43, pad: [47, 50, 55, 59] }  // G
  ],
  drums: {
    kick: ['x..x..x...x..x..', 'x..x..x...x.xx..'],
    snare: '........x.......',
    ride: 'x.o.x.o.x.o.x.o.'
  },
  fill: { every: 8, snare: '........x...xoxx', kick: 'x..x..x.x.x.x.x.' },
  bass: { style: 'heavy', len: 0.9, pattern: [0, null, 0, 0, null, 0, null, 0, 0, null, 0, 0, null, 12, 0, 1] },
  pad: { style: 'choir', level: 1.0 },
  lead: {
    style: 'dark',
    phrases: [
      [[0, 72, 8], [8, 71, 4], [12, 72, 4]],
      [[0, 73, 12], [12, 72, 4]],
      [[0, 68, 8], [8, 72, 8]],
      [[0, 71, 8], [8, 74, 4], [12, 77, 4]]
    ]
  }
};

// Short brass fanfare, plays once then lets the reverb ring out.
function victoryScript() {
  const s = [];
  const chord = (bar, step, notes, len) => s.push([bar, step, 'brass', notes, len]);
  const mel = (bar, step, note, len) => s.push([bar, step, 'lead', note, len]);
  const bass = (bar, step, note, len) => s.push([bar, step, 'bass', note, len]);
  const drum = (bar, step, kind, vel = 1) => s.push([bar, step, kind, vel]);

  // Bar 0: pickup arpeggio into the tonic
  chord(0, 0, [60, 64, 67], 2);
  mel(0, 0, 67, 2); mel(0, 2, 72, 2); mel(0, 4, 76, 2); mel(0, 6, 79, 10);
  bass(0, 0, 36, 2);
  drum(0, 0, 'kick'); drum(0, 0, 'crash', 0.8);
  for (let st = 8; st < 16; st++) drum(0, st, 'timpani', 0.35 + (st - 8) * 0.08);
  chord(0, 6, [60, 64, 67, 72], 10);

  // Bar 1: IV - V
  chord(1, 0, [65, 69, 72, 77], 6); chord(1, 8, [67, 71, 74, 79], 6);
  mel(1, 0, 77, 3); mel(1, 3, 76, 3); mel(1, 6, 74, 2); mel(1, 8, 76, 4); mel(1, 12, 74, 4);
  bass(1, 0, 41, 6); bass(1, 8, 43, 6);
  drum(1, 0, 'kick'); drum(1, 4, 'snare', 0.6); drum(1, 8, 'kick'); drum(1, 12, 'snare', 0.6);

  // Bar 2: bVI - bVII (heroic lift)
  chord(2, 0, [68, 72, 75, 80], 6); chord(2, 8, [70, 74, 77, 82], 6);
  mel(2, 0, 75, 4); mel(2, 4, 72, 4); mel(2, 8, 74, 4); mel(2, 12, 77, 4);
  bass(2, 0, 44, 6); bass(2, 8, 46, 6);
  drum(2, 0, 'kick'); drum(2, 8, 'kick');
  for (let st = 12; st < 16; st++) drum(2, st, 'snare', 0.4 + (st - 12) * 0.15);

  // Bar 3: big tonic hold
  chord(3, 0, [60, 64, 67, 72, 76], 16);
  mel(3, 0, 79, 16);
  bass(3, 0, 36, 16);
  drum(3, 0, 'kick'); drum(3, 0, 'crash', 1); drum(3, 0, 'timpani', 1);
  return s;
}

const VICTORY = {
  name: 'victory',
  bpm: 132,
  loop: false,
  bars: 4,
  tailSeconds: 1.6,
  sectionBars: 4,
  sections: [{ lead: false, arp: false, pad: false, drums: false, crash: false }],
  progression: [{ bass: 36, pad: [60, 64, 67] }],
  drums: {},
  bass: null,
  pad: null,
  lead: { style: 'brass', phrases: [] },
  script: victoryScript()
};

export const MUSIC_TRACKS = {
  menu: MENU,
  fight: FIGHT,
  boss: BOSS,
  victory: VICTORY
};

// Friendly aliases → canonical names (anything else maps to 'fight')
export const MUSIC_ALIASES = {
  title: 'menu',
  main: 'menu',
  select: 'menu',
  battle: 'fight',
  match: 'fight',
  versus: 'fight',
  campaign: 'fight',
  arcade: 'fight',
  bossfight: 'boss',
  final: 'boss',
  win: 'victory',
  results: 'victory'
};

export function resolveTrackName(name) {
  const key = String(name || '').toLowerCase().trim();
  if (MUSIC_TRACKS[key]) return key;
  if (MUSIC_ALIASES[key]) return MUSIC_ALIASES[key];
  return 'fight';
}
