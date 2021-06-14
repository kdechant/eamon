import * as React from 'react';
import { Link } from "react-router-dom";

import Adventure from "../models/adventure";

class AdventureList extends React.Component<any, any> {
  public state: any = {
    all_adventures: [],
    filtered_adventures: [],
    tags: [],
    authors: [],
    currentAuthor: '',
    currentSort: 'name',
    currentTag: ''
  };

  public componentDidMount() {
    fetch('/api/adventures.json')
      .then(res => res.json())
      .then(data => {
        console.log('data from api', data)
        const all_adventures: Adventure[] = [];
        let tags: string[] = [];
        let authors: string[] = [];
        for (const d of data) {
          d.authors_display = d.authors.join(' and ');
          const adv = new Adventure();
          adv.init(d);
          adv.name_sort = adv.name.slice(0,4) === 'The ' ? adv.name.slice(4) : adv.name;
          all_adventures.push(adv);

          for (const tag of adv.tags) {
            if (tags.indexOf(tag) === -1) {
              tags.push(tag);
            }
          }

          for (const author of d.authors) {
            if (authors.indexOf(author) === -1) {
              authors.push(author);
            }
          }
        }
        tags = tags.sort();
        authors = authors.sort();
        this.setState({ all_adventures, tags, authors });
      });
  }

  public filterByTag = (tag: string, event) => {
    this.setState({currentTag: this.state.currentTag === tag ? '' : tag});
  };

  public filterByAuthor = (author: string, event) => {
    this.setState({currentAuthor: this.state.currentAuthor === author ? '' : author});
  };

  public sort = (currentSort: string) => {
    this.setState({currentSort});
  };

  public filterAndSort = () => {
    let adventures = this.state.all_adventures;

    // filter by tag
    if (this.state.currentTag === 'featured') {
      adventures = adventures.filter(x => x.featured_month);
    } else if (this.state.currentTag !== '') {
      adventures = adventures.filter(x => x.tags.indexOf(this.state.currentTag) !== -1);
    }

    // filter by author
    if (this.state.currentAuthor !== '') {
      adventures = adventures.filter(x => x.authors.indexOf(this.state.currentAuthor) !== -1);
    }

    // sort
    let sort_option = this.state.currentSort;
    let sort_field = 'name_sort';
    let dir = 'asc';
    if (this.state.currentTag === 'featured') {
      // featured filter uses a custom default sort order
      sort_option = 'featured_month';
    }
    // translate the chosen option to a field and direction
    switch (sort_option) {
      case 'alphabetical':
        sort_field = 'name_sort';
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
    return adventures.sort((left, right): number => {
      if (left[sort_field] < right[sort_field]) {
        return dir === 'asc' ? -1 : 1;
      } else if (left[sort_field] > right[sort_field]) {
        return dir === 'asc' ? 1 : -1;
      }
      return 0;
    });
    // Note: if no sort order is specified, the default is to sort by the order they come back
    // from the API, which is determined in the Django model (currently: alphabetical)
  };
  //
  // /**
  //  * Saves the player and redirects the browser to the adventure
  //  * @param {Adventure} adv the Adventure object
  //  * @param event
  //  */
  // public gotoAdventure = (adv: Adventure, event) => {
  //   event.preventDefault();
  //   window.location.href = '/designer/adventure/' + adv.slug;
  // };

  public render() {
    if (!this.state.all_adventures) {
      return (
        <p>Loading...</p>
      )
    }

    let emptyMessage = (<span />);
    if (this.state.adventures && this.state.adventures.length === 0) {
      emptyMessage = (<p>No adventures matched your filters. Try removing some filters.</p>)
    }

    // filter and sort logic
    const adventures = this.filterAndSort();

    const sort_options: string[] = [
      'alphabetical',
      'most popular',
      'newest',
      'original adventure number',
    ];

    return (
      <div id="AdventureList">
        <h2><img src="/static/images/ravenmore/128/map.png" alt="Map" /> Edit an adventure</h2>

        <p>Choose an adventure to work on:</p>

        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              <div className="tags tags-vertical mb-3">
                <div className="mb-2">Filter by tag:</div>
                <div className="tag"><a onClick={(ev) => this.filterByTag('', ev)}>all</a></div>
                {this.state.tags.map(tag =>
                  <div className="tag" key={tag}>
                    <a className={this.state.currentTag === tag ? 'font-weight-bold' : ''} onClick={(ev) => this.filterByTag(tag, ev)}>{tag}</a>
                  </div>
                )}
              </div>

              <div className="tags tags-vertical mb-3">
                <div className="mb-2">Filter by author:</div>
                <div className="tag"><a onClick={(ev) => this.filterByAuthor('', ev)}>all</a></div>
                {this.state.authors.map(author =>
                  <div className="tag" key={author}>
                    <a className={this.state.currentAuthor === author ? 'font-weight-bold' : ''} onClick={(ev) => this.filterByAuthor(author, ev)}>{author}</a>
                  </div>
                )}
              </div>

              <div className="tags tags-vertical mb-3">
                <div className="mb-2">Sort by:</div>
                {sort_options.map(sort =>
                  <div className="tag" key={sort}>
                    <a className={this.state.currentSort === sort ? 'font-weight-bold' : ''} onClick={(s) => this.sort(sort)}>{sort}</a>
                  </div>
                )}
              </div>
            </div>

            <div className="adventure-list col-md-10">
              {emptyMessage}
              {adventures.map((adv) => {
                return (
                  <div className="adventure-list-item" key={adv.id}>
                    <div className="row">
                      <div className="col-sm-2 d-none d-sm-block">
                        <img src="/static/images/ravenmore/128/map.png" width="64" alt="Map"/>
                      </div>
                      <div className="col-sm-10">
                        <div className="float-right text-secondary d-none d-md-block adv-id">#{adv.id}</div>
                        <h3><a href={adv.slug}>{adv.name}</a></h3>
                        <p>{adv.authors_display.length ? "By: " + adv.authors_display : ""}</p>
                      </div>
                      <div className="col-12">
                        <p className="desc">{adv.description}</p>
                      </div>
                      <div className="tags col-12 col-md-6">
                        {adv.tags.map(tag =>
                          <div className="tag" key={tag}>{tag}</div>
                        )}
                      </div>
                    </div>
                    <div className="clearfix"/>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdventureList;
