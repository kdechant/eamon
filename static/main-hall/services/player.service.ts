import {Injectable} from "angular2/core";
import {HTTP_PROVIDERS, Http, Response} from "angular2/http";
import {Observable} from "rxjs/Rx";

import {Player} from "../models/player";

/**
 * Game Loader service. Loads initial adventure, room, artifact, and monster
 * data from the data source.
 */
@Injectable()
export class PlayerService {

  public players: Player[];

  public current_player: Player;

  constructor(private http: Http) { }

  getList() {
    this.http.get('/api/players').map((res: Response) => res.json()).subscribe(
      data => this.setupPlayerList(data),
      err => console.error(err)
    );
  }

  private setupPlayerList(data: any): void {
    this.players = [];
    for (let i in data) {
      let p = new Player();
      p.init(data[i]);
      this.players.push(p);
    }
  }

}
