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

  public push(text: string, type: string, markdown: boolean = false) {
    if (text === null) {
      text = "";
    }
    let split_text = text.split(/\n/g);
    for (let i in split_text) {
      this.results.push({ text: split_text[i], type, markdown });
    }
  }

  public append(text: string) {
    this.results[this.results.length - 1].text += text;
  }
}
