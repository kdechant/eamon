import GameObject from "./game-object";

/**
 * Artifact class. Represents all properties of a single artifact
 */
export default class Artifact extends GameObject {

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
  seen: boolean = false;
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
      }
    }
    return "treasure";
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
        break;
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
    return "backpack"; // default value in case we don't know what it is
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
