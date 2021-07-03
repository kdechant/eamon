import * as React from 'react';
import {useState, useEffect} from "react";
import {Route, useParams} from "react-router";
import { Link } from "react-router-dom";

import AdventureContext from "../context";
import {ArtifactLink, EffectLink, RoomLink} from "./common";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams();
  return (
    <AdventureContext.Consumer>
      {state => {
        if (!state.rooms[id]) {
          return <>room #${id} not found!</>;
        }
        return (
          <>
            <p>
              Room # {id}
            </p>
            <p>
              Name:<br />
              {state.rooms[id].name}
            </p>
            <p>
              Description:<br />
              {state.rooms[id].description}
            </p>
            <p>
              Is Dark? {state.rooms[id].is_dark ? "Yes" : "No"}
            </p>
            {state.rooms[id].is_dark && (
              <>
                <p>Dark name: <br/>
                  {state.rooms[id].dark_name}
                </p>
                <p>Dark description: <br/>
                  {state.rooms[id].dark_description}
                </p>
              </>
            )}
            <p>Exits:</p>
            <table className="table">
              <thead>
              <tr>
                <td>Direction</td>
                <td>Room To</td>
                <td>Door Blocks Exit</td>
                <td>Show Effect</td>
              </tr>
              </thead>
              <tbody>
              {state.rooms[id].exits.map(e => (
                <tr key={e.direction}>
                  <td>{e.direction}</td>
                  <td><RoomLink id={e.room_to} /></td>
                  <td><ArtifactLink id={e.door_id} /></td>
                  <td><EffectLink id={e.effect_id} /></td>
                </tr>
              ))}
              </tbody>
            </table>
          </>
        );
      }}
    </AdventureContext.Consumer>
  );
}

export default RoomDetail;
