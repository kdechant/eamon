import {HistoryEntry} from "../models/history-entry";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

/**
 * History manager model. Provides a container for all the history entries.
 */
export class HistoryManager {
  history: HistoryEntry[];
  current_entry: HistoryEntry;
  index: number;  // used for the history recall
  delay: number = 100;
  page_size: number = 20;
  paused: boolean = false;
  counter: number = 0;  // used for display pagination
  suppressNextMessage: boolean = false;

  constructor() {
    this.history = [];
    this.index = this.history.length;
  }

  public display() {
    if (this.paused) this.counter = 0;
    this.paused = false;
    let line = this.current_entry.results.shift();
    if (line) {
      this.history[this.index - 1].push(line.text, line.type, line.markdown);
      if (this.delay > 0) {
        let pause = (line.type && line.type.indexOf('pause') !== -1)
          || (this.counter > this.page_size && this.current_entry.results.length > 2);
        // don't pause on game start text because it's ugly
        if (this.current_entry.command === "") pause = false;
        if (pause) {
          this.paused = true;
        } else {
          let no_space = line.type.indexOf('no-space') !== -1;
          this.counter += no_space ? 1 : 2;
          if (line.text.length > 150) {
            this.counter++;
          }
          if (line.text.length > 225) {
            this.counter++;
          }
          setTimeout(() => { this.display(); }, no_space ? this.delay : this.delay / 2);
        }
      } else {
        // No delay (i.e., unit tests). Not using setTimeout because it breaks the tests.
        this.display();
      }
    } else {
      // we've displayed everything, so reactivate the command prompt
      game.setReady();
    }
    game.refresh();
  }

  /**
   * Outputs everything in the history with no delay. Used if you
   * need to ask a question to the user after some output has
   * been displayed.
   */
  flush() {
    let delay = this.delay;
    this.delay = 0;
    this.display();
    this.delay = delay;
  }

  /**
   * Pushes a command onto the history
   */
  push(command: string) {
    this.current_entry = new HistoryEntry(command);  // temp holding area for the results
    this.history.push(new HistoryEntry(command));  // this will stay empty (except for the command) until the results are pushed onto it with display()

    // reset the counter whenever a command is added.
    this.counter = 0;
    this.index = this.history.length;
  }

  /**
   * Pushes some output text onto the history
   * @param {string} text
   *   The text to output
   * @param {string} type
   *   The style of text: "normal" (default), "special", "success", "warning", "danger"
   * @param {boolean} markdown
   *   Whether to use the Markdown formatter (true) or the plain text formatter (false)
   */
  write(text: string, type: string = "normal", markdown: boolean = false) {
    if (!this.suppressNextMessage) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
      this.current_entry.push(text, type, markdown);
    }
    this.suppressNextMessage = false;
  }

  /**
   * Appends some output text onto the last item in the history. Use this to print multiple strings without a paragraph
   * break between. The style of the new text will match the style of the existing text.
   * e.g.:
   * game.history.write("This is");
   * game.history.append(" all one line");
   */
  append(text: string) {
    this.current_entry.append(text);
  }

  /**
   * Increases speed
   */
  faster(amount = 25) {
    this.delay = Math.max(0, this.delay - amount);
  }

  /**
   * Decreases speed
   */
  slower(amount = 25) {
    this.delay += amount;
  }

  /**
   * Implements a screen pause
   */
  public pause() {
    this.current_entry.push("", "pause", false);
  }

  /**
   * Gets the most recent command the user entered
   */
  getLastCommand() {
    if (this.history.length > 0) {
      return this.history[this.history.length - 1]["command"];
    } else {
      return "";
    }
  }

  /**
   * Gets the next-older command in the history.
   * Used for recalling the history with the arrow keys.
   */
  getOlderCommand() {
    let commands = this.getPastCommands();
    if (this.index > 0) {
      this.index--;
    }
    if (this.index > commands.length) {
      this.index = commands.length - 1;
    }
    if (this.index >= 0 && this.index < commands.length) {
      return commands[this.index];
    } else {
      return null;
    }
  }

  /**
   * Gets the next-newer command in the history.
   * Used for recalling the history with the arrow keys.
   */
  getNewerCommand() {
    let commands = this.getPastCommands();
    if (this.index <= commands.length) {
      this.index++;
    }
    if (this.index > commands.length + 1) {
      this.index = commands.length;
    }
    if (this.index >= 0 && this.index < commands.length) {
      return commands[this.index];
    } else if (this.index === commands.length) {
      // reached the newest command. clear the field.
      return "";
    } else {
      return null;
    }
  }

  /**
   * Gets a line from the history for the most recent command
   * Used for unit tests. Do not use this for actual game play logic.
   * @param {number} index
   *   The zero-based index number of the history line (default 0, which is the first line of history since the last command)
   *   1 is the second line, 2 the third, and so on.
   */
  getOutput(index: number = 0) {
    this.display();
    if (this.history.length > 0) {
      let res = this.history[this.history.length - 1]["results"];
      if (index < 0) {
        return res[res.length + index];
      } else if (res.length >= index + 1) {
        return res[index];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  /**
   * Gets the most recent output entry added to the history.
   * Used for unit tests. Do not use this for actual game play logic.
   * @param {number} num
   *   The number of history entries to go back (default 1)
   */
  getLastOutput(num: number = 1) {
    this.display();
    if (this.history.length > 0) {
      let res = this.history[this.history.length - 1]["results"];
      if (res.length >= num) {
        return res[res.length - num];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Gets the list of commands the player ran, for use when paging through the history.
   *
   * This performs some simple de-duplication, squashing multiple consecutive commands
   * into one entry, so you don't have to keep paging through them all. It also does not
   * include the latest command the user typed, because that is the same as what will
   * appear when the prompt is empty.
   */
  getPastCommands() {
    let commands = [];

    this.history.forEach(e => {
      if (e.command !== '' && commands[commands.length - 1] !== e.command) {
        commands.push(e.command);
      }
    });
    return commands.slice(0, -1);  // no need to include the latest command here
  }

  /**
   * Clears the history. Used for tests.
   */
  clear() {
    this.history = [];
    this.index = this.history.length;
    this.push("");
  }

  /**
   * Prints the entire history as plain text (for testing)
   */
  summary() {
    let output = [];
    this.history.forEach(
    h => {
      output.push(`-- ${h.command} --`);
      h.results.forEach(r => output.push(r.text));
    });
    return output;
  }

}
