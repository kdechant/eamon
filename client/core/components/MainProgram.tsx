import * as React from 'react';
import {gamevars, nl2br} from "../utils";
import axios from "axios";
import Game from "../models/game";

declare var game;

class MainProgram extends React.Component<any, any> {

  public constructor(props) {
    super(props);
    // the game object is created globally and gets added to the props here
    this.state = {
      game,
      uuid: window.localStorage.getItem('eamon_uuid')
    };
  }

  public componentDidMount() {
    const game: Game = this.state.game;
    if (game.slug === 'demo1') {
      let path = "/static/adventures/" + game.slug + "/mock-data";
      // TODO: special calls for loading mock data
    } else {
      let player_id = window.localStorage.getItem('player_id');

      // check if we're using mock or real player data
      let player_path = "/api/players/" + player_id + '.json?uuid=' + this.state.uuid;
      if (game.demo) {
        // playing a normal adventure with the demo player
        player_path = "/static/adventures/demo1/mock-data/player.json";
      }

      axios.all([
        axios.get("/api/adventures/" + game.slug),
        axios.get("/api/adventures/" + game.slug + "/rooms"),
        axios.get("/api/adventures/" + game.slug + "/artifacts"),
        axios.get("/api/adventures/" + game.slug + "/effects"),
        axios.get("/api/adventures/" + game.slug + "/monsters"),
        axios.get("/api/adventures/" + game.slug + "/hints"),
        axios.get(player_path)
      ])
      // Note: I tried using axios.spread as shown in the axios documentation but it seemed to hang
      // at the end of the callback. Just using regular callback instead.
       .then(responses => {
          game.init(responses[0].data, responses[1].data, responses[2].data, responses[3].data, responses[4].data, responses[5].data, responses[6].data);
          this.setState({game});
        });
    }

  };

  public render() {

    const game = this.state.game;

    if (!game || !game.player) {
      return (
        <div className="container-fluid" id="game">
          <div className="parchment">
            <div className="parchment-inner">
              Waking up the monsters...
            </div>
          </div>
        </div>
      );
    }

    // show the intro text, if the game has any, and the player hasn't seen it yet
    if (!game.started && game.intro_text) {
      return (
        <div className="container-fluid" id="game">
          <div className="parchment">
            <div className="parchment-inner">
              <p>{nl2br(gamevars(game.intro_text))}</p>
            </div>
          </div>
        </div>
      );
    }

    // the regular game engine
    return (
      <div className="container-fluid" id="game">
        <div className="parchment">
          <div className="parchment-inner">
            {game.name}
          </div>
        </div>
      </div>
    );
  }
}

export default MainProgram;
