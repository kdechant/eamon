/**
 * Unit tests for Attack of the Kretons
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
  game.slug = 'attack-of-the-kretons';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {

  // prince 1
  game.player.moveToRoom(5); game.tick();
  game.command_parser.run('get orb');
  expect(game.history.getOutput(0).text).toBe("Sorry, it's not yours.");

  // tavern
  game.player.moveToRoom(1); game.tick();
  game.mock_random_numbers = [2];  // for mike's random action
  game.command_parser.run("talk to mike");
  expect(game.effects.get(1).seen).toBeTruthy();
  expect(game.history.getLastOutput().text).toBe('Iron Mike cracks a walnut on his head.');
  game.command_parser.run("talk to minstrel");
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.effects.get(11).seen).toBeTruthy();
  expect(game.monsters.get(2).room_id).toBeNull();
  expect(game.monsters.get(3).room_id).toBe(1);
  expect(game.artifacts.get(8).room_id).toBe(1);
  game.command_parser.run('attack mike');
  expect(game.history.getOutput(0).text).toBe("That wouldn't be very nice!");
  expect(game.monsters.get(1).reaction).toBe(Monster.RX_NEUTRAL);

  // prince 2
  game.player.moveToRoom(5); game.tick();
  expect(game.data['prince unconscious']).toBeTruthy();
  expect(game.monsters.get(3).room_id).toBe(4);
  game.command_parser.run("talk to prince");
  expect(game.history.getOutput(0).text).toBe("The Prince is unconscious.");
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
  expect(game.monsters.get(3).room_id).toBe(11);
  expect(game.monsters.get(14).room_id).toBe(10);

  // max
  game.player.moveToRoom(43);
  game.tick();
  game.command_parser.run('flee e');
  expect(game.history.getOutput(0).text).toBe("Manly Max won't let you go that way!");
  expect(game.player.room_id).toBe(43);
  game.command_parser.run('flee');
  expect(game.player.room_id).toBe(13);

  // chichester
  game.player.moveToRoom(20);
  game.tick();
  game.command_parser.run('attack chichester');
  expect(game.effects.get(106).seen).toBeTruthy();
  game.command_parser.run('talk chichester');
  expect(game.monsters.get(16).reaction).toBe(Monster.RX_FRIEND);
  expect(game.effects.get(32).seen).toBeTruthy();
  expect(game.artifacts.get(19).isHere()).toBeTruthy();

  // arba/dakarba
  game.player.moveToRoom(24);
  game.command_parser.run('w');
  expect(game.effects.get(36).seen).toBeTruthy();
  game.monsters.get(19).destroy();
  game.monsters.get(20).destroy();

  // max 2
  game.artifacts.get(43).moveToInventory();
  game.player.moveToRoom(43);
  game.tick();
  game.command_parser.run('use wand of castratia');
  expect(game.monsters.get(29).isHere()).toBeFalsy();
  expect(game.artifacts.get(47).isHere()).toBeTruthy();

});
