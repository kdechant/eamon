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
    game.data['combo'] = [
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8)),
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8)),
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8)),
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8))
    ];
    game.data['drinking contest active'] = false;
    game.data['locate active'] = false;
    game.data["protection spell text"] = false;
    // game.data["worm text"] = false;

  },

  "endTurn2": function() {
    let game = Game.getInstance();
    if (game.player.room_id === 42 && game.monsters.get(31).isHere() && !game.data["protection spell text"]) {
      game.effects.print(3);
      game.data["protection spell text"] = true;
    }

  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // gerschter bar
    if (game.player.room_id === 7) {
      game.effects.print(9);
      game.player.moveToRoom()
      game.monsters.get(20).room_id = null;
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    console.log(room, exit)

    if (exit.room_to === -5) {
      game.effects.print(5, "danger");
      game.effects.print(6, "danger");
      game.die();
      return false;
    } else if (exit.room_to === -999) {
      if (game.player.hasArtifact(25)) {
        game.effects.print(41);
      } else if (game.artifacts.get(25).room_id === null && game.artifacts.get(25).monster_id === null) {
        // drank it
        game.effects.print(40, "danger");
        game.die();
        return false;
      } else {
        game.effects.print(39);
        return false;
      }
    }
    return true;
  },

  "beforeSpell": function(spell_name: string) {
    let game = Game.getInstance();
    // gerschter bar
    if (game.player.room_id === 7) {
      game.effects.print(10);
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();

    if (recipient.id === 6 && artifact.id === 8) {
      // lamp to piano player
      game.effects.print(37);
    } else if (recipient.id === 32 && artifact.id === 13) {
      // amulet to hokas
      game.effects.print(13);
      game.effects.print(14);
      game.data['locate active'] = true;
    } else if (recipient.id === 12 && artifact.id === 22) {
      // slipper to prince
      game.effects.print(38);
      game.artifacts.get(28).moveToRoom();
    }
    return true;
  },

  "open": function(arg: string, artifact: Artifact, command: OpenCommand) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 69) {
        // vault door
        command.opened_something = true; // use this even if we didn't open it, to suppress other messages
        game.modal.show("Enter combination (use dashes):", function(value) {
          if (value === game.data['combo'][3]) {
            game.history.write("The vault door opened!", "success");
            artifact.is_open = true;
          } else {
            game.history.write("The vault door did not open.");
          }
        });
      }
    }
  },

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    if (artifact && artifact.name === 'graffiti') {
      game.history.write("You see some names and measurements:");
      game.history.write("Deede Berry - " + game.data['combo'][0]);
      game.history.write("Fifi LaFrentz - " + game.data['combo'][1]);
      game.history.write("V. Ault - " + game.data['combo'][2]);
      game.history.write("Jamie Zena - " + game.data['combo'][3]);
      command.markings_read = true;
    }
  },

  "say": function(phrase: string) {
    let game = Game.getInstance();
    if ((phrase === 'gronk' || phrase === 'grunt') && game.monsters.get(6).isHere()) {
      game.effects.print(43);
    }
  },

  "seeRoom": function() {
    let game = Game.getInstance();
    // brawl effect shown after room, so it appears before monster desc
    if (game.rooms.current_room.id === 40 && game.monsters.get(25).isHere()) {
      game.effects.print(11);
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    switch (artifact.name) {
      case 'peanuts':
        game.effects.print(2);
        game.player.moveToRoom(36, true);
        break;
      case 'case of rum':
      case 'case of brandy':
      case 'case of vodka':
        game.history.write("What a lush!");
        if (game.monsters.get(11).room_id === null) {
          game.effects.print(27);
          game.monsters.get(11).moveToRoom();
        }
        break;
      case '600 year old scotch':
        game.artifacts.get(26).moveToRoom();
        break;
      case 'strange brew':
        let roll = game.diceRoll(1, 5);
        switch (roll) {
          case 1:
            game.effects.print(28);
            game.player.charisma -= 3;
            break;
          case 2:
            game.effects.print(29);
            game.player.charisma += 3;
            break;
          case 3:
            game.effects.print(30);
            game.player.agility -= 3;
            break;
          case 4:
            game.effects.print(31);
            for (let wa in game.player.weapon_abilities) {
              game.player.weapon_abilities[wa] += 7;
            }
            break;
          case 5:
            game.effects.print(32);
            game.player.armor_expertise += 10;
            break;
        }
        break;
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
    if (game.monsters.get(25).isHere()) {
      game.effects.print(12);
      game.monsters.get(25).room_id = null;
      game.artifacts.get(13).moveToRoom();
      return;
    }
    game.history.write("POWER TODO!")
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
