import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import { titleCase, percentOrNone } from "../../utils";
import diceRoll from "../../utils/dice";

class SpellListRow extends React.Component<any, any> {
  public state = {
    message: "",
    messageVisible: false,
  };

  public buy = (spell: any) => {
    const player = this.props.player;
    const original_ability = player.spell_abilities_original[spell.name];
    const possible_increase = 100 - original_ability;
    player.spell_abilities_original[spell.name] += Math.floor(
      possible_increase / 4 + diceRoll(1, possible_increase / 2));
    player.gold -= spell.price;
    this.props.setPlayerState(player);  // persist the data up to the parent component

    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 2000);
    this.setState({message: original_ability === 0 ? "Learned" : "Increased!", messageVisible: true});
  };

  public render() {
    let button = <button className="btn disabled">Not enough gold</button>;
    if (this.props.player.gold >= this.props.spell.price) {
      if (this.props.player.spell_abilities_original[this.props.spell.name] > 90) {
        button = <button className="btn disabled">Maxed Out!</button>;
      } else {
        button = <button className="btn btn-primary" onClick={() => this.buy(this.props.spell)}>
          {this.props.player.spell_abilities_original[this.props.spell.name] > 0 ? "Upgrade" : "Learn"}
        </button>
      }
    }

    return (
      <tr className="d-flex" key={this.props.spell.name}>
        <td className="col-sm-4 col-md-6 col-xl-8"><strong>{ titleCase(this.props.spell.name) }</strong><br />
          <span className="small">{ this.props.spell.description }</span></td>
        <td className="col-sm-3 col-md-2 col-xl-2 text-center">
          <span className="current-ability">
            { percentOrNone(this.props.player.spell_abilities_original[this.props.spell.name]) }
            <CSSTransition
              in={this.state.messageVisible}
              timeout={500}
              classNames={"message"}
              unmountOnExit={true}
            >
              {animationState => <div className="message-inner">{this.state.message}</div>}
            </CSSTransition>
          </span>
          </td>
        <td className="col-sm-3 col-md-2 col-xl-1 text-center">
          <img src="/static/images/ravenmore/128/coin.png" /> { this.props.spell.price }
        </td>
        <td className="col-sm-2 col-md-2 col-xl-1 text-right">
          {button}
        </td>
      </tr>
    )
  }

}

export default SpellListRow;
