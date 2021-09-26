import {Effect} from "../models/effect";
import {BaseRepository} from "./base.repo";

/**
 * Class EffectRepository.
 * Storage class for all effect data.
 */
export default class EffectRepository extends BaseRepository {

  /**
   * An array of all the Effect objects
   */
  all: Effect[] = [];

  /**
   * The highest Effect ID in the system
   */
  index = 0;

  constructor(effect_data: Array<Record<string, unknown>>) {
    super();
    for (const e of effect_data) {
      this.add(e);
    }
  }

  /**
   * Adds an effect to the collection.
   * @param {Record} effect_data - The raw data from the back end
   */
  public add(effect_data: Record<string, unknown>): Effect {
    const e = new Effect();
    e.init(effect_data);

    // autonumber the ID if not provided
    if (e.id === undefined) {
      e.id = this.index + 1;
    }

    if (this.get(e.id) !== null) {
      console.log(this.get(e.id));
      throw new Error("Tried to create an effect #" + e.id + " but that ID is already taken.");
    }

    this.all.push(e);

    // update the autonumber index
    if (e.id > this.index) {
      this.index = e.id;
    }
    return e;
  }

  /**
   * Gets a numbered effect.
   * @param {number} id
   * @return Effect
   */
  public get(id: number|string): Effect {
    if (typeof id === 'string') id = parseInt(id);
    const e = this.all.find(x => x.id === id);
    return e || null;
  }

}
