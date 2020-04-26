import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";
import {inquisitorIsHere} from "../malleus-maleficarum/event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

export var custom_commands = [];


custom_commands.push({
  name: "worship",
  verbs: ["worship"],
  description: "Used to worship a particular deity.",
  examples: ['WORSHIP GOZER'],
  run: function(verb: string, arg: string): void {
    if (arg === 'magon') {
      game.history.write("You kneel and pray to Magon...");
      if (game.data.worshipped_magon) {
        game.history.write('Nothing else happens.');
        return;
      }
      game.data.worshipped_magon = true;
      game.effects.print(19);
      game.player.charisma += 60;
      game.player.hardiness = 5;
      game.player.agility = 5;
    } else if (arg === 'i am that i am') {
      game.history.write("You kneel and pray to I Am That I Am...");
      game.data.i_am++;
      switch (game.data.i_am) {
        case 1:
          game.effects.print(23);
          if (game.player.hardiness <= 25) {
            game.player.hardiness += 3;
          } else {
            game.player.hardiness += 2;
          }
          break;
        case 2:
          game.effects.print(22);
          break;
        default:
          game.effects.print(21);
      }
      let magon_servants = game.monsters.all.filter(m => m.isHere() && m.special == 'magon');
      if (magon_servants.length) {
        game.effects.print(24);
        magon_servants.forEach(m => m.injure(999));
      }
    } else {
      game.effects.print(29);
    }
  }
});

custom_commands.push({
  name: "destroy",
  verbs: ["destroy", "smash"],
  description: "Destroys something.",
  examples: ['DESTROY EQUIPMENT'],
  run: function(verb: string, arg: string): void {
    // this command is really just a wrapper around the "use" command
    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if (artifact.id >= 14 && artifact.id <= 19) {
        game.command_parser.run(`attack ${artifact.name}`, false);
      } else {
        game.history.write("No point in destroying that.");
      }
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }
  },
});
