// import axios, {AxiosPromise} from "axios";
import Artifact from "./artifact";
import GameObject from "./game-object";
import Adventure from "./adventure";
// import { getHeaders } from "../utils/api";

export interface SavedGame {
  id: number,
  slot: string,
  description: string,
  adventure: Adventure,
}

/**
 * Player type. Represents players in the main hall
 */
export default interface Player extends GameObject {

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
  weapon_abilities: Record<string, number>;
  spl_blast: number;
  spl_heal: number;
  spl_power: number;
  spl_speed: number;
  spell_abilities_original: Record<string, number>;
  armor_expertise: number;

  inventory: Artifact[];

  // calculated properties for display on status screen
  best_weapon: Artifact | null;
  best_armor: Artifact | null;
  best_shield: Artifact | null;
  icon: string;
  armor_class: number;
  armor_penalty: number;
  armor_factor: number;  // total armor penalty - armor expertise

  uuid: string;
  saved_games: SavedGame[];
}

// TODO: convert the following stuff to redux-friendly functions

//   /**
//    * Updates player's calculated stats (best weapon, best armor, armor class and penalty)
//    */
//   public update(): void {
//
//     // calculate best weapon and armor
//     this.best_weapon = null;
//     this.best_armor = null;
//     this.best_shield = null;
//
//     for (const a in this.inventory) {
//       if (this.inventory[a].type === 2 || this.inventory[a].type === 3) {
//         if (this.best_weapon === null || this.inventory[a].maxDamage() > this.best_weapon.maxDamage()) {
//           this.best_weapon = this.inventory[a];
//         }
//       } else if (this.inventory[a].type === 11) {
//         if (this.inventory[a].armor_type === Artifact.ARMOR_TYPE_ARMOR) {
//           if (this.best_armor === null || this.inventory[a].armor_class > this.best_armor.armor_class) {
//             this.best_armor = this.inventory[a];
//           }
//         } else {
//           // shield is only used if best weapon is 1-handed
//           // TODO
//         }
//       }
//     }
//
//     // set an icon based on the best weapon the player has
//     if (this.best_weapon) {
//       this.icon = this.best_weapon.getIcon();
//     }
//
//     // calculate armor class and penalty
//     this.armor_class = 0;
//     this.armor_penalty = 0;
//     if (this.best_armor) {
//       this.armor_class = this.best_armor.armor_class;
//       this.armor_penalty = this.best_armor.armor_penalty;
//     }
//     // if (this.best_shield) {
//     //   this.armor_class += this.best_shield.armor_class;
//     //   this.armor_penalty += this.best_shield.armor_penalty;
//     // }
//     this.armor_factor = Math.max(0, this.armor_penalty - this.armor_expertise);
//   }
//
//   /**
//    * Saves the player to the database. (Currently this only handles updates.)
//    *
//    * @return {AxiosPromise} the promise from the API call
//    */
//   public save(): AxiosPromise {
//     // Note: Logging is not done here. Main Hall logging (player creation, enter hall, exit hall)
//     // is handled in Django.
//     return axios.put("/api/players/" + this.id, this, {headers: getHeaders()});
//   }
//
// }
