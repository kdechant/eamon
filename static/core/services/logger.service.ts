import {Injectable} from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {CookieService} from 'angular2-cookie/core';

import {Game} from "../models/game";

/**
 * Game Loader service. Loads initial adventure, room, artifact, and monster
 * data from the data source.
 */
@Injectable()
export class LoggerService {

  // the current user's UUID
  private uuid: string;

  private _cookieService: CookieService;

  constructor(private http: Http) {
      this.uuid = window.localStorage.getItem('eamon_uuid');
      this._cookieService = new CookieService;
  }

  /**
   * Records an entry in the activity log for the current player
   * @param type
   * @returns {Observable<R>}
   */
  public log(type: string = "", value: number = null) {

    // CSRF token is needed to make API calls work when logged into admin
    let csrf = this._cookieService.get("csrftoken");

    let headers = new Headers({ 'Content-Type': 'application/json', 'X-CSRFToken': csrf });
    let options = new RequestOptions({ headers: headers });

    let game = Game.getInstance();

    // using player ID from local storage to avoid race condition if this.player isn't loaded yet
    let body = JSON.stringify({
      'player': window.localStorage.getItem('player_id'),
      'adventure': game.id,
      'type': type,
      'value': value
    });

    this.http.post("/api/log", body, options).map((res: Response) => res.json()).subscribe(
      data => {
       return true;
      }
    );
  }

}
