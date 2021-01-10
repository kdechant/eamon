import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// NOTE: nothing special here. This adventure runs on the base code.
declare let game: Game;

export var event_handlers = {

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    game.history.write("You hear a loud sonic boom which echoes all around you!");
  },

}; // end event handlers
