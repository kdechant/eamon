'use strict'

export class RoomExit {
    
  static MAIN_HALL: number = -99;

  constructor(
    public direction?: string,
    public room_id?: number,
    public key_id?: number,
    public open?: number,
    public message?: string
  ) { }
  
}

export class Room {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string,
    public exits?: RoomExit[],
    public seen?: boolean
  ) { }

  getExit(direction: string) {
    for (var i=0; i < this.exits.length; i++) {
      if (this.exits[i].direction == direction) {
        return this.exits[i];
      }
    }
    return null;
  }

}
