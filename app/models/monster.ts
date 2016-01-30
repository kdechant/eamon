import {Game} from '../models/game';
import {GameObject} from '../models/game-object';
import {Artifact} from '../models/artifact';

/**
 * Monster class. Represents all properties of a single monster
 */
export class Monster extends GameObject {

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
  weapon_id: number;
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
  weight_carried: number = 0;
  weapon: Artifact;
  inventory: Artifact[];

  /**
   * Moves the monster to a specific room.
   */
  moveToRoom(room_id) {
    this.room_id = room_id;

    // when the player moves, set the current room reference
    if (this.id == Monster.PLAYER) {
      var game = Game.getInstance();
      game.rooms.current_room = game.rooms.getRoomById(room_id);
    }
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
        var friend_odds = this.friend_odds + ((Game.getInstance().monsters.player.charisma - 10) * 2)
        // first roll determines a neutral vs. friendly monster
        var roll1 = Game.getInstance().diceRoll(1,100);
        if (roll1 > friend_odds) {
          this.reaction = Monster.RX_NEUTRAL;
          // second roll determines a hostile vs. neutral monster
          var roll2 = Game.getInstance().diceRoll(1,100)
          if (roll2 > friend_odds) {
            this.reaction = Monster.RX_HOSTILE;
          }
        }
        break;
    }
  }

  /**
   * Calculates the maximum weight the monster can carry
   * @return number
   */
  maxWeight() {
    return this.hardiness * 10;
  }

  /**
   * The monster picks up an artifact
   * @param Artifact artifact
   */
  pickUp(artifact) {
    // TODO: call get hook here with artifact ID
    artifact.room_id = null;
    artifact.monster_id = this.id;
    this.updateInventory();
  }

  /**
   * The monster drops an artifact
   * @param Artifact artifact
   */
  drop(artifact) {
    // TODO: invoke drop hook
    artifact.room_id = this.room_id;
    artifact.monster_id = null;

    // if dropping the ready weapon, set weapon to none
    if (artifact.id == this.weapon_id) {
      this.weapon_id = null;
      this.weapon = null;
    }

    this.updateInventory();
  }

  /**
   * Refreshes the inventory of artifacts carried by the monster
   */
  updateInventory() {
    var inv = [];
    var weight = 0;
    for (var i in Game.getInstance().artifacts.all) {
      var a = Game.getInstance().artifacts.all[i];
      if (a.monster_id == this.id) {
        inv.push(a);
        weight += a.weight;
      }
    }
    this.inventory = inv;
    this.weight_carried = weight;
  }

  /**
   * Determines whether a monster is carrying an artifact.
   * @param number artifact_id The ID of an artifact
   * @return boolean
   */
  hasArtifact(artifact_id:number):boolean {
    var has = false;
    for(var i in this.inventory) {
      if (this.inventory[i].id == artifact_id) {
        has = true;
      }
    }
    return has;
  }

  /**
   * Readies a weapon
   */
  ready(weapon:Artifact) {
    this.weapon = weapon;
    this.weapon_id = weapon.id;
    this.weapon_dice = weapon.dice;
    this.weapon_sides = weapon.sides;
  }

  /**
   * Readies the best weapon the monster is carrying
   */
  readyBestWeapon() {
    for (var a in this.inventory) {
      if (this.inventory[a].is_weapon) {
        if (this.weapon === undefined ||
            this.inventory[a].maxDamage() > this.weapon.maxDamage()) {
          this.ready(this.inventory[a]);
        }
      }
    }
  }

}
