import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";
import {CommandException} from "../../core/utils/command.exception";
import {ModalQuestion} from "../../core/models/modal";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['exit flag'] = false;
    game.data['bell ringing'] = false;
    game.data['amulet used'] = false;

  },

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (artifact && artifact.id === 11 && game.data['amulet used']) {
      game.history.write("The amulet is too hot to pick up!", "warning");
      return false;
    }

    return true;
  },

  "specialGet": function(arg): boolean {
    let game = Game.getInstance();
    let art = game.artifacts.getByName(arg);
    // if you try to get the sword when it's still in the brace
    if (art && art.id === 12 && art.container_id === 31) {
      if (game.player.room_id === 10) {
        game.history.write("You can't reach it from here!");
        return false;
      } else if (game.player.room_id === 11) {
        game.history.write("The brace holds the sword in place!");
        return false;
      }
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();
    let esher = game.monsters.get(1);

    // Leave cathedral without player or Esher carrying Sword of Inari
    if (room.id === 12 && exit.room_to === 13 && esher.isHere()) {
      if (!game.player.hasArtifact(12) && !esher.hasArtifact(12)) {
        game.effects.print(20);
        return false;
      }
    }

    // other special exits
    switch (exit.room_to) {
      case -2:
        game.effects.print(8);
        return false;
      case -3:
        if (esher.isHere()) {
          game.effects.print(9);
          return false;
        } else {
          game.effects.print(46);
          game.die();
          return false;
        }
      case -4:
        if (esher.isHere()) {
          game.effects.print(10);
          return false;
        } else {
          game.effects.print(46);
          game.die();
          return false;
        }
      case -5:
        if (esher.isHere()) {
          game.effects.print(11);
          return false;
        } else {
          game.effects.print(46);
          game.die();
          return false;
        }
      case -10:
        game.effects.print(7);
        return false;
      case -15:
        if (game.monsters.get(12).room_id === null) {
          game.history.write("You have been located by trackers!", 'danger');
          game.monsters.get(12).moveToRoom(17);
          exit.room_to = 17;
          return true;
        }
        return false;
    }

    return true;
  },

  "beforePut": function(arg: string, item: Artifact, container: Artifact) {
    let game = Game.getInstance();
    if (item && item.id === 11 && !game.data['amulet used']) {
      game.command_parser.run('use amulet', false);
      return false;
    }
    // anything other than sword into scabbard
    if (container.id === 13 && item.id !== 12) {
      game.history.write("It won't fit.");
      return false;
    }
    return true;
  },

  "flee": function() {
    let game = Game.getInstance();
    if (game.monsters.get(5).isHere() || game.monsters.get(12).isHere()) {
      game.history.write("You are surrounded and cannot escape!", "emphasis");
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();

    if (recipient.id === 16 && artifact.id === 53 && recipient.hasArtifact(44)) {
      // receipt to leatherworker
      game.history.write("The leatherworker gives you a set of leather armor.");
      game.artifacts.get(44).moveToRoom();
    }
    return true;
  },

  "look": function(arg: string) {
    let game = Game.getInstance();
    let artifact = game.artifacts.getByName(arg);
    if (artifact && artifact.id === 12 && artifact.container_id === 31) {
      if (game.player.room_id === 10) {
        game.history.write("The sword is too high to see clearly!");
      } else if (game.player.room_id === 11) {
        game.history.write("The brace is blocking your view!");
      }
      return false;
    }
    return true;
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.isHere()) {
      switch (artifact.id) {
        case 6:
          // iron bell
          game.history.write("You try to push the bell, but it is too heavy to move!");
          break;
        case 9:
          // rope
          if (game.monsters.get(5).isHere()) {
            game.history.write("The worshippers ignore the ringing bell!");
            return;
          }
          if (game.data['bell ringing']) {
            game.history.write("The bell is still ringing from the first time!");
          }
          game.effects.print(6);
          game.monsters.get(5).destroy();
          game.artifacts.get(8).destroy(); // old peephole
          game.artifacts.get(30).moveToRoom(); // new peephole
          game.data['bell ringing'] = true;
          break;
        case 11:
          // amulet
          if (game.player.room_id === 11) {
            game.data['amulet used'] = true;
            artifact.moveToRoom();
            game.effects.print(19);
            return;
          }
          game.effects.print(37);
          break;
        case 14:
          // silver cube
          if (game.monsters.get(5).isHere()) {
            game.effects.print(36);
            artifact.destroy();
          } else if (game.player.room_id === 9) {
            game.monsters.get(6).moveToRoom();
            artifact.destroy();
            game.effects.print(12);
          } else {
            game.history.write("There's not enough room for the spell to work!", "warning");
          }
          break;
        case 38:
          // hammer
          if (game.artifacts.get(52).isHere()) {
            game.artifacts.get(52).destroy();
            game.history.write("You smash the armor parts into very tiny pieces!");
          }
          break;
        case 47:
          // tools
          if (game.player.room_id === 21 && !game.artifacts.get(23).is_open) {
            game.artifacts.get(23).moveToRoom();
            game.artifacts.get(23).open();
            game.history.write("You've pried the grate open!", "emphasis");
          }
          if (game.artifacts.get(44).isHere() && game.artifacts.get(52).isHere()) {
            game.artifacts.get(44).destroy();
            game.artifacts.get(52).destroy();
            game.artifacts.get(51).moveToRoom();
            game.effects.print(38);
          }
          break;
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


// declare any functions used by event handlers and custom commands
