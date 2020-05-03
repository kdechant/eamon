import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

export var event_handlers = {

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    if (room_to.id === 46 && !game.effects.get(11).seen) {
      game.effects.print(11);
    }
    if (room_to.id === 55 && !game.effects.get(12).seen) {
      game.effects.print(12);
    }
  },

  "endTurn2": function() {
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
    if (artifact && artifact.id === 17) {
      game.history.write("* * * EARTHQUAKE * * *", "special");
      if (game.player.room_id === 61) {
        game.effects.print(17);
        game.artifacts.get(37).destroy();
        game.artifacts.get(70).moveToRoom();
      } else if (game.artifacts.get(23).isHere() || game.artifacts.get(24).isHere()) {
        game.effects.print(18);
      } else {
        game.effects.print(16);
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (roll <= 90) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      for (let m of game.monsters.visible.filter(m => m.reaction === Monster.RX_FRIEND)) {
        game.history.write("All of " + m.name + "'s wounds are healed!");
        m.heal(1000);
      }
    }
  },

  "exit": function() {
    if (game.player.hasArtifact(36)) {
      game.data.ankh = true;
      game.artifacts.get(36).destroy();
      game.player.updateInventory();
    }
    return true; // this permits normal exit logic
  },

  "afterSell": function() {
    // reward for ankh
    if (game.data.ankh) {
      game.after_sell_messages.push(game.effects.get(19).text);
      game.player.gold += 1000;
    }
    let lila = game.monsters.get(4);
    if (lila.isHere() && lila.reaction !== Monster.RX_HOSTILE) {
      game.after_sell_messages.push(game.effects.get(20).text);
    }
  },

}; // end event handlers
