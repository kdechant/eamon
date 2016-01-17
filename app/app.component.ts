import {Component, OnInit} from 'angular2/core';

import {GameLoaderService} from './services/game-loader.service';

import {GameData} from './models/game-data';
import {Room, RoomExit} from './models/room';

import {HistoryComponent} from './components/history.component';
import {CommandPromptComponent} from './components/command.component';
import {StatusComponent} from './components/status.component';

@Component({
  selector: 'game',
  template:`
<div class="container">
  <h1>{{game_title}}</h1>
  <h2>{{adventure_title}}</h2>
  <div class="row">
    <div class="command col-sm-6">
      <history></history>
      <command-prompt></command-prompt>
    </div>
    <div class="status col-sm-6">
      <status></status>
    </div>
  </div>
</div>
  `,
  directives: [CommandPromptComponent, HistoryComponent, StatusComponent]
})
export class AppComponent {

  public game_title = 'The Angular World of Eamon';
  public adventure_title = 'Demo Adventure';
  public game:GameData;
  
  constructor(private _gameLoaderService: GameLoaderService) { }
  
  ngOnInit() {
    this.game = this._gameLoaderService.setupGameData();
  }
  
}
