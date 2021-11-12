import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext from "../contexts/adventure";
import UserContext from "../contexts/user";
import FormContext from "../contexts/form";
import Artifact, {
  ARTIFACT_ARMOR_TYPES,
  ARTIFACT_TYPES,
  ARTIFACT_WEAPON_TYPES
} from '../models/artifact';
import {ArtifactLink, ArtifactLocation, EffectLink, MonsterLink} from "./common";
import {
  ArtifactSelectField, EffectSelectField, MonsterSelectField,
  ObjectDescriptionField,
  ObjectDiceSidesField,
  ObjectNumberField, ObjectSelectField,
  ObjectTextField, ObjectToggleField
} from "./fields";

function ArtifactDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);

  if (!context.artifacts) {
    return <>Loading...</>;
  }

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
        <div className="col-md-6">
          <div className="form-row">
            <div className="col-md-4">
              <ObjectTextField name="article" label="Article" value={artifact.article || ''}
                               helpText="An article like 'the', 'a', or 'some'. Optional. Makes the text
                               flow more easily but has no effect on game play." />
            </div>
            <div className="col-md-8">
              <ObjectTextField name="name" label="Name" value={artifact.name} helpText="" />
            </div>
          </div>

          <ObjectTextField name="synonyms" label="Synonyms / Alternate names" value={artifact.synonyms || ''}
                           helpText="Separate with commas. Useful for artifacts with odd names or for hidden items.
                           e.g., 'bottle' for a potion, or 'strange rock' for a secret door" />

          <ObjectDescriptionField value={artifact.description} isMarkdown={artifact.is_markdown} />

          <EffectSelectField name="effect_inline" value={artifact.effect_inline}
                             label="Chained Effect (no line break)" allowEmpty={true}
                             helpText="An effect that will be shown immediately after the description,
                             without a line break. (Only for legacy EDX conversions. Do not enter
                             new data in this field.)" />
          <EffectSelectField name="effect" value={artifact.effect}
                             label="Chained Effect" allowEmpty={true}
                             helpText="An effect that will be shown immediately after the description." />

          <ArtifactLocation id={artifact.id} />

          <div className="row">
            <div className="col-md-6">
              <ObjectToggleField name="embedded" label="Embedded?" value={artifact.embedded}
                                 helpText="Doesn't appear in the artifact list of the room. The player
                                 can 'reveal' it by trying to interact with it by name."/>
            </div>
            <div className="col-md-6">
              <ObjectToggleField name="hidden" label="Secret Door?" value={artifact.hidden}
                                 helpText="If set, when the player tries to move through the door,
                                  the game will show a message like 'You can't go that way' instead of
                                  'the secret door blocks your way.' (For embedded secret doors only.)"/>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-row">
            <div className="col-md-4">
              <ObjectSelectField name="type" value={artifact.type}
                                 label="Type" choices={ARTIFACT_TYPES} />
            </div>
            <div className="col-md-4">
              <ObjectNumberField name="value" label="Value" value={artifact.value} afterText="gp" />
            </div>
            <div className="col-md-4">
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
              <div className="form-row">
                <div className="col-sm-6">
                  <ObjectSelectField name="weapon_type" value={artifact.weapon_type}
                                     label="Type" choices={ARTIFACT_WEAPON_TYPES} />
                </div>
                <div className="col-sm-6">
                  <ObjectNumberField name="hands" value={artifact.hands}
                                     label="1-handed or 2-handed weapon?"
                                     helpText="Enter 1 or 2. A shield can't be used at the same time
                                      as a 2-handed weapon." />
                </div>
              </div>
              <div className="form-row">
                <div className="col-sm-6">
                  <ObjectNumberField name="weapon_odds" label="Weapon Odds" value={artifact.weapon_odds}
                                     helpText="Amount added to chance to hit. May be negative. A.k.a, Complexity"
                                     afterText="%" />
                </div>
                <div className="col-sm-6">
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
            <div className="form-row">
              <div className="col-sm-6">
                <ObjectTextField name="quantity" label="Drinks/Bites"
                                 value={artifact.quantity} helpText="" />
              </div>
              <div className="col-sm-6">
                <ObjectDiceSidesField
                  label="Healing Amount"
                  diceName="dice" diceValue={artifact.dice}
                  sidesName="sides" sidesValue={artifact.sides}
                  helpText="The item's healing roll. e.g., '1d8' or '2d6'. Many items use a 'd1'
                            value to heal an exact value, e.g., '6d1' to heal exactly 6 HP." />
              </div>
            </div>
          )}

          {(artifact.type === Artifact.TYPE_LIGHT_SOURCE) && (
            <div className="form-row">
              <div className="col-sm-12">
                <ObjectTextField name="quantity" label="Starting Fuel Quantity"
                                 value={artifact.quantity}
                                 helpText="The light source will last this many turns before
                                 going out. Enter -1 for a light source that lasts forever." />
              </div>
            </div>
          )}

          {(artifact.type === Artifact.TYPE_DOOR || artifact.type === Artifact.TYPE_CONTAINER) && (
            <div className="form-row">
              <div className="col-sm-6">
                <ArtifactSelectField
                  name="key_id" label="Key"
                  value={artifact.key_id}
                  extraOptions={{'-1': "Can't be opened normally", 0: "No key"}}
                  helpText="If no key, and the 'Hit points' field is set, the player will have to
                    ATTACK the artifact to open it."
                />
              </div>
              <div className="col-sm-6">
                <ObjectNumberField name="hardiness" label="Hit points" value={artifact.hardiness}
                                   helpText="Amount of damage it takes to smash open the artifact.
                                     Leave blank for artifacts that can't be broken open without
                                     the key."
                />
              </div>
            </div>
          )}

          {(artifact.type === Artifact.TYPE_READABLE) && (
            <div className="form-row">
              <div className="col-sm-6">
                <EffectSelectField name="effect_id" label="Effect shown when reading"
                                    value={artifact.effect} allowEmpty={true}
                                    helpText="When the player READs this artifact, it will show
                                    this effect, plus any effects chained onto that one." />
              </div>
              <div className="col-sm-6">
                <ObjectNumberField name="num_effects" label="Hit points" value={artifact.num_effects}
                                   helpText="How many effects to show when READing the artifact,
                                   starting with the one on the left. Usually enter 1 here." />
              </div>
            </div>
          )}

          {(artifact.type === Artifact.TYPE_BOUND_MONSTER) && (
            <div className="form-row">
              <div className="col-sm-4">
                <MonsterSelectField name="monster_id" label="Monster"
                                    value={artifact.monster_id} allowEmpty={true}
                                    helpText="The monster freed when you use the FREE command on this
                                      bound monster."
                />
              </div>
              <div className="col-sm-4">
                <ArtifactSelectField name="key_id" label="Key"
                                     value={artifact.key_id} allowEmpty={true}
                                     helpText="The player needs to have this key to free the monster"
                />
              </div>
              <div className="col-sm-4">
                <MonsterSelectField name="guard_id" label="Guarded by"
                                    value={artifact.guard_id} allowEmpty={true}
                                    helpText="Another monster that stops the player from freeing this
                                    bound monster, if that monster is in the room and alive." />
              </div>
            </div>
          )}

          {(artifact.type === Artifact.TYPE_DISGUISED_MONSTER) && (
            <MonsterSelectField name="monster_id" label="Monster"
                                value={artifact.key_id} allowEmpty={true}
                                helpText="The monster that is revealed when the player tries to
                                  inspect or pick up this artifact." />
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

          {(artifact.type === Artifact.TYPE_WEARABLE) && (
            <>
              <div className="form-row">
                <div className="col-sm-4">
                  <ObjectSelectField
                    name="armor_type" value={artifact.armor_type}
                    label="Armor Type" choices={ARTIFACT_ARMOR_TYPES} allowEmpty={true}
                    helpText="The player can wear one of each type. Leave blank for general wearable
                      items that aren't armor (e.g., a winter coat, a non-magical ring, or a pirate hat)."
                  />
                </div>
                <div className="col-sm-4">
                  <ObjectNumberField name="armor_class" label="Armor Class" value={artifact.armor_class} />
                </div>
                <div className="col-sm-4">
                  <ObjectNumberField
                    name="armor_penalty" value={artifact.armor_class}
                    label="Armor Penalty" afterText="%"
                    helpText="The amount this item restricts the wearer's combat ability. Offset by
                      wearer's armor expertise. Applies to the player only." />
                </div>
              </div>
            </>
          )}

          {(artifact.type !== Artifact.TYPE_BOUND_MONSTER) && (
            <MonsterSelectField name="guard_id" label="Guarded by"
                                value={artifact.guard_id} allowEmpty={true}
                                helpText="Another monster that stops the player from picking up
                                this artifact, if that monster is alive and in the room." />

            // <div className="row">
            //   <div className="col-md-6">
            //     <MonsterSelectField name="guard_id" label="Guarded by"
            //                         value={artifact.guard_id} allowEmpty={true}
            //                         helpText="Another monster that stops the player from picking up
            //                         this artifact, if that monster is alive and in the room." />
            //   </div>
            //   <div className="col-md-6">
            //     {artifact.guard_id && <MonsterLink id={artifact.guard_id} />}
            //   </div>
            // </div>
          )}
        </div>
      </div>
    </FormContext.Provider>
  );
}

export default ArtifactDetail;
