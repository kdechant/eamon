import {Injectable} from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';

import {Game} from "../models/game";

export interface ILoggerService {
  log(type: string, value?: number);
}

/**
 * Game Loader service. Loads initial adventure, room, artifact, and monster
 * data from the data source.
 */
@Injectable()
export class LoggerService implements ILoggerService {

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

  /**
   * Records an entry in the activity log for the current player
   * @param type
   * @returns {Observable<R>}
   */
  public log(type: string = "", value: number = null) {

    let game = Game.getInstance();

    // using player ID from local storage to avoid race condition if this.player isn't loaded yet
    let body = JSON.stringify({
      'player': game.demo ? null : window.localStorage.getItem('player_id'),
      'adventure': game.id,
      'type': type,
      'value': value
    });

    this.http.post("/api/log", body, this.httpOptions).subscribe(
      data => {
       return true;
      }
    );
  }

}

/**
 * Dummy logger used with automated tests
 */
export class DummyLoggerService implements ILoggerService {

  public log(type: string = "", value: number = null) {
    // this logger class prints its log entries to the console. It doesn't save anything to the DB.
    console.log("Log: ", type, value);
  }

}
