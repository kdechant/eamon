import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import Game from "../models/game";
import {gamevars} from "../utils";

declare let game: Game;

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
    if (game.intro_question) {
      game.intro_answer = this.state.introAnswer;
    }
    game.start();
    this.props.setGameState(game);
  };

  public render() {
    const game = this.props.game;
    return (
      <div id="intro-text">
        <ReactMarkdown source={gamevars(game.intro_text[this.state.index])} escapeHtml={false} />
        {this.state.index < game.intro_text.length - 1 && (
        <p className="intro-next">
          <button className="btn btn-success" id="intro-next" onClick={this.intro_next}>Next</button>
        </p>
        )}
        {this.state.index === game.intro_text.length - 1 && (
          <div className="intro-start">

            {game.intro_question && (
              <p className="intro-question">
                {game.intro_question}{' '}
                <input type="text" id="introAnswer" name="introAnswer" autoFocus={true} onChange={this.handleChange} />
              </p>
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
