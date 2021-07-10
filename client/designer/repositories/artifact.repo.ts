import Artifact from "../models/artifact";

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
   * The count of artifacts before player weapons/armor are added
   */
  initial_count = 0;

  /**
   * The highest ID in the system
   */
  index = 0;

  constructor(artifact_data: Array<Record<string, number|string>>) {
    for (const i in artifact_data) {
      this.add(artifact_data[i]);
    }
    this.initial_count = this.all.length;
  }

  /**
   * Adds an artifact to the system.
   * @param {Record} artifact_data
   */
  add(artifact_data: Record<string, number|string>): Artifact {
    const a = new Artifact();
    // "synonyms" in the back end are called "aliases" here
    if (artifact_data.synonyms) {
      // @ts-ignore
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
   * Gets a numbered artifact.
   * @param {number} id
   * @return Artifact
   */
  get(id: number|string): Artifact {
    if (typeof id === 'string') id = parseInt(id);
    const a = this.all.find(a => a.id === id);
    return a || null;
  }

}
