import {Room} from '../models/room';

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
    for(var i in room_data) {
      var r = new Room();
      r.init(room_data[i]);
      this.rooms.push(r);
    }
  }

  /**
   * Gets a numbered room.
   * @param number room_id
   * @return Room
   */
  getRoomById(room_id) {
    for(var i in this.rooms) {
      if (this.rooms[i].id == room_id) {
        return this.rooms[i];
      }
    }
  }

  /**
   * Moves the player into a given room
   */
  moveTo(room_id:number) {
    this.current_room = this.getRoomById(room_id);

    this.current_room.times_visited++;

  }

}