/**
 * Unit tests for The Beginner's Cave
 */
import Game from "../../core/models/game";
import {initLiveGame} from "../../core/utils/testing";
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
  game.slug = 'the-beginners-cave';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {
  expect(game.rooms.rooms.length).toBe(26);
  expect(game.artifacts.all.length).toBe(30 + 5); // includes player artifacts
  expect(game.effects.all.length).toBe(12);
  expect(game.monsters.all.length).toBe(12); // 8 base monsters + 3 group members + player

  // ready weapon
  expect(game.player.weapon_id).toBe(33);
  game.command_parser.run("ready firebrand");
  expect(game.player.weapon_id).toBe(32);
  const tr = game.artifacts.get(10)!;
  tr.moveToRoom();
  game.player.pickUp(tr);
  game.command_parser.run("ready trollsfire");
  expect(game.player.weapon_id).toBe(10);
  game.command_parser.run("trollsfire");
  expect(tr.is_lit).toBeTruthy();
  expect(tr.inventory_message).toBe("glowing");
  game.command_parser.run("ready firebrand");
  expect(tr.is_lit).toBeFalsy();
  expect(tr.inventory_message).toBe("");

  // secret door and visible exits logic
  const exits1 = game.rooms.getRoomById(15).getVisibleExits();
  expect(exits1.length).toBe(2);
  expect(exits1[0].room_to).toBe(13);
  expect(exits1[1].room_to).toBe(20);
  game.player.moveToRoom(15);
  game.command_parser.run("OPEN WALL");  // uppercase to test case insensitivity
  expect(game.history.getOutput().text).toBe(game.artifacts.get(14).description);
  expect(game.artifacts.get(14).hidden).toBeFalsy();
  const exits2 = game.rooms.getRoomById(15)!.getVisibleExits();
  expect(exits2.length).toBe(3);
  expect(exits2[0].room_to).toBe(13);
  expect(exits2[1].room_to).toBe(20);
  expect(exits2[2].room_to).toBe(16);
});
