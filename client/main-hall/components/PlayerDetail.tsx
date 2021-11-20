import * as React from 'react';
import {Route, Routes} from "react-router";
import axios from "axios";

import PlayerMenu from "./PlayerMenu";
import Player from "../models/player";
import AdventureList from "./AdventureList";
import Bank from "./Bank";
import Shop from "./Shop/Shop";
import Witch from "./Witch/Witch";
import Wizard from "./Wizard/Wizard";
import SavedGameTile from "./SavedGameTile";

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

    if (!this.state.player) {
      return <p>Loading...</p>;
    }

    if (this.state.player.saved_games.length > 0) {
      return (
      <div className="container-fluid" id="SavedGameList">
        <div className="row">
          <div className="col-sm">
            <h2>Continue Your Adventures</h2>
            <p>Welcome back, {this.state.player.name}! It looks like you were on an adventure the last time we saw you.
              Choose a saved game to restore:</p>
            <div className="container-fluid">
              <div className="row">
                {this.state.player.saved_games.map((sv, index) =>
                  <SavedGameTile key={index} savedGame={sv} player={this.state.player} setPlayerState={this.setPlayerState} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      );
    }

    return (
      <div className="container-fluid" id="PlayerDetail">
        <Routes>
          <Route path="hall" element={<PlayerMenu player={this.state.player}/>}/>
          <Route path="adventure" element={<AdventureList player={this.state.player}/>}/>
          <Route path="bank/*" element={<Bank player={this.state.player} setPlayerState={this.setPlayerState} />}/>
          <Route path="shop/*" element={<Shop player={this.state.player} setPlayerState={this.setPlayerState} />}/>
          <Route path="wizard" element={<Wizard player={this.state.player} setPlayerState={this.setPlayerState} />}/>
          <Route path="witch" element={<Witch player={this.state.player} setPlayerState={this.setPlayerState} />}/>
        </Routes>
      </div>
    );
  }
}

export default PlayerDetail;
