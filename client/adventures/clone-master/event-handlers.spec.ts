/**
 * Unit tests for Assault on the Clone Master
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
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
  game.slug = 'clone-master';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {
  // expect(game.rooms.rooms.length).toBe(46, "Wrong room count. Check data.");
  // expect(game.artifacts.all.length).toBe(43 + 5, "Wrong artifact count. Check data."); // includes player artifacts
  // expect(game.effects.all.length).toBe(3, "Wrong effect count. Check data.");
  // expect(game.monsters.all.length).toBe(23, "Wrong monster count. Check data."); // includes player

  // big fight
  game.player.moveToRoom(4, true);
  game.command_parser.run("attack clone army");
  expect(game.effects.get(9).seen).toBeTruthy();
  expect(game.monsters.get(4).reaction).toBe(Monster.RX_NEUTRAL);
  expect(game.monsters.get(5).reaction).toBe(Monster.RX_NEUTRAL);
  expect(game.monsters.get(6).room_id).toBeNull();
  // main gate blocked
  game.command_parser.run("s");
  expect(game.player.room_id).toBe(4);

  // blow stuff up
  game.player.moveToRoom(2);
  game.player.pickUp(game.artifacts.get(5));
  game.player.moveToRoom(6);
  game.player.drop(game.artifacts.get(5));
  game.command_parser.run("light dynamite", false);
  expect(game.artifacts.get(5).room_id).toBeNull();
  expect(game.artifacts.get(6).room_id).toBeNull();
  expect(game.artifacts.get(9).room_id).toBe(6);
  expect(game.artifacts.get(10).room_id).toBe(11);
  expect(game.effects.get(1).seen).toBeTruthy();

  // inner gate
  game.player.moveToRoom(20);
  expect(game.artifacts.get(22).is_open).toBeFalsy();
  game.player.moveToRoom(14);
  game.player.pickUp(game.artifacts.get(30));
  game.player.wear(game.artifacts.get(30));
  game.player.moveToRoom(20);
  game.tick();
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.artifacts.get(22).is_open).toBeTruthy();

  game.command_parser.run('s');
  // should prop open the gates, if they are still intact
  expect(game.data['inner gate open']).toBeTruthy();
  expect(game.effects.get(3).seen).toBeTruthy();
  expect(game.artifacts.get(22).is_open).toBeTruthy();
  game.player.moveToRoom(20);
  game.command_parser.run('close gate');
  expect(game.artifacts.get(22).is_open).toBeTruthy();

  // cannon
  game.modal.mock_answers = ['Battlefield', 'Power Station', 'Inner Gate'];
  game.player.moveToRoom(18);
  game.monsters.get(27).destroy(); // otherwise they stop you from using the cannon
  game.monsters.get(12).destroy(); // these guys followed player from a different room earlier in the test
  game.command_parser.run('use cannon');
  expect(game.effects.get(5).seen).toBeTruthy();
  game.command_parser.run('use cannon');
  expect(game.effects.get(6).seen).toBeTruthy();
  game.command_parser.run('use cannon');
  expect(game.effects.get(7).seen).toBeTruthy();
  expect(game.artifacts.get(22).room_id).toBeNull();
  expect(game.artifacts.get(23).room_id).toBe(20);
  // broken
  expect(game.effects.get(8).seen).toBeTruthy();
  expect(game.artifacts.get(19).room_id).toBeNull();
  expect(game.artifacts.get(20).room_id).toBe(18);

  // dragon
  game.player.moveToRoom(34);
  game.command_parser.run('free dragon');
  expect(game.monsters.get(19).room_id).toBeNull();
  expect(game.monsters.get(20).children.length).toBe(14);

  // clone room stuff - needs work
  // game.player.moveToRoom(30);
  // game.command_parser.run('attack clonatorium');  // update this because it now requires multiple hits
  // expect(game.effects.get(11).seen).toBeTruthy('effect 11 should be seen');
  // expect(game.artifacts.get(34).room_id).toBeNull();
  // expect(game.artifacts.get(35).room_id).toBe(30);
  // also add the other artifacts that can destroy it

});
