import axios from 'axios';
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
    // todo: check if player_id is set, and redirect to player list if not
    axios.get('/api/adventures.json')
      .then(res => {
        const all_adventures: Adventure[] = [];
        let tags: string[] = [];
        let authors: string[] = [];
        for (let d of res.data) {
          d.authors_display = d.authors.join(' and ');
          let adv = new Adventure();
          adv.init(d);
          all_adventures.push(adv);

          for (let tag of adv.tags) {
            if (tags.indexOf(tag) === -1) {
              tags.push(tag);
            }
          }

          for (let author of d.authors) {
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
    let sort_field = 'name';
    let dir = 'asc';
    if (this.state.currentTag === 'featured') {
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

  /**
   * Saves the player and redirects the browser to the adventure
   * @param {Adventure} adv the Adventure object
   * @param event
   */
  public gotoAdventure = (adv: Adventure, event) => {
    event.preventDefault();
    this.props.player.save()
      .then((res) => {
        window.location.href = '/adventure/' + adv.slug;
      })
      .catch((err) => {
        // TODO: show error to player
        console.error(err);
      });
  };

  public render() {
    if (!this.props.player) {
      return (
        <p>Loading...</p>
      )
    }

    let emptyMessage = (<span />);
    if (this.state.adventures && this.state.adventures.length === 0) {
      emptyMessage = (<p>No adventures matched your filters. Try removing some filters.</p>)
    }

    let message = <span />;
    if (this.props.player.inventory.length === 0) {
      // suggest that the player buy a weapon before adventuring
      message = (
        <div className="message">
          <p><strong>The Irishman sees that you are preparing to leave the hall, and motions you over to the desk. &quot;Now, my friend, you're new here, and that's all right. But you'd best be buying some weapons and armor before you head out into the big, bad world.&quot;</strong></p>
          <div className="text-center margin-bottom-lg">
            <Link to="/main-hall/hall" className="btn btn-primary">Go back to Main Hall</Link>
          </div>
        </div>
      );
    } else {
      // suggest a beginner adventure to newbies
      if (this.props.player.inventory.length > 0 && this.props.player.armor_expertise === 0) {
        message = (
          <div className="message">
            <p><strong>The Irishman sees that you are preparing to leave the hall, and motions you over to the desk. &quot;Now, my friend, you're new here, and that's all right. Best try one of the 'Beginner' adventures for your first time out.&quot;</strong></p>
          </div>
        );
      }
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
        <h2><img src="/static/images/ravenmore/128/map.png" /> Go on an adventure</h2>

        {message}

        <p>Eamon contains many different adventures of many different styles. Some are fantasy or sci-fi, contain a quest or just hack-and-slash. Some are aimed at beginners and others are for veteran adventurers only. Choose your fate and perish (or profit)...</p>

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
              {adventures.map((adv) =>
                <div className="adventure-list-item" key={adv.id}>
                  <div className="row">
                    <div className="col-sm-2 d-none d-sm-block"><img src="/static/images/ravenmore/128/map.png" width="64" /></div>
                    <div className="col-sm-10">
                      <div className="float-right text-secondary d-none d-md-block adv-id">#{adv.id}</div>
                      <h3><a href="#" onClick={(ev) => this.gotoAdventure(adv, ev)}>{adv.name}</a></h3>
                      <p>{adv.authors_display.length ? "By: " + adv.authors_display : ""}</p>
                    </div>
                    <div className="col-12">
                      <p className="desc">{adv.description}</p>
                      <div className="tags">
                        {adv.tags.map(tag =>
                          <div className="tag" key={tag}>{tag}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="clearfix" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdventureList;
