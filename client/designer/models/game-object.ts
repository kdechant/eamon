import { v4 as uuidv4 } from 'uuid';

/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export default class GameObject {

  /**
   * The "id" is the database ID. Objects will only have a value for this if
   * they were saved to the DB (e.g., adventures, rooms, player artifacts)
   * (Artifacts created in the shop in the mail hall won't have this until they are saved.)
   */
  id: number;

  /**
   * The UUID is a temporary identifier used as a key for React elements.
   * It is not persisted to the database and doesn't need to be.
   */
  uuid: string;
  article: string;
  name: string;
  description: string;
  is_markdown: boolean;
  effect: number;
  effect_inline: number;
  synonyms: string;

  /**
   * Loads data from JSON source into the object properties.
   * @param {Record<string, unknown>} source an object, e.g., from JSON.
   */
  public init(source: Record<string, unknown>): void {
    this.uuid = uuidv4();
    for (const prop in source) {
      if (source.hasOwnProperty(prop)) {
        this[prop] = source[prop];
      }
    }
  }

}
