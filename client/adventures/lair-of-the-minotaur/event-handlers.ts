import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {CommandException} from "../../core/utils/command.exception";

declare var game: Game;

export var event_handlers = {

  "intro": function() {
    if (game.player.gender === 'f') {
      game.intro_text[0] = game.intro_text[0].replace("Larcenous Lil", "Slippery Sven");
      game.intro_text[0] = game.intro_text[0].replace("Lil", "Sven");
      game.intro_text[0] = game.intro_text[0].replace("She", "He");
    }
  },

  "start": function() {
    // Lil or Sven?
    if (game.player.gender === 'f') {
      game.intro_text[0] = game.intro_text[0].replace("Larcenous Lil", "Slippery Sven");
      game.artifacts.get(26).destroy();
      game.artifacts.get(40).moveToRoom(52);
    }

    game.data['in boat'] = false;
    game.data["open coffin"] = false;
    game.data['water rooms'] = [9, 10, 11, 12, 13, 14, 15, 16];
    game.data['shore rooms'] = [6, 7, 8, 17, 23, 27];
    game.data['found coins'] = false;
  },

  "endTurn": function() {
    if (game.player.room_id === 16) {
      game.die(); // cause of death is in room desc
    }
    if (game.data['in boat']) {
      game.artifacts.get(3).moveToRoom();
      // shore
      if (game.data['in boat'] && game.data['water rooms'].indexOf(game.player.room_id) === -1) {
        game.history.write("You get out of the boat.");
        game.data['in boat'] = false;
      }
    }
  },

  "endTurn2": function() {
    if (game.artifacts.get(26).isHere()) {
      game.history.write(game.monsters.get(9).name + " asks to be freed.");
    }
    if (game.data['in boat']) {
      game.history.write("(You are in the boat.)");
    }
  },

  "drink": function(arg: string, artifact: Artifact) {
    if ((arg === 'water' || arg === 'river') && near_water()) {
      game.history.write("The water tastes a little muddy, but is otherwise unremarkable.");
      return false;
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    // the boat
    if (artifact && artifact.id === 3) {
      game.history.write("To get into the boat, try going onto the river.");
      return false;
    }
    if (artifact && artifact.id === 11 && game.monsters.get(6).isHere()) {
      game.history.write(game.monsters.get(6).name + ' says, "Hey! Get your hands off my books!"');
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    if (artifact && artifact.id === 10) {
      game.effects.print(4);
      game.player.injure(game.diceRoll(1, 10), true); // ignore armor
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    if (game.data['water rooms'].indexOf(exit.room_to) !== -1) {
      if (game.artifacts.get(3).isHere()) {
        if (!game.data['in boat']) {
          game.history.write("You get into the boat.");
          game.data['in boat'] = true;
        }
        return true;
      } else {
        throw new CommandException("You can't go on the river without a boat!");
      }
    }

    return true;
  },

  "look": function(arg: string) {
    if ((arg === 'water' || arg === 'river') && near_water()) {
      game.history.write("The river flows from north to south. It's too swift to navigate without a boat.");
      return false;
    }
    return true;
  },

  "say": function(arg) {
    arg = arg.toLowerCase();
    if (game.artifacts.get(25).isHere() && arg === 'magic') {
      game.effects.print(5, "special");
      game.artifacts.get(8).moveToRoom();
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.id === 9) {
        // shovel
        game.history.write("Digging...");
        if (game.player.room_id === 27 && !game.data["found coins"]) {
          game.history.write("Found something!");
          game.data["found coins"] = true;
          game.artifacts.get(6).moveToRoom();
        } else {
          game.history.write("You find nothing.");
        }
      }
      if (artifact.id === 3) {
        // boat
        game.history.write("To get into the boat, just move onto the river.");
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
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

function near_water(): boolean {
  return game.data['water rooms'].indexOf(game.player.room_id) !== -1
    || game.data['shore rooms'].indexOf(game.player.room_id) !== -1;
}
