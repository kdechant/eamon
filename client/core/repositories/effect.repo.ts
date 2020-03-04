import {Effect} from "../models/effect";
import Game from "../models/game";

/**
 * Class EffectRepository.
 * Storage class for all effect data.
 */
export default class EffectRepository {

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
    // @ts-ignore
    let e = this.all.find(x => x.id === id);
    return e || null;
  }

  /**
   * Prints a numbered effect.
   * @param {number} id The ID of the effect
   * @param {string} style The display type, e.g., "normal", "special", "warning", "danger"  - omit this argument
   * to use the style specified in the effect object
   * @param {boolean} inline Whether to display the effect on the previous line or on a new line.
   */
  public print(id: number, style: string = null, inline: boolean = false): void {
    let game = Game.getInstance();
    let ef = this.get(id);
    if (ef) {
      let text = ef.text;
      if (ef.replacements) {
        for (const key in ef.replacements) {
          text = text.replace(key, ef.replacements[key]);
        }
      }
      if (inline) {
        // print on the same line as the last effect
        game.history.append(" " + text);
      } else {
        // print as a new paragraph
        let final_style = style || ef.style || "normal";
        game.history.write(text, final_style, ef.is_markdown);
      }
      if (ef.next !== null) {
        this.print(ef.next, style);
      }
      if (ef.next_inline !== null) {
        this.print(ef.next_inline, style, true);
      }
      ef.seen = true;
    } else {
      game.history.write("Effect #" + id + " not found!");
    }
  }

  /**
   * Prints a sequence of effects.
   * @param {number[]} effectIds
   *   The IDs of the effects to print
   */
  public printSequence(effectIds: number[]): void {
    let game = Game.getInstance();
    effectIds.forEach(id => game.effects.print(id));
  }

}
