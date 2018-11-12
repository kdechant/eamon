import * as React from 'react';
import {Route} from "react-router";
import PlayerMenu from "./PlayerMenu";
import {Player} from "../models/player";
import axios from "axios";
import AdventureList from "./AdventureList";
import Shop from "./Shop";
import Wizard from "./Wizard/Wizard";
import Witch from "./Witch/Witch";

class PlayerDetail extends React.Component {
  public state: any = {
    player: null,
    player_id: null,
    uuid: ""
  };

  public setPlayerState = (player: Player) => {
    this.setState({ player });
  };

  public componentDidMount() {
    this.setState(
      {
        uuid: window.localStorage.getItem('eamon_uuid'),
        player_id: window.localStorage.getItem('player_id')
      },
      () => {
        // get the player from the API
        axios.get('/api/players/' + this.state.player_id + '.json?uuid=' + this.state.uuid)
          .then(res => {
            const player = new Player();
            player.init(res.data);
            player.update();
            this.setState({player});
          });
      });
  }

  public render() {
    // TODO: show the saved game list here...
    return (
      <div className="container-fluid" id="PlayerDetail">
        <Route path="/main-hall/hall" render={(props) => (
          <PlayerMenu {...props} player={this.state.player}/>
        )}/>
        <Route path="/main-hall/adventure" render={(props) => (
          <AdventureList {...props} player={this.state.player}/>
        )}/>
        <Route path="/main-hall/shop" render={(props) => (
          <Shop {...props} player={this.state.player} setPlayerState={this.setPlayerState} />
        )}/>
        <Route path="/main-hall/wizard" render={(props) => (
          <Wizard {...props} player={this.state.player} setPlayerState={this.setPlayerState} />
        )}/>
        <Route path="/main-hall/witch" render={(props) => (
          <Witch {...props} player={this.state.player} setPlayerState={this.setPlayerState} />
        )}/>
      </div>
    );
  }
}

export default PlayerDetail;
