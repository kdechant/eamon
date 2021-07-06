import * as React from 'react';
import { Link } from "react-router-dom";

import {useParams} from "react-router";
import AdventureContext from "../context";
import {ArtifactLink, MonsterLink, RoomLink} from "./common";

function ArtifactList(): JSX.Element {
  const { slug } = useParams();

  return (
    <AdventureContext.Consumer>
      {state => {

        if (!state.adventure) {
          return <p>Loading {slug}...</p>;
        }

        let emptyMessage = '';
        if (!state.artifacts.length) {
          emptyMessage = 'no artifacts yet';
        }

        return (
          <div id="ArtifactList">
            <h3>Artifacts</h3>

            <p>Choose an artifact:</p>

            <div className="container-fluid">
              <div className="row">
                {emptyMessage}
                <table className="table">
                  <thead>
                    <tr>
                      <td>#</td>
                      <td>Name</td>
                      <td>Type</td>
                      <td>In Room</td>
                      <td>In Container</td>
                      <td>Carried by Monster</td>
                      <td>Weight</td>
                      <td>Value</td>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(state.artifacts).map((art) => {
                      return (
                        <tr className="room-list-item" key={art.id}>
                          <td>{art.id}</td>
                          <td><Link to={`artifacts/${art.id}`}>{art.name}</Link></td>
                          {/* TODO: show type name */}
                          <td>{art.type}</td>
                          <td><RoomLink id={art.room_id} /></td>
                          <td><ArtifactLink id={art.container_id} /></td>
                          <td><MonsterLink id={art.monster_id} /></td>
                          <td>{art.weight}</td>
                          <td>{art.value}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }}
    </AdventureContext.Consumer>
  );
}

export default ArtifactList;
