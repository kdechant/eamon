import {Component, OnInit, ViewChild, ElementRef} from "@angular/core";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {GameLoaderService} from "../services/game-loader.service";
import {LoggerService} from "../services/logger.service";

import {Game} from "../models/game";

declare var demo: boolean;  // variable is written in HTML source by Django

@Component({
  selector: "adventure",
  templateUrl: "/static/core/templates/adventure.html",
})
export class AdventureComponent {
  @ViewChild('welcome_modal') welcome_modal: ElementRef;

  public game_title = "The Angular World of Eamon";
  public game: Game;
  public demo_message_visible: true;

  constructor(
    private modalService: NgbModal,
    private _gameLoaderService: GameLoaderService,
    private _loggerService: LoggerService) { }

  public ngOnInit(): void {

    this.game = Game.getInstance();
    this.game.demo = demo;

    this.game.logger = this._loggerService;

    this._gameLoaderService.setupGameData(this.game.demo).subscribe(
      data => {
        this.game.init(data);
      }
    );

  }

  public intro_next() {
    this.game.intro_index++;
  }

}
