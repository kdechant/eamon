import {Monster} from '../models/monster';
import {GameData} from '../models/game-data';

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
   * A reference to the parent GameData object
   */
  game: GameData;

  /**
   * An array of visible Monster objects
   */
  visible: Monster[] = [];
    
  constructor(monster_data: Array<Object>, game_data: GameData) {
    this.game = game_data;
    for(var i in monster_data) {
      var a = new Monster(monster_data[i])
      this.monsters.push(a);
    }
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
      if (this.monsters[i].room_id == this.game.rooms.current_room.id) {
        monsters.push(this.monsters[i]);
      }
    }
    this.visible = monsters;
  }
  
}