import * as React from "react";
import {Redirect} from "react-router";
import { ucFirst } from "../utils";

class PlayerListItem extends React.Component<any, any> {
  constructor(props: any){
    super(props);
    this.state = {
      player: this.props.player,
      ready: false
    };
  }

  public loadPlayer = () => {
    window.localStorage.setItem('player_id', this.state.player.id);
    this.setState({ready: true});
  };

  public render() {

    if (this.state.ready === true) {
      return <Redirect to='/main-hall/hall' />
    }

    const weapon_name = this.state.player.best_weapon ? this.state.player.best_weapon.name : "";
    const icon_url = '/static/images/ravenmore/128/' + this.state.player.icon + '.png';

    return (
      <div className="player col-sm-4" key={this.state.player.id}>
        <div className="icon"><img src={icon_url} width="96" height="96"/></div>
        <div className="name"><a className="player_name" onClick={() => this.loadPlayer()}><strong>{this.state.player.name}</strong></a>
          <br/>
          HD: {this.state.player.hardiness} AG: {this.state.player.agility} CH: {this.state.player.charisma} <br/>
          {ucFirst(weapon_name)}</div>
        <div className="delete"><a><span className="glyphicon glyphicon-trash"/></a></div>
      </div>
    );
  }
}

export default PlayerListItem;
