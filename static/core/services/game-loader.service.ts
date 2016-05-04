import {Injectable} from "angular2/core";
import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from "angular2/http";
import {Observable} from "rxjs/Rx";

import {Game} from "../models/game";
import {Monster} from "../models/monster";

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
    if (game_id === 'demo1') {
      // load mock data
      let path = "/static/adventures/" + game_id + "/mock-data";
      Observable.forkJoin(
        this.http.get(path + "/adventure.json").map((res: Response) => res.json()),
        this.http.get(path + "/rooms.json").map((res: Response) => res.json()),
        this.http.get(path + "/artifacts.json").map((res: Response) => res.json()),
        this.http.get(path + "/effects.json").map((res: Response) => res.json()),
        this.http.get(path + "/monsters.json").map((res: Response) => res.json()),
        this.http.get(path + "/player.json").map((res: Response) => res.json())
      ).subscribe(
        data => {
          game.init(data);
        }
      );
    } else {
      let player_id = window.localStorage.getItem('player_id');

      // load live data from the back end
      Observable.forkJoin(
        this.http.get("/api/adventures/" + game_id).map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/rooms").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/artifacts").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/effects").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/monsters").map((res: Response) => res.json()),
        this.http.get("/api/players/" + player_id).map((res: Response) => res.json())
      ).subscribe(
        data => {
          game.init(data);
        }
      );
    }
  }

  public savePlayer(player: Monster) {
    if (game_id === 'demo1') {
      // can't save the demo player.
      console.log("The demo player is read-only.")
      return;
    } else {
      let player_id = window.localStorage.getItem('player_id');

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      let body = JSON.stringify(player);

      return this.http.put("/api/players/" + player_id, body, options);
    }
  }

}
