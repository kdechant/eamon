import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class CommandList extends React.Component<any, any> {
  public state = {
    show: false,
  };

  public toggle = () => {
    this.setState({ show: !this.state.show });
  };

  public handleShow = () => {
    this.setState({ show: true });
  };

  public render() {
    const game = this.props.game;

    const keys = Object.keys(game.command_parser.available_verbs)
      .filter(c => c !== 'xgoto' && c !== 'xdebugger' && c !== 'xaccio');

    return (
      <span id="command-list">
        <button type="button" className="btn btn-secondary" onClick={this.handleShow}>
          List Commands
        </button>

        <Modal isOpen={this.state.show} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            Availabile Commands
          </ModalHeader>
          <ModalBody>
            <div className="row">
              {keys.map((cmd, index) => (
                <div className="command-list-item col-sm-3" key={index}>
                  {cmd}
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-primary" onClick={this.toggle}>Close</button>
          </ModalFooter>
        </Modal>
      </span>
    );
  }

}

export default CommandList;
