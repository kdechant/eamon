import * as React from "react";

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

  public submitText = (event) => {
    const game = this.props.game;
    game.modal.submit(this.state.modalText);
    this.props.setGameState(game);
  };

  public submitMultipleChoice = (choice) => {
    const game = this.props.game;
    game.modal.submit(choice);
    this.props.setGameState(game);
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
          {game.modal.current_question.choices.map((choice, index) => (
            <button className="btn btn-primary" key={index}
                    onClick={() => this.submitMultipleChoice(choice)}>{choice}</button>
          ))}
        </div>
        )}
      </div>
    );
  }
}

export default Question;
