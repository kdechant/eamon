import Game from "../models/game";
import {initMockGame} from "../utils/testing";
import {Monster} from "../models/monster";

var game = new Game();

describe("Monster", function() {

  beforeAll(() => { global['game'] = game; });
  afterAll(() => { delete global['game']; });

  // initialize the test with the full mock game data
  beforeEach(() => {
    return initMockGame(game);
  });

  it("should know if an artifact is within reach of the player", function() {

    // something the player is carrying
    let torch = game.artifacts.getLocalByName('torch');
    expect(torch).not.toBeNull();
    expect(torch.id).toBe(9);

    // something in the room
    let bread = game.artifacts.getLocalByName('bread');
    expect(bread).not.toBeNull();
    expect(bread.id).toBe(7);

    // an embedded artifact
    bread.embedded = true;
    let bread2 = game.artifacts.getLocalByName('bread', false);  // not revealing
    expect(bread2).not.toBeNull();
    expect(bread2.id).toBe(7);
    expect(bread2.embedded).toBe(true);
    let bread3 = game.artifacts.getLocalByName('bread');  // revealing
    expect(bread3).not.toBeNull();
    expect(bread3.id).toBe(7);
    expect(bread3.embedded).toBe(false);

    // something that is elsewhere
    let chest = game.artifacts.getLocalByName('chest');
    expect(chest).toBeNull();

    // something that doesn't match any artifact in the game
    let spaceship = game.artifacts.getLocalByName('spaceship');
    expect(spaceship).toBeNull();

  });

  it("should match by exact name", function() {
    game.artifacts.get(3).moveToRoom(); // magic sword
    game.artifacts.get(8).moveToRoom(); // sword
    // if two artifacts are here and one's name is contained in the other's
    // name, it should give preference to the exact match
    let a = game.artifacts.getLocalByName('sword');
    // expect(a.id).toBe(8, "Fail: 'sword' matched 'magic sword' instead of the exact match 'sword'");
  });

  it("should de-duplicate artifact names on game start", function() {
    expect(game.artifacts.get(19).name).toBe("mace#");  // duplicate name of a player weapon
    expect(game.artifacts.get(21).name).toBe("dagger");  // not a duplicate
  });
});
