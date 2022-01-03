import * as React from 'react';
import {useEffect, useRef, useState} from "react";
import {PropsWithGame} from "../types";


const CommandPrompt: React.FC<PropsWithGame> = (props) => {
  const [command, setCommand] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [restore, setRestore] = useState(false);
  const [cursorMove, setCursorMove] = useState(false);

  const commandInputRef = useRef(null);

  const game = props.game;

  useEffect(() => {
    // Key press handler for the screen pause. When the "hit any key"
    // button is visible, this will resume output.
    document.addEventListener("keydown", (ev) => {
      if (ev.key.match(/F\d*/) || ['Alt', 'Control', 'Shift', 'Tab', 'OS'].indexOf(ev.key) !== -1) {
        return;
      }
      if (game.queue.paused) {
        ev.preventDefault();
        game.history.counter = 0;
        game.queue.run();
      }
    }, false);
  }, []);

  useEffect(() => {
    // Move cursor to the end of the command. Used when up/down paging through past commands.
    if (!cursorMove) {
      return;
    }
    const pos = commandInputRef.current.value.length;
    commandInputRef.current.setSelectionRange(pos, pos);
    setCursorMove(false);
  }, [cursorMove]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(event.target.value);
  };

  /**
   * Handles key presses inside the command prompt input field.
   * @param event
   */
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        if (!game.ready) { return; }

        let new_command = command;

        // if the user didn't type a new command, run the last command
        if (new_command.length === 0) {
          new_command = game.history.getLastCommand();
        }

        // start a new history entry
        game.ready = false;

        // run the command
        game.command_parser.run(new_command);

        // clear the input box
        setCommand("");
        setLastCommand(new_command);

        setTimeout(() => {
          game.refresher();
        }, 25);

        break;
      case 'ArrowUp':
        // up arrow moves back through the history
        const prev_command = game.history.getOlderCommand();
        if (prev_command !== null) {
          setCommand(prev_command);
          setCursorMove(true);
        }
        break;
      case 'ArrowDown':
        // down arrow moves forward through the history
        const next_command = game.history.getNewerCommand();
        if (next_command !== null) {
          setCommand(next_command);
          setCursorMove(true);
        }
        break;
    }
    // other keys have no special function.
  };

  const showSaves = () => {
    setRestore(true);
  };

  const startOver = () => {
    window.location.reload();
  };

  const exit = () => {
    game.player.sellItems();
    game.refresher();
  };

  const restoreSavedGame = (sv) => {
    const slot = parseInt(sv, 10);
    game.restore(slot);
    game.tick();
    setRestore(false);
    game.refresher();
  };

  const hideSaves = () => {
    setRestore(false);
  };

  const resume = () => {
    game.queue.resume();
    // Note: input will autofocus again as soon as it reappears.
  };

  if (game.queue.paused) {
    return <button className="btn btn-info paused" onClick={resume}>
        Hit any key to continue...
      </button>;
  }

  if (game.active) {
    return (
      <div className="form-inline">
        <div className="command-prompt form-group">
          <span className="prompt">Your Command:</span>
          <input name="command"
                 id="command"
                 ref={commandInputRef}
                 type="text"
                 value={command}
                 onChange={handleChange}
                 onKeyDown={handleKeyPress}
                 className={"form-control ml-2 " + (game.ready ? 'ready' : 'running')}
                 placeholder={lastCommand}
                 autoComplete="off"
                 autoFocus={true}
          />
        </div>
      </div>
    )
  }

  if (game.won) {
    return (
      <div className="return-button-container">
        <button className="btn btn-success" id="return" onClick={exit}>Return to Main Hall</button>
      </div>
    )
  }

  if (game.died && !restore) {
    return (
      <div className="return-button-container">
        <button className="btn btn-success mr-2" id="start_over" onClick={startOver}>Start Over</button>
        <button className="btn btn-success" id="restore" onClick={showSaves}>Restore a Saved Game</button>
      </div>
    )
  }

  if (game.died && restore) {
    return (
      <div className="return-button-container">
        {game.saves.map(sv => (
          <button key={sv.slot} className="btn btn-success" onClick={() => restoreSavedGame(sv)}>{sv}</button>
        ))}
        {game.saves.length === 0 && (
          <span>You have no saved games.</span>
        )}
        <button className="btn btn-success" onClick={hideSaves}>Cancel</button>
      </div>
    )
  }

  return (
    <div id="command-prompt">
      Loading...
    </div>
  );

}

export default CommandPrompt;
