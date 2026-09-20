// Final Impact - Constants & Configuration

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const STAGE_WIDTH = 960;
export const GROUND_Y = 300;

export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;

export const FIGHTER_STATE = {
  IDLE: 'IDLE',
  WALK_FWD: 'WALK_FWD',
  WALK_BACK: 'WALK_BACK',
  CROUCH: 'CROUCH',
  JUMP: 'JUMP',
  FALL: 'FALL',
  LAND: 'LAND',
  
  // Normal Attacks
  ATTACK_LIGHT_PUNCH: 'ATTACK_LP',
  ATTACK_HEAVY_PUNCH: 'ATTACK_HP',
  ATTACK_LIGHT_KICK: 'ATTACK_LK',
  ATTACK_HEAVY_KICK: 'ATTACK_HK',
  
  // Crouching Attacks
  CROUCH_LIGHT_PUNCH: 'CROUCH_LP',
  CROUCH_HEAVY_PUNCH: 'CROUCH_HP',
  CROUCH_LIGHT_KICK: 'CROUCH_LK',
  CROUCH_HEAVY_KICK: 'CROUCH_HK', // Sweep
  
  // Jumping Attacks
  JUMP_PUNCH: 'JUMP_PUNCH',
  JUMP_KICK: 'JUMP_KICK',
  
  // Movement Extensions
  DASH_FWD: 'DASH_FWD',
  DASH_BACK: 'DASH_BACK',
  
  // Special Moves
  SPECIAL_1: 'SPECIAL_1',
  SPECIAL_2: 'SPECIAL_2',
  SPECIAL_3: 'SPECIAL_3',
  SUPER: 'SUPER',
  ULTIMATE: 'ULTIMATE',
  
  // Defense / Reaction
  BLOCK: 'BLOCK',
  CROUCH_BLOCK: 'CROUCH_BLOCK',
  HIT: 'HIT',
  HIT_CROUCH: 'HIT_CROUCH',
  HIT_AIR: 'HIT_AIR',
  KNOCKDOWN: 'KNOCKDOWN',
  WAKEUP: 'WAKEUP',
  
  // Endings
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT'
};

export const ATTACK_HEIGHT = {
  HIGH: 'HIGH',       // Blocked standing or crouching
  MID: 'MID',         // Blocked standing only (overhead)
  LOW: 'LOW'          // Blocked crouching only (sweeps)
};

export const HIT_TYPE = {
  LIGHT: 'LIGHT',
  HEAVY: 'HEAVY',
  KNOCKDOWN: 'KNOCKDOWN',
  WALL_BOUNCE: 'WALL_BOUNCE'
};

// Default Player Controls
export const DEFAULT_CONTROLS = {
  P1: {
    UP: 'KeyW',
    DOWN: 'KeyS',
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    LP: 'KeyU',      // Light Punch
    HP: 'KeyI',      // Heavy Punch
    SP1: 'KeyO',     // Special Move 1 / Easy Special
    LK: 'KeyJ',      // Light Kick
    HK: 'KeyK',      // Heavy Kick
    SP2: 'KeyL',     // Special Move 2 / Super
    START: 'Enter'
  },
  P2: {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    LP: 'Numpad4',
    HP: 'Numpad5',
    SP1: 'Numpad6',
    LK: 'Numpad1',
    HK: 'Numpad2',
    SP2: 'Numpad3',
    START: 'NumpadEnter'
  }
};
