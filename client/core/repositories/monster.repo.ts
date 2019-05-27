import { Monster, GroupMonster } from "../models/monster";
import Game from "../models/game";

/**
 * Class MonsterRepository.
 * Storage class for all monster data.
 */
export default class MonsterRepository {

  /**
   * An array of all the Monster objects
   */
  all: Monster[] = [];

  /**
   * An array of visible Monster objects
   */
  visible: Monster[] = [];

  /**
   * The highest ID in the system
   */
  index: number = 0;

  constructor(monster_data: Array<Object>, restoring_save: boolean = false) {
    monster_data.forEach((m: any) => {
      let monster = this.add(m);

      // unpack group monsters
      // TODO: move this to the GroupMonster class?
      if (m.count > 1 && !restoring_save) {
        for (let i=1; i <= m.count; i++) {
          // Group monsters can have artifacts as weapons. In this case, the weapon ID in the database represents the
          // first individual's weapon, with subsequent artifacts being used by subsequent individuals.
          // e.g., if the weapon_id in the DB is 11, the first individual gets weapon #11, the second gets weapon #12, etc.
          let weapon_id = m.weapon_id;
          if (weapon_id > 0) {
            weapon_id += i - 1;
          }
          // There is one Monster object for each child monster, with an ID that's based on the group's id.
          // The monster will be part of the group, but each individual maintains its own location, damage, and weapon id
          let child = this.add({
            ...m,
            id: monster.id + 0.0001 * i,   // this can handle groups up to 9999 members
            parent: monster,
            description: "",  // just to save memory
            count: 1,
            weapon_id
          });
          monster.children.push(child);
        }
      }
    });

    if (restoring_save) {
      // repair the parent-child relationships for group monsters
      this.all.filter(m => m.id !== Math.floor(m.id)).forEach(m => {
        m.parent = this.get(Math.floor(m.id));
        m.parent.children.push(m);
      });
    }
  }

  /**
   * Adds a monster.
   * @param {Object} monster_data
   */
  public add(monster_data): Monster {
    let game = Game.getInstance();

    // autonumber the ID if not provided
    if (monster_data.id === undefined) {
      monster_data.id = this.index + 1;
    }

    // error if there is an ID conflict
    if (this.get(monster_data.id) !== null) {
      console.log(this.get(monster_data.id));
      throw new Error("Tried to create a monster #" + monster_data.id + " but that ID is already taken.");
    }

    let m = monster_data.count > 1 ? new GroupMonster() : new Monster();
    // "synonyms" in the back end are called "aliases" here
    if (monster_data.synonyms) {
      monster_data.aliases = monster_data.synonyms.split(",");
    }
    m.init(monster_data);

    this.all.push(m);

    // move the weapon into the monster's inventory
    if (m.weapon_id && m.weapon_id > 0) {
      game.artifacts.get(m.weapon_id).monster_id = m.id;
      game.artifacts.get(m.weapon_id).room_id = null;
    }

    m.updateInventory();
    if (!m.parent) {
      m.readyBestWeapon(); // this initializes the monster.weapon object, to show the correct combat verbs
      // group monsters skip this step. they must use the exact weapon ID in the database
    }

    // add the dead body artifact
    if (game.dead_body_id) {
      m.dead_body_id = game.dead_body_id + Math.floor(m.id) - 1;
    }

    // update the autonumber index
    this.index = Math.max(Math.floor(m.id), this.index);
    return m;
  }

  /**
   * Adds the player to the game. Player has more data than the regular monsters.
   * @param {Object} player_data
   */
  public addPlayer(player_data: any) {
    let game = Game.getInstance();

    // the player JS model expects spell and weapon abilities to be objects, but they are stored
    // as regular fields on the Player Django model. Convert them to objects here.
    player_data.weapon_abilities = {
      1: player_data.wpn_axe,
      2: player_data.wpn_bow,
      3: player_data.wpn_club,
      4: player_data.wpn_spear,
      5: player_data.wpn_sword
    };
    player_data.spell_abilities = {
      "power": player_data.spl_power,
      "heal": player_data.spl_heal,
      "blast": player_data.spl_blast,
      "speed": player_data.spl_speed
    };

    game.player = new Monster();
    game.player.init(player_data);

    // player is always monster 0
    game.player.id = 0;
    game.player.room_id = 1;
    game.player.reaction = Monster.RX_FRIEND;
    game.player.spell_abilities_original = {
      "power": game.player.spell_abilities.power,
      "heal": game.player.spell_abilities.heal,
      "blast": game.player.spell_abilities.blast,
      "speed": game.player.spell_abilities.speed
    };
    game.player.spell_counters = { 'speed': 0 };
    // Player has a base to-hit of 25% (in addition to weapon ability)
    // Why? Because the Classic Eamon 4.0-6.0 formula didn't account for defender's agility, and thus the
    // starting weapon abilities for a new player were set too low. Adding 25% to account for this.
    game.player.attack_odds = 25;
    game.player.defense_bonus = 0;
    this.all.push(game.player);

    // create new artifact objects for the weapons and armor the player brought
    for (let a of player_data.inventory) {
      a.seen = true;
      a.player_brought = true;
      let art = game.artifacts.add(a);
      game.player.pickUp(art);
    }

    // ready the player's best weapon, armor, and shield
    game.player.readyBestWeapon();
    game.player.wearBestArmor();

    return game.player;
  }

  /**
   * Gets a numbered monster.
   * @param {number} id
   * @return Monster|GroupMonster
   */
  public get(id) {
    // @ts-ignore
    let m = this.all.find(x => x.id === id);
    return m || null;
  }

  /**
   * Gets a monster by name.
   * @param {string} name
   * @return Monster
   */
  public getByName(name: string) {
    // @ts-ignore
    let m = this.all.find(x => x.match(name));
    return m || null;
  }

  /**
   * Gets an artifact in the local area (current room) by name.
   * @param {string} name
   * @return Monster
   */
  getLocalByName(name: string) {
    // @ts-ignore
    let mon = this.all.find(m => m.isHere() && !m.parent && m.match(name));
    return mon || null;
  }

  /**
   * Gets a list of all monsters in a given room
   * @param {number} room_id The ID of the room
   * @return Monster[]
   */
  getByRoom(room_id: number) {
    return this.all.filter(x => x.room_id === room_id);
  }

  /**
   * Gets a random monster.
   * @param {boolean} include_player
   *   Whether or not to include the player in the random selection (default false)
   * @return Monster
   */
  public getRandom(include_player: boolean = false) {
    let mons = this.all.filter(x => x.id !== Monster.PLAYER || include_player);
    return mons[Game.getInstance().diceRoll(1, mons.length) - 1];
  }

  /**
   * Updates the list of monsters in the current room, that are visible to the player
   * @return Monster[]
   */
  public updateVisible() {
    let game = Game.getInstance();

    // handle the virtual group monster pointers (this is a no-op for single monsters)
    this.all.forEach(m => m.updateVirtualMonster());

    let monsters: Monster[] = this.all.filter(x => x.id !== Monster.PLAYER && x.room_id === game.player.room_id && !x.parent);
    game.in_battle = false;
    for (let m of monsters) {
      // check monster reactions
      if (m.reaction === Monster.RX_UNKNOWN) {
        m.checkReaction();
      }
      if (m.reaction === Monster.RX_HOSTILE) {
        game.in_battle = true;
      }
    }
    this.visible = monsters;
  }

  /**
   * Serializes the repo to JSON, without some unnecessary deep-copy data like monster inventories
   */
  public serialize() {
    return JSON.parse(JSON.stringify(this.all, serializeFilter));
  }

}

/**
 * Filters out some calculated properties that don't need to be serialized
 * @param key
 * @param value
 */
const serializeFilter = (key, value) => {
  // the filtering only applies when we serialize a Monster object, not to others
  // using duck typing to tell if it's a monster because "typeof foo" only returns "object", not the class name
  if (value && value.hasOwnProperty('agility')) {
    // clone the object with only some props (using destructuring to discard the others)
    const {inventory, parent, children, weapon, saved_games, weight_carried, profit, ...m} = value;
    return m;
  } else {
    // array or some other object that's not a Monster
    return value;
  }
};
