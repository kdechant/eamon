import Artifact, {ARMOR_TYPES, getIcon, isWeapon, maxDamage} from "./artifact";
import GameObject from "./game-object";
import Adventure from "./adventure";

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
  armor_expertise: number;

  inventory: Artifact[];

  // calculated properties for display on status screen
  best_weapon: Artifact | null;
  best_armor: Artifact | null;
  icon: string;
  armor_class: number;
  armor_penalty: number;
  armor_factor: number;  // total armor penalty - armor expertise

  uuid: string;
  saved_games: SavedGame[];

  error: string | null;
}

export function updateCachedInfo(player) {
  // calculate best weapon and armor
  player.best_weapon = null;
  player.best_armor = null;

  for (const a in player.inventory) {
    if (isWeapon(player.inventory[a])) {
      if (player.best_weapon === null || maxDamage(player.inventory[a]) > maxDamage(player.best_weapon)) {
        player.best_weapon = player.inventory[a];
      }
    } else if (player.inventory[a].type === 11) {
      if (player.inventory[a].armor_type === ARMOR_TYPES.ARMOR) {
        if (player.best_armor === null || player.inventory[a].armor_class > player.best_armor.armor_class) {
          player.best_armor = player.inventory[a];
        }
      }
    }
  }

  // set an icon based on the best weapon the player has
  player.icon = 'helmet';
  if (player.best_weapon) {
    player.icon = getIcon(player.best_weapon);
  }

  // calculate armor class and penalty
  player.armor_class = 0;
  player.armor_penalty = 0;
  if (player.best_armor) {
    player.armor_class = player.best_armor.armor_class;
    player.armor_penalty = player.best_armor.armor_penalty;
  }
  player.armor_factor = Math.max(0, player.armor_penalty - player.armor_expertise);
  return player;
}
