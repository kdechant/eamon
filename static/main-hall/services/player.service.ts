import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
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

  constructor(private http: Http, private _cookieService:CookieService) {
      this.uuid = window.localStorage.getItem('eamon_uuid');
  }

  getList() {
    this.http.get('/api/players.json?uuid=' + this.uuid).map((res: Response) => res.json()).subscribe(
      data => this.setupPlayerList(data),
      err => console.error(err)
    );
  }

  public getPlayer(id: number) {
    if (!this.player) {
      this.http.get('/api/players/' + id + '.json?uuid=' + this.uuid).map((res:Response) => res.json()).subscribe(
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

    // CSRF token is needed to make API calls work when logged into admin
    let csrf = this._cookieService.get("csrftoken");

    let headers = new Headers({ 'Content-Type': 'application/json', 'X-CSRFToken': csrf });
    let options = new RequestOptions({ headers: headers });

    player.uuid = this.uuid;
    let body = JSON.stringify(player);

    return this.http.post("/api/players", body, options).map((res: Response) => res.json());
  }

  public update() {

    // CSRF token is needed to make API calls work when logged into admin
    let csrf = this._cookieService.get("csrftoken");
    let headers = new Headers({ 'Content-Type': 'application/json', 'X-CSRFToken': csrf });
    let options = new RequestOptions({ headers: headers });

    let body = JSON.stringify(this.player);

    return this.http.put("/api/players/" + this.player.id, body, options).map((res: Response) => res.json());
  }

  public delete(player: Player) {
    // CSRF token is needed to make API calls work when logged into admin
    let csrf = this._cookieService.get("csrftoken");
    let headers = new Headers({ 'X-CSRFToken': csrf });
    let options = new RequestOptions({ headers: headers });

    return this.http.delete("/api/players/" + player.id + '.json?uuid=' + this.uuid, options);
  }

  /**
   * Records an entry in the activity log for the current player
   * @param type
   * @returns {Observable<R>}
   */
  public log(type: string = "") {

    // CSRF token is needed to make API calls work when logged into admin
    let csrf = this._cookieService.get("csrftoken");

    let headers = new Headers({ 'Content-Type': 'application/json', 'X-CSRFToken': csrf });
    let options = new RequestOptions({ headers: headers });

    // using player ID from local storage to avoid race condition if this.player isn't loaded yet
    let body = JSON.stringify({'player': window.localStorage.getItem('player_id'), 'type': type });

    this.http.post("/api/log", body, options).map((res: Response) => res.json()).subscribe(
      data => {
       return true;
      }
    );
  }

}
