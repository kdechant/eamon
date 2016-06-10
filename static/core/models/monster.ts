import {Game} from "../models/game";
import {GameObject} from "../models/game-object";
import {Artifact} from "../models/artifact";
import {Room} from "../models/room";
import {RoomExit} from "../models/room";

/**
 * Monster class. Represents all properties of a single monster
 */
export class Monster extends GameObject {

  // constants
  static PLAYER: number = 0;
  static FRIEND_ALWAYS: string = "friend";
  static FRIEND_NEUTRAL: string = "neutral";
  static FRIEND_NEVER: string = "hostile";
  static FRIEND_RANDOM: string = "random";
  // reaction to player
  static RX_UNKNOWN: string = "unknown";
  static RX_FRIEND: string = "friend";
  static RX_NEUTRAL: string = "neutral";
  static RX_HOSTILE: string = "hostile";
  // status
  static STATUS_ALIVE: number = 1;
  static STATUS_DEAD: number = 2;
  // combat codes
  static COMBAT_CODE_SPECIAL: number = 1;  // uses generic combat verbs like "attacks"
  static COMBAT_CODE_NORMAL: number = 0;  // uses a weapon, or natural weapons if defined in database
  static COMBAT_CODE_WEAPON_IF_AVAILABLE: number = -1;  // uses a weapon if there is one available; otherwise natural
  static COMBAT_CODE_NEVER_FIGHT: number = -2;
  // attack verbs (indexed by weapon type, first index (0) is for natural weapons)
  static COMBAT_VERBS_ATTACK = [
    ['lunges', 'tears', 'claws'],
    ['swings', 'chops', 'swings'],
    ['shoots'],
    ['swings'],
    ['stabs', 'lunges', 'jabs'],
    ['swings', 'chops', 'stabs'],
  ];
  // miss verbs (indexed by weapon type, first index (0) is for natural weapons)
  static COMBAT_VERBS_MISS = [
    ['missed', 'missed'],
    ['dodged', 'missed'],
    ['missed', 'missed'],
    ['dodged', 'missed'],
    ['dodged', 'missed'],
    ['parried', 'missed'],
  ];

  // data properties for all monsters
  // don't use default values here because they won't be overwritten when loading the data object.
  description: string;
  room_id: number;
  gender: string;
  hardiness: number;
  agility: number;
  count: number;
  friendliness: string;
  friend_odds: number;
  combat_code: number;
  courage: number;
  gold: number;
  weapon_id: number;
  attack_odds: number;
  weapon_dice: number;
  weapon_sides: number;
  defense_bonus: number; // makes monster harder to hit
  armor_class: number;

  // data properties for player only
  charisma: number;
  spell_abilities: any;
  spell_abilities_original: any;
  weapon_abilities: { [key: number]: number; };
  armor_expertise: number;

  // game-state properties
  seen: boolean = false;
  reaction: string = Monster.RX_UNKNOWN;
  status: number = Monster.STATUS_ALIVE;
  original_group_size: number;
  damage: number = 0;
  weight_carried: number = 0;
  armor_worn: Artifact[];
  weapon: Artifact;
  inventory: Artifact[];
  speed_time: number = 0; // time remaining on speed spell
  speed_multiplier: number = 1; // multiplier for to hit: 2 when speed spell is active; 1 otherwise
  dead_body_id: number; // the ID of the auto-generated dead body artifact for non-player monsters
  profit: number = 0; // the money the player makes for selling items when they leave the adventure
  group_monster_index: number = 0;  // for combat logic involving group monsters, which group member is active

  /**
   * Moves the monster to a specific room.
   */
  public moveToRoom(room_id): void {
    this.room_id = room_id;

    // when the player moves, set the current room reference
    if (this.id === Monster.PLAYER) {
      let game = Game.getInstance();
      game.rooms.current_room = game.rooms.getRoomById(room_id);
    }
  }

  /**
   * Monster flees out a random exit
   */
  public chooseRandomExit(): Room {
    let game = Game.getInstance();

    // choose a random exit
    let exits: RoomExit[] = game.rooms.current_room.exits;
    let good_exits: RoomExit[] = [];
    // exclude any locked exit and the game exit
    for (let i in exits) {
      if (exits[i].room_to !== RoomExit.EXIT && exits[i].isOpen()) {
        good_exits.push(exits[i]);
      }
    }
    if (good_exits.length === 0) {
      return null;
    } else {
      let random_exit = good_exits[Math.floor(Math.random() * good_exits.length)];

      let room_to = game.rooms.getRoomById(random_exit.room_to);
      return room_to;
    }
  }

  /**
   * Checks the monster's reaction to the player
   */
  public checkReaction(): void {
    switch (this.friendliness) {
      case Monster.FRIEND_ALWAYS:
        this.reaction = Monster.RX_FRIEND;
        break;
      case Monster.FRIEND_NEUTRAL:
        this.reaction = Monster.RX_NEUTRAL;
        break;
      case Monster.FRIEND_NEVER:
        this.reaction = Monster.RX_HOSTILE;
        break;
      case Monster.FRIEND_RANDOM:
        // calculate reaction based on random odds

        this.reaction = Monster.RX_FRIEND;
        let friend_odds = this.friend_odds + ((Game.getInstance().player.charisma - 10) * 2);
        // first roll determines a neutral vs. friendly monster
        let roll1 = Game.getInstance().diceRoll(1, 100);
        if (roll1 > friend_odds) {
          this.reaction = Monster.RX_NEUTRAL;
          // second roll determines a hostile vs. neutral monster
          let roll2 = Game.getInstance().diceRoll(1, 100);
          if (roll2 > friend_odds) {
            this.reaction = Monster.RX_HOSTILE;
          }
        }
        break;
    }
  }

  /**
   * Recheck monster's reaction when the player attacks it or otherwise
   * does something nasty.
   */
  public hurtFeelings(): void {

    // this logic is only meaningful for neutral and friendly monsters
    if (this.reaction !== Monster.RX_HOSTILE) {

      // clear the automatic reactions and set a default percentage
      switch (this.friendliness) {
        case Monster.FRIEND_ALWAYS:
          this.friend_odds = 100;
          break;
        case Monster.FRIEND_NEUTRAL:
          this.friend_odds = 50;
          break;
        case Monster.FRIEND_NEVER:
          this.friend_odds = 50;
          break;
      }
      this.friendliness = Monster.FRIEND_RANDOM;

      // decrease friend odds by half, then recheck
      this.friend_odds /= 2;

      let old_reaction = this.reaction;
      this.checkReaction();
      // attacking a neutral monster can never make it become friendly
      if (old_reaction === Monster.RX_NEUTRAL && this.reaction === Monster.RX_FRIEND) {
        this.reaction = Monster.RX_NEUTRAL;
      }
    }
  }

  /**
   * Calculates the maximum weight the monster can carry
   * @return number
   */
  public maxWeight(): number {
    return this.hardiness * 10;
  }

  /**
   * The monster picks up an artifact
   * @param {Artifact} artifact
   */
  public pickUp(artifact: Artifact): void {
    artifact.room_id = null;
    artifact.monster_id = this.id;
    this.updateInventory();
  }

  /**
   * The monster drops an artifact
   * @param {Artifact} artifact
   */
  public drop(artifact: Artifact): void {
    artifact.room_id = this.room_id;
    artifact.monster_id = null;
    artifact.is_worn = false;

    // if dropping the ready weapon, set weapon to none
    if (artifact.id === this.weapon_id) {
      this.weapon_id = null;
      this.weapon = null;
    }

    this.updateInventory();
  }

  /**
   * Refreshes the inventory of artifacts carried by the monster
   */
  public updateInventory(): void {
    let game = Game.getInstance();
    this.inventory = [];
    if (this.id === Monster.PLAYER) { // armor handling currently only applies to the player
      this.armor_worn = [];
      this.armor_class = 0;
    }
    this.weight_carried = 0;
    for (let i in game.artifacts.all) {
      let a = game.artifacts.all[i];
      if (a.monster_id === this.id) {
        this.inventory.push(a);
        this.weight_carried += a.weight;
        if (this.id === Monster.PLAYER) {
          if (a.is_worn && (a.armor_type === Artifact.ARMOR_TYPE_ARMOR || a.armor_type === Artifact.ARMOR_TYPE_SHIELD)) {
            this.armor_worn.push(a);
            this.armor_class += a.armor_class;
          }
        }
      }
      a.updateContents();
    }
    // if no longer carrying its weapon, set the weapon object to null
    if (this.weapon_id > 0 && game.artifacts.get(this.weapon_id).monster_id !== this.id) {
      this.weapon = null;
      this.weapon_id = null;
    }
  }

  /**
   * Determines whether a monster is in the room.
   * @returns boolean
   */
  public isHere(): boolean {
    return (this.room_id === Game.getInstance().player.room_id);
  }

  /**
   * Determines whether a monster is carrying an artifact.
   * @param {number} artifact_id The ID of an artifact
   * @return boolean
   */
  public hasArtifact(artifact_id: number): boolean {
    let has = false;
    for (let i in this.inventory) {
      if (this.inventory[i].id === artifact_id) {
        has = true;
      }
    }
    return has;
  }

  /**
   * Finds an item in a monster's inventory by name
   * @param {string} artifact_name
   * @returns Artifact
   */
  public findInInventory(artifact_name): Artifact {
    for (let i in this.inventory) {
      if (this.inventory[i].match(artifact_name)) {
        return this.inventory[i];
      }
    }
    return null;
  }

  /**
   * Readies a weapon
   */
  public ready(weapon: Artifact): void {
    this.weapon = weapon;
    this.weapon_id = weapon.id;
  }

  /**
   * Readies the best weapon the monster is carrying
   */
  public readyBestWeapon(): void {
    for (let a in this.inventory) {
      if (this.inventory[a].is_weapon) {
        if (this.weapon === undefined || this.weapon === null ||
          this.inventory[a].maxDamage() > this.weapon.maxDamage()) {
          this.ready(this.inventory[a]);
        }
      }
    }
  }

  /**
   * Puts on the best armor the monster is carrying, and a shield if using a 1-handed weapon
   */
  public wearBestArmor(): void {
    let best_armor = null;
    let best_shield = null;
    for (let i in this.inventory) {
      let art = this.inventory[i];
      if (art.type === Artifact.TYPE_WEARABLE) {
        if (art.armor_type === Artifact.ARMOR_TYPE_ARMOR) {
          if (best_armor === null || art.armor_class > best_armor.armor_class) {
            best_armor = art;
          }
        } else {
          if (best_shield === null || art.armor_class > best_shield.armor_class) {
            best_shield = art;
          }
        }
      }
    }
    if (best_armor) {
      this.wear(best_armor);
    }
    if (best_shield && this.weapon && this.weapon.hands === 1) {
      this.wear(best_shield);
    }
  }

  /**
   * Wears an armor, shield, or article of clothing
   */
  public wear(artifact: Artifact): void {
    artifact.is_worn = true;
    // need to update inventory to set the monster's armor value
    this.updateInventory();
  }

  /**
   * Wears an armor, shield, or article of clothing
   */
  public remove(artifact: Artifact): void {
    artifact.is_worn = false;
    // need to update inventory to set the monster's armor value
    this.updateInventory();
  }

  /**
   * Determines if the player is wearing armor
   */
  public isWearingArmor(): boolean {
    for (let i in this.inventory) {
      if (this.inventory[i].armor_type === Artifact.ARMOR_TYPE_ARMOR && this.inventory[i].is_worn) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determines if the player is using a shield
   */
  public isUsingShield(): boolean {
    for (let i in this.inventory) {
      if (this.inventory[i].armor_type === Artifact.ARMOR_TYPE_SHIELD && this.inventory[i].is_worn) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determines if the monster wants to pick up a weapon
   */
  public wantsToPickUpWeapon(): boolean {
    if (this.combat_code === Monster.COMBAT_CODE_NEVER_FIGHT) {
      return false;
    }
    // negative weapon ID for a monster indicates that it has no weapon to start with, but wants to pick one up.
    // (in-game, a weapon ID of null means the same thing)
    if (this.weapon_id === null || this.weapon_id < 0) {
      return true;
    }
    if (this.weapon_id === 0 && this.combat_code === Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE) {
      return true;
    }
    return false;
  }

  /**
   * Picks up a weapon during combat
   */
  public pickUpWeapon(wpn: Artifact): boolean {
    let game = Game.getInstance();
    game.history.write(this.name + " picks up " + wpn.name + ".");
    this.pickUp(wpn);
    this.ready(wpn);
  }

  /**
   * Battle actions the monster can do (attack, flee, pick up weapon)
   */
  public doBattleActions(): void {
    let game = Game.getInstance();

    // if the monster managed to die or somehow disappear before its turn, do nothing
    // if (!this.isHere()) return;

    if (this.reaction === Monster.RX_NEUTRAL || this.combat_code === Monster.COMBAT_CODE_NEVER_FIGHT) {
      // neutral and never-fight monsters do nothing here.
      return;
    }

    // check if the monster should flee
    let fear = game.diceRoll(1, 100);
    if (this.damage > this.hardiness * 0.2 || this.count < this.original_group_size) {
      // wounded, or members of a group have been killed
      fear += 10;
    } else if (this.damage > this.hardiness * 0.6) {
      // badly wounded
      fear += 20;
    }
    if (fear > this.courage) {
      let room_to = this.chooseRandomExit();
      if (room_to) {
        if (this.count > 1) {
          game.history.write(this.count + " " + this.name + "s flee out an exit", "warning");
        } else {
          game.history.write(this.name + " flees out an exit", "warning");
        }
        this.moveToRoom(room_to.id);
        return;
      }
      // if there are no valid exits, the monster has to stay and fight.
    }

    // pick up weapon
    if (this.wantsToPickUpWeapon()) {
      if (this.weapon_id < -1) {
        // this monster wants a specific weapon
        // defined in EDX as -1 - the artifact number (e.g., Zapf has a weapon id of -34, and his staff is artifact 33)
        let wpn_id = Math.abs(this.weapon_id) - 1;
        let wpn = game.artifacts.get(wpn_id);
        if (wpn.isHere()) {
          this.pickUpWeapon(wpn);
          return;
        }
      }
      // if the monster's desired weapon isn't here, or the monster doesn't care which weapon it uses,
      // pick up the first available weapon
      for (let i in game.artifacts.visible) {
        if (game.artifacts.visible[i].is_weapon) {
          this.pickUpWeapon(game.artifacts.visible[i]);
          return;
        }
      }
    }

    // attack!
    let attacking_member_count = Math.min(this.count, 5); // up to 5 members of a group can attack per round
    for (let i = 0; i < attacking_member_count; i++) {
      this.group_monster_index = i;  // this lets them each have a different weapon
      if (this.canAttack()) {
        let target = this.chooseTarget();
        if (target) {
          this.attack(target);
        }
      }
    }
  }

  /**
   * Attacks another monster
   * @param {Monster} target
   */
  public attack(target: Monster): void {
    let game = Game.getInstance();

    let weapon_type = this.weapon ? this.weapon.weapon_type : 0;
    if (this.combat_code === 1) {
      game.history.write(this.name + " attacks " + target.name);
    } else {
      let attack_verbs = Monster.COMBAT_VERBS_ATTACK[weapon_type];
      let attack_verb = attack_verbs[Math.floor(Math.random() * attack_verbs.length)];
      game.history.write(this.name + " " + attack_verb + " at " + target.name);
    }

    let wpn = Game.getInstance().artifacts.get(this.weapon_id);
    let odds = this.getBaseToHit();
    if (target.defense_bonus) odds -= target.defense_bonus;

    let hit_roll = game.diceRoll(1, 100);

    if (hit_roll <= odds || hit_roll <= 5) {
      // hit
      let damage = this.rollAttackDamage();
      let multiplier = 1;
      let ignore_armor = false;
      // regular or critical hit
      if (hit_roll <= 5) {
        game.history.write("-- a critical hit!", "success no-space");
        // roll another die to determine the effect of the critical hit
        let critical_roll = game.diceRoll(1, 100);
        if (critical_roll <= 50) {
          ignore_armor = true;
        } else if (critical_roll <= 85) {
          multiplier = 1.5;		// half again damage
        } else if (critical_roll <= 95) {
          multiplier = 2;		// double damage
        } else if (critical_roll <= 99) {
          multiplier = 3;		// triple damage
        } else {
          multiplier = 1000;	// instant kill
        }
      } else {
        game.history.write("-- a hit!", "success no-space");
      }
      // deal the damage
      target.injure(Math.floor(damage * multiplier), ignore_armor);

      // check for weapon ability increase
      if (this.id === Monster.PLAYER) {
        let inc_roll = game.diceRoll(1, 100);
        if (inc_roll > odds) {
          if (this.weapon_abilities[wpn.weapon_type] < 50) {
            this.weapon_abilities[wpn.weapon_type] += 2;
          } else {
            // new feature (not in original) - slower ability increase above 50%
            this.weapon_abilities[wpn.weapon_type] += 1;
          }
          game.history.write("Your " + wpn.getWeaponTypeName() + " ability increased!", "success");
        }
        // check for armor expertise increase
        let af = this.getArmorFactor();
        if (af > 0) {
          let inc_roll = game.diceRoll(1, 100);
          // always a 5% chance to increase. this was not present in the original.
          if (Math.max(af, 5) < inc_roll) {
            this.armor_expertise += Math.min(af, 2); // can sometimes increase by only 1
            game.history.write("Your armor expertise increased!", "success");
          }
        }
      }

    } else {

      // miss or fumble
      if (hit_roll < 97) {
        let miss_verbs = Monster.COMBAT_VERBS_MISS[weapon_type];
        let miss_verb = miss_verbs[Math.floor(Math.random() * miss_verbs.length)];
        game.history.write("-- " + miss_verb + "!");
      } else {
        game.history.write("-- a fumble!", "warning no-space");
        // see whether the player recovers, drops, or breaks their weapon
        let fumble_roll = game.diceRoll(1, 100);
        if (fumble_roll <= 40 || (this.weapon_id === 0 && fumble_roll <= 80)) {

          game.history.write("--fumble recovered!", "no-space");

        } else if (fumble_roll <= 80) {

          game.history.write("--weapon dropped!", "warning no-space");
          this.drop(wpn);

        } else if (fumble_roll <= 85) {

          // not broken, user just injured self
          game.history.write("--weapon hits user!", "danger no-space");
          this.injure(game.diceRoll(wpn.dice, wpn.sides));

        } else {
          // damaged or broken

          if (wpn.type === Artifact.TYPE_MAGIC_WEAPON) {

            // magic weapons don't break or get damaged
            game.history.write("--sparks fly from " + wpn.name + "!", "warning no-space");

          } else {

            if (fumble_roll <= 95 && wpn.sides > 2) {
              // weapon damaged - decrease its damage potential
              game.history.write("--weapon damaged!", "warning no-space");
              wpn.sides -= 2;
            } else {
              game.history.write("--weapon broken!", "danger no-space");
              this.weapon_id = null;
              this.weapon = null;
              wpn.destroy();
              this.courage /= 2;
              // broken weapon can hurt user
              if (game.diceRoll(1, 10) > 5) {
                game.history.write("--broken weapon hurts user!", "danger no-space");
                let dice = wpn.dice;
                if (fumble_roll === 100) dice++;  // worst case - extra damage
                this.injure(game.diceRoll(dice, wpn.sides));
              }
            }
          }
        }

      }

    }

  }

  /**
   * Gets the base "to hit" percentage for a monster
   */
  public getBaseToHit(): number {
    let wpn = Game.getInstance().artifacts.get(this.weapon_id);
    let to_hit: number;
    if (this.id === Monster.PLAYER) {
      // for player, calculate chance to hit based on weapon type, ability, and weapon odds
      to_hit = this.weapon_abilities[wpn.weapon_type] + wpn.weapon_odds + 2 * this.agility * this.speed_multiplier;
      // calculate the effect of the armor penalty
      to_hit -= this.getArmorFactor();
    } else {
      // other monsters have the same weapon ability for all weapon types
      to_hit = this.attack_odds + 2 * this.agility;
      if (this.weapon_id !== 0) {
        to_hit += wpn.weapon_odds;
      }
    }
    return to_hit;
  }

  /**
   * Gets the armor penalty for the armor items the player is wearing, adjusted
   * by the player's armor expertise
   * @returns number
   */
  public getArmorFactor(): number {
    let ae_max = 0;
    for (let i in this.inventory) {
      if (this.inventory[i].is_worn) {
        ae_max += this.inventory[i].armor_penalty;
      }
    }
    ae_max -= this.armor_expertise;
    if (ae_max < 0) ae_max = 0;
    return ae_max;
  }

  /**
   * Determines if the monster can attack
   */
  public canAttack() {

    if (this.combat_code === Monster.COMBAT_CODE_NEVER_FIGHT) {
      return false;
    }

    let w = this.getWeapon();
    if (w || this.weapon_id === 0 || this.combat_code === Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Rolls the dice for damage this monster does while attacking
   * (using weapon stats if using a weapon, and monster stats if natural weapons)
   */
  public rollAttackDamage() {
    let game = Game.getInstance();
    let w = this.getWeapon();
    if (w) {
      // using a weapon
      return game.diceRoll(w.dice, w.sides);
    } else {
      // natural weapons
      return game.diceRoll(this.weapon_dice, this.weapon_sides);
    }
  }

  /**
   * Gets the weapon a monster is currently using. For group monsters, the return value will depend on the
   * value of this.group_monster_index.
   * @returns Artifact
   */
  public getWeapon(): Artifact {
    let game = Game.getInstance();
    if (this.count === 1) {
      // single monster, or last surviving member of a group
      return game.artifacts.get(this.weapon_id);
    } else {
      // for multiple monsters, we use the index number plus the weapon ID to get the weapon they're using
      // (this assumes that the weapons are ordered sequentially in the database)
      // note: they're ordered in reverse, to prevent errors when some group members have died.
      let wpn_id = this.weapon_id + this.count - this.group_monster_index - 1;
      let w = game.artifacts.get(wpn_id);
      if (this.hasArtifact(wpn_id) && w.is_weapon) {
        return w;
      } else {
        return null;
      }
    }
  }

  /**
   * Finds someone for the monster to attack
   * @returns Monster
   */
  public chooseTarget(): Monster {
    let game = Game.getInstance();
    let monsters = [game.player].concat(game.monsters.visible);
    let targets: Monster[] = [];
    for (let i in monsters) {
      if (this.reaction === Monster.RX_FRIEND && monsters[i].reaction === Monster.RX_HOSTILE) {
        targets.push(monsters[i]);
      } else if (this.reaction === Monster.RX_HOSTILE && monsters[i].reaction === Monster.RX_FRIEND) {
        targets.push(monsters[i]);
      }
    }
    if (targets.length) {
      return targets[Math.floor(Math.random() * targets.length)];
    }
    return null;
  }

  /**
   * Deals damage to a monster
   * @param {number} amount - The amount of damage to do.
   * @param {boolean} ignore_armor - Whether to ignore the effect of armor
   * @returns number The amount of actual damage done
   */
  public injure(damage: number, ignore_armor: boolean = false): number {
    let game = Game.getInstance();
    if (this.armor_class && !ignore_armor) {
      damage -= this.armor_class;
      if (damage <= 0) {
        game.history.write("--blow bounces off armor!");
        return 0; // no need to show health here.
      }
    }
    this.damage += damage;
    this.showHealth();

    // handle death
    if (this.damage >= this.hardiness) {

      if (this.count > 1) {
        // group monster - reduce count and drop weapon
        this.group_monster_index = 0;
        let w = this.getWeapon();
        if (w) {
          this.drop(w);
          this.updateInventory();
        }
        this.damage = 0;
        this.count--;
      } else {
        // single monster. drop weapon, etc.

        for (let i in this.inventory) {
          this.inventory[i].room_id = this.room_id;
        }

        if (this.dead_body_id) {
          game.artifacts.get(this.dead_body_id).room_id = this.room_id;
        }
        this.status = Monster.STATUS_DEAD;
        game.triggerEvent("death", this);
        if (this.id === Monster.PLAYER) {
          game.die();
        } else {
          this.room_id = null;
        }
      }

    }
    return damage;
  }

  /**
   * Heals a monster
   * @param {number} amount - The amount of hit points to heal
   */
  public heal(amount): void {
    this.damage -= amount;
    if (this.damage < 0) {
      this.damage = 0;
    }
    this.showHealth();
  }

  /**
   * Shows monster health status
   */
  public showHealth(): void {
    let game = Game.getInstance();
    let status = (this.hardiness - this.damage) / this.hardiness;
    let name = this.count === 1 ? this.name : "One " + this.name;
    if (status > .99) {
      game.history.write(name + " is in perfect health.");
    } else if (status > .8) {
      game.history.write(name + " is in good shape.");
    } else if (status > .6) {
      game.history.write(name + " is hurting.");
    } else if (status > .4) {
      game.history.write(name + " is in pain.");
    } else if (status > .2) {
      game.history.write(name + " is badly injured.", "warning");
    } else if (status > 0) {
      game.history.write(name + " is at death's door.", "warning");
    } else {
      game.history.write(name + " is dead!", "danger");
    }
  }

  /**
   * When player casts a spell, this method determines if it was successful
   * @param {string} spell_name
   * @returns boolean
   */
  public spellCast(spell_name: string): boolean {
    let game = Game.getInstance();

    if (!game.player.spell_abilities[spell_name]) {
      game.history.write("You don't know that spell!");
      return;
    }

    // temporarily decrease spell ability
    this.spell_abilities[spell_name] = Math.round(this.spell_abilities[spell_name] / 2);

    // roll to see if the spell succeeded
    let roll = game.diceRoll(1, 100);
    if (roll === 100) {

      game.history.write("The strain of attempting to cast " + spell_name.toUpperCase() + " overloads your brain and you forget it completely for the rest of this adventure.");
      game.player.spell_abilities.power = 0;

      // always a 5% chance to work and a 5% chance to fail
    } else if (roll <= game.player.spell_abilities.power || roll <= 5 && roll <= 95) {
      // success!

      // check for ability increase
      let inc_roll = game.diceRoll(1, 100);
      if (inc_roll > this.spell_abilities_original[spell_name]) {
        this.spell_abilities_original[spell_name] += 2;
        game.history.write("Spell ability increased!", "success");
      }

      return true;
    } else {
      game.history.write("Nothing happens.");
    }
  }

  /**
   * Recharges the player's spell abilities. Called on game tick.
   */
  public rechargeSpellAbilities(): void {
    for (let spell_name in this.spell_abilities) {
      if (this.spell_abilities[spell_name] < this.spell_abilities_original[spell_name]) {
        this.spell_abilities[spell_name]++;
      }
    }
  }

  /**
   * Sells the player's items when they return to the main hall
   */
  public sellItems(): void {
    Game.getInstance().selling = true;
    // a copy of inventory, needed to prevent looping errors when we destroy artifacts
    let inv = this.inventory;
    for (let i in inv) {
      let a = inv[i];
      if (a.type === Artifact.TYPE_MAGIC_WEAPON || a.type === Artifact.TYPE_WEAPON) {
        // currently the player doesn't have to sell any weapons, so keep them all.
        continue;
      } else if (a.type === Artifact.TYPE_WEARABLE) {
        // also keep armor and shields, for now
        if (a.armor_type === Artifact.ARMOR_TYPE_ARMOR || a.armor_type === Artifact.ARMOR_TYPE_SHIELD) {
          continue;
        }
        this.profit += a.value;
        a.destroy();
      } else {
        // TODO: also look for items in containers
        this.profit += a.value;
        a.destroy();
      }
    }
    this.gold += this.profit;
  }

}
