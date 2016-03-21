import {GameObject} from "./game-object";
import {Game} from "./game";
import {Monster} from "./monster";
import {CommandException} from "../utils/command.exception";

/**
 * Effect class. Represents special effect text that can be displayed
 * by scripts during game play.
 */
export class Effect extends GameObject {

  id: number;
  text: string;

}
