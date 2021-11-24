import * as React from 'react';
import { Link } from "react-router-dom";

import AdventureContext from "../contexts/adventure";
import {ArtifactLink, ArtifactLocation, MonsterLink, RoomLink} from "./common";


const ArtifactList: React.FC = () => {
  const context = React.useContext(AdventureContext);

  if (!context.adventure) {
    return <p>Loading...</p>;
  }

  let emptyMessage = '';
  if (!context.artifacts.all.length) {
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
                <td>Location</td>
                <td>Weight</td>
                <td>Value</td>
              </tr>
            </thead>
            <tbody>
              {context.artifacts.all.map((art) => {
                return (
                  <tr className="room-list-item" key={art.id}>
                    <td>{art.id}</td>
                    <td><Link to={`${art.id}`}>{art.name}</Link></td>
                    {/* TODO: show type name */}
                    <td>{art.type}</td>
                    <td><ArtifactLocation id={art.id} /></td>
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
}

export default ArtifactList;
