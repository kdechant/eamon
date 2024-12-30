/**
 * Unit tests for Stronghold of Kahr-Dur
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {
  expectArtifactIsHere,
  expectArtifactIsNotHere,
  expectEffectSeen, expectMonsterIsHere,
  initLiveGame,
  movePlayer, moveToInventory, runCommand
} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

const game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'stronghold-of-kahr-dur';
  return initLiveGame(game);
});
beforeEach(() => {
  game.artifacts.get(9).moveToInventory(); // light
  runCommand('light whitestone');
})

// uncomment the following for debugging
//afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("should adjust monster HD", () => {
  // monster adjustable hardiness (based on demo character's 2d6 weapon)
  expect(game.monsters.get(1).hardiness).toBe(6);
  expect(game.monsters.get(2).hardiness).toBe(12);
  expect(game.monsters.get(10).hardiness).toBe(24);
});

test("spell backlash", () => {
  game.mock_random_numbers = [100];
  runCommand('speed');
  // set to 10, plus 1 for end-turn recharge
  expect(game.player.spell_abilities['speed']).toBe(11);
});

test("secret doors", () => {
  game.monsters.get(11).destroy();  // guards in library
  movePlayer(11);
  runCommand('n');
  expect(game.player.room_id).toBe(11);
  runCommand('ex boo');
  expectArtifactIsNotHere(10);
  movePlayer(18);
  runCommand('w');
  expect(game.player.room_id).toBe(18);
  runCommand('ex arm');
  expectArtifactIsNotHere(4);
  game.artifacts.get(2).moveToInventory();
  game.player.updateInventory();
  game.player.wear(game.artifacts.get(2));
  runCommand('ex arm');
  expectArtifactIsHere(4);
  game.monsters.get(2).destroy();  // golems
  game.monsters.get(3).destroy();
  runCommand('w');
  expect(game.player.room_id).toBe(19);
  runCommand('e');
  game.history.clear();
  runCommand('clo arm');
  expectArtifactIsNotHere(4);
  runCommand('w');
  expect(game.player.room_id).toBe(18);
  runCommand('op arm');
  expectArtifactIsHere(4);
  movePlayer(11);
  runCommand('ex boo');
  expectArtifactIsHere(10);
  runCommand('n');
  expect(game.player.room_id).toBe(93);
  // game.history.clear();
});

test("amulet + forest", () => {
  movePlayer(92);
  runCommand('n');
  expectEffectSeen(45);
  expect(game.player.room_id).toBe(92);
  game.artifacts.get(18).moveToInventory();
  game.player.updateInventory();
  runCommand('n');
  expect(game.player.room_id).toBe(65);
  // game.history.clear();
});

test("portcullis and knock spell", () => {
  movePlayer(43);
  runCommand('open portcullis');
  expect(game.artifacts.get(7).is_open).toBeFalsy();
  moveToInventory([19, 20, 21, 22, 24]);
  runCommand('pu ph into cau');
  runCommand('pu ru into cau');
  runCommand('pu der into cau');
  runCommand('pu eed into cau');
  runCommand('say knock nikto mellon');
  expectEffectSeen(51);
  expect(game.data['cauldron']).toBeTruthy();
  game.mock_random_numbers = [1];
  runCommand("power");
  expectEffectSeen(52);
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  expect(game.artifacts.get(8).is_open).toBeTruthy();
  expectArtifactIsNotHere(24);
  runCommand('clo eas');
  expect(game.artifacts.get(7).is_open).toBeFalsy();
  runCommand('ope eas');
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  // game.history.clear();
});

test("pit 1 - without boots", () => {
  movePlayer(94);
  runCommand('u');
  expect(game.history.getOutput().text).toBe("The ceiling is too high to climb back up!");
  expect(game.player.room_id).toBe(94);
  movePlayer(84);
  game.modal.mock_answers = ['No'];
  runCommand('d');
  expect(game.player.room_id).toBe(84);
});

test("pit 2 - with boots", () => {
  movePlayer(84);
  moveToInventory(14);
  game.player.wear(game.artifacts.get(14));
  game.player.updateInventory();
  runCommand('d');
  expectEffectSeen(47);
  expect(game.player.room_id).toBe(94);
  // friends don't come with
  expect(game.monsters.get(20).room_id).toBe(84);
  game.mock_random_numbers = [1];
  // use power to bring friends along
  runCommand("power");
  expect(game.monsters.get(20).room_id).toBe(94);
  runCommand('u');
  expectEffectSeen(48);
  expect(game.player.room_id).toBe(84);
  expect(game.monsters.get(20).room_id).toBe(94);
  game.mock_random_numbers = [1];
  runCommand("power");
  expect(game.monsters.get(20).room_id).toBe(84);
});

test("lich", () => {
  movePlayer(109);
  expectEffectSeen(53);
  runCommand('say barada lhain');
  expect(game.effects.get(55).seen).toBeFalsy(); // too soon
  runCommand('say i will free you');
  expectEffectSeen(54);
  expect(game.data['lich']).toBe(1);
  runCommand('say barada lhain');
  expectEffectSeen(55);
  expect(game.data['lich']).toBe(2);
  expect(game.artifacts.get(25).room_id).toBe(109);
  // game.history.clear();
});

test("necromancer", () => {
  const necro = game.monsters.get(22);
  game.skip_battle_actions = true;
  movePlayer(56);
  game.mock_random_numbers = [1, 1];
  runCommand('attack necro');
  expectEffectSeen(61);
  expect(necro.damage).toBe(0);
  game.mock_random_numbers = [
    // 4, // spell roll
    // 3, // ability increase roll
    // 2, // normal damage
    1  // effect shown by special code (56 gets added)
  ];
  runCommand('blast necro');
  expectEffectSeen(57);
  expect(necro.damage).toBe(0);
  // with helmet
  game.artifacts.get(25).moveToInventory();
  game.player.wear(game.artifacts.get(25));
  game.player.updateInventory();
  game.mock_random_numbers = [1]; // only spell roll here
  runCommand('blast necro');
  expect(necro.damage).toBeGreaterThan(0);
  // game.history.clear();
});

test("exit", () => {
  const necro = game.monsters.get(22);
  game.skip_battle_actions = true;
  movePlayer(56);

  necro.injure(1000);
  [23, 24, 25].forEach(id => game.monsters.get(id).destroy());
  movePlayer(1);
  game.modal.mock_answers = ['No'];
  runCommand('s');
  expect(game.history.getOutput().text).toBe('You have not succeeded in your quest!');
  movePlayer(56);
  runCommand('free mirabelle');
  expectMonsterIsHere(26);
  movePlayer(1);
  game.modal.mock_answers = ['No'];
  runCommand('s');
  expect(game.history.getOutput().text).toBe('You have succeeded in your quest! Congratulations!');
});
