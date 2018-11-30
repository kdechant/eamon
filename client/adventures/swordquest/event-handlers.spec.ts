/**
 * Unit tests for SwordQuest
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
  game.slug = 'swordquest';
  return initLiveGame(game);
});

// TESTS

it("should have working event handlers", () => {
  expect(game.rooms.rooms.length).toBe(95);
  expect(game.artifacts.all.length).toBe(109 + 5); // includes player artifacts
  expect(game.effects.all.length).toBe(23);
  expect(game.monsters.all.length).toBe(53 + 1); // includes player

  // guards
  game.mock_random_numbers = [1];
  game.player.moveToRoom(2);
  game.tick();
  expect(game.effects.get(5).seen).toBeTruthy();
  expect(game.died).toBeTruthy();
  // random player death effect (mocked to always show #16)
  expect(game.effects.get(16).seen).toBeTruthy();

  // reactivate the game after dying
  game.player.damage = 0;
  game.active = true;
  game.died = false;

  // merlin
  game.player.moveToRoom(77);
  game.tick();
  expect(game.effects.get(11).seen).toBeTruthy();
  expect(game.monsters.get(48).room_id).toBe(77);

  // mithra spells
  let dragon = game.monsters.get(44);
  game.player.moveToRoom(69);
  dragon.checkReaction();
  game.command_parser.run('say pax mithrae', false);
  expect(dragon.reaction).toBe(Monster.RX_HOSTILE);
  game.command_parser.run('say vincere in nominis mithrae', false);
  expect(dragon.isHere()).toBeTruthy();
  // again, with the proper artifacts
  game.artifacts.get(4).moveToInventory();
  game.artifacts.get(5).moveToInventory();
  game.artifacts.get(6).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('say pax mithrae', false);
  expect(game.effects.get(3).seen).toBeTruthy();
  expect(dragon.reaction).toBe(Monster.RX_NEUTRAL);
  game.command_parser.run('say vincere in nominis mithrae', false);
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(dragon.isHere()).toBeFalsy();

  // morgan le fay and excalibur
  game.player.moveToRoom(82);
  expect(game.artifacts.get(2).isHere()).toBeTruthy();
  game.monsters.get(38).injure(50);
  expect(game.effects.get(12).seen).toBeTruthy();
  expect(game.artifacts.get(32).isHere()).toBeTruthy();
  expect(game.artifacts.get(2).isHere()).toBeFalsy();

  // exit with excalibur
  let ex = game.artifacts.get(32);
  ex.moveToInventory();
  game.player.updateInventory();
  game.exit();
  expect(game.effects.get(23).seen).toBeTruthy();
  expect(game.player.gold).toBe(5200);

  // reactivate the game after testing exit
  game.active = true;
  game.won = false;

  // ready excalibur
  ex.moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('ready excalibur');
  expect(game.effects.get(13).seen).toBeTruthy();
  expect(game.player.hasArtifact(ex.id)).toBeFalsy();

  // exit without excalibur
  game.exit();
  expect(game.effects.get(14).seen).toBeTruthy();
  expect(game.player.gold).toBe(0);

  // uncomment the following for debugging
  // game.history.history.map(() => console.log(h); });

});
