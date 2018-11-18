import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import { titleCase } from "../../utils";

class AttributeRow extends React.Component<any, any> {
  // props:
  // - attribute {name: string, description: string}
  // - player

  public state = {
    // whether the success message is visible or hidden
    messageVisible: false,
    // count of how much the stat was increased
    increased: 1,
    // a reference to the timer object, in case the user clicks repeatedly
    timer: undefined,
  };

  public buy = () => {
    const player = this.props.player;
    player.gold -= this.getPrice();
    switch (this.props.attribute.name) {
      case 'hardiness':
        player.hardiness++;
        break;
      case 'agility':
        player.agility++;
        break;
      case 'charisma':
        player.charisma++;
        break;
    }
    this.props.setPlayerState(player);  // persist the data up to the parent component

    // show the success message, and hide it after a couple seconds
    const timer = setTimeout(() => {
      this.setState({messageVisible: false, increased: 1, timer: undefined});
    }, 2000);
    if (this.state.timer) {
      // in case the user clicked multiple times, we want the message to stay
      // visible for the full time after the *last* click
      clearTimeout(this.state.timer);
    }
    // this is the number of times they have clicked in a row (e.g., +1, +2, etc.)
    // (it resets once the message banner disappears)
    let increased = this.state.increased;
    if (this.state.messageVisible) {
      increased++;
    }

    this.setState({messageVisible: true, increased, timer});
  };

  public getPrice = () => {
    let base = this.props.player[this.props.attribute.name];
    return Math.round(Math.pow(base, 3) / 100) * 100;
  };

  public render() {
    let button = <button className="btn disabled">Not enough gold</button>;
    if (this.props.player.gold >= this.getPrice()) {
      button = <button className="btn btn-primary" onClick={() => this.buy()}>Upgrade</button>
    }

    return (
      <tr className="d-flex" key={this.props.attribute.name}>
        <td className="col-sm-4 col-md-6 col-xl-8"><strong>{ titleCase(this.props.attribute.name) }</strong><br />
          <span className="small">{ this.props.attribute.description }</span></td>
        <td className="col-sm-3 col-md-2 col-xl-2 text-center attribute-cell">
          <div className="current-ability">
            { this.props.player[this.props.attribute.name] }
          </div>
          <CSSTransition
            in={this.state.messageVisible}
            timeout={300}
            classNames={"message"}
            unmountOnExit={true}
          >
            {animationState => <div className="message-inner">+{this.state.increased}</div>}
          </CSSTransition>
        </td>
        <td className="col-sm-3 col-md-2 col-xl-1 text-center">
          <img src="/static/images/ravenmore/128/coin.png" /> { this.getPrice() }
        </td>
        <td className="col-sm-2 col-md-2 col-xl-1 text-right">
          {button}
        </td>
      </tr>
    )
  }

}

export default AttributeRow;
