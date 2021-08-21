import * as React from 'react';
import {useState, useEffect} from "react";
import {Route, useParams} from "react-router";
import { RouteComponentProps } from "react-router-dom";

import AdventureContext from "../context";
import {ArtifactLink, EffectLink, MonsterWeaponLink, RoomLink} from "./common";
import Monster from "../models/monster";

function MonsterDetail(): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const monster = context.monsters.get(id);
  if (!monster) {
    return <>Monster #${id} not found!</>;
  }
  return (
    <>
      <p>
        Monster # {id}
      </p>
      <p>
        Name:<br />
        {monster.article} {monster.name}
      </p>
      <p>
        Description:<br />
        {monster.description}
      </p>
      <p>
        In Room: <RoomLink id={monster.room_id} />
      </p>
      {/* TODO: in container */}
      <p>
        Hardiness: {monster.hardiness}
      </p>
      <p>
        Agility: {monster.agility}
      </p>
      <p>
        Friendliness: {monster.getFriendlinessDisplay()}
      </p>
      {monster.friendliness !== Monster.FRIEND_NEVER &&
      <p>
        % chance to be friendly: {monster.friend_odds}%<br/>
        <span className='info'>For monsters with random friendliness, this determines
        the chance the monster will become friendly when first encountered. If the
        player attacks a monster, including a friendly or neutral NPC, this number
        determines how likely the monster is to become hostile. This number can be
        higher than 100%. e.g., a monster with friendliness odds of 200 would need to
        be attacked more than once in order to have any chance of becoming hostile.</span>
      </p>
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
      {monster.weapon_id === 0 && <>
        <p>
          Natural Weapon Dice: {monster.weapon_dice}
        </p>
        <p>
          Natural Weapon Sides: {monster.weapon_sides}
        </p>
      </>}
    </>
  );
}

export default MonsterDetail;
