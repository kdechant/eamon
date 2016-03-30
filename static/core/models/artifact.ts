import {GameObject} from "./game-object";
import {Game} from "./game";
import {Monster} from "./monster";
import {CommandException} from "../utils/command.exception";

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
  description: string;
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
  embedded: boolean;
  quantity: number;
  effect_id: number; // for readable artifacts, the ID of the marking in the effects table
  num_effects: number; // for readable artifacts, the number of markings in the effects table
  markings: string[];  // phrases that appear when you read the item

  // game-state properties
  contents: Artifact[] = [];  // the Artifact objects for the things inside a container
  seen: boolean = false;
  is_lit: boolean = false;
  markings_index: number = 0; // counter used to keep track of the next marking to read
  is_worn: boolean = false; // if the monster is wearing it

  /**
   * Moves the artifact to a specific room.
   */
  public moveToRoom(room_id): void {
    this.room_id = room_id;
  }

  /**
   * Determines whether an artifact is available to the player right now.
   * Artifacts are available if the player is carrying them or if they are in
   * the current room.
   * @returns boolean
   */
  public isHere(): boolean {
    return (this.room_id === Game.getInstance().rooms.current_room.id || this.monster_id === Monster.PLAYER);
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
   * Removes an artifact from a container and
   * places it in the room where the container is.
   */
  public removeFromContainer(): void {
    let game = Game.getInstance();
    let container: Artifact = game.artifacts.get(this.container_id);
    if (container) {
      if (container.room_id) {
        this.room_id = container.room_id;
      } else if (container.monster_id) {
        this.monster_id = container.monster_id;
      }
      this.container_id = null;
      game.artifacts.updateVisible();
    } else {
      throw new CommandException("I couldn't find that container!");
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
    if ((this.type === Artifact.TYPE_EDIBLE || this.type === Artifact.TYPE_DRINKABLE) && this.dice * this.sides > 0) {
      let heal_amount = game.diceRoll(this.dice, this.sides);

      // Healing items affect the monster that's carrying the item. If it's in the room, it affects the player.
      let owner = game.monsters.get(this.monster_id);
      if (owner) {
        game.history.write("It heals " + owner.name + " " + heal_amount + " hit points.");
      } else {
        owner = game.player;
        game.history.write("It heals you " + heal_amount + " hit points.");
      }
      owner.heal(heal_amount);
    }

    // the real logic for this is done in an event handler defined in the adventure.
    game.triggerEvent("use", this);

    // reduce quantity/number of charges remaining
    if (this.quantity !== null && this.quantity > 0) {
      this.quantity--;
    }
  }

  /**
   * Removes an artifact from the game
   */
  public destroy(): void {
    this.monster_id = null;
    this.room_id = null;
    this.container_id = null;
  }

  /**
   * Returns the name of the weapon type
   */
  public getWeaponTypeName(): string {
    switch (this.weapon_type) {
      case 1:
        return "axe";
        break;
      case 2:
        return "bow";
        break;
      case 3:
        return "club";
        break;
      case 4:
        return "spear";
        break;
      case 5:
        return "sword";
        break;
    }
  }

}
