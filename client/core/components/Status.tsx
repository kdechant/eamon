import * as React from 'react';
import * as ReactMarkdown from "react-markdown";
import * as pluralize from 'pluralize';
import {titleCase} from "../../main-hall/utils";
import {Monster} from "../models/monster";

class Status extends React.Component<any, any> {

  public render() {
    const game = this.props.game;

    if (!game || !game.player) {
      return <div>Loading...</div>
    }

    const inTheDark = game.rooms.current_room.is_dark && !game.artifacts.isLightSource();
    let agilityClass = "agility col-4";

    if (game.player.speed_multiplier > 1) { agilityClass += " success" }

    // visible exits (normal exits and ones with non-hidden doors)
    const visible_exits = game.rooms.current_room.getVisibleExits();

    let worn = game.player.inventory.filter(a => a.is_worn);
    let carried = game.player.inventory.filter(a => !a.is_worn);

    // console.log('status open?', this.props.open)
    let statusClass = this.props.open ? '' : 'd-none';

    return (
      <div className={`status ${statusClass} d-md-block col-md-5`}>
      <div className="status-widget player-stats">
        <div className="container">
          <div className="row">
            <h3 className="heading col-8">{game.player.name}</h3>
            <div className="hp col-4 text-right">HP: { game.player.hardiness - game.player.damage }/{ game.player.hardiness }</div>
          </div>

          <div className="stats row no-gutters">
            <div className="hardiness col-4">HD: { game.player.hardiness }</div>
            <div className={agilityClass}>AG: <span>{ game.player.agility * game.player.speed_multiplier}</span></div>
            <div className="charisma col-4">CH: { game.player.charisma }</div>
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

          {game.player.armor_class > 0 && (
            <div className="armor row"><div className="col">Armor:&nbsp;
              {game.player.armor_worn.map(armor => titleCase(armor.name)).join(" and ")}
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
            {/* onClick={this.toggleDesc()} */}
            <h3 className="heading">Current Location:</h3>
            <p className="room-name">{ game.rooms.current_room.name }</p>

            {/*   [class.hidden]="hiddenDesc" */}
            <ReactMarkdown className="room-description"
                           source={game.rooms.current_room.description}
                           escapeHtml={false}/>
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
                 source={game.rooms.current_room.dark_description}
                 escapeHtml={false}/>
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
            <StatusArtifact key={artifact.id} game={this.props.game} artifact={artifact} />
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
        {worn.length && (
          <React.Fragment>
            <h3 className="heading">You are wearing:</h3>
            <div className="artifacts-list mb-2">
              {worn.map(artifact => (
                <StatusArtifact key={artifact.id} game={this.props.game} artifact={artifact} />
              ))}
            </div>
          </React.Fragment>
        )}
        <h3 className="heading">You are carrying:</h3>
        <div className="artifacts-list">
          {carried.map(artifact => (
            <StatusArtifact key={artifact.id} game={this.props.game} artifact={artifact} />
          ))}
        </div>
        <p className="gold">{ game.player.getMoneyFormatted() }</p>
        <p className="weight">Weight carried: { game.player.weight_carried }/{ game.player.hardiness * 10 }</p>
      </div>

      </div>
    );
  }

}

export default Status;

// some helper components
class StatusMonster extends React.Component<any, any> {
  public render() {
    let monster = this.props.monster;
    let className = "monster ";
    if (monster.reaction === Monster.RX_FRIEND) { className += "friendly" }
    if (monster.reaction === Monster.RX_HOSTILE) { className += "hostile" }

    let visible_children = monster.children.filter(m => m.isHere());
    let singular = monster.count === 1 || visible_children.length === 1;

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
}

class StatusArtifact extends React.Component<any, any> {
  public render() {
    let artifact = this.props.artifact;

    return (
      <div className="artifact">
        { artifact.article } { artifact.name }&nbsp;
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

        {artifact.id == this.props.game.player.weapon_id && (
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
}
