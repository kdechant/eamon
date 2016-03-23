import {Game} from "../core/models/game";
import {Artifact} from "../core/models/artifact";
import {Monster} from "../core/models/monster";

export var event_handlers = [];

event_handlers.push({
  name: "start",
  run: function(arg: string) {
    let game = Game.getInstance();

    game.effects.print(8);
    game.effects.print(10);

    // must have weapon
    if (game.monsters.player.weapon_id === null) {
      game.effects.print(9);
    }

    // check if base stats
    if (game.monsters.player.weapon_abilities[1] === 5 &&
        game.monsters.player.weapon_abilities[2] === -10 &&
        game.monsters.player.weapon_abilities[3] === 20 &&
        game.monsters.player.weapon_abilities[4] === 10 &&
        game.monsters.player.weapon_abilities[5] === 0) {
      game.effects.print(12);
    } else {
      // not a beginner
      game.effects.print(11);
    }

  }
});

event_handlers.push({
  name: "beforeMove",
  run: function(arg: string, room: Room, exit: RoomExit): boolean {
    if (exit.room_to === -1) {
      Game.getInstance().history.write("Sorry, but I'm afraid to go into the water without my life preserver.");
      return false;
    }
    return true;
  },
});

event_handlers.push({
  name: "read",
  run: function(arg: string, artifact: Artifact) {
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
  }
});

event_handlers.push({
  name: "see_monster",
  run: function(monster: Monster): void {
    if (monster.id === 8) {
      // pirate invokes trollsfire when first seen
      Game.getInstance().effects.print(2);
      light_trollsfire();
    }
  },
});

event_handlers.push({
  name: "death",
  run: function(monster: Monster): void {
    if (monster.id === 8) {
      // trollsfire goes out when pirate dies
      Game.getInstance().effects.print(3);
      put_out_trollsfire();
    }
  },
});

event_handlers.push({
  name: "ready",
  run: function(arg: string, old_wpn: Artifact, new_wpn: Artifact): void {
    // if unreadying trollsfire, put it out
    if (old_wpn.id === 10 && new_wpn.id !== 10) {
      put_out_trollsfire();
    }
  },
});

event_handlers.push({
  name: "drop",
  run: function(arg: string, artifact: Artifact): void {
    // if dropping trollsfire, put it out
    if (artifact.id === 10) {
      put_out_trollsfire();
    }
  },
});

event_handlers.push({
  name: "give",
  run: function(arg: string, artifact: Artifact, monster: Monster): boolean {
    // if giving trollsfire to someone else, put it out
    if (artifact.id === 10) {
      put_out_trollsfire();
    }
    return true;
  },
});

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
