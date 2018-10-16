import {Injectable} from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie';

import {Game} from "../models/game";

// compression library loaded using <script> tag
declare var LZString;

export interface ISavedGameService {
  saveGame(data: any);
  listSavedGames(player_id: any, adventure_id: number);
  loadSavedGame(saved_game: any);
  loadSavedGameById(id: number);
  deleteSavedGame(saved_game: any);
}

/**
 * Saved Game service. Handles saving and restoring saved games.
 */
@Injectable()
export class SavedGameService implements ISavedGameService {

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

  public saveGame(data: any) {
    data.data = LZString.compressToBase64(JSON.stringify(data.data));
    return this.http.post("/api/saves?uuid=" + this.uuid, data, this.httpOptions);
  }

  public listSavedGames(player_id: any, adventure_id: number) {
    return this.http.get("/api/saves.json?player_id=" + player_id + "&adventure_id=" + adventure_id, this.httpOptions);
  }

  public loadSavedGame(saved_game: any) {
    console.log(saved_game);
    return this.http.get("/api/saves/" + saved_game.id + ".json?uuid=" + this.uuid, this.httpOptions);
  }

  public loadSavedGameById(id: number) {
    return this.http.get("/api/saves/" + id + ".json?uuid=" + this.uuid, this.httpOptions);
  }

  /**
   * Deletes a saved game
   * @param {Object} saved_game
   * @returns {Observable<ArrayBuffer>}
   */
  public deleteSavedGame(saved_game: any): Observable<ArrayBuffer> {
    return this.http.delete("/api/saves/" + saved_game.id + '.json?uuid=' + this.uuid, this.httpOptions);
  }

}

/**
 * Dummy service used with automated tests
 */
export class DummySavedGameService implements ISavedGameService {

  public saveGame(data: any) {
  }

  public listSavedGames(player_id: any, adventure_id: number) {
    // this returns a dummy Observable
    return of([]);
  }

  public loadSavedGame(saved_game: any) {
  }

  public loadSavedGameById(id: number) {
  }

  public deleteSavedGame(saved_game: any) {
  }

}
