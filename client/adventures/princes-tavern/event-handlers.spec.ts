/**
 * Unit tests for The Prince's Tavern
 */
import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {initLiveGame} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";
import {drunk_messages} from "./event-handlers";

// SETUP

var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'princes-tavern';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("general event handlers", () => {
  expect(game.rooms.rooms.length).toBe(63);
  expect(game.artifacts.all.length).toBe(72 + 5); // includes player artifacts
  expect(game.effects.all.length).toBe(44);
  expect(game.monsters.all.length).toBe(33); // includes player

  // eat peanuts
  game.player.moveToRoom(23);
  game.command_parser.run("eat peanuts");
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.player.room_id).toBe(36);

  // spell of protection
  game.player.moveToRoom(42);
  game.monsters.get(31).room_id = 42;
  game.triggerEvent("endTurn2");
  expect(game.effects.get(3).seen).toBeTruthy();

  // brawl
  game.player.moveToRoom(game.monsters.get(25).room_id);
  game.triggerEvent('seeRoom');
  expect(game.effects.get(11).seen).toBeTruthy();
  game.triggerEvent('power', 99);
  expect(game.monsters.get(25).room_id).toBeNull();
  expect(game.artifacts.get(13).isHere()).toBeTruthy();
  expect(game.effects.get(12).seen).toBeTruthy();

  // mad piano player
  game.player.moveToRoom(game.monsters.get(6).room_id);
  game.command_parser.run("say gronk");
  expect(game.effects.get(43).seen).toBeTruthy();
  game.artifacts.get(8).moveToInventory();
  game.player.updateInventory();
  // game.monsters.updateVisible();
  expect(game.monsters.get(6).isHere()).toBeTruthy();
  expect(game.player.hasArtifact(8)).toBeTruthy();
  game.command_parser.run("give lamp to mad piano player");
  expect(game.effects.get(37).seen).toBeTruthy();

  // prince
  game.player.moveToRoom(game.monsters.get(12).room_id);
  game.artifacts.get(22).monster_id = Monster.PLAYER;
  game.player.updateInventory();
  expect(game.player.hasArtifact(22)).toBeTruthy();
  game.command_parser.run("give slipper to prince");
  game.artifacts.updateVisible();
  expect(game.effects.get(38).seen).toBeTruthy();
  expect(game.artifacts.get(28).isHere()).toBeTruthy();

  // hokas tokas
  game.player.moveToRoom(game.monsters.get(32).room_id);
  expect(game.data['locate active']).toBeFalsy();
  game.artifacts.get(13).monster_id = Monster.PLAYER;
  game.player.updateInventory();
  expect(game.player.hasArtifact(13)).toBeTruthy();
  game.command_parser.run("give silver amulet to hokas tokas");
  expect(game.effects.get(13).seen).toBeTruthy();
  expect(game.effects.get(14).seen).toBeTruthy();
  expect(game.data['locate active']).toBeTruthy();

  // pink elephant
  game.player.moveToRoom(33);
  game.command_parser.run('drink rum');
  expect(game.effects.get(27).seen).toBeTruthy();
  expect(game.monsters.get(11).room_id).toBe(33);

});

test("gerschter bar", () => {

  game.player.moveToRoom(7);
  game.command_parser.run('speed');
  expect(game.effects.get(10).seen).toBeTruthy();
  game.monsters.get(8).moveToRoom();
  // game.monsters.updateVisible();
  game.command_parser.run('attack ogre');
  expect(game.effects.get(9).seen).toBeTruthy();
  expect(game.player.room_id).toBe(63);
  expect(game.monsters.get(8).room_id).toBe(63);

});

test("blood alcohol content", () => {

  game.data['drinks'] = 18; // mock player has HD of 50
  game.data['sober counter'] = 100;
  game.triggerEvent('endTurn');
  expect(game.history.getLastOutput().text).toBe(drunk_messages[0].text);
  game.data['drinks'] = 21;
  game.triggerEvent('endTurn');
  expect(game.history.getLastOutput().text).toBe(drunk_messages[1].text);
  game.data['drinks'] = 25;
  game.triggerEvent('endTurn');
  expect(game.history.getLastOutput().text).toBe(drunk_messages[2].text);
  game.data['drinks'] = 29;
  game.triggerEvent('endTurn');
  expect(game.history.getLastOutput().text).toBe(drunk_messages[3].text);
  game.data['drinks'] = 33;
  game.triggerEvent('endTurn');
  expect(game.history.getLastOutput().text).toBe(drunk_messages[4].text);

});

test("more event handlers", () => {

  // sealed door
  game.player.moveToRoom(52);
  game.command_parser.run("open door", false);
  expect(game.artifacts.get(72).is_open).toBeFalsy();
  game.command_parser.run("say evantke", false);
  expect(game.artifacts.get(72).is_open).toBeTruthy();

  // candle
  game.artifacts.get(1).moveToRoom();
  game.artifacts.get(15).moveToRoom();
  game.mock_random_numbers = [44];
  game.command_parser.run("light candle");
  expect(game.player.room_id).toBe(44);

  // barrel
  game.player.moveToRoom(9);
  game.command_parser.run("drink wine", false);
  expect(game.effects.get(19).seen).toBeTruthy();
  expect(game.player.room_id).toBe(12);
  game.artifacts.updateVisible();
  game.command_parser.run("get loose boards", false);
  expect(game.player.room_id).toBe(16);

  // stable
  game.player.moveToRoom(10);
  game.command_parser.run('s');
  expect(game.effects.get(5).seen).toBeTruthy();
  expect(game.effects.get(6).seen).toBeTruthy();
  expect(game.died).toBeTruthy();

});

test("strange brew", () => {
  // distillery/strange brew
  game.player.moveToRoom(51);
  game.monsters.get(17).moveToRoom(50);  // get fire worm out of the way
  game.mock_random_numbers = [1, 2, 3, 4, 5];
  let original_ag = game.player.agility;
  let original_ch = game.player.charisma;
  let original_sword = game.player.weapon_abilities[5];
  let original_ae = game.player.armor_expertise;

  game.command_parser.run("drink strange brew");
  expect(game.effects.get(28).seen).toBeTruthy();
  expect(game.player.charisma).toBe(original_ch - 3);

  game.command_parser.run("drink strange brew");
  expect(game.effects.get(29).seen).toBeTruthy();
  expect(game.player.charisma).toBe(original_ch);  // -3 above, +3 here

  game.command_parser.run("drink strange brew");
  expect(game.effects.get(30).seen).toBeTruthy();
  expect(game.player.agility).toBe(original_ag - 3);

  game.command_parser.run("drink strange brew");
  expect(game.effects.get(31).seen).toBeTruthy();
  expect(game.player.weapon_abilities[5]).toBe(original_sword + 7);

  game.command_parser.run("drink strange brew");
  expect(game.effects.get(32).seen).toBeTruthy();
  expect(game.player.armor_expertise).toBe(original_ae + 10);

});

test("exit logic", () => {

  game.player.moveToRoom(2);
  game.artifacts.get(28).monster_id = Monster.PLAYER;
  game.player.updateInventory();
  game.command_parser.run('s');
  expect(game.effects.get(39).seen).toBeTruthy();
  expect(game.won).toBeFalsy();

  // again, with the bottle
  game.artifacts.get(25).monster_id = Monster.PLAYER;
  game.artifacts.get(25).room_id = null;
  game.player.updateInventory();
  game.exit_prompt = false;
  game.command_parser.run('s');
  expect(game.effects.get(41).seen).toBeTruthy();
  expect(game.won).toBeTruthy();

});
