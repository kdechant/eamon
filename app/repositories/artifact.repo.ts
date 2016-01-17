import {Artifact} from '../models/artifact';
import {GameData} from '../models/game-data';

/**
 * Class ArtifactRepository.
 * Storage class for all artifact data.
 */
export class ArtifactRepository {
  
  /**
   * An array of all the Artifact objects
   */
  artifacts: Artifact[] = [];

  /**
   * A reference to the parent GameData object
   */
  game: GameData;

  /**
   * An array of visible Artifact objects
   */
  visible: Artifact[] = [];
    
  constructor(artifact_data: Array<Object>, game_data: GameData) {
    this.game = game_data;
    
    for(var i in artifact_data) {
      var a = new Artifact(artifact_data[i])
      this.artifacts.push(a);
    }
  }
  
  /**
   * Gets a numbered artifact.
   * @param number id
   * @return Artifact
   */
  get(id) {
    for(var i in this.artifacts) {
      if (this.artifacts[i].id == id) {
        return this.artifacts[i];
      }
    }
  }
            
  /**
   * Updates the list of artifacts in the current room, that are visible to the player
   * @return Artifact[]
   */
  updateVisible() {
    var artifacts:Artifact[] = [];
    for(var i in this.artifacts) {
      if (this.artifacts[i].room_id == this.game.rooms.current_room.id) {
        artifacts.push(this.artifacts[i]);
      }
    }
    this.visible = artifacts;
  }
  
}