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
   * A reference to the parent Game object
   */
  game: Game;

  /**
   * An array of visible Artifact objects
   */
  visible: Artifact[] = [];

  /**
   * The highest ID in the system
   */
  index:number = 0;

  constructor(artifact_data: Array<Object>, game: Game) {
    this.game = game;

    for(var i in artifact_data) {
      this.add(artifact_data[i]);
    }
  }

  /**
   * Adds an artifact to the system.
   * @param object artifact_data
   */
  add(artifact_data) {
    var a = new Artifact(this.game);
    a.init(artifact_data);

    // autonumber the ID if not provided
    if (a.id === undefined) {
      a.id = this.index + 1;
    }

    if (this.get(a.id) !== undefined) {
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
  }

  /**
   * Updates the list of artifacts in the current room, that are visible to the player
   * @return Artifact[]
   */
  updateVisible() {
    var artifacts:Artifact[] = [];
    for(var i in this.all) {
      if (this.all[i].room_id == this.game.rooms.current_room.id) {
        artifacts.push(this.all[i]);
      }
    }
    this.visible = artifacts;
  }

}