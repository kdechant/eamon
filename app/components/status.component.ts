import {Component} from 'angular2/core';

import {Room} from '../models/room';

//import {GameStateService} from '../services/game-state.service';
import {RoomService} from '../services/room.service';
import {MonsterService} from '../services/monster.service';
import {ArtifactService} from '../services/artifact.service';

@Component({
  selector: 'status',
  template: `
    <p class="room-name">Current Location: {{ _roomService.current_room.name }}</p>
    <p class="room-description">{{ _roomService.current_room.description }}</p>
    <p class="room-exits">Visible Exits:
      <span *ngFor="#exit of _roomService.current_room.exits">{{ exit.direction }} </span>
    </p>
    <p class="room-exits">Who's here:<br />
      <span *ngFor="#monster of _monsterService.visible">{{ monster.name }}<br /></span>
    </p>
    <p class="room-exits">What's around:<br />
      <span *ngFor="#artifact of _artifactService.visible">{{ artifact.name }}<br /></span>
    </p>
    `,
})
export class StatusComponent {
  
  current_room: Room;
      
  /**
   * Constructor. No actual code, but needed for DI
   */  
  constructor(
    private _roomService: RoomService,
    private _monsterService: MonsterService,
    private _artifactService: ArtifactService) {
//    this.current_room = _gs.getCurrentRoom();
  }

}
