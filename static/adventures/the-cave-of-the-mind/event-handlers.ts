import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // set up game data
    game.data["open box"] = false;
    game.data["mind has spoken"] = false;
    game.data["heat ray destroyed"] = false;
    game.data["elevator on"] = false;
    game.data["aj memory"] = false;
    game.data["chef memory"] = false;

    // the mind's attack messages
    game.monsters.get(12).combat_verbs = ["mentally blasts", "shoots a laser at", "swings a spidery arm at"];

    // prevent the description of the inscription from appearing
    game.artifacts.get(17).seen = true;
    game.artifacts.get(17).description = "";

  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();
    // wizard attacks if you take the TV
    let wizard = game.monsters.get(3);
    if (artifact && artifact.id === 4 && wizard.isHere()) {
      game.effects.print(13, "warning");
      wizard.reaction = Monster.RX_HOSTILE;
    }
  },

  "attackArtifact": function(arg, artifact) {
    let game = Game.getInstance();
    // smashing the mind's life-support equipment
    if (artifact.id === 27) {
      game.artifacts.get(28).moveToRoom(artifact.room_id);
      artifact.destroy();
      game.effects.print(7, "emphasis");
      game.monsters.get(12).injure(1000);
      return false;  // this suppresses a "why would you attack" message
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    if (exit.room_to === -31 || exit.room_to === -32) {
      if (game.data["elevator on"]) {
        switch (exit.room_to) {
          case -31:
            // going up, after elevator has been turned on
            exit.room_to = 31;
            break;
          case -32:
            // going down - doesn't work
            game.effects.print(9);
            return false;
        }
      } else {
        game.history.write("The elevator must first be turned on.");
        return false;
      }
    }

    // bridge across chasm
    if (exit.room_to === -28 && game.artifacts.get(24).isHere()) {
      exit.room_to = 28;
    }

    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    // mind's warning
    if (room_to.id === 28 && !game.data["mind has spoken"]) {
      game.data["mind has spoken"] = true;
      game.effects.print(5, "emphasis");
    }
    // watch out for that heat ray!
    if (room_to.id === 29 && !game.data["heat ray destroyed"]) {
      game.effects.print(8, "danger");
      game.die();
    }
  },

  "open": function(arg: string, artifact: Artifact, command: OpenCommand) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 6 && !game.data["open box"]) {
        // the box
        game.data["open box"] = true;
        game.effects.print(3, "special");
        game.command_parser.run('power', false);
      }
    }
  },

  "look": function(arg: string) {
    let game = Game.getInstance();
    let artifact = game.artifacts.getLocalByName(arg, false);
    if (artifact && artifact.id === 17) {
      game.command_parser.run("read inscription", false);
    }
  },

  // the 'read'/'beforeRead' event handler should set command.markings_read to true if the handler
  // did something, otherwise the "there are no markings to read" message will appear.
  "beforeRead": function(arg: string, artifact: Artifact, command: ReadCommand) {
    if (artifact && artifact.id === 17) {
      let game = Game.getInstance();
      game.history.write(" PEACE BEGETS PEACE. PUT DOWN YOUR", "special2");
      game.history.write("WEAPONS AND LEAVE VIOLENCE BEHIND YOU ", "special2");
      // teleport all weapons to random rooms
      for (let i in game.player.inventory) {
        let item = game.player.inventory[i];
        if (item.is_weapon) {
          let dest = game.rooms.getRandom();
          item.moveToRoom(dest.id);
        }
      }
      game.player.updateInventory();
      game.artifacts.updateVisible();
    }
  },


  "say": function(arg: string) {
    let game = Game.getInstance();
    arg = arg.toLowerCase();
    if (arg === 'trilder' && game.data["open box"]) {
      game.command_parser.run('power', false);
    }

  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      switch (artifact.id) {
        case 7:
          // miner's pick
          if (game.player.room_id === 5 && game.artifacts.get(19).isHere()) {
            game.artifacts.get(19).destroy();
            game.artifacts.get(18).moveToRoom(game.player.room_id);
          }
          break;
        case 10:
          // helmet
          if (!artifact.is_worn) {
            game.history.write("[You put on the helmet]");
            artifact.is_worn = true;
          }
          game.modal.show("Use helmet on whom?", function(value) {
            let monster = game.monsters.getLocalByName(value);
            if (!monster) {
              game.history.write("Nobody here by that name!");
            } else {
              if (monster.id === 12) {
                // the mind
                game.history.write("Nice try, fool!", "emphasis");
              } else if (monster.id === 9) {
                // cylon
                game.history.write("By your command.", "special");
                if (monster.reaction !== Monster.RX_FRIEND) {
                  monster.reaction = Monster.RX_FRIEND;
                }
                if (game.player.room_id === 28 && !game.data["heat ray destroyed"]) {
                  game.effects.print(6, "special2");
                  game.effects.print(15, "emphasis");
                  monster.room_id = null;
                  game.monsters.get(14).moveToRoom(game.player.room_id);
                  game.artifacts.get(33).moveToRoom(game.player.room_id);
                  game.data["heat ray destroyed"] = true;
                  game.skip_battle_actions = true;
                } else {
                  let reactions = ["does a little dance for your amusement.", "picks its metal nose.", "stands on its head.", "tells a dirty joke."];
                  let action_no = Math.floor(Math.random() * reactions.length);
                  game.history.write("The Cylon " + reactions[action_no]);
                }
              } else {
                game.history.write("Nothing happens.");
              }
            }

          });
          break;
        case 16:
          // potion
          game.history.write("As you drink the potion, the room gradually fades from view...");
          game.effects.print(10);
          game.exit();
          break;
        case 21:
          // harmonica
          let bridge = game.artifacts.get(24);
          if (game.player.room_id === 21 && !bridge.room_id) {
            bridge.room_id = 21;
            // effect message is in the artifact description
          } else {
            game.history.write("You make some awful screeching sounds for a bit.");
          }
          break;
        case 34:
          // elevator key
          if (game.player.room_id === 23) {
            if (game.data["elevator on"]) {
              game.history.write("You turn off the elevator.");
              game.data["elevator on"] = false;
            } else {
              game.history.write("You turn on the elevator.");
              game.data["elevator on"] = true;
            }
          } else {
            game.history.write("It doesn't fit anything here.");
          }

      }
    }
  },

  // every adventure should have a "power" event handler.
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

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let game = Game.getInstance();
    // cyber-bit
    if (game.artifacts.get(5).isHere()) {
      game.exit_message.push(game.effects.get(14).text);
    }
    // aj and chef messages
    if (game.monsters.get(7).isHere()) {
      game.exit_message.push(game.effects.get(11).text);
    }
    if (game.monsters.get(11).isHere()) {
      game.exit_message.push(game.effects.get(12).text);
    }
  }

}; // end event handlers


// declare any functions used by event handlers and custom commands
