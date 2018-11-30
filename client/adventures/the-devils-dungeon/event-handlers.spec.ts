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

var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'the-devils-dungeon';
  return initLiveGame(game);
});

// TESTS

it("should have working event handlers", () => {

  game.player.moveToRoom(2);
  game.artifacts.get(10).moveToInventory();
  game.player.updateInventory();
  game.modal.mock_answers = ['no'];
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(2);
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(3);

  // blarney stone
  game.player.moveToRoom(20);
  game.monsters.get(8).destroy();
  let prev_ch = game.player.charisma;
  game.command_parser.run('kiss blarney stone');
  expect(game.player.charisma).toBe(prev_ch + 1);
  game.command_parser.run('kiss blarney stone');
  expect(game.history.getOutput().text).toBe("Sorry, only one kiss per customer!");
  expect(game.player.charisma).toBe(prev_ch + 1);

  // pickle
  game.player.moveToRoom(7);
  game.command_parser.run('say pickle');
  expect(game.artifacts.get(19).room_id).toBeNull();
  expect(game.artifacts.get(41).room_id).toBe(7);

  // uncomment the following for debugging
  // game.history.history.map(() => console.log(h); });

});
