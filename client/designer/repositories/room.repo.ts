import {Room} from "../models/room";
import { parseJSON } from '../../core/utils'

/**
 * Class RoomRepository.
 * Storage class for all room data.
 */
export default class RoomRepository {

  /**
   * An array of all the Room objects
   */
  all: Room[] = [];

  /**
   * The object representing the room the player is currently in
   */
  current_room: Room;

  constructor(room_data: Array<Record<string, number|string>>) {
    for (const i of room_data) {
      const r = new Room();
      if (i.data) {
        i.data = parseJSON(i.data);
      } else {
        // @ts-ignore
        i.data = {};
      }
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

  /**
   * Gets the array index of a numbered room.
   * @param {number} id
   * @return number
   */
  getIndex(id: number|string): number {
    if (typeof id === 'string') id = parseInt(id);
    return this.all.findIndex(x => x.id === id);
  }

}
