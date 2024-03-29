import * as React from 'react';
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import {titleCase} from "../../main-hall/utils";
import {Monster} from "../models/monster";
import {formatList} from "../utils";
import Game from "../models/game";
import {Artifact} from "../models/artifact";

type StatusProps = {
  game: Game,
  open: boolean,
}

const Status: React.FC<StatusProps> = (props) => {

  const game = props.game;

  if (!game || !game.player) {
    return <div>Loading...</div>
  }

  const inTheDark = game.rooms.current_room.is_dark && !game.artifacts.isLightSource();

  let hdClass = "hardiness col-4";
  if (game.player.hardiness < game.player.stats_original.hardiness) {
    hdClass += " danger";
  }

  let agClass = "agility col-4";
  if (game.player.speed_multiplier > 1) {
    agClass += " success";
  } else if (game.player.agility < game.player.stats_original.agility) {
    agClass += " danger";
  }

  let chClass = "charisma col-4";
  if (game.player.charisma < game.player.stats_original.charisma) {
    chClass += " danger";
  }

  // visible exits (normal exits and ones with non-hidden doors)
  const visible_exits = game.rooms.current_room.getVisibleExits();

  const armor = game.player.inventory.filter(a => a.is_worn && a.isArmor()).sort((a, b) => {
    return a.armor_type - b.armor_type;
  });

  const statusClass = props.open ? '' : 'd-none';

  let hp_class = '';
  if (game.player.damage > game.player.hardiness * 0.6) {
    hp_class = 'warning';
  }
  if (game.player.damage > game.player.hardiness * 0.8) {
    hp_class = 'danger';
  }

  return (
    <div className={`status ${statusClass} d-md-block col-md-5`}>
    <div className="status-widget player-stats">
      <div className="container">
        <div className="row">
          <h3 className="heading col-8">{game.player.name}</h3>
          <div className="hp col-4 text-right">HP: <span className={hp_class}>{ game.player.hardiness - game.player.damage }</span>/{ game.player.hardiness }</div>
        </div>

        <div className="stats row no-gutters">
          <div className={hdClass}>HD: { game.player.hardiness }</div>
          <div className={agClass}>AG: <span>{ game.player.agility * game.player.speed_multiplier}</span></div>
          <div className={chClass}>CH: { game.player.charisma }</div>
          {game.player.status_message ?
            <div className="status-text col-12">({game.player.status_message})</div> : ''}
        </div>

        <div className="weapon-abilities row no-gutters">
          <div className="axe col">Axe:<br />{ game.player.weapon_abilities[1]}%</div>
          <div className="bow col">Bow:<br />{ game.player.weapon_abilities[2]}%</div>
          <div className="club col">Club:<br />{ game.player.weapon_abilities[3]}%</div>
          <div className="spear col">Spear:<br />{ game.player.weapon_abilities[4]}%</div>
          <div className="sword col">Sword:<br />{ game.player.weapon_abilities[5]}%</div>
        </div>

        <div className="spell-abilities row no-gutters">
          <div className="col">Blast:<br/>{ game.player.spell_abilities.blast }%</div>
          <div className="col">Heal:<br/>{ game.player.spell_abilities.heal }%</div>
          <div className="col">Power:<br/>{ game.player.spell_abilities.power }%</div>
          <div className="col">Speed:<br/>{ game.player.spell_abilities.speed }%</div>
        </div>

        <div className="ae row">
          <div className="col">Armor expertise: { game.player.armor_expertise }%</div>
        </div>

        {game.player.weapon ? (
          <div className="weapon row">
            <div className="col">Ready weapon: { titleCase(game.player.weapon.name) }{' '}
            ({ game.player.weapon.dice }d{ game.player.weapon.sides })
            </div>
          </div>
        ) : (
          <div className="weapon none row"><div className="col">Ready weapon: none!</div></div>
        )}

        {armor.length > 0 && (
          <div className="armor row"><div className="col">Armor:&nbsp;
            {formatList(armor.map(a => titleCase(a.name)))}
            &nbsp;({ game.player.armor_class })
          </div></div>
        )}

        {game.player.armor_class === 0 && (
          <div className="armor none row"><div className="col">Armor: none!</div></div>
        )}

      </div>
    </div>

    <div className="status-widget room">
      {!inTheDark ? (
        <div>
          {/* onClick={toggleDesc()} */}
          <h3 className="heading">Current Location:</h3>
          <p className="room-name">{ game.rooms.current_room.name }</p>

          {/*   [class.hidden]="hiddenDesc" */}
          <ReactMarkdown className="room-description"
                         children={game.rooms.current_room.description}
                         rehypePlugins={[rehypeRaw]}/>
          <div className="room-exits">Visible Exits:&nbsp;
            {visible_exits.map((exit, index) => (
              <span key={index}>{exit.direction}&nbsp;</span>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {game.rooms.current_room.dark_description ? (
            <React.Fragment>
              <h3 className="heading">Current Location:</h3>
              <p className="room-name">{ game.rooms.current_room.dark_name }</p>
            </React.Fragment>
          ) : (
            <p className="room-name">Current Location: in the dark</p>
          )}
          {game.rooms.current_room.dark_description && (
            <ReactMarkdown className="room-description"
                           children={game.rooms.current_room.dark_description}
                           rehypePlugins={[rehypeRaw]}/>
          )}
        </div>
      )}
    </div>

    <div className="status-widget monsters">
      <h3 className="heading">Who's here:</h3>
      {!inTheDark && (
        <div className="monsters-list">
          {game.monsters.visible.map(monster => (
          <StatusMonster key={monster.id} monster={monster} />
          ))}
          {game.monsters.visible.length === 0 && (
            <span className="monster none">no one</span>
          )}
        </div>
      )}

      {/* special messages when it's dark */}
      {inTheDark && (
        <div className="monsters-list">
          {game.monsters.visible.length > 0 && (
            <span className="monster none">You hear movement but it's too dark to see.</span>
          )}
          {game.monsters.visible.length === 0 && (
            <span className="monster none">You think you're alone.</span>
          )}
        </div>
      )}
    </div>

    <div className="status-widget artifacts">
      <h3 className="heading">What's around:</h3>
      {!inTheDark && (
      <div className="artifacts-list">
        {game.artifacts.visible.map(artifact => (
          <StatusArtifact key={artifact.id} game={props.game} artifact={artifact} showArticle={true} />
        ))}
        {game.artifacts.visible.length === 0 && (
          <span className="artifact none">nothing<br/></span>
        )}
      </div>
      )}

      {/* special messages when it's dark */}
      {inTheDark && (
        <div className="monsters-list">
          <span className="artifact none">You can't make out any shapes in the dark.</span>
        </div>
      )}
    </div>

    <div className="status-widget inventory">

      <h3 className="heading">You are carrying:</h3>
      <div className="artifacts-list">
        {game.player.inventory.map(artifact => (
          <StatusArtifact key={artifact.id} game={props.game} artifact={artifact} />
        ))}
        {game.player.inventory.length === 0 && (
          <span className="artifact none">nothing<br/></span>
        )}
      </div>
      <p className="gold">{ game.player.getMoneyFormatted() }</p>
      <p className="weight">Weight carried: { game.player.weight_carried }/{ game.player.hardiness * 10 }</p>
    </div>

    </div>
  );
}

export default Status;

// some helper components

type StatusMonsterProps = {
  monster: Monster,
}

const StatusMonster: React.FC<StatusMonsterProps> = (props) => {
  const monster = props.monster;
  let className = "monster ";
  if (monster.reaction === Monster.RX_FRIEND) { className += "friendly" }
  if (monster.reaction === Monster.RX_HOSTILE) { className += "hostile" }

  const visible_children = monster.children.filter(m => m.isHere());
  const singular = monster.count === 1 || visible_children.length === 1;

  return (
    <div className={className}>
      {singular ?
        <span>{ monster.getDisplayName() }</span>
        :
        <span>{ visible_children.length } { monster.name_plural }</span>
      }{' '}
      - { monster.reaction }
    </div>
  );
}

type StatusArtifactProps = {
  game: Game,
  artifact: Artifact,
  showArticle?: boolean,
}

const StatusArtifact: React.FC<StatusArtifactProps> = (props) => {
  const artifact = props.artifact;
  const artifact_name = props.showArticle ? artifact.getDisplayName() : artifact.name;
  return (
    <div className="artifact">
      { artifact_name }&nbsp;
      <span className="artifact-status">
        {(artifact.type == 4 || artifact.type == 8) && (
          <span className="container-status">
            {artifact.is_open && (
              <span className="open">(open)</span>
            )}
            {!artifact.is_open && (
              <span className="closed">(closed)</span>
            )}
          </span>
          )}
      </span>
      {artifact.inventory_message && (
        <span className="custom">({ artifact.inventory_message })</span>
      )}

      {(artifact.is_lit && artifact.inventory_message == '') && (
        <span className="lit">(lit)</span>
      )}

      {(artifact.is_worn && artifact.inventory_message == '') && (
        <span className="worn">(wearing)</span>
      )}

      {artifact.id == props.game.player.weapon_id && (
        <span className="ready">(ready weapon)</span>
      )}

      {artifact.is_open && (
        <div>
          {artifact.contents.map(item => (
          <div className="artifact-contents" key={item.id}>{ item.getDisplayName() }</div>
            ))}
        </div>
        )}
    </div>
  );
}
