/**
 * Unit tests for Malleus Maleficarum
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {
  initLiveGame,
  expectEffectSeen,
  expectEffectNotSeen,
  playerAttackMock,
  runCommand, movePlayer
} from "../../core/utils/testing";
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
  game.slug = 'malleus-maleficarum';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("start and plaza", () => {
  expectEffectSeen(1);
  game.command_parser.run('n');
  game.command_parser.run('talk to soldiers');
  expectEffectSeen(203);
  game.command_parser.run('talk to prisoner');
  expectEffectSeen(11);
  game.command_parser.run('free prisoner');
  expect(game.artifacts.get(2).isHere()).toBeTruthy();
});

test("virrat city", () => {
  game.command_parser.run('talk to maya');
  expect(game.history.getOutput().text).toBe(game.effects.get(1).text);
  game.player.moveToRoom(35); game.tick();
  expectEffectSeen(2);
  game.command_parser.run('talk to maya');
  expect(game.history.getOutput().text).toBe(game.effects.get(2).text);
  game.player.moveToRoom(14); game.tick();
  game.command_parser.run('talk to Talia');
  expectEffectSeen(52);  // talia gives potion to maya
  expect(game.monsters.get(1).hasArtifact(41)).toBeTruthy();
  game.command_parser.run('talk to maya');
  expectEffectSeen(3);
});

test('save old man', () => {
  game.player.moveToRoom(15); game.tick();
  game.command_parser.run('e');
  game.mock_random_numbers = playerAttackMock(true, 12);
  game.command_parser.run('attack thug');
  expectEffectSeen(50);
  expect(game.monsters.get(15).room_id).toBeNull();
  expect(game.monsters.get(15).children.every(m => m.room_id === null)).toBeTruthy();
  expectEffectSeen(12);
  expect(game.monsters.get(14).isHere()).toBeFalsy();
  expect(game.data.old_man_rescued).toBeTruthy();
});

test('buy stuff', () => {
  game.player.moveToRoom(70); game.tick();
  expect(game.history.getLastOutput().text).toBe("Items for sale here: battle axe#, pike");  // demo char has a battle axe, so this one is battle axe#
  const gold = game.player.gold;
  game.modal.mock_answers = ['Yes'];
  game.command_parser.run('buy pike');
  expect(game.player.hasArtifact(33)).toBeTruthy();
  expect(game.player.gold).toBe(gold - game.artifacts.get(33).value);
  game.command_parser.run('buy spaceship');
  expect(game.history.getOutput().text).toBe("No one here has that for sale.");
  game.artifacts.get(15).moveToInventory(12); game.tick();
  game.command_parser.run('buy pamphlet');
  expect(game.history.getOutput().text).toBe("That's not for sale.");
  game.player.gold = 0;
  game.command_parser.run('buy battle axe#');
  expect(game.history.getOutput().text).toMatch(/^That costs/);
  expect(game.player.hasArtifact(32)).toBeFalsy();
});

test("lieto", () => {
  game.player.moveToRoom(66); game.tick();
  game.modal.mock_answers = ['owlfeather'];
  game.command_parser.run('open door');
  expect(game.artifacts.get(16).is_open).toBeTruthy();
  game.command_parser.run('d');
  expectEffectNotSeen(65);  // related to maya's injury
  game.command_parser.run('talk to velatha');
  expectEffectSeen(230);
  expect(game.data.orb_quest).toBeTruthy();
  game.command_parser.run('s');
  game.command_parser.run('talk to zinnah');
  expectEffectSeen(232);
  expect(game.artifacts.get(3).room_id).toBe(9);
});

test("castle", () => {
  game.artifacts.get(3).moveToInventory();
  game.monsters.get(19).reaction = Monster.RX_NEUTRAL;
  game.monsters.get(20).destroy();
  game.monsters.get(21).reaction = Monster.RX_NEUTRAL;
  game.player.moveToRoom(51); game.tick();
  game.command_parser.run('use wand');
  expect(game.monsters.get(19).damage).toBeGreaterThan(0);
  game.command_parser.run('w');
  game.command_parser.run('use wand');
  expect(game.artifacts.get(10).room_id).toBeNull();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(53);
  game.player.moveToRoom(77); game.tick();
  game.command_parser.run('use wand');
  expect(game.monsters.get(21).damage).toBeGreaterThan(0);
  game.monsters.get(21).destroy();
  game.player.moveToRoom(54); game.tick();
  game.command_parser.run('use wand');
  expect(game.artifacts.get(5).isHere()).toBeTruthy();
});

test('swamp thing', () => {
  // Note: to mock non-player fighting, use the following mock numbers:
  // [flee chance, target, hit roll, damage roll]
  // For player attack, you only need:
  // [hit roll, damage roll]
  // If there is an attackDamageAfter e.h., add any numbers for it to the
  // end of the array.

  // prevent maya from attacking (for predictable testing)
  const maya = game.monsters.get(1);
  maya.combat_code = Monster.COMBAT_CODE_NEVER_FIGHT;
  // engulf player
  game.mock_random_numbers = [
    0,  // maya doesn't flee
    0,  // mound doesn't flee
    1,  // target
    10, // hit roll
    2,  // damage
    2   // engulfs = yes
  ];
  game.player.moveToRoom(51); game.tick();
  expect(game.player.data.engulfed).toBe(19);
  // engulf maya
  game.mock_random_numbers = [
    0,  // maya doesn't flee
    0,  // mound doesn't flee
    2,  // target = maya
    10, // hit roll
    2,  // damage
    2   // engulfs = yes
  ];
  game.command_parser.run('look');
  expect(maya.data.engulfed).toBe(19);
  // kill it and be free
  game.mock_random_numbers = [10, 100];
  game.command_parser.run('attack mound');
  expect(game.monsters.get(19).isHere()).toBeFalsy();
  expect(game.player.data.engulfed).toBeFalsy();
  expect(maya.data.engulfed).toBeFalsy();
});

test("weapon confiscation", () => {
  // firebrand (magic wpn) is default weapon for demo char
  game.command_parser.run('ready mace');
  game.player.moveToRoom(3); game.tick();
  expect(game.player.weapon).not.toBeNull();
  game.command_parser.run('ready firebrand');
  expectEffectSeen(13);
  game.command_parser.run('s');
  expectEffectSeen(32);
  expect(game.player.room_id).toBe(3);
  const prev_gold = game.player.gold;
  game.command_parser.run('pay fine');
  expect(game.player.gold).toBe(prev_gold - 100);
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(2);
});

test("go directly to jail", () => {
  game.command_parser.run('n');
  game.command_parser.run('speed');
  expectEffectSeen(27);
  expect(game.data.arrested).toBeTruthy();
  expect(game.player.room_id).toBe(30);
  const inventory = game.player.inventory.map(a => a);
  expect(game.player.inventory.length).toBe(0);
  inventory.forEach(a => expect(a.room_id).toBe(24));
  expect(game.player.gold).toBe(0);
  game.mock_random_numbers = [1, 1];
  game.command_parser.run('power');
  expect(game.rooms.current_room.getVisibleExits().some(x => x.direction === 'u')).toBeTruthy();
  // find maya again
  game.player.moveToRoom(1); game.tick();
  expectEffectSeen(59);
  expect(game.player.gold).toBe(125);
});

test("busted for magic (after jailbreak)", () => {
  game.data.jailbreak = true;
  game.command_parser.run('n');
  game.command_parser.run('speed');
  expectEffectSeen(35);
  // expect(game.data.arrested).toBeFalsy();
  expect(game.player.room_id).toBe(2);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.monsters.get(5).reaction).toBe(Monster.RX_HOSTILE);
});

test("attack soldiers", () => {
  game.command_parser.run('n');
  game.command_parser.run('attack soldier');
  expectEffectSeen(28);
  expect(game.data.arrested).toBeTruthy();
  expect(game.player.room_id).toBe(30);
  // rest of this is the same as the magic/jail routine above
});

test("attack duke", () => {
  game.player.moveToRoom(4); game.tick();
  game.command_parser.run('attack duke');
  expectEffectSeen(34);
  expect(game.data.arrested).toBeTruthy();
  expect(game.player.room_id).toBe(30);
  // rest of this is the same as the magic/jail routine above
});

test("give quest items", () => {
  const wand = game.artifacts.get(3);
  const bag = game.artifacts.get(4);
  const orb = game.artifacts.get(5);
  wand.moveToInventory();
  bag.moveToInventory();
  orb.moveToInventory();
  game.tick();
  game.command_parser.run('give orb to maya');
  expect(orb.monster_id).toBe(Monster.PLAYER);
  game.command_parser.run('give bag to maya');
  expect(bag.monster_id).toBe(Monster.PLAYER);
  game.command_parser.run('give orb to maya');
  expect(wand.monster_id).toBe(Monster.PLAYER);
  // also give stuff to soldiers
  game.command_parser.run('n');
  game.command_parser.run('give bag to soldier');
  expectEffectSeen(39);
  expect(bag.monster_id).toBe(Monster.PLAYER);
});

test("soldiers and orb", () => {
  game.artifacts.get(5).moveToInventory();
  game.command_parser.run('n');
  const soldiers = game.monsters.get(3);
  const inquisitor = game.monsters.get(6);
  expectEffectSeen(15);
  expect(soldiers.reaction).toBe(Monster.RX_HOSTILE);
  game.command_parser.run('give orb to soldier');
  expectEffectSeen(36);
  expect(soldiers.room_id).toBe(inquisitor.room_id);
  expect(soldiers.reaction).toBe(Monster.RX_NEUTRAL);
  expect(inquisitor.hasArtifact(5));
});

test("soldiers and orb (dropped orb)", () => {
  game.artifacts.get(5).moveToRoom(2);
  game.command_parser.run('n');
  expectEffectSeen(37);
  const soldiers = game.monsters.get(3);
  const inquisitor = game.monsters.get(6);
  expect(soldiers.room_id).toBe(inquisitor.room_id);
  expect(soldiers.reaction).toBe(Monster.RX_NEUTRAL);
  expect(inquisitor.hasArtifact(5));
});

test("soldiers and orb (in bag)", () => {
  game.artifacts.get(4).moveToInventory();
  game.artifacts.get(5).moveToInventory();
  game.command_parser.run('put orb into bag');
  game.command_parser.run('n');
  expectEffectNotSeen(15);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_NEUTRAL);
});

test('orb in shielded bag', () => {
  game.artifacts.get(4).moveToInventory();
  game.artifacts.get(5).moveToInventory(); game.tick();
  game.command_parser.run('put orb into bag');
  game.command_parser.run('say irkm desmet daem');
  expectEffectSeen(56);
});

test("orb", () => {
  game.artifacts.get(5).moveToInventory(); game.tick();
  expectEffectSeen(24);
  game.command_parser.run('use orb');
  expectEffectSeen(19);
  game.command_parser.run('say irkm desmet daem');
  expectEffectSeen(20);
  game.player.moveToRoom(52); game.tick();
  game.command_parser.run('say irkm desmet daem');
  expectEffectSeen(51);
  game.player.moveToRoom(39); game.tick();
  game.command_parser.run('say irkm desmet daem');
  expectEffectSeen(21);
  expectEffectSeen(68);
  expect(game.artifacts.get(24).isHere()).toBeFalsy();
  expect(game.artifacts.get(37).isHere()).toBeTruthy();
  expect(game.artifacts.get(23).room_id).toBeNull();
  expect(game.artifacts.get(38).room_id).toBe(22);
  expect(game.data.jailbreak).toBeTruthy();
  game.command_parser.run('s');
  expect(game.player.room_id).toBe(22);
});

test('free prisoners', () => {
  game.monsters.get(39).destroy();  // guards
  game.monsters.get(40).destroy();  // inquisitor in dungeon
  game.player.moveToRoom(25);
  game.artifacts.get(17).moveToInventory();  // keys
  game.tick();
  game.command_parser.run('w');
  expectEffectSeen(23);  // ainha/maya
  game.command_parser.run('e');
  game.command_parser.run('e');
  expectEffectSeen(29);  // generic prisoners
  game.command_parser.run('w');
  game.command_parser.run('s');
  game.command_parser.run('free woman');
  expect(game.artifacts.get(28).isHere()).toBeFalsy();  // bound monster
  expect(game.monsters.get(41).isHere()).toBeFalsy();  // woman runs away
});

test('warden attacks', () => {
  game.player.moveToRoom(22); game.tick();
  game.command_parser.run('open doors');
  game.command_parser.run('s');
  expectEffectSeen(54);
  expect(game.monsters.get(8).reaction).toBe(Monster.RX_HOSTILE);
});

test('magic shielding', () => {
  game.player.moveToRoom(22); game.tick();
  game.command_parser.run('heal');
  expectEffectSeen(55);
});

test('letter', () => {
  game.data.old_man_rescued = true;
  const letter = game.artifacts.get(8);
  letter.moveToInventory();
  game.player.moveToRoom(67); game.tick();
  game.command_parser.run('give letter to velatha');
  expectEffectSeen(40);
  expect(game.data.letter_velatha).toBeTruthy();
  expect(game.monsters.get(30).reaction).toBe(Monster.RX_FRIEND);
  expect(game.monsters.get(31).reaction).toBe(Monster.RX_FRIEND);
  expect(game.monsters.get(31.0001).reaction).toBe(Monster.RX_FRIEND);
  // give to velatha
  game.player.moveToRoom(3);
  game.command_parser.run('n');
  // velatha gives to duke
  expectEffectSeen(41);
  expectEffectSeen(42);
  expect(game.data.letter_duke).toBeTruthy();
  expect(game.monsters.get(4).reaction).toBe(Monster.RX_FRIEND);
  expect(game.monsters.get(5).reaction).toBe(Monster.RX_FRIEND);
  game.command_parser.run('s');
  expectEffectSeen(43);
  expect(game.monsters.get(6).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.monsters.get(7).reaction).toBe(Monster.RX_HOSTILE);
  expect(game.monsters.get(3).reaction).toBe(Monster.RX_HOSTILE);

  // after fight with inquisitors
  game.monsters.all.filter(m => m.isHere() && m.special === 'inquisitor').forEach(m => m.injure(1000));
  runCommand('look');
  expect(game.data.cf_defeated).toBeTruthy();
  expect(game.artifacts.get(5).room_id).toBeNull();
  expectEffectSeen(44);
  expectEffectSeen(45);
  // change everyone's talk message
  expect(game.monsters.get(9).data.talk).toBe(299);

  // old man / standing stones
  expectEffectSeen(46);
  expect(game.monsters.get(14).room_id).toBe(46);
  expect(game.monsters.get(14).reaction).toBe(Monster.RX_NEUTRAL);

  // go to old man at standing stones
  movePlayer(46);
  expectEffectSeen(48);
  expect(game.player.hasArtifact(6));

});

test('maya potion', () => {
  game.artifacts.get(41).moveToInventory(1);
  game.monsters.get(1).damage = 10;
  game.mock_random_numbers = [4];
  game.tick();
  expect(game.monsters.get(1).damage).toBe(6);
  expect(game.history.getLastOutput(3).text).toBe("Maya sips her healing potion.");
});

test('maya resurrection', () => {
  const maya = game.monsters.get(1);
  maya.injure(50);
  expect(maya.status).toBe(Monster.STATUS_DEAD);
  game.tick();
  game.command_parser.run('heal maya');
  expectEffectSeen(61);
  game.command_parser.run('get unconscious maya');
  game.player.moveToRoom(67); game.tick();
  expectEffectSeen(62);
  expectEffectSeen(65);
  expect(maya.status).toBe(Monster.STATUS_ALIVE);
  expect(maya.room_id).toBe(68);
  expect(maya.data.talk).toBe(66);
  expect(maya.reaction).toBe(Monster.RX_NEUTRAL);
});

test('maya resurrection 2', () => {
  const maya = game.monsters.get(1);
  const ainha = game.monsters.get(33);
  ainha.moveToRoom();
  maya.injure(50);
  expect(maya.status).toBe(Monster.STATUS_DEAD);
  game.tick();
  expectEffectSeen(63);
  expect(maya.status).toBe(Monster.STATUS_ALIVE);
  expect(maya.room_id).toBe(68);
  expect(ainha.room_id).toBe(67);
  expect(maya.data.talk).toBe(66);
  expect(maya.reaction).toBe(Monster.RX_NEUTRAL);
  expect(game.data.maya_healed).toBeTruthy();
  game.player.moveToRoom(67); game.tick()
  expectEffectSeen(65);
});

test('maya rejoins', () => {
  const maya = game.monsters.get(1);
  maya.moveToRoom(68);
  maya.reaction = Monster.RX_NEUTRAL;
  // now shortcut to end game
  game.data.letter_duke = true;
  game.monsters.get(6).destroy();
  game.monsters.get(7).destroy();
  game.tick();
  for (let i=0; i<4; i++) {
    game.command_parser.run('s');
  }
  expect(maya.isHere()).toBeTruthy();
  expect(maya.reaction).toBe(Monster.RX_FRIEND);
  expectEffectSeen(67);
});
