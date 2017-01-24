import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data["water level"] = 0;
    game.data["water artifact"] = 35;
    game.data["chest open"] = false;

    // move red face and blue nose to a random place on the second level of the ship
    // (originally they were in the brig, but this makes the beginning too hard.)
    game.monsters.get(12).moveToRoom(18 + game.diceRoll(1, 10));
    game.monsters.get(13).moveToRoom(18 + game.diceRoll(1, 10));

    // take away player's weapons and gold
    let storage_rooms: number[] = [15, 30, 29, 34];
    for (let i in game.player.inventory) {
      let item = game.player.inventory[i];
      if (item.is_weapon) {
        item.monster_id = null;
        item.moveToRoom(storage_rooms[Math.floor(Math.random() * storage_rooms.length)]);
      } else {
        // other items just get removed
        item.destroy();
      }
    }
    game.player.updateInventory();
    game.artifacts.get(71).value = game.player.gold;
    game.player.gold = 0;

    if (game.player.hardiness > 5) game.player.damage = 5;

    game.history.write("You wake up on a hard wooden floor, somewhere dark and stuffy. You seem to have sustained a few bruises. In the distance, you can hear shouting and ocean sounds.");
    // naked message
    game.effects.print(7);
    game.history.write("You hear a man's voice in the darkness. He says, 'Good, you're awake. I'm Orlando. I was kidnapped by the smugglers, too. We need to get out of here, pronto.'");
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -7:

        game.history.write("The lower hold is now filled with water!", "emphasis");
        return false;

      case -10:

        // the slave ship
        game.effects.print(5);
        game.die();
        break;

      case -11:

        // the passenger ship
        game.effects.print(6);
        game.data["ship"] = "passenger";
        break;

      case -999:

        // alternate exit message
        game.effects.print(4);

    }
    return true;
  },

  "flee": function() {
    let game = Game.getInstance();
    if (game.monsters.get(14).isHere()) {
      game.history.write("One tentacle has you by the leg!", "emphasis");
      return false;
    }
    if (game.monsters.get(15).isHere()) {
      game.effects.print(11, "emphasis");
      return false;
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();
    // the guardian of the bowl
    if (artifact && artifact.id === 8 && game.monsters.get(16).reaction === Monster.RX_UNKNOWN) {
      game.history.write("A strange force prevents you from lifting the bowl...");
      return false;
    }
    if (artifact && artifact.id === 44) {
      game.effects.print(12);
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (artifact) {
      switch (artifact.id) {
        case 11:
          // chalice
          game.effects.print(10);
          game.player.injure(game.diceRoll(1, 8));
          break;
        case 15:
          game.history.write("You put on your clothes...");
          game.player.wear(artifact);
          break;
        case 71:
          game.history.write("You take back your gold...");
          game.player.wear(artifact);
          break;
      }
    }
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    // bozworth disappears if attacked/blasted
    if (target.id === 69) {
      game.history.write("They have enough problems already!");
      return false;
    }
    return true;
  },

  "open": function(arg: string, artifact: Artifact, command: OpenCommand) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 13 && !game.data["open chest"]) {
        game.data["open chest"] = true;
        game.effects.print(20, "special");
      }
    }
  },

  "endTurn": function() {
    let game = Game.getInstance();

    // show water message even in dark rooms
    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource() && game.player.room_id < 15) {
      game.effects.print(18);
    }

    // put the "rising water" artifact in the room
    if (game.player.room_id < 15) {
      game.data["water level"]++;
      if (game.data["water level"] >= 15) {
        game.artifacts.get(game.data["water artifact"]).destroy();
        game.data["water artifact"]++;
        game.data["water level"] = 0;
        if (game.data["water artifact"] >= 40) {
          game.history.write("The ship just sank, taking you with it!", "emphasis");
          game.die();
        }
      }
      game.artifacts.get(game.data["water artifact"]).moveToRoom(game.player.room_id);
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

}; // end event handlers


// declare any functions used by event handlers and custom commands
