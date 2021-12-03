import * as React from "react";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import {PropsWithGame} from "../types";
import {useState} from "react";


const Question: React.FC<PropsWithGame> = (props) => {
  const [modalText, setModalText] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModalText(event.target.value);
  };

  const handleKeyPress = (event) => {
    const game = props.game;
    if (event.key === 'Enter') {
      game.modal.submit(modalText);
      props.setGameState(game);
    }
  };

  const handleMultipleChoiceKeyPress = (key: string, event: any) => {
    const game = props.game;
    const match = game.modal.current_question.hotkeys[key.toLowerCase()];
    if (match) {
      submitMultipleChoice(match);
    }
  };

  const submitText = (event) => {
    const game = props.game;
    game.modal.submit(modalText);
    prefillNextAnswer();
    props.setGameState(game);
  };

  const submitMultipleChoice = (choice) => {
    const game = props.game;
    game.modal.submit(choice);
    prefillNextAnswer();
    props.setGameState(game);
  };

  const prefillNextAnswer = () => {
    const game = props.game;
    // if showing another question (text type) and there's a preset answer, set it in the state
    if (game.modal.current_question.type === 'text' && game.modal.current_question.answer !== '') {
      setModalText(game.modal.current_question.answer);
    }
  };

  const game = props.game;

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
                    value={modalText}
                    className="form-control"
                    autoFocus={true}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
          /></p>
          <p><button className="btn btn-success" id="return" onClick={submitText}>Go</button></p>
        </div>
      )}
      {game.modal.current_question.type === 'multiple_choice' && (
      <div className="modal-multiple">
        <KeyboardEventHandler handleKeys={['alphanumeric']} handleEventType='keyup'
                              onKeyEvent={handleMultipleChoiceKeyPress} />
        {game.modal.current_question.choices.map((choice, index) => {
          const parts = game.modal.splitByHotkey(index);
          return (
            <button className="btn btn-primary" key={index}
                    onClick={() => submitMultipleChoice(choice)}>
              {parts[0]}<span className="hotkey">{parts[1]}</span>{parts[2]}
            </button>
          )
        })}
      </div>
      )}
    </div>
  );
}

export default Question;
