import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

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

  constructor(private http: Http) {
      this.uuid = window.localStorage.getItem('eamon_uuid');
  }

  getList() {
    this.http.get('/api/players.json?uuid=' + this.uuid).map((res: Response) => res.json()).subscribe(
      data => this.setupPlayerList(data),
      err => console.error(err)
    );
  }

  getPlayer(id: number) {
    if (!this.player) {
      this.http.get('/api/players/' + id + '.json?uuid=' + this.uuid).map((res:Response) => res.json()).subscribe(
        data => {
          this.player = new Player();
          this.player.init(data);
          this.player.update();
        }
      );
    }
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

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    player.uuid = this.uuid;
    let body = JSON.stringify(player);

    return this.http.post("http://localhost:8000/api/players", body, options).map((res: Response) => res.json());
  }

  public update() {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let body = JSON.stringify(this.player);

    return this.http.put("http://localhost:8000/api/players/" + this.player.id, body, options).map((res: Response) => res.json());
  }

  public delete(player: Player) {
    return this.http.delete("http://localhost:8000/api/players/" + player.id);
  }

}
