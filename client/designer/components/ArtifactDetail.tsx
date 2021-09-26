import * as React from 'react';
import {useParams} from "react-router";

import { AdventureContext, UserContext, FormContext} from "../context";
import Artifact from '../models/artifact';
import {ArtifactLink, ArtifactLocation} from "./common";
import {
  ObjectDescriptionField,
  ObjectDiceSidesField,
  ObjectNumberField,
  ObjectTextField
} from "./fields";

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

  const saveField = (ev: any) => {
    context.saveArtifactField(parseInt(id), ev.target.name, ev.target.value);
  };

  const prev = context.artifacts.getPrev(id);
  const next = context.artifacts.getNext(id);

  return (
    <FormContext.Provider value={{setField, saveField}}>
      <div className="row no-gutters">
        <div className="col-md-8">
          <strong>Artifact # {id}</strong>
        </div>
        <div className="col-md-2">
        {prev && <>&larr; <ArtifactLink id={prev} /></>}
        </div>
        <div className="col-md-2">
        {next && <><ArtifactLink id={next} /> &rarr;</>}
        </div>
      </div>
      <div className="row">
        <div className="col-md-2">
          <ObjectTextField name="article" label="Article" value={artifact.article || ''}
                           helpText="An article like 'the', 'a', or 'some'. Optional. Makes the text
                           flow more easily but has no effect on game play." />
        </div>
        <div className="col-md-4">
          <ObjectTextField name="name" label="Name" value={artifact.name} helpText="" />
        </div>
        <div className="col-md-6">
          <ObjectTextField name="synonyms" label="Synonyms / Alternate names" value={artifact.synonyms || ''}
                           helpText="Separate with commas. Useful for artifacts with odd names or for hidden items.
                           e.g., 'bottle' for a potion, or 'strange rock' for a secret door" />
        </div>
      </div>
      <ObjectDescriptionField value={artifact.description} isMarkdown={artifact.is_markdown} />
      <ArtifactLocation id={artifact.id} />
      <div className="row">
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select className="custom-select" name="type" value={artifact.type}
                    onChange={setField} disabled={!user_context.username}>
              {/* TODO: implement a choice system like ModelChoices */}
              <option value="0">0: Gold</option>
              <option value="1">1: Treasure</option>
              <option value="2">2: Non-magic Weapon</option>
              <option value="3">3: Magic Weapon</option>
              <option value="4">4: Container</option>
              <option value="5">5: Light Source</option>
              <option value="6">6: Drinkable</option>
              <option value="7">7: Readable</option>
              <option value="8">8: Door/Gate</option>
              <option value="9">9: Edible</option>
              <option value="10">10: Bound Monster</option>
              <option value="11">11: Wearable</option>
              <option value="12">12: Disguised Monster</option>
              <option value="13">13: Dead Body</option>
            </select>
          </div>
        </div>
        <div className="col-sm-4">
          <ObjectNumberField name="value" label="Value" value={artifact.value} afterText="gp" />
        </div>
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="name">Weight</label>
            {/* TODO: Add a tooltip with some examples of common objects. */}
            <div className="input-group">
              <input type="text" name="weight" className="form-control"
                     onChange={setField} value={artifact.weight} disabled={!user_context.username} />
              <span className="input-group-text">gronds</span>
              {artifact.weight === -999 && (
                <span className="input-group-text">(Can't be picked up.)</span>
              )}
              {artifact.weight >= 900 && (
                <span className="input-group-text">(Don't be absurd.)</span>
              )}
            </div>
            <small className="form-text text-muted">
              Enter -999 if the item can't be picked up. Enter any number &gt; 900 to show the message "Don't be absurd"
              if the player tries to pick it up.
            </small>
          </div>
        </div>
      </div>

      {artifact.isWeapon() && (
        <>
          <div className="row">
            <div className="col-sm-4">
              <div className="form-group">
                <label htmlFor="weapon_type">Weapon Type</label>
                <select className="custom-select" name="weapon_type" value={artifact.weapon_type}
                        onChange={setField} disabled={!user_context.username}>
                  <option value="1">Axe</option>
                  <option value="2">Bow / Missile</option>
                  <option value="3">Club / Mace / War Hammer</option>
                  <option value="4">Spear / Halberd / Polearm</option>
                  <option value="5">Sword / Dagger</option>
                </select>
              </div>
            </div>
            <div className="col-sm-4">
              <ObjectNumberField name="weapon_odds" label="Weapon Odds" value={artifact.weapon_odds}
                                 helpText="Amount added to chance to hit. May be negative. A.k.a, Complexity"
                                 afterText="%" />
            </div>
            <div className="col-sm-4">
              <ObjectDiceSidesField
                label="Weapon Damage"
                diceName="dice" diceValue={artifact.dice}
                sidesName="sides" sidesValue={artifact.sides}
                helpText="The weapon's damage roll. e.g., '1d8' or '2d6'" />
            </div>
          </div>
        </>
      )}

      {(artifact.type === Artifact.TYPE_EDIBLE || artifact.type === Artifact.TYPE_DRINKABLE) && (
        <>
          <div className="row">
            <div className="col-sm-3">
              <ObjectTextField name="quantity" label="Drinks/Bites"
                               value={artifact.quantity} helpText="" />
            </div>
            <div className="col-sm-3">
              <ObjectDiceSidesField
                label="Healing Amount"
                diceName="dice" diceValue={artifact.dice}
                sidesName="sides" sidesValue={artifact.sides}
                helpText="The item's healing roll. e.g., '1d8' or '2d6'. Many items use a 'd1'
                          value to heal an exact value, e.g., '6d1' to heal exactly 6 HP." />
            </div>
          </div>
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
    </FormContext.Provider>
  );
}

export default ArtifactDetail;
