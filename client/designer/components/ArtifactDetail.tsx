import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext, {UserContext} from "../context";
import Artifact from '../models/artifact';
import {ArtifactLink, EffectLink, MonsterLink, RoomLink} from "./common";

function ArtifactDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);

  const artifact = context.artifacts.get(id);
  if (!artifact) {
    return <>Artifact #${id} not found!</>;
  }

  let contents = [];
  if (artifact.type === Artifact.TYPE_CONTAINER) {
    contents = context.artifacts.all.filter(a => a.container_id == artifact.id);
  }

  const setField = (ev) => {
    context.setArtifactField(parseInt(id), ev.target.name, ev.target.value);
  };

  return (
    <>
      <p>
        Artifact # {id}
      </p>
      <p>
        Location:
        {' '}
        {artifact.room_id && (
          <>
            In room: <RoomLink id={artifact.room_id} />
          </>
        )}
        {artifact.monster_id && artifact.type != 12 && (
          <>
            Carried by monster: <MonsterLink id={artifact.monster_id} />
          </>
        )}
        {artifact.container_id && (
          <>
            In container: <ArtifactLink id={artifact.container_id} />
          </>
        )}
        {!artifact.room_id && !artifact.monster_id && !artifact.container_id && (
          <>
            Nowhere
          </>
        )}
      </p>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" className="form-control"
               onChange={setField} value={artifact.name} disabled={!user_context.username} />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea className="form-control" name="description" rows={5}
                  onChange={setField} value={artifact.description}
                  disabled={!user_context.username}>
        </textarea>
        <div className="form-group">
          <span className="mr-2">Description format:</span>
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input" name="is_markdown" id="is_markdown_n" value={0}
                   checked={!artifact.is_markdown} onChange={setField} />
            <label htmlFor="is_markdown_n" className="form-check-label">Plain Text</label>
          </div>
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input" name="is_markdown" id="is_markdown_y" value={1}
                   checked={artifact.is_markdown} onChange={setField} />
            <label htmlFor="is_markdown_y" className="form-check-label">Markdown</label>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="type">Type</label>
        {/* FIXME: The value of this field is getting reverted after saving. */}
        <select className="custom-select" name="type" value={artifact.type}
                onChange={setField} disabled={!user_context.username}>
          {/* TODO: implement a choice system like ModelChoices */}
          <option value="0">Gold</option>
          <option value="1">Treasure</option>
          <option value="2">Non-magic Weapon</option>
          <option value="3">Magic Weapon</option>
          <option value="4">Container</option>
          <option value="5">Light Source</option>
          <option value="6">Drinkable</option>
          <option value="7">Readable</option>
          <option value="8">Door/Gate</option>
          <option value="9">Edible</option>
          <option value="10">Bound Monster</option>
          <option value="11">Wearable</option>
          <option value="12">Disguised Monster</option>
          <option value="13">Dead Body</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="name">Value</label>
        <input type="text" name="value" className="form-control"
               onChange={setField} value={artifact.value} disabled={!user_context.username} />
      </div>
      <div className="form-group">
        <label htmlFor="name">Weight</label>
        {/* TODO: Add a tooltip with some examples of common objects. */}
        <input type="text" name="weight" className="form-control"
               onChange={setField} value={artifact.weight} disabled={!user_context.username} /> gronds
        {artifact.weight === -999 && (
          <span>(Can't be picked up.)</span>
        )}
        {artifact.weight >= 900 && (
          <span>(Don't be absurd.)</span>
        )}
        <small className="form-text text-muted">
          Enter -999 if the item can't be picked up. Enter any number &gt; 900 to show the message "Don't be absurd"
          if the player tries to pick it up.
        </small>
      </div>
      {/* TODO: convert more fields to form fields */}
      {artifact.isWeapon() && (
        <>
          <p>
            Weapon Type<br />
            {artifact.weapon_type}
          </p>
          <p>
            Weapon Odds<br />
            {artifact.weapon_odds}
          </p>
          <p>
            Weapon Dice<br />
            {artifact.dice}
          </p>
          <p>
            Weapon Sides<br />
            {artifact.sides}
          </p>
        </>
      )}
      {(artifact.type === Artifact.TYPE_EDIBLE || artifact.type === Artifact.TYPE_DRINKABLE) && (
        <>
          <p>
            Drinks/Bites<br />
            {artifact.weapon_type}
          </p>
          <p>
            Healing Dice (negative = poison)<br />
            {artifact.dice}
          </p>
          <p>
            Healing Sides<br />
            {artifact.sides}
          </p>
        </>
      )}
      {(artifact.type === Artifact.TYPE_CONTAINER) && (
        <div>
          Contents<br />
          {contents.length === 0 && <span>nothing</span>}
          {contents.map(a => (
            <div key={a.id}>
              <ArtifactLink id={a.id} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ArtifactDetail;
