/**
 * Unit tests for Attack of the Kretons
 */
import Game from "../../core/models/game";
import {HistoryManager} from "../../core/models/history-manager";
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
  game.slug = 'attack-of-the-kretons';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("prince 1", () => {
  const orb = game.artifacts.get(45);
  movePlayer(5);
  runCommand('get orb');
  expect(game.history.getOutput(0).text).toBe("Sorry, it's not yours.");
  expect(orb.room_id).toBe(5);
  runCommand('get all');
  expect(orb.room_id).toBe(5);
  runCommand("request orb from prince");
  expect(game.history.getOutput(0).text).toBe("The Prince says you can't have it if you don't have a reason.");
});

test("tavern", () => {
  const groo = game.monsters.get(3);
  movePlayer(1);
  game.mock_random_numbers = [2, 2];  // for mike's random action
  runCommand("talk to mike");
  expect(game.effects.get(1).seen).toBeTruthy();
  expect(game.history.getLastOutput().text).toBe('Iron Mike cracks a walnut on his head.');
  game.modal.mock_answers = ['ok'];
  runCommand("talk to minstrel");
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.effects.get(11).seen).toBeTruthy();
  expect(game.monsters.get(2).room_id).toBeNull();
  expect(groo.room_id).toBe(1);
  expect(game.artifacts.get(8).room_id).toBe(1);
  runCommand('attack mike');
  expect(game.history.getOutput(0).text).toBe("That wouldn't be very nice!");
  expect(game.monsters.get(1).reaction).toBe(Monster.RX_NEUTRAL);
});

test("prince 2", () => {
  const groo = summon_groo();
  movePlayer(5);
  expect(game.data['prince unconscious']).toBeTruthy();
  expect(game.data['prince saw groo']).toBeTruthy();
  expect(groo.room_id).toBe(4);
  runCommand("talk to prince");
  expect(game.history.getOutput(0).text).toBe("The Prince is unconscious.");
  runCommand("request orb from prince");
  expect(game.history.getOutput(0).text).toBe("He's unconscious.");
});

test("gate / kretons", () => {
  const groo = summon_groo();
  movePlayer(9);
  runCommand('open gate');
  expect(game.history.getOutput(0).text).toBe("Don't be dumb.");
  runCommand('w');
  expect(game.effects.get(25).seen).toBeTruthy();
  expect(game.player.room_id).toBe(10);
  expect(groo.room_id).toBe(10);
  expect(game.effects.get(27).seen).toBeTruthy();
  runCommand("flee n");
  expect(game.player.room_id).toBe(11);
  expect(game.effects.get(29).seen).toBeTruthy();
  expect(groo.room_id).toBe(11);
  expect(game.monsters.get(14).room_id).toBe(10);
});

test("max", () => {
  runCommand("use wand of castratia"); // when max is not here
  expect(game.effects.get(110).seen).toBeFalsy();
  expect(game.monsters.get(29).room_id).toBe(43);
  movePlayer(43);
  runCommand('flee e');
  expect(game.history.getOutput(0).text).toBe("Manly Max won't let you go that way!");
  expect(game.player.room_id).toBe(43);
  runCommand('flee');
  expect(game.player.room_id).toBe(13);
  game.artifacts.get(43).moveToInventory();
  runCommand('e');
  runCommand('use wand of castratia'); // when max is here
  expect(game.monsters.get(29).isHere()).toBeFalsy();
  expect(game.artifacts.get(47).isHere()).toBeTruthy();
  expect(game.effects.get(110).seen).toBeTruthy();
});

test("eagles / wizard / arena", () => {
  movePlayer(45);
  game.command_parser.run('n');
  expect(game.effects.get(56).seen).toBeTruthy();
  runCommand('say the password');
  expect(game.player.room_id).toBe(45);  // didn't move
  expect(game.history.getOutput(1).text).toBe('The eagles say, "OK, go on in."');
  runCommand('n');
  expect(game.player.room_id).toBe(46);  // did move
  runCommand('request crystal from wizard');
  expect(game.player.room_id).toBe(47);  // arena
  game.monsters.get(31).injure(1000);
  expect(game.monsters.get(32).isHere()).toBeTruthy();  // zombies appear
  game.monsters.get(32).injure(1000);
  expect(game.monsters.get(33).isHere()).toBeFalsy();  // conan should not appear until all zombies die
  game.monsters.get(32).children
    .filter(m => m.status === Monster.STATUS_ALIVE)
    .forEach(c => c.injure(1000));  // kill 'em all
  runCommand('look');
  expect(game.monsters.get(32).isHere()).toBeFalsy();  // all zombies dead
  expect(game.monsters.get(33).isHere()).toBeTruthy();  // conan appears
  expect(game.effects.get(65).seen).toBeTruthy();  // conan's opening remarks
  game.monsters.get(33).injure(1000);
  expect(game.effects.get(59).seen).toBeTruthy();

  expect(game.player.room_id).toBe(46);  // back to wizard's cave
  expect(game.player.hasArtifact(49)).toBeTruthy();  // get crystal
});

test("chichester", () => {
  const chi = game.monsters.get(16);
  movePlayer(20);

  runCommand('attack chichester');
  expect(game.effects.get(106).seen).toBeTruthy();
  runCommand('talk chichester');
  expect(chi.reaction).toBe(Monster.RX_FRIEND);
  expect(game.effects.get(32).seen).toBeTruthy();
  expect(game.artifacts.get(19).isHere()).toBeTruthy();
  runCommand('request cig from chi');
  expect(game.history.getOutput(0).text).toBe('Chichester tells you to bite something.');
  expect(chi.hasArtifact(51)).toBeTruthy();
});

test("dog", () => {
  movePlayer(24);
  runCommand('free dog');

  expect(game.monsters.get(18).isHere()).toBeTruthy();
});

test("arba/dakarba/sage", () => {
  summon_chichester();
  movePlayer(24);
  const sage = game.monsters.get(21);
  game.artifacts.get(25).moveToInventory();  // key
  runCommand('w');
  expect(game.effects.get(36).seen).toBeTruthy();
  game.monsters.get(19).destroy();
  game.monsters.get(20).injure(1000);
  runCommand('look');
  expect(game.artifacts.get(25).isHere()).toBeTruthy();
  runCommand('get key');
  runCommand('free sage');
  expect(sage.isHere()).toBeTruthy();
  expect(game.monsters.get(34).room_id).toBe(13);
  runCommand('w');
  runCommand('open chest');
  expect(game.artifacts.get(24).is_open).toBeTruthy();
  runCommand('get wand');
  movePlayer(13);
  expect(game.effects.get(72).seen).toBeTruthy();
  expect(game.monsters.get(34).room_id).toBeNull();
});

test("sage / gate / brandy", () => {
  summon_chichester();
  const sage = summon_sage();
  movePlayer(11);
  runCommand('s');
  runCommand('flee e');
  expect(game.effects.get(28).seen).toBeTruthy();
  expect(game.player.room_id).toBe(2);
  expect(sage.room_id).toBe(3);  // sage stays put
  expect(game.artifacts.get(29).room_id).toBe(2);  // key
  runCommand('get key');
  runCommand('e');
  runCommand('s');
  runCommand('request brandy from stan');
  expect(game.history.getOutput(0).text).toBe('"I\'ll sell it to you for 75 kopins," says Stan.');
  runCommand('give 10 to stan');
  expect(game.history.getOutput(0).text).toBe('"That ain\'t enough!" growls Stan.');
  runCommand('give 75 to stan');
  expect(game.data['brandy']).toBeTruthy();
  expect(game.artifacts.get(28).room_id).toBe(6);
  runCommand('request brandy from stan');
  expect(game.history.getOutput(0).text).toBe('"Sorry, all out of that," says Stan.');
  runCommand('get brandy');
  runCommand('n');
  runCommand('w');
  runCommand('n');
  expect(game.history.getLastOutput().text).toBe("The Sage begs for the brandy.");
  runCommand('give brandy to sage');
  expect(game.effects.get(42).seen).toBeTruthy();
  runCommand('read catalog');
  expect(game.effects.get(14).seen).toBeTruthy();
  expect(sage.hasArtifact(6)).toBeTruthy();
  runCommand('request catalog from sage');
  expect(game.history.getOutput(0).text).toBe('Sage tells you to bite something.');
  expect(sage.hasArtifact(6)).toBeTruthy();
});

test("granite slab", () => {
  movePlayer(35);
  runCommand('open slab');
  expect(game.history.getOutput(0).text).toBe('How?');
  runCommand('say dhoud');
  expect(game.effects.get(109).seen).toBeTruthy();
  expect(game.artifacts.get(34).is_open).toBeTruthy();
});

test("old man", () => {
  movePlayer(42);
  runCommand('free old man');
  expect(game.effects.get(88).seen).toBeTruthy();
  expect(game.artifacts.get(68).room_id).toBeNull();
  expect(game.artifacts.get(69).isHere()).toBeTruthy();
});

test("codex", () => {
  game.monsters.get(26).destroy();  // get priest out of the way
  movePlayer(39);
  runCommand('read codex');
  expect(game.data['codex']).toBeTruthy();
  expect(game.data['prince unconscious']).toBeFalsy();
});

test("prince 3 / orb", () => {
  // prince 3 / orb
  game.artifacts.get(49).moveToInventory();
  movePlayer(5);
  runCommand('give crystal to prince');
  expect(game.effects.get(63).seen).toBeTruthy();
  expect(game.data['orb']).toBeTruthy();
  runCommand('get orb');
  expect(game.player.hasArtifact(45)).toBeTruthy();
});

test("misc", () => {
  const groo = game.monsters.get(3);
  groo.injure(100);
  expect(game.effects.get(108).seen).toBeTruthy();
  expect(groo.status).toBe(Monster.STATUS_ALIVE);
  expect(groo.damage).toBe(0);
  game.artifacts.get(70).moveToInventory();
  runCommand('use amulet');
  expect(game.effects.get(90).seen).toBeTruthy();
  runCommand("use wand of water");
  expect(game.effects.get(84).seen).toBeFalsy();
});

test("stench", () => {
  game.artifacts.get(26).moveToInventory();
  game.artifacts.get(45).moveToInventory();
  runCommand('say imtu khoul');
  expect(game.player.room_id).toBe(48);
  game.monsters.get(35).destroy();  // get reaper out of the way
  movePlayer(50);
  runCommand('e');
  expect(game.history.getOutput().text).toBe("You feel as if you are tumbling through space and time...");
  expect(game.history.getLastOutput().text).toBe("You think you hear Frank Zappa far in the distance.");
  // zombies
  game.skip_battle_actions = true;
  summon_chichester();
  movePlayer(52);
  expect(game.effects.get(80).seen).toBeTruthy();
  expect(game.monsters.get(36).isHere()).toBeFalsy();
  // hot room
  movePlayer(57);
  expect(game.data['hot room']).toBe(1);
  runCommand("use wand of water");
  expect(game.effects.get(84).seen).toBeTruthy();
  expect(game.data['hot room']).toBe(-1);
});

test("altar", () => {
  summon_groo();
  summon_sage();
  game.monsters.get(41).destroy();  // joey
  game.artifacts.get(70).moveToInventory();
  movePlayer(58);
  runCommand('e');
  expect(game.effects.get(85).seen).toBeTruthy();
  expect(game.effects.get(86).seen).toBeTruthy();
  expect(game.monsters.get(39).isHere()).toBeFalsy();
  expect(game.monsters.get(40).isHere()).toBeTruthy();
  expect(game.artifacts.get(65).isHere()).toBeTruthy();
  expect(game.artifacts.get(66).isHere()).toBeTruthy();
  runCommand('use amulet');
  expect(game.monsters.get(40).isHere()).toBeFalsy();
  expect(game.effects.get(91).seen).toBeTruthy();
  expect(game.artifacts.get(67).isHere()).toBeTruthy();
  expect(game.monsters.get(18).name).toBe('Mulch');
});

test("exit", () => {
  game.monsters.get(39).destroy();
  game.monsters.get(40).destroy();
  const gold = game.player.gold;
  movePlayer(55);
  runCommand('say cawteenahmosh');
  expect(game.effects.get(96).seen).toBeTruthy();
  expect(game.effects.get(105).seen).toBeTruthy();
  expect(game.player.gold).toBe(gold + 5000);
  expect(game.won).toBeTruthy();
});

function summon_groo() {
  const groo = game.monsters.get(3);
  groo.moveToRoom();
  game.monsters.updateVisible();
  return groo;
}

function summon_chichester() {
  const chi = game.monsters.get(16);
  chi.moveToRoom();
  chi.reaction = Monster.RX_FRIEND;
  game.monsters.updateVisible();
  return chi;
}

function summon_sage() {
  const sage = game.monsters.get(21);
  sage.moveToRoom();
  game.monsters.updateVisible();
  return sage;
}
