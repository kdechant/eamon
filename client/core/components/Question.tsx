import * as React from "react";
import * as KeyboardEventHandler from 'react-keyboard-event-handler';

class Question extends React.Component<any, any> {
  public state = {
    modalText: ''
  };

  public handleChange = (event) => {
    const change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  };

  public handleKeyPress = (event) => {
    const game = this.props.game;
    if (event.key === 'Enter') {
      game.modal.submit(this.state.modalText);
      this.props.setGameState(game);
    }
  };

  public handleMultipleChoiceKeyPress = (key: string, event: any) => {
    const game = this.props.game;
    let match = game.modal.current_question.hotkeys[key.toLowerCase()];
    if (!!match) {
      this.submitMultipleChoice(match);
    }
  };

  public submitText = (event) => {
    const game = this.props.game;
    game.modal.submit(this.state.modalText);
    this.prefillNextAnswer();
    this.props.setGameState(game);
  };

  public submitMultipleChoice = (choice) => {
    const game = this.props.game;
    game.modal.submit(choice);
    this.prefillNextAnswer();
    this.props.setGameState(game);
  };

  public prefillNextAnswer = () => {
    const game = this.props.game;
    // if showing another question (text type) and there's a preset answer, set it in the state
    if (game.modal.current_question.type === 'text' && game.modal.current_question.answer !== '') {
      this.setState({modalText: game.modal.current_question.answer});
    }
  };

  render() {
    const game = this.props.game;

    if (!game.modal || !game.modal.current_question) {
      return <div>Error: modal didn't work.</div>
    }

    return (
      <div className="game-modal">
        <p>{game.modal.current_question.question}</p>
        {game.modal.current_question.type === 'text' && (
          <div className="modal-text">
            <p><input type="text"
                      name="modalText"
                      id="modalText"
                      value={this.state.modalText}
                      className="form-control"
                      autoFocus={true}
                      onChange={this.handleChange}
                      onKeyDown={this.handleKeyPress}
            /></p>
            <p><button className="btn btn-success" id="return" onClick={this.submitText}>Go</button></p>
          </div>
        )}
        {game.modal.current_question.type === 'multiple_choice' && (
        <div className="modal-multiple">
          <KeyboardEventHandler handleKeys={['alphanumeric']} handleEventType='keyup'
                                onKeyEvent={this.handleMultipleChoiceKeyPress} />
          {game.modal.current_question.choices.map((choice, index) => {
            let parts = game.modal.splitByHotkey(index);
            return (
              <button className="btn btn-primary" key={index}
                      onClick={() => this.submitMultipleChoice(choice)}>
                {parts[0]}<span className="hotkey">{parts[1]}</span>{parts[2]}
              </button>
            )
          })}
        </div>
        )}
      </div>
    );
  }
}

export default Question;
