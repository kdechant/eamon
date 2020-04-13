/**
 * Unit tests for The Training Ground
 */
import Game from "../../core/models/game";
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
  game.slug = 'the-training-ground';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("buy potions", () => {
  game.player.moveToRoom(28); game.tick();
  game.modal.mock_answers = ['No'];
  game.command_parser.run('buy red potion');
  const original_gold = game.player.gold;
  expect(game.artifacts.get(40).monster_id).toBe(20);
  expect(game.player.gold).toBe(original_gold);
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('buy potion');
  expect(game.player.hasArtifact(40)).toBeTruthy();
  expect(game.player.gold).toBe(original_gold - 100);
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('buy potion');
  expect(game.player.hasArtifact(41)).toBeTruthy();
  expect(game.player.gold).toBe(original_gold - 200);
});

test("attack boz", () => {
  game.player.moveToRoom(28); game.tick();
  game.command_parser.run('a boz');
  expectEffectSeen(20);
  expect(game.monsters.get(20).isHere()).toBeFalsy();
});

test("blast boz", () => {
  game.player.moveToRoom(28); game.tick();
  game.mock_random_numbers = [1];  // spell cast successfully
  game.command_parser.run('blast boz');
  expectEffectSeen(21);
  expect(game.monsters.get(20).isHere()).toBeFalsy();
});

test("say thor", () => {
  // we need a hostile and a neutral monster in a non-dark room
  let rogue = game.monsters.get(4);
  let rogue_initial_courage = rogue.courage;
  rogue.moveToRoom(28);
  let boz = game.monsters.get(20);
  let boz_initial_courage = boz.courage;
  game.player.moveToRoom(28); game.skip_battle_actions = true; game.tick();

  const npc_attack_miss = [
    0,  // doesn't flee
    0,  // target = player
    5,  // miss
  ];

  // first, without the hammer
  game.mock_random_numbers = npc_attack_miss;
  game.command_parser.run('say thor');
  expectEffectNotSeen(32);
  expect(rogue.courage).toBe(rogue_initial_courage);
  expect(boz.courage).toBe(boz_initial_courage);

  // again, with the hammer
  game.mock_random_numbers = npc_attack_miss;
  game.artifacts.get(24).moveToInventory();
  game.command_parser.run('say thor');
  expectEffectSeen(32);
  expect(rogue.courage).toBe(rogue_initial_courage / 4);
  expect(boz.courage).toBe(boz_initial_courage);  // no change to neutral monster

  // test that effect only works once per opponent
  game.mock_random_numbers = npc_attack_miss;
  game.command_parser.run('say thor');
  expect(rogue.courage).toBe(rogue_initial_courage / 4);
  expect(boz.courage).toBe(boz_initial_courage);
});
