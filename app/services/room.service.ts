import {Injectable} from 'angular2/core';

import {Room} from '../models/room';

import {ROOMS} from '../mock-data/rooms';

/**
 * History service. Provides a container for all the history entries.
 */
@Injectable()
export class RoomService {
  /**
   * An array of all the Room objects
   */
  rooms: Room[] = [];

  /**
   * The object representing the room the player is currently in
   */
  current_room: Room;
  
  /**
   * Constructor. Loads room data and places the player into the first room.
   */
  constructor() {
    
    // load the room data.
    // TODO: Using mock data here. Replace with an API call.
    Promise.resolve(ROOMS).then(room_data => {
      for(var i in room_data) {
        var r = new Room(room_data[i])
        this.rooms.push(r);
        // the user will start in room 1
        if (r.id == 1) {
          this.current_room = r;
        }
      }
    });
    
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
  }
  
}
