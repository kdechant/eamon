import * as React from 'react';
import {Route, useParams} from "react-router";

import AdventureContext from "../context";
import {ArtifactLink, EffectLink, RoomLink} from "./common";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams();
  const context = React.useContext(AdventureContext);
  const room = context.rooms.get(id);
  if (!room) {
    return <>room #${id} not found!</>;
  }
  return (
    <>
      <p>
        Room # {id}
      </p>
      <p>
        Name:<br />
        {room.name}
      </p>
      <p>
        Description:<br />
        {room.description}
      </p>
      <p>
        Is Dark? {room.is_dark ? "Yes" : "No"}
      </p>
      {room.is_dark && (
        <>
          <p>Dark name: <br/>
            {room.dark_name}
          </p>
          <p>Dark description: <br/>
            {room.dark_description}
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
        {room.exits.map(e => (
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
}

export default RoomDetail;
