/**
 * Unit tests for The Iron Prison
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
  runCommand, expectArtifactIsHere, expectArtifactIsNotHere, moveToInventory, expectMonsterIsHere
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
  game.slug = 'iron-prison';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("drink potion", () => {
  const potion = game.artifacts.get(51);
  potion.moveToInventory();
  const hd = game.player.hardiness;
  const ch = game.player.charisma;
  runCommand('drink potion');
  expectEffectSeen(6);
  expect(game.player.hardiness).toBe(hd + 2);
  expect(game.player.charisma).toBe(ch - 1);
});

test("drink bubbling stuff", () => {
  const stuff = game.artifacts.get(55);
  stuff.moveToInventory();
  runCommand('drink bubbling stuff');
  expectEffectSeen(7);
  expect(game.player.damage).toBe(game.player.hardiness / 2);
});

test("entrance trap door / green lever", () => {
  game.monsters.get(3).destroy();
  movePlayer(13);
  runCommand('n');
  expectEffectSeen(14);
  expect(game.player.room_id).toBe(14);
  runCommand('u');
  expect(game.player.room_id).toBe(13);
  runCommand('use lever');
  expectEffectSeen(12);
  runCommand('n');
  expect(game.player.room_id).toBe(15);
});

test("use blue lever", () => {
  moveToInventory(63); // light source
  movePlayer(59);
  runCommand('d');
  expect(game.player.room_id).toBe(59);
  runCommand('use lever');
  expectEffectSeen(15);
  expect(game.rooms.current_room.name).toBe("You are at the end of a north/south tunnel. (S/D)");
  runCommand('d');
  expect(game.player.room_id).toBe(60);
});

test('magic stone provides light', () => {
  const stone = game.artifacts.get(63);
  expect(stone.inventory_message).toBe('glowing');
  moveToInventory(63);
  movePlayer(15); // dark room
  expect(game.history.getOutput(1).text).toBe(game.rooms.getRoomById(15).description);
});

test('magic stone zaps morgoth', () => {
  moveToInventory(63);
  runCommand('use magic stone');
  expect(game.history.getOutput(0).text).toBe("Good idea, but not here.");
  movePlayer(79); // throne room
  expectMonsterIsHere(1);
  expectEffectNotSeen(5);
  runCommand('use magic stone')
  expectEffectSeen(5);
  expect(game.monsters.get(1).isAlive()).toBeFalsy();
  expectArtifactIsHere(33);
});

test("get crown to exit, no mithril", () => {
  moveToInventory(63); // light source
  game.monsters.get(1).destroy(); // morgoth
  game.artifacts.get(33).moveToRoom(79);
  movePlayer(79);
  runCommand('get crown');
  expectEffectSeen(1);
  expectEffectNotSeen(4);
  expectArtifactIsNotHere(20);
  expect(game.won).toBeTruthy();
});

test("get crown to exit, with mithril", () => {
  moveToInventory(63); // light source
  moveToInventory(41); // mithril ore
  game.monsters.get(1).destroy(); // morgoth
  game.artifacts.get(33).moveToRoom(79);
  movePlayer(79);
  runCommand('get crown');
  expectEffectSeen(1);
  expectEffectSeen(4);
  expectArtifactIsNotHere(41);
  expectArtifactIsHere(20);
  expect(game.won).toBeTruthy();
});

test("power", () => {
  // effect 1
  game.player.injure(5, true);
  game.triggerEvent('power', 5);
  expectEffectSeen(10);
  expect(game.player.damage).toBe(0);

  // effect 2
  const ac = game.player.armor_class;
  game.triggerEvent('power', 15);
  expect(game.player.spell_counters.aule).toBeGreaterThan(0);
  expect(game.player.armor_class).toBe(ac + 2);

  // effect 4
  game.triggerEvent('power', 99);
  expectEffectSeen(11);
  expect(game.player.damage).toBe(8);
});

test('Make sure player attacks correct orcs', () => {
  // room 40 has orc sergeant + group of 3 orcs in it.

  // also move the friendly super orc there.
  game.monsters.get(37).moveToRoom(42);
  movePlayer(42);

  const targets = game.player.getEnemyTargets('orc');
  expect(targets.length).toBe(2);
  expect(targets[0].id).toBe(48);
  expect(targets[1].id).toBe(51); // this returns the group monster object, not individuals
});

test('Umlaut support', () => {
  // The following requires the non-decorated version of the name to be saved as a synonym in the
  // monster/artifact record in the DB. (We don't automatically remove diacritics in the logic.)

  // recipient with an umlaut in their name (e.g., Eönwë)
  moveToInventory(1);
  runCommand('give grond to eonwe');
  expect(game.artifacts.get(1).monster_id).toBe(19);

  // giving an item with an umlaut in the name (e.g., Sword of Manwë)
  moveToInventory(8);
  runCommand('give sword of manwe to eonwe');
  expect(game.artifacts.get(8).monster_id).toBe(19);
});
