import {Loadable} from './loadable';
import {Game} from './game';

export class RoomExit extends Loadable {

  static EXIT: number = -99;

  public direction: string;
  public room_to: number;
  public key_id: number;
  public open: number;
  public message: string;

  /**
   * Check for locked exits.
   * @returns boolean
   *   True if the exit requires a key, and the player doesn't have it.
   *   False if no key is required, or if the player has the key.
   */
  public isLocked() {
    return (this.key_id && !Game.getInstance().monsters.player.hasArtifact(this.key_id))
  }

}

export class Room extends Loadable {

  public id: number;
  public name: string;
  public description: string;
  public exits: RoomExit[] = [];
  public seen: boolean = false;

  /**
   * Loads data from JSON source into the object properties.
   * Override of parent method to handle RoomExit objects.
   * @param Object source an object, e.g., from JSON.
   */
  init(source) {
    for (var prop in source) {
      if (prop == 'exits') {
        for (var i in source[prop]) {
          var ex = new RoomExit();
          ex.init(source[prop][i]);
          this.exits.push(ex);
        }
      } else {
        this[prop] = source[prop];
      }
    }
  }

  /**
   * Gets the exit from the room in a given direction
   */
  getExit(direction: string) {
    for (var i in this.exits) {
      if (this.exits[i].direction == direction) {
        return this.exits[i];
      }
    }
    return null;
  }

}
