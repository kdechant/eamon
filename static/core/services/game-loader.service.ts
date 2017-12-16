import {Injectable} from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
// FIXME: importing Observable and/or forkJoin by themselves is not working. Have to import all of rxjs. Blah.
import Rx from 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
// import { forkJoin } from "rxjs/observable/forkJoin";
import { CookieService } from 'ngx-cookie';

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

  // http options used for making any writing API calls
  private httpOptions: any;

  constructor(private http: HttpClient, private _cookieService:CookieService) {
    this.uuid = window.localStorage.getItem('eamon_uuid');

    // CSRF token is needed to make API calls work when logged into admin
    let csrf = this._cookieService.get("csrftoken");
    // the Angular 4.3+ HttpHeaders class throws an exception if any of the values are undefined
    if (typeof(csrf) === 'undefined') {
      csrf = '';
    }
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'X-CSRFToken': csrf })
    };

  }

  setupGameData(mock_player: boolean = false): Observable<Object> {

    let game = Game.getInstance();

    // load all the game data objects in parallel
    if (game_id === 'demo1') {
      // load mock data
      let path = "/static/adventures/" + game_id + "/mock-data";
      return Rx.Observable.forkJoin(
        this.http.get(path + "/adventure.json"),
        this.http.get(path + "/rooms.json"),
        this.http.get(path + "/artifacts.json"),
        this.http.get(path + "/effects.json"),
        this.http.get(path + "/monsters.json"),
        this.http.get(path + "/player.json")
      );
    } else {
      let player_id = window.localStorage.getItem('player_id');

      // check if we're using mock or real player data
      let player_path = "/api/players/" + player_id + '.json?uuid=' + this.uuid;
      if (mock_player) {
        player_path = "/static/adventures/demo1/mock-data/player.json";
      }

      // load live data from the back end
      return Rx.Observable.forkJoin(
        this.http.get("/api/adventures/" + game_id),
        this.http.get("/api/adventures/" + game_id + "/rooms"),
        this.http.get("/api/adventures/" + game_id + "/artifacts"),
        this.http.get("/api/adventures/" + game_id + "/effects"),
        this.http.get("/api/adventures/" + game_id + "/monsters"),
        this.http.get("/api/adventures/" + game_id + "/hints"),
        this.http.get(player_path)
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

      let body = JSON.stringify(player);

      return this.http.put("/api/players/" + player_id, body, this.httpOptions);
    }
  }

}
