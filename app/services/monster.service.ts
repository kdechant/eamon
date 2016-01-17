import {Injectable} from 'angular2/core';

import {RoomService} from '../services/room.service';
import {Monster} from '../models/monster';

import {MONSTERS} from '../mock-data/monsters';

/**
 * History service. Provides a container for all the history entries.
 */
@Injectable()
export class MonsterService {
  /**
   * An array of all the Monster objects
   */
  monsters: Monster[] = [];
  
  /**
   * An array of visible Monster objects (i.e., in the current room)
   */
  visible: Monster[] = [];
  
  /**
   * Constructor. Loads monster data.
   */
  constructor(private _roomService:RoomService) {
    
    // load the monster data.
    // TODO: Using mock data here. Replace with an API call.
    Promise.resolve(MONSTERS).then(monster_data => {
      for(var i in monster_data) {
        var a = new Monster(monster_data[i])
        this.monsters.push(a);
      }
    });
    
  }
       
  /**
   * Gets a numbered monster.
   * @param number id
   * @return Room
   */
  get(id) {
    for(var i in this.monsters) {
      if (this.monsters[i].id == id) {
        return this.monsters[i];
      }
    }
  }
     
  /**
   * Updates the list of monsters in the current room
   * @return Monster[]
   */
  updateVisible() {
    var monsters:Monster[] = [];
    for(var i in this.monsters) {
      if (this.monsters[i].room_id == this._roomService.current_room.id) {
        monsters.push(this.monsters[i]);
      }
    }
    this.visible = monsters;
  }
  
}
