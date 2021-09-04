import * as pluralize from 'pluralize';
import Game from "../models/game";
import {GameObject} from "../models/game-object";
import {Artifact} from "../models/artifact";
import {RoomExit} from "../models/room";

declare let game: Game;

/**
 * Monster class. Represents all properties of a single monster
 */
export class Monster extends GameObject {

  // constants
  static PLAYER = 0;
  static FRIEND_ALWAYS = "friend";
  static FRIEND_NEUTRAL = "neutral";
  static FRIEND_NEVER = "hostile";
  static FRIEND_RANDOM = "random";
  // reaction to player
  static RX_UNKNOWN = "unknown";
  static RX_FRIEND = "friend";
  static RX_NEUTRAL = "neutral";
  static RX_HOSTILE = "hostile";
  // status
  static STATUS_ALIVE = 1;
  static STATUS_DEAD = 2;
  // combat codes
  static COMBAT_CODE_SPECIAL = 1;  // uses generic combat verbs like "attacks"
  static COMBAT_CODE_NORMAL = 0;  // uses a weapon, or natural weapons if defined in database
  static COMBAT_CODE_WEAPON_IF_AVAILABLE = -1;  // uses a weapon if there is one available; otherwise natural
  static COMBAT_CODE_NEVER_FIGHT = -2;
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
  room_id: number;
  container_id: number;
  gender: string;
  hardiness: number;
  agility: number;
  friendliness: string;
  friend_odds: number;
  combat_code: number;
  combat_verbs: string[] = [];  // custom messages that replace the normal attack messages
  health_messages: string[] = [];  // custom messages that replace the normal health status messages
  courage: number;
  pursues: boolean;
  gold: number;
  weapon_id: number;
  weapon_dice: number;
  weapon_sides: number;
  attack_odds: number;
  defense_bonus: number;
  armor_class: number;
  spells: string[] = [];  // spells that an NPC knows, e.g., ['blast', 'heal']
  spell_points = 0;  // number of spells the monster can cast (each spell takes 1 SP)
  spell_frequency = 33;  // percent chance the monster will cast a spell instead of other battle actions
  special: string;  // special flags used for special effects.

  // properties used for managing group monsters
  name_plural: string;
  count: number;
  parent: Monster = null;
  children: Monster[] = [];

  // data properties for player only
  charisma: number;
  spell_abilities: { [key: string]: number; };
  spell_abilities_original: { [key: string]: number; };
  stats_original: { [key: string]: number; };
  weapon_abilities: { [key: number]: number; };
  armor_expertise: number;
  saved_games: Object[] = [];
  profit = 0; // the money the player makes for selling items when they leave the adventure

  // game-state properties
  reaction: string = Monster.RX_UNKNOWN;
  status: number = Monster.STATUS_ALIVE;
  status_message = "";
  turn_taken = false;  // whether monster acted this turn
  original_group_size: number;
  damage = 0;
  weight_carried = 0;
  weapon: Artifact;
  inventory: Artifact[];
  spell_counters: { [key: string]: number };  // time remaining on various spells (e.g., speed)
  speed_multiplier = 1; // multiplier for to hit: 2 when speed spell is active; 1 otherwise
  dead_body_id: number; // the ID of the auto-generated dead body artifact for non-player monsters

  constructor (){
    super();
  }

  /**
   * Shows the description, including any chained effects
   */
  public showDescription() {
    // when a monster is part of the group, only the group description is shown
    if (!this.parent) {
      super.showDescription();
    }
  }

  /**
   * Moves the monster to a specific room.
   * @param {Number} room_id  The ID of the room to move to. If null or zero, this moves the monster to the player's current room
   * @param {boolean} monsters_follow  If the player is moving, should other monsters follow? True = yes, false = no
   */
  public moveToRoom(room_id: number = null, monsters_follow = true): void {
    this.room_id = room_id || game.player.room_id;
    this.container_id = null;

    // when the player moves, set the current room reference
    if (this.id === Monster.PLAYER) {
      game.rooms.current_room = game.rooms.getRoomById(room_id);

      // check if monsters should move
      if (monsters_follow) {
        for (const m of game.monsters.visible) {
          if (m.reaction === Monster.RX_UNKNOWN) {
            m.checkReaction();
          }
          let moves = false;
          // friends always move
          if (m.reaction === Monster.RX_FRIEND && m.id !== Monster.PLAYER) {
            moves = true;
          }
          // enemies move based on courage check (this is used when the player flees)
          else if (m.reaction === Monster.RX_HOSTILE && m.checkCourage(true)) {
            moves = true;
          }
          if (moves) {
            m.moveToRoom(room_id);
          }
        }
      }
    }

    // no battle actions on turn when they appeared
    this.turn_taken = true;
  }

  /**
   * Moves the virtual "group monster" pointer to the correct place
   */
  public updateVirtualMonster() {
    // Not implemented for the Monster class. This is only implemented in the GroupMonster child class
  }

  /**
   * Monster flees out a random exit
   */
  public chooseRandomExit(): RoomExit {
    // choose a random exit
    // exclude any locked/hidden exits and the game exit
    return game.rooms.get(this.room_id).chooseRandomExit();
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
        const friend_odds = this.friend_odds + ((game.player.charisma - 10) * 2);
        // first roll determines a neutral vs. friendly monster
        const roll1 = game.diceRoll(1, 100);
        if (roll1 > friend_odds) {
          this.reaction = Monster.RX_NEUTRAL;
          // second roll determines a hostile vs. neutral monster
          const roll2 = game.diceRoll(1, 100);
          if (roll2 > friend_odds) {
            this.reaction = Monster.RX_HOSTILE;
          }
        }
        break;
    }
  }

  /**
   * Executes a courage check on this monster. Typically used to determine
   * if a monster should flee combat, or follow the player when he/she flees.
   * @param {boolean} following
   *   Whether the monster is fleeing (false) or deciding to follow a fleeing player (true)
   * @returns {boolean}
   */
  public checkCourage(following = false): boolean {
    const fear = game.diceRoll(1, 100);
    let effective_courage = this.courage;
    if (this.damage > this.hardiness * 0.2) {
      // wounded
      effective_courage *= 0.75;
    } else if (this.damage > this.hardiness * 0.6) {
      // badly wounded
      effective_courage *= 0.5;
    }
    // logic for monsters chasing a fleeing player
    if (following) {
      // some monsters never pursue
      if (!this.pursues) {
        return false;
      }
      // player always has a 15% chance to get away when fleeing
      // (new rule - not in EDX. it's really annoying otherwise.)
      effective_courage = Math.min(effective_courage, 85);
    }
    return effective_courage >= fear;
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

      const old_reaction = this.reaction;
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
    game.triggerEvent('pickUpArtifact', this, artifact);
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
    game.triggerEvent('dropArtifact', this, artifact);
    this.updateInventory();
  }

  /**
   * Refreshes the inventory of artifacts carried by the monster
   */
  public updateInventory(): void {
    this.inventory = [];
    if (this.id === Monster.PLAYER) { // armor handling currently only applies to the player
      this.armor_class = 0;
    }
    this.weight_carried = 0;
    for (const a of game.artifacts.all.filter(x => x.monster_id === this.id && x.type !== Artifact.TYPE_BOUND_MONSTER)) {
      this.inventory.push(a);
      this.weight_carried += a.weight;
      if (this.id === Monster.PLAYER) {
        if (a.is_worn && a.armor_class) {
          this.armor_class += a.armor_class;
        }
      }
      a.updateContents();
    }
    // if no longer carrying its weapon, set the weapon object to null
    if (this.weapon_id > 0 && game.artifacts.get(this.weapon_id).monster_id !== this.id) {
      this.weapon = null;
      this.weapon_id = null;
    }

    // allow event handler to adjust armor class after the standard calculation
    game.triggerEvent('armorClass', this);
  }

  /**
   * Determines whether a monster is in the room.
   * @returns boolean
   */
  public isHere(): boolean {
    return (this.room_id === game.player.room_id);
  }

  /**
   * Determines whether a monster is carrying an artifact.
   * @param {number} artifact_id The ID of an artifact
   * @return boolean
   */
  public hasArtifact(artifact_id: number): boolean {
    return this.inventory.some(x => x.id === artifact_id);
  }

  /**
   * Prints the artifacts the monster is carrying
   */
  public printInventory(style = "normal"): void {
    if (this.reaction === Monster.RX_FRIEND) {

      // some EDX adventures put the dead bodies into the monster's inventory. Don't show them here.
      let inv = this.inventory;
      if (this.id !== Monster.PLAYER) {
        inv = inv.filter(x => x.type !== Artifact.TYPE_DEAD_BODY)
      }

      const delay_time = game.queue.delay_time;
      game.queue.delay_time = Math.floor(game.queue.delay_time / 2);

      const worn = inv.filter(x => x.is_worn === true);
      if (worn.length) {
        game.history.write(this.name + " is wearing:");
        worn.forEach(a => game.history.write(" - " + a.name, "no-space"));
      }

      game.history.write(this.name + " is carrying:");
      inv = inv.filter(x => x.is_worn === false);
      if (inv.length === 0) {
        game.history.write(" - (nothing)", "no-space");
      }
      for (const a of inv) {
        let notes = "";
        if (a.inventory_message !== "") {
          notes = a.inventory_message;
        } else {
          if (a.is_lit) {
            notes = "(lit)"
          }
          if (a.id === this.weapon_id) {
            notes = "(ready weapon)"
          }
        }
        game.history.write(` - ${a.name} ${notes}`, "no-space");
      }
      if (this.id === Monster.PLAYER) {
        game.history.write(` - ${this.getMoneyFormatted()}`, "no-space");
        game.history.write(`Weight carried: ${ game.player.weight_carried } of ${ game.player.hardiness * 10 } gronds`, "no-space");
      }
      game.queue.delay_time = delay_time;
    } else {
      if (this.weapon) {
        game.history.write(this.name + " is armed with: " + this.weapon.name);
      } else if (this.weapon_id === 0) {
        game.history.write(this.name + " is armed with natural weapons.");
      } else {
        game.history.write(this.name + " is unarmed.");
      }
    }
  }

  /**
   * Determines whether a monster is wearing an artifact.
   * @param {number} artifact_id The ID of an artifact
   * @return boolean
   */
  public isWearing(artifact_id: number): boolean {
    const a = this.inventory.find(x => x.id === artifact_id);
    if (!a) {
      return false;
    } else {
      return a.is_worn;
    }
  }

  /**
   * Finds an item in a monster's inventory by name
   * @param {string} artifact_name
   * @returns Artifact
   */
  public findInInventory(artifact_name): Artifact {
    // Try exact matches first, then exact match with display name, then partial match
    // TODO: improve this and ask the player to disambiguate if there are multiple matches
    let a = this.inventory.find(x => x.name.toLowerCase() === artifact_name.toLowerCase());
    if (!a) {
      a = this.inventory.find(x => x.getDisplayName().toLowerCase() === artifact_name.toLowerCase());
    }
    if (!a) {
      a = this.inventory.find(x => x.match(artifact_name));
    }
    return a || null;
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
    this.weapon = null; // needed e.g., when restoring a saved game, because the "weapon" property won't deserialize correctly
    for (const a of this.inventory.filter(x => x.is_weapon)) {
      if (this.weapon === undefined || this.weapon === null ||
        a.maxDamage() > this.weapon.maxDamage()) {
        this.ready(a);
      }
    }
  }

  /**
   * Puts on the best armor the monster is carrying, and a shield if using a 1-handed weapon
   */
  public wearBestArmor(): void {
    const types = [
      Artifact.ARMOR_TYPE_ARMOR,
      Artifact.ARMOR_TYPE_SHIELD,
      Artifact.ARMOR_TYPE_HELMET,
      Artifact.ARMOR_TYPE_GLOVES,
      Artifact.ARMOR_TYPE_RING,
    ];
    const best = {};
    for (const type of types) {
      best[type] = null;
    }
    for (const art of this.inventory.filter(x => x.type === Artifact.TYPE_WEARABLE && x.armor_type !== null)) {
      if (best[art.armor_type] === null || art.armor_class > best[art.armor_type].armor_class) {
        best[art.armor_type] = art;
      }
    }
    for (const type of types) {
      if (best[type] !== null) {
        if (type === Artifact.ARMOR_TYPE_SHIELD) {
          if (!this.weapon || this.weapon.hands === 1) {
            this.wear(best[type]);
          }
        } else {
          this.wear(best[type]);
        }
      }
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
    return this.inventory.some(i => i.armor_type === Artifact.ARMOR_TYPE_ARMOR && i.is_worn)
  }

  /**
   * Determines if the player is using a shield
   */
  public isUsingShield(): boolean {
    return this.inventory.some(i => i.armor_type === Artifact.ARMOR_TYPE_SHIELD && i.is_worn)
  }

  /**
   * Determines if the player is wearing a helmet
   */
  public isUsingHelmet(): boolean {
    return this.inventory.some(i => i.armor_type === Artifact.ARMOR_TYPE_HELMET && i.is_worn)
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
    return (this.weapon_id === 0 && this.combat_code === Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE);
  }

  /**
   * Picks up a weapon during combat
   */
  public pickUpWeapon(wpn: Artifact): void {
    game.history.write(this.name + " picks up " + wpn.name + ".");
    this.pickUp(wpn);
    this.ready(wpn);
  }

  /**
   * Battle actions the monster can do (attack, flee, pick up weapon)
   */
  public doBattleActions(): void {
    // testing helper
    if (game.mock_random_numbers.length) {
      console.log(this.name, 'battle actions', game.mock_random_numbers);
    }

    // if something happened, where an event handler stopped combat, the monster should do nothing
    if (game.skip_battle_actions) {
      return;
    }

    if (this.reaction === Monster.RX_NEUTRAL) {
      // neutral monsters do nothing here.
      return;
    }

    if (game.triggerEvent('monsterAction', this)) {

      // see if we have a valid exit to flee to
      const room = game.rooms.get(this.room_id);
      if (room && room.hasGoodExits()) {
        // check if the monster should flee (single monster only)
        if (!this.parent && !this.checkCourage()) {
          this.flee();
          return;
        }
      }

      // never-fight monsters can flee but that's it.
      if (this.combat_code === Monster.COMBAT_CODE_NEVER_FIGHT) {
        return;
      }

      // pick up weapon
      if (this.wantsToPickUpWeapon()) {
        if (this.weapon_id < -1) {
          // this monster wants a specific weapon
          // defined in EDX as -1 - the artifact number (e.g., Zapf has a weapon id of -34, and his staff is artifact 33)
          const wpn_id = Math.abs(this.weapon_id) - 1;
          const wpn = game.artifacts.get(wpn_id);
          if (wpn.isHere()) {
            this.pickUpWeapon(wpn);
            return;
          }
        }
        // if the monster's desired weapon isn't here, or the monster doesn't care which weapon it uses,
        // pick up the first available weapon
        const i = game.artifacts.visible.find(x => x.is_weapon);
        if (typeof i !== 'undefined') {
          this.pickUpWeapon(i);
          return;
        }
      }

      // cast spells, if they know any
      // (to activate this, set their 'spells' and 'spell_points' values in the 'start' event handler (e.g., Ngurct)
      if (this.spells.length > 0 && this.spell_points > 0) {
        if (game.diceRoll(1,100) <= this.spell_frequency) {
          if (this.spells.indexOf('heal') !== -1 && this.damage > this.hardiness * 0.4) {
            // heal
            game.history.write(this.name + " casts a heal spell!");
            const heal_amount = game.diceRoll(2, 6);
            this.heal(heal_amount);
            this.spell_points--;
            return;
          } else if (this.spells.indexOf('blast') !== -1) {
            // blast
            const target = this.chooseTarget();
            if (target) {
              const damage = game.diceRoll(2, 5);
              game.history.write(this.name + " casts a Blast spell at " + target.name + "!");
              game.history.write("--a direct hit!", "success");
              target.injure(damage, true);
              this.spell_points--;
              return;
            }
          }
        }
      }

      // attack!
      if (this.canAttack()) {
        const target = this.chooseTarget();
        if (target) {
          this.attack(target);
        }
      }

      game.monsters.updateVisible();
      game.artifacts.updateVisible();
    }
  }

  /**
   * Attacks another monster
   * @param {Monster} target
   */
  public attack(target: Monster): void {
    // testing helper
    if (game.mock_random_numbers.length) {
      console.log(this.name, 'attacking', target.name, game.mock_random_numbers);
    }

    // calculate to-hit odds, and let event handler adjust the odds
    let odds = this.getToHitOdds(target);
    let can_critical = true;
    const odds_adjusted = game.triggerEvent('attackOdds', this, target, odds);
    if (odds_adjusted !== true) {
      odds = odds_adjusted;
      if (odds_adjusted === 0) {
        can_critical = false;
      }
    }

    // display attack message
    const wpn = this.getWeapon();
    const weapon_type = wpn ? wpn.weapon_type : 0;
    if (this.combat_code === 1) {
      // generic "attacks" message for unusual creatures like blob monsters, etc.
      game.history.write(this.name + " attacks " + target.getDisplayName());
    } else if (this.combat_verbs && this.combat_verbs.length) {
      // custom combat messages for this monster. assign these in the game start event handler.
      const attack_verb = this.combat_verbs[Math.floor(Math.random() * this.combat_verbs.length)];
      game.history.write(this.name + " " + attack_verb + " " + target.getDisplayName());
    } else {
      // standard attack message based on type of weapon
      const attack_verbs = Monster.COMBAT_VERBS_ATTACK[weapon_type];
      const attack_verb = attack_verbs[Math.floor(Math.random() * attack_verbs.length)];
      game.history.write(this.name + " " + attack_verb + " at " + target.getDisplayName());
    }

    // calculate hit, miss, or fumble
    const hit_roll = game.diceRoll(1, 100);
    if (hit_roll <= odds || (can_critical && hit_roll <= 5)) {
      // hit
      let damage = this.rollAttackDamage();
      let multiplier = 1;
      let ignore_armor = false;
      // regular or critical hit
      if (can_critical && hit_roll <= 5) {
        game.history.write("-- a critical hit!", "success no-space");
        // roll another die to determine the effect of the critical hit
        const critical_roll = game.diceRoll(1, 100);
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
      damage = Math.floor(damage * multiplier);
      const damage_adjusted = game.triggerEvent('attackDamage', this, target, damage);
      if (damage_adjusted !== true) { // event handler returns boolean TRUE if no change occurred (or handler didn't exist)
        damage = damage_adjusted;
      }
      const damage_dealt = target.injure(damage, ignore_armor, this);

      // effects that come after the damage is dealt
      game.triggerEvent('attackDamageAfter', this, target, damage_dealt);

      // check for weapon ability increase
      if (this.id === Monster.PLAYER) {
        game.statistics['damage dealt'] += damage_dealt;

        const inc_roll = game.diceRoll(1, 100);
        if (inc_roll > odds) {
          if (this.weapon_abilities[wpn.weapon_type] < 50) {
            this.weapon_abilities[wpn.weapon_type] += 2;
          } else {
            // new feature (not in original) - slower ability increase above 50%
            this.weapon_abilities[wpn.weapon_type] += 1;
          }
          game.history.write("Your " + wpn.getTypeName() + " ability increased!", "success");
        }
        // check for armor expertise increase
        const af = this.getArmorFactor();
        if (af > 0) {
          const inc_roll = game.diceRoll(1, 70);
          // always a 5% chance to increase. this was not present in the original.
          if (Math.max(af, 5) < inc_roll) {
            this.armor_expertise += Math.min(af, 2); // can sometimes increase by only 1
            game.history.write("Your armor expertise increased!", "success");
          }
        }
      }

    } else {

      // miss or fumble
      // NOTE: monsters with natural weapons can't fumble. they just miss instead.
      if (hit_roll < 97 || this.weapon_id === 0 || this.weapon_id === null) {
        if (game.triggerEvent('miss', this, target)) {
          const miss_verbs = Monster.COMBAT_VERBS_MISS[weapon_type] || ['missed'];
          const miss_verb = miss_verbs[game.diceRoll(1, miss_verbs.length) - 1];
          game.history.write("-- " + miss_verb + "!", "no-space");
        }
      } else {
        game.history.write("-- a fumble!", "warning no-space");
        // see whether the player recovers, drops, or breaks their weapon
        const fumble_roll = game.diceRoll(1, 100);
        if (game.triggerEvent('fumble', this, target, fumble_roll)) {
          if (fumble_roll <= 40) {

            game.history.write("-- fumble recovered!", "no-space");

          } else if (fumble_roll <= 80) {

            game.history.write("-- weapon dropped!", "warning no-space");
            this.drop(wpn);

          } else if (fumble_roll <= 85) {

            // not broken, user just injured self
            game.history.write("-- weapon hits user!", "danger no-space");
            this.injure(game.diceRoll(wpn.dice, wpn.sides), false, this);

          } else {
            // damaged or broken

            if (wpn.type === Artifact.TYPE_MAGIC_WEAPON) {

              // magic weapons don't break or get damaged
              game.history.write("-- sparks fly from " + wpn.name + "!", "warning no-space");

            } else {

              if (fumble_roll <= 95 && wpn.sides > 2) {
                // weapon damaged - decrease its damage potential
                game.history.write("-- weapon damaged!", "warning no-space");
                wpn.sides -= 2;
              } else {
                game.history.write("-- weapon broken!", "danger no-space");
                this.weapon_id = null;
                this.weapon = null;
                wpn.destroy();
                this.courage /= 2;
                // broken weapon can hurt user
                if (game.diceRoll(1, 10) > 5) {
                  game.history.write("-- broken weapon hurts user!", "danger no-space");
                  let dice = wpn.dice;
                  if (fumble_roll === 100) dice++;  // worst case - extra damage
                  this.injure(game.diceRoll(dice, wpn.sides), false, this);
                }
              }
            }
          }
        }
      }

    }

  }

  /**
   * Gets the "to hit" percentage for a monster attacking another monster
   */
  public getToHitOdds(defender: Monster): number {
    // attacker's adjusted agility
    const attacker_ag: number = Math.min(this.agility * this.speed_multiplier, 30);
    // defender's adjusted agility
    const defender_ag: number = Math.min(defender.agility * defender.speed_multiplier, 30);

    // Base to-hit value
    let to_hit = 2 * (attacker_ag - defender_ag) + this.attack_odds - this.getArmorFactor() - defender.defense_bonus;

    // special logic for player - adjust by weapon ability
    const wpn = this.getWeapon();
    if (this.id === Monster.PLAYER) {
      to_hit += Math.min(this.weapon_abilities[wpn.weapon_type], 100);
    }

    // add weapon odds (capped at 30%)
    if (wpn) {
      to_hit += Math.min(wpn.weapon_odds, 30);
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
    for (const i of this.inventory.filter(x => x.is_worn)) {
      ae_max += i.armor_penalty;
    }
    ae_max -= this.armor_expertise;
    if (ae_max < 0) ae_max = 0;
    if (isNaN(ae_max)) ae_max = 0; // in case of null armor_penalty value or other edge case
    return ae_max;
  }

  /**
   * Determines if the monster can attack
   */
  public canAttack() {

    if (this.combat_code === Monster.COMBAT_CODE_NEVER_FIGHT) {
      return false;
    }

    const w = this.getWeapon();
    return (!!w || this.weapon_id === 0 || this.combat_code === Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE);
  }

  /**
   * Rolls the dice for damage this monster does while attacking
   * (using weapon stats if using a weapon, and monster stats if natural weapons)
   */
  public rollAttackDamage() {
    const w = this.getWeapon();
    if (w) {
      // using a weapon
      return game.diceRoll(w.dice, w.sides);
    } else {
      // natural weapons
      return game.diceRoll(this.weapon_dice, this.weapon_sides);
    }
  }

  /**
   * Rolls a saving throw for a monster to avoid an effect
   * @param {string} stat
   *   The stat to check the saving throw against: 'hardiness', 'agility', or 'charisma'
   * @param {number} difficulty
   *   The number that must be rolled for the throw to succeed
   */
  public rollSavingThrow(stat, difficulty) {
    const roll = game.diceRoll(1, 20);
    return roll + Math.floor((this[stat] - 10) / 2) >= difficulty;
  }

  /**
   * Causes the monster to flee. Normally this only happens during combat, but you can call this specially
   * to make the monster flee under other circumstances.
   * @param {boolean} show_message
   *   Whether to show the flee message. Usually omitted, except for internal logic dealing with group monsters
   */
  public flee(show_message = true) {
    // check if there is somewhere to flee to
    if (!game.rooms.getRoomById(this.room_id).hasGoodExits()) {
      if (show_message) {
        game.history.write(`${this.name} looks frantically for an exit but finds nowhere to go!`, "warning");
      }
      return;
    }

    const exit = game.rooms.getRoomById(this.room_id).chooseRandomExit();

    if (show_message) {
      if (exit.direction == 'u' || exit.direction == 'd') {
        game.history.write(`${this.name} ${game.flee_verbs.singular} ${exit.getFriendlyDirection()}ward.`, "warning");
      } else {
        game.history.write(`${this.name} ${game.flee_verbs.singular} to the ${exit.getFriendlyDirection()}.`, "warning");
      }
    }
    this.moveToRoom(exit.room_to);
    game.monsters.updateVisible();
  }

  /**
   * Gets the weapon a monster is currently using.
   * @returns Artifact
   */
  public getWeapon(): Artifact {
    return game.artifacts.get(this.weapon_id);
  }

  /**
   * Gets the formatted amount of money the monster has (usually the player)
   * @returns string
   */
  public getMoneyFormatted(): string {
    return this.gold.toLocaleString() + " " + pluralize.plural(game.money_name, this.gold);
  }

  /**
   * Finds someone for the monster to attack
   * @returns Monster
   */
  public chooseTarget(): Monster {
    const monsters = [game.player].concat(game.monsters.visible);
    const targets: Monster[] = [];
    for (const m of monsters) {
      if (this.reaction === Monster.RX_FRIEND && m.reaction === Monster.RX_HOSTILE) {
        targets.push(m);
      } else if (this.reaction === Monster.RX_HOSTILE && m.reaction === Monster.RX_FRIEND) {
        targets.push(m);
      }
    }
    if (targets.length) {
      const target = game.getRandomElement(targets);
      const target_adjusted = game.triggerEvent('chooseTarget', this, target);
      // event handler returns boolean TRUE if no change occurred (or handler didn't exist)
      return target_adjusted === true ? target : target_adjusted;
    }
    return null;
  }

  /**
   * Deals damage to a monster
   * @param {number} damage - The amount of damage to do.
   * @param {boolean} ignore_armor - Whether to ignore the effect of armor
   * @param {Monster} attacker - Reference to the attacking monster, if in combat
   * @returns number The amount of actual damage done
   */
  public injure(damage: number, ignore_armor = false, attacker: Monster = null): number {

    if (this.armor_class && !ignore_armor) {
      damage -= this.armor_class;
      if (damage <= 0) {
        game.history.write("-- blow bounces off armor!", "no-space");
        return 0; // no need to show health here.
      }
    }
    // prevent hp from going below zero, because it makes statistics collection easier
    if (damage > this.hardiness - this.damage) {
      damage = this.hardiness - this.damage;
    }
    this.damage += damage;
    this.showHealth();

    if (this.id === Monster.PLAYER) {
      game.statistics['damage taken'] += damage;
    }

    // handle death
    if (this.damage >= this.hardiness) {

      if (game.triggerEvent("death", this, attacker)) {

        this.status = Monster.STATUS_DEAD;
        this.inventory.forEach(a => this.drop(a));

        // if a member of a group, update or remove the parent
        if (this.parent) {
          this.parent.placeDeadBody();
          this.parent.updateVirtualMonster();
          // when all individuals of a monster group die, trigger afterDeath
          // handler on the parent monster
          if (!this.parent.children.some(m => m.status === Monster.STATUS_ALIVE)) {
            game.triggerEvent("afterDeath", this.parent);
          }
        } else {
          this.placeDeadBody();
        }
        game.triggerEvent("afterDeath", this);

        if (this.id === Monster.PLAYER) {
          game.die(false);
          game.skip_battle_actions = true;  // stops Diablo-style "hack the dead player" effect
          if (attacker) {
            game.logger.log('killed by', attacker.id);
          }
        }
        this.room_id = null;
        game.monsters.updateVisible();
      }

    }
    return damage;
  }

  /**
   * Puts the monster's dead body into the room
   */
  private placeDeadBody() {
    if (!this.dead_body_id) {
      return;
    }
    const body: Artifact = game.artifacts.get(this.dead_body_id);
    // if there is no matching artifact, or the "matching" artifact is
    // actually player's gear they brought, then there is no dead body.
    if (body && !body.player_brought) {
      body.moveToRoom(this.room_id);
    }
  }

  /**
   * Removes a monster from the game
   */
  public destroy(): void {
    this.room_id = null;
    game.monsters.updateVisible();
  }

  /**
   * Resurrects a monster and places it in the current room
   */
  public resurrect() {
    this.moveToRoom();
    this.damage = 0;
    this.status = Monster.STATUS_ALIVE;
    const body = game.artifacts.get(this.dead_body_id);
    if (body) {
      body.destroy();
    }
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
   * Determines if monster is alive and active (i.e., not removed from the game)
   */
  public isActive(): boolean {
    return this.status === Monster.STATUS_ALIVE && this.room_id !== null;
  }

  /**
   * Determines if monster is alive and active (i.e., not removed from the game)
   */
  public isAlive(): boolean {
    return this.status === Monster.STATUS_ALIVE;
  }

  /**
   * Shows monster health status
   */
  public showHealth(): void {
    const status = (this.hardiness - this.damage) / this.hardiness;
    const name = this.name;

    let messages: string[] = [
      "is in perfect health.",
      "is in good shape.",
      "is hurting.",
      "is in pain.",
      "is badly injured.",
      "is at death's door!",
      "is dead!"
    ];
    if (this.health_messages.length === 7) {
      messages = this.health_messages;
    }

    if (status > .99) {
      game.history.write(name + " " + messages[0]);
    } else if (status > .8) {
      game.history.write(name + " " + messages[1]);
    } else if (status > .6) {
      game.history.write(name + " " + messages[2]);
    } else if (status > .4) {
      game.history.write(name + " " + messages[3]);
    } else if (status > .2) {
      game.history.write(name + " " + messages[4], "warning");
    } else if (status > 0) {
      game.history.write(name + " " + messages[5], "warning");
    } else {
      game.history.write(name + " " + messages[6], "danger");
    }
  }

  /**
   * When player casts a spell, this method determines if it was successful
   * @param {string} spell_name
   * @returns boolean
   */
  public spellCast(spell_name: string): boolean {

    if (!game.player.spell_abilities[spell_name]) {
      game.history.write("You don't know that spell!");
      return;
    }

    let success = false;

    // this event handler can alter any spell or prevent it from firing
    if (game.triggerEvent("beforeSpell", spell_name)) {

      // roll to see if the spell succeeded
      const roll = game.diceRoll(1, 100);
      if (roll === 100) {

        if (game.triggerEvent('spellBacklash', spell_name)) {
          game.history.write(`The strain of attempting to cast ${spell_name.toUpperCase()} overloads your brain and you forget it completely for the rest of this adventure.`);
          game.player.spell_abilities[spell_name] = 0;
        }
        return;

        // always a 5% chance to work and a 5% chance to fail
      } else if (roll <= game.player.spell_abilities[spell_name] || roll <= 5 && roll <= 95) {
        // success!
        success = true;

        // check for ability increase
        const inc_roll = game.diceRoll(1, 100);
        if (inc_roll > this.spell_abilities_original[spell_name]) {
          this.spell_abilities_original[spell_name] += 2;
          game.history.write("Spell ability increased!", "success");
        }

      } else {
        game.history.write("Nothing happens.");
      }

      // temporarily decrease spell ability
      this.spell_abilities[spell_name] = Math.round(this.spell_abilities[spell_name] / 2);
    }

    return success;
  }

  /**
   * Recharges the player's spell abilities. Called on game tick.
   * @param {number} amount
   *   The amount to recharge. Default is 1 per turn but you
   *   can call this in a special effect with a different value
   *   if you like.
   * @param {string} type
   *   The type of recharge: 'percentage' to recharge an amount based on the
   *   current ability (e.g., add 10% of current ability) or 'constant'
   *   (e.g., add 10 points regardless of current ability)
   */
  public rechargeSpellAbilities(amount?: number, type?: string): void {

    let recharge_type = game.spell_recharge_rate[0];
    let recharge_amount = game.spell_recharge_rate[1];

    if (typeof amount === 'number') {
      recharge_amount = amount;
    }
    if (typeof type === 'string') {
      recharge_type = type;
    }

    for (const spell_name in this.spell_abilities) {
      // Note: you can have a temporary boost to spell abilities above
      // normal maximum, which doesn't get erased by this code.
      if (this.spell_abilities[spell_name] && this.spell_abilities[spell_name] < this.spell_abilities_original[spell_name]) {
        let inc = recharge_amount;
        if (recharge_type === 'percentage') {
          inc = Math.max(1, Math.floor(this.spell_abilities[spell_name] * recharge_amount / 100));
        }
        this.spell_abilities[spell_name] = Math.min(
          this.spell_abilities[spell_name] += inc,
          this.spell_abilities_original[spell_name]
        );
      }
    }
  }

  /**
   * Sells the player's items when they return to the main hall
   */
  public sellItems(): void {
    game.selling = true;

    // remove all items from containers
    for (const i of game.player.inventory.filter(x => x.type === Artifact.TYPE_CONTAINER)) {
      for (const j of i.contents) {
        j.removeFromContainer();
      }
    }

    // a copy of inventory, needed to prevent looping errors when we destroy artifacts
    const treasures = this.inventory.filter(x => !x.is_weapon && !x.isArmor());
    for (const a of treasures) {
      this.profit += a.value;
      a.destroy();
    }

    game.triggerEvent("afterSell");

  }

  /**
   * Is it a group monster?
   */
  public isGroup() {
    return false;
  }

  /**
   * Spawns a new child member for the group
   */
  public spawnChild() {
    console.error("Not implemented for single monsters");
  }

  /**
   * Reduces the size of the group by removing some children
   * @param {number} num The number of children to remove
   */
  public removeChildren(num = 1) {
    console.error("Not implemented for single monsters");
  }

}

/**
 * GroupMonster class. Represents all properties of a group of monsters, with children that are single monsters.
 * Note: Keeping this in the same file as the parent class to avoid nasty import problems
 */
export class GroupMonster extends Monster {

  // properties used for managing group monsters
  name_plural: string;
  count: number;
  children: Monster[] = [];

  constructor () {
    super();
  }

  /**
   * Loads data from JSON source into the object properties.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    super.init(source);

    // default plural name for group monsters. if you want a better name, enter it in the database.
    if (this.count > 1 && !this.name_plural) {
      this.name_plural = pluralize.plural(this.name, 2);
    }

    this.original_group_size = this.count;
  }

  /**
   * Moves the group monster (and all children) to a specific room.
   * @param {Number} room_id  The ID of the room to move to. If null or zero, this moves the monster to the player's current room
   * @param {boolean} monsters_follow  If the player is moving, should other monsters follow? True = yes, false = no
   */
  public moveToRoom(room_id: number = null, monsters_follow = true): void {
    const from_room_id = this.room_id;

    super.moveToRoom(room_id, monsters_follow);

    if (this.children.length) {
      this.children
        .filter(c => c.room_id === from_room_id && c.status === Monster.STATUS_ALIVE)
        .forEach(c => c.moveToRoom(room_id));
    }
  }

  /**
   * Moves the virtual "group monster" pointer to the correct place
   */
  public updateVirtualMonster() {
    const visible_children = this.children.filter(c => c.isHere());
    if (visible_children.length) {
      this.room_id = game.player.room_id;  // move virtual group pointer
    } else {
      const living_child = this.children.find(c => c.status === Monster.STATUS_ALIVE);
      this.room_id = living_child ? living_child.room_id : null;
    }
  }

  /**
   * Is it a group monster?
   */
  public isGroup() {
    return true;
  }

  /**
   * Spawns a new child member for the group
   */
  public spawnChild() {
    this.count++;
    // There is one Monster object for each child monster, with an ID that's based on the group's id.
    // The monster will be part of the group, but each individual maintains its own location, damage, and weapon id
    const child = game.monsters.add({
      ...this,
      id: this.id + 0.0001 * this.count,   // this can handle groups up to 9999 members
      parent: this,
      description: "",  // just to save memory
      count: 1,
      weapon_id: 0  // when using this, the new member always gets natural weapons, even if other members have a real weapon
    });
    // console.log(`New ${this.name} #${child.id}`);
    this.children.push(child);
  }

  /**
   * Reduces the size of the group by removing some children
   * @param {number} num The number of children to remove
   */
  public removeChildren(num = 1) {
    this.children = this.children.slice(0, -num);
    if (!this.children.length) {
      this.destroy();
    }
    this.count = this.children.length;
  }

  /**
   * Checks the monster's reaction to the player
   */
  public checkReaction(): void {
    super.checkReaction();

    // for group monsters, we also update the reactions of all the members
    this.children.forEach(m => {
      m.reaction = this.reaction;
    });
  }

  // TODO: override checkCourage to reduce courage if a group member has been killed

  /**
   * Battle actions the monster can do (attack, flee, pick up weapon)
   */
  public doBattleActions(): void {

    // if something happened, where an event handler stopped combat, the monster should do nothing
    if (game.skip_battle_actions) {
      return;
    }

    if (this.reaction === Monster.RX_NEUTRAL || this.combat_code === Monster.COMBAT_CODE_NEVER_FIGHT) {
      // neutral and never-fight monsters do nothing here.
      return;
    }

    // console.log(`battle action for group monster #${this.id}: ${this.name}`);

    if (game.triggerEvent('monsterAction', this)) {

      // see if we have a valid exit to flee to
      if (game.rooms.getRoomById(this.room_id).hasGoodExits()) {
        // group monster logic
        const visible_children = this.children.filter(m => m.isHere());
        // first, determine how many flee and how many stay
        const chickens = visible_children.filter(m => !m.checkCourage());
        if (chickens.length) {
          if (chickens.length === 1) {
            game.history.write(`${this.name} ${game.flee_verbs.singular}!`, 'warning');
          } else {
            game.history.write(`${chickens.length} ${this.name_plural} ${game.flee_verbs.plural}!`, 'warning');
          }
          chickens.forEach(m => m.flee(false));
        }
      }

      // group monsters delegate the rest of the logic to the individuals, which happens automatically
      const visible_children = this.children.filter(m => m.isHere());
      visible_children.slice(0,5).map(m => m.doBattleActions());
      return;
    }
  }

  /**
   * Causes the monster to flee. Normally this only happens during combat, but you can call this specially
   * to make the monster flee under other circumstances.
   * @param {boolean} show_message
   *   Whether to show the flee message. Usually omitted, except for internal logic dealing with group monsters
   */
  public flee(show_message = true) {

    // check if there is somewhere to flee to
    if (!game.rooms.getRoomById(this.room_id).hasGoodExits()) {
      if (show_message) {
        if (this.children.length > 1) {
          game.history.write(`${this.children.length} ${this.name_plural} look frantically for an exit but find nowhere to go!`, "warning");
        } else {
          game.history.write(`${this.name} looks frantically for an exit but finds nowhere to go!`, "warning");
        }
      }
      return;
    }

    // group monster - all members in the current room flee, possibly in different directions
    const visible_children = this.children.filter(m => m.isHere());
    if (show_message) {
      game.history.write(`${visible_children.length} ${this.name_plural} ${game.flee_verbs.plural}.`, "warning");
    }
    visible_children.forEach(m => m.flee(false));
    this.room_id = (visible_children[0].room_id);
    return;
  }

  /**
   * Deals damage to a monster
   * @param {number} damage - The amount of damage to do.
   * @param {boolean} ignore_armor - Whether to ignore the effect of armor
   * @param {Monster} attacker - Reference to the attacking monster, if in combat
   * @returns number The amount of actual damage done
   */
  public injure(damage: number, ignore_armor = false, attacker: Monster = null): number {

    // when attacking a group monster, we actually attack a random one of the children
    const visible_children = this.children.filter(c => c.isHere());
    if (!visible_children.length) {
      return;  // currently impossible to injure members in a different room
    }
    const child = game.getRandomElement(visible_children);
    const damage_dealt = child.injure(damage, ignore_armor, attacker);
    // if
    return damage_dealt;
  }

  /**
   * Removes a monster from the game.
   *
   * For group monsters, this also removes all children.
   */
  public destroy(): void {
    this.room_id = null;

    // for group monsters, we also destroy all members
    this.children.forEach(m => {
      m.room_id = null;
    });

    game.monsters.updateVisible();
  }

  /**
   * Heals a monster
   * @param {number} amount - The amount of hit points to heal
   */
  public heal(amount): void {
    const child = game.getRandomElement(this.children.filter(c => c.isHere()));
    child.heal(amount);
  }

  /**
   * Determines if monster is alive and active (i.e., not removed from the game)
   *
   * A group monster is active if any of its children are.
   */
  public isActive(): boolean {
    return this.children.some(c => c.isActive());
  }

  /**
   * Determines if monster is alive
   *
   * A group monster is active if any of its children are.
   */
  public isAlive(): boolean {
    return this.children.some(c => c.isAlive());
  }

}
