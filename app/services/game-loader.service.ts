import {Injectable} from 'angular2/core';
//import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

import {Game} from '../models/game';

import {HistoryService} from '../services/history.service';

import {ADVENTURE} from '../mock-data/adventure';
import {PLAYER} from '../mock-data/player';
import {ROOMS} from '../mock-data/rooms';
import {ARTIFACTS} from '../mock-data/artifacts';
import {MONSTERS} from '../mock-data/monsters';

/**
 * Game Loader service. Loads initial adventure, room, artifact, and monster
 * data from the data source.
 */
@Injectable()
export class GameLoaderService {
  /**
   * The main game object
   */
  game: Game;

  /**
   * Constructor. Loads monster data.
   */
  constructor(private _historyService:HistoryService) {
    this.game = new Game(this._historyService);
  }

  setupGameData() {

    Promise.all([
      Promise.resolve(ADVENTURE),
      Promise.resolve(ROOMS),
      Promise.resolve(ARTIFACTS),
      Promise.resolve(MONSTERS),
      Promise.resolve(PLAYER),
    ]).then(
      result => {
        this.game.init(result);
        this._historyService.push('', this.game.description)

        // Place the player in the first room
        this.game.rooms.moveTo(1);

        // Tick the game clock. This builds the list of monsters/items in the first room.
        this.game.tick();

      }
    );
    return this.game;
  }

}
