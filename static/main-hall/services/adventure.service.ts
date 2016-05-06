import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import {Adventure} from "../models/adventure";

/**
 * Adventure service. Loads adventure data from the back end.
 */
@Injectable()
export class AdventureService {

  public adventures: Adventure[];

  public adventure: Adventure;

  constructor(private http: Http) { }

  getList() {
    this.http.get('/api/adventures').map((res: Response) => res.json()).subscribe(
      data => this.setupAdventureList(data),
      err => console.error(err)
    );
  }

  getDetail(id: number) {
    this.http.get('/api/adventures/' + id).map((res: Response) => res.json()).subscribe(
      data => {
        this.adventure = new Adventure();
        this.adventure.init(data);
      },
      err => console.error(err)
    );
  }

  private setupAdventureList(data: any): void {
    this.adventures = [];
    for (let i in data) {
      let p = new Adventure();
      p.init(data[i]);
      this.adventures.push(p);
    }
  }

}
