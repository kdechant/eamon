import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext from "../contexts/adventure";
import FormContext from "../contexts/form";
import {ArtifactLink, EffectLink, MonsterLink, RoomLink} from "./common";
import {
  ArtifactSelectField,
  EffectSelectField,
  ObjectDescriptionField, ObjectNumberField,
  ObjectTextareaField,
  ObjectTextField,
  ObjectToggleField,
  RoomSelectField
} from "./fields";
import {Room, RoomExit} from "../models/room";


interface RoomExitProps {
  room: Room,
  exit: RoomExit,
}

function RoomExitDetail(props: RoomExitProps): JSX.Element {
  const context = React.useContext(AdventureContext);
  const setField = (ev) => {
    context.setRoomExitField(props.exit, ev.target.name, ev.target.value);
  };

  const saveField = (ev) => {
    context.saveRoomExitField(props.exit, ev.target.name, ev.target.value);
  };

  const room_to = +props.exit.room_to;
  let afterText = <></>;
  if (room_to === 0) {
    afterText = <>No connection</>;
  } else if (room_to === -999) {
    afterText = <>Exit to Main Hall</>;
  } else if (room_to === -998) {
    afterText = <>Exit to Main Hall with custom message</>;
  } else if (room_to) {
    afterText = <RoomLink id={props.exit.room_to} maxLength={25} />;
  }

  return (
    <FormContext.Provider value={{setField, saveField}}>
      {/* TODO: allow custom values, to allow negative numbers. Or just use a text field. */}
      {/*<RoomSelectField name="room_to" label="Room to" value={props.exit.room_to}*/}
      {/*                 extraOptions={{0: "No connection"}} />*/}
      <ObjectNumberField name="room_to" label="Room to" value={props.exit.room_to}
                         afterText={afterText}/>
      <ArtifactSelectField value={props.exit.door_id} name="door_id" label="Door / Gate" allowEmpty={true} />
                           {/*helpText="A door, gate, or other artifact blocking the way. Access will*/}
                           {/*be granted if the 'door' is either opened, destroyed, or moved from*/}
                           {/*the room." />*/}
      <EffectSelectField value={props.exit.effect_id} name="effect_id" label="Effect" allowEmpty={true} />
                         {/*helpText="An effect shown when the player passes through this exit.*/}
                         {/*This is for color only and does not block passage. To create an exit that*/}
                         {/*goes nowhere but shows a custom 'you can't go that way' message, set the*/}
                         {/*connecting room to zero and add an effect ID." />*/}
    </FormContext.Provider>
  )
}


function RoomDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);

  if (!context.rooms) {
    return <>Loading...</>;
  }

  const room = context.rooms.get(id);
  if (!room) {
    return <>Room #{id} not found!</>;
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

  const exits: Record<string, RoomExit> = {};
  for (const exit of room.exits) {
    exits[exit.direction] = exit;
  }

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
      <ObjectToggleField name="is_dark" label="Is Dark?" value={room.is_dark}
      helpText="If dark, the player will need a light source, or else they will see a message like
                'It's too dark to see anything.' (Unless the dark name/description are provided below.)"/>
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
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td width="33%">
              NW
              {exits['nw'] && <RoomExitDetail room={room} exit={exits['nw']} />}
              {!exits['nw'] && <div className="text-muted">No connection</div>}
            </td>
            <td width="33%">
              N
              {exits['n'] && <RoomExitDetail room={room} exit={exits['n']} />}
              {!exits['n'] && <div className="text-muted">No connection</div>}
            </td>
            <td width="33%">
              NE
              {exits['ne'] && <RoomExitDetail room={room} exit={exits['ne']} />}
              {!exits['ne'] && <div className="text-muted">No connection</div>}
            </td>
          </tr>
          <tr>
            <td>
              W
              {exits['w'] && <RoomExitDetail room={room} exit={exits['w']} />}
              {!exits['w'] && <div className="text-muted">No connection</div>}
            </td>
            <td>
              {room.name}
            </td>
            <td>
              E
              {exits['e'] && <RoomExitDetail room={room} exit={exits['e']} />}
              {!exits['e'] && <div className="text-muted">No connection</div>}
            </td>
          </tr>
          <tr>
            <td>
              SW
              {exits['sw'] && <RoomExitDetail room={room} exit={exits['sw']} />}
              {!exits['sw'] && <div className="text-muted">No connection</div>}
            </td>
            <td>
              S
              {exits['s'] && <RoomExitDetail room={room} exit={exits['s']} />}
              {!exits['s'] && <div className="text-muted">No connection</div>}
            </td>
            <td>
              SE
              {exits['se'] && <RoomExitDetail room={room} exit={exits['se']} />}
              {!exits['se'] && <div className="text-muted">No connection</div>}
            </td>
          </tr>
          <tr>
            <td>
              Up
              {exits['u'] && <RoomExitDetail room={room} exit={exits['u']} />}
              {!exits['u'] && <div className="text-muted">No connection</div>}
            </td>
            <td>
              Down
              {exits['d'] && <RoomExitDetail room={room} exit={exits['d']} />}
              {!exits['d'] && <div className="text-muted">No connection</div>}
            </td>
          </tr>
        {/*{room.exits.map(e => (*/}
        {/*  <tr key={e.direction}>*/}
        {/*    <td>{e.direction}</td>*/}
        {/*    <td><RoomLink id={e.room_to} /></td>*/}
        {/*    <td><ArtifactLink id={e.door_id} /></td>*/}
        {/*    <td><EffectLink id={e.effect_id} /></td>*/}
        {/*  </tr>*/}
        {/*))}*/}
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
