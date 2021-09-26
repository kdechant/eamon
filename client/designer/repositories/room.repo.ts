import {Room} from "../models/room";
import {BaseRepository} from "./base.repo";
import {roomSource} from "../types";

/**
 * Class RoomRepository.
 * Storage class for all room data.
 */
export default class RoomRepository extends BaseRepository {

  /**
   * An array of all the Room objects
   */
  all: Room[] = [];

  /**
   * The object representing the room the player is currently in
   */
  current_room: Room;

  constructor(room_data: Array<roomSource>) {
    super();
    for (const i of room_data) {
      const r = new Room();
      r.init(i);
      this.all.push(r);
    }
  }

  /**
   * Gets a numbered room.
   * @param {number} id
   * @return Room
   */
  get(id: number|string): Room {
    if (typeof id === 'string') id = parseInt(id);
    const r = this.all.find(x => x.id === id);
    return r || null;
  }

}
