import {Component, Input} from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import {PlayerService} from '../services/player.service';

@Component({
  selector: "saved-game-tile",
  templateUrl: "../templates/saved-game-tile.html",
  animations: [
    trigger('messageAnimation', [
      state('visible', style({
        opacity: 0.9,
        display: 'block',
      })),
      state('hidden',   style({
        opacity: 0,
        display: 'none',
      })),
      transition('hidden => visible', animate('175ms ease-in')),
      transition('visible => hidden', animate('175ms ease-out'))
    ]),
    trigger('fadeOutAnimation', [
      transition(':leave', animate(300, style({opacity: 0})))
    ])
  ]
})
export class SavedGameTileComponent {
  @Input() saved_game;

  constructor(private _playerService: PlayerService) {
  }

  public loadSavedGame(saved_game) {
    window.localStorage.setItem('saved_game_slot', saved_game.slot);
    window.location.href = '/adventure/' + saved_game.adventure.slug;
  }

  public deleteSavedGame(saved_game) {
    if (confirm("Are you sure you want to delete this saved game?")) {
      saved_game.message = 'Deleted!';
      saved_game.messageState = 'visible';
      var service = this._playerService;  // variable scope hack for use in setTimeout()
      console.log(service);
      setTimeout(function () {
        console.log(service);
        service.deleteSavedGame(saved_game);
      }, 1250);
    }
  }

}
