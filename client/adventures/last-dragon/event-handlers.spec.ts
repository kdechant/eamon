/**
 * Unit tests for The Last Dragon
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {
  initLiveGame,
  expectEffectSeen,
  expectEffectNotSeen,
  playerHit,
  movePlayer,
  expectMonsterIsHere, expectArtifactIsNotHere, runCommand, expectArtifactIsHere, expectMonsterIsNotHere
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
  game.slug = 'last-dragon';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test('ship, no', () => {
  game.modal.mock_answers = ['No'];
  const gold = game.player.gold;
  movePlayer(2);
  expect(game.player.room_id).toBe(2);
  expect(game.player.gold).toBe(gold);
  expectEffectNotSeen(40);
  expectEffectNotSeen(41);
  expectEffectSeen(53);
});

test('ship pay', () => {
  game.modal.mock_answers = ['Yes'];
  const gold = game.player.gold;
  movePlayer(2);
  expect(game.player.room_id).toBe(3);
  expect(game.player.gold).toBe(gold - 100);
  expectEffectNotSeen(40);
  expectEffectSeen(41);
  expectEffectNotSeen(54);
});

test('ship, not enough money', () => {
  game.player.gold = 0;
  game.modal.mock_answers = ['Yes'];
  movePlayer(2);
  expect(game.player.room_id).toBe(2);
  expect(game.player.gold).toBe(0);
  expectEffectNotSeen(40);
  expectEffectNotSeen(41);
  expectEffectSeen(54);
  expect(game.won).toBeTruthy();
});

test('ship free passage', () => {
  game.modal.mock_answers = ['Say something else', 'quaal dracis'];
  const gold = game.player.gold;
  movePlayer(2);
  expect(game.player.room_id).toBe(3);
  expect(game.player.gold).toBe(gold);
  expectEffectSeen(40);
  expectEffectSeen(41);  // chained from 40
  expectEffectNotSeen(54);
});

test('go to cave', () => {
  function goToCave(random, expected_room) {
    game.effects.get(28).seen = false;
    movePlayer(25);
    game.mock_random_numbers = [random];
    runCommand('say quaal dracis');
    expectEffectSeen(28);
    expect(game.player.room_id).toBe(expected_room);
  }
  getRing();
  goToCave(1, 26);
  goToCave(2, 36);
  goToCave(3, 80);
  goToCave(4, 89);
});

test('exit cave', () => {
  game.artifacts.get(30).moveToInventory();
  runCommand('wear ring');
  const rooms = [35, 44, 88, 98];
  rooms.forEach(r => {
    game.effects.get(34).seen = false;
    movePlayer(35);
    runCommand('say quaal dracis');
    expectEffectSeen(34);
    expect(game.player.room_id).toBe(45);
  });
});

test("unicorn", () => {
  movePlayer(37);
  playerHit('unicorn', 999);
  expect(game.data.infected).toBeTruthy();
  expectEffectSeen(42);
  expect(game.player.inventory.length).toBe(0);
  expect(game.player.room_id).toBe(40);
});

test('sex change', () => {
  getLamp();
  movePlayer(29);
  expectMonsterIsHere(18);
  expect(game.player.gender).toBe('m');
  playerHit('erik', 1, [
    1,  // erik wont't flee
    // note: no need for dice roll for erik's target if he's alone with the player
    95, // erik will miss
  ]);
  expect(game.player.gender).toBe('m');  // didn't change back
  playerHit('erik', 999);
  expect(game.player.gender).toBe('f');  // did change back
  expect(game.data['undo sex change']).toBeTruthy();
  runCommand('e');
  expect(game.player.gender).toBe('f');  // didn't change again
});

test('befriend dragons', () => {
  getRing();
  movePlayer(46);

  // make baby dragons neutral to avoid combat
  const ossoric = game.monsters.get(27);
  const ossogotrix = game.monsters.get(28);
  ossoric.reaction = Monster.RX_NEUTRAL;
  ossogotrix.reaction = Monster.RX_NEUTRAL;

  // if didn't kill vc
  runCommand('say quaal dracis');
  expectEffectSeen(35);
  expectEffectNotSeen(36);
  expect(ossoric.reaction).toBe(Monster.RX_NEUTRAL);
  expect(ossogotrix.reaction).toBe(Monster.RX_NEUTRAL);

  // if did kill vc
  game.data['vc dead'] = true;
  runCommand('say quaal dracis');
  expectEffectSeen(38);
  expect(ossoric.reaction).toBe(Monster.RX_FRIEND);
  expect(ossogotrix.reaction).toBe(Monster.RX_FRIEND);

  runCommand('say kjelthor');
  expectEffectSeen(46);
  expect(game.player.room_id).toBe(47);
});

test('mylinth', () => {
  getLamp();
  movePlayer(82);
  runCommand('n');
  expectEffectSeen(18);
  expectEffectNotSeen(19);
  expect(game.player.room_id).toBe(80);

  movePlayer(82);
  runCommand('n');
  expectEffectSeen(19);
  expectMonsterIsHere(23);
  expect(game.data['mouse tiger']).toBeTruthy();
});

test('lisolet', () => {
  const lis = game.monsters.get(29);
  lis.moveToRoom(58);
  movePlayer(58);
  expect(lis.reaction).toBe(Monster.RX_FRIEND);
  runCommand('n');
  expect(lis.reaction).toBe(Monster.RX_HOSTILE);
});

test('get invictus', () => {
  getLamp();
  movePlayer(24);
  runCommand('say quaal dracis');
  expectArtifactIsHere(31);
  expectArtifactIsNotHere(32);
  expectEffectNotSeen(50);
  getRing();
  runCommand('say quaal dracis');
  expectEffectSeen(50);
  expectArtifactIsNotHere(31);
  expectArtifactIsHere(32);
});

test('ready invictus without dragon', () => {
  game.artifacts.get(32).moveToInventory();
  runCommand('ready inv');
  expectEffectSeen(43);
  expect(game.player.hasArtifact(32)).toBeFalsy();
  expect(game.data['ready invictus']).toBe(1);
  game.mock_random_numbers = [1];
  runCommand('power');
  expect(game.data['ready invictus']).toBe(2);
  expectArtifactIsHere(32);
});

test('invictus / dragon', () => {
  const vinc = game.monsters.get(26);
  game.artifacts.get(32).moveToInventory();
  movePlayer(45);
  runCommand('ready inv');
  expectEffectNotSeen(43);
  expect(game.player.hasArtifact(32)).toBeTruthy();
  playerHit(vinc, 999);
  expectArtifactIsHere(84);
  expect(game.data['vc dead']).toBeTruthy();
  expectEffectSeen(45);
  expect(game.player.hasArtifact(32)).toBeFalsy();
});

test('ice slab / warrior', () => {
  movePlayer(59);
  game.artifacts.get(30).moveToInventory();
  runCommand('wear ring');
  runCommand('say quaal dracis');
  expectMonsterIsHere(9);  // ragnar
  expectMonsterIsNotHere(10);  // woglinde (only appears to male char)
  expectEffectSeen(20);
});

test('gwynnith 1', () => {
  game.player.moveToRoom(56);
  expectEffectNotSeen(21);
});

test('gwynnith 2', () => {
  const dragons = [game.monsters.get(27), game.monsters.get(28)];
  dragons.forEach(d => {
    d.moveToRoom(55);
    d.reaction = Monster.RX_FRIEND;
  });
  movePlayer(55);
  runCommand('n');
  expectEffectSeen(21);
  expect(dragons[0].isHere()).toBeFalsy();
  expect(dragons[1].isHere()).toBeFalsy();
  expect(game.history.getLastOutput(2).text).toBe("Ossoric instantly vanishes!")
  expect(game.history.getLastOutput(1).text).toBe("Ossogotrix instantly vanishes!")
});

test('orowe', () => {
  runCommand('say orowe');
  expectMonsterIsNotHere(27);
  expectMonsterIsNotHere(28);

  movePlayer(75);
  game.monsters.get(39).destroy();  // harpy
  game.data['befriended dragons'] = true;
  runCommand('say orowe');
  expectEffectSeen(51);
  expectMonsterIsHere(27);
  expectEffectSeen(52);
  expectMonsterIsHere(28);
});

test('orowe 2', () => {
  game.monsters.get(39).destroy();  // harpy
  movePlayer(75);
  game.data['befriended dragons'] = true;
  game.data['ossoric dead'] = true;
  runCommand('say orowe');
  expectEffectNotSeen(51);
  expectMonsterIsNotHere(27);
  expectEffectSeen(52);
  expectMonsterIsHere(28);
});

test('orowe 3', () => {
  game.monsters.get(39).destroy();  // harpy
  movePlayer(75);
  game.data['befriended dragons'] = true;
  game.data['ossogotrix dead'] = true;
  runCommand('say orowe');
  expectEffectSeen(51);
  expectMonsterIsHere(27);
  expectEffectNotSeen(52);
  expectMonsterIsNotHere(28);
});

test('boss fight', () => {
  const tancred = game.monsters.get(11);
  tancred.moveToRoom(75);
  movePlayer(75);
  playerHit('harpy', 999);
  expectMonsterIsHere(40);
  expectArtifactIsNotHere(97);
  expect(tancred.reaction).toBe(Monster.RX_NEUTRAL);
  expect(game.data['tancred crazy']).toBeTruthy();
  playerHit('griffin', 999);
  expectMonsterIsHere(41);
  expectArtifactIsNotHere(98);
  playerHit('centaur', 999);
  expectMonsterIsHere(12);
  expectArtifactIsNotHere(99);
  playerHit('sauron', 999);
  expectEffectSeen(12);
});

function getRing() {
  game.artifacts.get(30).moveToInventory();
  runCommand('wear ring');
}

function getLamp() {
  game.artifacts.get(16).moveToInventory();
  runCommand('light lamp');
}
