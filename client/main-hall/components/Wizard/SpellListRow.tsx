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
    let button = <button className="btn bnt-light disabled align-middle">Not enough gold</button>;
    if (this.props.player.gold >= this.props.spell.price) {
      if (this.props.player.spell_abilities_original[this.props.spell.name] > 90) {
        button = <button className="btn bnt-light disabled align-middle">Maxed Out!</button>;
      } else {
        button = <button className="btn btn-primary align-middle" onClick={() => this.buy(this.props.spell)}>
          {this.props.player.spell_abilities_original[this.props.spell.name] > 0 ? "Upgrade" : "Learn"}
        </button>
      }
    }

    return (
      <div className="spell-list-row row h-100" key={this.props.spell.name}>
        <div className="col-12 col-sm-4 col-md-6 mb-2">
          <h3>{ titleCase(this.props.spell.name) }</h3>
          <span className="small">{ this.props.spell.description }</span>
        </div>
        <div className="col-4 col-sm-3 col-md-2 text-center my-auto">
          Current Ability: { percentOrNone(this.props.player.spell_abilities_original[this.props.spell.name]) }
          <CSSTransition
            in={this.state.messageVisible}
            timeout={500}
            classNames={"message"}
            unmountOnExit={true}
          >
            {animationState => <div className="message-inner">{this.state.message}</div>}
          </CSSTransition>
          </div>
        <div className="col-4 col-sm-3 col-md-2 text-center my-auto">
          <img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" className="icon-md" /> { this.props.spell.price }
        </div>
        <div className="col-4 col-sm-2 col-md-2 text-center my-auto">
          {button}
        </div>
      </div>
    )
  }

}

export default SpellListRow;
