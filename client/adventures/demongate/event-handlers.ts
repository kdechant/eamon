import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();
    if (exit.room_to === -70) {
      game.effects.print(15);
      return false;
    }
    if (exit.room_to === -71) {
      game.effects.print(9);
      return false;
    }
    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    if (room_to.id === 46 && !game.effects.get(11).seen) {
      game.effects.print(11);
    }
    if (room_to.id === 55 && !game.effects.get(12).seen) {
      game.effects.print(12);
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();

    if (game.player.room_id === 1 && !game.effects.get(1).seen) {
      game.effects.print(1);
    }
    if (game.player.room_id === 3 && !game.effects.get(2).seen) {
      game.effects.print(2);
    }
    if (game.player.room_id === 10 && !game.effects.get(5).seen) {
      game.effects.print(5);
    }
    if (game.player.room_id === 12 && !game.effects.get(6).seen) {
      game.effects.print(6);
    }
    if (game.player.room_id === 19 && !game.effects.get(7).seen) {
      game.effects.print(7);
    }
    if (game.player.room_id === 23 && !game.effects.get(8).seen) {
      game.effects.print(8);
    }
    if (game.player.room_id === 60 && !game.effects.get(14).seen) {
      game.effects.print(14);
    }

  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 17) {
        game.history.write("* * * EARTHQUAKE * * *", "special");
        if (game.player.room_id === 61) {
          let wall = game.artifacts.get(37);
          game.history.write("The room shakes for several seconds. The wall collapses into rubble! You have saved the realm from the Dark Lord, for now. The rubble reveals a passage leading north.", "success");
          wall.hardiness = 0;
          wall.is_open = true;
          wall.name = "destroyed wall of runes";
        } else {
          game.history.write("The room shakes for several seconds, but nothing much seems to happen.");
        }
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 90) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      for (let m of game.monsters.visible) {
        game.history.write("All of " + m.name + "'s wounds are healed!");
        m.heal(1000);
      }
    }
  },

}; // end event handlers
