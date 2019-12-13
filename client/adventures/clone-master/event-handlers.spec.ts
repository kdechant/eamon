/**
 * Unit tests for Assault on the Clone Master
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
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
  game.slug = 'clone-master';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("big fight", () => {
  game.player.moveToRoom(4, true);
  game.command_parser.run("attack clone army");
  expect(game.effects.get(9).seen).toBeTruthy();
  expect(game.monsters.get(4).reaction).toBe(Monster.RX_NEUTRAL);
  expect(game.monsters.get(5).reaction).toBe(Monster.RX_NEUTRAL);
  expect(game.monsters.get(6).room_id).toBeNull();
  // main gate blocked
  game.command_parser.run("s");
  expect(game.player.room_id).toBe(4);
});

function getDynamite() {
  game.player.moveToRoom(2); game.tick();
  game.command_parser.run('get dynamite');
}

test('west wall', () => {
  getDynamite();
  let dynamite = game.artifacts.get(5);
  let crack = game.artifacts.get(6);
  game.player.moveToRoom(6);
  game.command_parser.run('e');
  expect(game.player.room_id).toBe(6);
  game.command_parser.run('open crack');
  expect(crack.is_open).toBeFalsy();
  game.command_parser.run('drop dynamite');
  game.command_parser.run('light dynamite');
  expectEffectSeen(1);
  expect(dynamite.room_id).toBeNull();
  expect(crack.room_id).toBeFalsy();
  expect(game.artifacts.get(9).room_id).toBe(6);
  expect(game.artifacts.get(10).room_id).toBe(11);
  game.command_parser.run('e');
  expect(game.player.room_id).toBe(11);
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(6);
});

test('east wall', () => {
  getDynamite();
  let dynamite = game.artifacts.get(5);
  let crack = game.artifacts.get(8);
  game.player.moveToRoom(8);
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(8);
  game.command_parser.run('open crack');
  expect(crack.is_open).toBeFalsy();
  game.command_parser.run('drop dynamite');
  game.command_parser.run('light dynamite');
  expectEffectSeen(1);
  expect(dynamite.room_id).toBeNull();
  expect(crack.room_id).toBeFalsy();
  expect(game.artifacts.get(11).room_id).toBe(8);
  expect(game.artifacts.get(12).room_id).toBe(16);
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(16);
  game.command_parser.run('e');
  expect(game.player.room_id).toBe(8);
});

test('inner gate', () => {
  game.player.moveToRoom(20);
  expect(game.artifacts.get(22).is_open).toBeFalsy();
  game.player.moveToRoom(14);
  game.player.pickUp(game.artifacts.get(30));
  game.player.wear(game.artifacts.get(30));
  game.player.moveToRoom(20);
  game.tick();
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.artifacts.get(22).is_open).toBeTruthy();

  game.command_parser.run('s');
  // should prop open the gates, if they are still intact
  expect(game.data['inner gate open']).toBeTruthy();
  expect(game.effects.get(3).seen).toBeTruthy();
  expect(game.artifacts.get(22).is_open).toBeTruthy();
  game.player.moveToRoom(20);
  game.command_parser.run('close gate');
  expect(game.artifacts.get(22).is_open).toBeTruthy();
});

test('cannon', () => {
  game.monsters.all.filter(m => m.room_id === 18).forEach(m => m.destroy());
  game.player.moveToRoom(18); game.tick();
  game.modal.mock_answers = ['Battlefield', 'Power Station', 'Inner Gate'];
  game.command_parser.run('use cannon');
  expect(game.effects.get(5).seen).toBeTruthy();
  game.command_parser.run('use cannon');
  expect(game.effects.get(6).seen).toBeTruthy();
  game.command_parser.run('use cannon');
  expect(game.effects.get(7).seen).toBeTruthy();
  expect(game.artifacts.get(22).room_id).toBeNull();
  expect(game.artifacts.get(23).room_id).toBe(20);
  // broken
  expect(game.effects.get(8).seen).toBeTruthy();
  expect(game.artifacts.get(19).room_id).toBeNull();
  expect(game.artifacts.get(20).room_id).toBe(18);
});

test('dragon', () => {
  game.player.moveToRoom(34);
  game.command_parser.run('free dragon');
  expect(game.monsters.get(19).room_id).toBeNull();
  expect(game.monsters.get(20).children.length).toBe(12);
});

test('tesla coil', () => {
  game.monsters.all
    .filter(m => m.room_id === 30)
    .forEach(m => m.destroy());
  game.artifacts.get(45).moveToInventory();
  game.player.updateInventory();
  game.player.moveToRoom(30); game.tick();
  game.command_parser.run('use transformer');
  expectEffectSeen(14);
  expect(game.artifacts.get(34).room_id).toBeNull();
  expect(game.artifacts.get(35).room_id).toBe(30);
});

test('grenade', () => {
  game.monsters.all
    .filter(m => m.room_id === 30)
    .forEach(m => m.destroy());
  game.artifacts.get(25).moveToInventory();
  game.player.updateInventory();
  game.player.moveToRoom(30); game.tick();
  game.command_parser.run('use grenade');
  expectEffectSeen(15);
  expect(game.artifacts.get(34).room_id).toBeNull();
  expect(game.artifacts.get(35).room_id).toBe(30);
});

test('attack clonatorium', () => {
  game.monsters.all
    .filter(m => m.room_id === 30)
    .forEach(m => m.destroy());
  game.player.moveToRoom(30);
  let guards = game.monsters.get(23);
  expect(guards.isHere()).toBeFalsy();
  game.mock_random_numbers = [1, 1];
  game.command_parser.run('attack clonatorium');
  expectEffectNotSeen(11);
  expect(guards.isHere()).toBeFalsy();
  game.mock_random_numbers = [1, 2];
  game.command_parser.run('attack clonatorium');
  expectEffectNotSeen(11);
  expect(guards.isHere()).toBeTruthy();
  guards.destroy();
  game.mock_random_numbers = [100, 2];
  game.command_parser.run('attack clonatorium');
  expectEffectSeen(11);
  expect(game.artifacts.get(34).room_id).toBeNull();
  expect(game.artifacts.get(35).room_id).toBe(30);
  expect(guards.isHere()).toBeFalsy();
});

function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}

function expectEffectNotSeen(id) {
  expect(game.effects.get(id).seen).toBeFalsy();
}
