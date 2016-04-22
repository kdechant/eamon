import {Injectable} from "angular2/core";
import {HTTP_PROVIDERS, Http, Response} from "angular2/http";
import {Observable} from "rxjs/Rx";

import {Player} from "../models/player";

/**
 * Player service. Loads player data from the back end.
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

  getPlayer(id: number) {
    this.http.get('/api/players/' + id).map((res: Response) => res.json()).subscribe(
      data => {
        this.current_player = new Player();
        this.current_player.init(data);
      },
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
