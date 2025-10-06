import styled from "@emotion/styled";
import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Modal from "react-bootstrap/Modal";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import LinkButton from "../../common/LinkButton.tsx";
import type { Hint } from "../models/hint";
import type { ModalProps } from "../types";

const StyledAccordionHeader = styled(Accordion.Header)`
  .accordion-button {
    font-weight: bold;
    font-size: 20px;
    background: transparent;
  }
  .accordion-button:not(.collapsed) {
    background: transparent;
  }
`;

const Hints = (props: ModalProps) => {
  const [, forceRefresh] = useState(0); // used for forcing re-render

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
    <Modal show={props.visible} onHide={() => props.toggle()} size="lg">
      <Modal.Header closeButton>
        <h3>{game.name} Hints</h3>
      </Modal.Header>
      <Modal.Body>
        <Accordion>
          {game.hints.all.map((h, index) => (
            <Accordion.Item
              key={h.id}
              eventKey={`${index + 1}`}
              style={{
                background: "transparent",
              }}
            >
              <StyledAccordionHeader as="h3">{h.question}</StyledAccordionHeader>
              <Accordion.Body>
                <div className="hint-answers">
                  <div className="hint-answer">
                    {h.answers[h.current_index].spoiler ? (
                      <span>
                        <span className="blur">{h.answers[h.current_index].answer}</span>
                        <br />
                        <span className="small">
                          Spoiler alert!{" "}
                          <LinkButton role="button" onClick={() => reveal(h)}>
                            Click here to show the answer
                          </LinkButton>
                          .
                        </span>
                      </span>
                    ) : (
                      <ReactMarkdown rehypePlugins={[rehypeRaw]} linkTarget="_blank">
                        {h.answers[h.current_index].answer}
                      </ReactMarkdown>
                    )}
                  </div>
                  {h.answers.length > 1 && (
                    <div className="hint-next-prev">
                      <button type="button" className="btn btn-link prev" onClick={() => prevAnswer(h)}>
                        &larr; prev
                      </button>
                      <button type="button" className="btn btn-link next" onClick={() => nextAnswer(h)}>
                        next &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={props.toggle}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default Hints;
