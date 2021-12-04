import {HistoryEntry} from "./history-entry";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare let game;

/**
 * History manager model. Provides a container for all the history entries.
 */
export class HistoryManager {
  history: HistoryEntry[];
  current_entry: HistoryEntry;
  index: number;  // used for the history recall
  page_size = 20;
  counter = 0;  // used for display pagination
  suppressNextMessage = false;

  constructor() {
    this.history = [];
    this.index = this.history.length;
  }

  public shouldPause(): boolean {
    // don't pause on game start text because it's ugly
    if (this.current_entry.command === "") return false;
    return this.counter > this.page_size;
  }

  /**
   * Pushes a command onto the history
   */
  push(command: string) {
    this.current_entry = new HistoryEntry(command);
    this.history.push(this.current_entry);

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
  write(text: string, type = "normal", markdown = false): void {
    if (!this.suppressNextMessage) {
      game.queue.push(() => this._print(text, type, markdown));
    }
    this.suppressNextMessage = false;
  }

  _print(text: string, type = "normal", markdown = false): void {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!this.current_entry) {
      this.push("");
    }
    this.current_entry.push(text, type, markdown);

    const no_space = type.indexOf('no-space') !== -1;
    this.counter += (no_space ? 0 : 1) + Math.floor(text.length / 75);
  }

  /**
   * Appends some output text onto the last item in the history. Use this to print multiple strings without a paragraph
   * break between. The style of the new text will match the style of the existing text.
   * e.g.:
   * game.history.write("This is");
   * game.history.append(" all one line");
   */
  append(text: string): void {
    game.queue.push(() => {
      this.current_entry.append(text);
      this.counter += Math.floor(text.length / 75);
    });
  }

  /**
   * Gets the most recent command the user entered
   */
  getLastCommand(): string {
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
  getOlderCommand(): string {
    const commands = this.getPastCommands();
    if (this.index > 0) {
      this.index--;
    }
    if (this.index >= commands.length) {
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
  getNewerCommand(): string {
    const commands = this.getPastCommands();
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
  getOutput(index = 0) {
    if (this.history.length > 0) {
      const res = this.history[this.history.length - 1]["results"];
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
  getLastOutput(num = 1) {
    if (this.history.length > 0) {
      const res = this.history[this.history.length - 1]["results"];
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
    const commands = [];

    this.history.forEach(e => {
      if (e.command !== '' && commands[commands.length - 1] !== e.command) {
        commands.push(e.command);
      }
    });
    return commands.slice(0);  // no need to include the latest command here
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
    const output = [];
    this.history.forEach(
    h => {
      output.push(`-- ${h.command} --`);
      h.results.forEach(r => output.push(r.text));
    });
    return output;
  }

}
