/**
 * Unit tests for The Abductor's Quarters
 */
import Game from "../../core/models/game";
import {expectEffectSeen, initLiveGame} from "../../core/utils/testing";
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
  game.slug = 'abductors-quarters';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("cave in", () => {
  // cave in
  game.player.moveToRoom(3);
  game.command_parser.run('e');
  expect(game.effects.get(1).seen).toBeTruthy();
});

test('golden sword', () => {
  // golden sword
  let sword = game.artifacts.get(20);
  game.player.moveToRoom(sword.room_id);
  game.artifacts.updateVisible();
  game.command_parser.run("get golden sword");
  expect(game.player.hasArtifact(20)).toBeTruthy();
  expect(game.player.weapon_id).toBe(20);
  game.command_parser.run("drop golden sword");
  expectEffectSeen(4);
  expect(game.player.hasArtifact(20)).toBeTruthy();
  game.command_parser.run("ready firebrand"); // weapon from mock data
  expect(game.player.hasArtifact(20)).toBeTruthy();
  game.monsters.get(6).moveToRoom();
  game.command_parser.run("give golden sword to kathryn");
  expect(game.player.hasArtifact(20)).toBeTruthy();
});

test('saying magic words', () => {
  let sword = game.artifacts.get(20);
  sword.moveToInventory();
  game.command_parser.run("say gilgamesh");
  expect(sword.monster_id).toBeNull();
  expect(game.monsters.get(15).room_id).toBe(game.player.room_id);
  let anderhauf = game.artifacts.get(17);
  anderhauf.moveToRoom();
  game.player.pickUp(anderhauf);
  game.command_parser.run("say anderhauf");
  expect(anderhauf.monster_id).toBeNull();
});

test('bottle', () => {
  let flint = game.artifacts.get(8);
  let bottle = game.artifacts.get(10);
  let doorway = game.artifacts.get(11);
  let doorway2 = game.artifacts.get(12);
  game.player.moveToRoom(37);
  bottle.moveToRoom();
  flint.moveToRoom();
  game.command_parser.run("light bottle");
  expect(bottle.room_id).toBeNull();
  expect(doorway.room_id).toBeNull();
  expect(doorway2.room_id).toBeNull();
});

test('throne secret', () => {
  game.monsters.get(1).destroy();
  game.monsters.get(2).destroy();
  game.player.moveToRoom(26); game.tick();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(26);
  game.command_parser.run('examine throne');
  expectEffectSeen(3);
  expect(game.artifacts.get(36).hidden).toBeFalsy();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(27);
});
