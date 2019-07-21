/**
 * Unit tests for Attack of the Kretons
 */
import Game from "../../core/models/game";
import {HistoryManager} from "../../core/models/history-manager";
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
  game.slug = 'attack-of-the-kretons';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {

  // prince 1
  let orb = game.artifacts.get(45);
  game.player.moveToRoom(5); game.tick();
  game.command_parser.run('get orb');
  expect(game.history.getOutput(0).text).toBe("Sorry, it's not yours.");
  expect(orb.room_id).toBe(5);
  game.command_parser.run('get all');
  expect(orb.room_id).toBe(5);
  game.command_parser.run("request orb from prince");
  expect(game.history.getOutput(0).text).toBe("The Prince says you can't have it if you don't have a reason.");

  // tavern
  let groo = game.monsters.get(3);
  game.player.moveToRoom(1); game.tick();
  game.mock_random_numbers = [2, 2];  // for mike's random action
  game.command_parser.run("talk to mike");
  expect(game.effects.get(1).seen).toBeTruthy();
  expect(game.history.getLastOutput().text).toBe('Iron Mike cracks a walnut on his head.');
  game.modal.mock_answers = ['ok'];
  game.command_parser.run("talk to minstrel");
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.effects.get(11).seen).toBeTruthy();
  expect(game.monsters.get(2).room_id).toBeNull();
  expect(groo.room_id).toBe(1);
  expect(game.artifacts.get(8).room_id).toBe(1);
  game.command_parser.run('attack mike');
  expect(game.history.getOutput(0).text).toBe("That wouldn't be very nice!");
  expect(game.monsters.get(1).reaction).toBe(Monster.RX_NEUTRAL);

  game.history.clear();

  // prince 2
  game.player.moveToRoom(5); game.tick();
  expect(game.data['prince unconscious']).toBeTruthy();
  expect(game.data['prince saw groo']).toBeTruthy();
  expect(groo.room_id).toBe(4);
  game.command_parser.run("talk to prince");
  expect(game.history.getOutput(0).text).toBe("The Prince is unconscious.");
  game.command_parser.run("request orb from prince");
  expect(game.history.getOutput(0).text).toBe("He's unconscious.");
  game.command_parser.run('s');  // rejoin groo

  // gate / kretons
  game.player.moveToRoom(9); game.tick();
  game.artifacts.updateVisible();
  game.tick();
  game.command_parser.run('open gate');
  expect(game.history.getOutput(0).text).toBe("Don't be dumb.");
  game.command_parser.run('w');
  expect(game.effects.get(25).seen).toBeTruthy();
  expect(game.player.room_id).toBe(10);
  expect(game.effects.get(27).seen).toBeTruthy();
  game.command_parser.run("flee n");
  expect(game.player.room_id).toBe(11);
  expect(game.effects.get(29).seen).toBeTruthy();
  expect(groo.room_id).toBe(11);
  expect(game.monsters.get(14).room_id).toBe(10);

  game.history.clear();

  // max
  game.command_parser.run("use wand of castratia"); // when max is not here
  expect(game.effects.get(110).seen).toBeFalsy();
  expect(game.monsters.get(29).room_id).toBe(43);
  game.player.moveToRoom(43);
  game.tick();
  game.command_parser.run('flee e');
  expect(game.history.getOutput(0).text).toBe("Manly Max won't let you go that way!");
  expect(game.player.room_id).toBe(43);
  game.command_parser.run('flee');
  expect(game.player.room_id).toBe(13);
  game.artifacts.get(43).moveToInventory();
  game.command_parser.run('e');
  game.command_parser.run('use wand of castratia'); // when max is here
  expect(game.monsters.get(29).isHere()).toBeFalsy();
  expect(game.artifacts.get(47).isHere()).toBeTruthy();
  expect(game.effects.get(110).seen).toBeTruthy();

  // eagles / wizard / arena
  game.command_parser.run('e');
  game.command_parser.run('n');
  game.command_parser.run('n');
  expect(game.effects.get(56).seen).toBeTruthy();
  game.command_parser.run('say the password');
  expect(game.player.room_id).toBe(45);  // didn't move
  expect(game.history.getOutput(1).text).toBe('The eagles say, "OK, go on in."');
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(46);  // did move
  game.command_parser.run('request crystal from wizard');
  expect(game.player.room_id).toBe(47);  // arena
  game.monsters.get(31).injure(1000);
  game.tick();
  expect(game.monsters.get(32).isHere()).toBeTruthy();  // zombies appear
  game.monsters.get(32).injure(1000);
  expect(game.monsters.get(33).isHere()).toBeFalsy();  // conan should not appear until all zombies die
  game.monsters.get(32).children
    .filter(m => m.status === Monster.STATUS_ALIVE)
    .forEach(c => c.injure(1000));  // kill 'em all
  expect(game.monsters.get(32).isHere()).toBeFalsy();  // all zombies dead
  game.tick();
  expect(game.monsters.get(33).isHere()).toBeTruthy();  // conan appears
  expect(game.effects.get(65).seen).toBeTruthy();  // conan's opening remarks
  game.monsters.get(33).injure(1000);
  expect(game.effects.get(59).seen).toBeTruthy();
  game.tick();
  expect(game.player.room_id).toBe(46);  // back to wizard's cave
  expect(game.player.hasArtifact(49)).toBeTruthy();  // get crystal

  game.history.clear();

  // chichester
  let chi = game.monsters.get(16);
  game.player.moveToRoom(20);
  game.tick();
  game.command_parser.run('attack chichester');
  expect(game.effects.get(106).seen).toBeTruthy();
  game.command_parser.run('talk chichester');
  expect(chi.reaction).toBe(Monster.RX_FRIEND);
  expect(game.effects.get(32).seen).toBeTruthy();
  expect(game.artifacts.get(19).isHere()).toBeTruthy();
  game.command_parser.run('request cig from chi');
  expect(game.history.getOutput(0).text).toBe('Chichester tells you to bite something.');
  expect(chi.hasArtifact(51)).toBeTruthy();

  // dog
  game.player.moveToRoom(24);
  game.command_parser.run('free dog');
  game.tick();
  expect(game.monsters.get(18).isHere()).toBeTruthy();

  game.history.clear();

  // arba/dakarba/sage
  let sage = game.monsters.get(21);
  game.artifacts.get(25).moveToInventory();  // key
  game.command_parser.run('w');
  expect(game.effects.get(36).seen).toBeTruthy();
  game.monsters.get(19).destroy();
  game.monsters.get(20).injure(1000);
  game.tick();
  expect(game.artifacts.get(25).isHere()).toBeTruthy();
  game.command_parser.run('get key');
  game.command_parser.run('free sage');
  expect(sage.isHere()).toBeTruthy();
  expect(game.monsters.get(34).room_id).toBe(13);
  game.command_parser.run('w');
  game.command_parser.run('open chest');
  expect(game.artifacts.get(24).is_open).toBeTruthy();
  game.command_parser.run('get wand');
  game.player.moveToRoom(13); game.tick();
  expect(game.effects.get(72).seen).toBeTruthy();
  expect(game.monsters.get(34).room_id).toBeNull();

  game.history.clear();

  // sage / gate / brandy
  game.player.moveToRoom(11);
  game.command_parser.run('s');
  game.command_parser.run('flee e');
  expect(game.effects.get(28).seen).toBeTruthy();
  expect(game.player.room_id).toBe(2);
  expect(sage.room_id).toBe(3);  // sage stays put
  expect(game.artifacts.get(29).room_id).toBe(2);  // key
  game.command_parser.run('get key');
  game.command_parser.run('e');
  game.command_parser.run('s');
  game.command_parser.run('request brandy from stan');
  expect(game.history.getOutput(0).text).toBe('"I\'ll sell it to you for 75 kopins," says Stan.');
  game.command_parser.run('give 10 to stan');
  expect(game.history.getOutput(0).text).toBe('"That ain\'t enough!" growls Stan.');
  game.command_parser.run('give 75 to stan');
  expect(game.data['brandy']).toBeTruthy();
  expect(game.artifacts.get(28).room_id).toBe(6);
  game.command_parser.run('request brandy from stan');
  expect(game.history.getOutput(0).text).toBe('"Sorry, all out of that," says Stan.');
  game.command_parser.run('get brandy');
  game.command_parser.run('n');
  game.command_parser.run('w');
  game.command_parser.run('n');
  expect(game.history.getLastOutput().text).toBe("The Sage begs for the brandy.");
  game.command_parser.run('give brandy to sage');
  expect(game.effects.get(42).seen).toBeTruthy();
  game.command_parser.run('read catalog');
  expect(game.effects.get(14).seen).toBeTruthy();
  expect(sage.hasArtifact(6)).toBeTruthy();
  game.command_parser.run('request catalog from sage');
  expect(game.history.getOutput(0).text).toBe('Sage tells you to bite something.');
  expect(sage.hasArtifact(6)).toBeTruthy();

  game.history.clear();

  // granite slab
  game.player.moveToRoom(35);
  game.command_parser.run('open slab');
  expect(game.history.getOutput(0).text).toBe('How?');
  game.command_parser.run('say dhoud');
  expect(game.effects.get(109).seen).toBeTruthy();
  expect(game.artifacts.get(34).is_open).toBeTruthy();

  // old man
  game.player.moveToRoom(42); game.tick();
  game.command_parser.run('free old man');
  expect(game.effects.get(88).seen).toBeTruthy();
  expect(game.artifacts.get(68).room_id).toBeNull();
  expect(game.artifacts.get(69).isHere()).toBeTruthy();

  // codex
  game.monsters.get(26).destroy();  // get priest out of the way
  game.player.moveToRoom(39);
  game.command_parser.run('read codex');
  expect(game.data['codex']).toBeTruthy();
  expect(game.data['prince unconscious']).toBeFalsy();

  // prince 3 / orb
  game.player.moveToRoom(5); game.tick();
  game.command_parser.run('give crystal to prince');
  expect(game.effects.get(63).seen).toBeTruthy();
  expect(game.data['orb']).toBeTruthy();
  game.command_parser.run('get orb');
  expect(game.player.hasArtifact(45)).toBeTruthy();

  game.history.clear();

  // misc
  groo.injure(100);
  expect(game.effects.get(108).seen).toBeTruthy();
  expect(groo.status).toBe(Monster.STATUS_ALIVE);
  expect(groo.damage).toBe(0);
  game.artifacts.get(70).moveToInventory();
  game.command_parser.run('use amulet');
  expect(game.effects.get(90).seen).toBeTruthy();
  game.command_parser.run("use wand of water");
  expect(game.effects.get(84).seen).toBeFalsy();

  // stench
  game.command_parser.run('say imtu khoul');
  expect(game.player.room_id).toBe(48);
  game.monsters.get(35).destroy();  // get reaper out of the way
  game.player.moveToRoom(50);
  game.command_parser.run('e');
  expect(game.history.getOutput().text).toBe("You feel as if you are tumbling through space and time...");
  expect(game.history.getLastOutput().text).toBe("You think you hear Frank Zappa far in the distance.");
  // zombies
  game.skip_battle_actions = true;
  game.player.moveToRoom(52); game.tick();
  expect(game.effects.get(80).seen).toBeTruthy();
  expect(game.monsters.get(36).isHere()).toBeFalsy();
  // hot room
  game.player.moveToRoom(57); game.tick();
  expect(game.data['hot room']).toBe(1);
  game.command_parser.run("use wand of water");
  expect(game.effects.get(84).seen).toBeTruthy();
  expect(game.data['hot room']).toBe(-1);

  game.history.clear();

  // altar
  game.monsters.get(41).destroy();  // joey
  game.player.moveToRoom(58);
  game.command_parser.run('e');
  expect(game.effects.get(85).seen).toBeTruthy();
  expect(game.effects.get(86).seen).toBeTruthy();
  expect(game.monsters.get(39).isHere()).toBeFalsy();
  expect(game.monsters.get(40).isHere()).toBeTruthy();
  expect(game.artifacts.get(65).isHere()).toBeTruthy();
  expect(game.artifacts.get(66).isHere()).toBeTruthy();
  game.command_parser.run('use amulet');
  expect(game.monsters.get(40).isHere()).toBeFalsy();
  expect(game.effects.get(91).seen).toBeTruthy();
  expect(game.artifacts.get(67).isHere()).toBeTruthy();
  expect(game.monsters.get(18).name).toBe('Mulch');

  // exit
  let gold = game.player.gold;
  game.player.moveToRoom(55); game.tick();
  game.command_parser.run('say cawteenahmosh');
  expect(game.effects.get(96).seen).toBeTruthy();
  expect(game.effects.get(105).seen).toBeTruthy();
  expect(game.player.gold).toBe(gold + 5000);
  expect(game.won).toBeTruthy();

});
