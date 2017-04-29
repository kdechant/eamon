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
    game.data["boulder_destroyed"] = false;

  },

  // the 'read' event handler should return true if the handler did something,
  // otherwise the "there are no markings to read" message will appear.
  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    if (artifact !== null && artifact.id === 11) {
      game.effects.print(10);
      command.markings_read = true;
    }
  },

  "use": function(artifact) {
    let game = Game.getInstance();
    switch (artifact.name) {
      case "cup of coffee":
        game.effects.print(7);
        game.player.hardiness++;
        game.player.agility++;
        game.player.charisma++;
        artifact.room_id = null;
        artifact.monster_id = null;
        game.player.updateInventory();
        break;
      case "doughnut":
        game.history.write("It was delicious, too bad it was also poisonous!");
        game.die();
        break;
      case "dynamite":
        if (game.artifacts.get(18).room_id !== game.rooms.current_room.id) {
          game.history.write("That would be a waste.");
        } else {
          game.history.write("  B O O M ! !  ", 'danger');
          game.data["boulder_destroyed"] = true;
          artifact.destroy();
          game.history.write("The explosion opened up the entrance!");
        }
        break;
    }
  },

  "see_monster": function(monster: Monster): void {
    let game = Game.getInstance();
    if (monster.id === 16) {
      // king explains the situation and gives you a pass
      game.effects.print(1);
      game.artifacts.get(16).moveToRoom(game.rooms.current_room.id);
      game.artifacts.updateVisible();
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -1:

        // the misty trail
        game.effects.print(9);
        exit.room_to = 1;
        break;

      case -12:

        // the guard won't let you on the boat without a pass
        if (game.player.findInInventory('pass')) {
          exit.room_to = 12;
          return true;
        } else {
          game.history.write("The guard won't let you!");
          return false;
        }

      case -97:

        // rock climbing is dangerous
        game.history.write("You would fall to your death.");
        return false;

      case -98:

        // whoops. the boat went over the waterfall.
        game.effects.print(5);
        game.effects.print(6);
        game.die();
        return false;

      case 26:

        // the boulder at the mine entrance
        if (game.rooms.current_room.id === 6) {
          if (!game.data['boulder_destroyed']) {
            game.history.write("The giant boulder blocks your way.");
            return false;
          } else {
            game.history.write("You descend into the mine.");
          }
        }
        break;

    }
    return true;
  },

  "endTurn": function(): void {
    let game = Game.getInstance();

    if (game.rooms.current_room.id === 25) {
      // end game
      if (game.player.findInInventory("Princess Julene's body")) {
        // carrying princess' body
        game.effects.print(2);
        game.exit();
      } else {
        // princess is alive
        game.effects.print(3);
        game.player.gold += 1000;
        game.exit();
      }
    }

  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();

    if (monster.id === 17 && artifact.id === 16) {
      // give the pass to the guard
      game.history.write("You may pass now.");
    } else if (monster.id === 10 && artifact.id === 11) {
      // give the doughnut to the dragon
      game.history.write("The dragon ate the doughnut!");
      game.monsters.get(10).injure(1000);
    }
    return true;
  },

  "free": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();

    if (artifact.id === 15) {
      // the princess' gold chain
      game.artifacts.get(12).room_id = game.rooms.current_room.id;
    }
    return true;
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

}; // end event handlers


// declare any functions used by event handlers and custom commands
