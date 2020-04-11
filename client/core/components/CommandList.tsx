import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class CommandList extends React.Component<any, any> {

  public render() {
    const game = this.props.game;

    const keys = Object.keys(game.command_parser.available_verbs)
      .filter(c => c !== 'xgoto' && c !== 'xdebugger' && c !== 'xaccio');

    return (
      <Modal isOpen={this.props.visible} toggle={this.props.toggle} size="lg">
        <ModalHeader toggle={this.props.toggle}>
          Available Commands
        </ModalHeader>
        <ModalBody>
          <div className="row">
            {keys.map((cmd, index) => (
              <div className="command-list-item col-4 col-sm-3" key={index}>
                {cmd}
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-primary" onClick={this.props.toggle}>Close</button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CommandList;
