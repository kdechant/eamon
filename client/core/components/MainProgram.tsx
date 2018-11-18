import * as React from 'react';
import {gamevars, nl2br} from "../utils";

declare var game;

class MainProgram extends React.Component<any, any> {

  public constructor(props) {
    super(props);
    // the game object is created globally and gets added to the props here
    this.state = {game};
  }

  public render() {

    const game = this.state.game;

    if (!game.player) {
      return <div>Waking up the monsters...</div>
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
