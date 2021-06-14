import * as React from 'react';
import {useState, useEffect} from "react";
import {Route, useParams} from "react-router";

import Adventure from "../models/adventure";

function AdventureDetail() {
  const [adventure, setAdventure] = useState(null);
  let { slug } = useParams();

  // get the adventure details from the API
  async function loadAdventureData(slug) {
    const response = await fetch('/api/adventures/' + slug);
    const data = await response.json();
    const adventure = new Adventure();
    adventure.init(data);
    adventure.authors_display = adventure.authors.join(' and ');
    setAdventure(adventure);
  }

  useEffect(() => {
    loadAdventureData(slug);
  }, [slug]);

  if (!adventure) {
    return <p>Loading {slug}...</p>;
  }

  return (
    <div className="container-fluid" id="AdventureDetail">
      <div className="row">
        <div className="col-sm-2 d-none d-sm-block">
          <img src="/static/images/ravenmore/128/map.png" width="64" alt="Map"/>
        </div>
        <div className="col-sm-10">
          <div className="float-right text-secondary d-none d-md-block adv-id">#{adventure.id}</div>
          <h3>{adventure.name}</h3>
          <p>{adventure.authors_display.length ? "By: " + adventure.authors_display : ""}</p>
        </div>
      </div>
      <div>
        {adventure.description}
      </div>
      {/*<Route path="/main-hall/hall" render={(props) => (*/}
      {/*  <PlayerMenu {...props} player={this.state.player}/>*/}
      {/*)}/>*/}
    </div>
  );
}

export default AdventureDetail;
