import {Component, Input} from 'angular2/core';

import {Game} from '../models/game';

@Component({
  selector: 'status',
  template: `
    <div *ngIf="game?.rooms?.current_room">
    <p class="room-name"><strong>{{ game.monsters.player.name }}</strong></p>
    <p class="room-name">Current Location: {{ game.rooms.current_room.name }}</p>
    <p class="room-description">{{ game.rooms.current_room.description }}</p>
    <p class="room-exits">Visible Exits:
      <span *ngFor="#exit of game.rooms.current_room.exits">{{ exit.direction }} </span>
    </p>
    <p class="room-exits">Who's here:<br />
      <span *ngFor="#monster of game.monsters.visible">
        <span class="monster"
          [class.friendly]="monster.reaction == 'friend'"
          [class.hostile]="monster.reaction == 'hostile'"
          >{{ monster.name }} - {{monster.reaction}}</span><br />
      </span>
    </p>
    <p class="room-exits">What's around:<br />
      <span *ngFor="#artifact of game.artifacts.visible">{{ artifact.name }}<br /></span>
    </p>
    <p class="timer">Timer: {{game.timer}}</p>
    <p class="weight">Weight carried: {{game.monsters.player.weight_carried}}</p>

    <p class="weapon" *ngIf="game.monsters.player.weapon">Ready weapon: {{game.monsters.player.weapon.name}}
     ({{game.monsters.player.weapon.dice}}d{{game.monsters.player.weapon.sides}})</p>
    <p class="weapon none" *ngIf="!game.monsters.player.weapon">Ready weapon: none!</p>

    </div>
    `,
})
export class StatusComponent {
  @Input() game;
}
