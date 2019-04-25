/**
 * Unit tests for The Quest for the Holy Grail
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";
import player from "../../main-hall/models/player";

// SETUP

var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'quest-for-the-holy-grail';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS
// TESTS

it("should have working event handlers", () => {
  game.player.name = 'He-Man'; // player needs a name
  game.player.gold = 200; // player needs some gold
  expect(game.artifacts.get(78).monster_id).toBe(Monster.PLAYER);

  // None shall pass…
  game.command_parser.run('n');
  expect(game.player.room_id).toBe(6);
  game.command_parser.run('w');
  game.command_parser.run('flee');
  expect(game.player.room_id).toBe(6);

  // Holy Hand Grenade
  game.player.moveToRoom(2);
  game.tick();
  game.command_parser.run('get grenade');
  game.tick();
  expect(game.player.hasArtifact(1)).toBeTruthy();
  expect(game.effects.get(27).seen).toBeTruthy();

  // The Monks
  game.player.moveToRoom(10);
  game.tick();
  expect(game.effects.get(1).seen).toBeTruthy();

  // ROger
  game.player.moveToRoom(14);
  game.command_parser.run('buy shrubbery');
  game.tick();
  expect(game.player.hasArtifact(3)).toBeTruthy();

  // the Knights Who Say Nee
  game.player.moveToRoom(25);
  game.command_parser.run('give shrubbery to knights');
  game.tick();
  expect(game.player.hasArtifact(3)).toBeFalsy();
  game.command_parser.run('say nee');
  game.tick();
  expect(game.monsters.get(14).isHere()).toBeFalsy();

  // Bridge of Death
  game.player.moveToRoom(64);
  game.tick();
  game.command_parser.run('say He-Man');
  game.tick();
  game.command_parser.run('say grail');
  game.tick();
  game.command_parser.run('say red');
  game.tick();
  game.command_parser.run('n');
  game.tick();
  expect(game.player.room_id).toBe(65);

  // Holy Grail
  game.player.moveToRoom(66);
  game.tick();
  game.in_battle = false; // bypass the knights
  game.command_parser.run('get grail');
});
