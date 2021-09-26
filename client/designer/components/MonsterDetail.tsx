import * as React from 'react';
import {useParams} from "react-router";

import {AdventureContext, FormContext} from "../context";
import {MonsterLink, MonsterLocation, MonsterWeaponLink} from "./common";
import Monster from "../models/monster";
import {
  ObjectDescriptionField,
  ObjectDiceSidesField,
  ObjectNumberField,
  ObjectTextField
} from "./fields";

function MonsterDetail(): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const monster = context.monsters.get(id);
  if (!monster) {
    return <>Monster #${id} not found!</>;
  }

  const setField = (ev: any) => {
    context.setMonsterField(parseInt(id), ev.target.name, ev.target.value);
  };

  const saveField = (ev: any) => {
    context.saveMonsterField(parseInt(id), ev.target.name, ev.target.value);
  };

  const prev = context.monsters.getPrev(id);
  const next = context.monsters.getNext(id);

  return (
    <FormContext.Provider value={{setField, saveField}}>
      <div className="row">
        <div className="col-sm-3 col-md-2 offset-md-2">
          {prev && (
            <>&larr; <MonsterLink id={prev} /></>
          )}
        </div>
        <div className="col-sm-6 col-md-4 text-center">
          <strong>Monster # {id}: {monster.name}</strong>
        </div>
        <div className="col-sm-3 col-md-2 text-right">
          {next && (
            <><MonsterLink id={next} /> &rarr;</>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <div className="form-row">
            <div className="col-md-2 col-sm-4">
              <ObjectTextField name="article" label="Article" value={monster.article || ''}
                               helpText="An article like 'the', 'a', or 'some'. Optional. Makes the text
                               flow more easily but has no effect on game play." />
            </div>
            <div className="col-md-4 col-sm-8">
              <ObjectTextField name="name" label="Name" value={monster.name} />
            </div>
            <div className="col-md-6">
              <ObjectTextField name="synonyms" label="Synonyms / Alternate names" value={monster.synonyms || ''}
                               helpText="Separate with commas. Useful for monsters with odd names, or
                               when the player should be able to target the monster with multiple
                               names. e.g., if you have orcs named Trog and Zog, you could give them
                               both the synonym 'orc' so the player could attack either of them by
                               typing 'attack orc'." />
            </div>
          </div>
          <ObjectDescriptionField value={monster.description} isMarkdown={monster.is_markdown} />
          <p>
            Location:
            {' '}
            <MonsterLocation id={monster.id} />
          </p>
        </div>
        <div className="col-lg-4">
          <ObjectNumberField name="hardiness" label="Hardiness" value={monster.hardiness} />
          <ObjectNumberField name="agility" label="Agility" value={monster.agility} />
          <p>
            Friendliness: {monster.getFriendlinessDisplay()}
          </p>
          {monster.friendliness !== Monster.FRIEND_NEVER &&
            <ObjectNumberField
              name="friend_odds" label="% chance to be friendly"
              value={monster.friend_odds} afterText="%"
              helpText="For monsters with random friendliness, this determines
                the chance the monster will become friendly when first encountered. If the
                player attacks a monster, including a friendly or neutral NPC, this number
                determines how likely the monster is to become hostile. This number can be
                higher than 100%. e.g., a monster with friendliness odds of 200 would need to
                be attacked more than once in order to have any chance of becoming hostile." />
          }
          <p>
            Combat Code: {monster.combat_code} ({monster.getCombatCodeDisplay()})
          </p>
          <p>
            Odds to hit: {monster.attack_odds}<br/>
            <span className='info'>Note: This is a base value that is adjusted by agility.</span>
          </p>
          <p>
            Starting Weapon:<br />
            <MonsterWeaponLink id={monster.weapon_id} />
          </p>
          {monster.weapon_id === 0 && (
            <ObjectDiceSidesField
              label="Natural Weapons Damage"
              diceName="weapon_dice" diceValue={monster.weapon_dice}
              sidesName="weapon_sides" sidesValue={monster.weapon_sides}
              helpText="The weapon's damage roll. e.g., '1d8' or '2d6'" />
          )}
        </div>
      </div>
    </FormContext.Provider>
  );
}

export default MonsterDetail;
