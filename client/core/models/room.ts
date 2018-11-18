import {Loadable} from "./loadable";
import Game from "./game";

export class RoomExit extends Loadable {

  static EXIT: number = -999;
  static EXIT_SILENT: number = -998;  // same as regular exit, but without the "ride off into the sunset" message

  public direction: string;
  public room_to: number;
  public door_id: number;
  public open: number;
  public message: string;

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
    "d:": "down"
  };

  /**
   * Check for locked exits.
   * @returns boolean
   *   True if the exit has no door, or if the door is visible and open.
   *   False if there is a closed door or a hidden embedded door like an undiscovered secret door.
   */
  public isOpen(): boolean {
    if (this.door_id) {
      let door = Game.getInstance().artifacts.get(this.door_id);
      return door.is_open && !door.hidden;
    } else {
      // no door
      return true;
    }
  }

  public getFriendlyDirection(): string {
    if (this.directions.hasOwnProperty(this.direction)) {
      return this.directions[this.direction];
    }
    return this.direction;
  }

}

export class Room extends Loadable {

  public id: number;
  public name: string;
  public description: string;
  public exits: RoomExit[] = [];
  public seen: boolean = false;
  public is_dark: boolean;
  public effect: number;
  public effect_inline: number;

  /**
   * Loads data from JSON source into the object properties.
   * Override of parent method to handle RoomExit objects.
   * @param Object source an object, e.g., from JSON.
   */
  public init(source): void {
    for (let prop in source) {
      if (prop === "exits") {
        for (let i in source[prop]) {
          let ex = new RoomExit();
          ex.init(source[prop][i]);
          this.exits.push(ex);
        }
      } else {
        this[prop] = source[prop];
      }
    }
  }

  /**
   * Shows the room description and any built-in effects.
   */
  public show_description() {
    let game = Game.getInstance();
    game.history.write(this.description);
    if (this.effect !== null) {
      game.effects.print(this.effect);
    }
    if (this.effect_inline !== null) {
      game.effects.print(this.effect_inline, null, true);
    }
  }


  /**
   * Gets the exit from the room in a given direction
   */
  public getExit(direction: string): RoomExit {
    for (let i in this.exits) {
      if (this.exits[i].direction === direction) {
        return this.exits[i];
      }
    }
    return null;
  }

  /**
   * Creates a new exit from the room in a given direction
   */
  public addExit(exit: RoomExit): void {
    this.exits.push(exit);
  }

  /**
   * Determines whether a given word is in the room name or description
   */
  public textMatch(str: string): boolean {
    str = str.toLowerCase();
    let name = this.name.toLowerCase();
    let desc = this.description.toLowerCase();
    return (name.indexOf(str) !== -1 || desc.indexOf(str) !== -1);
  }
}
