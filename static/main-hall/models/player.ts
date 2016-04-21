import {GameObject} from "../../core/models/game-object";

/**
 * Player class. Represents players in the main hall
 */
export class Player extends GameObject {

  gender: string;
  hardiness: number;
  agility: number;
  charisma: number;
  count: number;
  gold: number;
  gold_in_bank: number;

}
