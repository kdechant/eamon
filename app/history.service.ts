import {Injectable} from 'angular2/core';

import {HistoryEntry} from './models/history-entry';

/**
 * History service. Provides a container for all the history entries.
 */
@Injectable()
export class HistoryService {
  history: HistoryEntry[];
  index: number;
  
  constructor() {
    this.history = [];
    this.index = this.history.length;
  }
  
  /**
   * Pushes a command onto the history
   */
  push(command, results) {
    this.history.push(new HistoryEntry(command, results))
    console.log(this.history)
    
    // reset the counter whenever a command is added.
    this.index = this.history.length;
  }
  
  /**
   * Gets the most recent command the user entered
   */
  getLastCommand() {
    if (this.history.length > 0) {
      return this.history[this.history.length-1]['command'];
    } else {
      return '';
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
      return this.history[this.index]['command'];
    } else {
      return '';
    }
  }
  
  /**
   * Gets the next-newer command in the history.
   * Used for recalling the history with the arrow keys.
   */
  getNewerCommand() {
    if (this.index < this.history.length) {
      this.index++;
    }
    if (this.index >= 0 && this.index < this.history.length) {
      return this.history[this.index]['command'];
    } else {
      return '';
    }
  }
  
}
