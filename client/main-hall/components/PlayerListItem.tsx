import * as React from "react";
import {Redirect} from "react-router";
import * as PropTypes from "prop-types";
import Player from "../models/player";
import { ucFirst } from "../utils";
import {getAxios} from "../utils/api";

class PlayerListItem extends React.Component<any, any> {
  static propTypes = {
    /** The player object */
    player: Player,
    /** A function to reload the player list (from PlayerList) */
    loadPlayers: PropTypes.func,
  };

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

  public deletePlayer = (player) => {
    if (confirm("Are you sure you want to delete " + player.name + "?")) {
      window.localStorage.setItem('player_id', null);
      const uuid = window.localStorage.getItem('eamon_uuid');
      const axios = getAxios();
      axios.delete("/players/" + player.id + '.json?uuid=' + uuid)
        .then(res => {
          this.props.loadPlayers();
        })
        .catch(err => {
           console.error("Error deleting player!");
         });
    }
  };

  public render() {

    if (this.state.ready === true) {
      return <Redirect to='/main-hall/hall' />
    }

    const weapon_name = this.state.player.best_weapon ? this.state.player.best_weapon.name : "";
    const icon_url = '/static/images/ravenmore/128/' + this.state.player.icon + '.png';

    return (
      <div className="player col-sm-6 col-md-4" key={this.state.player.id}>
        <div className="icon"><img src={icon_url} width="96" height="96"/></div>
        <div className="name"><a className="player_name" onClick={() => this.loadPlayer()}><strong>{this.state.player.name}</strong></a>
          <br/>
          HD: {this.state.player.hardiness} AG: {this.state.player.agility} CH: {this.state.player.charisma} <br/>
          {ucFirst(weapon_name)}</div>
        <div className="delete"><button className="btn btn-link" onClick={() => this.deletePlayer(this.state.player)}><img src="/static/images/ravenmore/128/x.png" title="delete" /></button></div>
      </div>
    );
  }
}

export default PlayerListItem;
