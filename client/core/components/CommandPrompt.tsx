import * as React from 'react';

class CommandPrompt extends React.Component<any, any> {
  public state = {
    command: '',
    last_command: '',
    ready: false,
    restore: false,
  };

  public handleChange = (event) => {
    const change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  };

  public handleKeyPress = (event) => {
    const game = this.props.game;

    // when the screen pause is active, don't type into the text box
    if (game.history.paused) {
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'Enter':
        if (!game.ready) { return; }

        let command = this.state.command;

        // if the user didn't type a new command, run the last command
        if (command.length === 0) {
          command = game.history.getLastCommand();
        }

        // start a new history entry
        game.ready = false;

        // run the command
        let result = game.command_parser.run(command);

        // clear the input box
        this.setState({ command: '', last_command: command });

        setTimeout(() => {
          this.props.setGameState(game);
        }, 25);

        break;
      case 'ArrowUp':
        // up arrow moves back through the history
        let prev_command = game.history.getOlderCommand();
        if (prev_command !== null) {
          this.setState({command: prev_command});
        }
        break;
      case 'ArrowDown':
        // down arrow moves forward through the history
        let next_command = game.history.getNewerCommand();
        if (next_command !== null) {
          this.setState({command: next_command});
        }
        break;
    }
    // other keys have no special function.
  };

  public showSaves = () => {
    this.setState({restore: true});
  };

  public startOver = () => {
    window.location.reload();
  };

  public exit = () => {
    const game = this.props.game;
    game.player.sellItems();
    this.props.setGameState(game);
  };

  public restoreSavedGame = (sv) => {
    let slot = parseInt(sv, 10);
    const game = this.props.game;
    game.restore(slot);
    game.tick();
    this.setState({restore: false});
    this.props.setGameState({game});
  };

  public hideSaves = () => {
    this.setState({restore: false});
  };

  public render() {
    const game = this.props.game;

    if (game.active) {
      return (
        <div className="form-inline">
          <div className="command-prompt form-group">
            <span className="prompt">Your Command:</span>
            <input name="command"
                   id="command"
                   type="text"
                   value={this.state.command}
                   onChange={this.handleChange}
                   onKeyDown={this.handleKeyPress}
                   className="form-control ml-2"
                   placeholder={this.state.last_command}
                   autoComplete="off"
                   autoFocus={true}
            />
          </div>
        </div>
      )
    }

    if (game.history.paused) {
      return <div />;
    }

    if (game.won) {
      return (
        <div className="return-button-container">
          <button className="btn btn-success" id="return" onClick={this.exit}>Return to Main Hall</button>
        </div>
      )
    }

    if (game.died && !this.state.restore) {
      return (
        <div className="return-button-container">
          <button className="btn btn-success mr-2" id="start_over" onClick={this.startOver}>Start Over</button>
          <button className="btn btn-success" id="restore" onClick={this.showSaves}>Restore a Saved Game</button>
        </div>
      )
    }

    if (game.died && this.state.restore) {
      return (
        <div className="return-button-container">
          {game.saves.map(sv => (
            <button key={sv.slot} className="btn btn-success" onClick={() => this.restoreSavedGame(sv)}>{sv}</button>
          ))}
          {game.saves.length === 0 && (
            <span>You have no saved games.</span>
          )}
          <button className="btn btn-success" onClick={this.hideSaves}>Cancel</button>
        </div>
      )
    }

    return (
      <div id="command-prompt">
        Something went wrong...
      </div>
    );
  }

}

export default CommandPrompt;
