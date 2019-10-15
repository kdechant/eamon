import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();
    game.exit_message = 'You enter your boat and return to the main hall.';

    // custom variables
    game.data['dragon vanish'] = 0;
    game.data['tom speaks'] = 0;

  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // dragon
    if (target.id === 9) {
      game.history.write('The dragon yawns and the flame almost scorches your face. Then he goes back to sleep.');
      return false;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // dragon
    if (target.id === 9) {
      game.history.write('A direct hit!');
      game.history.write('The dragon yawns and rolls over.');
      return false;
    }
    return true;
  },

  "endTurn2": function() {
    let game = Game.getInstance();
    if (game.monsters.get(1).isHere() && game.monsters.get(10).isHere() && !game.data['tom speaks']) {
      game.effects.print(2);
      game.data['tom speaks'] = 1;
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    // dragon
    if (exit.room_to === -12 || exit.room_to === -8) {
      if (game.monsters.get(9).isHere()) {
        game.history.write("You can't climb over the dragon.", "warning");
        return false;
      } else {
        exit.room_to = Math.abs(exit.room_to);
      }
    }

    return true;
  },

  "say": function(phrase) {
    let game = Game.getInstance();
    phrase = phrase.toLowerCase();
    if (phrase === 'dragon vanish' && game.player.isWearing(7) && game.monsters.get(9).isHere()) {
      game.data['dragon vanish']++;
      game.effects.print(2 + game.data['dragon vanish'])
      if (game.data['dragon vanish'] >= 3) {
        game.monsters.get(9).destroy();
      }
    }
  },

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
