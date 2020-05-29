/**
 * Unit tests for Treachery of Zorag
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame, expectEffectSeen, expectEffectNotSeen, playerAttackMock, movePlayer} from "../../core/utils/testing";
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
  game.slug = 'treachery-of-zorag';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("die if didn't accept quest", () => {
  movePlayer(18);
  game.command_parser.run('w');
  expectEffectSeen(33);
  expect(game.died).toBeTruthy();
});

test("don't die if did accept quest", () => {
  movePlayer(58);
  game.command_parser.run('n');
  expect(game.data.got_quest).toBeTruthy();
  game.command_parser.run('s');
  expect(game.data.exited_hall).toBeTruthy();
  movePlayer(18);
  game.command_parser.run('w');
  expectEffectNotSeen(33);
  expect(game.died).toBeFalsy();
});

test('npc healing', () => {
  let tealand = game.monsters.get(7);
  let zorag = game.monsters.get(34);
  tealand.moveToRoom();
  zorag.moveToRoom()
  tealand.damage = 25;
  zorag.damage = 75;
  game.mock_random_numbers = [20];
  game.tick();
  expect(tealand.damage).toBe(5);
  expect(zorag.damage).toBe(0);
  expectEffectSeen(101);
  expect(game.history.getLastOutput(4).text).toBe("Tealand takes a sip of his Green Healing Potion.");
  expect(game.history.getLastOutput(1).text).toBe(game.effects.get(101).text);
});
