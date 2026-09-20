// Final Impact - Intelligent Arcade Fighting Game AI Engine
import { FIGHTER_STATE } from './Constants.js';

export class AIController {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty; // 'easy', 'normal', 'hard', 'nightmare'
    this.campaignStage = 0; // 1 to 7 for campaign scaling
    this.tickCount = 0;
    this.nextDecisionTime = 0;
    this.currentState = {
      up: false,
      down: false,
      left: false,
      right: false,
      fwd: false,
      back: false,
      dashFwd: false,
      dashBack: false,
      lp: false,
      hp: false,
      lk: false,
      hk: false,
      sp1: false,
      sp2: false,
      sp3: false,
      dirty: false,
      lpJust: false,
      hpJust: false,
      lkJust: false,
      hkJust: false,
      sp1Just: false,
      sp2Just: false,
      sp3Just: false,
      dirtyJust: false
    };
  }

  setDifficulty(level, campaignStage = 0) {
    this.difficulty = level;
    this.campaignStage = campaignStage;
  }

  tapLP() {
    this.currentState.lp = true;
    this.currentState.lpJust = true;
  }

  tapHP() {
    this.currentState.hp = true;
    this.currentState.hpJust = true;
  }

  tapLK() {
    this.currentState.lk = true;
    this.currentState.lkJust = true;
  }

  tapHK() {
    this.currentState.hk = true;
    this.currentState.hkJust = true;
  }

  tapSP1() {
    this.currentState.sp1 = true;
    this.currentState.sp1Just = true;
  }

  tapSP2() {
    this.currentState.sp2 = true;
    this.currentState.sp2Just = true;
  }

  tapSP3() {
    this.currentState.sp3 = true;
    this.currentState.sp3Just = true;
  }

  tapDirty() {
    this.currentState.dirty = true;
    this.currentState.dirtyJust = true;
  }

  update(cpuFighter, playerFighter) {
    this.tickCount++;

    // Reset single-frame button taps
    this.currentState.lp = false;
    this.currentState.hp = false;
    this.currentState.lk = false;
    this.currentState.hk = false;
    this.currentState.sp1 = false;
    this.currentState.sp2 = false;
    this.currentState.sp3 = false;
    this.currentState.dirty = false;

    this.currentState.lpJust = false;
    this.currentState.hpJust = false;
    this.currentState.lkJust = false;
    this.currentState.hkJust = false;
    this.currentState.sp1Just = false;
    this.currentState.sp2Just = false;
    this.currentState.sp3Just = false;
    this.currentState.dirtyJust = false;
    this.currentState.dashFwd = false;
    this.currentState.dashBack = false;

    if (!cpuFighter || !playerFighter || cpuFighter.isDead || playerFighter.isDead) {
      this.neutralize();
      return this.currentState;
    }

    const dist = Math.abs(cpuFighter.x - playerFighter.x);
    const isPlayerAttacking = playerFighter.activeHitbox !== null;
    const isPlayerAirborne = !playerFighter.isGrounded;

    // Difficulty params: scale based on selected difficulty or campaign stage
    let blockChance = 0.55;
    let reactionDelay = 10;
    let antiAirChance = 0.55;
    let aggression = 0.70;

    if (this.campaignStage > 0) {
      // Scaling Campaign Boss Difficulty per Stage (1 to 7)
      const stage = this.campaignStage;
      blockChance = 0.35 + (stage * 0.08); // 43% up to 91%
      reactionDelay = Math.max(2, 18 - (stage * 2.3)); // 16f down to 2f
      antiAirChance = 0.40 + (stage * 0.08);
      aggression = 0.50 + (stage * 0.07);
    } else if (this.difficulty === 'easy') {
      blockChance = 0.30;
      reactionDelay = 22;
      antiAirChance = 0.35;
      aggression = 0.45;
    } else if (this.difficulty === 'hard') {
      blockChance = 0.85;
      reactionDelay = 4;
      antiAirChance = 0.85;
      aggression = 0.90;
    } else if (this.difficulty === 'nightmare') {
      blockChance = 0.92;
      reactionDelay = 2;
      antiAirChance = 0.95;
      aggression = 0.98;
    }

    // 1. Combo Cancel on Hit Reaction
    if (cpuFighter.canCancelOnHit() && !cpuFighter.isDead) {
      if (Math.random() < aggression) {
        if (Math.random() < 0.45) {
          this.tapHP();
        } else if (Math.random() < 0.75) {
          this.tapSP1();
        } else {
          this.tapSP2();
        }
        return this.currentState;
      }
    }

    // 2. Defense / Auto-Guard Reaction
    if (isPlayerAttacking && dist < 140) {
      if (Math.random() < blockChance) {
        this.currentState.fwd = false;
        this.currentState.back = true;
        this.currentState.left = cpuFighter.facingRight;
        this.currentState.right = !cpuFighter.facingRight;

        const isLow = playerFighter.currentAttackData?.height === 'LOW';
        this.currentState.down = isLow || Math.random() < 0.45;
        this.currentState.up = false;
        return this.currentState;
      }
    }

    // 3. Anti-Air Reaction
    if (isPlayerAirborne && dist < 130 && cpuFighter.isGrounded) {
      if (Math.random() < antiAirChance) {
        if (Math.random() < 0.6) {
          this.tapSP2();
        } else {
          this.tapHP();
        }
        return this.currentState;
      }
    }

    // 4. Punish Stunned / Whiffed Opponent
    const isPlayerVulnerable = playerFighter.state === FIGHTER_STATE.HIT ||
                               playerFighter.state === FIGHTER_STATE.HIT_CROUCH ||
                               playerFighter.state === FIGHTER_STATE.BLIND_STUN ||
                               playerFighter.state === FIGHTER_STATE.WINDED;

    if (isPlayerVulnerable && dist < 110 && !cpuFighter.isAttacking()) {
      if (Math.random() < 0.5) {
        this.tapHP();
      } else {
        this.tapLP();
      }
      return this.currentState;
    }

    // 5. Periodic Decision Making
    if (this.tickCount >= this.nextDecisionTime) {
      this.nextDecisionTime = this.tickCount + Math.max(2, Math.floor(reactionDelay + (Math.random() - 0.5) * 6));
      this.makeDecision(cpuFighter, playerFighter, dist, aggression);
    }

    return this.currentState;
  }

  makeDecision(cpu, player, dist, aggression = 0.7) {
    this.neutralize();

    // 0. Specialized Boss Tactical AI Decision Profiles
    if (cpu.id === 'riot_cop') {
      if (dist > 150) {
        this.walkTowards(cpu, player);
      } else if (dist > 75) {
        if (Math.random() < 0.7) this.tapLP();
        else this.walkTowards(cpu, player);
      } else {
        if (Math.random() < 0.6) this.tapHP();
        else this.tapLP();
      }
      return;
    }

    if (cpu.id === 'promoter') {
      if (dist > 210) {
        if (Math.random() < 0.45) {
          this.currentState.up = true;
          this.walkTowards(cpu, player);
        } else {
          this.walkTowards(cpu, player);
        }
      } else if (dist > 95) {
        if (Math.random() < 0.55) this.tapLP();
        else this.walkTowards(cpu, player);
      } else {
        this.tapLP();
      }
      return;
    }

    if (cpu.id === 'boris') {
      if (dist > 130) {
        this.walkTowards(cpu, player);
      } else if (dist > 70) {
        if (Math.random() < 0.5) this.tapHP();
        else this.walkTowards(cpu, player);
      } else {
        // Bear Hug Command Grab!
        if (Math.random() < 0.65) this.tapSP1();
        else this.tapHP();
      }
      return;
    }

    if (cpu.id === 'viktor') {
      if (dist > 190) {
        this.walkTowards(cpu, player);
      } else if (dist > 95) {
        if (Math.random() < 0.5) {
          this.currentState.down = true;
          this.tapHK();
        } else {
          this.tapHK();
        }
      } else {
        if (Math.random() < 0.45) this.walkAway(cpu, player);
        else this.tapHK();
      }
      return;
    }

    if (cpu.id === 'matriarch') {
      if (dist > 170) {
        this.walkTowards(cpu, player);
      } else if (dist > 85) {
        if (Math.random() < 0.5) this.tapLP();
        else this.tapHP();
      } else {
        if (Math.random() < 0.55) this.tapHP();
        else this.walkAway(cpu, player);
      }
      return;
    }

    if (cpu.id === 'street_lord') {
      if (dist > 130) {
        this.walkTowards(cpu, player);
      } else if (dist > 75) {
        if (Math.random() < 0.5) this.tapLP();
        else this.tapHP();
      } else {
        this.tapHP();
      }
      return;
    }

    if (cpu.id === 'urban_legend') {
      if (dist > 180) {
        this.walkTowards(cpu, player);
      } else if (dist > 90) {
        if (Math.random() < 0.7) this.tapLP();
        else this.walkTowards(cpu, player);
      } else {
        if (Math.random() < 0.5) this.tapLP();
        else this.tapHP();
      }
      return;
    }

    if (cpu.id === 'champion') {
      const isPhase2 = cpu.phase === 2;
      if (dist > 150) {
        if (Math.random() < (isPhase2 ? 0.6 : 0.45)) {
          this.tapSP1(); // Shoot Takedown / Primeval Charge
        } else {
          this.walkTowards(cpu, player);
        }
      } else if (dist > 80) {
        if (isPhase2 && Math.random() < 0.5) {
          this.tapSP2(); // Earth Shatter Stomp Shockwave
        } else if (Math.random() < 0.45) {
          this.tapSP1();
        } else {
          this.tapLP();
        }
      } else {
        if (isPhase2 && Math.random() < 0.45) {
          this.tapSP3(); // Blood Frenzy 4-Hit String
        } else if (Math.random() < 0.55) {
          this.tapHP();
        } else {
          this.tapLP();
        }
      }
      return;
    }

    // Standard Fighters (Kazuki, Raven, Kagura)
    // Long Range (> 230px)
    if (dist > 230) {
      const roll = Math.random();
      if (roll < 0.45) {
        this.tapSP1(); // Hadouken / Sonic Blade / Kunai
      } else if (roll < 0.78) {
        this.walkTowards(cpu, player);
      } else {
        this.walkTowards(cpu, player);
        this.currentState.up = true;
      }
      return;
    }

    // Mid Range (105px - 230px) - Footsies, Dashes, Pokes
    if (dist > 105) {
      const roll = Math.random();
      if (roll < 0.35) {
        this.walkTowards(cpu, player);
      } else if (roll < 0.50) {
        this.walkAway(cpu, player);
      } else if (roll < 0.75) {
        if (Math.random() < 0.5) this.tapHP();
        else this.tapHK();
      } else if (roll < 0.90) {
        this.currentState.down = true;
        this.tapHK(); // Low Sweep
      } else {
        this.currentState.dashFwd = true;
      }
      return;
    }

    // Close Range (< 105px) - Pressure & Throw
    const closeRoll = Math.random();
    if (closeRoll < 0.35) {
      this.tapLP(); // Jab into combo
    } else if (closeRoll < 0.55) {
      this.currentState.down = true;
      this.tapLK();
    } else if (closeRoll < 0.75) {
      this.tapHP(); // Heavy blow
    } else if (closeRoll < 0.88) {
      this.tapSP2(); // Dragon Uppercut / Somersault / Crescent
    } else {
      this.walkAway(cpu, player);
    }
  }

  walkTowards(cpu, player) {
    const isToLeft = player.x < cpu.x;
    this.currentState.left = isToLeft;
    this.currentState.right = !isToLeft;
    this.currentState.fwd = true;
    this.currentState.back = false;
  }

  walkAway(cpu, player) {
    const isToLeft = player.x < cpu.x;
    this.currentState.left = !isToLeft;
    this.currentState.right = isToLeft;
    this.currentState.fwd = false;
    this.currentState.back = true;
  }

  neutralize() {
    this.currentState.up = false;
    this.currentState.down = false;
    this.currentState.left = false;
    this.currentState.right = false;
    this.currentState.fwd = false;
    this.currentState.back = false;
    this.currentState.dashFwd = false;
    this.currentState.dashBack = false;
  }
}
