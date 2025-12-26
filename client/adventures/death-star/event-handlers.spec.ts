/**
 * Unit tests for The Death Star
 */
import { Artifact } from "../../core/models/artifact";
import Game from "../../core/models/game";
import { Monster } from "../../core/models/monster";
import {
  expectArtifactIsHere,
  expectArtifactIsNotHere,
  expectEffectNotSeen,
  expectEffectSeen,
  expectMonsterIsHere,
  expectMonsterIsNotHere,
  initLiveGame,
  movePlayer,
  playerAttackMock,
  runCommand,
} from "../../core/utils/testing";
import { custom_commands } from "./commands";
import { event_handlers } from "./event-handlers";

// SETUP

const game = new Game();

beforeAll(() => {
  global["game"] = game;
});
afterAll(() => {
  delete global["game"];
});

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = "death-star";
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("blasters", () => {
  const room_blaster = game.artifacts.get(10);
  const inv_blaster = game.artifacts.get(11);
  const ready_blaster = game.artifacts.get(11.001);
  runCommand("d");
  expectMonsterIsHere(8);
  expectArtifactIsNotHere(room_blaster.id);
  expectArtifactIsNotHere(inv_blaster.id);

  game.mock_random_numbers = [6, 12]; // player hit, damage
  runCommand("attack stormtrooper");
  expect(game.rooms.current_room.data.blasters).toBe(1);
  expect(room_blaster.room_id).toBe(2);
  expect(room_blaster.name).toBe("blaster");
  game.mock_random_numbers = [6, 12]; // player hit, damage
  runCommand("attack stormtrooper");
  expect(game.rooms.current_room.data.blasters).toBe(2);
  expect(room_blaster.room_id).toBe(2);
  expect(room_blaster.name).toBe("2 blasters");
  expectMonsterIsNotHere(8);

  runCommand("get blaster");
  expect(game.rooms.current_room.data.blasters).toBe(1);
  expect(game.player.data.blasters).toBe(1);
  expect(room_blaster.name).toBe("blaster");
  expect(game.player.hasArtifact(inv_blaster.id)).toBeTruthy();
  expect(inv_blaster.name).toBe("blaster");
  expect(game.player.hasArtifact(room_blaster.id)).toBeFalsy();

  runCommand("get blaster");
  expect(game.rooms.current_room.data.blasters).toBe(0);
  expect(room_blaster.room_id).toBeNull();
  expect(game.player.data.blasters).toBe(2);
  expect(game.player.hasArtifact(inv_blaster.id)).toBeTruthy();
  expect(inv_blaster.name).toBe("2 blasters");
  expect(game.player.hasArtifact(room_blaster.id)).toBeFalsy();

  runCommand("drop blaster");
  expect(game.rooms.current_room.data.blasters).toBe(1);
  expect(game.player.data.blasters).toBe(1);
  expect(room_blaster.room_id).toBe(2);
  expect(room_blaster.name).toBe("blaster");
  expect(game.player.hasArtifact(inv_blaster.id)).toBeTruthy();
  expect(inv_blaster.name).toBe("blaster");
  expect(game.player.hasArtifact(room_blaster.id)).toBeFalsy();

  runCommand("drop blaster");
  expect(game.rooms.current_room.data.blasters).toBe(2);
  expect(game.player.data.blasters).toBe(0);
  expect(room_blaster.name).toBe("2 blasters");
  expect(game.player.hasArtifact(inv_blaster.id)).toBeFalsy();
  expect(game.player.hasArtifact(room_blaster.id)).toBeFalsy();

  runCommand("get all");
  expect(game.rooms.current_room.data.blasters).toBe(0);
  expect(game.player.data.blasters).toBe(2);
  expect(room_blaster.room_id).toBeNull();
  expect(game.player.hasArtifact(inv_blaster.id)).toBeTruthy();
  expect(inv_blaster.name).toBe("2 blasters");

  runCommand("ready blaster");
  expect(game.rooms.current_room.data.blasters).toBe(0);
  expect(game.player.data.blasters).toBe(1);
  expect(room_blaster.room_id).toBeNull();
  expect(room_blaster.name).toBe("blaster");
  expect(game.player.hasArtifact(inv_blaster.id)).toBeTruthy();
  expect(game.player.hasArtifact(ready_blaster.id)).toBeTruthy();
  expect(inv_blaster.name).toBe("blaster");
  expect(ready_blaster.name).toBe("blaster");
  expect(game.player.hasArtifact(room_blaster.id)).toBeFalsy();
});

test("stormtroopers in detention center", () => {
  movePlayer(74);
  expectArtifactIsNotHere(13);
  runCommand("e");
  runCommand("w");
  expectMonsterIsHere(2);
  expectArtifactIsHere(13);
  expect(game.artifacts.get(12).room_id).toBe(71);

  runCommand("s");
  expectEffectSeen(5);
  expect(game.player.room_id).toBe(74);

  // can still move in other directions
  runCommand("d");
  expect(game.player.room_id).toBe(24);

  // can't go into detention center from tube, either
  movePlayer(71);
  expectArtifactIsHere(12);
  runCommand("n");
  expect(game.player.room_id).toBe(71);
});

test("launch tube 1", () => {
  game.monsters.get(8).destroy();
  movePlayer(15);
  runCommand("e");
  expect(game.died).toBeFalsy();
  runCommand("w");
  expectEffectSeen(6);
  expect(game.player.room_id).toBe(15);
  expect(game.died).toBeFalsy();

  runCommand("e");
  runCommand("look");
  expectEffectSeen(2);
  expect(game.died).toBeTruthy();
});

test("launch tube 2", () => {
  game.monsters.get(8).destroy();
  movePlayer(15);
  runCommand("e");
  expect(game.died).toBeFalsy();
  runCommand("e");
  expect(game.player.room_id).toBe(91);
  expect(game.died).toBeTruthy();
});
