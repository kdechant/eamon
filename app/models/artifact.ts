import {GameObject} from './game-object';
import {Game} from './game';
import {Monster} from './monster';
import {CommandException} from '../utils/command.exception';

/**
 * Artifact class. Represents all properties of a single artifact
 */
export class Artifact extends GameObject {
  // data properties
  id: number;
  name: string;
  description: string;
  room_id:number; // if on the ground, which room
  monster_id:number; // if in inventory, who is carrying it
  container_id:number; // if inside a container, the artifact id of the container
  weight: number;
  value: number;
  fixed_value: boolean;
  is_container: boolean;
  is_open: boolean;
  is_healing: boolean; // for simple healing potions, etc. - healing amount based on dice and sides
  is_weapon: boolean;
  is_standard_weapon: boolean;
  hands: number;  // 1 or 2 = one-handed or two-handed weapon
  weapon_type: number;
  weapon_odds: number;
  dice: number;
  sides: number;
  is_wearable: boolean;
  is_armor: boolean;
  is_shield: boolean;
  armor_strength: number;
  armor_penalty: number; // the amount of armor expertise needed to avoid to-hit penalty
  get_all: boolean;
  embedded: boolean;
  is_edible: boolean;
  is_drinkable: boolean;
  is_light_source: boolean;
  quantity: number;
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
  moveToRoom(room_id) {
    this.room_id = room_id;
  }

  /**
   * Determines whether an artifact is available to the player right now.
   * Artifacts are available if the player is carrying them or if they are in
   * the current room.
   * @returns boolean
   */
  isHere():boolean {
    return (this.room_id == Game.getInstance().rooms.current_room.id || this.monster_id == Monster.PLAYER)
  }

  /**
   * Gets the Artifact object for an artifact inside the container
   */
  getContainedArtifact(name:string) {
    for (var i in this.contents) {
      if (this.contents[i].name.toLowerCase() == name.toLowerCase()) {
        return this.contents[i];
      }
    }
  }

  /**
   * Removes an artifact from a container and
   * places it in the room where the container is.
   */
  removeFromContainer() {
    var game = Game.getInstance();
    var container: Artifact = game.artifacts.get(this.container_id);
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
  maxDamage() {
    if (this.is_weapon) {
      return this.dice * this.sides;
    } else {
      return 0;
    }
  }

  /**
   * Use an item, eat food, drink a potion, etc.
   */
  use() {
    var game = Game.getInstance();

    // logic for simple healing potions, healing by eating food, etc.
    if (this.is_healing) {
      var heal_amount = game.diceRoll(this.dice,this.sides);

      // Healing items affect the monster that's carrying the item. If it's in the room, it affects the player.
      var owner = game.monsters.get(this.monster_id);
      if (owner) {
        game.history.write("It heals " + owner.name + " " + heal_amount + " hit points.")
      } else {
        owner = game.monsters.player;
        game.history.write("It heals you " + heal_amount + " hit points.")
      }
      owner.heal(heal_amount);
    }

    // the real logic for this is done in an event handler defined in the adventure.
    game.triggerEvent('use', this);

    // reduce quantity/number of charges remaining
    if (this.quantity > 0) {
      this.quantity--;
    }
  }

  /**
   * Returns the name of the weapon type
   */
  getWeaponTypeName() {
    switch (this.weapon_type) {
      case 1:
        return 'axe';
        break;
      case 2:
        return 'bow';
        break;
      case 3:
        return 'club';
        break;
      case 4:
        return 'spear';
        break;
      case 5:
        return 'sword';
        break;
    }
  }

}
