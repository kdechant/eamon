/**
 * Unit tests for Mines of Moria
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
  runCommand,
  expectArtifactIsNotHere,
  expectArtifactIsHere
} from "../../core/utils/testing";
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
  game.slug = 'mines-of-moria';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("death trap - water", () => {
  movePlayer(38);
  game.command_parser.run('n');
  expect(game.died).toBeTruthy();
});

test("death trap - orcs", () => {
  movePlayer(66);
  runCommand('n');
  expect(game.died).toBeTruthy();
});

test("death trap - pit", () => {
  game.monsters.get(18).destroy();
  movePlayer(19);
  runCommand('e');
  expect(game.died).toBeTruthy();
});

test("death trap - thieves", () => {
  movePlayer(2);
  runCommand('s');
  expect(game.died).toBeTruthy();
});

test("negative connections", () => {
  movePlayer(33);
  runCommand('n');
  expect(game.history.getOutput().text).toBe('The cave-in blocks your path!');
  expect(game.player.room_id).toBe(33);
  movePlayer(73);
  runCommand('e');
  expectEffectSeen(13);
  expect(game.player.room_id).toBe(73);
});

test('pure lembas', () => {
  game.artifacts.get(29).moveToInventory();
  let hd = game.player.hardiness;
  runCommand('eat lembas');
  expect(game.player.hardiness).toBe(hd + 1);
});

test('flee', () => {
  movePlayer(36);
  game.command_parser.run('flee');
  expect(game.history.getOutput().text).toBe("You can't!")
  expect(game.player.room_id).toBe(36);
  game.monsters.get(26).destroy();
  movePlayer(68);
  game.command_parser.run('flee');
  expect(game.history.getOutput().text).toBe("You can't turn your back now!")
  expect(game.player.room_id).toBe(68);
});

test('mining', () => {
  game.artifacts.get(33).moveToInventory();
  movePlayer(30);
  runCommand('use tools');
  expect(game.artifacts.get(23).room_id).toBe(30);
  movePlayer(32);
  runCommand('use tools');
  expect(game.monsters.get(47).room_id).toBe(32);
  game.monsters.get(47).destroy();
  movePlayer(33);
  runCommand('n');
  expect(game.player.room_id).toBe(33);
  runCommand('use tools');
  expect(game.history.getOutput(1).text).toBe("You mined through the cave-in! You can now go north!");
  runCommand('n');
  expect(game.player.room_id).toBe(90);
});

test('keys and elevator', () => {
  game.artifacts.get(13).moveToInventory();
  game.artifacts.get(21).moveToInventory();
  movePlayer(89);
  expectArtifactIsNotHere(36);
  runCommand('use silver key');
  expect(game.history.getOutput().text).toBe("It doesn't fit.");
  expectArtifactIsNotHere(36);
  runCommand('use gold key');
  expectArtifactIsHere(36);
  runCommand('use lever');
  expect(game.player.room_id).toBe(79);
  runCommand('use lever');
  expect(game.player.room_id).toBe(89);
});
