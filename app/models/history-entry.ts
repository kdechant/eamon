/**
 * Class HistoryEntry.
 * Holds the commands and results run previously.
 */
export class HistoryEntry {

  public command: string;
  public results: Object[] = [];

  constructor(command) {
    this.command = command;
  }

  public push(text: string, type: string) {
    this.results.push({ text: text, type: type });
  }
}
