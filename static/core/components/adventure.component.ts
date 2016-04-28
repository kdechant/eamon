import {Component, OnInit} from "angular2/core";

import {GameLoaderService} from "../services/game-loader.service";

import {Game} from "../models/game";
import {Room, RoomExit} from "../models/room";

import {HistoryComponent} from "../components/history.component";
import {CommandPromptComponent} from "../components/command.component";
import {StatusComponent} from "../components/status.component";
import {SellItemsComponent} from "../components/sell-items.component";

@Component({
  selector: "adventure",
  template: `
<div class="container" *ngIf="game">
  <h1>{{game_title}}</h1>
  <h2>{{game.name}}</h2>
  <div class="row">
    <div class="command col-sm-6" *ngIf="!game.selling">
      <history [history]="game?.history"></history>
      <command-prompt [game]="game"></command-prompt>
    </div>
    <div class="command col-sm-6" *ngIf="game.selling">
      <sell-items [game]="game"></sell-items>
    </div>
    <div class="status col-sm-6">
      <status [game]="game"></status>
    </div>
  </div>
</div>
  `,
  directives: [CommandPromptComponent, HistoryComponent, StatusComponent, SellItemsComponent]
})
export class AdventureComponent {

  public game_title = "The Angular World of Eamon";
  public game: Game;

  constructor(private _gameLoaderService: GameLoaderService) { }

  public ngOnInit(): void {
    this.game = Game.getInstance();
    this._gameLoaderService.setupGameData();
  }

}
