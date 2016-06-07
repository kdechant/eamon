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
    let name: string = this.name.toLocaleLowerCase();
    str = str.toLocaleLowerCase();
    // attempt exact match by name
    if (str === name) {
      return true;
    }
    // attempt match by alias
    for (let i in this.aliases) {
      if (str === this.aliases[i].toLocaleLowerCase()) {
        return true;
      }
    }
    // attempt match by beginning/end of name
    if (name.startsWith(str) || name.endsWith(str)) {
      return true;
    }
    return false;
  }
}
