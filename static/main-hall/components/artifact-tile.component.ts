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
  selector: "artifact-tile",
  templateUrl: "../templates/artifact-tile.html",
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
    trigger('sellAnimation', [
      transition(':leave', animate(250, style({opacity: 0})))
    ])
  ]
})
export class ArtifactTileComponent {
  @Input() artifact;
  @Input() action;

  constructor(private _playerService: PlayerService) {
  }

  buy(artifact) {
    this._playerService.player.inventory.push(artifact);
    this._playerService.player.gold -= artifact.value;
    artifact.message = ("Bought!");
    artifact.messageState = "visible";
    setTimeout(function() { artifact.messageState = "hidden" }, 2000);
  }

  sell(artifact) {
    artifact.salePending = true;
    artifact.message = ("Sold!");
    artifact.messageState = "visible";
    var player = this._playerService.player;

    setTimeout(function() {
      let index = player.inventory.indexOf(artifact);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }
      player.gold += Math.floor(artifact.value / 2);
    }, 1250);
  }
}
