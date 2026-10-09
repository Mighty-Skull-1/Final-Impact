// Final Impact - Extended roster
// The new fighters borrow the proven move-sets of the core cast but ship with their own
// design, name, tuning (health / speed / jump) so every pick plays and looks different.
import { Kazuki } from './Kazuki.js';
import { Raven } from './Raven.js';
import { Kagura } from './Kagura.js';
import { Fang } from './Fang.js';
import { Zephyr } from './Zephyr.js';
import { Colossus } from './Colossus.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';

function makeRosterFighter(Base, id, name, tune = {}) {
  return class extends Base {
    constructor(options) {
      super(options);
      this.id = id;
      this.name = name;
      this.sprites = spriteGenerator.generateFighterSprites(id);
      const hp = tune.hp || 1;
      this.maxHealth = Math.round(this.maxHealth * hp);
      this.health = this.maxHealth;
      if (tune.walk) this.walkSpeed *= tune.walk;
      if (tune.dash) this.dashSpeed *= tune.dash;
      if (tune.jump) this.jumpForce *= tune.jump;
    }
  };
}

export const ROSTER_CLASSES = {
  cinder: makeRosterFighter(Kagura, 'cinder', 'CINDER', { hp: 0.94, walk: 1.06, dash: 1.05 }),
  glacier: makeRosterFighter(Kazuki, 'glacier', 'GLACIER', { hp: 1.0, walk: 0.97 }),
  oracle: makeRosterFighter(Kagura, 'oracle', 'ORACLE', { hp: 0.9, jump: 1.04 }),
  bandit: makeRosterFighter(Raven, 'bandit', 'BANDIT', { hp: 1.0, walk: 1.05 }),
  confessor: makeRosterFighter(Fang, 'confessor', 'CONFESSOR', { hp: 1.03, walk: 0.98 }),
  valka: makeRosterFighter(Kazuki, 'valka', 'VALKA', { hp: 0.96, walk: 1.08, jump: 1.05 }),
  convict: makeRosterFighter(Colossus, 'convict', 'CONVICT', { hp: 1.12, walk: 0.92, dash: 0.95 }),
  prophet: makeRosterFighter(Zephyr, 'prophet', 'PROPHET', { hp: 0.95, walk: 1.04 }),
  ronin: makeRosterFighter(Kazuki, 'ronin', 'RONIN', { hp: 1.0, dash: 1.08 }),
  vagabond: makeRosterFighter(Raven, 'vagabond', 'VAGABOND', { hp: 1.1, walk: 0.93 }),
  warden: makeRosterFighter(Fang, 'warden', 'WARDEN', { hp: 1.06, walk: 0.96 }),
  wretch: makeRosterFighter(Zephyr, 'wretch', 'WRETCH', { hp: 0.88, walk: 1.12, dash: 1.1, jump: 1.08 })
};

export const ROSTER_QUOTES = {
  cinder: '"Burn bright, burn fast. Then burn out."',
  glacier: '"Cold steel and colder resolve. You are already frozen."',
  oracle: '"The stars wrote your defeat long before you were born."',
  bandit: '"Nothing personal. I just take what I want."',
  confessor: '"Kneel. Your sins end here."',
  valka: '"Sing of my victory in the halls of the fallen!"',
  convict: '"Years in the dark taught me how to hit back."',
  prophet: '"I did not need eyes to see how this would end."',
  ronin: '"A masterless blade still cuts true."',
  vagabond: '"Another battle. Another road. Move aside."',
  warden: '"The wall does not break. You do."',
  wretch: '"Even the weakest can bite when cornered."'
};
