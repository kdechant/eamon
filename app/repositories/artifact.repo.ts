import {Artifact} from '../models/artifact';
import {Game} from '../models/game';

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
  index:number = 0;

  constructor(artifact_data: Array<Object>) {
    for(var i in artifact_data) {
      this.add(artifact_data[i]);
    }
  }

  /**
   * Adds an artifact to the system.
   * @param object artifact_data
   */
  add(artifact_data) {
    var a = new Artifact();
    a.init(artifact_data);

    // autonumber the ID if not provided
    if (a.id === undefined) {
      a.id = this.index + 1;
    }

    if (this.get(a.id) !== null) {
      throw new Error("Tried to create an artifact #"+a.id+" but that ID is already taken.");
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
   * @param number id
   * @return Artifact
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
   * Gets an artifact by name.
   * @param string name
   * @return Artifact
   */
  getByName(name:string) {
    for(var i in this.all) {
      if (this.all[i].name.toLowerCase() == name.toLowerCase()) {
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
    var artifacts:Artifact[] = [];
    for(var i in this.all) {
      var a:Artifact = this.all[i];
      if (a.room_id == Game.getInstance().rooms.current_room.id && !a.embedded) {

        // if the artifact is an open container, build the list of contents
        if (a.is_container && a.is_open) {
          a.contents = [];
          for (var i in this.all) {
            if (this.all[i].container_id == a.id) {
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
    for (var i in this.all) {
      var a = this.all[i];
      if (a.is_light_source && a.is_lit) {
        if (a.room_id == Game.getInstance().rooms.current_room.id || a.monster_id == 0) {
          return true;
        }
      }
    }
    return false;
  }

}