/**
 * Unit tests for Mines of Moria
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
  runCommand,
  expectArtifactIsNotHere,
  expectArtifactIsHere,
  expectMonsterIsHere,
  expectMonsterIsNotHere
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
  game.slug = 'mines-of-moria';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("death trap - water", () => {
  movePlayer(38);
  game.command_parser.run('n');
  expect(game.died).toBeTruthy();
});

test("death trap - orcs", () => {
  movePlayer(66);
  runCommand('n');
  expect(game.died).toBeTruthy();
});

test("death trap - pit", () => {
  game.monsters.get(18).destroy();
  movePlayer(19);
  runCommand('e');
  expect(game.died).toBeTruthy();
});

test("death trap - thieves", () => {
  movePlayer(2);
  runCommand('s');
  expect(game.died).toBeTruthy();
});

test("negative connections", () => {
  movePlayer(33);
  runCommand('n');
  expect(game.history.getOutput().text).toBe('The cave-in blocks your path!');
  expect(game.player.room_id).toBe(33);
});

test('pure lembas', () => {
  game.artifacts.get(29).moveToInventory();
  const hd = game.player.hardiness;
  runCommand('eat lembas');
  expect(game.player.hardiness).toBe(hd + 1);
});

test('flee', () => {
  movePlayer(36);
  game.command_parser.run('flee');
  expect(game.history.getOutput().text).toBe("You can't!")
  expect(game.player.room_id).toBe(36);
  game.monsters.get(26).destroy();
  movePlayer(68);
  game.command_parser.run('flee');
  expect(game.history.getOutput().text).toBe("You can't turn your back now!")
  expect(game.player.room_id).toBe(68);
});

test('mining', () => {
  game.artifacts.get(33).moveToInventory();
  movePlayer(30);
  runCommand('use tools');
  expect(game.artifacts.get(23).room_id).toBe(30);
  movePlayer(32);
  runCommand('use tools');
  expect(game.monsters.get(47).room_id).toBe(32);
  game.monsters.get(47).destroy();
  movePlayer(33);
  runCommand('n');
  expect(game.player.room_id).toBe(33);
  runCommand('use tools');
  expect(game.history.getOutput(1).text).toBe("You mined through the cave-in! You can now go north!");
  runCommand('n');
  expect(game.player.room_id).toBe(90);
});

test('keys and elevator', () => {
  getLight();
  game.artifacts.get(13).moveToInventory();
  game.artifacts.get(21).moveToInventory();
  movePlayer(89);
  expectArtifactIsNotHere(36);
  runCommand('use silver key');
  expect(game.history.getOutput().text).toBe("It doesn't fit.");
  expectArtifactIsNotHere(36);
  runCommand('use gold key');
  expectArtifactIsHere(36);
  runCommand('use lever');
  expectEffectSeen(6);
  expect(game.player.room_id).toBe(79);
  runCommand('use lever');
  expectEffectSeen(7);
  expect(game.player.room_id).toBe(89);
});

test('put', () => {
  // put gold key == use gold key
  game.artifacts.get(21).moveToInventory();
  movePlayer(89);
  runCommand('put gold key into keyhole');
  expectEffectSeen(21);
  expectArtifactIsHere(36);

  // arkenstone
  game.artifacts.get(24).moveToInventory();
  movePlayer(14);
  runCommand('put stone into pillar');
  expectArtifactIsHere(40);
});

test('letter', () => {
  game.artifacts.get(19).moveToInventory();
  movePlayer(game.monsters.get(1).room_id);
  runCommand('give letter to galadriel');
  expectEffectSeen(3);
  expect(game.won).toBeTruthy();
});

test('trading', () => {
  game.artifacts.get(1).moveToInventory();
  game.artifacts.get(2).moveToInventory();
  game.artifacts.get(23).moveToInventory();
  movePlayer(game.monsters.get(49).room_id);
  game.command_parser.run('give scimitar to elf');
  expectEffectSeen(11);
  expectArtifactIsHere(35);
  game.command_parser.run('give gems to elf');
  expectEffectSeen(2);
  expectArtifactIsHere(29);
  game.command_parser.run('give bow to elf');
  expect(game.history.getOutput(0).text).toBe("He doesn't feel like trading any more.");
  expect(game.player.hasArtifact(2));
});

test('magic words', () => {
  getLight();
  runCommand('say my friend');
  expect(game.player.room_id).toBe(1);
  movePlayer(3);
  runCommand('say my friend');
  expect(game.player.room_id).toBe(86);

  movePlayer(14);
  expect(game.rooms.current_room.getExit('w')).toBeNull();
  runCommand('say now');
  expectEffectSeen(16);
  expectEffectSeen(18);
  expectArtifactIsNotHere(44);
  expectMonsterIsHere(28);
  expect(game.rooms.current_room.getExit('w')).not.toBeNull();
  expect(game.rooms.current_room.name).toBe('You are in a large, fancy chamber. (E/W)');
  runCommand('w');
  expect(game.player.room_id).toBe(15);
});

test("forest gate", () => {
  movePlayer(73);
  runCommand('e');
  const gate = game.artifacts.get(43);
  expectEffectSeen(13);
  expect(game.player.room_id).toBe(73);
  game.effects.get(13).seen = false;
  runCommand('open gate');
  expectEffectSeen(13);
  expect(gate.is_open).toBeFalsy();
  runCommand('say elbereth');
  expectEffectSeen(17);
  expect(game.artifacts.get(43).is_open).toBeTruthy();
  expect(game.rooms.current_room.getExit('e').room_to).toBe(74);
});

test('power', () => {
  getLight();
  game.mock_random_numbers = [
    1,  // spell succeeds
    0,  // no increase
    40  // effect roll
  ];
  runCommand('power');
  expectEffectSeen(9);
  game.mock_random_numbers = [1, 0, 80];
  runCommand('power');
  expect(game.history.getOutput(0).text).toBe("It starts to rain.");
  movePlayer(7);
  game.mock_random_numbers = [1, 0, 80];
  runCommand('power');
  expectEffectSeen(20);
  expectMonsterIsHere(50);
  game.monsters.get(50).destroy();
  movePlayer(68);
  game.mock_random_numbers = [1];
  runCommand('power');
  expectEffectSeen(12);
  expectMonsterIsNotHere(48);
});

test('you shall not pass', () => {
  getLight();
  movePlayer(68);
  game.mock_random_numbers = [1];
  runCommand('blast balrog');
  expectEffectSeen(12);
  expectMonsterIsNotHere(48);
});

function getLight() {
  game.artifacts.get(12).moveToInventory();
  runCommand('light staff');
}
