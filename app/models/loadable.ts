/**
 * Loadable class. Parent class for all objects loaded from the database.
 */
export abstract class Loadable {

  constructor() { }

  /**
   * Loads data from JSON source into the object properties.
   * @param Object source an object, e.g., from JSON.
   */
  init(source) {
    for(var prop in source) {
//      if(this.hasOwnProperty(prop)) {
        this[prop] = source[prop];
//      }
//      else {
//        console.error("Cannot set undefined property: " + prop);
//      }
    }

  }

}
