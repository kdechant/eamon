import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['inner gate open'] = false;
    game.data['clone check'] = false;

  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    if (room_from.id === 20 && room_to.id === 21 && game.artifacts.get(22).room_id === 20 && !game.data["inner gate open"]) {
      game.data["inner gate open"] = true;
      game.effects.print(3);
    }
  },

  "close": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.id === 22 && game.data['inner gate open']) {
      game.history.write("The gears have been smashed. You can't close it.");
      return false;
    }
    return true;
  },

  "light": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact !== null) {
      // dyn-o-mite!
      if (artifact.id === 5) {
        if (artifact.monster_id === Monster.PLAYER) {
          game.history.write("Better put it down first!");
        } else {
          if (game.artifacts.get(6).isHere()) {
            game.effects.print(1);
            game.history.write("* * B O O M * *", "special");
            artifact.destroy();
            game.artifacts.get(6).destroy();
            game.artifacts.get(9).moveToRoom();
            game.artifacts.get(9).reveal();
            game.artifacts.get(10).moveToRoom(11);
            game.artifacts.get(10).hidden = false;
          } else if (game.artifacts.get(8).isHere()) {
            game.effects.print(1);
            game.history.write("* * B O O M * *", "special");
            artifact.destroy();
            game.artifacts.get(8).destroy();
            game.artifacts.get(11).moveToRoom();
            game.artifacts.get(11).reveal();
            game.artifacts.get(12).moveToRoom(16);
            game.artifacts.get(10).hidden = false;
          } else {
            game.history.write("Save that for when you need it.");
          }
        }
        return false; // skip the regular "light source" lighting routine
      }
    }
    return true;
  },


  "see_monster": function(monster: Monster): void {
    let game = Game.getInstance();
    // nasreen's opening remarks
    if (monster.id === 1) {
      game.history.write('Nasreen tells you, "Two of my commandos, Nevil and Norwood, are waiting in the camp to the south. We should join them as soon as you\'re ready."');
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();

    // inner gate
    if (game.artifacts.get(22).isHere() && game.artifacts.get(30).is_worn) {
      game.effects.print(2);
      game.artifacts.get(22).is_open = true;
    }

    // inside inner gate
    if (game.monsters.get(12).isHere() && !game.data['clone check']) {
      game.effects.print(4);
      game.data['clone check'] = true;
    }

  },

  // add your custom event handlers here

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
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
