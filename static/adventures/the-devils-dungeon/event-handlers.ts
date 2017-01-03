import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // add your custom game start code here

    game.modal.show("How much do you give him?", function(value) {

      // prevent user mischief
      value = parseInt(value);
      if (value < 0 || isNaN(value)) {
        value = 0;
      }

      // dwarf's reaction depends on the amount of gold you give him
      if (value < 25) {
        game.history.write("Angry and hurt, the dwarf violently pushes you into the hole and slams the door shut above you!", "danger");
        game.rooms.getRoomById(1).getExit("u").room_to = -1; // blocks exit from starting room
      } else if (value < 50) {
        game.history.write("The dwarf looks disgustedly at the small payment in his hand, sniffs once, and turns and walks away.", "warning");
      } else {
        let adr = game.player.gender === "m" ? "sir" : "ma'am";
        game.history.write("The little man's face lights up...  He leans over to whisper to you as you climb into the hole, \"Thank you, " + adr + ", and keep a sharp eye out for secret doors down there!", "success");
      }
      game.player.gold -= value;
      game.start();
    });

  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -1:
        // the blocked door - didn't pay the dwarf enough
        game.history.write("The dwarf has blocked the exit!");
        return false;
    }
    return true;
  },

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();

    if (artifact !== null) {
      if (artifact.id === 23) {
        game.history.write('The sign reads, "Feed me!"');
        command.markings_read = true;
      } else if (artifact.id === 19) {
        game.history.write('You read the scroll and it says: The magic word for today is "PICKLE".');
        command.markings_read = true;
      }
    }
  },

  "say": function(arg: string) {
    let game = Game.getInstance();
    if (arg === 'pickle' && game.artifacts.get(19).isHere()) {
      game.history.write("  S H A Z A M ! !  ", "special");
      game.artifacts.get(19).room_id = 0;
      game.artifacts.get(41).room_id = game.player.room_id;
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 75) {
      // teleport to random room
      game.history.write("You are being teleported...");
      let room = game.rooms.getRandom();
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
