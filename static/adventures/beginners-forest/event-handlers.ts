import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // add your custom game start code here

    game.data["queen effect"] = game.player.gender === "m" ? 5 : 6;
    game.data["queen artifact"] = game.player.gender === "m" ? 7 : 15;
    game.data["spook count"] = 0;
    game.data["met queen"] = false;

    // set up the entrance/exit gates
    game.artifacts.get(19).seen = true;
    game.artifacts.get(20).seen = true;
    game.artifacts.get(20).name = game.artifacts.get(19).name;
    game.rooms.getRoomById(1).seen = true;
    game.rooms.getRoomById(33).seen = true;

    // clear the spooks group count
    game.monsters.get(9).count = 0;

    // Sir Grummor is always kind to the ladies!
    if (game.player.gender === 'f') {
      game.monsters.get(4).friendliness = Monster.FRIEND_ALWAYS;
    }

    // entrance routine, similar to Beginner's Cave
    game.effects.print(9);
    game.effects.print(11);

    if (game.player.weapon_id === null) {
      game.effects.print(12);
    } else if (game.player.weapon_abilities[1] === 5 &&
        game.player.weapon_abilities[2] === -10 &&
        game.player.weapon_abilities[3] === 20 &&
        game.player.weapon_abilities[4] === 10 &&
        game.player.weapon_abilities[5] === 0) {
      game.effects.print(15);
    } else {
      // not a beginner
      game.effects.print(13);
      game.monsters.get(11).moveToRoom(1);
    }

  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // ranger
    if (target.id === 11) {
      game.history.write(target.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // ranger
    if (target.id === 11) {
      game.history.write(target.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "death": function(monster: Monster) {
    let game = Game.getInstance();
    // spooks
    if (monster.id === 9) {
      game.effects.print(8);
      // reset the count, or else the next time they appear there would be 2
      if (monster.count === 1) {
        monster.count = 0;
      }
    }
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();
    // ranger
    if (recipient.id === 11) {
      game.history.write(recipient.name + " is still pretending that you aren't here.");
    }
    return true;
  },

  "take": function(arg: string, item: Artifact, monster: Monster) {
    let game = Game.getInstance();
    // ranger
    if (monster.id === 11) {
      game.history.write(monster.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -2:

        game.history.write("The path is washed out!");
        return false;

      case -33:

        // spooky water
        game.effects.print(3);
        exit.room_to = 1;
        break;

      case -34:

        // beaver dam
        game.effects.print(1);
        exit.room_to = 33;
        break;

      case -35:

        // trying to climb the cliff
        game.effects.print(4);
        game.player.injure(4);
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

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    if (artifact !== null) {
      // some readable artifacts have their text contained in the artifact description
      if (artifact.id === 19 || artifact.id === 20) {
        game.history.write(artifact.description, "special");
        command.markings_read = true;  // suppresses the "no markings to read" message
      } else if (artifact.id === 3) {
        // scroll vanishes
        artifact.destroy();
      }
    }
  },

  "wear": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    // agility ring
    if (target.id === 2) {
      game.history.write("You can feel the new agility flowing through you!", "success");
      if (game.player.speed_time === 0) {
        game.player.speed_multiplier = 2;
      }
      game.player.speed_time += 10 + game.diceRoll(1, 10);
    }
    return true;
  },

  "spellExpires": function(spell_name) {
    let game = Game.getInstance();
    // if wearing the agility ring, it disappears
    let ring = game.artifacts.get(2);
    if (spell_name === 'speed' && ring.monster_id === 0 && ring.is_worn) {
      game.effects.print(17, 'success');
      ring.destroy();
    }
  },

  "endTurn": function() {
    let game = Game.getInstance();

    // spooks
    let spooks = game.monsters.get(9);
    if (game.player.room_id > 1 && game.player.room_id < 5 && game.data["spook count"] < 10 && spooks.count < 4) {
      let rl = game.diceRoll(1, 100);
      if (rl < 35) {
        spooks.seen = false;
        spooks.room_id = game.player.room_id;
        spooks.count++;
      }
    }

    // fairy queen
    let queen = game.monsters.get(8);
    if (queen.room_id === game.player.room_id && !game.data["met queen"]) {
      game.data["met queen"] = true;
      game.effects.print(game.data["queen effect"]);
      game.artifacts.get(game.data["queen artifact"]).moveToRoom();

      // grass blade turns into Greenblade
      let blade = game.artifacts.get(6);
      if (blade.isHere()) {
        blade.destroy();
        game.artifacts.get(8).moveToRoom();
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
