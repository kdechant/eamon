import {Artifact} from "../models/artifact";
import Game from "../models/game";
import {Monster} from "../models/monster";

/**
 * Class ArtifactRepository.
 * Storage class for all artifact data.
 */
export default class ArtifactRepository {

  /**
   * An array of all the Artifact objects
   */
  all: Artifact[] = [];

  /**
   * An array of visible Artifact objects in the current room (does not include embedded) - used for the list in the
   * status box
   */
  visible: Artifact[] = [];

  /**
   * An array of Artifact objects that are in the current room (includes embedded) - this should include things the
   * player can interact with.
   */
  inRoom: Artifact[] = [];

  /**
   * The count of artifacts before player weapons/armor are added
   */
  initial_count: number = 0;

  /**
   * The highest ID in the system
   */
  index: number = 0;

  constructor(artifact_data: Array<Object>) {
    for (let i in artifact_data) {
      this.add(artifact_data[i]);
    }
    this.initial_count = this.all.length;
  }

  /**
   * Adds an artifact to the system.
   * @param {object} artifact_data
   */
  add(artifact_data) {
    let a = new Artifact();
    // "synonyms" in the back end are called "aliases" here
    if (artifact_data.synonyms) {
      artifact_data.aliases = artifact_data.synonyms.split(",").map(s => s.trim());
    }
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
   * renames weapons and armor so the names aren't duplicates of player artifacts
   */
  deduplicate() {
    for (let item of this.all.filter(i => i.player_brought === true)) {
      for (let item2 of this.all.filter(i => i.player_brought === false && i.name.toLowerCase() === item.name.toLowerCase())) {
        item2.name += "#";
      }
    }
  }

  /**
   * Gets a numbered artifact.
   * @param {number} id
   * @return Artifact
   */
  get(id) {
    let a = this.all.find(a => a.id === id);
    return a || null;
  }

  /**
   * Gets an artifact by name. This does not take into account where the artifact is.
   * This is known to not work reliably if there are two artifacts with the same name or alias.
   * @param {string} name
   * @return Artifact
   */
  getByName(name: string) {
    let a = this.all.find(a => a.match(name));
    return a || null;
  }

  /**
   * Gets an artifact in the local area (current room or player inventory) by name.
   * @param {string} name
   * @param {boolean} reveal_embedded Whether to automatically reveal any embedded artifacts matched by this method.
   * Default true.
   * @return Artifact
   */
  getLocalByName(name: string, reveal_embedded: boolean = true) {
    // fixme: should this only return the first match? or all matches?
    // try exact match first, then fuzzy match
    let art = this.all.find(a => a.isHere() && a.name === name);
    if (typeof art === 'undefined') {
      art = this.all.find(a => a.isHere() && a.match(name));
    }

    if (typeof art === 'undefined') {
      return null;
    } else {
      if (art.embedded && reveal_embedded) art.reveal();
      return art;
    }
  }

  /**
   * Updates the list of artifacts in the current room, that are visible to the player
   * @return Artifact[]
   */
  updateVisible() {
    let visible: Artifact[] = [];
    let inRoom: Artifact[] = [];
    for (let a of this.all.filter(a => a.room_id === Game.getInstance().rooms.current_room.id)) {
      a.updateContents();
      inRoom.push(a);
      if (!a.embedded) {
        visible.push(a);
      }
    }
    this.visible = visible;
    this.inRoom = inRoom;
  }

  /**
   * Checks to see if there is a light source lit
   * @return boolean
   */
  isLightSource() {
    if (this.all.some(a => Artifact.TYPE_LIGHT_SOURCE && a.is_lit && a.isHere())) {
      return true;
    }
    return false;
  }

  /**
   * Serializes the repo to JSON, without some unnecessary deep-copy data like artifact contents
   */
  public serialize() {
    let data = JSON.parse(JSON.stringify(this.all));
    for (let a of data) {
      // calculated properties don't need to be serialized
      delete a.contents;
      // some properties are only used in the main hall
      delete a.message;
      delete a.messageState;
      delete a.salePending;
      // unused stuff that can be removed later
      delete a.markings;
      delete a.markings_index;
    }
    return data;
  }

}
