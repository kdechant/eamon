import {Room} from "../models/room";

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
    for (let i in room_data) {
      let r = new Room();
      r.init(room_data[i]);
      this.rooms.push(r);
    }
  }

  /**
   * Gets a numbered room.
   * @param {number} room_id
   * @return Room
   */
  getRoomById(room_id: number) {
    for (let i in this.rooms) {
      if (this.rooms[i].id === room_id) {
        return this.rooms[i];
      }
    }
  }

  /**
   * Gets a random room.
   * @return Room
   */
  getRandom() {
    return this.rooms[Math.floor(Math.random() * this.rooms.length)];
  }
}
