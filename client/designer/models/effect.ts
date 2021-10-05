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

  public excerpt(): string {
    if (this.text.length <= 50) {
      return this.text;
    }
    return this.text.slice(0, 50) + '...';
  }

}

export const TEXT_STYLES = {
  '': 'Normal',
  'emphasis': 'Bold',
  'success': 'Success (green)',
  'special': 'Special 1 (blue)',
  'special2': 'Special 1 (purple)',
  'warning': 'Warning (orange)',
  'danger': 'Danger (red)',
}
