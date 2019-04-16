import Game from "../models/game";
import {initMockGame} from "../utils/testing";
import {Monster} from "../models/monster";

var game = new Game();

describe("Group monster handling", function() {

  // global handling
  beforeAll(() => { global['game'] = game; });
  afterAll(() => { delete global['game']; });

  // initialize the test with the full mock game data
  beforeEach(() => {
    return initMockGame(game);
  });

  it("should unpack members and assign weapons", () => {
    let kobolds = game.monsters.get(5);
    expect(kobolds.children.length).toBe(3);

    expect(kobolds.children[0].id).toBe(5.0001);
    expect(kobolds.children[0].weapon_id).toBe(19);
    expect(kobolds.children[0].getWeapon().id).toBe(19);
    expect(kobolds.children[0].room_id).toBe(7);

    expect(kobolds.children[1].id).toBe(5.0002);
    expect(kobolds.children[1].weapon_id).toBe(20);
    expect(kobolds.children[1].getWeapon().id).toBe(20);
    expect(kobolds.children[1].room_id).toBe(7);

    expect(kobolds.children[2].id).toBe(5.0003);
    expect(kobolds.children[2].weapon_id).toBe(21);
    expect(kobolds.children[2].getWeapon().id).toBe(21);
    expect(kobolds.children[2].room_id).toBe(7);
  });

  it("should move as a group when using moveToRoom", () => {
    let kobolds = game.monsters.get(5);
    kobolds.moveToRoom(2);
    expect(kobolds.room_id).toBe(2);
    for (let c of kobolds.children) {
      expect(c.room_id).toBe(2);
    }
  });

  it("should appear as a group when freed", () => {
    let bound_prisoner = game.artifacts.get(22);
    bound_prisoner.freeBoundMonster();
    let prisoners = game.monsters.get(6);
    expect(prisoners.room_id).toBe(5);
    for (let c of prisoners.children) {
      expect(c.room_id).toBe(5);
    }
  });

  it("should assign damage to a random member", () => {
    game.player.moveToRoom(7);
    let kobolds = game.monsters.get(5);
    game.mock_random_numbers = [1, 3, 2];
    for (let i=1; i<=3; i++) {
      kobolds.injure(i);
    }
    expect(kobolds.children[0].damage).toBe(1);
    expect(kobolds.children[1].damage).toBe(3);
    expect(kobolds.children[2].damage).toBe(2);

    // also test the dead body handling
    kobolds.dead_body_id = 23;
    game.mock_random_numbers = [1];
    kobolds.injure(100);
    expect(kobolds.children[0].status).toBe(Monster.STATUS_DEAD);
    expect(game.artifacts.get(23).room_id).toBe(7);
  });

  it ("should flee to different rooms", () => {
    let kobolds = game.monsters.get(5);
    kobolds.moveToRoom(1);  // this room has multiple exits, so it makes a better test
    game.mock_random_numbers = [2, 2, 1];
    kobolds.flee();
    expect(kobolds.children[0].room_id).toBe(7);
    expect(kobolds.children[1].room_id).toBe(7);
    expect(kobolds.children[2].room_id).toBe(2);
    expect(kobolds.room_id).toBe(7);
  });

  it ("should add and remove members", () => {
    let kobolds = game.monsters.get(5);
    kobolds.spawnChild();
    expect(kobolds.children.length).toBe(4);
    expect(kobolds.count).toBe(4);
    expect(kobolds.children[3].weapon_id).toBe(0);

    kobolds.removeChildren(2);
    expect(kobolds.children.length).toBe(2);
    expect(kobolds.count).toBe(2);
  });

  it ("should move with the player if friendly", () => {
    let prisoners = game.monsters.get(6);
    prisoners.moveToRoom(1);
    game.monsters.updateVisible();
    expect(prisoners.reaction).toBe(Monster.RX_FRIEND);
    expect(prisoners.isHere()).toBe(true);
    game.player.moveToRoom(2);
    game.monsters.updateVisible();
    expect(prisoners.room_id).toBe(2);
    for (let c of prisoners.children) {
      expect(c.room_id).toBe(2);
    }
  });

  it ("should handle reaction checks", () => {
    let prisoners = game.monsters.get(6);
    prisoners.moveToRoom(1);
    game.monsters.updateVisible();
    expect(prisoners.reaction).toBe(Monster.RX_FRIEND);

    // There are 2 checks for friendliness when monster's friendliness is random, so 2 mock random numbers.
    // (see Monster.checkReaction)
    game.mock_random_numbers = [99, 1];  // this will make it neutral
    prisoners.hurtFeelings();
    expect(prisoners.reaction).toBe(Monster.RX_NEUTRAL);
    for (let c of prisoners.children) {
      expect(c.reaction).toBe(Monster.RX_NEUTRAL);
    }

    game.mock_random_numbers = [99, 99];  // this will make it hostile
    prisoners.hurtFeelings();
    expect(prisoners.reaction).toBe(Monster.RX_HOSTILE);
    for (let c of prisoners.children) {
      expect(c.reaction).toBe(Monster.RX_HOSTILE);
    }
  });

  it("should know if it's able to attack (group monster)", function () {
    let kobolds = game.monsters.get(5);

    // one of them should not have a weapon
    kobolds.children[1].drop(game.artifacts.get(20));

    // combat code 1 (attacks if it has a weapon, special attack message)
    kobolds.combat_code = Monster.COMBAT_CODE_SPECIAL;
    kobolds.children.forEach(c => c.combat_code = Monster.COMBAT_CODE_SPECIAL);
    expect(kobolds.children[0].canAttack()).toBe(true);
    expect(kobolds.children[1].canAttack()).toBe(false);  // this one dropped his weapon
    expect(kobolds.children[2].canAttack()).toBe(true);

    // combat code 0 (attacks if it has a weapon, or if it was set to use natural weapons in the database)
    kobolds.combat_code = Monster.COMBAT_CODE_NORMAL;
    kobolds.children.forEach(c => c.combat_code = Monster.COMBAT_CODE_NORMAL);
    expect(kobolds.children[0].canAttack()).toBe(true);
    expect(kobolds.children[1].canAttack()).toBe(false);  // this one dropped his weapon
    expect(kobolds.children[2].canAttack()).toBe(true);

    // combat code -1 (weapon or natural weapons if no weapon is available)
    kobolds.combat_code = Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE;
    kobolds.children.forEach(c => c.combat_code = Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE);
    expect(kobolds.children[0].canAttack()).toBe(true);
    expect(kobolds.children[1].canAttack()).toBe(true);  // this one dropped his weapon. with this combat code, he attacks anyway.
    expect(kobolds.children[2].canAttack()).toBe(true);

    // combat code -2 (never fights)
    kobolds.children.forEach(c => c.combat_code = Monster.COMBAT_CODE_NEVER_FIGHT);
    kobolds.combat_code = Monster.COMBAT_CODE_NEVER_FIGHT;
    expect(kobolds.children[0].canAttack()).toBe(false);
    expect(kobolds.children[1].canAttack()).toBe(false);  // this one dropped his weapon
    expect(kobolds.children[2].canAttack()).toBe(false);

  });

});
