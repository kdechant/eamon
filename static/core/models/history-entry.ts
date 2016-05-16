/**
 * Class HistoryEntry.
 * Holds the commands and results run previously.
 */
export class HistoryEntry {

  public command: string;
  public results: any[] = [];

  constructor(command) {
    this.command = command;
  }

  public push(text: string, type: string) {
    this.results.push({ text: text, type: type });
  }

  public append(text: string) {
    this.results[this.results.length - 1].text += text;
  }
}
