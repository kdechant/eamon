/**
 * Unit tests for The Devil's Dungeon
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame} from "../../core/utils/testing";
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
  game.slug = 'the-devils-dungeon';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("crystal ball", () => {
  game.player.moveToRoom(2);
  game.artifacts.get(10).moveToInventory();
  game.modal.mock_answers = ['no'];
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(2);
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(3);
});

test("blarney stone", () => {
  game.player.moveToRoom(20);
  game.monsters.get(8).destroy();
  const prev_ch = game.player.charisma;
  game.command_parser.run('kiss blarney stone');
  expect(game.player.charisma).toBe(prev_ch + 1);
  game.command_parser.run('kiss blarney stone');
  expect(game.history.getOutput().text).toBe("Sorry, only one kiss per customer!");
  expect(game.player.charisma).toBe(prev_ch + 1);
});

test("pickle", () => {
  game.player.moveToRoom(7);
  game.command_parser.run('say pickle');
  expect(game.artifacts.get(19).room_id).toBeNull();
  expect(game.artifacts.get(41).room_id).toBe(7);
});

test("sack", () => {
  game.player.moveToRoom(12); game.tick();
  game.command_parser.run('read sack');
  expect(game.effects.get(6).seen).toBeTruthy();
  game.command_parser.run('open sack');
  expect(game.effects.get(3).seen).toBeTruthy();
  expect(game.artifacts.get(23).is_open).toBeFalsy();  // event handler returned false
  expect(game.died).toBeTruthy();
});
