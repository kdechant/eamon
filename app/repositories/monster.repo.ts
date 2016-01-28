import {Monster} from '../models/monster';
import {Game} from '../models/game';

/**
 * Class MonsterRepository.
 * Storage class for all monster data.
 */
export class MonsterRepository {

  /**
   * An array of all the Monster objects
   */
  monsters: Monster[] = [];

  /**
   * A Monster object representing the player.
   */
  player: Monster;

  /**
   * A reference to the parent Game object
   */
  game: Game;

  /**
   * An array of visible Monster objects
   */
  visible: Monster[] = [];

  /**
   * The highest ID in the system
   */
  index:number = 0;

  constructor(monster_data: Array<Object>, game: Game) {
    this.game = game;
    for(var i in monster_data) {
      this.add(monster_data[i]);
    }
  }

  /**
   * Adds a monster.
   * @param number id
   */
  add(monster_data) {
    var m = new Monster(this.game);
    m.init(monster_data);

    // autonumber the ID if not provided
    if (m.id === undefined) {
      m.id = this.index + 1;
    }

    if (this.get(m.id) !== undefined) {
      throw new Error("Tried to create a monster #"+m.id+" but that ID is already taken.");
    }

    m.game = this.game;

    this.monsters.push(m);

    // update the autonumber index
    if (m.id > this.index) {
      this.index = m.id;
    }
    return m;
  }

  /**
   * Adds the player to the game. Player has more data than the regular monsters.
   * @param
   */
  addPlayer(player_data) {
    this.player = new Monster(this.game);
    this.player.init(player_data);

    // player is always monster 0
    this.player.id = 0;
    this.player.room_id = 1;
    this.monsters.push(this.player);

    // create new artifact objects for the weapons the player brought
    var wpns = player_data.weapons;
    for (var w in wpns) {
      var a = wpns[w];
      a.weight = 3;
      var art = this.game.artifacts.add(a);
      this.game.monsters.player.pickUp(art);
    }

    // ready the player's best weapon
    this.game.monsters.player.readyBestWeapon();

    return this.player
  }

  /**
   * Gets a numbered monster.
   * @param number id
   * @return Monster
   */
  get(id) {
    for(var i in this.monsters) {
      if (this.monsters[i].id == id) {
        return this.monsters[i];
      }
    }
  }

  /**
   * Updates the list of monsters in the current room, that are visible to the player
   * @return Monster[]
   */
  updateVisible() {
    var monsters:Monster[] = [];
    for(var i in this.monsters) {
      if (this.monsters[i].id != 0 && this.monsters[i].room_id == this.game.rooms.current_room.id) {
        if (this.monsters[i].reaction == Monster.RX_UNKNOWN) {
          this.monsters[i].checkReaction();
        }
        monsters.push(this.monsters[i]);
      }
    }
    this.visible = monsters;
  }

}
