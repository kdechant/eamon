import Game from "../models/game";
import {Artifact} from "../models/artifact";
import {initMockGame} from "../utils/testing";

const game = new Game();

describe("Artifact", function() {

  // initialize the test with the full mock game data
  beforeEach(() => {
    return initMockGame(game);
  });

  beforeAll(() => {
    global['game'] = game;
  });
  afterAll(() => {
    delete global['game'];
  });

  test("max damage", function() {
    // non-weapon
    expect(game.artifacts.get(1).maxDamage()).toEqual(0);
    // magic sword
    expect(game.artifacts.get(3).maxDamage()).toEqual(16);
    // spear
    expect(game.artifacts.get(4).maxDamage()).toEqual(5);
  });

  test("match synonyms and partial names", function() {
    expect(game.artifacts.get(5).match('gold key')).toBeTruthy(); // real name
    expect(game.artifacts.get(5).match('gold')).toBeTruthy(); // partial match (beginning)
    expect(game.artifacts.get(5).match('go')).toBeTruthy(); // partial match (beginning)
    expect(game.artifacts.get(5).match('ke')).toBeFalsy(); // EDX does not match the middle of strings. Kept it this way to make it simpler.
    expect(game.artifacts.get(5).match('key')).toBeTruthy(); // partial match (end)

    expect(game.artifacts.get(12).match('chest')).toBeTruthy(); // real name
    expect(game.artifacts.get(12).match('box')).toBeTruthy(); // alias

    expect(game.artifacts.get(18).match('vault')).toBeTruthy();
    expect(game.artifacts.get(18).match('door')).toBeTruthy();
    expect(game.artifacts.get(18).match('not a match')).toBeFalsy();

    // item with no aliases
    expect(game.artifacts.get(1).match('throne')).toBeTruthy();
    expect(game.artifacts.get(1).match('not a match')).toBeFalsy();
  });

  test("go into and out of containers", function() {
    const torch = game.artifacts.get(9);
    const chest = game.artifacts.get(12);
    expect(torch.monster_id).toBe(0);
    torch.putIntoContainer(chest);
    expect(torch.container_id).toBe(12);
    expect(torch.room_id).toBeNull();
    expect(torch.monster_id).toBeNull();

    game.player.moveToRoom(4);
    const jewels = game.artifacts.get(13);
    expect(jewels.container_id).toBe(12);
    jewels.removeFromContainer();
  });

  test("move to the correct room", function() {
    const torch = game.artifacts.get(9);
    expect(torch.room_id).toBeNull();
    expect(torch.monster_id).toBe(0);
    torch.moveToRoom(5);
    expect(torch.room_id).toBe(5);
    expect(torch.monster_id).toBeNull();

    const jewels = game.artifacts.get(13);
    jewels.moveToRoom(); // move to player's room
    expect(jewels.room_id).toBe(1);
    expect(jewels.monster_id).toBeNull();
    expect(jewels.container_id).toBeNull();
  });
});
