/**
 * Unit tests for {base adventure}
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
  game.slug = 'temple-of-ngurct';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("wandering monsters", () => {
  // wandering monsters
  game.player.moveToRoom(2);  // they never appear in room 1 because it breaks other tests
  game.mock_random_numbers = [20, 1, 12]; // first turn will not summon a monster (rnd > 8), second turn will summon monster #18
  let joubert = game.monsters.get(18);
  game.command_parser.run('look');
  expect(joubert.room_id).toBeNull();
  game.command_parser.run('look');
  expect(joubert.room_id).toBe(game.player.room_id);
});

test('dead mage artifacts', () => {
  game.data['wandering monsters'] = [];
  let dm = game.artifacts.get(32);
  expect(dm.room_id).not.toBeNull();
  dm.moveToRoom(); // this is easier than going to a random room that might have monsters in it
  game.command_parser.run('look dead mage');
  expect(game.artifacts.get(33).room_id).toBe(1);
  expect(game.artifacts.get(64).room_id).toBe(1);
  game.command_parser.run('get fireball wand');
});

test('fireball wand', () => {
  game.data['wandering monsters'] = [];
  game.artifacts.get(33).moveToInventory();
  game.command_parser.run('ready fireball wand');
  // wrong trigger word
  game.modal.mock_answers = ['nope'];
  game.command_parser.run('use wand');
  expect(game.history.getOutput().text).toBe('Wrong! Nothing happens.');
  // no monsters
  game.modal.mock_answers = ['fire'];
  game.command_parser.run('use wand');
  expect(game.history.getOutput().text).toBe('There are no unfriendlies about!');
  // now with monsters
  game.monsters.get(7).moveToRoom();  // guard
  game.monsters.get(9).moveToRoom();  // ogre
  game.monsters.get(17).moveToRoom();  // bugbear
  game.monsters.updateVisible();
  // attack!
  game.mock_random_numbers = [12, 1, 12, 20, 12, 1];  // == damage mon 1, saving throw roll mon 1, damage mon 2...
  game.modal.mock_answers = ['fire'];
  game.command_parser.run('attack guard');
  expect(game.monsters.get(7).damage).toBe(12);
  expect(game.monsters.get(9).damage).toBe(6);
  expect(game.monsters.get(17).damage).toBe(12);
  expect(game.monsters.get(18).damage).toBe(0);  // monster is not here
});

test('oak door', () => {
  game.data['wandering monsters'] = [];
  let door1 = game.artifacts.get(16);
  let door2 = game.artifacts.get(17);
  game.player.moveToRoom(33);
  game.tick();
  game.command_parser.run('open door');
  expect(door1.is_open).toBeTruthy();
  expect(door2.is_open).toBeTruthy();
  game.command_parser.run('n');
  expect(door1.is_open).toBeFalsy();
  expect(door2.is_open).toBeFalsy();
});

test('hieroglyphics', () => {
  game.data['wandering monsters'] = [];
  game.monsters.get(46).destroy();  // get mummy out of the way
  game.player.moveToRoom(38);
  game.command_parser.run('read inscription');
  expect(game.effects.get(1).seen).toBeTruthy();
});

test('potion', () => {
  game.data['wandering monsters'] = [];
  let black_potion = game.artifacts.get(62);
  black_potion.moveToInventory();
  game.player.updateInventory();
  let old_ag = game.player.agility;
  let old_original_ag = game.player.stats_original.agility;
  game.command_parser.run('drink black potion');
  expect(game.player.agility).toBe(old_ag + 1);
  expect(game.player.stats_original.agility).toBe(old_original_ag + 1);
});

test('carcass', () => {
  game.data['wandering monsters'] = [];
  let carcass = game.artifacts.get(67);
  carcass.moveToRoom();
  game.artifacts.updateVisible();
  game.command_parser.run('eat carcass');
  expect(carcass.room_id).toBe(game.player.room_id);
});

test('door logic', () => {
  // Note: this tests core stuff
  game.data['wandering monsters'] = [];
  game.player.moveToRoom(26);
  game.artifacts.get(71).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('open cell door');
  expect(game.artifacts.get(12).is_open).toBeTruthy();
  expect(game.artifacts.get(13).is_open).toBeTruthy();
});

test('alkanda', () => {
  game.data['wandering monsters'] = [];
  let alk = game.monsters.get(56);
  game.command_parser.run('say annal natthrac');
  expect(alk.room_id).toBeNull();
  game.artifacts.get(37).moveToInventory();
  game.player.updateInventory();
  game.player.damage = 0;
  game.command_parser.run('say annal natthrac');
  expect(alk.room_id).toBe(game.player.room_id);
  alk.injure(100); // kills him so he drops his scimitar
  game.tick();
  game.command_parser.run('get scimitar');
  expect(game.player.damage).toBeGreaterThan(0);
});

test('power spell', () => {
  game.data['wandering monsters'] = [];
  game.history.push('power 1');
  game.mock_random_numbers = [13];  // room
  game.triggerEvent('power', 10);
  expect(game.player.room_id).toBe(13);
  game.player.damage = 0;
  game.history.push('power 2');
  game.mock_random_numbers = [20, 8];  // saving throw roll and damage roll
  game.triggerEvent('power', 25);
  expect(game.player.damage).toBeGreaterThan(0);
  game.history.push('power 3');
  game.triggerEvent('power', 70);
  game.monsters.updateVisible();
  expect(game.monsters.get(57).isHere()).toBeTruthy();
  game.history.push('power 4');
  game.triggerEvent('power', 70);
  game.monsters.updateVisible();
  expect(game.monsters.get(57).isHere()).toBeFalsy();
  game.history.push('power 5');
  game.triggerEvent('power', 99);
  expect(game.player.damage).toBe(0);
  game.mock_random_numbers = [1];  // saving throw roll
  game.history.push('power 6');
  game.triggerEvent('power', 25);
  expect(game.died).toBeTruthy();
});
