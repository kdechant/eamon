import * as React from 'react';
import { ucFirst } from "../../utils";

class ArtifactTile extends React.Component<any, any> {
  public state: any = {
    message: "",
  };

  public buy = () => {
    this.setState({message: "Bought!"});
    setTimeout(() => {
      this.setState({message: ""});
      let player = this.props.player;
      player.inventory.push(this.props.artifact);
      player.gold -= this.props.artifact.value;
      this.props.setPlayerState(player);
      this.props.removeItem(this.props.artifact);
    }, 1200);
  };

  public sell = () => {
    this.setState({message: "Sold!"});
    setTimeout(() => {
      let player = this.props.player;
      let index = player.inventory.indexOf(this.props.artifact);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }
      player.gold += Math.floor(this.props.artifact.value / 2);
      this.props.setPlayerState(player);
      }, 1200);
  };

  public render() {
    const icon_url = '/static/images/ravenmore/128/' + this.props.artifact.getIcon() + '.png';

    let stats = <span />;
    if (this.props.artifact.isWeapon()) {
      stats = (
        <div>
          To Hit: { this.props.artifact.weapon_odds }%<br />
          Damage: { this.props.artifact.dice } d { this.props.artifact.sides }<br />
        </div>
      );
    } else {
      stats = (
        <div>
          AC: { this.props.artifact.armor_class }<br />
          Penalty: { this.props.artifact.armor_penalty }%<br />
        </div>
      );
    }

    let value = this.props.action === "buy" ? this.props.artifact.value : Math.floor(this.props.artifact.value / 2);

    let button = <button className="btn disabled">Not enough gold</button>;
    if (this.props.action === "buy" && this.props.player.gold >= this.props.artifact.value) {
      button = <button className="btn btn-primary" onClick={this.buy}>Buy</button>
    } else if (this.props.action === 'sell') {
      button = <button className="btn btn-primary" onClick={this.sell}>Sell</button>
    }

    const messageStyle = {
      "opacity": this.state.message === "" ? 0 : 1
    };

    return (
      <div className="artifact-tile col-sm-6 col-md-4 col-lg-3">
        <div className="artifact-tile-inner">
          <div className="artifact-icon">
            <img src={icon_url} title={ this.props.artifact.getTypeName() } alt={ this.props.artifact.getTypeName() } />
          </div>
          <div className="artifact-name">
            <strong>{ ucFirst(this.props.artifact.name) }</strong><br />
          </div>
          <div className="artifact-data">
            {stats}
            <img src="/static/images/ravenmore/128/coin.png" title="gold coin" alt="gold coin" /> {value}
          </div>
          <div className="artifact-buttons">
            {button}
          </div>
          <div className="message" style={messageStyle}>
            { this.state.message }
          </div>
        </div>
      </div>
    );
  }
}

export default ArtifactTile;
