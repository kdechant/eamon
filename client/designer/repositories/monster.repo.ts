import Monster from "../models/monster";

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
   * The highest ID in the system
   */
  index = 0;

  constructor(monster_data: Array<Record<string, number|string>>) {
    monster_data.forEach((m) => {
      this.add(m);
    });
  }

  /**
   * Adds a monster.
   * @param {Object} monster_data
   */
  public add(monster_data: Record<string, number|string|string[]>): Monster {
    // autonumber the ID if not provided
    if (monster_data.id === undefined) {
      monster_data.id = this.index + 1;
    }

    // error if there is an ID conflict
    // @ts-ignore
    if (this.get(monster_data.id) !== null) {
    // @ts-ignore
      console.log(this.get(monster_data.id));
      throw new Error("Tried to create a monster #" + monster_data.id + " but that ID is already taken.");
    }

    const m = new Monster();
    // "synonyms" in the back end are called "aliases" here
    if (monster_data.synonyms) {
      // @ts-ignore
      monster_data.aliases = monster_data.synonyms.split(",");
    }
    if (typeof monster_data.combat_verbs === 'string') {
      if (monster_data.combat_verbs) {
        monster_data.combat_verbs = monster_data.combat_verbs.split(",").map(v => v.trim());
      } else {
        monster_data.combat_verbs = [];
      }
    }
    m.init(monster_data);

    this.all.push(m);

    // move the weapon into the monster's inventory
    // if (m.weapon_id && m.weapon_id > 0) {
    //   game.artifacts.get(m.weapon_id).monster_id = m.id;
    //   game.artifacts.get(m.weapon_id).room_id = null;
    // }

    // update the autonumber index
    this.index = Math.max(Math.floor(m.id), this.index);
    return m;
  }

  /**
   * Gets a numbered monster.
   * @param {number} id
   * @return Monster
   */
  public get(id: number|string): Monster {
    if (typeof id === 'string') id = parseInt(id);
    const m = this.all.find(x => x.id === id);
    return m || null;
  }

}
