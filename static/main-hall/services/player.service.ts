import { Injectable }     from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';

import {Player} from "../models/player";

/**
 * Player service. Loads player data from the back end.
 */
@Injectable()
export class PlayerService {

  // the list of players
  public players: Player[];

  // the current player
  public player: Player;

  // the current user's UUID
  private uuid: string;

  // the user's login ID, if logged in with social auth (FB user ID, etc.)
  public login_id: string;

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

  getList() {
    this.http.get('/api/players.json?uuid=' + this.uuid).subscribe(
      data => this.setupPlayerList(data),
      err => console.error(err)
    );
  }

  public getPlayer(id: number) {
    if (!this.player) {
      this.http.get('/api/players/' + id + '.json?uuid=' + this.uuid).subscribe(
        data => {
          this.player = new Player();
          this.player.init(data);
          this.player.update();
          this.log("load");
        }
      );
    }
  }

  public enterHall(player_id: number) {
    window.localStorage.setItem('player_id', String(player_id));
    this.getPlayer(player_id);
    this.log("enter");
  }

  private setupPlayerList(data: any): void {
    this.players = [];
    for (let i in data) {
      let p = new Player();
      p.init(data[i]);
      p.update();
      this.players.push(p);
    }
  }

  public create(player: Player) {

    player.uuid = this.uuid;
    let body = JSON.stringify(player);

    return this.http.post("/api/players", body, this.httpOptions);
  }

  public update() {

    let body = JSON.stringify(this.player);

    return this.http.put("/api/players/" + this.player.id, body, this.httpOptions);
  }

  /**
   * Finds any characters in the current browser's local storage and links them to the social login ID
   */
  public linkLocalChars() {
    let body = JSON.stringify({
      'social_id': this.login_id,
      'uuid': window.localStorage.getItem('eamon_uuid')
    });
    this.http.post("/api/profiles", body, this.httpOptions).subscribe(
      data => {
        let uuid = String(data['uuid']);
        window.localStorage.setItem('eamon_uuid', uuid);
        this.uuid = uuid;
        this.getList();
      }
    )
  }

  /**
   * Deletes the player
   * @param {Player} player
   * @returns {Observable<ArrayBuffer>}
   */
  public delete(player: Player) {
    return this.http.delete("/api/players/" + player.id + '.json?uuid=' + this.uuid, this.httpOptions);
  }

  /**
   * Deletes a saved game
   * @param {Object} saved_game
   * @returns {Observable<ArrayBuffer>}
   */
  public deleteSavedGame(saved_game: any): void {
    this.http.delete("/api/saves/" + saved_game.id + '.json?uuid=' + this.uuid, this.httpOptions).subscribe(
      data => {
        this.player.saved_games = this.player.saved_games.filter(sv => sv.id !== saved_game.id);
        this.log("delete saved game #" + saved_game.id);
      },
      err => {
        console.error(err);
        saved_game.message = 'Error';
      }
    );
  }

  /**
   * Records an entry in the activity log for the current player
   * @param type
   * @returns {Observable<R>}
   */
  public log(type: string = "") {

    // using player ID from local storage to avoid race condition if this.player isn't loaded yet
    let body = JSON.stringify({'player': window.localStorage.getItem('player_id'), 'type': type });

    this.http.post("/api/log", body, this.httpOptions).subscribe(
      data => {
       return true;
      }
    );
  }

}
