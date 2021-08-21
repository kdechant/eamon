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

  public componentDidMount(): void {
    fetch('/api/adventures/designer-list')
      .then(res => res.json())
      .then(data => {
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

  public filterByTag = (tag: string, event): void => {
    this.setState({currentTag: this.state.currentTag === tag ? '' : tag});
  };

  public filterByAuthor = (author: string, event): void => {
    this.setState({currentAuthor: this.state.currentAuthor === author ? '' : author});
  };

  public sort = (currentSort: string): void => {
    this.setState({currentSort});
  };

  public filterAndSort = (): Adventure[] => {
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

    return (
      <div id="AdventureList">
        <h2><img src="/static/images/ravenmore/128/map.png" alt="Map" /> Edit an adventure</h2>

        <p>Welcome to the Eamon Dungeon Designer. This is a program for viewing and
          editing adventure data. Click an adventure below to view its data,
          or <Link to={`/designer/login`}>log in to edit adventures</Link>.</p>

        <div className="container-fluid">
          <div className="row">
            <div className="col-md-10">
              {emptyMessage}
              <table className="table">
                <thead>
                  <tr>
                    <td><a className={this.state.currentSort === 'original adventure number' ? 'font-weight-bold' : ''}
                           onClick={() => this.sort('original adventure number')}>
                      #</a>
                    </td>
                    <td><a className={this.state.currentSort === 'alphabetical' ? 'font-weight-bold' : ''}
                           onClick={() => this.sort('alphabetical')}>
                      Name</a>
                    </td>
                    <td>Authors</td>
                    {/*<td>Rooms</td>*/}
                    {/*<td>Artifacts</td>*/}
                    {/*<td>Effects</td>*/}
                    {/*<td>Monsters</td>*/}
                    <td>Tags</td>
                    <td><a className={this.state.currentSort === 'newest' ? 'font-weight-bold' : ''}
                           onClick={() => this.sort('newest')}>
                      Published</a>
                    </td>
                    <td><a className={this.state.currentSort === 'most popular' ? 'font-weight-bold' : ''}
                           onClick={() => this.sort('most popular')}>
                      Times Played</a>
                    </td>
                    <td>Active?</td>
                  </tr>
                </thead>
                <tbody>
              {adventures.map((adv) => {
                return (
                  <tr key={adv.id}>
                    <td>{adv.id}</td>
                    <td><Link to={`/designer/${adv.slug}`}>{adv.name}</Link></td>
                    <td>{adv.authors_display}</td>
                    {/*<td>{adv.rooms_count}</td>*/}
                    {/*<td>{adv.artifacts_count}</td>*/}
                    {/*<td>{adv.effects_count}</td>*/}
                    {/*<td>{adv.monsters_count}</td>*/}
                    <td>{adv.tags.map(tag =>
                        <div className="tag" key={tag}>{tag}</div>
                    )}</td>
                    <td>{adv.date_published}</td>
                    <td>{adv.times_played}</td>
                    <td>{adv.active ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
                </tbody>
              </table>
            </div>

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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdventureList;
