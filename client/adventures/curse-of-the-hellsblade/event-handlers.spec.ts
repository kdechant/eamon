/**
 * Unit tests for {base adventure}
 */
import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame, movePlayer, runCommand} from "../../core/utils/testing";
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
  game.slug = 'curse-of-the-hellsblade';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("setup", () => {
  expect(game.rooms.rooms.length).toBe(79);
  expect(game.artifacts.all.length).toBe(71 + 5); // includes player artifacts
  expect(game.effects.all.length).toBe(16);
  expect(game.monsters.all.length).toBe(32); // includes player
});

test("hellsblade", () => {
  // ready weapon
  const hb = game.artifacts.get(25);
  expect(game.player.weapon_id).toBe(25);
  runCommand("ready firebrand");
  expect(game.player.weapon_id).toBe(73);

  runCommand("drop hellsblade");
  expect(hb.monster_id).toBe(0);

  // a regular container item - to make sure the event handlers don't have side effects
  movePlayer(73);
  runCommand("open chest");
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  game.artifacts.get(16).moveToInventory();
  runCommand("put jewels into chest");

  game.artifacts.get(57).moveToInventory();
  game.player.updateInventory();
  runCommand("wear gauntlets");
  expect(game.history.getOutput(0).text).toBe("The Hellsblade whines...");
  runCommand("remove gauntlets");
  expect(game.history.getOutput(1).text).toBe("The Hellsblade twitches eagerly!");
});

test("clam", () => {
  game.artifacts.get(57).moveToInventory();
  game.player.updateInventory();
  movePlayer(53);
  runCommand("open clam");
  runCommand("put gauntlets into clam");  // what a weird idea...
  expect(game.player.hasArtifact(57)).toBeTruthy();
  runCommand("remove pearl from clam");
  expect(game.artifacts.get(17).type).toBe(Artifact.TYPE_TREASURE);
});

test("guardian", () => {
  game.artifacts.get(57).moveToInventory();
  game.player.updateInventory();
  movePlayer(64);
  game.artifacts.get(27).moveToRoom();
  runCommand("light torch");
  runCommand("attack guardian");
  expect(game.history.getOutput().text).toBe("The Guardian pushes you away!");

  runCommand("open box");
  expect(game.history.getOutput().text).toBe("The Guardian pushes you away!");

  runCommand("say elizabeth");
  expect(game.data["guardian protects box"]).toBeFalsy();

  runCommand("open box");
  expect(game.artifacts.get(55).is_open).toBeFalsy();

  game.artifacts.get(58).moveToInventory();
  game.player.updateInventory();
  runCommand("open box");
  expect(game.artifacts.get(55).is_open).toBeTruthy();

  runCommand("remove scabbard from box");
  runCommand("get scabbard");
  runCommand("put gauntlets into scabbard"); // shouldn't work
  expect(game.player.hasArtifact(57)).toBeTruthy();
  runCommand("put hellsblade into scabbard");

  runCommand("put hellsblade into scabbard");
  runCommand("put scabbard into box");
  runCommand("give gold key to guardian");
  expect(game.data['hb safe']).toBeTruthy();
  expect(game.artifacts.get(71).room_id).toBe(64);
});
