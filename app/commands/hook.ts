import {Game} from '../models/game';

/**
 * Class Hook.
 * A class used to define a game hook.
 *
 * A game hook is an action that happens during execution, such as special
 * logic when a user picks up an item or reads a book.
 */
export class Hook {
  name: string;
  game: Game;
  run(verb, arg) { }
}
