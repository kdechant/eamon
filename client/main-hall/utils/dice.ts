
/**
 * Rolls a set of dice
 */
export default function diceRoll(dice: number, sides: number): number {
  let result = 0;
  for (let i = 0; i < dice; i++) {
    result += Math.floor(Math.random() * sides + 1);
  }
  return result;
}
