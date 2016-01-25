import {Loadable} from './loadable';

export class RoomExit extends Loadable {

  static EXIT: number = -99;

  public direction: string;
  public room_to: number;
  public key_id: number;
  public open: number;
  public message: string;

}

export class Room extends Loadable {

  public id: number;
  public name: string;
  public description: string;
  public exits: RoomExit[];
  public times_visited: number = 0;

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
