import * as React from 'react';
import Game from "../models/game";
import {gamevars} from "../utils";

declare var game: Game;

class IntroText extends React.Component<any, any> {
  public state = {
    index: 0,
    introAnswer: "",
  };

  public intro_next = () => {
    this.setState({index: this.state.index + 1});
  };

  public handleChange = (event) => {
    const change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  };

  public startGame = () => {
    const game = this.props.game;
    game.start();
    this.props.setGameState(game);
  };

  public render() {
    const game = this.props.game;
    return (
      <div id="intro-text">
        <p>{gamevars(game.intro_text[this.state.index]).split('\n').map((item, key) => {
          return <span key={key}>{item}<br/></span>
        })}</p>
        {this.state.index < game.intro_text.length - 1 && (
        <p className="intro-next">
          <button className="btn btn-success" id="intro-next" onClick={this.intro_next}>Next</button>
      </p>
        )}
        {this.state.index === game.intro_text.length - 1 && (
          <div className="intro-start">

            {game.intro_question && (
              <div className="intro-question">
                {game.intro_question}
                <input type="text" id="introAnswer" name="introAnswer" onChange={this.handleChange} />
              )}
              </div>
            )}

            <div className="intro-confirm">
              <p><button className="btn btn-success" id="return" onClick={this.startGame}>Start Adventure</button></p>
            </div>

          </div>
        )}
      </div>
    );
  }

}

export default IntroText;
