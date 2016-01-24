import {Game} from '../models/game';

/**
 * Class BaseCommand.
 * Interface for commands a player can give.
 */
export class BaseCommand {
  name: string;
  verbs: Array<string>;
  game: Game;

  run(verb, arg) {
    return '';
  }
}
