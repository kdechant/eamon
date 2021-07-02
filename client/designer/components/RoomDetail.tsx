import * as React from 'react';
import {useState, useEffect} from "react";
import {Route, useParams} from "react-router";
import { Link } from "react-router-dom";

import AdventureContext from "../context";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams();

  console.log('RoomDetail', id)
  return (
    <AdventureContext.Consumer>
      {state => (
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
          <table border={1}>
            <thead>
              <tr>
                <td>Direction</td>
                <td>Room To</td>
                <td>Door ID</td>
                <td>Effect ID</td>
              </tr>
            </thead>
            <tbody>
              {state.rooms[id].exits.map(e => (
                <tr key={e.direction}>
                  <td>{e.direction}</td>
                  <td>{e.room_to} (<Link to={'../../' + slug + '/rooms/' + e.room_to}>{state.rooms[e.room_to].name}</Link>)</td>
                  {/* TODO: door name, effect preview */}
                  {/* TODO: apply styles to "disabled" */}
                  <td>{e.door_id ? e.door_id : (
                    <span className="disabled">n/a</span>)}</td>
                  <td>{e.effect_id ? e.effect_id : (
                    <span className="disabled">n/a</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdventureContext.Consumer>
  );
}

export default RoomDetail;
