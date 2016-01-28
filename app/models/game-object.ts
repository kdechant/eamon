import {Game} from './game'
import {Loadable} from './loadable';

/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export abstract class GameObject extends Loadable {

  public game:Game;

  constructor(game:Game) {
    super()
    this.game = game;
  }

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
