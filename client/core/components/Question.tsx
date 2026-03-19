import { useEffect, useState } from "react";
import type { PropsWithGame } from "../types";

const Question = (props: PropsWithGame) => {
  const [modalText, setModalText] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModalText(event.target.value);
  };

  const handleKeyPress = (event) => {
    const game = props.game;
    if (event.key === "Enter") {
      game.modal.submit(modalText);
      props.setGameState(game);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Not fixing this now.
  useEffect(() => {
    if (game.modal.current_question.type === "multiple_choice") {
      document.addEventListener("keypress", handleMultipleChoiceKeyPress);
    }
    return () => {
      document.removeEventListener("keypress", handleMultipleChoiceKeyPress);
    };
  }, []);

  const handleMultipleChoiceKeyPress = (event) => {
    event.preventDefault();
    const game = props.game;
    const match = game.modal.current_question.hotkeys[event.key.toLowerCase()];
    if (match) {
      submitMultipleChoice(match);
    }
  };

  const submitText = () => {
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
    if (game.modal.current_question.type === "text" && game.modal.current_question.answer !== "") {
      setModalText(game.modal.current_question.answer);
    }
  };

  const game = props.game;

  if (!game.modal || !game.modal.current_question) {
    return <div>Error: modal didn't work.</div>;
  }

  return (
    <div className="game-modal">
      <p>{game.modal.current_question.question}</p>
      {game.modal.current_question.type === "text" && (
        <div className="modal-text">
          <p>
            <input
              type="text"
              name="modalText"
              value={modalText}
              className="form-control"
              // biome-ignore lint/a11y/noAutofocus: Need to revisit autoFocus
              autoFocus={true}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
            />
          </p>
          <p>
            <button type="button" className="btn btn-success return" onClick={submitText}>
              Go
            </button>
          </p>
        </div>
      )}
      {game.modal.current_question.type === "multiple_choice" && (
        <div className="modal-multiple">
          {game.modal.current_question.choices.map((choice, index) => {
            const parts = game.modal.splitByHotkey(index);
            return (
              <button
                type="button"
                className="btn btn-primary"
                // biome-ignore lint/suspicious/noArrayIndexKey: Not important
                key={index}
                onClick={() => submitMultipleChoice(choice)}
              >
                {parts[0]}
                <span className="hotkey">{parts[1]}</span>
                {parts[2]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Question;
