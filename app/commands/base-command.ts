import {Game} from "../models/game";

/**
 * Interface BaseCommand.
 * Interface for commands a player can give.
 */
export interface BaseCommand {
  name: string;
  verbs: string[];
  run(verb, arg);
}

/**
 * Class CustomCommand.
 * A class used to define custom commands
 */
export class CustomCommand implements BaseCommand {
  name: string;
  verbs: string[];
  game: Game;
  run(verb: string, arg: string) { }
}
