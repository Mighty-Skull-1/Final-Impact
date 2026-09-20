// Final Impact - Intelligent Arcade Fighting Game AI Engine
import { FIGHTER_STATE } from './Constants.js';

export class AIController {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty; // 'easy', 'normal', 'hard'
    this.tickCount = 0;
    this.nextDecisionTime = 0;
    this.currentState = {
      up: false,
      down: false,
      left: false,
      right: false,
      fwd: false,
      back: false,
      lp: false,
      hp: false,
      sp1: false,
      lk: false,
      hk: false,
      sp2: false
    };
  }

  setDifficulty(level) {
    this.difficulty = level;
  }

  update(cpuFighter, playerFighter) {
    this.tickCount++;

    // Reset single-frame button taps
    this.currentState.lp = false;
    this.currentState.hp = false;
    this.currentState.sp1 = false;
    this.currentState.lk = false;
    this.currentState.hk = false;
    this.currentState.sp2 = false;

    if (!cpuFighter || !playerFighter || cpuFighter.isDead || playerFighter.isDead) {
      this.neutralize();
      return this.currentState;
    }

    const dist = Math.abs(cpuFighter.x - playerFighter.x);
    const isPlayerAttacking = playerFighter.activeHitbox !== null;
    const isPlayerAirborne = !playerFighter.isGrounded;

    // Difficulty params
    const blockChance = this.difficulty === 'hard' ? 0.85 : (this.difficulty === 'normal' ? 0.6 : 0.3);
    const reactionDelay = this.difficulty === 'hard' ? 4 : (this.difficulty === 'normal' ? 12 : 24);

    // 1. Defense / Auto-Guard Reaction
    if (isPlayerAttacking && dist < 140) {
      if (Math.random() < blockChance) {
        // Guard back
        this.currentState.fwd = false;
        this.currentState.back = true;
        this.currentState.left = cpuFighter.facingRight;
        this.currentState.right = !cpuFighter.facingRight;

        // Crouch block if player is doing low attack (sweep)
        const isLow = playerFighter.currentAttackData?.height === 'LOW';
        this.currentState.down = isLow || Math.random() < 0.5;
        this.currentState.up = false;
        return this.currentState;
      }
    }

    // 2. Anti-Air Reaction
    if (isPlayerAirborne && dist < 120 && cpuFighter.isGrounded) {
      if (Math.random() < (this.difficulty === 'hard' ? 0.8 : 0.45)) {
        // Execute Anti-Air (Shoryuken / Somersault / Crescent Gale)
        this.currentState.sp2 = true;
        return this.currentState;
      }
    }

    // 3. Periodic Decision Making
    if (this.tickCount >= this.nextDecisionTime) {
      this.nextDecisionTime = this.tickCount + reactionDelay + Math.floor(Math.random() * 10);
      this.makeDecision(cpuFighter, playerFighter, dist);
    }

    return this.currentState;
  }

  makeDecision(cpu, player, dist) {
    this.neutralize();

    // 0. Specialized Boss Tactical AI Decision Profiles
    if (cpu.id === 'riot_cop') {
      if (dist > 140) {
        this.walkTowards(cpu, player);
      } else if (dist > 70) {
        if (Math.random() < 0.6) this.currentState.lp = true;
        else this.walkTowards(cpu, player);
      } else {
        if (Math.random() < 0.5) this.currentState.hp = true;
        else this.currentState.lp = true;
      }
      return;
    }

    if (cpu.id === 'promoter') {
      if (dist > 200) {
        if (Math.random() < 0.4) {
          this.currentState.up = true;
          this.walkTowards(cpu, player);
        } else {
          this.walkTowards(cpu, player);
        }
      } else if (dist > 90) {
        if (Math.random() < 0.5) this.currentState.lp = true;
        else this.walkTowards(cpu, player);
      } else {
        this.currentState.lp = true;
      }
      return;
    }

    if (cpu.id === 'boris') {
      if (dist > 120) {
        this.walkTowards(cpu, player);
      } else if (dist > 65) {
        if (Math.random() < 0.5) this.currentState.hp = true;
        else this.walkTowards(cpu, player);
      } else {
        if (Math.random() < 0.6) this.currentState.sp1 = true;
        else this.currentState.hp = true;
      }
      return;
    }

    if (cpu.id === 'viktor') {
      if (dist > 180) {
        this.walkTowards(cpu, player);
      } else if (dist > 90) {
        if (Math.random() < 0.5) {
          this.currentState.down = true;
          this.currentState.hk = true;
        } else {
          this.currentState.hk = true;
        }
      } else {
        if (Math.random() < 0.4) this.walkAway(cpu, player);
        else this.currentState.hk = true;
      }
      return;
    }

    if (cpu.id === 'matriarch') {
      if (dist > 160) {
        this.walkTowards(cpu, player);
      } else if (dist > 80) {
        if (Math.random() < 0.5) this.currentState.lp = true;
        else this.currentState.hp = true;
      } else {
        if (Math.random() < 0.5) this.currentState.hp = true;
        else this.walkAway(cpu, player);
      }
      return;
    }

    if (cpu.id === 'street_lord') {
      if (dist > 120) {
        this.walkTowards(cpu, player);
      } else if (dist > 70) {
        if (Math.random() < 0.5) this.currentState.lp = true;
        else this.currentState.hp = true;
      } else {
        this.currentState.hp = true;
      }
      return;
    }

    if (cpu.id === 'urban_legend') {
      if (dist > 180) {
        this.walkTowards(cpu, player);
      } else if (dist > 90) {
        if (Math.random() < 0.6) this.currentState.lp = true;
        else this.walkTowards(cpu, player);
      } else {
        if (Math.random() < 0.5) this.currentState.lp = true;
        else this.currentState.hp = true;
      }
      return;
    }

    if (cpu.id === 'champion') {
      if (dist > 140) {
        if (Math.random() < 0.45) this.currentState.sp1 = true;
        else this.walkTowards(cpu, player);
      } else if (dist > 70) {
        if (Math.random() < 0.4) this.currentState.sp1 = true;
        else this.currentState.lp = true;
      } else {
        if (Math.random() < 0.5) this.currentState.hp = true;
        else this.currentState.lp = true;
      }
      return;
    }

    // Long Range (> 240px)
    if (dist > 240) {
      const roll = Math.random();
      if (roll < 0.4) {
        // Fire projectile (Hadouken / Sonic Blade / Kunai)
        this.currentState.sp1 = true;
      } else if (roll < 0.75) {
        // Walk forward
        this.walkTowards(cpu, player);
      } else {
        // Jump forward
        this.walkTowards(cpu, player);
        this.currentState.up = true;
      }
      return;
    }

    // Mid Range (110px - 240px) - Footsies & Pokes
    if (dist > 110) {
      const roll = Math.random();
      if (roll < 0.35) {
        // Walk in for attack
        this.walkTowards(cpu, player);
      } else if (roll < 0.55) {
        // Step back (bait)
        this.walkAway(cpu, player);
      } else if (roll < 0.75) {
        // Poke with Heavy Punch or Heavy Kick
        this.currentState.hp = Math.random() < 0.5;
        this.currentState.hk = !this.currentState.hp;
      } else {
        // Low sweep
        this.currentState.down = true;
        this.currentState.hk = true;
      }
      return;
    }

    // Close Range (< 110px) - Combos & Pressure
    const closeRoll = Math.random();
    if (closeRoll < 0.3) {
      // Light punch jab into combo
      this.currentState.lp = true;
    } else if (closeRoll < 0.5) {
      // Crouching low kick / sweep
      this.currentState.down = true;
      this.currentState.lk = true;
    } else if (closeRoll < 0.7) {
      // Heavy strike
      this.currentState.hp = true;
    } else if (closeRoll < 0.88) {
      // Special reversal move
      this.currentState.sp2 = true;
    } else {
      // Retreat / back away
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
  }
}
