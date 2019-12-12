import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

declare var game: Game;

export var event_handlers = {

  "start": function(arg: string) {
    game.data['pass guard'] = false;
    // no teleport into mine (26-31, 36) or onto river (12-19, 34)
    game.data.no_teleport_rooms = [12, 13, 14, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36];
  },

  "use": function(arg: string, artifact: Artifact) {
    switch (artifact.id) {
      case 4:  // coffee
        game.effects.print(7);
        game.player.hardiness++;
        game.player.agility++;
        game.player.charisma++;
        artifact.room_id = null;
        artifact.monster_id = null;
        game.player.updateInventory();
        break;
      case 11:  // doughnut
        game.history.write("It was delicious, too bad it was also poisonous!");
        game.die();
        break;
      case 17:  // dynamite
        if (game.artifacts.get(18).isHere()) {
          game.history.write(" * * * B O O M * * * ", 'special2');
          artifact.destroy();
          game.artifacts.get(18).destroy();
          game.history.write("The explosion opened up the entrance to the mine shaft!");
        } else {
          game.history.write("That would be a waste.");
        }
        break;
    }
  },

  "seeMonster": function(monster: Monster): void {
    if (monster.id === 16) {
      // king explains the situation and gives you a pass
      game.effects.print(1);
      game.artifacts.get(16).moveToInventory();
      game.artifacts.get(16).showDescription();
      // game.artifacts.updateVisible();
      game.player.updateInventory();
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    switch (exit.room_to) {
      case -12:
        // the guard won't let you on the boat without a pass
        if (game.player.findInInventory('pass') || game.data['pass guard']) {
          game.history.write("You show the pass to the guard. He stands aside and lets you board one of the boats.");
          exit.room_to = 12;
          return true;
        } else {
          game.history.write("The guard won't let you!");
          return false;
        }
      case -98:
        // whoops. the boat went over the waterfall.
        game.effects.print(5);
        game.effects.print(6);
        game.die();
        return false;
    }
    return true;
  },

  "endTurn2": function(): void {
    if (game.rooms.current_room.id === 25) {
      // end game
      if (game.player.hasArtifact(30)) {
        // carrying princess' body
        game.effects.print(2);
        game.exit();
      } else if (game.monsters.get(11).isHere()) {
        // princess is alive
        game.effects.print(3);
        game.player.gold += 1000;
        game.exit();
      }
    }
  },

  "afterGive": function (arg: string, artifact: Artifact, recipient: Monster) {
    if (recipient.id === 17 && artifact.id === 16) {
      // give the pass to the guard
      game.history.write("You may pass now.");
      game.data['pass guard'] = true;
    } else if (recipient.id === 10 && artifact.id === 11) {
      // give the doughnut to the dragon
      game.history.write("The dragon ate the doughnut!");
      game.artifacts.get(11).destroy();
      game.monsters.get(10).injure(1000);
    }
    return true;
  },

  "afterFree": function(arg: string, artifact: Artifact, monster: Monster) {
    if (artifact.id === 15) {
      game.artifacts.get(12).moveToRoom();  // the princess' gold chain
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 75) {
      // teleport to random room
      game.history.write("You are being teleported...");
      let room = game.rooms.getRandom(game.data.no_teleport_rooms);
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

}; // end event handlers
