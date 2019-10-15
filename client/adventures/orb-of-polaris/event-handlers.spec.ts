/**
 * Unit tests for Orb of Polaris
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
  game.slug = 'orb-of-polaris';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {
  // do some game actions and write assertions here

  // exit should be blocked
  game.command_parser.run('n');
  expect(game.effects.get(5).seen).toBeTruthy();
  expect(game.won).toBeFalsy();

  // the freeze counter (testing this first, so player doesn't die in later steps)
  expect(game.data['freezing']).toBe(2);
  game.player.moveToRoom(37);
  game.command_parser.run('e');
  expect(game.data['freezing']).toBe(3);
  game.command_parser.run("get fur coat");
  game.command_parser.run("wear fur coat");
  expect(game.data['freezing']).toBe(0);

  // testing thawing some things
  game.player.moveToRoom(27);
  game.monsters.get(2).moveToRoom();
  game.tick();
  game.command_parser.run('s');
  expect(game.monsters.get(2).room_id).toBeNull();
  expect(game.artifacts.get(14).room_id).toBe(29);
  expect(game.artifacts.get(15).room_id).toBe(29);
  expect(game.artifacts.get(16).room_id).toBe(29);
  expect(game.artifacts.get(17).room_id).toBe(29);
  expect(game.artifacts.get(18).room_id).toBe(29);

  game.command_parser.run('get water');
  expect(game.artifacts.get(14).room_id).toBe(29);
  game.artifacts.get(21).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('get water');
  expect(game.player.hasArtifact(14)).toBeTruthy();

  game.artifacts.get(3).moveToInventory();
  game.tick();
  expect(game.artifacts.get(3).room_id).toBeNull();
  expect(game.monsters.get(11).isHere()).toBeTruthy();

  game.artifacts.get(5).moveToInventory();
  game.tick();
  expect(game.artifacts.get(5).room_id).toBeNull();
  expect(game.monsters.get(19).isHere()).toBeTruthy();

  // resurrect frosty
  game.player.moveToRoom(27);
  game.artifacts.get(14).moveToRoom();
  game.artifacts.get(15).moveToRoom();
  game.artifacts.get(16).moveToRoom();
  game.artifacts.get(17).moveToRoom();
  game.artifacts.get(18).moveToRoom();
  game.mock_random_numbers = [1];  // power should succeed
  game.command_parser.run('power');
  expect(game.monsters.get(2).room_id).toBe(27);
  expect(game.artifacts.get(14).room_id).toBeNull();
  expect(game.artifacts.get(15).room_id).toBeNull();
  expect(game.artifacts.get(16).room_id).toBeNull();
  expect(game.artifacts.get(17).room_id).toBeNull();
  expect(game.artifacts.get(18).room_id).toBeNull();

  // flamethrower
  game.artifacts.get(12).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('ready flamethrower');
  expect(game.player.weapon_id).not.toBe(12);
  game.artifacts.get(13).moveToInventory();
  game.command_parser.run('read paper');
  game.command_parser.run('ready flamethrower');
  expect(game.player.weapon_id).toBe(12);

  // polaris
  let polaris = game.monsters.get(1);
  let orb = game.artifacts.get(19);
  game.player.moveToRoom(polaris.room_id);
  game.command_parser.run("look");
  game.player.weapon_abilities[2] = 100;
  expect(game.effects.get(9).seen).toBeTruthy();
  expect(polaris.reaction).toBe(Monster.RX_HOSTILE);
  game.mock_random_numbers = [95];  // hit, but not critical
  game.command_parser.run('attack polaris');
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(polaris.reaction).toBe(Monster.RX_NEUTRAL);
  expect(orb.room_id).toBe(game.player.room_id);
  game.command_parser.run("get orb");

  // orb / magic word
  game.command_parser.run("say " + game.data['magic word']);
  expect(orb.room_id).toBeNull();
  expect(game.artifacts.get(20).room_id).toBe(game.player.room_id);
  expect(game.data['shattered orb']).toBeTruthy();

  // orb + warlock
  let warlock = game.monsters.get(22);
  orb.moveToInventory();
  game.artifacts.get(20).destroy();
  game.data['shattered orb'] = false;
  game.player.moveToRoom(2);
  game.command_parser.run("n");
  expect(warlock.room_id).toBe(1);
  expect(game.effects.get(3).seen).toBeTruthy();
  expect(game.effects.get(4).seen).toBeTruthy();
  game.command_parser.run("give orb of polaris to warlock");
  expect(game.effects.get(6).seen).toBeTruthy();
  expect(warlock.isHere()).toBeTruthy();
  game.command_parser.run("say " + game.data['magic word']);
  expect(orb.room_id).toBeNull();
  expect(orb.monster_id).toBeNull();
  expect(game.artifacts.get(20).room_id).toBe(game.player.room_id);
  expect(warlock.isHere()).toBeFalsy();

  // exit
  game.exit_prompt = false;
  game.command_parser.run('n');
  expect(game.won).toBeTruthy();
});
