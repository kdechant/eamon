import {Hint} from "../models/hint";
import {Game} from "../models/game";

/**
 * Class HintRepository.
 * Storage class for all hint data.
 */
export class HintRepository {

  /**
   * An array of all the Hint objects
   */
  all: Hint[] = [];

  /**
   * The highest ID in the system
   */
  index: number = 0;

  constructor(hint_data: Array<Object>) {
    for (let i of hint_data) {
      this.add(i);
    }
  }

  /**
   * Adds a hint.
   * @param {Object} hint_data
   */
  public add(hint_data) {
    let h = new Hint();

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
   * @return Monster
   */
  public get(id) {
    // @ts-ignore
    let h = this.all.find(x => x.id === id);
    return h || null;
  }

}
