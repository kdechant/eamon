/**
 * Unit tests for The Black Castle of Nagog
 */
import Game from "../../core/models/game";
import {expectMonsterIsHere, initLiveGame, movePlayer, runCommand} from "../../core/utils/testing";
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
  game.slug = 'black-castle-of-nagog';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("two-sided secret door", () => {
  // two-sided secret door
  game.monsters.get(28).destroy(); // get rats out of the way
  movePlayer(28);
  game.endTurn();
  runCommand("look brick wall");
  expect(game.artifacts.get(69).hidden).toBeFalsy();
  expect(game.artifacts.get(70).hidden).toBeFalsy();
  // also test regular open/close
  runCommand("close brick wall");
  expect(game.artifacts.get(69).is_open).toBeFalsy();
  expect(game.artifacts.get(70).is_open).toBeFalsy();
  runCommand("open brick wall");
  expect(game.artifacts.get(69).is_open).toBeTruthy();
  expect(game.artifacts.get(70).is_open).toBeTruthy();
});

test("mummy in tomb", () => {
  movePlayer(43);
  runCommand("open tomb");
  expect(game.monsters.get(17).room_id).toBe(43);
});

test("ghoul in coffin", () => {
  movePlayer(47);
  runCommand("open coffin");
  expect(game.monsters.get(6).room_id).toBe(47);
  expect(game.artifacts.get(12).room_id).toBeNull();
  expect(game.artifacts.get(12).container_id).toBe(60);
  expect(game.artifacts.get(60).contents.length).toBe(1);
});

test("pudding in kettle", () => {
  movePlayer(20);
  runCommand("look kettle"); // already open; monster should appear when revealed
  expect(game.monsters.get(4).room_id).toBe(20);
});

test("bridge", () => {
  // bridge
  game.monsters.get(10).destroy(); // get harpy out of the way
  movePlayer(64);
  game.artifacts.get(1).moveToInventory();
  game.player.updateInventory();
  runCommand('say morgar');
  expect(game.data['bridge']).toBeTruthy();
});

test("rubies", () => {
  game.monsters.get(5).destroy(); // get gargoyle out of the way
  game.artifacts.get(14).moveToInventory();
  movePlayer(65);
  game.artifacts.get(71).reveal();
  runCommand("put rubies into sculpture");
  expect(game.artifacts.get(71).is_open).toBeTruthy();
});

test("let's summon demons", () => {
  game.artifacts.get(2).moveToInventory();
  game.player.updateInventory();
  // clear the room of monsters, so their combat routines don't use up our mock random numbers
  game.monsters.all.filter(m => m.room_id == 28).forEach(m => m.destroy());
  movePlayer(28); // vrock won't appear in room 64+; balor won't appear in room 29+
  game.mock_random_numbers = [1];
  game.tick();
  expect(game.data['vrock appeared']).toBeTruthy();
  expectMonsterIsHere(29);
  game.monsters.get(29).destroy(); // get vrock out of the way
  game.mock_random_numbers = [1];
  game.tick();
  expect(game.data['balor appeared']).toBeTruthy();
  expectMonsterIsHere(30);
});
