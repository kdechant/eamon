import {Loadable} from "./loadable";

export class RoomExit extends Loadable {

  static EXIT = -999;
  static EXIT_SILENT = -998;  // same as regular exit, but without the "ride off into the sunset" message

  public direction: string;
  public room_to: number;
  public door_id: number;
  public effect_id: number;

  private directions: { [key: string]: string; } = {
    "n": "north",
    "ne": "northeast",
    "e": "east",
    "se": "southeast",
    "s": "south",
    "sw": "southwest",
    "w": "west",
    "nw": "northwest",
    "u": "up",
    "d": "down"
  };

}

export class Room extends Loadable {

  public id: number;
  public name: string;
  public description: string;
  public is_markdown: boolean;
  public exits: RoomExit[] = [];
  public seen = false;
  public visited_in_dark = false;
  public is_dark: boolean;
  public dark_name: string;
  public dark_description: string;
  public effect: number;
  public effect_inline: number;

  /**
   * A container for custom data used by specific adventures
   */
  public data: { [key: string]: any; } = {};

  /**
   * Loads data from JSON source into the object properties.
   * Override of parent method to handle RoomExit objects.
   * @param {Object} source an object, e.g., from JSON.
   */
  public init(source): void {
    for (const prop in source) {
      if (prop === "exits") {
        for (const i in source[prop]) {
          const ex = new RoomExit();
          ex.init(source[prop][i]);
          this.exits.push(ex);
        }
      } else {
        this[prop] = source[prop];
      }
    }
  }

}
