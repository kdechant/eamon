/**
 * Unit tests for Attack of the Kretons
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
  game.slug = 'attack-of-the-kretons';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {

  // tavern
  game.mock_random_numbers = [2];  // for mike's random action
  game.command_parser.run("talk to mike");
  expect(game.effects.get(1).seen).toBeTruthy();
  expect(game.history.getLastOutput().text).toBe('Iron Mike cracks a walnut on his head.');
  game.command_parser.run("talk to minstrel");
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.effects.get(11).seen).toBeTruthy();
  expect(game.monsters.get(2).room_id).toBeNull();
  expect(game.monsters.get(3).room_id).toBe(1);
  expect(game.artifacts.get(8).room_id).toBe(1);

  // gate
  game.player.moveToRoom(9);
  game.artifacts.updateVisible();
  game.tick();
  game.command_parser.run('open gate');
  expect(game.history.getOutput(0).text).toBe("Don't be dumb.");

});
