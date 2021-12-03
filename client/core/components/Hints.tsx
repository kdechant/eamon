import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import rehypeRaw from "rehype-raw";
import {ModalProps} from "../types";
import {Hint} from "../models/hint";
import {useState} from "react";


const Hints: React.FC<ModalProps> = (props) => {
  const [, forceRefresh] = useState(0);  // used for forcing re-render

  const showAnswer = (hint: Hint) => {
    hint.is_open = !hint.is_open;
    forceRefresh(Date.now());
  };

  const nextAnswer = (hint: Hint) => {
    if (hint.current_index >= hint.answers.length - 1) {
      hint.current_index = 0;
    } else {
      hint.current_index++;
    }
    forceRefresh(Date.now());
  };

  const prevAnswer = (hint: Hint) => {
    if (hint.current_index === 0) {
      hint.current_index = hint.answers.length - 1;
    } else {
      hint.current_index--;
    }
    forceRefresh(Date.now());
  };

  const reveal = (hint: Hint) => {
    hint.answers[hint.current_index].spoiler = false;
    forceRefresh(Date.now());
  };

  const game = props.game;
  return (
    <Modal isOpen={props.visible} toggle={props.toggle} size="lg">
      <ModalHeader toggle={props.toggle} tag="h3">
        { game.name } Hints
      </ModalHeader>
      <ModalBody>
        {game.hints.all.map((h, index) => (
          <div className="hint" key={index}>
            <p onClick={() => showAnswer(h)}>
              {h.is_open ? <span>-</span> : <span>+</span>}
              {' '}<strong>{h.question}</strong>
            </p>
            {h.is_open && (
              <div className="hint-answers">
                <div className="hint-answer">
                  { h.answers[h.current_index].spoiler ?
                    <span>
                      <span className="blur">{h.answers[h.current_index].answer}</span><br />
                      <span className="small">Spoiler alert! <a onClick={() => reveal(h)}>Click here to show the answer</a>.</span>
                    </span> :
                    <ReactMarkdown
                      children={h.answers[h.current_index].answer}
                      rehypePlugins={[rehypeRaw]}
                      linkTarget="_blank" /> }
                </div>
                {h.answers.length > 1 && (
                <div className="hint-next-prev">
                  <a className="prev" onClick={() => prevAnswer(h)}>&larr; prev</a>
                  <a className="next" onClick={() => nextAnswer(h)}>next &rarr;</a>
                </div>
              )}
              </div>
            )}
          </div>
          ))}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={props.toggle}>Close</button>
      </ModalFooter>
    </Modal>
  );
}

export default Hints;
