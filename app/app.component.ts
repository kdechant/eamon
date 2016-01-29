import {Component, OnInit} from 'angular2/core';

import {GameLoaderService} from './services/game-loader.service';

import {Game} from './models/game';
import {Room, RoomExit} from './models/room';

import {HistoryComponent} from './components/history.component';
import {CommandPromptComponent} from './components/command.component';
import {StatusComponent} from './components/status.component';

@Component({
  selector: 'game',
  template:`
<div class="container" *ngIf="game">
  <h1>{{game_title}}</h1>
  <h2>{{game.name}}</h2>
  <div class="row">
    <div class="command col-sm-6">
      <history [history]="game?.history"></history>
      <command-prompt [game]="game"></command-prompt>
    </div>
    <div class="status col-sm-6">
      <status [game]="game"></status>
    </div>
  </div>
</div>
  `,
  directives: [CommandPromptComponent, HistoryComponent, StatusComponent]
})
export class AppComponent {

  public game_title = 'The Angular World of Eamon';
  public game:Game;

  constructor(private _gameLoaderService: GameLoaderService) { }

  ngOnInit() {
    this.game = Game.getInstance();
    this._gameLoaderService.setupGameData();
  }

}
