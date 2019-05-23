import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class Hints extends React.Component<any, any> {
  public state = {
    show: false,
  };

  public toggle = () => {
    this.setState({ show: !this.state.show });
  };

  public handleShow = () => {
    this.setState({ show: true });
  };

  public showAnswer = (hint) => {
    hint.is_open = !hint.is_open;
    this.setState({show: true}); // force re-render
  };

  public nextAnswer = (hint) => {
    if (hint.current_index >= hint.answers.length - 1) {
      hint.current_index = 0;
    } else {
      hint.current_index++;
    }
    this.setState({show: true}); // force re-render
  };

  public prevAnswer = (hint) => {
    if (hint.current_index === 0) {
      hint.current_index = hint.answers.length - 1;
    } else {
      hint.current_index--;
    }
    this.setState({show: true}); // force re-render
  };

  public reveal = (hint) => {
    // console.log(hint);
    hint.answers[hint.current_index].spoiler = false;
    // console.log(hint);
    this.setState({show: true}); // force re-render
  };

  public render() {
    const game = this.props.game;
    return (
      <span id="hints">
        <button type="button" className="btn btn-secondary" onClick={this.handleShow}>
          Hints
        </button>

        <Modal isOpen={this.state.show} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            { game.name } Hints
          </ModalHeader>
          <ModalBody>
            {game.hints.all.map((h, index) => (
              <div className="hint" key={index}>
                <p onClick={() => this.showAnswer(h)}>
                  {h.is_open ? <span>-</span> : <span>+</span>}
                  {' '}<strong>{h.question}</strong>
                </p>
                {h.is_open && (
                  <div className="hint-answers">
                    <div className="hint-answer">
                      { h.answers[h.current_index].spoiler ?
                        <span>
                          <span className="blur">{h.answers[h.current_index].answer}</span><br />
                          <span className="small">Spoiler alert! <a onClick={() => this.reveal(h)}>Click here to show the answer</a>.</span>
                        </span> :
                        <ReactMarkdown source={h.answers[h.current_index].answer} escapeHtml={false} /> }
                    </div>
                    {h.answers.length > 1 && (
                    <div className="hint-next-prev">
                      <a className="prev" onClick={() => this.prevAnswer(h)}>&larr; prev</a>
                      <a className="next" onClick={() => this.nextAnswer(h)}>next &rarr;</a>
                    </div>
                  )}
                  </div>
                )}
              </div>
              ))}
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-primary" onClick={this.toggle}>Close</button>
          </ModalFooter>
        </Modal>
      </span>
    );
  }

}

export default Hints;
