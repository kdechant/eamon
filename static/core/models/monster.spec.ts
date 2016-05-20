import {Game} from "../models/game";
import {initMockGame} from "../utils/testing";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

describe("Monster", function() {

  // initialize the test with the full repository of artifacts
  beforeEach(() => {
    initMockGame();
  });

  it("should know its carrying capacity", function() {
    let game = Game.getInstance();
    expect(game.monsters.get(1).maxWeight()).toEqual(400);
    expect(game.monsters.get(2).maxWeight()).toEqual(100);
  });

  it("should match synonyms", function() {
    let game = Game.getInstance();
    expect(game.monsters.get(3).match('alfred')).toBeTruthy(); // real name, but lowercase
    expect(game.monsters.get(3).match('al')).toBeTruthy(); // alias
    expect(game.monsters.get(3).match('albert')).toBeFalsy(); // alias

    // a multi-word alias
    expect(game.monsters.get(4).match('bad guy')).toBeTruthy(); // alias

    // monster with no aliases
    let king = game.monsters.get(2);
    expect(king.match('king')).toBeTruthy();
    expect(king.match('grand duke')).toBeFalsy();
  });

  it("should know if it is in the same room as the player", function() {
    let game = Game.getInstance();
    expect(game.player.room_id).toEqual(1, "FAILURE TO SETUP FOR TEST: player should be in room 1 at test start");

    let guard = game.monsters.get(1);
    expect(guard.isHere()).toBeTruthy();

    let king = game.monsters.get(2);
    expect(king.isHere()).toBeFalsy();
    king.moveToRoom(1);
    expect(king.isHere()).toBeTruthy();
    // put things back the way they were so this test doesn't contaminate other tests
    // king.moveToRoom(3);
  });
});
