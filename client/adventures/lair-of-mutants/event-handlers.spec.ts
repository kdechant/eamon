/**
 * Unit tests for Lair of Mutants
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame, expectEffectSeen, expectEffectNotSeen, playerAttackMock, movePlayer} from "../../core/utils/testing";
import {event_handlers, adjustMonsterStats} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'lair-of-mutants';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("monster stat boost", () => {
  // The demo player has an HD of 20. Monster stats are only changed
  // if the player has an HD > 25, so we need to change the HD and
  // run the calculation again. (It's not currently possible to
  // change game data before the "start" event handler in tests.)
  expect(game.monsters.get(2).hardiness).toBe(50);
  expect(game.monsters.get(7).hardiness).toBe(38);
  game.player.hardiness = 30;
  adjustMonsterStats();
  expect(game.monsters.get(2).hardiness).toBe(54);
  expect(game.monsters.get(7).hardiness).toBe(42);
});

test("use amulet", () => {
  game.command_parser.run('get amulet');
  game.mock_random_numbers = [1];
  game.command_parser.run('say hoshianu');
  expect(game.monsters.get(9).isHere()).toBeTruthy();
  expectEffectSeen(30);

  let hd = game.player.hardiness;
  game.player.injure(5);
  game.command_parser.run('use amulet');
  expectEffectSeen(31);
  expect(game.player.damage).toBe(0);
  expect(game.player.hardiness).toBe(hd + 1);
  expect(game.player.hasArtifact(12)).toBeFalsy();
});

test("monster intro effects", () => {
  game.monsters.get(1).moveToRoom(55);
  movePlayer(55)
  expectEffectSeen(27);
  expect(game.effects.get(27).replacements['{name}']).toBe(game.player.name);
  expectEffectSeen(8);  // orion's response
});

test("destroy stuff", () => {
  movePlayer(4);
  game.command_parser.run('attack sender');
  expect(game.artifacts.get(14).isHere()).toBeFalsy();
  expect(game.artifacts.get(20).isHere()).toBeTruthy();
  game.player.moveToRoom(6);
  game.command_parser.run('smash equipment');
  expect(game.artifacts.get(15).isHere()).toBeFalsy();
  expect(game.artifacts.get(21).isHere()).toBeTruthy();
});

test("temple", () => {
  game.monsters.get(1).moveToRoom(16);
  movePlayer(16);
  expectEffectSeen(2);
  expectEffectSeen(3);
  expectEffectSeen(28);
  expect(game.effects.get(28).replacements['{name}']).toBe('Orion');
  let ch = game.player.charisma;
  game.command_parser.run('worship magon');
  expectEffectSeen(19);
  expectEffectSeen(20);
  expect(game.player.hardiness).toBe(5);
  expect(game.player.agility).toBe(5);
  expect(game.player.charisma).toBe(ch + 60);
  expect(game.data.worshipped_magon).toBeTruthy();
});

test("temple 2", () => {
  movePlayer(16);
  let hd = game.player.hardiness;
  game.command_parser.run('worship i am that i am');
  expectEffectSeen(23);
  expect(game.player.hardiness).toBe(hd + 3);
  expect(game.data.i_am).toBe(1);
  expectEffectSeen(24);
  expect(game.monsters.get(13).isHere()).toBeFalsy();
  expect(game.monsters.get(14).isHere()).toBeFalsy();

  hd = game.player.hardiness;
  game.command_parser.run('worship i am that i am');
  expectEffectSeen(22);
  expect(game.data.i_am).toBe(2);
  expect(game.player.hardiness).toBe(hd);

  game.command_parser.run('worship i am that i am');
  expectEffectSeen(21);
  expect(game.player.hardiness).toBe(hd);
  expect(game.data.i_am).toBe(3);

  game.command_parser.run('worship gozer');
  expectEffectSeen(29);
});

test("croc and locusts", () => {
  movePlayer(42);
  game.command_parser.run('e');
  expect(game.monsters.get(28).isHere()).toBeTruthy();
  expect(game.monsters.get(30).isHere()).toBeFalsy();
  const npc_attack_miss = [
    0,  // doesn't flee
    0,  // target = player
    5,  // miss
  ];
  game.mock_random_numbers = npc_attack_miss;
  game.command_parser.run('look');
  expect(game.monsters.get(30).isHere()).toBeTruthy();
  expect(game.monsters.get(30).children[0].isHere()).toBeTruthy();
});

test("get medallion", () => {
  movePlayer(55);
  game.monsters.get(2).injure(999); game.tick();
  expect(game.artifacts.get(13).isHere()).toBeTruthy();
  game.command_parser.run('get medallion');
  expectEffectSeen(15);
  expect(game.won).toBeTruthy();
});

test("orion betrayed", () => {
  game.monsters.get(1).moveToRoom(); game.tick();
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('attack orion');
  expect(game.monsters.get(1).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.monsters.get(25).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.monsters.get(1).weapon_dice).toBe(6);
});

test("orion dies", () => {
  game.monsters.get(1).moveToRoom(); game.tick();
  game.monsters.get(1).injure(999); game.tick();
  expect(game.monsters.get(25).isHere()).toBeTruthy();
  expect(game.data.orion_died).toBeTruthy();
});

test("power spell", () => {
  game.player.spell_abilities['blast'] = 1;
  game.player.spell_abilities['heal'] = 1;
  game.player.spell_abilities['speed'] = 1;
  game.triggerEvent('power', 79);
  expect(game.player.spell_abilities['blast']).toBe(game.player.spell_abilities_original['blast']);
  expect(game.player.spell_abilities['heal']).toBe(game.player.spell_abilities_original['heal']);
  expect(game.player.spell_abilities['speed']).toBe(game.player.spell_abilities_original['speed']);
});
