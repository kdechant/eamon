import {Injectable} from 'angular2/core';

import {RoomService} from '../services/room.service';
import {Artifact} from '../models/artifact';

import {ARTIFACTS} from '../mock-data/artifacts';

/**
 * History service. Provides a container for all the history entries.
 */
@Injectable()
export class ArtifactService {
  /**
   * An array of all the Artifact objects
   */
  artifacts: Artifact[] = [];
  
  /**
   * An array of visible Artifact objects
   */
  visible: Artifact[] = [];
  
  /**
   * Constructor. Loads artifact data and places the player into the first artifact.
   */
  constructor(private _roomService:RoomService) {
    
    // load the artifact data.
    // TODO: Using mock data here. Replace with an API call.
    Promise.resolve(ARTIFACTS).then(artifact_data => {
      for(var i in artifact_data) {
        var a = new Artifact(artifact_data[i])
        this.artifacts.push(a);
      }
    });
    
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
      if (this.artifacts[i].room_id == this._roomService.current_room.id) {
        artifacts.push(this.artifacts[i]);
      }
    }
    this.visible = artifacts;
  }
  
}
