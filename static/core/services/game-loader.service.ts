import {Injectable} from "angular2/core";
import {HTTP_PROVIDERS, Http, Response} from "angular2/http";
import {Observable} from "rxjs/Rx";

import {Game} from "../models/game";

// game_id is passed in from the back-end and written in index.html
declare var game_id: string;

/**
 * Game Loader service. Loads initial adventure, room, artifact, and monster
 * data from the data source.
 */
@Injectable()
export class GameLoaderService {

  constructor(private http: Http) { }

  setupGameData() {

    let game = Game.getInstance();

    // load all the game data objects in parallel
    if (game_id == 'demo1') {
        // load mock data
        Observable.forkJoin(
          this.http.get("/static/" + game_id + "/mock-data/adventure.json").map((res: Response) => res.json()),
          this.http.get("/static/" + game_id + "/mock-data/rooms.json").map((res: Response) => res.json()),
          this.http.get("/static/" + game_id + "/mock-data/artifacts.json").map((res: Response) => res.json()),
          this.http.get("/static/" + game_id + "/mock-data/effects.json").map((res: Response) => res.json()),
          this.http.get("/static/" + game_id + "/mock-data/monsters.json").map((res: Response) => res.json()),
          this.http.get("/static/" + game_id + "/mock-data/player.json").map((res: Response) => res.json())
        ).subscribe(
            data => {
              game.init(data);
            }
        );
    } else {
        // load live data from the back end
        Observable.forkJoin(
          this.http.get("/api/adventures/" + game_id).map((res: Response) => res.json()),
          this.http.get("/api/adventures/" + game_id + "/rooms").map((res: Response) => res.json()),
          this.http.get("/api/adventures/" + game_id + "/artifacts").map((res: Response) => res.json()),
          this.http.get("/api/adventures/" + game_id + "/effects").map((res: Response) => res.json()),
          this.http.get("/api/adventures/" + game_id + "/monsters").map((res: Response) => res.json()),
          // player is still currently loaded from mock data
          this.http.get("/static/demo1/mock-data/player.json").map((res: Response) => res.json())
        ).subscribe(
            data => {
              game.init(data);
            }
        );
    }
  }

}
