import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const event_handlers = {

  "start": function(): void {
    // add your custom game start code here
  },

  "beforeMove": function(arg: string, room_from: Room, exit: RoomExit): boolean {
    if (exit) {
      if (exit.room_to === -51 || exit.room_to === -73) {
        game.history.write("The watchers block your path!")
        return false;
      }
    }
    return true;
  },

  "endTurn1": (): void => {
    if (game.player.room_id === 71) {
      game.die();
    }
  },

  "say": (phrase: string): void => {
    phrase = phrase.toLowerCase();
    const flask = game.artifacts.get(10);
    if (phrase === 'aiya elenion ancalima' && flask.isHere()) {
      game.effects.print(12);
      game.effects.print(13);
      if (game.player.room_id === 50) {
        game.player.moveToRoom(51);
      }
      if (game.player.room_id === 52) {
        game.player.moveToRoom(73);
      }
    } else if (phrase === 'githoneil a elbereth' && flask.isHere()) {
      game.effects.print(11);
      flask.is_lit = true;
    }
  },

  "power": function(roll: number): void {
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 75) {
      // teleport to random room
      game.history.write("You are being teleported...");
      const room = game.rooms.getRandom();
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
