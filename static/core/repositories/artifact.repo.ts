import {Artifact} from "../models/artifact";
import {Game} from "../models/game";

/**
 * Class ArtifactRepository.
 * Storage class for all artifact data.
 */
export class ArtifactRepository {

  /**
   * An array of all the Artifact objects
   */
  all: Artifact[] = [];

  /**
   * An array of visible Artifact objects
   */
  visible: Artifact[] = [];

  /**
   * The highest ID in the system
   */
  index: number = 0;

  constructor(artifact_data: Array<Object>) {
    for (let i in artifact_data) {
      this.add(artifact_data[i]);
    }
  }

  /**
   * Adds an artifact to the system.
   * @param {object} artifact_data
   */
  add(artifact_data) {
    let a = new Artifact();
    a.init(artifact_data);

    // autonumber the ID if not provided
    if (a.id === undefined) {
      a.id = this.index + 1;
    }

    if (this.get(a.id) !== null) {
      throw new Error("Tried to create an artifact #" + a.id + " but that ID is already taken.");
    }

    // set some flags based on the artifact type - for compatibility with EDX artifact types
    if ((a.type === Artifact.TYPE_DRINKABLE || a.type === Artifact.TYPE_EDIBLE) && a.dice > 0 && a.sides > 0) {
        a.is_healing = true;
    }
    if (a.type === Artifact.TYPE_WEAPON || a.type === Artifact.TYPE_MAGIC_WEAPON) {
        a.is_weapon = true;
    }
    if (a.type === Artifact.TYPE_WEARABLE) {
        a.is_wearable = true;
    }

    this.all.push(a);

    // update the autonumber index
    if (a.id > this.index) {
      this.index = a.id;
    }
    return a;
  }

  /**
   * Gets a numbered artifact.
   * @param {number} id
   * @return Artifact
   */
  get(id) {
    for (let i in this.all) {
      if (this.all[i].id === id) {
        return this.all[i];
      }
    }
    return null;
  }

  /**
   * Gets an artifact by name.
   * @param {string} name
   * @return Artifact
   */
  getByName(name: string) {
    for (let i in this.all) {
      if (this.all[i].match(name)) {
        return this.all[i];
      }
    }
    return null;
  }

  /**
   * Updates the list of artifacts in the current room, that are visible to the player
   * @return Artifact[]
   */
  updateVisible() {
    let artifacts: Artifact[] = [];
    for (let i in this.all) {
      let a: Artifact = this.all[i];
      if (a.room_id === Game.getInstance().rooms.current_room.id && !a.embedded) {

        // if the artifact is an open container, build the list of contents
        if (a.type == Artifact.TYPE_CONTAINER && a.is_open) {
          a.contents = [];
          for (let i in this.all) {
            if (this.all[i].container_id === a.id) {
              a.contents.push(this.all[i]);
            }
          }
        }

        artifacts.push(a);
      }
    }
    this.visible = artifacts;
  }

  /**
   * Checks to see if there is a light source lit
   * @return boolean
   */
  isLightSource() {
    for (let i in this.all) {
      let a = this.all[i];
      if (a.type === Artifact.TYPE_LIGHT_SOURCE && a.is_lit) {
        if (a.room_id === Game.getInstance().rooms.current_room.id || a.monster_id === 0) {
          return true;
        }
      }
    }
    return false;
  }

}
