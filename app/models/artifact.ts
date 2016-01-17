import {Loadable} from './loadable';

/**
 * Artifact class. Represents all properties of a single artifact
 */
export class Artifact extends Loadable {
  // data properties
  id: number;
  name: string;
  description: string;
  room_id: number; // if on the ground, which room
  monster_id: number; // if in inventory, who is carrying it
  weight: number;
  value: number = 0;
  fixed_value: boolean = false;
  is_container: boolean = false;
  is_open: boolean = false;
  is_weapon: boolean = false;
  is_standard_weapon: boolean = false;
  weapon_type: number;
  weapon_odds: number;
  weapon_dice: number;
  weapon_sides: number;
  get_all: boolean = true;
  embedded: boolean = false;
  
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

}
