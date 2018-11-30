/**
 * Unit tests for The Black Castle of Nagog
 */
import Game from "../../core/models/game";
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
  game.slug = 'black-castle-of-nagog';
  return initLiveGame(game);
});

// TESTS

it("should have working event handlers", () => {

  // two-sided secret door
  game.monsters.get(28).destroy(); // get rats out of the way
  game.player.moveToRoom(28);
  game.endTurn();
  game.command_parser.run("look brick wall");
  expect(game.artifacts.get(69).hidden).toBeFalsy();
  expect(game.artifacts.get(70).hidden).toBeFalsy();
  // also test regular open/close
  game.command_parser.run("close brick wall");
  expect(game.artifacts.get(69).is_open).toBeFalsy();
  expect(game.artifacts.get(70).is_open).toBeFalsy();
  game.command_parser.run("open brick wall");
  expect(game.artifacts.get(69).is_open).toBeTruthy();
  expect(game.artifacts.get(70).is_open).toBeTruthy();

  // mummy in tomb
  game.player.moveToRoom(43);
  game.command_parser.run("open tomb");
  expect(game.monsters.get(17).room_id).toBe(43);
  game.monsters.get(17).destroy(); // get mummy out of the way

  // ghoul in coffin
  game.player.moveToRoom(47);
  game.command_parser.run("open coffin");
  expect(game.monsters.get(6).room_id).toBe(47);
  expect(game.artifacts.get(12).room_id).toBeNull();
  expect(game.artifacts.get(12).container_id).toBe(60);
  expect(game.artifacts.get(60).contents.length).toBe(1);
  game.monsters.get(6).destroy(); // get ghoul out of the way

  // pudding in kettle
  game.player.moveToRoom(20);
  game.command_parser.run("look kettle"); // already open; monster should appear when revealed
  expect(game.monsters.get(4).room_id).toBe(20);
  game.monsters.get(4).destroy(); // get pudding out of the way

  // bridge
  game.monsters.get(10).destroy(); // get harpy out of the way
  game.player.moveToRoom(64);
  game.artifacts.get(1).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('say morgar');
  expect(game.data['bridge']).toBeTruthy();

  // rubies
  game.monsters.get(5).destroy(); // get gargoyle out of the way
  game.artifacts.get(14).moveToInventory();
  game.player.moveToRoom(65);
  game.artifacts.get(71).reveal();
  game.command_parser.run("put rubies into sculpture");
  expect(game.artifacts.get(71).is_open).toBeTruthy();

  // fun with demons
  // note: these will fail if monsters were in the room - need to destroy other monsters from tests above
  game.artifacts.get(2).moveToInventory();
  game.player.updateInventory();
  game.player.moveToRoom(28); // vrock won't appear in room 64+; balor won't appear in room 29+
  game.mock_random_numbers = [1];
  game.tick();
  expect(game.data['vrock appeared']).toBeTruthy();
  expect(game.monsters.get(29).isHere()).toBeTruthy();
  game.monsters.get(29).destroy(); // get vrock out of the way
  game.mock_random_numbers = [1];
  game.tick();
  expect(game.data['balor appeared']).toBeTruthy();
  expect(game.monsters.get(30).isHere()).toBeTruthy();

  // uncomment the following for debugging
  // game.history.history.map(() => console.log(h); });

});
