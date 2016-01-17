import {Loadable} from './loadable';

/**
 * Monster class. Represents all properties of a single monster
 */
export class Monster extends Loadable {
  
  // constants
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
  
  // data properties
  id: number;
  name: string;
  description: string;
  room_id: number;
  hardiness: number;
  agility: number = 0;
  charisma: number = 0; // for the player only
  friendliness: string; // friendliness algorithm, see constants above
  friend_odds: number = 50; // if random friendliness, chance of being friendly
  courage: number;
  weapon: number = 0;
  attack_odds: number = 50;
  weapon_dice: number;
  weapon_sides: number;
  defense_bonus: number = 0; // makes monster harder to hit
  armor: number;
  
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
