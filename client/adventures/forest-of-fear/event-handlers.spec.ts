/**
 * Unit tests for Forest of Fear #109
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {
  initLiveGame,
  expectEffectSeen,
  expectEffectNotSeen,
  playerAttackMock,
  movePlayer,
  runCommand, expectMonsterIsHere, expectMonsterIsNotHere
} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

const game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'forest-of-fear';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("poison 1", () => {
  game.artifacts.get(13).moveToInventory();
  runCommand('eat food');
  expectEffectSeen(2);
  expect(game.died).toBeTruthy();
});

test("poison 2", () => {
  movePlayer(59);
  runCommand('drink well');
  expectEffectSeen(2);
  expect(game.died).toBeTruthy();
});

test("aragorn", () => {
  game.monsters.get(49).destroy();  // guard
  game.artifacts.get(17).moveToInventory();
  movePlayer(67);
  runCommand('free ranger');
  expectEffectSeen(3);
});

test('power', () => {
  game.mock_random_numbers = [
    1,  // spell succeeds
    0,  // no increase
    20  // effect roll
  ];
  runCommand('power');
  expect(game.history.getOutput(0).text).toBe("A tree branch falls on your head!");
  game.mock_random_numbers = [1, 0, 49];
  runCommand('power');
  expect(game.history.getOutput(0).text).toBe("A strong wind knocks a tree down in back of you!");
  game.mock_random_numbers = [1, 0, 99];
  runCommand('power');
  expect(game.history.getOutput(0).text).toBe("Wind whips through the forest, scaring away a flock of birds.");
  // different effect in castle
  movePlayer(43);
  game.mock_random_numbers = [1, 0, 49];
  runCommand('power');
  expect(game.history.getOutput(0).text).toBe("You hear a loud sonic boom which echoes through the castle!");
});
