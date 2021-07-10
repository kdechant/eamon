import Hint from "../models/hint";

/**
 * Class HintRepository.
 * Storage class for all hint data.
 */
export default class HintRepository {

  /**
   * An array of all the Hint objects
   */
  all: Hint[] = [];

  /**
   * The highest ID in the system
   */
  index = 0;

  constructor(hint_data: Array<Record<string, unknown>>) {
    for (const i of hint_data) {
      this.add(i);
    }
  }

  /**
   * Adds a hint.
   * @param {Record<string, number|string>} hint_data
   */
  public add(hint_data: Record<string, number|string>): Hint {
    const h = new Hint();

    h.init(hint_data);

    // autonumber the ID if not provided
    if (h.id === undefined) {
      h.id = this.index + 1;
    }

    if (this.get(h.id) !== null) {
      throw new Error("Tried to create a hint #" + h.id + " but that ID is already taken.");
    }

    this.all.push(h);

    // update the autonumber index
    if (h.id > this.index) {
      this.index = h.id;
    }
    return h;
  }

  /**
   * Gets a hint by id.
   * @param {number} id
   * @return Hint
   */
  public get(id: number): Hint|null {
    const h = this.all.find(x => x.id === id);
    return h || null;
  }

}
