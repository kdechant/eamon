import Game from "../models/game";
// import {initMockGame} from "../utils/testing";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

describe("Game class", function() {

  // initialize the test with the full mock game data
  let game = Game.getInstance();
  beforeEach(() => {
    // initMockGame();
  });

  it("should roll some dice", function() {
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
  });

});
