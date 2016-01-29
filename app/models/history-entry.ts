/**
 * Class HistoryEntry.
 * Holds the commands and results run previously.
 */
export class HistoryEntry {

  public command: string
  public results: string[] = [];

  constructor(command) {
    this.command = command;
  }

  public push(text:string) {
    this.results.push(text);
  }
}
