import {Game} from "./game";
import {Loadable} from "./loadable";

/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export abstract class GameObject {

  id: number;
  name: string;
  aliases: string[];

  /**
   * Loads data from JSON source into the object properties.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    for (let prop in source) {
      this[prop] = source[prop];
    }
  }

  /**
   * Matches an object by name or aliases.
   * @param {string} str - The name or alias to match, e.g. "bottle" or "healing potion" for an artifact with
   * a name "healing potion" and alias "bottle"
   */
  public match(str: string): boolean {
    // attempt exact match by name
    if (str.toLowerCase() === this.name.toLowerCase()) {
      return true;
    }
    // attempt match by alias
    for (let i in this.aliases) {
      if (str.toLowerCase() === this.aliases[i].toLowerCase()) {
        return true;
      }
    }
    return false;
  }
}
