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
  runCommand, expectMonsterIsHere
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
  game.mock_random_numbers = [2,1,2,2,2,3,2,4];
  game.command_parser.run('e');
  expectEffectSeen(64);
  game.command_parser.run('e');
  expectEffectSeen(65);
  game.command_parser.run('e');
  expectEffectSeen(66);
  game.command_parser.run('look');  // weather only changes when moving
  expectEffectNotSeen(67);
  game.command_parser.run('e');
  expectEffectSeen(67);
  game.mock_random_numbers = [2,1];
  movePlayer(23);
  runCommand('w');
  expectEffectSeen(68);
  game.mock_random_numbers = [2,1];
  movePlayer(162);
  runCommand('e');
  expectEffectSeen(72);
});

test("hunger/thirst/fatigue", () => {
  runCommand('open care');
  runCommand('get canteen');
  runCommand('get jerky');
  runCommand('e');
  expect(game.data.hunger).toBe(10);
  expect(game.data.thirst).toBe(10);
  expect(game.data.fatigue).toBe(10);
  runCommand('look');
  expect(game.data.hunger).toBe(10);  // no increase unless moving
  movePlayer(162);
  runCommand('e');
  expect(game.data.hunger).toBe(15);
  runCommand('eat jerky');
  expect(game.data.hunger).toBe(0);
  expect(game.data.thirst).toBe(15);  // no change
  runCommand('drink canteen');
  expect(game.data.thirst).toBe(0);
  expect(game.data.fatigue).toBe(15);  // no change
  game.data.hunger = 150;
  game.data.thirst = 100;
  runCommand('n');
  expect(game.history.getLastOutput(4).text).toBe("You are getting hungry from traveling. You eat some of the Moleman's Jerky.");
  expect(game.history.getLastOutput(2).text).toBe("You are getting thirsty from traveling. You drink from the canteen.");
  expect(game.data.hunger).toBe(0);
  expect(game.data.thirst).toBe(0);

  // fatigue / camp
  game.data.fatigue = 281;
  movePlayer(1);
  runCommand('e');
  expect(game.history.getLastOutput().text).toBe("You are getting tired. You must make camp soon.");
  runCommand('e');
  expect(game.history.getLastOutput().text).toBe("You are exhausted! Your agility is impaired until you rest.");
  expect(game.player.agility).toBe(game.player.stats_original.agility - 1);
  runCommand('e');
  expect(game.history.getLastOutput().text).toBe("You are exhausted! Your agility is impaired until you rest.");
  expect(game.player.agility).toBe(game.player.stats_original.agility - 2);
  runCommand('camp');
  expect(game.data.fatigue).toBe(0);
  // TODO: test output
  expect(game.player.agility).toBe(game.player.stats_original.agility);
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
  expect(game.history.getLastOutput(4).text).toBe("Tealand takes a sip of his green healing potion.");
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

test('raulos / quest', () => {
  movePlayer(58);
  runCommand('n');
  expectEffectSeen(10);
  expect(game.data.got_quest).toBeTruthy();
  runCommand('s');
  runCommand('n');
  expectEffectSeen(87);
});

test('raulos / zorag dead', () => {
  game.monsters.get(34).status = Monster.STATUS_DEAD;
  movePlayer(58);
  runCommand('n');
  expectEffectSeen(89);
  expect(game.died).toBeTruthy();
});

test('raulos / zorag battle', () => {
  movePlayer(58);
  game.monsters.get(34).moveToRoom();
  game.monsters.get(34).reaction = Monster.RX_FRIEND;
  game.tick();
  runCommand('n');
  expectEffectSeen(92);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.data.raulos_zorag).toBeTruthy();
  // golems
  expectMonsterIsHere(35);
  expectMonsterIsHere(36);
  expectMonsterIsHere(37);
  // TODO: more battle stuff
});

test('lost in swamp', () => {
  game.monsters.get(21).destroy();  // snake in rm 180
  game.mock_random_numbers = [1, 2];
  movePlayer(181);
  runCommand('n');
  expectEffectSeen(136);
  expect(game.player.room_id).toBe(161);
  game.effects.get(136).seen = false;
  movePlayer(171);
  runCommand('n');
  expectEffectSeen(136);
  expect(game.player.room_id).toBe(162);

  // now with compass
  game.effects.get(136).seen = false;
  game.artifacts.get(21).moveToInventory();
  movePlayer(181);
  runCommand('n');
  expectEffectSeen(137);
  expect(game.player.room_id).toBe(180);
  game.effects.get(137).seen = false;
  movePlayer(171);
  runCommand('n');
  expectEffectSeen(137);
  expect(game.player.room_id).toBe(172);
});
