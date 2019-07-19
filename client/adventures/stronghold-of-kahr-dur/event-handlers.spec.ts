/**
 * Unit tests for Stronghold of Kahr-Dur
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
  game.slug = 'stronghold-of-kahr-dur';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => console.log(game.history.summary()));

// TESTS

it("should have working event handlers", () => {

  // monster adjustable hardiness (based on demo character's 2d6 weapon)
  expect(game.monsters.get(1).hardiness).toBe(6);
  expect(game.monsters.get(2).hardiness).toBe(12);
  expect(game.monsters.get(10).hardiness).toBe(24);

  game.artifacts.get(9).moveToInventory(); // light
  game.command_parser.run('light whitestone');

  // spell backlash
  game.mock_random_numbers = [100];
  game.command_parser.run('speed');
  // set to 1, plus 1 for end-turn recharge
  expect(game.player.spell_abilities['speed']).toBe(2);

  // secret doors
  game.monsters.get(11).destroy();  // guards in library
  game.player.moveToRoom(11); game.tick();
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(11);
  game.command_parser.run('ex boo');
  expect(game.artifacts.get(10).isHere()).toBeFalsy();
  game.player.moveToRoom(18); game.tick();
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(18);
  game.command_parser.run('ex arm');
  expect(game.artifacts.get(4).isHere()).toBeFalsy();
  game.artifacts.get(2).moveToInventory();
  game.player.updateInventory();
  game.player.wear(game.artifacts.get(2));
  game.command_parser.run('ex arm');
  expect(game.artifacts.get(4).isHere()).toBeTruthy();
  game.monsters.get(2).destroy();  // golems
  game.monsters.get(3).destroy();
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(19);
  game.command_parser.run('e');
  game.history.flush();
  game.command_parser.run('clo arm');
  expect(game.artifacts.get(4).isHere()).toBeFalsy();
  game.command_parser.run('w');
  expect(game.player.room_id).toBe(18);
  game.command_parser.run('op arm');
  expect(game.artifacts.get(4).isHere()).toBeTruthy();
  game.player.moveToRoom(11); game.tick();
  game.command_parser.run('ex boo');
  expect(game.artifacts.get(10).isHere()).toBeTruthy();
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(93);
  game.history.flush();

  // amulet + forest
  game.player.moveToRoom(92); game.tick();
  game.command_parser.run('n');
  expectEffectSeen(45);
  expect(game.player.room_id).toBe(92);
  game.artifacts.get(18).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(65);
  game.history.flush();

  // portcullis and knock spell
  game.player.moveToRoom(43); game.tick();
  game.command_parser.run('open portcullis');
  expect(game.artifacts.get(7).is_open).toBeFalsy();
  game.artifacts.get(19).moveToInventory();
  game.artifacts.get(20).moveToInventory();
  game.artifacts.get(21).moveToInventory();
  game.artifacts.get(22).moveToInventory();
  game.artifacts.get(24).moveToInventory();
  game.command_parser.run('pu ph into cau');
  game.command_parser.run('pu ru into cau');
  game.command_parser.run('pu der into cau');
  game.command_parser.run('pu eed into cau');
  game.command_parser.run('say knock nikto mellon');
  expectEffectSeen(51);
  expect(game.data['cauldron']).toBeTruthy();
  game.mock_random_numbers = [1];
  game.command_parser.run("power");
  expectEffectSeen(52);
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  expect(game.artifacts.get(8).is_open).toBeTruthy();
  expect(game.artifacts.get(24).isHere()).toBeFalsy();
  game.command_parser.run('clo eas');
  expect(game.artifacts.get(7).is_open).toBeFalsy();
  game.command_parser.run('ope eas');
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  game.history.flush();

  // pit 1 - without boots
  game.player.moveToRoom(94); game.tick();
  game.command_parser.run('u');
  expect(game.history.getOutput().text).toBe("The ceiling is too high to climb back up!");
  expect(game.player.room_id).toBe(94);
  game.player.moveToRoom(84); game.tick();
  game.modal.mock_answers = ['No'];
  game.command_parser.run('d');
  expect(game.player.room_id).toBe(84);
  game.history.flush();

  // pit 2 - with boots
  game.artifacts.get(14).moveToInventory();
  game.player.wear(game.artifacts.get(14));
  game.player.updateInventory();
  game.command_parser.run('d');
  expectEffectSeen(47);
  expect(game.monsters.get(20).room_id).toBe(84);
  game.mock_random_numbers = [1];
  game.command_parser.run("power");
  expect(game.monsters.get(20).room_id).toBe(94);
  game.command_parser.run('u');
  expectEffectSeen(48);
  expect(game.player.room_id).toBe(84);
  expect(game.monsters.get(20).room_id).toBe(94);
  game.mock_random_numbers = [1];
  game.command_parser.run("power");
  expect(game.monsters.get(20).room_id).toBe(84);
  game.history.flush();

  // lich
  game.player.moveToRoom(109); game.tick();
  expectEffectSeen(53);
  game.command_parser.run('say barada lhain');
  expect(game.effects.get(55).seen).toBeFalsy(); // too soon
  game.command_parser.run('say i will free you');
  expectEffectSeen(54);
  expect(game.data['lich']).toBe(1);
  game.command_parser.run('say barada lhain');
  expectEffectSeen(55);
  expect(game.data['lich']).toBe(2);
  expect(game.artifacts.get(25).room_id).toBe(109);
  game.history.flush();

  // necromancer
  game.skip_battle_actions = true;
  game.player.moveToRoom(56); game.tick();
  game.mock_random_numbers = [1, 1];
  game.command_parser.run('attack necro');
  expectEffectSeen(61);
  expect(game.monsters.get(22).damage).toBe(0);
  game.mock_random_numbers = [
    4, // spell roll
    3, // ability increase roll
    2, // normal damage
    1  // effect shown by special code (56 gets added)
  ];
  game.command_parser.run('blast necro');
  expectEffectSeen(57);
  expect(game.monsters.get(22).damage).toBe(0);
  // with helmet
  game.artifacts.get(25).moveToInventory();
  game.player.wear(game.artifacts.get(25));
  game.player.updateInventory();
  game.mock_random_numbers = [1]; // only spell roll here
  game.command_parser.run('blast necro');
  expect(game.monsters.get(22).damage).toBeGreaterThan(0);
});

function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}
