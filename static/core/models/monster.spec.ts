import {Game} from "../models/game";
import {initMockGame} from "../utils/testing";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

describe("Monster", function() {

  // initialize the test with the full repository of artifacts
  beforeEach(() => {
    initMockGame();
  });

  it("should know its carrying capacity", function() {
    let game = Game.getInstance();
    expect(game.monsters.get(1).maxWeight()).toEqual(400);
    expect(game.monsters.get(2).maxWeight()).toEqual(100);
  });

  it("should match synonyms", function() {
    let game = Game.getInstance();
    expect(game.monsters.get(3).match('alfred')).toBeTruthy(); // real name, but lowercase
    expect(game.monsters.get(3).match('al')).toBeTruthy(); // alias
    expect(game.monsters.get(3).match('albert')).toBeFalsy(); // alias

    // a multi-word alias
    expect(game.monsters.get(4).match('bad guy')).toBeTruthy(); // alias

    // monster with no aliases
    let king = game.monsters.get(2);
    expect(king.match('king')).toBeTruthy();
    expect(king.match('grand duke')).toBeFalsy();
  });

  it("should know if it is in the same room as the player", function() {
    let game = Game.getInstance();
    expect(game.player.room_id).toEqual(1, "FAILURE TO SETUP FOR TEST: player should be in room 1 at test start");

    let guard = game.monsters.get(1);
    expect(guard.isHere()).toBeTruthy();

    let king = game.monsters.get(2);
    expect(king.isHere()).toBeFalsy();
    king.moveToRoom(1);
    expect(king.isHere()).toBeTruthy();
    // put things back the way they were so this test doesn't contaminate other tests
    // king.moveToRoom(3);
  });

  it("should decide if it wants to pick up a weapon", function () {
    let m = new Monster();

    // "special" combat code
    m.combat_code = Monster.COMBAT_CODE_SPECIAL;
    m.weapon_id = 0;
    expect(m.wantsToPickUpWeapon()).toBe(false);
    m.weapon_id = null;
    expect(m.wantsToPickUpWeapon()).toBe(true);
    m.weapon_id = 3;
    expect(m.wantsToPickUpWeapon()).toBe(false);
    m.weapon_id = -1;
    expect(m.wantsToPickUpWeapon()).toBe(true);

    // "normal" combat code
    m.combat_code = Monster.COMBAT_CODE_NORMAL;
    m.weapon_id = 0;
    expect(m.wantsToPickUpWeapon()).toBe(false);
    m.weapon_id = null;
    expect(m.wantsToPickUpWeapon()).toBe(true);
    m.weapon_id = 3;
    expect(m.wantsToPickUpWeapon()).toBe(false);
    m.weapon_id = -1;
    expect(m.wantsToPickUpWeapon()).toBe(true);

    // "weapon if available" combat code
    m.combat_code = Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE;
    // if this type is using natural weapons, it will pick up a weapon if available
    m.weapon_id = 0;
    expect(m.wantsToPickUpWeapon()).toBe(true);
    m.weapon_id = null;
    expect(m.wantsToPickUpWeapon()).toBe(true);
    m.weapon_id = 3;
    expect(m.wantsToPickUpWeapon()).toBe(false);
    m.weapon_id = -1;
    expect(m.wantsToPickUpWeapon()).toBe(true);

  });

  it("should know how to pick up and ready a weapon", function () {
    let game = Game.getInstance();
    let m = game.monsters.get(1);
    m.pickUpWeapon(game.artifacts.get(3));
    expect(m.hasArtifact(3)).toBe(true);
    expect(m.weapon_id).toBe(3);
    expect(game.history.getLastOutput().text).toBe("guard picks up magic sword.");
  });

  it("should calculate its attack damage", function () {
    let game = Game.getInstance();
    let m = new Monster();

    // natural weapons - using a silly value of 6 d 1 to make testing easier
    m.weapon_dice = 6;
    m.weapon_sides = 1;
    expect(m.rollAttackDamage()).toBe(6);

    // using a weapon
    let spear = game.artifacts.get(4);
    m.pickUpWeapon(spear);
    m.ready(spear);
    // readying does not change the monster's built-in dice/sides
    expect(m.weapon_dice).toBe(6);
    expect(m.weapon_sides).toBe(1);
    expect(m.rollAttackDamage()).toBeLessThan(6); // spear is 1 d 5

    // drop the weapon and use natural weapons again
    m.drop(spear);
    expect(m.rollAttackDamage()).toBe(6);
  });
});
