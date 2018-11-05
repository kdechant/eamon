/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export class GameObject {

  id: number;
  name: string;
  description: string;

  /**
   * Loads data from JSON source into the object properties.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    for (let prop in source) {
      this[prop] = source[prop];
    }
  }

}
