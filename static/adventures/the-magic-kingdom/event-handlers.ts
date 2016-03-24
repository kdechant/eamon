import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // add your custom game start code here
    game.history.write("Recently, a local evil sorcerer was spying on you through his crystal ball. He overheard you talking about him and, having a short temper like most evil sorcerers, he instantly banished you to the Magic Kingdom, thinking you would never return.", "special");

    // set up game data
    game.data['boulder_destroyed'] = false;

  },

  "use": function(artifact) {
    let game = Game.getInstance();
    switch (artifact.name) {
      case 'cup of coffee':
        game.effects.print(7);
        game.player.hardiness++;
        game.player.agility++;
        game.player.charisma++;
        artifact.room_id = null;
        artifact.monster_id = null;
        game.player.updateInventory();
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
    if (exit.room_to === -1) {
      // the misty trail
      game.effects.print(9);
      exit.room_to = 1;
    } else if (exit.room_to === 26 && game.rooms.current_room.id === 6 && !game.data['boulder_destroyed']) {
      game.history.write("The giant boulder blocks your way.");
      return false;
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
