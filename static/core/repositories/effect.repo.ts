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
    for (let e of effect_data) {
      this.add(e);
    }
  }

  /**
   * Adds a monster.
   * @param {Object} effect_data - The raw data from the back end
   */
  public add(effect_data) {
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
   * @param {number} id
   * @return Effect
   */
  public get(id): Effect {
    let e = this.all.find(x => x.id === id);
    return e || null;
  }

  /**
   * Prints a numbered effect.
   * @param {number} id The ID of the effect
   * @param {string} style The display type, e.g., "normal", "special", "warning", "danger"  - omit this argument
   * to use the style specified in the effect object
   */
  public print(id: number, style: string = null, inline: boolean = false): void {
    let ef = this.get(id);
    if (ef) {
      if (inline) {
        // print on the same line as the last effect
        Game.getInstance().history.append(" " + ef.text);
      } else {
        // print as a new paragraph
        let final_style = style;
        if (final_style === null) {
          final_style = ef.style;
        }
        Game.getInstance().history.write(ef.text, final_style);
      }
      if (ef.next !== null) {
        this.print(ef.next, style);
      }
      if (ef.next_inline !== null) {
        this.print(ef.next_inline, style, true);
      }
    } else {
      Game.getInstance().history.write("Effect #" + id + " not found!");
    }
  }

}
