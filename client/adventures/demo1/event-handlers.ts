import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();
    // special message when the player tries to pick up the throne
    if (artifact && artifact.id === 1) {
      game.history.write("There's no way you'll ever be able to carry the throne!");
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();
    // special message when the player finds the treasure
    if (artifact && artifact.id == 3) {
      game.history.write("The magic sword is so shiny you decided to ready it.");
      game.player.ready(artifact);
    }
    return true;
  },

  "say": function(arg) {
    let game = Game.getInstance();
    // 'say trollsfire' is the same as running the command 'trollsfire'
    if (arg === 'trollsfire') {
      game.command_parser.run('trollsfire', false);
    }
  },

  "use": function(artifact) {
    let game = Game.getInstance();
    switch (artifact.name) {
      case 'bread':
        if (game.monsters.get(1).room_id === game.rooms.current_room.id) {
          game.history.write("The guard shouts at you for stealing his bread.", "warning")
          game.monsters.get(1).reaction = Monster.RX_HOSTILE;
        } else {
          game.history.write("It tases OK. Would be better with some cheese.")
        }
        break;
    }
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

  // the 'read' event handler should set command.markings_read to true if the handler did something,
  // otherwise the "there are no markings to read" message will appear.
  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    if (artifact && artifact.name === 'black book') {
      let a = game.artifacts.getByName(arg);
      if (a.room_id === game.rooms.current_room.id || a.monster_id === 0) {
        game.history.write("The book zaps you when you open it!", "danger");
        game.player.injure(5);
        command.markings_read = true;
      }
    }
  },

  "beforeRemove": function(arg: string, artifact: Artifact, container: Artifact) {
    let game = Game.getInstance();
    // special message when the player tries to pick up the throne
    if (artifact) {
      if (artifact.id === 13) {
        game.history.write("Sucker! The jewels are fake. The thief must have stolen the real ones.");
        artifact.name = 'Fake jewels';
        artifact.value = 0;
      } else if (artifact.id === 14) {
        game.history.write("A magic force is holding the wand in the chest. You can't remove it.");
        return false;
      }
    }
    return true;
  },

  "afterRemove": function(arg: string, artifact: Artifact, container: Artifact) {
    let game = Game.getInstance();
    // special message when the player finds the treasure
    if (artifact && artifact.id === 3) {
      game.history.write("That's a fine-looking sword.");
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    // alfred doesn't like the looks of that black book
    if (monster.id === 3 && artifact.id === 11) {
      game.history.write("Alfred says, \"That looks dangerous. Why don't you keep it?\"");
      return false;
    }
    return true;
  },

  "take": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    // you can't take alfred's lucky sword.
    if (monster.id === 3 && artifact.id === 8) {
      game.history.write("Alfred says, \"That's my lucky sword! My father gave it to me!\"");
      return false;
    }
    return true;
  },

};
