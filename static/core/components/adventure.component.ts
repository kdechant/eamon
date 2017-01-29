import {Component, OnInit} from "@angular/core";

import {GameLoaderService} from "../services/game-loader.service";

import {Game} from "../models/game";

@Component({
  selector: "adventure",
  templateUrl: "/static/core/templates/adventure.html",
})
export class AdventureComponent {

  public game_title = "The Angular World of Eamon";
  public game: Game;

  constructor(private _gameLoaderService: GameLoaderService) { }

  public ngOnInit(): void {
    this.game = Game.getInstance();
    this._gameLoaderService.setupGameData().subscribe(
        data => {
          this.game.init(data);
        }
      );
  }

}
