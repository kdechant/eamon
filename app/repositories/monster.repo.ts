import {Monster} from '../models/monster';
import {Game} from '../models/game';
import {Artifact} from '../models/artifact';

/**
 * Class MonsterRepository.
 * Storage class for all monster data.
 */
export class MonsterRepository {

  /**
   * An array of all the Monster objects
   */
  all: Monster[] = [];

  /**
   * A Monster object representing the player.
   */
  player: Monster;

  /**
   * An array of visible Monster objects
   */
  visible: Monster[] = [];

  /**
   * The highest ID in the system
   */
  index:number = 0;

  constructor(monster_data: Array<Object>) {
    for(var i in monster_data) {
      this.add(monster_data[i]);
    }
  }

  /**
   * Adds a monster.
   * @param number id
   */
  add(monster_data) {
    var m = new Monster();
    m.init(monster_data);

    // autonumber the ID if not provided
    if (m.id === undefined) {
      m.id = this.index + 1;
    }

    if (this.get(m.id) !== null) {
      console.log(this.get(m.id))
      throw new Error("Tried to create a monster #"+m.id+" but that ID is already taken.");
    }

    this.all.push(m);
    m.updateInventory();

    // add the dead body artifact
    var body = {
      'name': 'Dead ' + m.name,
      'description': "You see the dead " + m.name,
      'room': null,
      'weight': 100,
      'value': 0,
      'get_all': false,
    };
    var art:Artifact = Game.getInstance().artifacts.add(body);
    m.dead_body_id = art.id;

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
    this.player = new Monster();
    this.player.init(player_data);

    // player is always monster 0
    this.player.id = 0;
    this.player.room_id = 1;
    this.player.reaction = Monster.RX_FRIEND;
    this.player.spell_abilities_original = {
      'power': this.player.spell_abilities.power,
      'heal': this.player.spell_abilities.heal,
      'blast': this.player.spell_abilities.blast,
      'speed': this.player.spell_abilities.speed
    }
    this.all.push(this.player);

    // create new artifact objects for the weapons and armor the player brought
    for (var i in player_data.items) {
      var a:Artifact = player_data.items[i];
      if (a.is_armor) {
        a.weight = 10;
      } else {
        a.weight = 3;
      }
      a.description = 'You see your ' + a.name + '.';
      var art = Game.getInstance().artifacts.add(a);
      this.player.pickUp(art);
      if (art.is_armor || art.is_shield) {
        this.player.wear(art);
      }
    }

    // ready the player's best weapon
    this.player.readyBestWeapon();

    return this.player
  }

  /**
   * Gets a numbered monster.
   * @param number id
   * @return Monster
   */
  get(id) {
    for(var i in this.all) {
      if (this.all[i].id == id) {
        return this.all[i];
      }
    }
    return null;
  }

  /**
   * Gets a monster by name.
   * @param string name
   * @return Monster
   */
  getByName(name:string) {
    for(var i in this.all) {
      if (this.all[i].name.toLowerCase() == name.toLowerCase()) {
        return this.all[i];
      }
    }
  }


  /**
   * Updates the list of monsters in the current room, that are visible to the player
   * @return Monster[]
   */
  updateVisible() {
    var game = Game.getInstance()
    var monsters:Monster[] = [];
    game.in_battle = false;
    for(var i in this.all) {
      if (this.all[i].id != 0 && this.all[i].room_id == game.rooms.current_room.id) {
        // check monster reactions
        if (this.all[i].reaction == Monster.RX_UNKNOWN) {
          this.all[i].checkReaction();
        }
        if (this.all[i].reaction == Monster.RX_HOSTILE) {
          game.in_battle = true;
        }

        monsters.push(this.all[i]);
      }
    }
    this.visible = monsters;
  }

}
