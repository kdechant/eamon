import {Loadable} from "./loadable";
import Game from "./game";

export class RoomExit extends Loadable {

  static EXIT: number = -999;
  static EXIT_SILENT: number = -998;  // same as regular exit, but without the "ride off into the sunset" message

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
  public is_markdown: boolean;
  public exits: RoomExit[] = [];
  public seen: boolean = false;
  public visited_in_dark: boolean = false;
  public is_dark: boolean;
  public dark_name: string;
  public dark_description: string;
  public effect: number;
  public effect_inline: number;

  /**
   * Loads data from JSON source into the object properties.
   * Override of parent method to handle RoomExit objects.
   * @param {Object} source an object, e.g., from JSON.
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
    game.history.write(this.description,"normal", this.is_markdown);
    if (this.effect != null) {
      game.effects.print(this.effect);
    }
    if (this.effect_inline != null) {
      game.effects.print(this.effect_inline, null, true);
    }
  }

  /**
   * Shows the dark version of the room description (used when there isn't a light source).
   */
  public show_dark_description() {
    let game = Game.getInstance();
    game.history.write(this.dark_description, "normal", this.is_markdown);
  }

  /**
   * Gets the exit from the room in a given direction
   */
  public getVisibleExits(): RoomExit[] {
    let game = Game.getInstance();
    return this.exits.filter(r =>
      !r.door_id || !game.artifacts.get(r.door_id).hidden
    );
  }

  /**
   * Gets the exit from the room in a given direction
   */
  public getExit(direction: string): RoomExit {
    for (let i in this.exits) {
      // FIXME: this will only work with 'e' not 'east', etc.
      if (this.exits[i].direction === direction) {
        return this.exits[i];
      }
    }
    return null;
  }

  /**
   * Returns the open exits from the room (used, e.g., when fleeing).
   * Excludes any locked/hidden exits and the game exit.
   */
  public getGoodExits(): RoomExit[] {
    return this.exits.filter(x => x.room_to !== RoomExit.EXIT && x.room_to > 0 && x.isOpen());
  }

  /**
   * Determines whether the room has a good exit (used, e.g., when fleeing)
   * Excludes any locked/hidden exits and the game exit.
   */
  public hasGoodExits(): boolean {
    const exits = this.getGoodExits();
    return exits.length > 0;
  }

  /**
   * Monster flees out a random exit
   */
  public chooseRandomExit(): RoomExit {
    let game = Game.getInstance();

    // choose a random exit
    let good_exits: RoomExit[] = this.getGoodExits();
    if (good_exits.length === 0) {
      return null;
    } else {
      return good_exits[game.diceRoll(1, good_exits.length) - 1];
    }
  }

  /**
   * Creates a new exit from the room in a given direction
   */
  public addExit(exit: RoomExit): void {
    this.exits.push(exit);
  }

  /**
   * Creates a new exit from the room in a given direction (shorthand version)
   */
  public createExit(direction: string, room_to: number, door_id: number = null): void {
    let new_exit = new RoomExit();
    new_exit.direction = direction;
    new_exit.room_to = room_to;
    new_exit.door_id = door_id;
    this.exits.push(new_exit);
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
