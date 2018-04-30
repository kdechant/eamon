import {Component, OnInit, DoCheck, ViewChild, ElementRef, Renderer} from "@angular/core";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {GameLoaderService} from "../services/game-loader.service";
import {LoggerService} from "../services/logger.service";
import {SavedGameService} from "../services/saved-game.service";

import {Game} from "../models/game";
import {CommandPromptComponent} from "./command.component";

declare var demo: boolean;  // variable is written in HTML source by Django

@Component({
  selector: "adventure",
  templateUrl: "/static/core/templates/adventure.html",
})
export class AdventureComponent implements OnInit {
  @ViewChild('welcome_modal') welcome_modal: ElementRef;
  @ViewChild('modal_text') modal_text: ElementRef;

  public game_title = "The Angular World of Eamon";
  public game: Game;
  public demo_message_visible: true;

  constructor(
    private renderer: Renderer,
    private modalService: NgbModal,
    private _gameLoaderService: GameLoaderService,
    private _savedGameService: SavedGameService,
    private _loggerService: LoggerService) { }

  public ngOnInit(): void {

    this.game = Game.getInstance();
    this.game.demo = demo;

    this.game.logger = this._loggerService;
    this.game.savedGameService = this._savedGameService;

    this._gameLoaderService.setupGameData(this.game.demo).subscribe(
      data => {
        this.game.init(data);
      }
    );

  }

  public ngDoCheck(): void {
    if (this.game.modal && this.game.modal.visible && this.modal_text) {
      this.renderer.invokeElementMethod(this.modal_text.nativeElement, 'focus');
    }
  }

  /**
   * Handle enter keypress
   */
  public onEnter(value: string) {
    this.game.modal.submit();
  }

  public intro_next() {
    this.game.intro_index++;
  }

}
