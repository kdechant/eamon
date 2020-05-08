/**
 * Unit tests for Demongate
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame, expectEffectSeen, expectEffectNotSeen, playerAttackMock, movePlayer, runCommand} from "../../core/utils/testing";
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
  game.slug = 'demongate';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("enter room / after move effects", () => {
  // endTurn2
  expectEffectSeen(1);
  movePlayer(3);
  expectEffectSeen(2);
  movePlayer(10);
  expectEffectSeen(5);
  movePlayer(12);
  expectEffectSeen(6);
  movePlayer(19);
  expectEffectSeen(7);
  movePlayer(23);
  expectEffectSeen(8);
  movePlayer(60);
  expectEffectSeen(14);

  // afterMove
  movePlayer(45);
  game.artifacts.get(14).open();
  runCommand('n');
  expectEffectSeen(11);
  game.monsters.get(14).destroy();
  movePlayer(54);
  runCommand('n');
  expectEffectSeen(12);
});

test("use scroll", () => {
  game.artifacts.get(17).moveToInventory();
  runCommand('use scroll');
  expectEffectSeen(16);

  // wall of runes
  game.monsters.get(22).destroy();  // priest
  movePlayer(61);
  runCommand('n');
  expect(game.player.room_id).toBe(61);
  runCommand('use scroll');
  expectEffectSeen(17);
  expect(game.artifacts.get(37).room_id).toBeNull();
  expect(game.artifacts.get(70).isHere()).toBeTruthy();
  runCommand('n');
  expect(game.player.room_id).toBe(62);

  // bricked up wall
  movePlayer(51);
  runCommand('use scroll');
  expectEffectSeen(18);
});

test("exit stuff", () => {
  let ankh = game.artifacts.get(36);
  let lila = game.monsters.get(4);
  ankh.moveToInventory();
  lila.moveToRoom(63);
  movePlayer(63);
  game.modal.mock_answers = ['Yes'];
  runCommand('e');
  expect(game.won).toBeTruthy();
  expect(game.after_sell_messages.indexOf(game.effects.get(19).text)).toBeTruthy();
  expect(game.after_sell_messages.indexOf(game.effects.get(20).text)).toBeTruthy();
});
