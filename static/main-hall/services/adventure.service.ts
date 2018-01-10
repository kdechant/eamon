import { Injectable }     from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {Adventure} from "../models/adventure";

/**
 * Adventure service. Loads adventure data from the back end.
 */
@Injectable()
export class AdventureService {

  public adventures: Adventure[];

  public adventure: Adventure;

  constructor(private http: HttpClient) { }

  getList() {
    this.http.get('/api/adventures').subscribe(
      data => this.setupAdventureList(data),
      err => console.error(err)
    );
  }

  getDetail(id: number) {
    this.http.get('/api/adventures/' + id).subscribe(
      data => {
        this.adventure = new Adventure();
        this.adventure.init(data);
      },
      err => console.error(err)
    );
  }

  private setupAdventureList(data: any): void {
    this.adventures = [];
    for (let d of data) {
      d.authors = d.authors.join(' and ');
      let p = new Adventure();
      p.init(d);
      this.adventures.push(p);
    }
  }

}
