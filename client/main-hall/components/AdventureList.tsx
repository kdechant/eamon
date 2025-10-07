import styled from "@emotion/styled";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import colors from "../../common/colors.ts";
import { useAppDispatch, useAppSelector } from "../hooks";
import type Adventure from "../models/adventure";
import { savePlayer } from "../store/player";

const FilterList = styled.div`
  margin-top: 2px;
  line-height: 0.9;
`;

const FilterButton = styled.button`
  border: 1px solid ${colors.statusBorder};
  border-radius: 2px;
  color: inherit;
  margin: 0;
  border-left: 3px solid #841;
  background: ${colors.statusBg};
  padding: 0 2px 2px 5px;
  font-size: 80%;
  text-align: left;
  width: 100%;

  &.current-tag {
    font-weight: bold;
  }

  &:hover {
    color: inherit;
  }
`;

const AdventureNameButton = styled.button`
  align-self: start;
  color: ${colors.bodyText};
  padding: 0;
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  text-align: left;

  &:hover {
    text-decoration: underline !important;
  }
`;

const AdventureTag = styled.div`
  background: #dc9;
  border: 1px solid #b97;
  border-left: 3px solid #841;
  border-radius: 2px;
  float: left;
  font-size: 80%;
  margin-right: 5px;
  margin-bottom: 5px;
  padding: 0 5px 2px 5px;
`;

const AdventureList: React.FC = () => {
  const player = useAppSelector((state) => state.player);
  const dispatch = useAppDispatch();

  const [adventures, setAdventures] = useState([]);
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [currentTag, setCurrentTag] = useState(null);
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [currentSort, setCurrentSort] = useState(null);

  useEffect(() => {
    // todo: check if player_id is set, and redirect to player list if not
    axios.get("/api/adventures.json").then((res) => {
      const all_adventures: Adventure[] = [];
      let tags: string[] = [];
      let authors: string[] = [];
      for (const adv of res.data) {
        adv.authors_display = adv.authors.join(" and ");
        adv.name_sort = adv.name.slice(0, 4) === "The " ? adv.name.slice(4) : adv.name;
        all_adventures.push(adv);

        for (const tag of adv.tags) {
          if (tags.indexOf(tag) === -1) {
            tags.push(tag);
          }
        }

        for (const author of adv.authors) {
          if (authors.indexOf(author) === -1) {
            authors.push(author);
          }
        }
      }
      tags = tags.sort();
      authors = authors.sort();
      setAdventures(all_adventures);
      setTags(tags);
      setAuthors(authors);
    });
  }, []);

  const filterByTag = (tag: string) => {
    setCurrentTag((state) => (state === tag ? "" : tag));
  };

  const filterByAuthor = (author: string) => {
    setCurrentAuthor((state) => (state === author ? "" : author));
  };

  const sortAdventures = (newSort: string) => {
    setCurrentSort(newSort);
  };

  const filterAndSort = () => {
    // filter by tag
    let filteredAdventures = [...adventures];

    if (currentTag === "featured") {
      filteredAdventures = filteredAdventures.filter((x) => x.featured_month);
    } else if (currentTag) {
      filteredAdventures = filteredAdventures.filter((x) => x.tags.indexOf(currentTag) !== -1);
    }

    // filter by author
    if (currentAuthor) {
      filteredAdventures = filteredAdventures.filter((x) => x.authors.indexOf(currentAuthor) !== -1);
    }

    // sort
    let sort_option = currentSort;
    let sort_field = "name_sort";
    let dir = "asc";
    if (currentTag === "featured") {
      // featured filter uses a custom default sort order
      sort_option = "featured_month";
    }
    // translate the chosen option to a field and direction
    switch (sort_option) {
      case "alphabetical":
        sort_field = "name_sort";
        dir = "asc";
        break;
      case "featured_month":
        sort_field = "featured_month";
        dir = "desc";
        break;
      case "newest":
        sort_field = "date_published";
        dir = "desc";
        break;
      case "most popular":
        sort_field = "times_played";
        dir = "desc";
        break;
      case "original adventure number":
        sort_field = "id";
        dir = "asc";
        break;
    }
    return filteredAdventures.sort((left, right): number => {
      if (left[sort_field] < right[sort_field]) {
        return dir === "asc" ? -1 : 1;
      } else if (left[sort_field] > right[sort_field]) {
        return dir === "asc" ? 1 : -1;
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
  const gotoAdventure = (adv: Adventure, event) => {
    event.preventDefault();
    dispatch(
      savePlayer(player, () => {
        window.location.href = "/adventure/" + adv.slug;
      }),
    );
  };

  if (!player.id || !adventures) {
    return <p>Loading...</p>;
  }

  let message = <span />;
  if (player.inventory.length === 0) {
    // suggest that the player buy a weapon before adventuring
    message = (
      <div className="message">
        <p>
          <strong>
            The Irishman sees that you are preparing to leave the hall, and motions you over to the desk. &quot;Now, my
            friend, you're new here, and that's all right. But you'd best be buying some weapons and armor before you
            head out into the big, bad world.&quot;
          </strong>
        </p>
        <div className="text-center margin-bottom-lg">
          <Link to="/main-hall/hall" className="btn btn-primary">
            Go back to Main Hall
          </Link>
        </div>
      </div>
    );
  } else {
    // suggest a beginner adventure to newbies
    if (player.inventory.length > 0 && player.armor_expertise === 0) {
      message = (
        <div className="message">
          <p>
            <strong>
              The Irishman sees that you are preparing to leave the hall, and motions you over to the desk. &quot;Now,
              my friend, you're new here, and that's all right. Best try one of the 'Beginner' adventures for your first
              time out.&quot;
            </strong>
          </p>
        </div>
      );
    }
  }

  // filter and sort logic
  const filteredAdventures = filterAndSort();

  let emptyMessage = <span />;
  if (filteredAdventures.length === 0) {
    emptyMessage = <p>No adventures matched your filters. Try removing some filters.</p>;
  }

  const sort_options: string[] = ["alphabetical", "most popular", "newest", "original adventure number"];

  return (
    <div className="AdventureList">
      <h2>
        <img src="/static/images/ravenmore/128/map.png" alt="Map" /> Go on an adventure
      </h2>

      {message}

      <p>
        Eamon contains many different adventures of many different styles. Some are fantasy or sci-fi, contain a quest
        or just hack-and-slash. Some are aimed at beginners and others are for veteran adventurers only. Choose your
        fate and perish (or profit)...
      </p>

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 col-lg-2">
            <FilterList className="filter-tag mb-3">
              <div className="mb-2">Filter by tag:</div>
              <FilterButton type="button" className={"btn btn-link"} onClick={() => filterByTag("")}>
                all
              </FilterButton>
              {tags.map((tag) => (
                <FilterButton
                  key={tag}
                  type="button"
                  className={`btn btn-link ${currentTag === tag ? "current-tag" : ""}`}
                  onClick={() => filterByTag(tag)}
                >
                  {tag}
                </FilterButton>
              ))}
            </FilterList>

            <FilterList className="filter-author mb-3">
              <div className="mb-2">Filter by author:</div>
              <FilterButton type="button" className={"btn btn-link"} onClick={() => filterByAuthor("")}>
                all
              </FilterButton>
              {authors.map((author) => (
                <FilterButton
                  key={author}
                  type="button"
                  className={`btn btn-link ${currentAuthor === author ? "current-tag" : ""}`}
                  onClick={() => filterByAuthor(author)}
                >
                  {author}
                </FilterButton>
              ))}
            </FilterList>

            <FilterList className="filter-sort mb-3">
              <div className="mb-2">Sort by:</div>
              {sort_options.map((sort) => (
                <FilterButton
                  key={sort}
                  type="button"
                  className={`btn btn-link ${currentSort === sort ? "current-tag" : ""}`}
                  onClick={() => sortAdventures(sort)}
                >
                  {sort}
                </FilterButton>
              ))}
            </FilterList>
          </div>

          <div className={`adventure-list col-md-9 col-lg-10 ${filteredAdventures.length > 1 ? "columns" : ""}`}>
            {emptyMessage}
            {filteredAdventures.map((adv) => {
              const ratings = {
                overall: adv.avg_ratings.overall__avg
                  ? Number.parseFloat(adv.avg_ratings.overall__avg).toFixed(1)
                  : null,
                combat: adv.avg_ratings.combat__avg ? Number.parseFloat(adv.avg_ratings.combat__avg).toFixed(1) : null,
                puzzle: adv.avg_ratings.puzzle__avg ? Number.parseFloat(adv.avg_ratings.puzzle__avg).toFixed(1) : null,
              };
              return (
                <div className="adventure-list-item" key={adv.id}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flexGrow: 0 }}>
                      <img src="/static/images/ravenmore/128/map.png" width="64" alt="Map" />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h3>
                        <AdventureNameButton
                          type="button"
                          className="btn btn-link"
                          onClick={(ev) => gotoAdventure(adv, ev)}
                        >
                          {adv.name}
                        </AdventureNameButton>
                      </h3>
                      <p>{adv.authors_display.length ? `By: ${adv.authors_display}` : ""}</p>
                    </div>
                    <div style={{ flexGrow: 0 }}>#{adv.id}</div>
                  </div>
                  <p className="desc">{adv.description}</p>
                  <div className="row">
                    <div className="col-12 col-md-6">
                      {adv.tags.map((tag) => (
                        <AdventureTag key={tag}>{tag}</AdventureTag>
                      ))}
                    </div>
                    <div className="ratings col-12 col-md-6">
                      {ratings.overall ? (
                        <span className="rating">
                          <img src="/static/images/ravenmore/128/star.png" alt="Star" title="Overall rating" />
                          {ratings.overall}
                        </span>
                      ) : (
                        ""
                      )}
                      {ratings.combat ? (
                        <span className="rating">
                          <img src="/static/images/ravenmore/128/sword.png" alt="Sword" title="Combat difficulty" />
                          {ratings.combat}
                        </span>
                      ) : (
                        ""
                      )}
                      {ratings.puzzle ? (
                        <span className="rating">
                          <img src="/static/images/ravenmore/128/tome.png" alt="Book" title="Puzzle difficulty" />
                          {ratings.puzzle}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="clearfix" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureList;
