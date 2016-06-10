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

  it("should match synonyms and partial names", function() {
    let game = Game.getInstance();
    expect(game.monsters.get(3).match('alfred')).toBeTruthy(); // real name, but lowercase
    expect(game.monsters.get(3).match('al')).toBeTruthy(); // partial match
    expect(game.monsters.get(3).match('fred')).toBeTruthy(); // partial match
    expect(game.monsters.get(3).match('freddy')).toBeTruthy(); // alias
    expect(game.monsters.get(3).match('albert')).toBeFalsy(); // alias

    // a multi-word alias
    expect(game.monsters.get(4).match('bandit')).toBeTruthy(); // alias
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

  it("should know how to ready its best weapon", function () {
    let game = Game.getInstance();
    let m = game.monsters.get(1);
    m.weapon = null;
    m.weapon_id = null;
    m.readyBestWeapon();
    expect(m.weapon_id).toBe(4);
    expect(m.weapon.name).toBe('spear');
    game.artifacts.get(4).monster_id = null;  // no longer carrying spear
    m.updateInventory();
    expect(m.weapon_id).toBe(null);
    expect(m.weapon).toBe(null);
    m.readyBestWeapon();
    expect(m.weapon_id).toBe(null);
    expect(m.weapon).toBe(null);
  });


  it("should get its current weapon (single monster)", function () {
    let game = Game.getInstance();
    let guard = game.monsters.get(1);
    let w = guard.getWeapon();
    expect(w.id).toBe(4);

    game.artifacts.get(4).monster_id = null;  // no longer carrying spear
    guard.updateInventory();
    w = game.monsters.get(1).getWeapon();
    expect(w).toBeNull();
    guard.readyBestWeapon();
    expect(w).toBeNull();

    // give him the spear back, and also the halberd
    guard.pickUpWeapon(game.artifacts.get(4));
    guard.pickUpWeapon(game.artifacts.get(16));
    guard.updateInventory();
    guard.readyBestWeapon();
    w = guard.getWeapon();
    expect(w.id).toBe(16);
  });

  it("should get its current weapon (group monster)", function () {
    let game = Game.getInstance();
    let kobolds = game.monsters.get(5);
    kobolds.group_monster_index = 0;
    let w = kobolds.getWeapon();
    expect(w.id).toBe(21);  // these go in descending order
    kobolds.group_monster_index = 1;
    w = kobolds.getWeapon();
    expect(w.id).toBe(20);
    kobolds.group_monster_index = 2;
    w = kobolds.getWeapon();
    expect(w.id).toBe(19);

    // if one of the group drops a weapon
    kobolds.drop(game.artifacts.get(20));
    kobolds.group_monster_index = 0;
    w = kobolds.getWeapon();
    expect(w.id).toBe(21);
    kobolds.group_monster_index = 1;
    w = kobolds.getWeapon();
    expect(w).toBeNull();
    kobolds.group_monster_index = 2;
    w = kobolds.getWeapon();
    expect(w.id).toBe(19);

    // if one of the group dies
    kobolds.injure(100);
    expect(kobolds.count).toBe(2);
    expect(game.artifacts.get(21).room_id).toBe(kobolds.room_id); // should drop this weapon when one dies
    kobolds.group_monster_index = 0;
    w = kobolds.getWeapon();
    expect(w).toBeNull();
    kobolds.group_monster_index = 1;
    w = kobolds.getWeapon();
    expect(w.id).toBe(19);

  });


  it("should know if it's able to attack (single monster)", function () {
    let game = Game.getInstance();
    let guard = game.monsters.get(1);
    let spear = game.artifacts.get(4);
    expect(guard.weapon_id).toBe(4, "monster data is dirty - test fails");
    expect(game.artifacts.get(4).monster_id).toBe(1, "artifact data is dirty - test fails");

    // combat code 1 (attacks if it has a weapon, special attack message)
    guard.combat_code = Monster.COMBAT_CODE_SPECIAL;
    guard.pickUpWeapon(spear);
    guard.ready(spear);
    expect(guard.canAttack()).toBe(true);
    guard.weapon_id = 0;  // specifically has natural weapons
    expect(guard.canAttack()).toBe(true);
    guard.weapon_id = null;
    expect(guard.canAttack()).toBe(false);

    // combat code 0 (attacks if it has a weapon, or if it was set to use natural weapons in the database)
    guard.combat_code = Monster.COMBAT_CODE_NORMAL;
    guard.pickUpWeapon(spear);
    guard.ready(spear);
    expect(guard.canAttack()).toBe(true);
    guard.weapon_id = 0;  // specifically has natural weapons
    expect(guard.canAttack()).toBe(true);
    guard.weapon_id = null;
    expect(guard.canAttack()).toBe(false);

    // combat code -1 (weapon or natural weapons if no weapon is available)
    guard.combat_code = Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE;
    guard.pickUpWeapon(spear);
    guard.ready(spear);
    expect(guard.canAttack()).toBe(true);
    guard.weapon_id = 0;  // specifically has natural weapons
    expect(guard.canAttack()).toBe(true);
    guard.weapon_id = null;
    expect(guard.canAttack()).toBe(true);

    // combat code -2 (never fights)
    guard.combat_code = Monster.COMBAT_CODE_NEVER_FIGHT;
    guard.pickUpWeapon(spear);
    guard.ready(spear);
    expect(guard.canAttack()).toBe(false);
    guard.weapon_id = 0;
    expect(guard.canAttack()).toBe(false);
    guard.weapon_id = null;
    expect(guard.canAttack()).toBe(false);

  });

  it("should know if it's able to attack (group monster)", function () {
    let game = Game.getInstance();
    let kobolds = game.monsters.get(5);
    expect(kobolds.weapon_id).toBe(19, "FAIL: monster data is dirty");
    expect(kobolds.hasArtifact(19)).toBeTruthy("FAIL: artifact data is dirty");
    expect(kobolds.hasArtifact(20)).toBeTruthy("FAIL: artifact data is dirty");
    expect(kobolds.hasArtifact(21)).toBeTruthy("FAIL: artifact data is dirty");

    // one of them should not have a weapon
    kobolds.drop(game.artifacts.get(20));

    // combat code 1 (attacks if it has a weapon, special attack message)
    kobolds.combat_code = Monster.COMBAT_CODE_SPECIAL;
    kobolds.group_monster_index = 0;
    expect(kobolds.canAttack()).toBe(true);
    kobolds.group_monster_index = 1;
    expect(kobolds.canAttack()).toBe(false);  // this one dropped his weapon
    kobolds.group_monster_index = 2;
    expect(kobolds.canAttack()).toBe(true);

    // combat code 0 (attacks if it has a weapon, or if it was set to use natural weapons in the database)
    kobolds.combat_code = Monster.COMBAT_CODE_NORMAL;
    kobolds.group_monster_index = 0;
    expect(kobolds.canAttack()).toBe(true);
    kobolds.group_monster_index = 1;
    expect(kobolds.canAttack()).toBe(false);  // this one dropped his weapon
    kobolds.group_monster_index = 2;
    expect(kobolds.canAttack()).toBe(true);

    // combat code -1 (weapon or natural weapons if no weapon is available)
    kobolds.combat_code = Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE;
    kobolds.group_monster_index = 0;
    expect(kobolds.canAttack()).toBe(true);
    kobolds.group_monster_index = 1;
    expect(kobolds.canAttack()).toBe(true);  // this one dropped his weapon. with this combat code, he attacks anyway.
    kobolds.group_monster_index = 2;
    expect(kobolds.canAttack()).toBe(true);

    // combat code -2 (never fights)
    kobolds.combat_code = Monster.COMBAT_CODE_NEVER_FIGHT;
    kobolds.group_monster_index = 0;
    expect(kobolds.canAttack()).toBe(false);
    kobolds.group_monster_index = 1;
    expect(kobolds.canAttack()).toBe(false);  // this one dropped his weapon
    kobolds.group_monster_index = 2;
    expect(kobolds.canAttack()).toBe(false);

  });

  //
  // it("should calculate its attack damage", function () {
  //   let game = Game.getInstance();
  //   let m = new Monster();
  //
  //   // natural weapons - using a silly value of 6 d 1 to make testing easier
  //   m.weapon_dice = 6;
  //   m.weapon_sides = 1;
  //   expect(m.rollAttackDamage()).toBe(6);
  //
  //   // using a weapon
  //   let spear = game.artifacts.get(4);
  //   m.pickUpWeapon(spear);
  //   m.ready(spear);
  //   // readying does not change the monster's built-in dice/sides
  //   expect(m.weapon_dice).toBe(6);
  //   expect(m.weapon_sides).toBe(1);
  //   expect(m.rollAttackDamage()).toBeLessThan(6); // spear is 1 d 5
  //
  //   // drop the weapon and use natural weapons again
  //   m.drop(spear);
  //   expect(m.rollAttackDamage()).toBe(6);
  //
  //   // test group monsters
  //   // these use weapons in a set, beginning with the weapon id in the database and continuing
  //   // to increment by 1 for each monster, but in reverse order.
  //   // e.g., if the weapon_id is 19 and group size is 2, the first monster gets #20 and the second gets #19.
  //   // This is done so the weapons are handled correctly as group members die
  //   let kobolds = game.monsters.get(5);
  //   kobolds.group_monster_index = 0;
  //   expect(kobolds.getWeapon().id).toBe(21);  // the first group member should be using wpn #21
  //   kobolds.group_monster_index = 1;
  //   expect(kobolds.getWeapon().id).toBe(20);  // the second group member should be using wpn #20
  //   kobolds.group_monster_index = 1;
  //   expect(kobolds.getWeapon().id).toBe(20);  // the second group member should be using wpn #20
  //
  //   // test what happens when one of them dies
  //   kobolds.injure(100);
  //   expect(kobolds.count).toBe(2);
  //   expect(kobolds.rollAttackDamage()).toBe(2);  // the only remaining group member should be using wpn #20
  //   // test what happens when one of them dies
  //   kobolds.injure(100);
  //   expect(kobolds.count).toBe(2);
  //   expect(kobolds.rollAttackDamage()).toBe(2);  // the only remaining group member should be using wpn #20
  // });
});
