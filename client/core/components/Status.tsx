import * as React from 'react';
import {titleCase} from "../../main-hall/utils";
import {Monster} from "../models/monster";

class Status extends React.Component<any, any> {

  public render() {
    const game = this.props.game;
    
    if (!game || !game.player) {
      return <div>Loading...</div>
    }

    const inTheDark = game.rooms.current_room.is_dark && !game.artifacts.isLightSource();
    let agilityClass = "agility col-sm-2";

    if (game.player.speed_multiplier > 1) { agilityClass += " success" }

    return (
      <div className="status d-none d-md-block col-md-5">
      <div className="status-widget player">
        <div className="container">
          <div className="row">
            <p className="heading">{game.player.name}</p>
          </div>

          <div className="stats row">
            <div className="hardiness col-sm-2">HD: { game.player.hardiness }</div>
            <div className={agilityClass}>AG: <span>{ game.player.agility * game.player.speed_multiplier}</span></div>
            <div className="charisma col-sm-2">CH: { game.player.charisma }</div>
            <div className="charisma col-sm-5 text-right">HP: { game.player.hardiness - game.player.damage }/{ game.player.hardiness }</div>
          </div>

          <div className="weapon-abilities row">
            <div className="axe col-sm-2">Axe: { game.player.weapon_abilities[1]}%</div>
            <div className="bow col-sm-2">Bow: { game.player.weapon_abilities[2]}%</div>
            <div className="club col-sm-2">Club: { game.player.weapon_abilities[3]}%</div>
            <div className="spear col-sm-2">Spear: { game.player.weapon_abilities[4]}%</div>
            <div className="sword col-sm-2">Sword: { game.player.weapon_abilities[5]}%</div>
          </div>

          <div className="ae row">Armor expertise: { game.player.armor_expertise }%</div>

          {game.player.weapon && (
          <div className="weapon row">Ready weapon: { titleCase(game.player.weapon.name) }&nbsp;
            ({ game.player.weapon.dice }d{ game.player.weapon.sides })
          </div>
          )}

          {!game.player.weapon && (
          <div className="weapon none row">Ready weapon: none!</div>
          )}

          {game.player.armor_class && (
            <div className="armor row">Armor:&nbsp;
              {game.player.armor_worn.map(armor => titleCase(armor.name)).join(" and ")}
              &nbsp;({ game.player.armor_class })
            </div>
          )}

          {game.player.armor_class === 0 && (
            <div className="armor none row">Armor: none!</div>
          )}

        </div>
      </div>
        
      <div className="status-widget room">
        {!inTheDark && (
          <div>
            {/* onClick={this.toggleDesc()} */}
            <p className="room-name">Current Location: { game.rooms.current_room.name }</p>

          {/*   [class.hidden]="hiddenDesc" */}
            <p className="room-description">{ game.rooms.current_room.description }</p>
            <div className="room-exits">Visible Exits:&nbsp;
              {game.rooms.current_room.exits.map((exit, index) => (
                <span key={index}>{exit.direction}&nbsp;</span>
              ))}
            </div>
          </div>
        )}
        {inTheDark && (
          <div>
            <p className="room-name">Current Location: in the dark</p>
          </div>
        )}
      </div>

      <div className="status-widget monsters">
        <p className="heading">Who's here:</p>
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
            {game.monsters.visible.length && (
              <span className="monster none">You hear movement but it's too dark to see.</span>
            )}
            {game.monsters.visible.length === 0 && (
              <span className="monster none">You think you're alone.</span>
            )}
          </div>
        )}
      </div>

      <div className="status-widget artifacts">
        <p className="heading">What's around:</p>
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
        <p className="heading">You are carrying:</p>
        <div className="artifacts-list">
          {game.player.inventory.map(artifact => (
            <StatusArtifact key={artifact.id} game={this.props.game} artifact={artifact} />
          ))}
          {game.player.inventory.length === 0 && (
            <span className="artifact none">nothing<br/></span>
          )}
        </div>
        <p className="weight">Weight carried: { game.player.weight_carried }/{ game.player.hardiness * 10 }</p>
        <p className="gold">Gold: { game.player.gold }</p>
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
    if (monster.reaction === Monster.RX_FRIEND) { className += "friend" }
    if (monster.reaction === Monster.RX_HOSTILE) { className += "hostile" }

    return (
      <div className={className}>
        {monster.count === 1 && (
        <span>{ monster.name }</span>
        )}
        {monster.count > 1 && (
        <span>{ monster.count } { monster.name }s</span>
        )}{' '}
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
        { artifact.name }&nbsp;
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

        {artifact.id == this.props.game.player.weapon_id && (
          <span className="ready">(ready weapon)</span>
        )}

        {artifact.is_open && (
          <div>
            {artifact.contents.map(item => (
            <div className="artifact-contents" key={item.id}>{ item.name }</div>
              ))}
          </div>
          )}
      </div>
    );

  }
}
