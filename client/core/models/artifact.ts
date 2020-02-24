import {GameObject} from "./game-object";
import Game from "./game";
import {Monster} from "./monster";
import {CommandException} from "../utils/command.exception";
import ArtifactRepository from "../repositories/artifact.repo";

declare var game;

/**
 * Artifact class. Represents all properties of a single artifact
 */
export class Artifact extends GameObject {

  // constants
  static TYPE_GOLD: number = 0;
  static TYPE_TREASURE: number = 1;
  static TYPE_WEAPON: number = 2;
  static TYPE_MAGIC_WEAPON: number = 3;
  static TYPE_CONTAINER: number = 4;
  static TYPE_LIGHT_SOURCE: number = 5;
  static TYPE_DRINKABLE: number = 6;
  static TYPE_READABLE: number = 7;
  static TYPE_DOOR: number = 8;
  static TYPE_EDIBLE: number = 9;
  static TYPE_BOUND_MONSTER: number = 10;
  static TYPE_WEARABLE: number = 11;
  static TYPE_DISGUISED_MONSTER: number = 12;
  static TYPE_DEAD_BODY: number = 13;
  static TYPE_USER_1: number = 14;
  static TYPE_USER_2: number = 15;
  static TYPE_USER_3: number = 16;
  static ARMOR_TYPE_ARMOR: number = 0;
  static ARMOR_TYPE_SHIELD: number = 1;
  static ARMOR_TYPE_HELMET: number = 2;

  // data properties
  room_id: number; // if on the ground, which room
  monster_id: number; // if in inventory, who is carrying it
  container_id: number; // if inside a container, the artifact id of the container
  key_id: number; // if a container or door, the artifact id of the key that opens it
  linked_door_id: number; // if a door, the artifact id of the other side of the door. The artifact with that ID will open/close when this one does.
  guard_id: number; // if a bound monster, the monster id of the monster guarding it
  weight: number;
  value: number;
  type: number;
  is_open: boolean;
  hardiness: number;  // for doors/containers that must be smashed open - how much damage is required to open it
  is_healing: boolean; // for simple healing potions, etc. - healing amount based on dice and sides
  is_weapon: boolean;
  hands: number;  // 1 or 2 = one-handed or two-handed weapon
  weapon_type: number;
  weapon_odds: number;
  dice: number;
  sides: number;
  is_wearable: boolean;
  armor_type: number;
  armor_class: number;
  armor_penalty: number; // the amount of armor expertise needed to avoid to-hit penalty
  get_all: boolean;
  embedded: boolean;  // does not appear in the artifacts list until the player finds it
  hidden: boolean;  // for secret doors - don't explain why you can't go that way until the player reveals the secret
  quantity: number;
  effect_id: number; // for readable artifacts, the ID of the marking in the effects table
  num_effects: number; // for readable artifacts, the number of markings in the effects table
  markings: string[];  // phrases that appear when you read the item

  // game-state properties
  contents: Artifact[] = [];  // the Artifact objects for the things inside a container
  is_lit: boolean = false;
  inventory_message: string = "";  // replaces the "lit" or "wearing" message if set
  markings_index: number = 0; // counter used to keep track of the next marking to read
  is_worn: boolean = false; // if the monster is wearing it
  is_broken: boolean = false;  // for a doors/containers that has been smashed open
  player_brought: boolean = false; // flag to indicate which items the player brought with them

  // used in Marcos' shop in Main Hall
  message: string = "";
  messageState: string = "hidden";
  salePending: boolean = false;

  /**
   * Moves the artifact to a specific room.
   */
  public moveToRoom(room_id: number = null): void {
    this.room_id = room_id || Game.getInstance().player.room_id;
    if (this.type !== Artifact.TYPE_BOUND_MONSTER)
      this.monster_id = null;
    this.container_id = null;
    this.is_worn = false;
  }

  /**
   * Moves the artifact to a specific monster's inventory.
   */
  public moveToInventory(monster_id: number = null): void {
    if (this.type !== Artifact.TYPE_BOUND_MONSTER) {
      if (monster_id === null || Game.getInstance().monsters.get(monster_id)) {
        this.monster_id = monster_id || 0;
        this.room_id = null;
        this.container_id = null;
        this.is_worn = false;
        game.monsters.get(this.monster_id).updateInventory();
      } else {
        throw new CommandException("Monster # " + monster_id + " does not exist.")
      }
    } else {
      throw new CommandException("moveToInventory() can't be used on bound monster artifacts.")
    }
  }

  /**
   * Determines whether an artifact is available to the player right now.
   * Artifacts are available if the player is carrying them or if they are in
   * the current room.
   * @returns boolean
   */
  public isHere(): boolean {
    return (this.room_id === Game.getInstance().player.room_id || this.monster_id === Monster.PLAYER);
  }

  /**
   * Gets the Artifact object for an artifact inside the container
   */
  public getContainedArtifact(name: string): Artifact {
    for (let i in this.contents) {
      if (this.contents[i].match(name)) {
        return this.contents[i];
      }
    }
  }

  /**
   * Determines if one or more other artifacts are inside this artifact
   * @param {number|number[]} ids
   *   The ID of the artifact, or an array of IDs to check multiple artifacts.
   * @return {boolean}
   */
  public contains(ids: number|number[]) {
    let game = Game.getInstance();
    if (typeof ids === 'number') ids = [ids];
    for (let id of ids) {
      if (game.artifacts.get(id).container_id !== this.id) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the Monster object for the monster that is carrying the artifact, or the player if the artifact is in the room.
   */
  public getOwner(): Monster {
    let game = Game.getInstance();
    let owner: Monster;
    if (this.monster_id !== null) {
      owner = game.monsters.get(this.monster_id);
    } else if (this.room_id === game.player.room_id) {
      owner = game.player;
    }
    return owner;
  }

  /**
   * Removes an artifact from a container and places it in the player's inventory
   * or the room where the container is (depending on size of artifact)
   */
  public removeFromContainer(): void {
    let game = Game.getInstance();
    let container: Artifact = game.artifacts.get(this.container_id);
    if (container) {
      this.container_id = null;
      if (container.room_id !== null) {
        this.monster_id = null;
        if (this.weight == 999 || this.weight === -999) {
          // not something player can carry. put it in the room
          this.moveToRoom();
        } else {
          this.moveToInventory();
        }
      } else if (container.monster_id !== null) {
        // removing something from a container being carried by a monster. put in monster's inventory
        this.monster_id = container.monster_id;
        this.room_id = null;
        game.monsters.get(this.monster_id).updateInventory();
      }
      game.artifacts.updateVisible();
      game.player.updateInventory();
    } else {
      throw new CommandException("I couldn't find that container!");
    }
  }

  /**
   * Puts an artifact into a container
   */
  public putIntoContainer(container: Artifact): void {
    let game = Game.getInstance();
    if (container) {
      this.container_id = container.id;
      this.room_id = null;
      this.monster_id = null;
      this.is_worn = false;
      game.player.updateInventory();
      game.artifacts.updateVisible();
    } else {
      throw new CommandException("I couldn't find that container!");
    }
  }

  /**
   * If the artifact is a container, build the list of contents
   */
  public updateContents(override: boolean = false): void {

    this.contents = [];
    if (this.type === Artifact.TYPE_CONTAINER || override) {
      let artifacts_repo: ArtifactRepository = Game.getInstance().artifacts;
      for (let i in artifacts_repo.all) {
        if (artifacts_repo.all[i].container_id === this.id) {
          this.contents.push(artifacts_repo.all[i]);
        }
      }
    }

  }

  /**
   * Prints the artifacts inside a container
   */
  public printContents(style: string = "normal"): void {
    let game = Game.getInstance();
    game.history.write("It contains:");

    // find monsters inside the container
    let monsters = game.monsters.all.filter(x => x.container_id === this.id);
    if (this.contents.length === 0 && monsters.length === 0) {
      game.history.write(" - (nothing)", "no-space");
    }
    // monsters get moved into the room automatically
    // (the monster-in-container ability is only meant for surprises, e.g., the vampire who awakens when you open his coffin)
    for (let m of monsters) {
      game.history.write(" - " + m.getDisplayName(), "no-space");
      m.moveToRoom();
      game.skip_battle_actions = true;  // technically not necessary, but it's confusing to see fighting before the monster desc
    }
    // artifacts stay in the container and just get listed
    for (let a of this.contents) {
      game.history.write(" - " + a.getDisplayName(), "no-space");
    }
  }

  /**
   * Calculates the remaining capacity of the container
   */
  public getRemainingCapacity(): number {
    let game = Game.getInstance();
    if (this.quantity === null) {
      return 1000000; // arbitrarily high number
    }
    let capacity = this.quantity;
    for (let c of this.contents) {
      capacity -= c.weight;
    }
    return capacity;
  }

  /**
   * Returns the maximum damage a weapon can do.
   */
  public maxDamage(): number {
    if (this.type === Artifact.TYPE_WEAPON || this.type === Artifact.TYPE_MAGIC_WEAPON) {
      return this.dice * this.sides;
    } else {
      return 0;
    }
  }

  /**
   * Use an item, eat food, drink a potion, etc.
   */
  public use(): void {
    let game = Game.getInstance();

    // logic for simple healing potions, healing by eating food, etc.
    if ((this.type === Artifact.TYPE_EDIBLE || this.type === Artifact.TYPE_DRINKABLE) && this.dice !== 0) {
      // Healing items affect the monster that's carrying the item. If it's in the room, it affects the player.
      let owner = this.getOwner();
      if (owner) {
        if (this.dice > 0) {
          let heal_amount = game.diceRoll(this.dice, this.sides);
          game.history.write("It heals " + owner.name + " " + heal_amount + " hit points.");
          owner.heal(heal_amount);
        } else if (this.dice < 0) {
          // poison - negative dice was a common way to make poison in EDX adventures
          game.history.write("Yuck! It was poison!", "warning");
          let damage = game.diceRoll(Math.abs(this.dice), this.sides);
          owner.injure(damage, true);
        }
      }
    }

    // for items other than standard potions and food, the logic is done in an event handler defined in the adventure.
    game.triggerEvent("use", this.name, this);

    // reduce quantity/number of charges remaining
    if (this.quantity !== null) {
      if (this.quantity > 0) {
        this.quantity--;
      }
      if (this.quantity <= 0) {
        game.history.write("The " + this.name + " is all gone!");
        this.destroy();
      }
    }
  }

  /**
   * Prints the effects associated with the artifact. Used e.g., when revealing a disguised monster
   * (in future, could also be used for reading READABLE type artifacts.)
   */
  public printEffects(style: string = "normal"): void {
    let game = Game.getInstance();
    if (this.effect_id) {
      for (let i = this.effect_id; i < this.effect_id + this.num_effects; i++) {
        game.effects.print(i, style);
      }
    }
  }

  /**
   * Opens a door or container
   */
  public open() {
    this.is_open = true;

    // some doors have two sides, represented as two artifacts in different rooms. open the "other side" too
    if (this.type === Artifact.TYPE_DOOR && this.linked_door_id) {
      let linked_door = Game.getInstance().artifacts.get(this.linked_door_id);
      if (linked_door) {
        linked_door.reveal(); // for 2-sided secret doors
        linked_door.is_open = true;
      }
    }
  }

  /**
   * Closes a door or container
   */
  public close() {
    this.is_open = false;

    // some doors have two sides, represented as two artifacts in different rooms. close the "other side" too
    if (this.type === Artifact.TYPE_DOOR && this.linked_door_id) {
      let linked_door = Game.getInstance().artifacts.get(this.linked_door_id);
      if (linked_door) {
        linked_door.is_open = false;
      }
    }

  }

  /**
   * Reveals an embedded artifact
   */
  public reveal(): void {
    let game = Game.getInstance();
    if (this.hidden) {
      game.statistics['secret doors found']++;
    }
    this.embedded = false;
    this.hidden = false; // display
    if (!this.seen && this.isHere()) {
      // yes, it's possible for embedded artifacts to already have been seen.
      // this is used as a trick by authors to do special effects.
      game.history.write(this.description);
      this.seen = true; // since we show the description here, don't show it again in game clock tick.
    }

    // some doors have two sides, represented as two artifacts in different rooms. break open the "other side" too
    if (this.type === Artifact.TYPE_DOOR && this.linked_door_id) {
      let linked_door = game.artifacts.get(this.linked_door_id);
      if (linked_door) {
        // don't call reveal() here or it will cause an infinite loop
        linked_door.embedded = false;
        linked_door.hidden = false;
      }
    }

    game.artifacts.updateVisible();
    if (this.type === Artifact.TYPE_CONTAINER && this.is_open) {
      this.printContents();
    }
    game.triggerEvent("revealArtifact", this);
  }

  /**
   * Reveals a disguised monster
   */
  public revealDisguisedMonster(): void {
    let game = Game.getInstance();
    this.printEffects("special");
    let monster = game.monsters.get(this.monster_id);
    monster.room_id = game.rooms.current_room.id;
    monster.checkReaction();

    // destroy the artifact, then update the monster's inventory to prevent the artifact from incorrectly
    // reappearing when the monster dies. (due to using the monster_id field differently for this type.)
    this.destroy();
    monster.updateInventory();
  }

  /**
   * Frees a bound monster. If called on an artifact that is not of the "bound monster" type, this does nothing.
   */
  public freeBoundMonster(): void {
    let game = Game.getInstance();
    if (this.type === Artifact.TYPE_BOUND_MONSTER) {
      // put the freed monster into the room
      let monster = game.monsters.get(this.monster_id);
      monster.moveToRoom(this.room_id);
      // remove the "bound monster" artifact
      this.destroy();
    }
  }

  /**
   * Deals damage to an artifact
   * @param {number} damage - The amount of damage to do.
   * @param {string} source - Whether a physical ("attack") or magical ("blast") source of damage
   * @returns number The amount of actual damage done
   */
  public injure(damage: number, source: string = "attack"): number {
    let game = Game.getInstance();

    if (this.type === Artifact.TYPE_DEAD_BODY) {
      // if it's a dead body, hack it to bits
      game.history.write("You " + (source === "attack" ? "hack" : "blast") + " it to bits.");
      this.destroy();

    } else if (this.type === Artifact.TYPE_CONTAINER || this.type === Artifact.TYPE_DOOR) {
      // if it's a door or container, try to break it open.
      if (this.hardiness !== null) {
        let damage = game.player.rollAttackDamage();
        if (source === "attack")
          game.history.write("Wham! You hit the " + this.name + "!");
        else
          game.history.write("Zap! You blast the " + this.name + "!");
        this.hardiness -= damage;
        if (this.hardiness <= 0) {
          this.is_broken = true;
          game.history.write("The " + this.name + " smashes to pieces!");
          if (this.type === Artifact.TYPE_CONTAINER) {
            for (let item of this.contents) {
              item.moveToRoom();
            }
            this.destroy();
          } else {
            this.is_open = true;

            // some doors have two sides, represented as two artifacts in different rooms. break open the "other side" too
            if (this.type === Artifact.TYPE_DOOR && this.linked_door_id) {
              let linked_door = game.artifacts.get(this.linked_door_id);
              if (linked_door) {
                linked_door.reveal();
                linked_door.is_open = true;
                linked_door.is_broken = true;
              }
            }
          }
        }
      } else {
        return 0; // indicates a container that can't be smashed open
      }

    } else {
      return -1; // indicates something that makes no sense to attack
    }
    return damage;
  }

  /**
   * Removes an artifact from the game
   */
  public destroy(): void {
    let game = Game.getInstance();
    let monster_id = this.monster_id;
    this.monster_id = null;
    this.room_id = null;
    this.container_id = null;
    this.is_worn = false;
    game.artifacts.updateVisible();
    game.player.updateInventory();
    if (monster_id) {
      game.monsters.get(monster_id).updateInventory();
    }
  }

  /**
   * Returns the name of the weapon or armor type
   */
  public getTypeName(): string {
    if (this.type === Artifact.TYPE_WEAPON || this.type === Artifact.TYPE_MAGIC_WEAPON) {
      switch (this.weapon_type) {
        case 1:
          return "axe";
        case 2:
          return "bow";
        case 3:
          return "club";
        case 4:
          return "spear";
        case 5:
          return "sword";
      }
    } else if (this.isArmor()) {
      switch (this.armor_type) {
        case Artifact.ARMOR_TYPE_ARMOR:
          return "armor";
        case Artifact.ARMOR_TYPE_SHIELD:
          return "shield";
        case Artifact.ARMOR_TYPE_HELMET:
          return "helmet";
      }
    } else {
      return "treasure";
    }
  }

  /**
   * Returns the icon to use. Return value must match an available icon filename.
   */
  public getIcon(): string {
    switch (this.type) {
      case Artifact.TYPE_WEAPON:
      case Artifact.TYPE_MAGIC_WEAPON:
        let t: string = "";
        switch (this.weapon_type) {
          case 1:
            t = "axe";
            break;
          case 2:
            t = "bow";
            break;
          case 3:
            t = "hammer";
            break;
          case 4:
            t = "upg_spear";  // there is no default spear in the icon set
            break;
          case 5:
            t = "sword";
            break;
        }

        if (this.type === Artifact.TYPE_MAGIC_WEAPON && this.weapon_type !== 4) {
          t = t + '2';
        }
        return t;
      case Artifact.TYPE_WEARABLE:
        switch (this.armor_type) {
          case Artifact.ARMOR_TYPE_ARMOR:
            return this.armor_class < 3 ? "leather" : "armor";
          case Artifact.ARMOR_TYPE_SHIELD:
            return "shield";
          case Artifact.ARMOR_TYPE_HELMET:
            return "helmet";
        }
      case Artifact.TYPE_CONTAINER:
        return "backpack";
      case Artifact.TYPE_GOLD:
        return "coin";
      case Artifact.TYPE_READABLE:
        return "scroll";
      case Artifact.TYPE_DRINKABLE:
        return "potion";
      default:
        return "tools";
    }
  }

  /**
   * Returns whether the artifact is armor
   */
  public isArmor(): boolean {
    return (this.type === Artifact.TYPE_WEARABLE && (this.armor_type !== null));
  }

}
