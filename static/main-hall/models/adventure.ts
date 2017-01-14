import {GameObject} from "../../core/models/game-object";

/**
 * Adventure class. Represents adventures the player can go on.
 */
export class Adventure extends GameObject {

  description: string;
  full_description: string;
  slug: string;
  edx: string;
  tags: string[];

}
