/**
 * GameObject class. Parent class for monsters and artifacts.
 */
export default interface GameObject {
  /**
   * The "id" is the database ID. Objects will only have a value for this if
   * they were saved to the DB (e.g., adventures, rooms, player artifacts)
   * (Artifacts created in the shop in the mail hall won't have this until they are saved.)
   */
  id: number;

  /**
   * The UUID is a temporary identifier used as a key for React elements.
   * It is not persisted to the database and doesn't need to be.
   */
  uuid: string;
  name: string;
  description: string;
}
