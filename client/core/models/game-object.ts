import * as pluralize from 'pluralize';
import Game from "./game";
import { parseJSON } from '../utils/index'

declare let game: Game;

/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export class GameObject {

  id: number;
  article: string;
  name: string;
  description: string;
  is_markdown: boolean;  // does the description use markdown formatting?
  aliases: string[];
  effect: number;  // for extended descriptions
  effect_inline: number;  // for extended descriptions
  seen = false;

  /**
   * A container for custom data used by specific adventures
   */
  data: { [key: string]: any; } = {};

  /**
   * Loads data from JSON source into the object properties.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    if (source.data) {
      source.data = parseJSON(source.data);
    } else {
      source.data = {};
    }
    for (const prop in source) {
      this[prop] = source[prop];
    }
  }

  /**
   * Matches an object by name or aliases.
   * @param {string} str - The name or alias to match, e.g. "bottle" or "healing potion" for an artifact with
   * a name "healing potion" and alias "bottle"
   */
  public match(str: string): boolean {
    const names: string[] = [  // all iterations of the monster's name
      this.name.toLocaleLowerCase(),
      this.getDisplayName().toLocaleLowerCase(),
      pluralize.plural(this.name).toLocaleLowerCase(),
    ];
    if (this.aliases) {
      this.aliases.forEach(a => names.push(a));
    }
    str = str.toLocaleLowerCase();
    // attempt exact match by name
    if (names.indexOf(str) !== -1) {
      return true;
    }
    // attempt match by beginning/end of name
    for (const name of names) {
      if (name.startsWith(str) || name.endsWith(str)) {
        return true;
      }
    }
    return false;
  }

  public getDisplayName() {
    return this.article ? `${this.article} ${this.name}` : this.name;
  }

  /**
   * Shows the description, including any chained effects
   */
  public showDescription() {
    // Check for whether the game is running. This prevents the following JS error in the main hall:
    // "TypeError: Object.setPrototypeOf: expected an object or null, got undefined"
    if (typeof game !== 'undefined') {
      game.history.write(this.description + " ",  // pad with space in case of chained effects
        "normal", this.is_markdown);
      if (this.effect) {
        game.effects.print(this.effect);
      }
      if (this.effect_inline) {
        game.effects.print(this.effect_inline, null, true);
      }
    }
  }

}
