/**
 * Unit tests for Malleus Maleficarum
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame, expectEffectSeen, expectEffectNotSeen} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

// @ts-ignore
var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'malleus-maleficarum';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("start and plaza", () => {
  expectEffectSeen(1);
  game.command_parser.run('n');
  game.command_parser.run('talk to soldiers');
  expectEffectSeen(203);
  game.command_parser.run('talk to prisoner');
  expectEffectSeen(11);
  game.command_parser.run('free prisoner');
  expect(game.artifacts.get(2).isHere()).toBeTruthy();
});

test("virrat city", () => {
  game.command_parser.run('talk to maya');
  expect(game.history.getOutput().text).toBe(game.effects.get(1).text);
  game.player.moveToRoom(35); game.tick();
  expectEffectSeen(2);
  game.command_parser.run('talk to maya');
  expect(game.history.getOutput().text).toBe(game.effects.get(2).text);
  game.player.moveToRoom(14); game.tick();
  game.command_parser.run('talk to Talia');
  // expect(game.data.talia).toBeTruthy();
  game.command_parser.run('talk to maya');
  expectEffectSeen(3);
});

test('save old man', () => {
  // TODO
});

test('buy stuff', () => {
  game.player.moveToRoom(70); game.tick();
  expect(game.history.getLastOutput().text).toBe("Items for sale here: battle axe#, pike");  // demo char has a battle axe, so this one is battle axe#
  let gold = game.player.gold;
  game.modal.mock_answers = ['yes'];
  game.command_parser.run('buy pike');
  expect(game.player.hasArtifact(33)).toBeTruthy();
  expect(game.player.gold).toBe(gold - game.artifacts.get(33).value);
  game.command_parser.run('buy spaceship');
  expect(game.history.getOutput().text).toBe("No one here has that for sale.");
  game.artifacts.get(15).moveToInventory(12); game.tick();
  game.command_parser.run('buy pamphlet');
  expect(game.history.getOutput().text).toBe("That's not for sale.");
  game.player.gold = 0;
  game.command_parser.run('buy battle axe#');
  expect(game.history.getOutput().text).toMatch(/^That costs/);
  expect(game.player.hasArtifact(32)).toBeFalsy();
});

test("lieto", () => {
  game.player.moveToRoom(66); game.tick();
  game.modal.mock_answers = ['owlfeather'];
  game.command_parser.run('open door');
  expect(game.artifacts.get(16).is_open).toBeTruthy();
  game.command_parser.run('d');
  game.command_parser.run('talk to velatha');
  expectEffectSeen(230);
  expect(game.data.orb_quest).toBeTruthy();
  game.command_parser.run('s');
  game.command_parser.run('talk to zinnah');
  expectEffectSeen(232);
  expect(game.artifacts.get(3).room_id).toBe(9);
});

test("castle", () => {
  game.artifacts.get(3).moveToInventory();
  game.player.moveToRoom(51); game.tick();
  game.monsters.get(19).reaction = Monster.RX_NEUTRAL;
  game.monsters.get(20).destroy();
  game.monsters.get(21).reaction = Monster.RX_NEUTRAL;
  game.command_parser.run('w');
  game.command_parser.run('use wand');
  expect(game.monsters.get(19).damage).toBeGreaterThan(0);
  expect(game.artifacts.get(10).room_id).toBeNull();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(53);
  game.command_parser.run('use wand');
  expect(game.monsters.get(21).damage).toBeGreaterThan(0);
  game.command_parser.run('e');
  game.command_parser.run('use wand');
});

test('swamp thing', () => {
  // Note: to mock non-player fighting, use the following mock numbers:
  // [flee chance, target, hit roll, damage roll]
  // For player attack, you only need:
  // [hit roll, damage roll]
  // If there is an attackDamageAfter e.h., add any numbers for it to the
  // end of the array.

  // prevent maya from attacking (for predictable testing)
  let maya = game.monsters.get(1);
  maya.combat_code = Monster.COMBAT_CODE_NEVER_FIGHT;
  // engulf player
  game.mock_random_numbers = [0, 1, 10, 2, 2];
  game.player.moveToRoom(51); game.tick();
  expect(game.player.data.engulfed).toBe(19);
  // engulf maya
  game.mock_random_numbers = [0, 2, 10, 2, 2];
  game.command_parser.run('look');
  expect(maya.data.engulfed).toBe(19);
  // kill it with fire!
  game.mock_random_numbers = [10, 100];
  game.command_parser.run('attack mound');
  expect(game.monsters.get(19).isHere()).toBeFalsy();
  expect(game.player.data.engulfed).toBeFalsy();
  expect(maya.data.engulfed).toBeFalsy();
});

test("weapon confiscation", () => {
  // firebrand (magic wpn) is default weapon for demo char
  game.command_parser.run('ready mace');
  game.player.moveToRoom(3); game.tick();
  expect(game.player.weapon).not.toBeNull();
  game.command_parser.run('ready firebrand');
  expectEffectSeen(13);
  game.command_parser.run('s');
  expectEffectSeen(32);
  expect(game.player.room_id).toBe(3);
  let prev_gold = game.player.gold;
  game.command_parser.run('pay fine');
  expect(game.player.gold).toBe(prev_gold - 100);
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(2);
});

test("go directly to jail", () => {
  game.command_parser.run('n');
  game.command_parser.run('speed');
  expectEffectSeen(27);
  expect(game.data.arrested).toBeTruthy();
  expect(game.player.room_id).toBe(30);
  let inventory = game.player.inventory.map(a => a);
  expect(game.player.inventory.length).toBe(0);
  inventory.forEach(a => expect(a.room_id).toBe(24));
  game.mock_random_numbers = [1, 1];
  game.command_parser.run('power');
  expect(game.rooms.current_room.getVisibleExits().some(x => x.direction === 'u')).toBeTruthy();
});

test("busted for magic (after jailbreak)", () => {
  game.data.jailbreak = true;
  game.command_parser.run('n');
  game.command_parser.run('speed');
  expectEffectSeen(35);
  // expect(game.data.arrested).toBeFalsy();
  expect(game.player.room_id).toBe(2);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.monsters.get(5).reaction).toBe(Monster.RX_HOSTILE);
});

test("attack soldiers", () => {
  game.command_parser.run('n');
  game.command_parser.run('attack soldier');
  expectEffectSeen(28);
  expect(game.data.arrested).toBeTruthy();
  expect(game.player.room_id).toBe(30);
  // rest of this is the same as the magic/jail routine above
});

test("attack duke", () => {
  game.player.moveToRoom(4); game.tick();
  game.command_parser.run('attack duke');
  expectEffectSeen(34);
  expect(game.data.arrested).toBeTruthy();
  expect(game.player.room_id).toBe(30);
  // rest of this is the same as the magic/jail routine above
});

test("give quest items", () => {
  let wand = game.artifacts.get(3);
  let bag = game.artifacts.get(4);
  let orb = game.artifacts.get(5);
  wand.moveToInventory();
  bag.moveToInventory();
  orb.moveToInventory();
  game.tick();
  game.command_parser.run('give orb to maya');
  expect(orb.monster_id).toBe(Monster.PLAYER);
  game.command_parser.run('give bag to maya');
  expect(bag.monster_id).toBe(Monster.PLAYER);
  game.command_parser.run('give orb to maya');
  expect(wand.monster_id).toBe(Monster.PLAYER);
  // also give stuff to soldiers
  game.command_parser.run('n');
  game.command_parser.run('give bag to soldier');
  expectEffectSeen(39);
  expect(bag.monster_id).toBe(Monster.PLAYER);
});

test("soldiers and orb", () => {
  game.artifacts.get(5).moveToInventory();
  game.command_parser.run('n');
  let soldiers = game.monsters.get(3);
  let inquisitor = game.monsters.get(6);
  expectEffectSeen(15);
  expect(soldiers.reaction).toBe(Monster.RX_HOSTILE);
  game.command_parser.run('give orb to soldier');
  expectEffectSeen(36);
  expect(soldiers.room_id).toBe(inquisitor.room_id);
  expect(soldiers.reaction).toBe(Monster.RX_NEUTRAL);
  expect(inquisitor.hasArtifact(5));
});

test("soldiers and orb (dropped orb)", () => {
  game.artifacts.get(5).moveToRoom(2);
  game.command_parser.run('n');
  expectEffectSeen(37);
  let soldiers = game.monsters.get(3);
  let inquisitor = game.monsters.get(6);
  expect(soldiers.room_id).toBe(inquisitor.room_id);
  expect(soldiers.reaction).toBe(Monster.RX_NEUTRAL);
  expect(inquisitor.hasArtifact(5));
});

test("soldiers and orb (in bag)", () => {
  game.artifacts.get(4).moveToInventory();
  game.artifacts.get(5).moveToInventory();
  game.command_parser.run('put orb into bag');
  game.command_parser.run('n');
  expectEffectNotSeen(15);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_NEUTRAL);
});

test("orb", () => {
  game.artifacts.get(5).moveToInventory(); game.tick();
  game.command_parser.run('use orb');
  expectEffectSeen(19);
  game.command_parser.run('say irkm desmet daem');
  expectEffectSeen(20);
  game.player.moveToRoom(39); game.tick();
  game.command_parser.run('say irkm desmet daem');
  expectEffectSeen(21);
  expect(game.artifacts.get(24).isHere()).toBeFalsy();
  expect(game.artifacts.get(37).isHere()).toBeTruthy();
  expect(game.artifacts.get(23).room_id).toBeNull();
  expect(game.artifacts.get(38).room_id).toBe(22);
  expect(game.data.jailbreak).toBeTruthy();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(22);
});

test('free prisoners', () => {
  game.player.moveToRoom(25);
  game.artifacts.get(17).moveToInventory();
  game.tick();
  game.command_parser.run('w');
  expectEffectSeen(23);  // ainha/maya
  game.command_parser.run('e');
  game.command_parser.run('e');
  expectEffectSeen(29);  // generic prisoners
});

test('letter', () => {
  // TODO
  // give to v
  // give to duke
  // test cf_defeated flag
  // change everyone's talk message
  // go to old man at standing stones
});
