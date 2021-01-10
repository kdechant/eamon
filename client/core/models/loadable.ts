/**
 * Loadable class. Parent class for all objects loaded from the database.
 */
export abstract class Loadable {

  /**
   * Loads data from JSON source into the object properties.
   * @param Object source an object, e.g., from JSON.
   */
  init(source) {
    for (const prop in source) {
      this[prop] = source[prop];
    }

  }

}
