/**
 * Unit tests for Stronghold of Kahr-Dur
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'stronghold-of-kahr-dur';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {

  // monster adjustable hardiness (based on demo character's 2d6 weapon)
  expect(game.monsters.get(1).hardiness).toBe(6);
  expect(game.monsters.get(2).hardiness).toBe(12);
  expect(game.monsters.get(10).hardiness).toBe(24);

  game.artifacts.get(9).moveToInventory(); // light
  game.command_parser.run('light whitestone');

  // amulet + forest
  game.player.moveToRoom(92); game.tick();
  game.command_parser.run('n');
  expectEffectSeen(45);
  expect(game.player.room_id).toBe(92);
  game.artifacts.get(18).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(65);

  // portcullis and knock spell
  game.player.moveToRoom(43); game.tick();
  game.command_parser.run('open portcullis');
  expect(game.artifacts.get(7).is_open).toBeFalsy();
  game.artifacts.get(19).moveToInventory();
  game.artifacts.get(20).moveToInventory();
  game.artifacts.get(21).moveToInventory();
  game.artifacts.get(22).moveToInventory();
  game.artifacts.get(24).moveToInventory();
  game.command_parser.run('pu ph into cau');
  game.command_parser.run('pu ru into cau');
  game.command_parser.run('pu der into cau');
  game.command_parser.run('pu eed into cau');
  game.command_parser.run('say knock nikto mellon');
  expectEffectSeen(51);
  expect(game.data['cauldron']).toBeTruthy();
  game.mock_random_numbers = [1];
  game.command_parser.run("power");
  expectEffectSeen(52);
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  expect(game.artifacts.get(8).is_open).toBeTruthy();
  expect(game.artifacts.get(24).isHere()).toBeFalsy();
  game.command_parser.run('clo eas');
  expect(game.artifacts.get(7).is_open).toBeFalsy();
  game.command_parser.run('ope eas');
  expect(game.artifacts.get(7).is_open).toBeTruthy();

});

function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}
