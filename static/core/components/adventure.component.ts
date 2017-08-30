import {Component, OnInit} from "@angular/core";

import {GameLoaderService} from "../services/game-loader.service";
import {LoggerService} from "../services/logger.service";

import {Game} from "../models/game";

@Component({
  selector: "adventure",
  templateUrl: "/static/core/templates/adventure.html",
})
export class AdventureComponent {

  public game_title = "The Angular World of Eamon";
  public game: Game;

  constructor(private _gameLoaderService: GameLoaderService, private _loggerService: LoggerService) { }

  public ngOnInit(): void {
    this.game = Game.getInstance();
    this._gameLoaderService.setupGameData().subscribe(
        data => {
          this.game.logger = this._loggerService;
          this.game.init(data);
        }
      );
  }

  public intro_next() {
    this.game.intro_index++;
  }

}
