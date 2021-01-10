/**
 * Unit tests for Assault on the Mole Man
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
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
  game.slug = 'assault-on-the-mole-man';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {

  // gates
  game.artifacts.get(2).moveToInventory();
  game.monsters.get(16).destroy();  // guards
  game.player.moveToRoom(55); game.tick();
  game.command_parser.run('use device');
  expect(game.artifacts.get(3).is_open).toBeTruthy();
  game.command_parser.run('use device');
  expect(game.artifacts.get(3).is_open).toBeFalsy();
  game.player.moveToRoom(25); game.tick();
  expect(game.artifacts.get(5).isHere()).toBeTruthy();
  game.command_parser.run('use device');
  expect(game.artifacts.get(5).is_open).toBeTruthy();
  game.command_parser.run('use device');
  expect(game.artifacts.get(5).is_open).toBeFalsy();

  // buttons
  game.player.moveToRoom(59); game.tick();
  game.command_parser.run('free woman');
  expect(game.artifacts.get(22).isHere()).toBeTruthy();
  game.command_parser.run('push button');
  expect(game.artifacts.get(22).isHere()).toBeFalsy();
  expect(game.monsters.get(4).isHere()).toBeTruthy();

  game.player.moveToRoom(60); game.tick();
  game.command_parser.run('free man');
  expect(game.artifacts.get(21).isHere()).toBeTruthy();
  game.command_parser.run('push button');
  expect(game.artifacts.get(21).isHere()).toBeFalsy();
  expect(game.monsters.get(2).isHere()).toBeTruthy();

  // console


});
