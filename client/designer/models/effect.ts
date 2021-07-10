import GameObject from "./game-object";

/**
 * Effect class. Represents special effect text that can be displayed
 * by scripts during game play.
 */
export class Effect extends GameObject {

  id: number;
  text: string;
  style: string;
  next: number;  // another effect chained onto this one
  next_inline: number;  // a chained effect that is printed without a paragraph break
  replacements: Record<string, string>;  // strings that will be replaced within the effect text
}
