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
    switch (event.key) {
      case 'Enter':
        if (!game.ready) return;

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

        // TODO: investigate this to fix the history delay
        // setTimeout(() => {
        //   this.props.setGameState(game);
        //   this.setState({ready: true});
        // }, game.history.total_delay);

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
    // TODO: implement this
    console.log('exit');
  };

  public render() {
    const game = this.props.game;

    if (game.active) {
      return (
        <div className="form-inline">
          <div className="command-prompt form-group">
            <span className="prompt">Your Command: </span>
            <input name="command"
                   type="text"
                   value={this.state.command}
                   onChange={this.handleChange}
                   onKeyUp={this.handleKeyPress}
                   className="form-control"
                   placeholder={this.state.last_command}
                   autoComplete="off"
            />
          </div>
        </div>
      )
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
          TODO: reimplement the saved game feature
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
