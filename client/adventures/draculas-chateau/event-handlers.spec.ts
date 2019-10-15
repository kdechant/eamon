/**
 * Unit tests for Dracula's Chateau
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
  game.slug = 'draculas-chateau';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("general event handlers", () => {
  // non-standard starting room
  expect(game.player.room_id).toBe(63);

  // zero room exit effect
  game.player.moveToRoom(71); game.tick();
  game.command_parser.run('e');
  expect(game.history.getOutput().text).toBe(game.effects.get(1).text);
  game.player.moveToRoom(80); game.tick();
  game.command_parser.run('w');
  expect(game.history.getOutput().text).toBe("You can't go that way!");

});

test("dig", () => {
  game.artifacts.get(65).moveToInventory();
  game.command_parser.run('dig');
  expect(game.artifacts.get(25).room_id).toBe(null);
  game.player.moveToRoom(80); game.tick();
  game.command_parser.run('dig');
  expect(game.artifacts.get(25).room_id).toBe(80);
});

test("say", () => {
  game.command_parser.run('say miyrm');
  expect(game.artifacts.get(67).room_id).toBeNull();
  expectEffectNotSeen(18);
  expectEffectSeen(19);
});

test("vampires and cross", () => {
  // cross
  game.monsters.get(8).moveToRoom();
  game.artifacts.get(10).moveToInventory();
  game.tick();
  game.command_parser.run('use cross');
  expect(game.monsters.get(8).isHere()).toBeFalsy();
});

test("xorn movements", () => {
  // xorn
  let xorn = game.monsters.get(12);
  xorn.reaction = Monster.RX_NEUTRAL; // no need for combat to test this
  game.rooms.get(33).is_dark = false;
  game.player.moveToRoom(33); game.tick();
  game.mock_random_numbers = [4];
  game.command_parser.run('look');
  expectEffectSeen(29);
  expect(xorn.room_id).toBeNull();
  game.counters['xorn'] = 1;
  game.command_parser.run('look');
  expectEffectSeen(30);
  expect(xorn.room_id).toBe(33);
});

test("alter weapons with power", () => {
  // power / weapon
  game.command_parser.run('ready mace');
  expect(game.player.weapon.type).toBe(Artifact.TYPE_WEAPON);
  expect(game.player.weapon.name).toBe('mace');
  game.triggerEvent('power', 99);
  expectEffectSeen(25);
  expect(game.player.weapon.type).toBe(Artifact.TYPE_MAGIC_WEAPON);
  expect(game.player.weapon.sides).toBe(6);
  game.triggerEvent('power', 99);
  expectEffectSeen(26);
  expect(game.player.weapon.type).toBe(Artifact.TYPE_WEAPON);
  expect(game.player.weapon.sides).toBe(4);
});

test("slime should damage weapons", () => {
  // attack slime
  game.player.moveToRoom(96); game.tick();
  game.mock_random_numbers = [6, 4, 4]; // player hit, damage, wpn damage
  game.command_parser.run('attack slime');
  expectEffectSeen(17);
  expect(game.player.weapon.sides).toBe(4);
});

test("belg", () => {
  game.skip_battle_actions = true;
  game.player.damage = 2;
  game.player.moveToRoom(98); game.tick();
  // this test could still fail if belg gets a critical hit
  game.command_parser.run('flee');
  expectEffectSeen(9);
  game.player.damage = game.player.hardiness - 1;
  game.command_parser.run('attack belg');
  expectEffectSeen(16);
  expect(game.rooms.get(98).description).toBe(game.effects.get(4).text);
  expect(game.monsters.get(26).isHere()).toBeFalsy();
  expect(game.player.damage).toBe(2);  // fixed up to where it was when you met belg
});

test("blast belg", () => {
  game.skip_battle_actions = true;
  game.player.moveToRoom(98); game.tick();
  game.mock_random_numbers = [1];  // spell always works
  game.command_parser.run('blast belg');
  expectEffectSeen(20);
});

test("silver bullet", () => {
  game.skip_battle_actions = true;
  game.rooms.get(21).is_dark = false;
  game.artifacts.get(11).moveToInventory();
  game.player.moveToRoom(21); game.tick();
  game.modal.mock_answers = ['werewolf'];
  game.command_parser.run('use pistol');
  expect(game.monsters.get(4).room_id).toBeNull();
  expect(game.artifacts.get(11).room_id).toBeNull();
  expect(game.artifacts.get(12).isHere()).toBeTruthy();
});

test("see key in dark", () => {
  game.skip_battle_actions = true;
  game.player.moveToRoom(76); game.tick();
  expectEffectSeen(13);
});

test("goldenwrath", () => {
  // goldenwrath
  game.rooms.get(30).is_dark = false;
  let dracula = game.monsters.get(2);
  let gw = game.artifacts.get(8);
  dracula.reaction = Monster.RX_NEUTRAL;
  game.player.moveToRoom(30, false); game.tick();
  expect(gw.dice).toBe(3);
  dracula.drop(gw);
  game.tick();
  expect(gw.dice).toBe(2);
  expect(gw.inventory_message).toBe("");
  game.command_parser.run('say flame on');
  expect(gw.dice).toBe(3);
  expect(gw.inventory_message).toBe("flaming");
  game.command_parser.run('say flame off');
  expect(gw.dice).toBe(2);
  expect(gw.inventory_message).toBe("");
  dracula.pickUp(gw);
  expect(gw.dice).toBe(3);
  expect(gw.inventory_message).toBe("flaming");
});

test("dracula", () => {
  let dracula = game.monsters.get(2);
  game.artifacts.get(2).moveToInventory();  // stake
  game.player.moveToRoom(30, false); game.tick();
  dracula.injure(dracula.hardiness, true);
  expect(game.artifacts.get(30).isHere()).toBeTruthy();
  expect(game.counters['dracula']).toBe(5);
  game.counters['dracula'] = 1;
  game.tick();
  expectEffectSeen(31);
  expect(dracula.isHere()).toBeTruthy();
  expect(game.artifacts.get(30).isHere()).toBeFalsy();
  game.command_parser.run("use stake");
  expectEffectSeen(34);
  dracula.injure(dracula.hardiness, true);
  expect(game.artifacts.get(30).isHere()).toBeTruthy();
  game.command_parser.run("use stake");
  expectEffectSeen(33);
  expect(game.artifacts.get(30).isHere()).toBeFalsy();
  expect(game.artifacts.get(68).isHere()).toBeTruthy();
  expect(game.counters['dracula']).toBe(0);
});

test("sheryl", () => {
  game.rooms.get(97).is_dark = false;
  game.artifacts.get(11).moveToInventory();
  game.player.moveToRoom(97); game.tick();
  game.mock_random_numbers = [6, 12]; // player hit, damage
  game.monsters.get(25).reaction = Monster.RX_HOSTILE;
  game.command_parser.run('attack sheryl');
  expectEffectSeen(6);
  expect(game.died).toBeTruthy();
});

function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}

function expectEffectNotSeen(id) {
  expect(game.effects.get(id).seen).toBeFalsy();
}
