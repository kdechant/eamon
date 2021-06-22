import * as React from 'react';
import {useState, useEffect} from "react";
import {Route, useParams} from "react-router";
import { Link } from "react-router-dom";
import RoomList from "./RoomList";

import Adventure from "../models/adventure";
import AdventureContext from "../context";

function AdventureDetail(): JSX.Element {
  const { slug } = useParams();
  return (
    <AdventureContext.Consumer>
      {state => (
        <>
          <div>
            {state.adventure.description}
          </div>
          <div>
            <p><Link to={slug + '/rooms'}>{state.rooms.length} Rooms</Link></p>
            <p><Link to={slug + '/artifacts'}>{state.artifacts.length} Artifacts</Link></p>
            <p><Link to={slug + '/effects'}>{state.effects.length} Effects</Link></p>
            <p><Link to={slug + '/monsters'}>{state.monsters.length} Monsters</Link></p>
            <p><Link to={slug + '/hints'}>{state.hints.length} Hints</Link></p>
          </div>
        </>
      )}
    </AdventureContext.Consumer>
  );
}

function AdventureMainMenu(): JSX.Element {
  const [state, setState] = useState(null);
  const { slug } = useParams();

  // get the adventure details from the API
  async function loadAdventureData(slug) {
    const [adv_data, rooms_data, artifacts_data, effects_data, monsters_data, hints_data] = await Promise.all([
      fetch(`/api/adventures/${slug}`).then(response => response.json()),
      fetch(`/api/adventures/${slug}/rooms`).then(response => response.json()),
      fetch(`/api/adventures/${slug}/artifacts`).then(response => response.json()),
      fetch(`/api/adventures/${slug}/effects`).then(response => response.json()),
      fetch(`/api/adventures/${slug}/monsters`).then(response => response.json()),
      fetch(`/api/adventures/${slug}/hints`).then(response => response.json()),
    ]);
    const adventure = new Adventure();
    adventure.init(adv_data);
    adventure.authors_display = adventure.authors.join(' and ');
    setState({
      adventure: adventure,
      rooms: rooms_data,
      artifacts: artifacts_data,
      effects: effects_data,
      monsters: monsters_data,
      hints: hints_data,
    })
  }

  useEffect(() => {
    loadAdventureData(slug);
  }, [slug]);

  if (!state || !state.adventure) {
    return <p>Loading {slug}...</p>;
  }

  return (
    <AdventureContext.Provider value={state}>
      <div className="container-fluid" id="AdventureDetail">
        <div className="row">
          <div className="col-sm-2 d-none d-sm-block">
            <img src="/static/images/ravenmore/128/map.png" width="64" alt="Map"/>
          </div>
          <div className="col-sm-10">
            <div className="float-right text-secondary d-none d-md-block adv-id">#{state.adventure.id}</div>
            <h3>{state.adventure.name}</h3>
            <p>{state.adventure.authors_display.length ? "By: " + state.adventure.authors_display : ""}</p>
          </div>
        </div>
        <Route exact path='/designer/:slug' render={() => (
          <AdventureDetail/>
        )}/>

        <Route path='/designer/:slug/rooms' render={() => (
          <RoomList/>
        )}/>

      </div>
    </AdventureContext.Provider>
  );
}

export default AdventureMainMenu;
