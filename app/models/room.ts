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

  getExit(direction: string) {
    for (var i=0; i < this.exits.length; i++) {
      if (this.exits[i].direction == direction) {
        return this.exits[i];
      }
    }
    return null;
  }

}
