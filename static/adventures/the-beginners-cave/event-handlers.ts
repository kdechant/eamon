import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.effects.print(8);
    game.effects.print(10);

    // must have weapon
    if (game.player.weapon_id === null) {
      game.effects.print(9);
    }

    // check if base stats
    if (game.player.weapon_abilities[1] === 5 &&
        game.player.weapon_abilities[2] === -10 &&
        game.player.weapon_abilities[3] === 20 &&
        game.player.weapon_abilities[4] === 10 &&
        game.player.weapon_abilities[5] === 0) {
      game.effects.print(12);
    } else {
      // not a beginner
      game.effects.print(11);
    }

  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    if (exit.room_to === -1) {
      Game.getInstance().history.write("Sorry, but I'm afraid to go into the water without my life preserver.");
      return false;
    }
    return true;
  },

  "read": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();

    if (artifact !== null) {
      if (artifact.id === 3) {
        game.history.write('It says "HEALING POTION"');
        artifact.name = "healing potion";
        return true;
      } else if (artifact.id === 9) {
        game.effects.print(7, "special");
        if (game.rooms.current_room.id === 26) {
          game.history.write("You fall into the sea and are eaten by a big fish.", "danger");
        } else {
          game.history.write("You flop three times and die.", "danger");
        }
        game.die();
        return true;
      }
    }
  },

  "see_monster": function(monster: Monster): void {
    if (monster.id === 8) {
      // pirate invokes trollsfire when first seen
      Game.getInstance().effects.print(2);
      light_trollsfire();
    }
  },

  "death": function(monster: Monster): void {
    if (monster.id === 8) {
      // trollsfire goes out when pirate dies
      Game.getInstance().effects.print(3);
      put_out_trollsfire();
    }
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact): void {
    // if unreadying trollsfire, put it out
    if (old_wpn.id === 10 && new_wpn.id !== 10) {
      put_out_trollsfire();
    }
  },

  "drop": function(arg: string, artifact: Artifact): void {
    // if dropping trollsfire, put it out
    if (artifact.id === 10) {
      put_out_trollsfire();
    }
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster): boolean {
    // if giving trollsfire to someone else, put it out
    if (artifact.id === 10) {
      put_out_trollsfire();
    }
    return true;
  },

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


// functions used by event handlers and custom commands
export function light_trollsfire(): void {
  "use strict";
  let trollsfire = Game.getInstance().artifacts.get(10);
  trollsfire.is_lit = true;
  trollsfire.sides = 10;
}

export function put_out_trollsfire(): void {
  "use strict";
  let trollsfire = Game.getInstance().artifacts.get(10);
  trollsfire.is_lit = false;
  trollsfire.sides = 6;
}
