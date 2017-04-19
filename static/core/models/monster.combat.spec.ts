import {Game} from "../models/game";
import {initMockGame} from "../utils/testing";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

describe("Monster Combat", function() {

  // initialize the test with the full mock game data
  let game = Game.getInstance();
  beforeEach(() => {
    initMockGame();
  });

  it("should know if it's able to attack (single monster)", function () {
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

  it("should swing and miss", function () {
    let alfred = game.monsters.get(3);  // has a weapon
    let thief = game.monsters.get(4);   // no weapon

    game.mock_random_numbers = [96, 1];
    alfred.attack(thief);
    expect(game.history.getLastOutput().text).toBe("-- parried!");

    game.mock_random_numbers = [96, 1];
    thief.attack(alfred);
    expect(game.history.getLastOutput().text).toBe("-- missed!");

  });

  it("should fumble", function () {
    let alfred = game.monsters.get(3);  // has a weapon
    let thief = game.monsters.get(4);   // no weapon

    // fumble recovered
    game.mock_random_numbers = [98, 1];
    alfred.attack(thief);
    expect(game.history.getLastOutput().text).toBe("--fumble recovered!");

    game.mock_random_numbers = [98, 1];
    thief.attack(alfred);
    expect(game.history.getLastOutput().text).toBe("-- missed!");

    // weapon dropped!
    game.mock_random_numbers = [98, 42];
    alfred.attack(thief);
    expect(game.history.getLastOutput().text).toBe("--weapon dropped!");

    // user injured self
    game.mock_random_numbers = [98, 82];
    alfred.pickUp(game.artifacts.get(8));
    alfred.ready(game.artifacts.get(8));
    alfred.armor_class = 99; // to simplify test, armor always absorbs blow
    alfred.attack(thief);
    expect(game.history.getLastOutput().text).toBe("--blow bounces off armor!");

    // weapon damaged/broken
    game.mock_random_numbers = [98, 90];
    alfred.attack(thief);
    expect(game.history.getLastOutput().text).toBe("--weapon damaged!");
    game.mock_random_numbers = [98, 99, 1];  // fumble, damage, no hit self
    alfred.attack(thief);
    expect(game.history.getLastOutput().text).toBe("--weapon broken!");

  });

});
