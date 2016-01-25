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
  static RX_UNKNOWN: string = 'unknown';
  static RX_FRIEND: string = 'friend';
  static RX_NEUTRAL: string = 'neutral';
  static RX_HOSTILE: string = 'hostile';
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
  charisma: number;
  spell_abilities:Array<Object>;
  weapon_abilities:Array<Object>;

  // game-state properties
  seen: boolean = false;
  reaction: string = Monster.RX_UNKNOWN;
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
        // calculate reaction based on random odds

        this.reaction = Monster.RX_FRIEND;
        var friend_odds = this.friend_odds + ((this.game.monsters.player.charisma - 10) * 2)
        // first roll determines a neutral vs. friendly monster
        var roll1 = this.game.diceRoll(1,100);
        if (roll1 > friend_odds) {
          this.reaction = Monster.RX_NEUTRAL;
          // second roll determines a hostile vs. neutral monster
          var roll2 = this.game.diceRoll(1,100)
          if (roll2 > friend_odds) {
            this.reaction = Monster.RX_HOSTILE;
          }
        }
        break;
    }
  }

}
