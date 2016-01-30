import {GameObject} from './game-object';
import {Game} from './game';

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
  weight: number;
  value: number;
  fixed_value: boolean;
  is_container: boolean;
  is_open: boolean;
  is_weapon: boolean;
  is_standard_weapon: boolean;
  weapon_type: number;
  weapon_odds: number;
  dice: number;
  sides: number;
  get_all: boolean;
  embedded: boolean;
  is_edible: boolean;
  is_drinkable: boolean;
  quantity: number;

  // game-state properties
  seen: boolean = false;

  /**
   * Moves the artifact to a specific room.
   */
  moveToRoom(room_id) {
    this.room_id = room_id;
  }

  /**
   * Removes an artifact from a container and
   * places it in the room where the container is.
   */
  removeArtifact(artifact_id) {
    // under construction
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
    // the real logic for this is done in an event handler defined in the adventure.
    Game.getInstance().triggerEvent('use', this);

    if (this.is_edible || this.is_drinkable) {
      this.quantity--;
    }
  }

}
