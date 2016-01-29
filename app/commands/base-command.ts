import {Game} from '../models/game';

/**
 * Class BaseCommand.
 * Interface for commands a player can give.
 */
export class BaseCommand {
  name: string;
  verbs: Array<string>;
  run(verb, arg) { }
}
