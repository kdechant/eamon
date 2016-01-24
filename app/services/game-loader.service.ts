import {Injectable} from 'angular2/core';
import {HTTP_PROVIDERS, Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

import {Game} from '../models/game';

import {HistoryService} from '../services/history.service';

// game_id is passed in from the back-end and written in index.html
declare var game_id:string;

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
  constructor(private _historyService:HistoryService, private http:Http) { }

  setupGameData(game:Game) {

    this.game = game;

    // load all the game data objects in parallel
    Observable.forkJoin(
      this.http.get('/app/'+game_id+'/mock-data/adventure.json').map((res:Response) => res.json()),
      this.http.get('/app/'+game_id+'/mock-data/rooms.json').map((res:Response) => res.json()),
      this.http.get('/app/'+game_id+'/mock-data/artifacts.json').map((res:Response) => res.json()),
      this.http.get('/app/'+game_id+'/mock-data/monsters.json').map((res:Response) => res.json()),
      this.http.get('/app/'+game_id+'/mock-data/player.json').map((res:Response) => res.json())
    ).subscribe(
        data => {
          this.game.init(data);
          this._historyService.push('', this.game.description)

          // Place the player in the first room
          this.game.rooms.moveTo(1);

          // Tick the game clock. This builds the list of monsters/items in the first room.
          this.game.tick();

        },
        err => console.error(err)
    )

    return this.game;
  }

}
