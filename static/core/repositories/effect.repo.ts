import {Effect} from "../models/effect";
import {Game} from "../models/game";

/**
 * Class EffectRepository.
 * Storage class for all effect data.
 */
export class EffectRepository {

  /**
   * An array of all the Effect objects
   */
  all: Effect[] = [];

  /**
   * The highest Effect ID in the system
   */
  index: number = 0;

  constructor(effect_data: Array<Object>) {
    for (let i in effect_data) {
      this.add(effect_data[i]);
    }
  }

  /**
   * Adds a monster.
   * @param number id
   */
  add(effect_data) {
    let e = new Effect();
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
   * @param number id
   * @return Effect
   */
  get(id) {
    for (let i in this.all) {
      if (this.all[i].id === id) {
        return this.all[i];
      }
    }
    return null;
  }

  /**
   * Prints a numbered effect.
   * @param id The ID of the effect
   * @param type The display type, e.g., "normal", "special", "warning", "danger"
   * @return Effect
   */
  print(id: number, type: string = "normal") {
    for (let i in this.all) {
      if (this.all[i].id === id) {
        Game.getInstance().history.write(this.all[i].text, type);
      }
    }
    return null;
  }

}
