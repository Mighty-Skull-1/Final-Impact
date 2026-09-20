// Final Impact - Hitbox & Collision Detection Engine

export class Box {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  intersects(other) {
    return (
      this.x < other.x + other.w &&
      this.x + this.w > other.x &&
      this.y < other.y + other.h &&
      this.y + this.h > other.y
    );
  }
}

export class HitboxSystem {
  // Check if two rectangular boxes intersect
  static testOverlap(boxA, boxB) {
    return (
      boxA.x < boxB.x + boxB.w &&
      boxA.x + boxA.w > boxB.x &&
      boxA.y < boxB.y + boxB.h &&
      boxA.y + boxA.h > boxB.y
    );
  }

  // Check collision between attacker's active hitbox and defender's hurtbox
  static checkAttackHit(attacker, defender) {
    if (!attacker.activeHitbox) return null;
    if (defender.isInvincible) return null;

    const hit = attacker.getGlobalHitbox();
    if (!hit) return null;

    const hurtboxes = defender.getGlobalHurtboxes();
    for (const hurt of hurtboxes) {
      if (this.testOverlap(hit, hurt)) {
        return {
          hitX: hit.x + hit.w / 2,
          hitY: hit.y + hit.h / 2,
          attack: attacker.currentAttackData
        };
      }
    }
    return null;
  }

  // Pushbox separation to prevent fighters walking through each other
  static resolvePushboxes(f1, f2, stageLeft = 40, stageRight = 920) {
    const p1 = f1.getPushbox();
    const p2 = f2.getPushbox();

    if (this.testOverlap(p1, p2)) {
      const overlapX = (p1.x + p1.w) - p2.x;
      const overlapAlt = (p2.x + p2.w) - p1.x;
      const minOverlap = Math.min(Math.abs(overlapX), Math.abs(overlapAlt));

      // Separate them equally or push away from wall if against corner
      if (f1.x < f2.x) {
        f1.x -= minOverlap / 2;
        f2.x += minOverlap / 2;
      } else {
        f1.x += minOverlap / 2;
        f2.x -= minOverlap / 2;
      }
    }

    // Keep within stage boundaries
    f1.x = Math.max(stageLeft, Math.min(stageRight - 50, f1.x));
    f2.x = Math.max(stageLeft, Math.min(stageRight - 50, f2.x));
  }
}
