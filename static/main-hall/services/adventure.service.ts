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

  /**
   * Author name, used for filtering
   * @type {string}
   */
  public author: string = '';

  public authors: string[];

  /**
   * The current sort order, e.g., 'alpha', 'times_played', 'newest', 'original_number', etc.
   * @type {string}
   */
  public sort_order: string = 'name';

  /**
   * The available sort options and their labels
   * @type {string}
   */
  public sort_options: string[] = [
    'alphabetical',
    'most popular',
    'newest',
    'original adventure number',
  ];

  public adventure: Adventure;

  constructor(private http: HttpClient) { }

  getList() {
    this.http.get('/api/adventures').subscribe(
      data => this.setupAdventureList(data),
      err => console.error(err)
    );
  }

  filterByTag(tag) {
    if (this.tag === tag) {
      this.tag = '';  // clear tags
    } else {
      this.tag = tag;
    }
    this.filterAndSort();
  }

  filterByAuthor(author) {
    if (this.author === author) {
      this.author = '';  // clear
    } else {
      this.author = author;
    }
    this.filterAndSort();
  }

  sort(arg) {
    this.sort_order = arg;
    this.filterAndSort();
  }

  /**
   * Filters and sorts the array of adventure objects. This determines what the page actually shows.
   */
  private filterAndSort() {

    this.adventures = this.all_adventures;

    // filter by tag
    if (this.tag.toString() === 'featured') {
      this.adventures = this.adventures.filter(x => x.featured_month);
    } else if (this.tag !== '') {
      this.adventures = this.adventures.filter(x => x.tags.indexOf(this.tag) !== -1);
    }

    // filter by author
    if (this.author !== '') {
      this.adventures = this.adventures.filter(x => x.authors.indexOf(this.author) !== -1);
    }

    // sort
    let sort_option = this.sort_order;
    let sort_field = 'name';
    let dir = 'asc';
    if (this.tag === 'featured') {
      // featured filter uses a custom default sort order
      sort_option = 'featured_month';
    }
    // translate the chosen option to a field and direction
    switch (sort_option) {
      case 'alphabetical':
        sort_field = 'name';
        dir = 'asc';
        break;
      case 'featured_month':
        sort_field = 'featured_month';
        dir = 'desc';
        break;
      case 'newest':
        sort_field = 'date_published';
        dir = 'desc';
        break;
      case 'most popular':
        sort_field = 'times_played';
        dir = 'desc';
        break;
      case 'original adventure number':
        sort_field = 'id';
        dir = 'asc';
        break;
    }
    // if (sort) {
    this.adventures.sort((left, right): number => {
      if (left[sort_field] < right[sort_field]) {
        return dir === 'asc' ? -1 : 1;
      } else if (left[sort_field] > right[sort_field]) {
        return dir === 'asc' ? 1 : -1;
      }
      return 0;
    });
    // }
    // Note: if no sort order is specified, the default is to sort by the order they come back
    // from the API, which is determined in the Django model (currently: alphabetical)
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
    this.authors = [];
    for (let d of data) {
      d.authors_display = d.authors.join(' and ');
      let adv = new Adventure();
      adv.init(d);
      this.all_adventures.push(adv);

      for (let tag of adv.tags) {
        if (this.tags.indexOf(tag) === -1) {
          this.tags.push(tag);
        }
      }

      for (let author of d.authors) {
        if (this.authors.indexOf(author) === -1) {
          this.authors.push(author);
        }
      }
    }
    this.tags = this.tags.sort();
    this.authors = this.authors.sort();
    this.filterAndSort();
  }

}
