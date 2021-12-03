import * as React from 'react';
import {useState} from "react";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import rehypeRaw from "rehype-raw";

import {gamevars} from "../utils";
import {PropsWithGame} from "../types";


const IntroText: React.FC<PropsWithGame> = (props) => {
  const [index, setIndex] = useState(0);
  const [introAnswer, setIntroAnswer] = useState('');

  const introNext = () => {
    setIndex((index) => index + 1);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIntroAnswer(event.target.value);
  };

  const startGame = () => {
    const game = props.game;
    if (game.intro_question) {
      game.intro_answer = introAnswer;
    }
    game.start();
    props.setGameState(game);
  };

  const game = props.game;
  return (
    <div id="intro-text">
      <ReactMarkdown children={gamevars(game.intro_text[index])}
                     rehypePlugins={[rehypeRaw]} />
      {index < game.intro_text.length - 1 && (
      <p className="intro-next">
        <button className="btn btn-success" id="intro-next" onClick={introNext}>Next</button>
      </p>
      )}
      {index === game.intro_text.length - 1 && (
        <div className="intro-start">

          {game.intro_question && (
            <p className="intro-question">
              {game.intro_question}{' '}
              <input type="text" id="introAnswer" name="introAnswer" autoFocus={true} onChange={handleChange} />
            </p>
          )}

          <div className="intro-confirm">
            <p><button className="btn btn-success" id="return" onClick={startGame}>Start Adventure</button></p>
          </div>

        </div>
      )}
    </div>
  );

}

export default IntroText;
