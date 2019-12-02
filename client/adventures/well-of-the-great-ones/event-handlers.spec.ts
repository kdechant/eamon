/**
 * Unit tests for Well of the Great Ones
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
  game.slug = 'well-of-the-great-ones';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("general event handlers", () => {
  // non-standard starting room
  expect(game.player.room_id).toBe(22);
  expectEffectSeen(22);
});

test("sturdy skiff", () => {
  game.monsters.get(10).destroy(); // zombies
  game.player.moveToRoom(21); game.tick();
  game.command_parser.run('n');
  expect(game.data.in_boat).toBeTruthy();
  expect(game.player.room_id).toBe(20);
  expect(game.artifacts.get(28).isHere()).toBeTruthy();
  game.command_parser.run('n');
  game.command_parser.run('n');
  expect(game.data.in_boat).toBeFalsy();
  game.artifacts.get(28).destroy();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(18);  // didn't move without skiff
});

test("summon and unsummon zombies", () => {
  // summon
  game.monsters.get(13).injure(14, true);
  game.player.moveToRoom(14); game.tick();
  game.command_parser.run('say ai ai pulvis commutare vigor yogsothoth'); // testing alternate string
  expectEffectSeen(3);
  expectEffectSeen(12);
  expectEffectSeen(13);
  expect(game.monsters.get(13).isHere()).toBeTruthy();
  expect(game.monsters.get(13).damage).toBe(0);
  expect(game.artifacts.get(113).isHere()).toBeFalsy();
  expect(game.monsters.get(40).isHere()).toBeTruthy();  // fresh zombie
  expect(game.artifacts.get(140).isHere()).toBeFalsy();
  // unsummon
  game.command_parser.run('say ' + game.data.phrases.unsummon);
  expectEffectSeen(3);
  expect(game.monsters.get(13).isHere()).toBeFalsy();
  expect(game.artifacts.get(113).isHere()).toBeTruthy();
  expect(game.monsters.get(40).isHere()).toBeFalsy();  // fresh zombie
  expect(game.artifacts.get(140).isHere()).toBeTruthy();
});

test("summon something nasty", () => {
  // y'g
  game.artifacts.get(15).moveToInventory();
  game.artifacts.get(15).is_lit = true;
  game.player.moveToRoom(54); game.tick();
  game.command_parser.run('say ' + game.data.phrases.ygolonac);
  expectEffectSeen(5);
  expect(game.monsters.get(3).isHere()).toBeTruthy();
});

test("summon the king in yellow (also nasty)", () => {
  // hastur
  game.player.moveToRoom(61); game.tick();
  game.mock_random_numbers = [1];  // don't run
  game.command_parser.run('say ' + game.data.phrases.companion);
  expectEffectSeen(1);
  expect(game.monsters.get(1).isHere()).toBeTruthy();
});

test("drop weapon and run away", () => {
  game.monsters.get(8).destroy();  // star vampire
  game.player.moveToRoom(2); game.tick();
  let weapon = game.player.weapon;
  game.mock_random_numbers = [2, 1];  // run north
  game.command_parser.run('say ' + game.data.phrases.companion);
  expectEffectSeen(1);
  expect(game.monsters.get(1).seen).toBeTruthy();
  expect(game.player.room_id).toBe(3);
  expectEffectSeen(21);
  expect(game.player.weapon_id).toBeNull();
  expect(weapon.room_id).toBe(2);
  expect(game.monsters.get(1).room_id).toBe(2);
});

test("enter well", () => {
  game.monsters.get(8).destroy();  // star vampire
  game.player.moveToRoom(2); game.tick();
  game.mock_random_numbers = [1];  // don't run; we test 'run' above
  game.command_parser.run('d');
  expectEffectSeen(20);
  expect(game.player.room_id).toBe(2);
  expect(game.monsters.get(1).isHere()).toBeTruthy();
  expect(game.monsters.get(2).isHere()).toBeTruthy();
});

test("elder sign", () => {
  let spell_ability_pre = game.player.spell_abilities.blast;
  game.monsters.get(8).destroy();  // star vampire
  game.artifacts.get(4).moveToInventory();
  game.command_parser.run('use elder sign');
  expectEffectSeen(14);
  game.player.moveToRoom(2); game.tick();
  game.command_parser.run('use elder sign');
  expectEffectSeen(2);
  expectEffectSeen(15);
  expectEffectSeen(16);
  expect(game.monsters.get(1).room_id).toBeNull();
  expect(game.monsters.get(2).room_id).toBeNull();
  expect(game.artifacts.get(78).isHere()).toBeTruthy();
  expect(game.player.spell_abilities.blast).toBe(spell_ability_pre + 20);
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(2);
  expectEffectSeen(18);
});

test("statuette", () => {
  let statuette = game.artifacts.get(1);
  statuette.moveToInventory();
  game.monsters.get(8).destroy();  // star vampire
  game.mock_random_numbers = [1];  // don't flee; we test that above
  game.player.moveToRoom(2); game.tick();
  expect(game.monsters.get(2).isHere()).toBeFalsy();
  expect(game.history.getLastOutput().text).toBe(game.effects.get(24).text);
  game.tick();
  expect(game.monsters.get(2).isHere()).toBeFalsy();
  expect(game.history.getLastOutput().text).toBe(game.effects.get(24).text);
  game.tick();
  expect(game.monsters.get(2).isHere()).toBeTruthy();
});

test("statuette again", () => {
  let statuette = game.artifacts.get(1);
  statuette.moveToInventory();
  game.monsters.get(8).destroy();  // star vampire
  game.player.moveToRoom(2); game.tick();
  expect(game.monsters.get(2).isHere()).toBeFalsy();
  expect(game.history.getLastOutput().text).toBe(game.effects.get(24).text);
  game.command_parser.run('attack statuette');
  expectEffectSeen(23);
  expect(game.artifacts.get(80).isHere()).toBeTruthy();
  game.tick(); game.tick();
  expect(game.monsters.get(2).isHere()).toBeFalsy();
});

test("river", () => {
  game.monsters.get(7).destroy();  // byakhee
  game.player.moveToRoom(7); game.tick();
  game.modal.mock_answers = ['No'];
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(7);
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(8);
  expectEffectSeen(27);
  expect(game.died).toBeTruthy();
});

test("amulet 1", () => {
  game.command_parser.run('use amulet');
  expectEffectSeen(28);
  expectEffectNotSeen(29);
  expectEffectSeen(30);
  expect(game.won).toBeTruthy();
});

test("amulet 2", () => {
  game.player.moveToRoom(2);
  game.monsters.get(1).moveToRoom(2);
  game.skip_battle_actions = true;
  game.tick();
  let previous_blast = game.player.spell_abilities_original['blast'];
  let previous_axe = game.player.weapon_abilities[1];
  let previous_ch = game.player.charisma;
  game.command_parser.run('use amulet');
  expectEffectSeen(28);
  expectEffectSeen(29);
  expect(game.player.spell_abilities_original['blast']).toBeLessThan(previous_blast);
  expect(game.player.weapon_abilities[1]).toBeLessThan(previous_axe);
  expect(game.player.charisma).toBeLessThan(previous_ch);
  expectEffectSeen(30);
  expect(game.won).toBeTruthy();
});

test('smile', () => {
  game.player.moveToRoom(51, false); game.tick();
  game.monsters.get(1).moveToRoom();
  game.monsters.get(2).moveToRoom();
  game.monsters.get(3).moveToRoom();
  game.monsters.updateVisible();
  game.command_parser.run('smile');
  expectEffectSeen(8);
  expectEffectSeen(9);
  expectEffectSeen(10);
  expectEffectSeen(6);
});

function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}

function expectEffectNotSeen(id) {
  expect(game.effects.get(id).seen).toBeFalsy();
}
