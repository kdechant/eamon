import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  // NOTE: This adventure has no special event handlers (except POWER).
  // This adventure is meant as a test of the core logic.

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 75) {
      game.history.write('A fortune cookie appears in mid-air and explodes! The smoking paper left behind reads, "YOU SUDDENLY FIND YOU CANNOT CARRY ALL OF THE ITEMS YOU ARE CARRYING, AND THEY FALL TO THE GROUND." How strange...');
    } else {
      game.history.write('A fortune cookie appears in mid-air and explodes! The smoking paper left behind reads, "THE SECTION OF THE TUNNEL YOU ARE IN COLLAPSES AND YOU DIE." How strange...');
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
