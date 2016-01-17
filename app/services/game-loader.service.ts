import {Injectable} from 'angular2/core';
//import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

import {GameData} from '../models/game-data';

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
   * An array of all the Monster objects
   */
  game_data: GameData;
  
  /**
   * Constructor. Loads monster data.
   */
  constructor() {
    this.game_data = new GameData;
  }
  
  setupGameData() {
    
    Promise.all([
      Promise.resolve(ROOMS),
      Promise.resolve(ARTIFACTS),
      Promise.resolve(MONSTERS),
    ]).then(
      res => {
        this.game_data.setupData(res[0], res[1], res[2]);
        this.game_data.rooms.moveTo(1);
        this.game_data.tick();
      }
    );
    return this.game_data;
  }
  
}
