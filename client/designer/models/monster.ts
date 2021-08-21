import GameObject from "../models/game-object";

/**
 * Monster class. Represents all properties of a single monster
 */
export default class Monster extends GameObject {

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
  article: string;
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

  constructor (){
    super();
  }

  /**
   * Calculates the maximum weight the monster can carry
   * @return number
   */
  public maxWeight(): number {
    return this.hardiness * 10;
  }

  public getFriendlinessDisplay(): string {
    switch (this.friendliness) {
      case Monster.FRIEND_ALWAYS:
        return "Always Friendly";
      case Monster.FRIEND_NEUTRAL:
        return "Always Neutral";
      case Monster.FRIEND_NEVER:
        return "Always Hostile";
      case Monster.FRIEND_RANDOM:
        return "Random Friendliness";
    }
  }

  public getCombatCodeDisplay(): string {
    switch (this.combat_code) {
      case Monster.COMBAT_CODE_SPECIAL:
        return "Attacks with generic 'Attacks' message";
      case Monster.COMBAT_CODE_NORMAL:
        return "Attacks only if it has a weapon, or if natural weapons are specified.";
      case Monster.COMBAT_CODE_WEAPON_IF_AVAILABLE:
        return "Uses a weapon if carrying one. Otherwise falls back to natural weapons.";
      case Monster.COMBAT_CODE_NEVER_FIGHT:
        return "Never fights.";
    }
  }
}