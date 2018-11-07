import * as React from 'react';

class Status extends React.Component<any, any> {

  public render() {

    if (!this.props.player) {
      return (
        <p>Loading...</p>
      )
    }

    return (
      <div>
        <div className="status-widget player">
          <div className="container">
            <div className="row">
              <p className="heading">You are the { this.props.player.getGenderLabel() } { this.props.player.name }</p>
            </div>

            <div className="stats row">
              <div className="col-3 hardiness">HD: { this.props.player.hardiness }</div>
              <div className="col-3 agility">AG: { this.props.player.agility }</div>
              <div className="col-3 charisma">CH: { this.props.player.charisma }</div>
            </div>

            <div className="spell-abilities row">
              <div className="axe col-sm-3">Blast:<br/> { this.props.player.spell_abilities_original.blast }%</div>
              <div className="bow col-sm-3">Heal:<br/> { this.props.player.spell_abilities_original.heal }%</div>
              <div className="club col-sm-3">Power:<br/> { this.props.player.spell_abilities_original.power }%</div>
              <div className="spear col-sm-3">Speed:<br/> { this.props.player.spell_abilities_original.speed }%</div>
            </div>

            <div className="weapon-abilities row">
              <div className="axe col-sm-2">Axe: { this.props.player.wpn_axe }%</div>
              <div className="bow col-sm-2">Bow: { this.props.player.wpn_bow }%</div>
              <div className="club col-sm-2">Club: { this.props.player.wpn_club }%</div>
              <div className="spear col-sm-2">Spear: { this.props.player.wpn_spear }%</div>
              <div className="sword col-sm-2">Sword: { this.props.player.wpn_sword }%</div>
            </div>

            <div className="ae row">
              <div className="col-sm-12">Armor expertise: { this.props.player.armor_expertise }%</div>
            </div>

            <div className="gold row">
              <div className="col-sm-6">Gold in hand: { this.props.player.gold }</div>
              <div className="col-sm-6">Gold in bank: { this.props.player.gold_in_bank }</div>
            </div>
          </div>

        </div>

      <div className="status-widget inventory">
        <p className="heading">Inventory</p>

        <div className="container">
          {this.props.player.inventory.map(artifact => {
            const icon_url = '/static/images/ravenmore/128/' + artifact.getIcon() + '.png';

            if (artifact.isWeapon()) {
              const odds = (artifact.weapon_odds > 0 ? "+" : "") + artifact.weapon_odds;
              return (
                <div key={artifact.id} className="row">
                  <div className="icon col-sm-2"><img src={icon_url} width="48" height="48"/></div>
                  <div className="col-sm-10">
                    <span className="artifact-name">{artifact.name}</span><br />
                    <span className="artifact-info">{artifact.dice}d{artifact.sides}, {odds}% to hit</span>
                  </div>
                </div>
              )
            }

            // otherwise, it's armor
            return (
              <div key={artifact.id} className="row">
                <div className="icon col-sm-2"><img src={icon_url} width="48" height="48"/></div>
                <div className="col-sm-10">
                  <span className="artifact-name">{artifact.name}</span><br />
                  <span className="artifact-info">AC: {artifact.armor_class} Penalty: {artifact.armor_penalty}%</span>
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
