import {Injectable} from 'angular2/core';
import {HTTP_PROVIDERS, Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

import {Game} from '../models/game';

// game_id is passed in from the back-end and written in index.html
declare var game_id:string;

/**
 * Game Loader service. Loads initial adventure, room, artifact, and monster
 * data from the data source.
 */
@Injectable()
export class GameLoaderService {

  constructor(private http:Http) { }

  setupGameData() {

    var game = Game.getInstance();

    // load all the game data objects in parallel
    Observable.forkJoin(
      this.http.get('/'+game_id+'/mock-data/adventure.json').map((res:Response) => res.json()),
      this.http.get('/'+game_id+'/mock-data/rooms.json').map((res:Response) => res.json()),
      this.http.get('/'+game_id+'/mock-data/artifacts.json').map((res:Response) => res.json()),
      this.http.get('/'+game_id+'/mock-data/monsters.json').map((res:Response) => res.json()),
      this.http.get('/'+game_id+'/mock-data/player.json').map((res:Response) => res.json())
    ).subscribe(
        data => {
          game.init(data);
        }
    )

  }

}
