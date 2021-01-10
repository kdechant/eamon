import axios, {AxiosPromise} from "axios";
import Artifact from "./artifact";
import GameObject from "./game-object";
import { getHeaders } from "../utils/api";

/**
 * Player class. Represents players in the main hall
 */
export default class Player extends GameObject {

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
  best_weapon: Artifact | null;
  best_armor: Artifact | null;
  best_shield: Artifact | null;
  icon = 'helmet2';
  armor_class: number;
  armor_penalty: number;
  armor_factor: number;  // total armor penalty - armor expertise

  uuid: string;
  saved_games: any = [];

  /**
   * Loads data from JSON source into the object properties.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    for (const prop in source) {
      if (prop === 'inventory') {
        for (const i in source[prop]) {
          const a = new Artifact();
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
      "blast": this.spl_blast,
      "heal": this.spl_heal,
      "power": this.spl_power,
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
      default:
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

    for (const a in this.inventory) {
      if (this.inventory[a].type === 2 || this.inventory[a].type === 3) {
        if (this.best_weapon === null || this.inventory[a].maxDamage() > this.best_weapon.maxDamage()) {
          this.best_weapon = this.inventory[a];
        }
      } else if (this.inventory[a].type === 11) {
        if (this.inventory[a].armor_type === Artifact.ARMOR_TYPE_ARMOR) {
          if (this.best_armor === null || this.inventory[a].armor_class > this.best_armor.armor_class) {
            this.best_armor = this.inventory[a];
          }
        } else {
          // shield is only used if best weapon is 1-handed
          // TODO
        }
      }
    }

    // set an icon based on the best weapon the player has
    if (this.best_weapon) {
      this.icon = this.best_weapon.getIcon();
    }

    // calculate armor class and penalty
    this.armor_class = 0;
    this.armor_penalty = 0;
    if (this.best_armor) {
      this.armor_class = this.best_armor.armor_class;
      this.armor_penalty = this.best_armor.armor_penalty;
    }
    // if (this.best_shield) {
    //   this.armor_class += this.best_shield.armor_class;
    //   this.armor_penalty += this.best_shield.armor_penalty;
    // }
    this.armor_factor = Math.max(0, this.armor_penalty - this.armor_expertise);
  }

  /**
   * Saves the player to the database. (Currently this only handles updates.)
   *
   * @return {AxiosPromise} the promise from the API call
   */
  public save(): AxiosPromise {
    // Note: Logging is not done here. Main Hall logging (player creation, enter hall, exit hall)
    // is handled in Django.
    return axios.put("/api/players/" + this.id, this, {headers: getHeaders()});
  }

}
