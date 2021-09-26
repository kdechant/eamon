import GameObject from "./game-object";

/**
 * Artifact class. Represents all properties of a single artifact
 */
export default class Artifact extends GameObject {

  // constants
  static TYPE_GOLD = 0;
  static TYPE_TREASURE = 1;
  static TYPE_WEAPON = 2;
  static TYPE_MAGIC_WEAPON = 3;
  static TYPE_CONTAINER = 4;
  static TYPE_LIGHT_SOURCE = 5;
  static TYPE_DRINKABLE = 6;
  static TYPE_READABLE = 7;
  static TYPE_DOOR = 8;
  static TYPE_EDIBLE = 9;
  static TYPE_BOUND_MONSTER = 10;
  static TYPE_WEARABLE = 11;
  static TYPE_DISGUISED_MONSTER = 12;
  static TYPE_DEAD_BODY = 13;
  static TYPE_USER_1 = 14;
  static TYPE_USER_2 = 15;
  static TYPE_USER_3 = 16;
  static ARMOR_TYPE_ARMOR = 0;
  static ARMOR_TYPE_SHIELD = 1;
  static ARMOR_TYPE_HELMET = 2;
  static ARMOR_TYPE_GLOVES = 3;
  static ARMOR_TYPE_RING = 4;

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

  // game-state properties
  contents: Artifact[] = [];  // the Artifact objects for the things inside a container
  inventory_message = "";  // replaces the "lit" or "wearing" message if set
  is_worn = false; // if the monster is wearing it

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
        case Artifact.ARMOR_TYPE_GLOVES:
          return "gloves";
        case Artifact.ARMOR_TYPE_RING:
          return "ring";
      }
    }
    return "treasure";
  }

  /**
   * Returns the icon to use. Return value must match an available icon filename.
   */
  public getIcon(): string {
    let t = "";
    switch (this.type) {
      case Artifact.TYPE_WEAPON:
      case Artifact.TYPE_MAGIC_WEAPON:
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
        if (this.armor_type === Artifact.ARMOR_TYPE_ARMOR) {
          return this.armor_class < 3 ? "leather" : "armor";
        } else {
          return this.getTypeName();
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
  public isWeapon(): boolean {
    return (this.type === Artifact.TYPE_WEAPON || this.type === Artifact.TYPE_MAGIC_WEAPON);
  }

  /**
   * Returns whether the artifact is armor
   */
  public isArmor(): boolean {
    return (this.type === Artifact.TYPE_WEARABLE && (this.armor_type !== null));
  }

}
