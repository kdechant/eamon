import {GameObject} from "../../core/models/game-object";
import {Artifact} from "../../core/models/artifact";

/**
 * Player class. Represents players in the main hall
 */
export class Player extends GameObject {

  gender: string;
  hardiness: number;
  agility: number;
  charisma: number;
  count: number;
  gold: number;
  gold_in_bank: number;
  wpn_axe: number;
  wpn_bow: number;
  wpn_club: number;
  wpn_spear: number;
  wpn_sword: number;
  weapon_abilities: { [key: number]: number; };
  spl_blast: number;
  spl_heal: number;
  spl_power: number;
  spl_speed: number;
  spell_abilities_original: any;
  armor_expertise: number;

  inventory: Artifact[] = [];

  // calculated properties for display on status screen
  best_weapon: Artifact;
  best_armor: Artifact;
  best_shield: Artifact;
  armor_class: number;
  armor_penalty: number;
  armor_factor: number;  // total armor penalty - armor expertise

  /**
   * Loads data from JSON source into the object properties.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    for (let prop in source) {
      if (prop === 'inventory') {
        for (let i in source[prop]) {
          let a = new Artifact();
          a.init(source[prop][i]);
          this.inventory.push(a);
        }
      } else {
        this[prop] = source[prop];
      }
    }
    this.weapon_abilities = {
      1: this.wpn_axe,
      2: this.wpn_bow,
      3: this.wpn_club,
      4: this.wpn_spear,
      5: this.wpn_sword
    };
    // spell_abilities_original is the variable name expected by the API, because that's what the dungeon returns
    this.spell_abilities_original = {
      "power": this.spl_power,
      "heal": this.spl_heal,
      "blast": this.spl_blast,
      "speed": this.spl_speed
    };
  }

  /**
   * Gets the base "to hit" percentage for a monster
   */
  public getBaseToHit(wpn: Artifact): number {
    let to_hit: number;
    // calculate chance to hit based on weapon type, ability, and weapon odds
    to_hit = this.getWeaponAbility(wpn.weapon_type) + wpn.weapon_odds + 2 * this.agility;
    // calculate the effect of the armor penalty
    to_hit -= this.armor_factor;
    return to_hit;
  }

  /**
   * Gets the weapon ability for a numeric weapon type
   */
  public getWeaponAbility(type: number): number {
    switch (type) {
      case 1:
        return this.wpn_axe;
      case 2:
        return this.wpn_bow;
      case 3:
        return this.wpn_club;
      case 4:
        return this.wpn_spear;
      case 5:
        return this.wpn_sword;
    }
  }

  /**
   * Returns the appropriate adjective for the player's gender
   */
  public getGenderLabel(): string {
    if (this.gender === 'm') {
      return "mighty";
    } else {
      return "fair";
    }
  }

  /**
   * Updates player's calculated stats (best weapon, best armor, armor class and penalty)
   */
  public update(): void {

    // calculate best weapon and armor
    this.best_weapon = null;
    this.best_armor = null;
    this.best_shield = null;

    for (let a in this.inventory) {
      if (this.inventory[a].is_weapon) {
        if (this.best_weapon === null || this.inventory[a].maxDamage() > this.best_weapon.maxDamage()) {
          this.best_weapon = this.inventory[a];
        }
      } else if (this.inventory[a].is_wearable) {
        if (this.inventory[a].armor_type === Artifact.ARMOR_TYPE_ARMOR) {
          if (this.best_weapon === null || this.inventory[a].armor_class > this.best_weapon.armor_class) {
            this.best_weapon = this.inventory[a];
          }
        } else {
          // shield is only used if best weapon is 1-handed
          // TODO
        }
      }
    }

    // calculate armor class and penalty
    this.armor_class = 0;
    this.armor_penalty = 0;
    if (this.best_armor) {
      this.armor_class = this.best_armor.armor_class;
      this.armor_penalty = this.best_armor.armor_penalty;
    }
    if (this.best_shield) {
      this.armor_class += this.best_shield.armor_class;
      this.armor_penalty += this.best_shield.armor_penalty;
    }
    this.armor_factor = Math.max(0, this.armor_penalty - this.armor_expertise);
  }

}
