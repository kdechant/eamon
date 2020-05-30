/**
 * Unit tests for Treachery of Zorag
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
  runCommand
} from "../../core/utils/testing";
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

test("weather", () => {
  game.mock_random_numbers = [1,2,3,4];
  game.command_parser.run('e');
  expectEffectSeen(64);
  game.command_parser.run('e');
  expectEffectSeen(65);
  game.command_parser.run('e');
  expectEffectSeen(66);
  game.command_parser.run('e');
  expectEffectSeen(67);
  game.mock_random_numbers = [1];
  movePlayer(22);
  expectEffectSeen(68);
  game.mock_random_numbers = [1];
  movePlayer(162);
  expectEffectSeen(72);
});

test("hunger/thirst", () => {
  runCommand('open care');
  runCommand('get canteen');
  runCommand('get jerky');
  runCommand('e');
  expect(game.data.hunger).toBe(10);
  runCommand('look');
  expect(game.data.hunger).toBe(10);  // no increase unless moving
  movePlayer(162);
  runCommand('e');
  expect(game.data.hunger).toBe(15);
  game.data.hunger = 150;
  game.data.thirst = 100;
  runCommand('n');
  expect(game.history.getLastOutput(4).text).toBe("You are getting hungry from traveling. You eat some of the Moleman's Jerky.");
  expect(game.history.getLastOutput(2).text).toBe("You are getting thirsty from traveling. You drink from the canteen.");
  expect(game.data.hunger).toBe(0);
  expect(game.data.thirst).toBe(0);
});

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

test('attack friendly npcs', () => {
  const npcs = [7,11,12,13,34].map(id => game.monsters.get(id));
  const msg = "It is not wise to attack a member of your Fellowship!";
  npcs.forEach(m => {
      m.moveToRoom();
      m.reaction = Monster.RX_FRIEND;
      runCommand(`attack ${m.name}`);
      expect(game.history.getOutput().text).toBe(msg);
      expect(m.reaction).toBe(Monster.RX_FRIEND);
    });
});
