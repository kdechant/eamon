/**
 * Unit tests for {base adventure}
 */
import Game from "../../core/models/game";
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
  game.slug = 'curse-of-the-hellsblade';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {
  expect(game.rooms.rooms.length).toBe(79);
  expect(game.artifacts.all.length).toBe(71 + 5); // includes player artifacts
  expect(game.effects.all.length).toBe(16);
  expect(game.monsters.all.length).toBe(32); // includes player

  // ready weapon
  let hb = game.artifacts.get(25);
  expect(game.player.weapon_id).toBe(25);
  game.command_parser.run("ready firebrand");
  expect(game.player.weapon_id).toBe(73);

  game.command_parser.run("drop hellsblade");
  expect(hb.monster_id).toBe(0);

  // a regular container item - to make sure the event handlers don't have side effects
  game.player.moveToRoom(73);
  game.command_parser.run("open chest");
  expect(game.artifacts.get(7).is_open).toBeTruthy();
  game.artifacts.get(16).moveToInventory();
  game.command_parser.run("put jewels into chest");

  game.artifacts.get(57).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run("wear gauntlets", false);
  expect(game.history.getLastOutput(2).text).toBe("The Hellsblade whines...");
  game.command_parser.run("remove gauntlets", false);
  expect(game.history.getLastOutput().text).toBe("The Hellsblade twitches eagerly!");

  game.player.moveToRoom(53);
  game.command_parser.run("open clam");
  game.command_parser.run("put gauntlets into clam");  // what a weird idea...
  expect(game.player.hasArtifact(57)).toBeTruthy();
  game.command_parser.run("remove pearl from clam");
  expect(game.artifacts.get(17).type).toBe(Artifact.TYPE_TREASURE);

  game.player.moveToRoom(64);
  game.artifacts.get(27).moveToRoom();
  game.command_parser.run("light torch");
  game.command_parser.run("attack guardian", false);
  expect(game.history.getLastOutput().text).toBe("The Guardian pushes you away!");

  game.command_parser.run("open box", false);
  expect(game.history.getLastOutput().text).toBe("The Guardian pushes you away!");

  game.command_parser.run("say elizabeth");
  expect(game.data["guardian protects box"]).toBeFalsy();

  game.command_parser.run("open box", false);
  expect(game.artifacts.get(55).is_open).toBeFalsy();

  game.artifacts.get(58).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run("open box");
  expect(game.artifacts.get(55).is_open).toBeTruthy();

  game.command_parser.run("remove scabbard from box");
  game.command_parser.run("get scabbard");
  game.command_parser.run("put gauntlets into scabbard"); // shouldn't work
  expect(game.player.hasArtifact(57)).toBeTruthy();
  game.command_parser.run("put hellsblade into scabbard");

  game.command_parser.run("put hellsblade into scabbard");
  game.command_parser.run("put scabbard into box");
  game.command_parser.run("give gold key to guardian");
  expect(game.data['hb safe']).toBeTruthy();
  expect(game.artifacts.get(71).room_id).toBe(64);

});
