import {Room} from "../models/room";
import {Game} from "../models/game";

/**
 * Class RoomRepository.
 * Storage class for all room data.
 */
export class RoomRepository {

  /**
   * An array of all the Room objects
   */
  rooms: Room[] = [];

  /**
   * The object representing the room the player is currently in
   */
  current_room: Room;

  constructor(room_data) {
    for (let i of room_data) {
      let r = new Room();
      r.init(i);
      this.rooms.push(r);
    }
  }

  /**
   * Gets a numbered room.
   * @param {number} room_id
   * @return Room
   */
  getRoomById(room_id: number) {
    let r = this.rooms.find(x => x.id === room_id);
    return r || null;
  }

  /**
   * Gets a random room.
   * @param (number[]) An array of rooms to exclude.
   * @return Room
   */
  getRandom(exclude: number[] = []) {
    let roll = Game.getInstance().diceRoll(1, this.rooms.length) - 1;
    while (exclude.find(x => x === roll)) {
      roll = Game.getInstance().diceRoll(1, this.rooms.length) - 1;
    }
    return this.rooms[roll];
  }
}
