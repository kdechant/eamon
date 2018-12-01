import Game from "../../core/models/game";
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
  game.slug = 'cliffs-of-fire';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {

  // free elf
  game.player.moveToRoom(6);
  game.command_parser.run('free elf');
  expect(game.artifacts.get(32).isHere()).toBeTruthy();
  expect(game.monsters.get(3).isHere()).toBeFalsy();
  game.monsters.get(2).destroy();
  game.command_parser.run('free elf');
  expect(game.artifacts.get(32).isHere()).toBeFalsy();
  expect(game.monsters.get(3).isHere()).toBeTruthy();

  // black wand stuff
  game.player.moveToRoom(25);
  // the effect #2 logic doesn't work. See event-handlers.ts
  // game.command_parser.run('w');
  // expect(game.effects.get(2).seen).toBeTruthy('effect 2 was not shown');
  game.artifacts.get(3).moveToInventory();
  game.command_parser.run('wave wand');
  expect(game.effects.get(3).seen).toBeTruthy();
  expect(game.artifacts.get(13).room_id).toBeNull();

  // power stuff
  game.triggerEvent('power', 85);
  expect(game.player.damage).toBe(Math.floor(game.player.hardiness / 2));
  game.triggerEvent('power', 99);
  expect(game.player.damage).toBe(0);

  // exit
  game.player.moveToRoom(1);
  game.modal.mock_answers = ['no'];
  game.command_parser.run('n');
  expect(game.won).toBeFalsy();
  game.modal.mock_answers = ['yes'];
  game.command_parser.run('n');
  expect(game.won).toBeTruthy();

});
