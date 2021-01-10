import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {isCobaltFront} from "../malleus-maleficarum/event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare let game: Game;

export var event_handlers = {

  "start": function() {
    game.artifacts.get(41).seen = true;
  },

  "beforeMove": function(arg: string, room_from: Room, exit: RoomExit): boolean {
    if (exit) {
      if (exit.room_to === -74) {
        game.effects.print(13);
        return false;
      } else if (exit.room_to === -90) {
        game.history.write('The cave-in blocks your path!');
        return false;
      }
    }
    return true;
  },

  "endTurn1": function() {
    if ([39, 67, 80, 85].indexOf(game.player.room_id) !== -1) {
      game.die();
    }
    if (game.player.room_id === 14 && game.monsters.get(16).isHere() && !game.effects.get(22).seen) {
      game.effects.print(22);
    }
  },

  "eat": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 29) {
      game.history.write('You feel you body getting stronger and tougher!');
      game.player.hardiness++;
    }
  },

  "flee": function() {
    if (game.player.room_id === 36) {  // lake
      game.history.write("You can't!", "emphasis");
      return false;
    }
    if (game.monsters.get(48).isHere()) {  // lake
      game.history.write("You can't turn your back now!", "emphasis");
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    if (recipient.id === 49) {
      // elf captain
      if (artifact.id === 23 && recipient.hasArtifact(29)) {
        game.artifacts.get(29).moveToRoom();
        game.effects.print(2);
      } else if (recipient.hasArtifact(35)) {
        game.artifacts.get(35).moveToRoom();
        game.effects.print(11);
      } else {
        game.history.write("He doesn't feel like trading any more.");
        return false;
      }
    }
    return true;
  },

  "afterGive": function(arg: string, artifact: Artifact, recipient: Monster) {
    if (artifact.id === 19 && recipient.id === 1) {
      game.effects.print(3);
      game.exit();
    }
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    if (artifact !== null && artifact.id === 43) {  // forest gate
      game.effects.print(13);
      return false;
    }
    return true;
  },

  "specialPut": function(arg: string, item: Artifact, container: Artifact) {
    if (item.id === 21 && container.id === 37) {
      // this is just an alias
      game.command_parser.run('use gold key', false);
      return false;
    } else if (item.id === 24 && container.id === 34) {
      // arkenstone
      item.putIntoContainer(container);
      game.artifacts.get(40).moveToRoom();
      game.artifacts.get(40).showDescription();
      game.artifacts.get(40).seen = true;
      return false;   // skips the rest of the "put" logic
    }
    return true;
  },

  "say": function(phrase: string) {
    phrase = phrase.toLowerCase();
    if (phrase === 'my friend' && game.player.room_id === 3) {
      game.player.moveToRoom(86);
    } else if (phrase === 'now' && game.player.room_id === 14 && !game.data.statue) {
      game.data.statue = true;
      game.effects.print(16);
      game.effects.print(18);
      game.artifacts.get(44).destroy();
      game.monsters.get(28).moveToRoom();
      game.rooms.current_room.createExit('w', 15);
      game.rooms.current_room.name = game.rooms.current_room.name.replace('(E)', '(E/W)');
    } else if (phrase === 'elbereth' && game.artifacts.get(43).isHere() && !game.artifacts.get(43).is_open) {
      game.effects.print(17);
      game.artifacts.get(43).open();
      // the gate artifact is actually a fake, with a negative room connection used
      // to show special effects.
      game.rooms.get(73).getExit('e').room_to = 74;
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.id === 33) {  // mining tools
        game.history.write('Mining...');
        game.delay();
        if (game.player.room_id === 30 && !game.data.gems_found) {
          game.history.write("You found some gems!");
          game.artifacts.get(23).moveToRoom();
          game.data.gems_found = true;
        } else if (game.player.room_id === 32 && !game.data.worm_found) {
          game.history.write("You dug up a giant worm!");
          game.monsters.get(47).moveToRoom();
          game.data.worm_found = true;
          game.skip_battle_actions = true;
        } else if (game.player.room_id === 33 && !game.data.mined_cave_in) {
          game.history.write("You mined through the cave-in! You can now go north!");
          game.rooms.current_room.getExit('n').room_to = 90;
          game.data.mined_cave_in = true;
        } else {
          game.history.write("You don't find anything.");
        }
      } else if (artifact.id === 13) {  // silver key
        if (game.artifacts.get(37).isHere()) {
          game.history.write("It doesn't fit.")
        }
      } else if (artifact.id === 21) {  // gold key
        if (game.artifacts.get(37).isHere()) {
          if (!game.artifacts.get(36).isHere()) {
            game.effects.print(21);
            game.artifacts.get(36).moveToRoom();
          }
        }
      } else if (artifact.id === 36) {  // lever (elevator down)
        game.effects.print(6);
        game.player.moveToRoom(79);
      } else if (artifact.id === 41) {  // lever (elevator up)
        game.effects.print(7);
        game.player.moveToRoom(89);
      }
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    if (target.id === 48) {
      youShallNotPass();
      return false;
    }
    return true;
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (game.player.room_id === 68 && game.monsters.get(48).isHere()) {  // balrog
      youShallNotPass();
      return;
    }
    if (game.monsters.get(17).isHere()) {  // army ants
      const children = game.monsters.get(17).children.length;
      if (children > 5) {
        game.effects.print(14);
        game.monsters.get(17).removeChildren(children - 5);
        return;
      }
    }
    if (roll <= 50) {
      game.effects.print(9);
    } else if (roll <= 90) {
      if (game.rooms.current_room.data.env === 'outdoor') {
        game.history.write("It starts to rain.");
      } else {
        game.effects.print(20);
        const orcs = game.monsters.get(50);
        if (!orcs.isHere()) {
          while (orcs.children.length < 4) {
            orcs.spawnChild();
          }
          orcs.moveToRoom();
          game.skip_battle_actions = true;
        }
      }
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

}; // end event handlers

function youShallNotPass() {
  // balrog / chasm
  game.effects.print(12);
  game.monsters.get(48).destroy();
}
