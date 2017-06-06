import {Injectable} from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {CookieService} from 'angular2-cookie/core';

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

  // the current user's UUID
  private uuid: string;

  private _cookieService: CookieService;

  constructor(private http: Http) {
      this.uuid = window.localStorage.getItem('eamon_uuid');
      this._cookieService = new CookieService;
  }

  setupGameData(mock_player: boolean = false): Observable<Object> {

    let game = Game.getInstance();

    // load all the game data objects in parallel
    if (game_id === 'demo1') {
      // load mock data
      let path = "/static/adventures/" + game_id + "/mock-data";
      return Observable.forkJoin(
        this.http.get(path + "/adventure.json").map((res: Response) => res.json()),
        this.http.get(path + "/rooms.json").map((res: Response) => res.json()),
        this.http.get(path + "/artifacts.json").map((res: Response) => res.json()),
        this.http.get(path + "/effects.json").map((res: Response) => res.json()),
        this.http.get(path + "/monsters.json").map((res: Response) => res.json()),
        this.http.get(path + "/player.json").map((res: Response) => res.json())
      );
    } else {
      let player_id = window.localStorage.getItem('player_id');

      // check if we're using mock or real player data
      let player_path = "/api/players/" + player_id + '.json?uuid=' + this.uuid;
      if (mock_player) {
        player_path = "/static/adventures/demo1/mock-data/player.json";
      }

      // load live data from the back end
      return Observable.forkJoin(
        this.http.get("/api/adventures/" + game_id).map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/rooms").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/artifacts").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/effects").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/monsters").map((res: Response) => res.json()),
        this.http.get("/api/adventures/" + game_id + "/hints").map((res: Response) => res.json()),
        this.http.get(player_path).map((res: Response) => res.json())
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

      // CSRF token is needed to make API calls work when logged into admin
      let csrf = this._cookieService.get("csrftoken");
      let headers = new Headers({ 'Content-Type': 'application/json', 'X-CSRFToken': csrf });
      let options = new RequestOptions({ headers: headers });

      let body = JSON.stringify(player);

      return this.http.put("/api/players/" + player_id, body, options);
    }
  }

}
