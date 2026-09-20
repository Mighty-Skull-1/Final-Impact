// Final Impact - The Underground Promoter (Dante "Gold-Tooth" Cruz)
import { Fighter } from '../Fighter.js';
import { FIGHTER_STATE, ATTACK_HEIGHT, HIT_TYPE } from '../../engine/Constants.js';
import { Box } from '../../engine/Hitbox.js';
import { soundFX } from '../../audio/SoundFX.js';

export class Promoter extends Fighter {
  constructor(options) {
    super({
      ...options,
      id: 'promoter',
      name: 'DANTE CRUZ'
    });
    this.walkSpeed = 4.2;
    this.dashSpeed = 9.0;
    this.hasSummonedWave1 = false;
    this.hasSummonedWave2 = false;
    this.cashBills = [];
    this.isWallLeaping = false;
  }

  throwCashScatter() {
    soundFX.playPocketSand();
    // Spawn 20 fluttering green and gold banknotes
    for (let i = 0; i < 20; i++) {
      this.cashBills.push({
        x: this.x + 35 + (Math.random() - 0.5) * 25,
        y: this.y - 60 + (Math.random() - 0.5) * 20,
        vx: (this.facingRight ? 1 : -1) * (3.5 + Math.random() * 4.5),
        vy: -1.5 + (Math.random() - 0.5) * 3,
        rot: Math.random() * Math.PI,
        alpha: 1.0
      });
    }
  }

  executeWallParkourLeap(isLeftWall) {
    this.isWallLeaping = true;
    this.isGrounded = false;
    soundFX.playWhoosh('heavy');
    this.vy = -11.0;
    this.vx = isLeftWall ? 7.5 : -7.5;
    this.changeState(FIGHTER_STATE.JUMP_KICK);
  }

  update(opponent, stageWidth = 960) {
    super.update(opponent, stageWidth);

    // Update floating cash particles
    for (let i = this.cashBills.length - 1; i >= 0; i--) {
      const bill = this.cashBills[i];
      bill.x += bill.vx;
      bill.y += bill.vy;
      bill.vy += 0.15; // float gravity
      bill.rot += 0.08;
      bill.alpha -= 0.02;
      if (bill.alpha <= 0 || bill.y > 310) {
        this.cashBills.splice(i, 1);
      }
    }

    // Wall parkour leap trigger when cornered
    if ((this.x <= 45 || this.x >= stageWidth - 125) && this.isGrounded && Math.random() < 0.04) {
      this.executeWallParkourLeap(this.x <= 45);
    }

    // Health-gated Cash Scatter & Distraction
    if (this.health <= this.maxHealth * 0.75 && !this.hasSummonedWave1) {
      this.hasSummonedWave1 = true;
      this.throwCashScatter();
    }
    if (this.health <= this.maxHealth * 0.35 && !this.hasSummonedWave2) {
      this.hasSummonedWave2 = true;
      this.throwCashScatter();
    }
  }

  updateState(opponent) {
    this.animTimer++;
    const frames = this.sprites[this.state] || this.sprites.IDLE;

    switch (this.state) {
      case FIGHTER_STATE.ATTACK_LIGHT_PUNCH:
        // Cane Jab
        if (this.stateTimer <= 4) this.animFrame = 0;
        else if (this.stateTimer <= 8) {
          this.animFrame = 1;
          this.activeHitbox = new Box(38, 24, 62, 18);
          this.currentAttackData = {
            damage: 42,
            hitStun: 15,
            blockStun: 10,
            pushback: 4,
            height: ATTACK_HEIGHT.HIGH,
            hitType: HIT_TYPE.LIGHT
          };
        } else if (this.stateTimer <= 13) {
          this.animFrame = 2;
          this.activeHitbox = null;
        } else {
          this.changeState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.JUMP_KICK:
        // Diving Bladed Heel Kick
        this.animFrame = 1;
        this.activeHitbox = new Box(32, 40, 65, 30);
        this.currentAttackData = {
          damage: 85,
          hitStun: 22,
          blockStun: 16,
          pushback: 6,
          height: ATTACK_HEIGHT.MID,
          hitType: HIT_TYPE.KNOCKDOWN
        };
        break;

      default:
        super.updateState(opponent);
        break;
    }
  }

  render(ctx) {
    super.render(ctx);

    // Render fluttering cash banknotes
    if (this.cashBills.length > 0) {
      ctx.save();
      for (const bill of this.cashBills) {
        ctx.globalAlpha = Math.max(0, bill.alpha);
        ctx.translate(bill.x, bill.y);
        ctx.rotate(bill.rot);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-6, -3, 12, 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.rotate(-bill.rot);
        ctx.translate(-bill.x, -bill.y);
      }
      ctx.restore();
    }
  }
}
