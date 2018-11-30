/**
 * Unit tests for {base adventure}
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
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
  game.slug = 'temple-of-the-trolls';
  return initLiveGame(game);
});

// TESTS

it("should have working event handlers", () => {

  game.player.moveToRoom(5);
  game.command_parser.run('look adventurer');
  expect(game.artifacts.get(32).isHere).toBeTruthy();
  expect(game.artifacts.get(33).isHere).toBeTruthy();
  game.command_parser.run('get all');

  // spells
  let original_ac = game.player.armor_class;
  game.command_parser.run('say qorgaw');
  expect(game.player.spell_counters['qorgaw']).toBeGreaterThan(0);
  expect(game.player.armor_class).toBe(original_ac + 3);
  game.command_parser.run('say trezore');
  expect(game.player.spell_counters['trezore']).toBeGreaterThan(0);

  // other say command uses
  game.command_parser.run('say info');
  expect(game.history.getOutput(1).text).toBe('The magic words the king told you are: ' + game.data['active words']);

  // king
  game.player.moveToRoom(8);
  game.tick();
  expect(game.effects.get(14).seen).toBeTruthy();
  expect(game.data['holfane speaks']).toBe(1);
  game.command_parser.run("give scroll to king");
  expect(game.effects.get(24).seen).toBeTruthy();
  expect(game.effects.get(23).seen).toBeFalsy();
  game.command_parser.run("give token to king");
  expect(game.effects.get(9).seen).toBeTruthy();
  expect(game.data['holfane speaks']).toBe(4);

  // wenda
  let wenda = game.monsters.get(3);
  wenda.reaction = Monster.RX_NEUTRAL;  // she has random friendliness, but needs to be neutral for the test
  game.player.moveToRoom(16);
  game.tick();
  expect(wenda.reaction).toBe(Monster.RX_NEUTRAL);
  game.command_parser.run('kiss wenda');
  expect(wenda.reaction).toBe(Monster.RX_NEUTRAL);
  game.player.gender = 'm';
  game.command_parser.run('kiss wenda');
  expect(wenda.reaction).toBe(Monster.RX_FRIEND);

  // two-sided secret door
  game.command_parser.run('ex rock');
  expect(game.artifacts.get(47).embedded).toBeFalsy();
  expect(game.artifacts.get(48).embedded).toBeFalsy();

  // temple door
  game.command_parser.run('d');
  game.command_parser.run('s');
  expect(game.artifacts.get(46).is_open).toBeFalsy();
  game.command_parser.run('open marble door');
  expect(game.artifacts.get(46).is_open).toBeFalsy();
  game.command_parser.run('say ' + game.data['active words']);
  expect(game.artifacts.get(46).is_open).toBeTruthy();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(25);

  // ulik
  let ulik = game.monsters.get(8);
  game.tick();
  game.player.moveToRoom(53);
  game.artifacts.get(32).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('s');
  expect(game.history.getOutput(0).text).toBe("Ulik won't let you pass!");
  expect(game.player.room_id).toBe(53);
  game.command_parser.run('kiss ulik');
  expect(game.effects.get(15).seen).toBeTruthy();
  expect(ulik.room_id).toBeNull();
  ulik.moveToRoom();
  game.command_parser.run('give ' + game.player.weapon.name + ' to ulik');
  expect(game.effects.get(15).seen).toBeTruthy();
  expect(ulik.room_id).toBeNull();
  ulik.moveToRoom();
  game.command_parser.run('give token to ulik');
  expect(game.effects.get(15).seen).toBeTruthy();
  expect(ulik.room_id).toBeNull();

  // wangba
  game.tick();
  game.player.moveToRoom(58);
  game.artifacts.get(38).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('give jug of Grog to wangba');
  expect(game.monsters.get(6).reaction).toBe(Monster.RX_FRIEND);

  // grommick
  game.tick();
  game.player.moveToRoom(54);
  game.artifacts.get(15).moveToInventory();
  game.artifacts.get(23).moveToInventory();
  game.artifacts.get(24).moveToInventory();
  game.artifacts.get(25).moveToInventory();
  game.player.updateInventory();
  game.command_parser.run('give shield to grommick');
  expect(game.history.getOutput(0).text).toBe('Grommick shrugs and says, "I have no use for that."');
  game.command_parser.run('give sword blank to grommick');
  expect(game.history.getOutput(1).text).toBe('Grommick smiles and says, "I\'ll need a magic power source."');
  game.command_parser.run('give amulet to grommick');
  expect(game.history.getOutput(1).text).toBe('Grommick smiles and says, "I\'ll need a suitable reward."');
  game.command_parser.run('give red diamond to grommick');
  expect(game.effects.get(2).seen).toBeTruthy();
  expect(game.artifacts.get(37).sides).toBe(10);
  expect(game.player.room_id).toBe(63);

  // uncomment the following for debugging
  // game.history.history.map(() => console.log(h); });

});
