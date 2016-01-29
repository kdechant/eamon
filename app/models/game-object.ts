import {Game} from './game'
import {Loadable} from './loadable';

/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export abstract class GameObject {

  /**
   * Loads data from JSON source into the object properties.
   * @param Object source an object, e.g., from JSON.
   */
  init(source) {
    for(var prop in source) {
      this[prop] = source[prop];
    }

  }

}
