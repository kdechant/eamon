import Game from "./game";

const game = new Game();

describe("Game class", function() {

  test("should roll some dice", () => {
    let roll: number;
    // using sides = 1 to avoid having to worry about random numbers
    expect(game.diceRoll(1, 1)).toBe(1);
    expect(game.diceRoll(3, 1)).toBe(3);
    // edge cases
    expect(game.diceRoll(1, 0)).toBe(0);
    expect(game.diceRoll(3, -1)).toBe(-3);
    // test some random numbers
    for (let i = 0; i < 20; i++) {
      roll = game.diceRoll(1, 5);
      expect(roll).toBeGreaterThan(0);
      expect(roll).toBeLessThan(6);
      roll = game.diceRoll(1, -5);
      expect(roll).toBeGreaterThan(-6);
      expect(roll).toBeLessThan(0);
    }

    // test the mock random numbers feature
    game.mock_random_numbers = [42, 5, 99];
    expect(game.diceRoll(1, 100)).toBe(42);
    expect(game.diceRoll(1, 100)).toBe(5);
    expect(game.diceRoll(1, 100)).toBe(99);

  });

});
