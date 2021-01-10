import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import {BaseCommand} from "../commands/base-command";

// TypeScript checkers to quiet the linter about the 'unknown' object type
const baseCommandCheck = (cmd: any): cmd is BaseCommand => true;
const baseCommandsCheck = (arr: any): arr is BaseCommand[] => true;

const CommandList = (props) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);

  if (!props.visible) return <React.Fragment />;

  const game = props.game;
  const commands = Object.values(game.command_parser.available_commands).filter((c: BaseCommand) => !c.secret);
  const category_names = ['movement', 'artifact manipulation', 'interactive', 'miscellaneous'];
  const categories = {};
  for (const c of commands) {
    if (baseCommandCheck(c)) {
      if (!c.category) {
        c.category = 'special commands for this adventure';
      }
      if (category_names.indexOf(c.category) === -1) {
        category_names.push(c.category);
      }
      if (!categories.hasOwnProperty(c.category)) {
        categories[c.category] = [];
      }
      categories[c.category].push(c);
    }
  }

  // verbs to remove from the list
  const hidden_commands = ['n', 's', 'e', 'w', 'u', 'd', 'ne', 'se', 'sw', 'nw'];

  return (
    <Modal isOpen={props.visible} toggle={props.toggle} size="xl">
      <ModalHeader toggle={props.toggle} tag="h3">
        Available Commands
      </ModalHeader>
      <ModalBody className="command-list">
        <p>
          <a id="how-to-type-commands" tabIndex={0}>How to type commands</a>
          <Popover placement="bottom" isOpen={popoverOpen} target="how-to-type-commands" toggle={toggle}>
            <PopoverHeader>Tips for typing commands</PopoverHeader>
            <PopoverBody>
              <p>Eamon uses a two-word parser to parse commands. Most commands take a very simple syntax, like GET GOLD or
                OPEN CHEST. Some commands are one word (e.g., N for NORTH, or LOOK). A few take more words, e.g.,
                REMOVE JEWEL FROM CHEST or GIVE SWORD TO EDDIE.</p>
              <p>Most commands can be abbreviated by typing the first few letters or the last few letters of the
                command. This also works with the object of the command. E.g., AT DR or A DRAGON are shorthand for
                ATTACK DRAGON.</p>
              <p>Commands are shown in uppercase for examples, but you don't need to type in uppercase. All commands
                are case insensitive.</p>
            </PopoverBody>
          </Popover>
        </p>
        {category_names.map(name => {
          const commands = categories[name];
          if (baseCommandsCheck(commands)) {
            return (
              <div className="command-list-category" key={name}>
                <h4 className="mt-2 mb-0">{name.toUpperCase()}</h4>
                <div className="row">
                  {commands.map((c: BaseCommand) =>
                    c.verbs.filter(v => hidden_commands.indexOf(v) === -1).map(v =>
                      <CommandVerb key={v} verb={v} description={c.description} examples={c.examples} />
                  ))}
                </div>
              </div>
            )
          }
        })}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={props.toggle} tabIndex={0}>Close</button>
      </ModalFooter>
    </Modal>
  );
}

const CommandVerb = (props) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);
  return (
    <div className="command-list-item col-4 col-sm-3">
      <a id={'command-' + props.verb} tabIndex={0} onKeyPress={toggle}>{props.verb.toUpperCase()}</a><br/>
      {(props.description || props.examples) && (
        <Popover placement="bottom" isOpen={popoverOpen} target={'command-' + props.verb} toggle={toggle}>
          <PopoverHeader>{props.description}</PopoverHeader>
          <PopoverBody>
            <div>Examples:</div>
            {props.examples && props.examples.map((e, k) => (<span key={k}>{e}<br /></span>))}
          </PopoverBody>
        </Popover>
      )}
      {(!props.description && !props.examples) && (
        <Popover placement="bottom" isOpen={popoverOpen} target={'command-' + props.verb} toggle={toggle}>
          <PopoverHeader>Custom Command</PopoverHeader>
          <PopoverBody>Some adventures have custom commands that only work in that adventure. This one hasn't
          been documented yet. Try it and see.</PopoverBody>
        </Popover>
      )}
    </div>
  );
}

export default CommandList;
