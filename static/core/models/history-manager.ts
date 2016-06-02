import {HistoryEntry} from "../models/history-entry";

/**
 * History service. Provides a container for all the history entries.
 */
export class HistoryManager {
  history: HistoryEntry[];
  index: number;
  suppressNextMessage: boolean = false;

  constructor() {
    this.history = [];
    this.index = this.history.length;
  }

  /**
   * Pushes a command onto the history
   */
  push(command: string) {
    this.history.push(new HistoryEntry(command));

    // reset the counter whenever a command is added.
    this.index = this.history.length;
  }

  /**
   * Pushes some output text onto the history
   */
  write(text: string, type: string = "normal") {
    if (!this.suppressNextMessage) {
      this.history[this.index - 1].push(text, type);
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
    this.history[this.index - 1].append(text);
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
    if (this.index > 0) {
      this.index--;
    }
    if (this.index >= 0 && this.index < this.history.length) {
      return this.history[this.index]["command"];
    } else {
      return null;
    }
  }

  /**
   * Gets the next-newer command in the history.
   * Used for recalling the history with the arrow keys.
   */
  getNewerCommand() {
    if (this.index <= this.history.length) {
      this.index++;
    }
    if (this.index >= 0 && this.index < this.history.length) {
      return this.history[this.index]["command"];
    } else if (this.index === this.history.length) {
      // reached the newest command. clear the field.
      return "";
    } else {
      return null;
    }
  }

  /**
   * Gets the most recent output entry added to the history.
   * Used for unit tests.
   */
  getLastOutput() {
    if (this.history.length > 0) {
      let res = this.history[this.history.length - 1]["results"];
      if (res.length > 0) {
        return res[res.length - 1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

}
