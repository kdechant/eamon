import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

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

        this.current_player.update();
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

  public save(player: Player) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let body = JSON.stringify(player);

    return this.http.post("http://localhost:8000/api/players", body, options).map((res: Response) => res.json());
  }

}
