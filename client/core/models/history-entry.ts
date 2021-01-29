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

  public push(text: string, type: string, markdown = false) {
    if (text === null) {
      text = "";
    }
    const split_text = text.split(/\n/g);
    for (const i in split_text) {
      this.results.push({ text: split_text[i], type, markdown });
    }
  }

  public append(text: string) {
    // TODO: make appends not take any time
    this.results[this.results.length - 1].text += text;
  }
}
