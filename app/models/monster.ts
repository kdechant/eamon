import {Loadable} from './loadable';

/**
 * Monster class. Represents all properties of a single monster
 */
export class Monster extends Loadable {

  // constants
  static PLAYER:number = 0;
  static FRIEND_ALWAYS: string = 'friend';
  static FRIEND_NEUTRAL: string = 'neutral';
  static FRIEND_NEVER: string = 'hostile';
  static FRIEND_RANDOM: string = 'random';
  // reaction to player
  static RX_UNKNOWN: number = 0;
  static RX_FRIEND: number = 1;
  static RX_NEUTRAL: number = 2;
  static RX_HOSTILE: number = 3;
  // status
  static STATUS_ALIVE: number = 1;
  static STATUS_DEAD: number = 2;

  // data properties for all monsters
  // don't use default values here because they won't be overwritten when loading the data object.
  id: number;
  name: string;
  description: string;
  room_id: number;
  gender:string;
  hardiness: number;
  agility: number;
  friendliness: string;
  friend_odds: number;
  courage: number;
  gold:number;
  weapon: number;
  attack_odds: number;
  weapon_dice: number;
  weapon_sides: number;
  defense_bonus: number; // makes monster harder to hit
  armor: number;

  // data properties for player only
  charisma: number; // for the player only
  spell_abilities:Array<Object>;
  weapon_abilities:Array<Object>;

  // game-state properties
  seen: boolean = false;
  reaction: number;
  status: number = Monster.STATUS_ALIVE;
  damage: number = 0;

  /**
   * Moves the monster to a specific room.
   */
  moveToRoom(room_id) {
    this.room_id = room_id;
  }

  /**
   * Checks the monster's reaction to the player
   */
  checkReaction() {
    switch (this.friendliness) {
      case Monster.FRIEND_ALWAYS:
        this.reaction = Monster.RX_FRIEND;
        break;
      case Monster.FRIEND_NEUTRAL:
        this.reaction = Monster.RX_NEUTRAL;
        break;
      case Monster.FRIEND_NEVER:
        this.reaction = Monster.RX_HOSTILE;
        break;
      case Monster.FRIEND_RANDOM:
        // TODO: calculate reaction based on random odds
        break;
    }
  }

}
