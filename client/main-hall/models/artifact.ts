import GameObject from "./game-object";

export const ARTIFACT_TYPES = {
  GOLD: 0,
  TREASURE: 1,
  WEAPON: 2,
  MAGIC_WEAPON: 3,
  CONTAINER: 4,
  LIGHT_SOURCE: 5,
  DRINKABLE: 6,
  READABLE: 7,
  DOOR: 8,
  EDIBLE: 9,
  BOUND_MONSTER: 10,
  WEARABLE: 11,
  DISGUISED_MONSTER: 12,
  DEAD_BODY: 13,
  USER_1: 14,
  USER_2: 15,
  USER_3: 16,
}

export const ARMOR_TYPES = {
  ARMOR: 0,
  SHIELD: 1,
  HELMET: 2,
  GLOVES: 3,
  RING: 4,
}

/**
 * Artifact class. Represents all properties of a single artifact
 */
export default interface Artifact extends GameObject {
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
  quantity: number;
  effect_id: number; // for readable artifacts, the ID of the marking in the effects table
  num_effects: number; // for readable artifacts, the number of markings in the effects table
}


/**
 * Returns whether the artifact is armor
 */
export function isWeapon(artifact: Artifact): boolean {
  return (artifact.type === ARTIFACT_TYPES.WEAPON || artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON);
}

/**
 * Returns whether the artifact is armor
 */
export function isArmor(artifact: Artifact): boolean {
  return (artifact.type === ARTIFACT_TYPES.WEARABLE && (artifact.armor_type !== null));
}

/**
 * Returns the maximum damage a weapon can do.
 */
export function maxDamage(artifact: Artifact): number {
  if (artifact.type === ARTIFACT_TYPES.WEAPON || artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON) {
    return artifact.dice * artifact.sides;
  } else {
    return 0;
  }
}

/**
 * Returns the name of the weapon or armor type
 */
export function getTypeName(artifact: Artifact): string {
  if (isWeapon(artifact)) {
    switch (artifact.weapon_type) {
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
  } else if (isArmor(artifact)) {
    switch (artifact.armor_type) {
      case ARMOR_TYPES.ARMOR:
        return "armor";
      case ARMOR_TYPES.SHIELD:
        return "shield";
      case ARMOR_TYPES.HELMET:
        return "helmet";
      case ARMOR_TYPES.GLOVES:
        return "gloves";
      case ARMOR_TYPES.RING:
        return "ring";
    }
  }
  return "treasure";
}

/**
 * Returns the icon to use. Return value must match an available icon filename.
 */
export function getIcon(artifact: Artifact): string {
  let t = "";
  switch (artifact.type) {
    case ARTIFACT_TYPES.WEAPON:
    case ARTIFACT_TYPES.MAGIC_WEAPON:
      switch (artifact.weapon_type) {
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

      if (artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON && artifact.weapon_type !== 4) {
        t = t + '2';
      }
      return t;
    case ARTIFACT_TYPES.WEARABLE:
      if (artifact.armor_type === ARMOR_TYPES.ARMOR) {
        return artifact.armor_class < 3 ? "leather" : "armor";
      } else {
        return getTypeName(artifact);
      }
    case ARTIFACT_TYPES.CONTAINER:
      return "backpack";
    case ARTIFACT_TYPES.GOLD:
      return "coin";
    case ARTIFACT_TYPES.READABLE:
      return "scroll";
    case ARTIFACT_TYPES.DRINKABLE:
      return "potion";
    default:
      return "tools";
  }
}

