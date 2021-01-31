/**
 * Unit tests for The Cave of the Mind
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
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
  game.slug = 'the-cave-of-the-mind';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("game setup", () => {
  expect(game.rooms.rooms.length).toBe(31);
  expect(game.artifacts.all.length).toBe(51 + 5); // includes player artifacts
  expect(game.effects.all.length).toBe(15);
  expect(game.monsters.all.length).toBe(22); // 14 base monsters + 7 group monster members + player

  expect(game.monsters.get(12).name).toBe("The Mind");
  expect(game.monsters.get(12).combat_verbs.length).toBe(3);
});

test("miner's pick", () => {
  game.player.moveToRoom(5);
  game.artifacts.get(19).reveal();
  game.triggerEvent("use", "", game.artifacts.get(7));
  expect(game.artifacts.get(19).room_id).toBeNull();
  expect(game.artifacts.get(18).room_id).toBe(5);
});

test("inscription", () => {
  game.mock_random_numbers = [1, 2, 3];
  expect(game.player.inventory.length).toBe(5);
  game.triggerEvent("beforeRead", "", game.artifacts.get(17));
  expect(game.player.inventory.length).toBe(2);
  expect(game.artifacts.get(52).room_id).toBe(1);
  expect(game.artifacts.get(53).room_id).toBe(2);
  expect(game.artifacts.get(54).room_id).toBe(3);
});

test("power spell effects", () => {
  game.triggerEvent("power", 20);
  game.queue.run();
  expect(game.history.getLastOutput().text).toBe("You hear a loud sonic boom which echoes all around you!");
  game.mock_random_numbers = [16];
  game.triggerEvent("power", 51);
  game.queue.run();
  expect(game.history.getLastOutput().text).toBe("You are being teleported...");
  expect(game.player.room_id).toBe(16);
});

test("potion", () => {
  const p = game.artifacts.get(16);
  game.triggerEvent("use", "potion", p);
  expect(game.effects.get(10).seen).toBeTruthy();
  expect(game.won).toBeTruthy();
});
