/**
 * Unit tests for Treachery of Zorag
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {
  initLiveGame,
  expectEffectSeen,
  expectEffectNotSeen,
  playerAttackMock,
  movePlayer,
  runCommand, expectMonsterIsHere, playerHit, expectArtifactIsHere, expectMonsterIsNotHere
} from "../../core/utils/testing";
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
  game.slug = 'treachery-of-zorag';
  return initLiveGame(game);
});

// uncomment the following for debugging
afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

// region environment / item management

test("weather", () => {
  game.mock_random_numbers = [2,1,2,2,2,3,2,4];
  game.command_parser.run('e');
  expectEffectSeen(64);
  game.command_parser.run('e');
  expectEffectSeen(65);
  game.command_parser.run('e');
  expectEffectSeen(66);
  game.command_parser.run('look');  // weather only changes when moving
  expectEffectNotSeen(67);
  game.command_parser.run('e');
  expectEffectSeen(67);
  game.mock_random_numbers = [2,1];
  movePlayer(23);
  runCommand('w');
  expectEffectSeen(68);
  game.mock_random_numbers = [2,1];
  movePlayer(162);
  runCommand('e');
  expectEffectSeen(72);
});

test("cold mountain pass", () => {
  game.player.hardiness = 30;
  movePlayer(22);
  expect(game.player.damage).toBe(0);  // not cold here
  movePlayer(41);
  expectEffectSeen(47);
  expect(game.player.damage).toBe(10);  // brr
  runCommand('u');
  expect(game.player.damage).toBe(20);
  game.artifacts.get(9).moveToInventory();
  game.player.wear(game.artifacts.get(9));
  runCommand('d');
  expect(game.player.damage).toBe(20); // no change
});

test("hunger/thirst/fatigue", () => {
  runCommand('open care');
  runCommand('get canteen');
  runCommand('get jerky');
  runCommand('e');
  expect(game.data.hunger).toBe(10);
  expect(game.data.thirst).toBe(10);
  expect(game.data.fatigue).toBe(10);
  runCommand('look');
  expect(game.data.hunger).toBe(10);  // no increase unless moving
  movePlayer(162);
  runCommand('e');
  expect(game.data.hunger).toBe(15);
  runCommand('eat jerky');
  expect(game.data.hunger).toBe(0);
  expect(game.data.thirst).toBe(15);  // no change
  runCommand('drink canteen');
  expect(game.data.thirst).toBe(0);
  expect(game.data.fatigue).toBe(15);  // no change
  game.data.hunger = 150;
  game.data.thirst = 100;
  runCommand('n');
  expect(game.history.getLastOutput(4).text).toBe("You are getting hungry from traveling. You eat some of the Moleman's Jerky.");
  expect(game.history.getLastOutput(2).text).toBe("You are getting thirsty from traveling. You drink from the canteen.");
  expect(game.data.hunger).toBe(0);
  expect(game.data.thirst).toBe(0);

  // fatigue / camp
  game.data.fatigue = 281;
  movePlayer(1);
  runCommand('e');
  expect(game.history.getLastOutput().text).toBe("You are getting tired. You must make camp soon.");
  runCommand('e');
  expect(game.history.getLastOutput().text).toBe("You are exhausted! Your agility is impaired until you rest.");
  expect(game.player.agility).toBe(game.player.stats_original.agility - 1);
  runCommand('e');
  expect(game.history.getLastOutput().text).toBe("You are exhausted! Your agility is impaired until you rest.");
  expect(game.player.agility).toBe(game.player.stats_original.agility - 2);
  runCommand('camp');
  expect(game.data.fatigue).toBe(0);
  // TODO: test output
  expect(game.player.agility).toBe(game.player.stats_original.agility);
});

test("fill water containers", () => {
  let canteen = game.artifacts.get(89);
  let waterskin = game.artifacts.get(5);
  canteen.moveToInventory();
  waterskin.moveToInventory();
  canteen.quantity = 0;
  waterskin.quantity = 0;
  runCommand('fill canteen');
  expect(game.history.getOutput().text).toBe('There is no water source here to fill the canteen from!');
  movePlayer(20);
  runCommand('fill canteen');
  expect(game.history.getOutput().text).toBe('You fill the canteen from the spring.');
  expect(canteen.quantity).toBe(canteen.data.capacity);
  movePlayer(56);
  runCommand('fill waterskin');
  expect(game.history.getOutput().text).toBe('You fill the waterskin from the well.');
  expect(waterskin.quantity).toBe(waterskin.data.capacity);
});

test("fill lantern", () => {
  let lantern = game.artifacts.get(1);
  let fuel = game.artifacts.get(7);
  fuel.quantity = 100;
  lantern.moveToInventory();
  fuel.moveToInventory();
  lantern.quantity = 10;
  runCommand('fill lantern');
  expect(game.history.getOutput().text).toBe('You fill the lantern with the lamp oil.');
  expect(lantern.quantity).toBe(lantern.data.capacity);
  expect(fuel.quantity).toBe(50);
  lantern.quantity = 0;
  runCommand('put lamp oil into lantern');
  expect(game.history.getOutput().text).toBe('You fill the lantern with the lamp oil.');
  expect(game.history.getOutput(1).text).toBe('Your lamp oil is now empty!');
  expect(lantern.quantity).toBe(50); // not quite full; we only had 50 fuel left
  expect(fuel.quantity).toBe(0);
  runCommand('fill lantern');
  expect(game.history.getOutput().text).toBe('There is no more lamp oil left!');
  expect(lantern.quantity).toBe(50);
});

test('buy stuff', () => {
  movePlayer(74);
  let original_gold = game.player.gold;

  // 1: single items
  original_gold = game.player.gold;
  game.modal.mock_answers = ['Yes'];
  runCommand('buy lantern');
  let lantern = game.artifacts.get(1);
  expect(game.player.hasArtifact(lantern.id)).toBeTruthy();
  expect(game.monsters.get(1).hasArtifact(lantern.id)).toBeFalsy();
  expect(game.player.gold).toBe(original_gold - lantern.data.price);
  runCommand('buy lantern');
  expect(game.history.getOutput().text).toContain("outta stock");
  expect(game.player.gold).toBe(original_gold - lantern.data.price);

  // 2: refillable items
  original_gold = game.player.gold;
  game.modal.mock_answers = ['Yes'];
  runCommand('buy lamp oil');
  const oil_primary = game.artifacts.get(7);
  const oil_refill = game.artifacts.get(6);
  expect(game.player.hasArtifact(7)).toBeTruthy();
  expect(game.player.hasArtifact(6)).toBeFalsy();
  expect(game.monsters.get(1).hasArtifact(6)).toBeTruthy();
  expect(oil_primary.quantity).toBe(oil_refill.quantity);
  expect(game.player.gold).toBe(original_gold - oil_refill.data.price);
  game.modal.mock_answers = ['Yes'];
  runCommand('buy lamp oil');
  expect(oil_primary.quantity).toBe(oil_refill.quantity * 2);
  expect(game.player.gold).toBe(original_gold - oil_refill.data.price * 2);

  original_gold = game.player.gold;
  game.modal.mock_answers = ['Yes'];
  runCommand('buy rations');
  const rations_primary = game.artifacts.get(22);
  const rations_refill = game.artifacts.get(4);
  expect(game.player.hasArtifact(rations_primary.id)).toBeTruthy();
  expect(game.player.hasArtifact(rations_refill.id)).toBeFalsy();
  expect(game.monsters.get(1).hasArtifact(rations_refill.id)).toBeTruthy();
  expect(rations_primary.quantity).toBe(rations_refill.quantity);
  expect(game.player.gold).toBe(original_gold - rations_refill.data.price);
  game.modal.mock_answers = ['Yes'];
  runCommand('buy rations');
  expect(rations_primary.quantity).toBe(rations_refill.quantity * 2);
  expect(game.player.gold).toBe(original_gold - rations_refill.data.price * 2);
});

test('booze / bar', () => {
  movePlayer(76);
  game.modal.mock_answers = ['Yes'];
  runCommand('buy beer');
  expectArtifactIsHere(65);
  runCommand('s');
  expect(game.artifacts.get(65).room_id).toBeNull();
  expect(game.artifacts.get(65).monster_id).toBe(40);
  movePlayer(77);
  game.modal.mock_answers = ['Yes'];
  runCommand('buy witch spit');
  expectArtifactIsHere(68);
  runCommand('get witch spit');
  runCommand('w');
  expect(game.artifacts.get(68).room_id).toBeNull();
  expect(game.artifacts.get(68).monster_id).toBe(39);
});

// endregion

// region quest start

test("die if didn't accept quest", () => {
  movePlayer(18);
  game.command_parser.run('w');
  expectEffectSeen(33);
  expect(game.died).toBeTruthy();
});

test("don't die if did accept quest", () => {
  movePlayer(58);
  game.command_parser.run('n');
  expect(game.data.got_quest).toBeTruthy();
  game.command_parser.run('s');
  movePlayer(18);
  game.command_parser.run('w');
  expectEffectNotSeen(33);
  expect(game.died).toBeFalsy();
});

test('raulos / quest', () => {
  movePlayer(58);
  runCommand('n');
  expectEffectSeen(10);
  expect(game.data.got_quest).toBeTruthy();
  runCommand('s');
  runCommand('n');
  expectEffectSeen(87);
});

// endregion

// region npcs

test('npc healing', () => {
  let tealand = game.monsters.get(7);
  let zorag = game.monsters.get(34);
  tealand.moveToRoom();
  zorag.moveToRoom()
  tealand.damage = 25;
  zorag.damage = 75;
  game.mock_random_numbers = [20];
  game.tick();
  expect(tealand.damage).toBe(5);
  expect(zorag.damage).toBe(0);
  expectEffectSeen(101);
  expect(game.history.getLastOutput(4).text).toBe("Tealand takes a sip of his green healing potion.");
  expect(game.history.getLastOutput(1).text).toBe(game.effects.get(101).text);
});

test('attack friendly npcs', () => {
  const npcs = [7,11,12,13,34].map(id => game.monsters.get(id));
  const msg = "It is not wise to attack a member of your Fellowship!";
  npcs.forEach(m => {
      m.moveToRoom();
      m.reaction = Monster.RX_FRIEND;
      runCommand(`attack ${m.name}`);
      expect(game.history.getOutput().text).toBe(msg);
      expect(m.reaction).toBe(Monster.RX_FRIEND);
    });
});

// endregion

// region general plot points

test('boris', () => {
  let boris = game.monsters.get(4);
  movePlayer(76);
  expect(boris.isHere()).toBeTruthy();
  expect(boris.reaction).toBe(Monster.RX_NEUTRAL);
  runCommand('say hello to boris');
  expectEffectSeen(20);
  expect(boris.data.talk[0].said).toBeTruthy();
  game.modal.mock_answers = ['No'];
  runCommand('talk to boris about treasure');
  expectEffectSeen(14);
  expect(boris.reaction).toBe(Monster.RX_NEUTRAL);
  expectEffectNotSeen(17);
  game.modal.mock_answers = ['Yes'];
  runCommand('talk to boris about treasure');
  expect(boris.reaction).toBe(Monster.RX_FRIEND);
  expectEffectSeen(17);
  runCommand('s');
  expectEffectSeen(22);
  runCommand('e');
  expectEffectSeen(23);
  // opens door
  getLamp();
  movePlayer(48);
  expectEffectSeen(26);
  expect(game.artifacts.get(13).is_open).toBeTruthy();
  // chimera
  runCommand('s');
  runCommand('s');
  playerHit('chimera', 999);
  expectEffectSeen(27);
  expectMonsterIsNotHere(4);
});

test('evil tree', () => {
  game.artifacts.get(14).moveToInventory();  // wand
  // test wand without spirit
  movePlayer(74);
  game.modal.mock_answers = ['sasquatch'];
  runCommand('use wand');
  expect(game.history.getOutput().text).toBe('Nobody here by that name!');
  expectEffectNotSeen(31);
  expectEffectNotSeen(32);
  game.modal.mock_answers = ['shopkeep'];
  runCommand('use wand');
  expectEffectSeen(32);
  expectMonsterIsHere(1);
  // try to fight the spirit
  movePlayer(30);
  let spirit = game.monsters.get(6);
  spirit.weapon_sides = 0;  // make it do no damage
  playerHit(spirit, 10);
  expect(spirit.damage).toBe(0);
  expectEffectSeen(29);
  game.mock_random_numbers = [1];  // spell always works
  game.command_parser.run('blast tree spirit');
  expectEffectSeen(30);
  expect(spirit.damage).toBe(0);
  runCommand('flee e');
  expect(game.player.room_id).toBe(30);  // didn't move
  expect(game.history.getOutput().text).toBe('The tree spirit blocks your way!');
  runCommand('flee w');
  expect(game.player.room_id).toBe(29);  // did move
  runCommand('e');
  // use wand the right way
  game.modal.mock_answers = ['spirit'];
  runCommand('use wand');
  expectEffectSeen(31);
  expectMonsterIsNotHere(spirit.id);
  runCommand('e');
  expect(game.player.room_id).toBe(31);  // no longer blocked
});

test('tealand', () => {
  game.artifacts.get(9).moveToInventory();
  runCommand('wear coat');
  let tealand = game.monsters.get(7);
  movePlayer(32);
  runCommand('say thor');
  expectEffectNotSeen(44);
  expectMonsterIsNotHere(7);
  runCommand('say tealand');
  expectEffectSeen(44);
  expectMonsterIsHere(7);
  runCommand('w');
  expectEffectSeen(45);
  movePlayer(42);
  expect(game.artifacts.get(20).is_open).toBeFalsy();
  runCommand('u');
  expect(game.artifacts.get(20).is_open).toBeTruthy();
  expectEffectSeen(49);
});

test("vampire / search bodies", () => {
  getLamp();
  // vampire
  movePlayer(123);
  runCommand('open coffin');
  expectMonsterIsHere(8);
  expectEffectSeen(62);
  playerHit(game.monsters.get(8), 999);
  expectArtifactIsHere(108);
  runCommand('ex vampire');
  expectArtifactIsHere(21);
  expectEffectSeen(51);
  // prisoner
  movePlayer(281);
  runCommand('ex prisoner');
  expectEffectSeen(109);
  expectArtifactIsHere(48);
});

test('lost in swamp', () => {
  game.monsters.get(21).destroy();  // snake in rm 180
  game.mock_random_numbers = [1, 2];
  movePlayer(181);
  runCommand('n');
  expectEffectSeen(136);
  expect(game.player.room_id).toBe(161);
  game.effects.get(136).seen = false;
  movePlayer(171);
  runCommand('n');
  expectEffectSeen(136);
  expect(game.player.room_id).toBe(162);

  // now with compass
  game.effects.get(136).seen = false;
  game.artifacts.get(21).moveToInventory();
  movePlayer(181);
  runCommand('n');
  expectEffectSeen(137);
  expect(game.player.room_id).toBe(180);
  game.effects.get(137).seen = false;
  movePlayer(171);
  runCommand('n');
  expectEffectSeen(137);
  expect(game.player.room_id).toBe(172);
});

// endregion

// region endgame

test('raulos / zorag dead', () => {
  game.monsters.get(34).status = Monster.STATUS_DEAD;
  movePlayer(58);
  runCommand('n');
  expectEffectSeen(89);
  expect(game.died).toBeTruthy();
});

test('raulos / zorag battle', () => {
  movePlayer(58);
  game.monsters.get(34).moveToRoom();
  game.monsters.get(34).reaction = Monster.RX_FRIEND;
  game.tick();
  runCommand('n');
  expectEffectSeen(92);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.data.raulos_zorag).toBeTruthy();
  // golems
  expectMonsterIsHere(35);
  expectMonsterIsHere(36);
  expectMonsterIsHere(37);
  // TODO: more battle stuff
});

// endregion

function getLamp() {
  game.artifacts.get(1).moveToInventory();
  game.artifacts.get(1).quantity = 99999;
  runCommand('light lantern');
}
