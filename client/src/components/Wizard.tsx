import * as React from 'react';
import {Link} from 'react-router-dom';
import { titleCase, percentOrNone } from "../utils";
import diceRoll from "../utils/dice";

class Wizard extends React.Component<any, any> {
  public state = {
    spells: [
      {
        'name': "blast",
        'description': "Damages one enemy. Can also be used to break open some doors and chests.",
        'price': 1000,
      },
      {
        'name': "heal",
        'description': "Heals you or a friend.",
        'price': 500
      },
      {
        'name': "power",
        'description': "Has an unpredictable effect which is different in every adventure. Common effects include teleportation, healing, causing earthquakes, or even resurrecting monsters.",
        'price': 100
      },
      {
        'name': "speed",
        'description': "Doubles your agility for a time, making you a better fighter.",
        'price': 4000
      },
    ],
    messages: {
      blast: '',
      heal: '',
      power: '',
      speed: '',
    }
  };

  public buy = (spell: any) => {
    const player = this.props.player;
    const original_ability = player.spell_abilities_original[spell.name];
    const possible_increase = 100 - original_ability;
    player.spell_abilities_original[spell.name] += Math.floor(
      possible_increase / 4 + diceRoll(1, possible_increase / 2));
    player.gold -= spell.price;
    this.props.setPlayerState(player);  // persist the data up to the parent component

    const messages = {...this.state.messages};
    messages[spell.name] = original_ability === 0 ? "Learned" : "Increased!";
    setTimeout(() => {
      const msgs = {...this.state.messages};
      msgs[spell.name] = '';
      this.setState({messages: msgs});
    }, 2000);
    this.setState({messages});
  };

  public render() {

    if (!this.props.player) {
      return <p>Loading...</p>
    }

    return (
      <div className="wizard-shop">
        <h2><img src="/static/images/ravenmore/128/tome.png" />Hokas Tokas' School of Magick</h2>
        <p>After a few minutes of diligent searching, you find Hokas Tokas, the old Mage. He looks at you and says, &quot;So you want old Hokey to teach you some magic, eh? Well, it'll cost you. Here are the spells I teach. Which will it be?&quot;</p>
        <table className="table spells-list">
          <tr className="d-flex">
            <th className="col-sm-4 col-md-6 col-xl-8">Spell</th>
            <th className="col-sm-3 col-md-2 col-xl-2 text-center">Current Ability<br />
              <span className="small">Odds to cast successfully</span>
            </th>
            <th className="col-sm-3 col-md-2 col-xl-1 text-center">Price</th>
            <th className="col-sm-2 col-md-2 col-xl-1" />
          </tr>
          {this.state.spells.map(spell => {
              let button = <button className="btn disabled">Not enough gold</button>;
              if (this.props.player.gold >= spell.price) {
                if (this.props.player.spell_abilities_original[spell.name] > 90) {
                  button = <button className="btn disabled">Maxed Out!</button>;
                } else {
                  button = <button className="btn btn-primary" onClick={() => this.buy(spell)}>
                    {this.props.player.spell_abilities_original[spell.name] > 0 ? "Upgrade" : "Learn"}
                  </button>
                }
              }

              return (
            <tr className="d-flex" key={spell.name}>
              <td className="col-sm-4 col-md-6 col-xl-8"><strong>{ titleCase(spell.name) }</strong><br />
                <span className="small">{ spell.description }</span></td>
              <td className="col-sm-3 col-md-2 col-xl-2 text-center">
                <span className="current-ability">
                  { percentOrNone(this.props.player.spell_abilities_original[spell.name]) }
                  { this.state.messages[spell.name]
                    ? <div className="message">{this.state.messages[spell.name]}</div>
                    : ""
                  }
                </span>
                </td>
              <td className="col-sm-3 col-md-2 col-xl-1 text-center">
                <img src="/static/images/ravenmore/128/coin.png" /> { spell.price }
              </td>
              <td className="col-sm-2 col-md-2 col-xl-1 text-right">
                {button}
              </td>
            </tr>
              );
            }
          )}
        </table>
    
        <Link to="/main-hall/hall" className="btn btn-primary">Done</Link>
      </div>
    );

  }

}

export default Wizard;
