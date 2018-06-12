import { Injectable }     from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {Adventure} from "../models/adventure";

/**
 * Adventure service. Loads adventure data from the back end.
 */
@Injectable()
export class AdventureService {

  /**
   * The master copy of the array of adventures
   */
  public all_adventures: Adventure[];

  /**
   * A child copy of the array of adventures; stores the filtered list
   */
  public adventures: Adventure[];

  /**
   * A tag used for filtering
   * @type {string}
   */
  public tag: string = '';

  public tags: string[];


  public adventure: Adventure;

  constructor(private http: HttpClient) { }

  getList() {
    this.http.get('/api/adventures').subscribe(
      data => this.setupAdventureList(data),
      err => console.error(err)
    );
  }

  filter(tag) {
    if (this.tag === tag) {
      this.tag = '';  // clear tags
    } else {
      this.tag = tag;
    }
    if (tag !== '') {
      this.adventures = this.all_adventures.filter(x => x.tags.indexOf(tag) !== -1);
    } else {
      this.adventures = this.all_adventures;
    }
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
    this.all_adventures = [];
    this.tags = [];
    for (let d of data) {
      d.authors = d.authors.join(' and ');
      let p = new Adventure();
      p.init(d);
      this.all_adventures.push(p);

      for (let tag of p.tags) {
        if (this.tags.indexOf(tag) === -1) {
          this.tags.push(tag);
        }
      }

    }
    this.tags = this.tags.sort();
    this.filter(this.tag);
  }

}
