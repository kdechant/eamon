import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext, {UserContext} from "../context";
import {ArtifactLink, EffectLink, RoomLink} from "./common";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);

  const room = context.rooms.get(id);
  if (!room) {
    return <>room #${id} not found!</>;
  }

  const setField = (ev) => {
    context.setRoomField(parseInt(id), ev.target.name, ev.target.value);
  };

  return (
    <>
      <p>
        Room # {id}
      </p>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" className="form-control"
               onChange={setField} value={room.name} disabled={!user_context.username} />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea className="form-control" name="description" rows={10}
                  onChange={setField} value={room.description}
                  disabled={!user_context.username}>
        </textarea>
      </div>
      <div className="form-group">
        <label htmlFor="description">Is Dark?</label>
        <input type="radio" value={1} checked={room.is_dark} onChange={setField} /> Yes
        <input type="radio" value={0} checked={!room.is_dark} onChange={setField} /> No
      </div>
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
