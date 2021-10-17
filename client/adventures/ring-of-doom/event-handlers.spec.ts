/**
 * Unit tests for #115: Ring of Doom
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
  runCommand
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
  game.slug = 'ring-of-doom';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("flask light", () => {
  game.player.moveToRoom(50);
  const flask = game.artifacts.get(10);
  flask.moveToInventory();
  expect(flask.is_lit).toBeFalsy();
  runCommand("say githoneil a elbereth");
  expectEffectSeen(11);
  expect(flask.is_lit).toBeTruthy();
});

test("watchers", () => {
  game.artifacts.get(10).moveToInventory();
  game.player.moveToRoom(50);
  runCommand('w');
  expect(game.history.getOutput().text).toBe("The watchers block your path!")
  expect(game.player.room_id).toBe(50);
  runCommand("say aiya elenion ancalima");
  expectEffectSeen(12);
  expectEffectSeen(13);
  expect(game.player.room_id).toBe(51);

  game.player.moveToRoom(52);
  runCommand('e');
  expect(game.history.getOutput().text).toBe("The watchers block your path!")
  expect(game.player.room_id).toBe(52);
  runCommand("say aiya elenion ancalima");
  expect(game.player.room_id).toBe(73);
});

test("effect 2", () => {
  // do some game actions and write assertions here

  // for example:
  expect(game.rooms.get(1)).not.toBeNull();

});
