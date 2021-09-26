export class BaseRepository {

  /**
   * An array of all the Artifact objects
   */
  all: any[];

  /**
   * Gets the array index of a numbered artifact.
   * @param {number} id
   * @return number
   */
  getIndex(id: number | string): number {
    if (typeof id === 'string') id = parseInt(id);
    return this.all.findIndex(x => x.id === id);
  }

  /**
   * Gets the index of the previous object in the repository. Can
   * handle sparse numbering.
   *
   * @param {number} id
   * @return number
   */
  getPrev(id: number | string): number {
    if (typeof id === 'string') id = parseInt(id);
    const ids = this.all
      .filter(a => a.id < id)
      .map(a => a.id)
      .sort((a, b) => b - a);  // `b - a` sorts in reverse order
    return ids.length ? ids[0] : null;
  }

  /**
   * Gets the index of the next object in the repository. Can
   * handle sparse numbering.
   *
   * @param {number} id
   * @return number
   */
  getNext(id: number | string): number {
    if (typeof id === 'string') id = parseInt(id);
    const ids = this.all
      .filter(a => a.id > id)
      .map(a => a.id)
      .sort((a, b) => a - b);
    return ids.length ? ids[0] : null;
  }
}
