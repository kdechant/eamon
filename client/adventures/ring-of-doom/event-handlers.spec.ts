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

test("pick up the ring", () => {
  runCommand('s');
  expect(game.history.getOutput().text).toBe("Pick up the ring, buddy.");
  expect(game.player.room_id).toBe(1);
  runCommand('get ring');
  runCommand('s');
  expect(game.player.room_id).toBe(63);
});

test("wear the ring", () => {
  runCommand('get ring');
  runCommand('wear ring');
  expectEffectSeen(3);
  expectEffectSeen(4);
  expect(game.artifacts.get(2).is_worn).toBeFalsy();
});

test("flask", () => {
  const flask = game.artifacts.get(10);
  flask.moveToInventory();
  expect(flask.is_lit).toBeFalsy();
  runCommand('read flask');
  expectEffectSeen(8);
  runCommand('light flask');
  expectEffectSeen(11);
  expect(flask.is_lit).toBeTruthy();
  flask.is_lit = false;
  runCommand("say githoneil a elbereth");
  expectEffectSeen(11);
  expect(flask.is_lit).toBeTruthy();
  flask.is_lit = false;
  runCommand('use flask');
  expect(flask.is_lit).toBeTruthy();
});

test("watchers", () => {
  game.artifacts.get(2).moveToInventory();
  game.artifacts.get(10).moveToInventory();
  movePlayer(50);
  runCommand('w');
  expect(game.history.getOutput().text).toBe("The watchers block your path!");
  expect(game.player.room_id).toBe(50);
  runCommand("say aiya elenion ancalima");
  expectEffectSeen(12);
  expectEffectSeen(13);
  expect(game.player.room_id).toBe(51);

  game.player.moveToRoom(52);
  runCommand('e');
  expect(game.history.getOutput().text).toBe("The watchers block your path!");
  expect(game.player.room_id).toBe(52);
  runCommand("say aiya elenion ancalima");
  expect(game.player.room_id).toBe(73);
});

test('lost in desert', () => {
  game.artifacts.get(2).moveToInventory();
  const sam = game.monsters.get(2);
  sam.moveToRoom(10);
  movePlayer(10);
  runCommand('s');
  expectEffectSeen(5);
  expect(game.player.damage).toBe(game.player.hardiness / 2);
  expect(sam.damage).toBe(sam.hardiness / 2);
  runCommand('s');
  expect(game.player.damage).toBe(Math.floor(game.player.hardiness * 3 / 4));
  expect(sam.isAlive()).toBeFalsy();
});

test('narsil', () => {
  game.artifacts.get(2).moveToInventory();
  game.artifacts.get(2).is_lit = true;

  const other_wpn = game.artifacts.get(3);
  other_wpn.moveToInventory();
  const shards = game.artifacts.get(1);
  shards.moveToInventory();
  game.modal.mock_answers = [other_wpn.name];
  movePlayer(57);
  runCommand('use smithy equipment');
  expect(game.history.getOutput().text).toBe("Nothing happens.");
  expect(shards.isHere()).toBeTruthy();

  game.modal.mock_answers = [shards.name];
  shards.moveToInventory();
  movePlayer(57);
  runCommand('use smithy equipment');
  expect(game.history.getOutput().text).toBe("You have reforged Narsil!");
  expect(shards.isHere()).toBeFalsy();
  expect(game.artifacts.get(8).isHere()).toBeTruthy();
});

test("end game (with gollum)", () => {
  runCommand('get ring');
  game.monsters.get(4).moveToRoom(72);
  movePlayer(72);
  runCommand('drop ring');
  expectEffectSeen(6);
  expectEffectSeen(7);
  expectEffectSeen(1);
  expectEffectSeen(2);
  expect(game.won).toBeTruthy();
});

test("end game (without gollum)", () => {
  runCommand('get ring');
  game.player.moveToRoom(72);
  runCommand('drop ring');
  expectEffectSeen(7);
  expectEffectSeen(1);
  expectEffectSeen(2);
  expect(game.won).toBeTruthy();
});

test('power', () => {
  game.triggerEvent('power', 1);
  expectEffectSeen(9);
  game.triggerEvent('power', 20);
  expectEffectSeen(10);
  game.player.damage = 10;
  game.triggerEvent('power', 99);
  expect(game.player.damage).toBe(0);
});
