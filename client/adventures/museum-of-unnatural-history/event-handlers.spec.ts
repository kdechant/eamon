/**
 * Unit tests for Museum of Unnatural History
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
  runCommand, expectArtifactIsNotHere, expectArtifactIsHere
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
  game.slug = 'museum-of-unnatural-history';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("note from professor", () => {
  // this appears in the first room
  expectEffectSeen(1);
});

test("desert", () => {
  runCommand('s');
  expectEffectSeen(3);
  expect(game.player.room_id).toBe(1);
  expect(game.player.damage).toBe(game.player.hardiness / 2);
});

test("window", () => {
  movePlayer(34);
  runCommand('w');
  expectEffectSeen(4);
  expect(game.died).toBeTruthy();
});

test("elevator shaft", () => {
  movePlayer(42);
  runCommand('s');
  expectEffectSeen(5);
  expect(game.died).toBeTruthy();
});

test("get stuff", () => {
  movePlayer(game.artifacts.get(25).room_id);
  runCommand('get red crystal');
  expect(game.history.getOutput(1).text).toBe('(The crystal feels warm.)');

  movePlayer(game.artifacts.get(20).room_id);
  runCommand('get death ore');
  expectEffectSeen(7);
  expect(game.player.damage).toBe(game.player.hardiness / 2);
});

test('use feather', () => {
  const hyena = game.monsters.get(19);
  hyena.reaction = Monster.RX_NEUTRAL;
  game.artifacts.get(4).moveToInventory();
  runCommand('use feather');
  expect(hyena.reaction).toBe(Monster.RX_NEUTRAL);
  movePlayer(hyena.room_id);
  runCommand('use feather');
  expect(hyena.reaction).toBe(Monster.RX_FRIEND);
});

test('use gum', () => {
  game.artifacts.get(6).moveToInventory();
  runCommand('use gum');
  expect(game.artifacts.get(22).room_id).toBeNull();
  movePlayer(42);
  runCommand('use gum');
  expect(game.artifacts.get(22).isHere()).toBeTruthy();
});

test('use nitrates', () => {
  game.artifacts.get(17).moveToInventory();
  runCommand('use nitrates');
  expect(game.data.fertilized).toBeFalsy();
  expect(game.artifacts.get(16).room_id).toBeNull();
  movePlayer(37);
  runCommand('use nitrates');
  expect(game.data.fertilized).toBeTruthy();
  expect(game.artifacts.get(16).isHere()).toBeTruthy();
});

test('use red crystal', () => {
  game.artifacts.get(25).moveToInventory();
  runCommand('use red crystal');
  expectEffectNotSeen(2);
  expect(game.won).toBeFalsy();
  movePlayer(50);
  runCommand('use red crystal');
  expectEffectSeen(2);
  expect(game.won).toBeTruthy();
});

test('use other crystals', () => {
  game.artifacts.get(29).moveToInventory();
  game.artifacts.get(30).moveToInventory();
  movePlayer(50);
  runCommand('use green crystal');
  expect(game.history.getOutput(0).text).toBe("Nothing happened...");
  expect(game.won).toBeFalsy();
  runCommand('use blue crystal');
  expect(game.history.getOutput(0).text).toBe("Nothing happened...");
  expect(game.won).toBeFalsy();
});

test('use bomb', () => {
  movePlayer(2);
  game.artifacts.get(34).moveToInventory();
  runCommand('use bomb');
  expect(game.history.getOutput(0).text).toBe("You must find a way to light the fuse first!");
});

test('gunpowder', () => {
  runCommand('assemble gunpowder');
  expectEffectSeen(14);
  expectArtifactIsNotHere(35);
  game.artifacts.get(1).moveToInventory();
  game.artifacts.get(7).moveToInventory();
  game.artifacts.get(19).moveToInventory();
  runCommand('assemble gunpowder');
  expectEffectSeen(12);
  expectArtifactIsHere(35);
});

test('make bomb', () => {
  runCommand('assemble bomb');
  expectEffectSeen(15);
  expectArtifactIsNotHere(34);

  game.artifacts.get(14).moveToInventory();
  game.artifacts.get(16).moveToInventory();
  game.artifacts.get(35).moveToInventory();
  runCommand('assemble bomb');
  expectEffectSeen(13);
  expectArtifactIsHere(34);
  expectArtifactIsNotHere(14);
  expectArtifactIsNotHere(16);
  expectArtifactIsNotHere(35);
});

const LETTER_ARTIFACTS = [2, 8, 9, 11, 27, 31, 32];

test('no boom', () => {
  game.artifacts.get(34).moveToInventory();
  runCommand('say flaming');
  expect(game.history.getOutput(1).text).toBe("Nothing happened.");
  expectArtifactIsHere(34);
});

test('boom', () => {
  const bomb = game.artifacts.get(34);
  const doorway = game.artifacts.get(33);
  bomb.moveToInventory();
  for (const id of LETTER_ARTIFACTS) {
    game.artifacts.get(id).moveToInventory();
  }
  movePlayer(doorway.room_id);
  runCommand('say flaming');
  expectEffectSeen(11);
  expectArtifactIsNotHere(33);
  expectArtifactIsNotHere(34);
});

test('blow self up', () => {
  const bomb = game.artifacts.get(34);
  bomb.moveToInventory();
  for (const id of LETTER_ARTIFACTS) {
    game.artifacts.get(id).moveToInventory();
  }
  runCommand('say flaming');
  expectEffectSeen(10);
  expect(game.died).toBeTruthy();
});
