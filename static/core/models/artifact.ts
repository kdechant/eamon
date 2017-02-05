import {GameObject} from "./game-object";
import {Game} from "./game";
import {Monster} from "./monster";
import {CommandException} from "../utils/command.exception";
import {ArtifactRepository} from "../repositories/artifact.repo";

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

  // data properties
  room_id: number; // if on the ground, which room
  monster_id: number; // if in inventory, who is carrying it
  container_id: number; // if inside a container, the artifact id of the container
  key_id: number; // if a container or door, the artifact id of the key that opens it
  guard_id: number; // if a bound monster, the monster id of the monster guarding it
  weight: number;
  value: number;
  fixed_value: boolean;
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
  seen: boolean = false;
  is_lit: boolean = false;
  inventory_message: string = "";  // replaces the "lit" or "wearing" message if set
  markings_index: number = 0; // counter used to keep track of the next marking to read
  is_worn: boolean = false; // if the monster is wearing it
  is_broken: boolean = false;  // for a doors/containers that has been smashed open
  player_brought: boolean = false; // flag to indicate which items the player brought with them

  /**
   * Moves the artifact to a specific room.
   */
  public moveToRoom(room_id: number = null): void {
    this.room_id = room_id || Game.getInstance().player.room_id;
    this.monster_id = null;
    this.container_id = null;
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
   * Removes an artifact from a container and
   * places it in the room where the container is.
   */
  public removeFromContainer(): void {
    let game = Game.getInstance();
    let container: Artifact = game.artifacts.get(this.container_id);
    if (container) {
      this.container_id = null;
      if (container.room_id !== null) {
        this.room_id = container.room_id;
        this.monster_id = null;
        game.artifacts.updateVisible();
      } else if (container.monster_id !== null) {
        this.monster_id = container.monster_id;
        this.room_id = null;
        game.monsters.get(this.monster_id).updateInventory();
      }
      game.artifacts.updateVisible();
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
      game.player.updateInventory();
      game.artifacts.updateVisible();
    } else {
      throw new CommandException("I couldn't find that container!");
    }
  }

  /**
   * If the artifact is a container, build the list of contents
   */
  public updateContents(): void {

    this.contents = [];
    if (this.type === Artifact.TYPE_CONTAINER) {
      let artifacts_repo: ArtifactRepository = Game.getInstance().artifacts;
      for (let i in artifacts_repo.all) {
        if (artifacts_repo.all[i].container_id === this.id) {
          this.contents.push(artifacts_repo.all[i]);
        }
      }
    }

  }

  /**
   * Prints the effects associated with the artifact. Used e.g., when revealing a disguised monster
   * (in future, could also be used for reading READABLE type artifacts.)
   */
  public printContents(style: string = "normal"): void {
    let game = Game.getInstance();
    game.history.write("It contains:");
    if (this.contents.length === 0) {
      game.history.write(" - (nothing)", "no-space");
    }
    for (let i in this.contents) {
      game.history.write(" - " + this.contents[i].name, "no-space");
    }
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
    if ((this.type === Artifact.TYPE_EDIBLE || this.type === Artifact.TYPE_DRINKABLE) && this.dice > 0) {
      let heal_amount = game.diceRoll(this.dice, this.sides);

      // Healing items affect the monster that's carrying the item. If it's in the room, it affects the player.
      let owner = this.getOwner();
      if (owner) {
        game.history.write("It heals " + owner.name + " " + heal_amount + " hit points.");
        owner.heal(heal_amount);
      }
    }

    // the real logic for this is done in an event handler defined in the adventure.
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
   * Reveals an embedded artifact
   */
  public reveal(): void {
    let game = Game.getInstance();
    this.embedded = false;
    this.hidden = false; // display
    if (!this.seen) {
      // yes, it's possible for embedded artifacts to already have been seen.
      // this is used as a trick by authors to do special effects.
      game.history.write(this.description);
    }
    this.seen = true; // description will be shown here. don't show it again in game clock tick.
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
      this.room_id = null;

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
            for (let i in this.contents) {
              this.contents[i].room_id = game.player.room_id;
              this.contents[i].container_id = null;
            }
            this.destroy();
          } else {
            this.is_open = true;
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
    this.monster_id = null;
    this.room_id = null;
    this.container_id = null;
    game.artifacts.updateVisible();
    game.player.updateInventory();
  }

  /**
   * Returns the name of the weapon type
   */
  public getWeaponTypeName(): string {
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
  }

  /**
   * Returns the name of the weapon type
   */
  public getWeaponIcon(): string {
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
      t = 'upg_' + t;
    }
    return t;
  }

  /**
   * Returns whether the artifact is armor
   */
  public isArmor(): boolean {
    return (this.type === Artifact.TYPE_WEARABLE && (this.armor_type === Artifact.ARMOR_TYPE_ARMOR || this.armor_type === Artifact.ARMOR_TYPE_SHIELD));
  }

  /**
   * Returns the name of the armor type
   */
  public getArmorTypeName(): string {
    switch (this.armor_type) {
      case Artifact.ARMOR_TYPE_ARMOR:
        return "armor";
      case Artifact.ARMOR_TYPE_SHIELD:
        return "shield";
    }
  }

}
