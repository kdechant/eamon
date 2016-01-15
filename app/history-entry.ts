/**
 * Class HistoryEntry.
 * Holds the commands and results run previously.
 */
export class HistoryEntry {
  constructor(
    public command?: string,
    public results?: string
  ) { }
}
