import {Game} from "../models/game";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

/**
 * EventHandler class.
 * A class used to define a game event handler. This allows custom logic to
 * be defined in an adventure.
 *
 * When a game event is triggered during execution (usually during a command),
 * the game searches for a matching EventHandler and calls its run() method.
 *
 * The EventHandler objects should be instantiated in an adventure's "event-handlers" file.
 */
export class EventHandler {
  name: string;
  game: Game;
  run(arg1: number | string | Artifact | Monster, arg2?: Artifact | Monster, arg3?: Artifact | Monster) { }
}
