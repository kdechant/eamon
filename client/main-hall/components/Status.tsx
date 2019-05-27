import * as React from 'react';
import { ucFirst } from "../utils";

class Status extends React.Component<any, any> {

  public render() {

    if (!this.props.player) {
      return (
        <p>Loading...</p>
      )
    }

    // sort artifacts by type - weapons first, then armor
    let artifacts = this.props.player.inventory.sort((a, b) => {
      let typeA = a.type === 2 || a.type === 3 ? 2 : a.type;
      let typeB = b.type === 2 || b.type === 3 ? 2 : b.type;
      return typeA - typeB;
    });

    return (
      <div>
        <div className="status-widget player">
          <div className="container">
            <div className="row">
              <h3 className="heading">You are the { this.props.player.getGenderLabel() } { this.props.player.name }</h3>
            </div>

            <div className="stats row">
              <div className="col-3 hardiness">HD: { this.props.player.hardiness }</div>
              <div className="col-3 agility">AG: { this.props.player.agility }</div>
              <div className="col-3 charisma">CH: { this.props.player.charisma }</div>
            </div>

            <div className="weapon-abilities row">
              <div className="axe col-md">Axe:<br />{ this.props.player.wpn_axe }%</div>
              <div className="bow col-md">Bow:<br />{ this.props.player.wpn_bow }%</div>
              <div className="club col-md">Club:<br />{ this.props.player.wpn_club }%</div>
              <div className="spear col-md">Spear:<br />{ this.props.player.wpn_spear }%</div>
              <div className="sword col-md">Sword:<br />{ this.props.player.wpn_sword }%</div>
            </div>

            <div className="spell-abilities row">
              <div className="col-6 col-md">Blast:<br/>{ this.props.player.spell_abilities_original.blast }%</div>
              <div className="col-6 col-md">Heal:<br/>{ this.props.player.spell_abilities_original.heal }%</div>
              <div className="col-6 col-md">Power:<br/>{ this.props.player.spell_abilities_original.power }%</div>
              <div className="col-6 col-md">Speed:<br/>{ this.props.player.spell_abilities_original.speed }%</div>
            </div>

            <div className="ae row">
              <div className="col-sm-12">Armor expertise: { this.props.player.armor_expertise }%</div>
            </div>

            <div className="gold row">
              <div className="col-sm">Gold in hand: { this.props.player.gold }</div>
              <div className="col-sm">Gold in bank: { this.props.player.gold_in_bank }</div>
            </div>
          </div>

        </div>

      <div className="status-widget inventory">
        <h3 className="heading">Inventory</h3>

        <div className="container">
          {artifacts.length === 0 && <div className="row">No items</div>}

          {artifacts.map(artifact => {
            const icon_url = '/static/images/ravenmore/128/' + artifact.getIcon() + '.png';

            if (artifact.isWeapon()) {
              const odds = (artifact.weapon_odds > 0 ? "+" : "") + artifact.weapon_odds;
              return (
                <div key={artifact.uuid} className="row">
                  <div className="icon col-3 col-sm-2 px-0 px-sm-2"><img src={icon_url} width="48" height="48"/></div>
                  <div className="col-9 col-sm-9 px-0 px-sm-2">
                    <span className="artifact-name">{ucFirst(artifact.name)}</span><br />
                    <span className="artifact-info mr-4">{artifact.dice}d{artifact.sides}</span>
                    <span className="artifact-info">{odds}% to hit</span>
                  </div>
                </div>
              )
            }

            // otherwise, it's armor
            return (
              <div key={artifact.uuid} className="row">
                <div className="icon col-3 col-sm-2 px-0 px-sm-2"><img src={icon_url} width="48" height="48"/></div>
                <div className="col-9 col-sm-10 px-0 px-sm-2">
                  <span className="artifact-name">{ucFirst(artifact.name)}</span><br />
                  <span className="artifact-info mr-4">AC: {artifact.armor_class}</span>
                  <span className="artifact-info">Penalty: {artifact.armor_penalty}%</span>
                </div>
              </div>
            );
          }
          )}
        </div>

      </div>
    </div>
    );
  }
}

export default Status;
