import * as React from 'react';
import {useParams} from "react-router";

import { AdventureContext, FormContext} from "../context";
import {ArtifactLink, EffectLink, MonsterLink, RoomLink} from "./common";
import {ObjectDescriptionField, ObjectTextareaField, ObjectTextField} from "./fields";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);

  const room = context.rooms.get(id);
  if (!room) {
    return <>Room #${id} not found!</>;
  }

  const artifacts = context.artifacts.all.filter(a => a.room_id == room.id);
  const monsters = context.monsters.all.filter(m => m.room_id == room.id);

  const prev = context.rooms.getPrev(id);
  const next = context.rooms.getNext(id);

  const setField = (ev) => {
    // TODO: special handling for RoomExit fields
    context.setRoomField(parseInt(id), ev.target.name, ev.target.value);
  };

  const saveField = (ev) => {
    // TODO: special handling for RoomExit fields
    context.saveRoomField(parseInt(id), ev.target.name, ev.target.value);
  };

  return (
    <FormContext.Provider value={{setField, saveField}}>
      <div className="row no-gutters">
        <div className="col-md-8">
          <strong>Room # {id}</strong>
        </div>
        <div className="col-md-2">
        {prev && <>&larr; <RoomLink id={prev} /></>}
        </div>
        <div className="col-md-2">
        {next && <><RoomLink id={next} /> &rarr;</>}
        </div>
      </div>
      <ObjectTextField name="name" label="Name" value={room.name} />
      <ObjectDescriptionField value={room.description} isMarkdown={room.is_markdown} />
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
          <ObjectTextField name="dark_name" label="Dark name" value={room.dark_name}
                           helpText="Shown when the player is in the room and there is no light source." />
          <ObjectTextareaField name="dark_description" label="Dark Description" value={room.dark_description}
                           helpText="Shown when the player first enters the room and there is no
                                     light source. Is also shown if the player previously entered
                                     the room when it was light and later entered it again in the dark." />
        </>
      )}
      <ObjectTextareaField name="data" label="Custom Data" value={room.data}
                       helpText="Custom data about the room. This data may be
                       used in custom code. Must be valid JSON format." />

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
    </FormContext.Provider>
  );
}

export default RoomDetail;
