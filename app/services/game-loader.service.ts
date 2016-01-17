import {Injectable} from 'angular2/core';
//import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

import {GameData} from '../models/game-data';

import {HistoryService} from '../services/history.service';

import {ADVENTURE} from '../mock-data/adventure';
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
  constructor(private _historyService:HistoryService) {
    this.game_data = new GameData;
  }
  
  setupGameData() {
    
    Promise.all([
      Promise.resolve(ADVENTURE),
      Promise.resolve(ROOMS),
      Promise.resolve(ARTIFACTS),
      Promise.resolve(MONSTERS),
    ]).then(
      result => {
        this.game_data.setupData(result);
        this._historyService.push('', this.game_data.description)
        
        // Place the player in the first room
        this.game_data.rooms.moveTo(1);
        this._historyService.push('', this.game_data.rooms.current_room.description)
        
        // Tick the game clock. This builds the list of monsters/items in the first room.
        this.game_data.tick();
        
      }
    );
    return this.game_data;
  }
  
}
