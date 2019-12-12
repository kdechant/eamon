/**
 * Unit tests for The Magic Kingdom
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
  game.slug = 'the-magic-kingdom';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("pass the guards", () => {
  game.player.moveToRoom(7); game.tick();
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(7);
  game.player.moveToRoom(24); game.tick();
  game.command_parser.run('n');
  expectEffectSeen(1);
  expect(game.player.hasArtifact(16)).toBeTruthy();
  game.player.moveToRoom(7); game.tick();
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(12);
  game.player.moveToRoom(7); game.tick();
  game.command_parser.run('give pass to guard');
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(12);
});

test("dynamite", () => {
  game.artifacts.get(17).moveToInventory();
  game.player.moveToRoom(6); game.tick();
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(6);
  game.command_parser.run('open boulder');
  expect(game.artifacts.get(18).is_open).toBeFalsy();
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(6);
  game.command_parser.run('use dyna');
  expect(game.artifacts.get(17).isHere()).toBeFalsy();
  expect(game.artifacts.get(18).isHere()).toBeFalsy();
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(26);
});

test("waterfall", () => {
  game.player.moveToRoom(19); game.tick();
  game.command_parser.run('s');
  expectEffectSeen(5);
  expectEffectSeen(6);
  expect(game.died).toBeTruthy();
});

test("doughnut", () => {
  expect(game.died).toBeFalsy();
  game.player.moveToRoom(32); game.tick();
  game.command_parser.run('eat doughnut');
  expect(game.died).toBeTruthy();
});

test("dragon", () => {
  game.artifacts.get(11).moveToInventory();
  game.player.updateInventory();
  game.player.moveToRoom(33);
  game.skip_battle_actions = true; game.tick();
  expect(game.monsters.get(10).isHere()).toBeTruthy();
  game.command_parser.run('give doughnut to dragon');
  expect(game.artifacts.get(11).isHere()).toBeFalsy();
  expect(game.monsters.get(10).isHere()).toBeFalsy();
  game.command_parser.run('free julene');
  expect(game.monsters.get(11).isHere()).toBeTruthy();
  expect(game.artifacts.get(12).isHere()).toBeTruthy();
});

test("julene", () => {
  game.monsters.get(11).moveToRoom(24);
  game.player.moveToRoom(24); game.tick(); game.tick();
  let gold = game.player.gold;
  game.command_parser.run('n');
  expectEffectSeen(3);
  expect(game.player.gold).toBe(gold + 1000);
  expect(game.won).toBeTruthy();
});

test("sadness", () => {
  game.artifacts.get(30).moveToInventory();
  game.player.moveToRoom(24); game.tick();
  let gold = game.player.gold;
  game.command_parser.run('n');
  expectEffectSeen(2);
  expect(game.player.gold).toBe(gold);
  expect(game.won).toBeTruthy();
});

function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}
