import {Loadable} from './loadable';

export class RoomExit extends Loadable {
    
  static EXIT: number = -99;

  public direction: string;
  public room_to: number;
  public key_id: number;
  public open: number;
  public message: string;
  
  /**
   * Constructor.
   * @param Object source an object, e.g., from JSON, with properties of a RoomExit object.
   */
  constructor(source) {
    super(source);
  }
  
}

export class Room extends Loadable {
  
  public id: number;
  public name: string;
  public description: string;
  public exits: RoomExit[];
  public times_visited: number = 0;
  
  /**
   * Constructor.
   * @param Object source an object, e.g., from JSON, with properties of a Room object.
   */
  constructor(source) {
    super(source);
  }
  
  getExit(direction: string) {
    for (var i=0; i < this.exits.length; i++) {
      if (this.exits[i].direction == direction) {
        return this.exits[i];
      }
    }
    return null;
  }

}
