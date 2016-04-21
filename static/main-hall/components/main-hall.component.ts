import {Component, OnInit} from "angular2/core";

import {PlayerService} from "../services/player.service";

@Component({
  selector: "main-hall",
  template: `
<div class="container">
  <h1>{{game_title}}</h1>
  <p>You are in the outer chamber of the hall of the Guild of Free Adventurers. Many men and women are guzzling beer and there is loud singing and laughter.</p>
  <p>On the north side of the chamber is a cubbyhole with a desk. Over the desk is a sign which says: <strong>&quot;REGISTER HERE OR ELSE!&quot;</strong></p>
  <p>The guest book on the desk lists the following players:</p>
  <p class="player" *ngFor="#player of _playerService.players">{{player.name}}</p>
</div>
  `,
})
export class MainHallComponent {

  public game_title = "The Angular World of Eamon";

  constructor(private _playerService: PlayerService) { }

  public ngOnInit(): void {
    this._playerService.getList();
  }

}
