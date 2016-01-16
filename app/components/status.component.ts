import {Component} from 'angular2/core';

import {Room} from '../models/room';

//import {GameStateService} from '../services/game-state.service';
import {RoomService} from '../services/room.service';

@Component({
  selector: 'status',
  template: `
    <div class="status">
      <p>Current Room: {{ _roomService.current_room.name }}</p>
    </div>
    `,
})
export class StatusComponent {
  
  current_room: Room;
      
  /**
   * Constructor. No actual code, but needed for DI
   */  
  constructor(private _roomService: RoomService) {
//    this.current_room = _gs.getCurrentRoom();
  }

}
