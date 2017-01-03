import {Component, OnInit} from "@angular/core";

import {GameLoaderService} from "../services/game-loader.service";

import {Game} from "../models/game";
import {Room, RoomExit} from "../models/room";

@Component({
  selector: "adventure",
  template: `
<div class="page-border">&nbsp;</div>
<div class="container" *ngIf="game">
  <h1>{{game.name}}</h1>
  <div class="row">
    <div class="command col-sm-7 parchment" *ngIf="!game.selling">
      <history [history]="game?.history"></history>
      <div *ngIf="!game?.modal?.visible">
        <command-prompt [game]="game"></command-prompt>
        <hints [game]="game"></hints>
        <command-list [game]="game"></command-list>
      </div>
      <div class="game-modal" *ngIf="game?.modal?.visible">
        <p>{{game.modal?.text}}</p>
        <p><input type="text" [(ngModel)]="game.modal.value"></p>
        <p><button class="btn btn-success" id="return" (click)="game.modal.submit()">Go</button></p>
      </div>
    </div>
    <div class="command col-sm-7 parchment" *ngIf="game.selling">
      <sell-items [game]="game"></sell-items>
    </div>
    <div class="status col-sm-5">
      <status [game]="game"></status>
    </div>
  </div>
</div>
<div class="page-border">&nbsp;</div>
  `
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
