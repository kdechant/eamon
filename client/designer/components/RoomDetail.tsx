import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext, {UserContext} from "../context";
import {ArtifactLink, EffectLink, MonsterLink, RoomLink} from "./common";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);

  const room = context.rooms.get(id);
  if (!room) {
    return <>room #${id} not found!</>;
  }

  const artifacts = context.artifacts.all.filter(a => a.room_id == room.id);
  const monsters = context.monsters.all.filter(m => m.room_id == room.id);

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
        <textarea className="form-control" name="description" rows={5}
                  onChange={setField} value={room.description}
                  disabled={!user_context.username}>
        </textarea>
        <div className="form-group">
          <span className="mr-2">Description format:</span>
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input" name="is_markdown" id="is_markdown_n" value={0}
                   checked={!room.is_markdown} onChange={setField} />
            <label htmlFor="is_markdown_n" className="form-check-label">Plain Text</label>
          </div>
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input" name="is_markdown" id="is_markdown_y" value={1}
                   checked={room.is_markdown} onChange={setField} />
            <label htmlFor="is_markdown_y" className="form-check-label">Markdown</label>
          </div>
        </div>
      </div>
      <div className="form-group">
        <span className="mr-2">Is Dark?</span>
        <div className="form-check form-check-inline">
          <input type="radio" className="form-check-input" name="is_dark" id="is_dark_n" value={0}
                 checked={!room.is_dark} onChange={setField} />
          <label htmlFor="is_dark_n" className="form-check-label">No</label>
        </div>
        <div className="form-check form-check-inline">
          <input type="radio" className="form-check-input" name="is_dark" id="is_dark_y" value={1}
                 checked={room.is_dark} onChange={setField} />
          <label htmlFor="is_dark_y" className="form-check-label">Yes</label>
        </div>
      </div>
      {room.is_dark && (
        <>
          <div className="form-group">
            <label htmlFor="dark_name">Dark name</label>
            <input type="text" className="form-control" name="dark_name"
                      onChange={setField} value={room.dark_name}
                      disabled={!user_context.username} />
            <small className="form-text text-muted">
              Shown when the player is in the room and there is no light source.
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="dark_description">Dark Description</label>
            <textarea className="form-control" name="dark_description" rows={5}
                      onChange={setField} value={room.dark_description || ""}
                      disabled={!user_context.username}>
            </textarea>
            <small className="form-text text-muted">
              Shown when the player first enters the room and there is no light source. Is also shown if the
              player previously entered the room when it was light and later entered it again in the dark.
            </small>
          </div>
        </>
      )}
      <div className="form-group">
        <label htmlFor="data">Custom Data</label>
        <textarea className="form-control" name="data" rows={5}
                  onChange={setField} value={room.data || ""}
                  disabled={!user_context.username}>
        </textarea>
        <small className="form-text text-muted">
          Custom data about the room. This data may be used in custom code. Must be valid JSON format.
        </small>
      </div>
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
      <p>Artifacts:</p>
      <p>
        {artifacts.length === 0 && <span>none</span>}
        {artifacts.map(a => (
          <div key={a.id}>
            <ArtifactLink id={a.id} />
          </div>
        ))}
      </p>
      <p>Monsters:</p>
      <p>
        {monsters.length === 0 && <span>none</span>}
        {monsters.map(m => (
          <div key={m.id}>
            <MonsterLink id={m.id} />
          </div>
        ))}
      </p>
    </>
  );
}

export default RoomDetail;
