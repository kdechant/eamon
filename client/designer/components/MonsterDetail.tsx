import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext from "../contexts/adventure";
import UserContext from "../contexts/user";
import FormContext from "../contexts/form";import {MonsterLink, MonsterLocation, MonsterWeaponLink} from "./common";
import Monster, {
  MONSTER_COMBAT_CODES,
  MONSTER_FRIENDLINESS,
  MONSTER_PURSUES
} from "../models/monster";
import {
  ArtifactSelectField,
  EffectSelectField,
  ObjectDescriptionField,
  ObjectDiceSidesField,
  ObjectNumberField,
  ObjectSelectField,
  ObjectTextField
} from "./fields";

function MonsterDetail(): JSX.Element {
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);
  const { slug, id } = useParams<{ slug: string, id: string }>();
  if (!context.monsters) {
    return <>Loading...</>;
  }
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

  const getToHitOdds = (defender_ag: number) => {
    const defender = new Monster();
    defender.agility = defender_ag;
    defender.defense_bonus = 0;
    return monster.getToHitOdds(defender);
  }

  const getWillBeHitOdds = (attacker_ag: number, attacker_wpn_ability: number) => {
    const attacker = new Monster();
    attacker.agility = attacker_ag;
    attacker.attack_odds = 25 + attacker_wpn_ability;  // player gets default odds of 25%
    return attacker.getToHitOdds(monster);
  }

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
          {monster.count == 1 && (
            <div className="form-row">
              <div className="col-sm-4">
                <ObjectTextField name="article" label="Article" value={monster.article || ''}
                                 helpText="An article like 'the', 'a', or 'some'. Optional. Makes the text
                                 flow more easily but has no effect on game play." />
              </div>
              <div className="col-sm-8">
                <ObjectTextField name="name" label="Name" value={monster.name} />
              </div>
            </div>
          )}
          {monster.count > 1 && (
            <div className="form-row">
              <div className="col-sm-6">
                <ObjectTextField name="name" label="Name" value={monster.name} />
              </div>
              <div className="col-sm-6">
                <ObjectTextField name="name_plural" label="Name (Plural)" value={monster.name_plural}
                                 placeholder={monster.name ? monster.name + 's' : ''}
                                 helpText="Plural name used for groups of monsters. E.g., 1 'lizard man'
                                 vs. 2 'lizard men'. Leave blank to use the regular name + s." />
              </div>
            </div>
          )}
          <ObjectTextField name="synonyms" label="Synonyms / Alternate names" value={monster.synonyms || ''}
                           helpText="Separate with commas. Useful for monsters with odd names, or
                           when the player should be able to target the monster with multiple
                           names. e.g., if you have orcs named Trog and Zog, you could give them
                           both the synonym 'orc' so the player could attack either of them by
                           typing 'attack orc'." />
          <ObjectDescriptionField value={monster.description} isMarkdown={monster.is_markdown} />

          <EffectSelectField name="effect_inline" value={monster.effect_inline}
                             label="Chained Effect (no line break)" allowEmpty={true}
                             helpText="An effect that will be shown immediately after the description,
                             without a line break. (Only for legacy EDX conversions. Do not enter
                             new data in this field.)" />
          <EffectSelectField name="effect" value={monster.effect}
                             label="Chained Effect" allowEmpty={true}
                             helpText="An effect that will be shown immediately after the description." />

          <p>
            Location:
            {' '}
            <MonsterLocation id={monster.id} />
          </p>
        </div>
        <div className="col-lg-4">
          <div className="form-row">
              <ObjectNumberField name="count" label="Count" value={monster.count}
                                 helpText="The number of monsters in the group. Enter 1 (the
                                 default) to make this a singular monster, and 2 or more to create
                                 a group of identical monsters." />
          </div>
          <div className="form-row">
            <div className="col-sm-6">
              <ObjectNumberField name="hardiness" label="Hardiness" value={monster.hardiness} />
            </div>
            <div className="col-sm-6">
              <ObjectNumberField name="agility" label="Agility" value={monster.agility} />
            </div>
          </div>
          <ObjectNumberField name="courage" label="Courage" value={monster.courage}
                             helpText="Chance the monster will stay and fight. 0-100%: This is the
                             chance the monster will stay if uninjured. When injured, the monster
                             will be more likely to run away. Enter 200% if the monster should
                             stay and fight to the death." />
          <ObjectSelectField label="Reaction to Player"
                             name="friendliness" value={monster.friendliness}
                             choices={MONSTER_FRIENDLINESS} />
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
        </div>
      </div>
      <div className="row">
        <div className="col-lg-9">
          <div className="form-row">
            <div className="col-md-6">
              <ObjectSelectField name="combat_code" value={monster.combat_code}
                                 label="Combat Behavior" choices={MONSTER_COMBAT_CODES} />
            </div>
            <div className="col-md-3">
              <ObjectNumberField name="attack_odds" value={monster.attack_odds}
                                 label="Odds to hit"
                                 helpText="Note: This is a base value that is adjusted by agility." />
            </div>
            <div className="col-md-3">
              <ObjectNumberField name="defense_bonus" value={monster.defense_bonus}
                                 label="Defense bonus"
                                 helpText="Extra chance to avoid being hit. Rare. Usually use agility
                                 instead." />
            </div>
          </div>

          <div className="form-row">
            <div className="col-md-3">
              <ObjectNumberField name="armor_class" value={monster.armor_class}
                                 label="Armor class"
                                 helpText="Typical ranges: 0: none, 1-2: light, 3-4: medium, 5+: tank" />
            </div>
            <div className="col-md-3">
              <ObjectSelectField name="pursues" value={monster.pursues ? 1 : 0}
                                 label="Pursues a fleeing player?" choices={MONSTER_PURSUES} />
            </div>
            <div className="col-md-6">
              <ObjectTextField name="combat_verbs" label="Custom Combat Verbs" value={monster.combat_verbs}
                               helpText="Customized descriptions of how the monster attacks. e.g.,
                                 'breathes fire at', 'casts a magic missile at'. Separate multiple
                                 items with commas. One item from the set will be chosen randomly
                                 each turn." />
            </div>
          </div>
          <div className="form-row">
            <div className="col-md-6">
              {!user_context.username && (
                <div className="form-group">
                  <label>Starting Weapon</label>
                  <MonsterWeaponLink id={monster.weapon_id} />
                </div>
              )}
              {user_context.username && (
                <ArtifactSelectField
                  name="weapon_id" label="Starting Weapon"
                  value={monster.weapon_id}
                  extraOptions={{'-1': "No weapon", 0: "Natural Weapons"}}
                />
              )}
            </div>
            <div className="col-md-6">
              {monster.combat_code} | {monster.weapon_id}
              {(monster.combat_code === -1 || monster.weapon_id === 0) && (
                <ObjectDiceSidesField
                  label="Natural Weapons Damage"
                  diceName="weapon_dice" diceValue={monster.weapon_dice}
                  sidesName="weapon_sides" sidesValue={monster.weapon_sides}
                  helpText="The weapon's damage roll. e.g., '1d8' or '2d6'" />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          Odds to hit:
          <table className="table table-sm">
            <tbody>
              <tr>
                <th>Target AG</th>
                <th>% to hit</th>
              </tr>
              <tr>
                <td>10</td>
                <td>{getToHitOdds(10)}</td>
              </tr>
              <tr>
                <td>15</td>
                <td>{getToHitOdds(15)}</td>
              </tr>
              <tr>
                <td>20</td>
                <td>{getToHitOdds(20)}</td>
              </tr>
            </tbody>
          </table>

          Odds a player will hit this monster:
          <table className="table table-sm">
            <tbody>
              <tr>
                <th>Player AG</th>
                <th>Wpn Ability</th>
                <th>% to hit</th>
              </tr>
              <tr>
                <td>15</td>
                <td>0%</td>
                <td>{getWillBeHitOdds(15, 0)}</td>
              </tr>
              <tr>
                <td>15</td>
                <td>25%</td>
                <td>{getWillBeHitOdds(15, 25)}</td>
              </tr>
              <tr>
                <td>20</td>
                <td>25%</td>
                <td>{getWillBeHitOdds(20, 25)}</td>
              </tr>
              <tr>
                <td>20</td>
                <td>50%</td>
                <td>{getWillBeHitOdds(20, 50)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </FormContext.Provider>
  );
}

export default MonsterDetail;
