import {Game} from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "dig",
  verbs: ["dig"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    // this command is really just a wrapper around the "use" command

    if (game.artifacts.get(3).isHere()) {
      game.command_parser.run("use shovel");
    } else {
      throw new CommandException("You don't have anything to dig with.");
    }

  },
});

custom_commands.push({
  name: "play",
  verbs: ["play"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    // this command is really just a wrapper around the "use" command

    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if (artifact.id === 18) {
        // magic harp
        game.command_parser.run("use magic harp");
      } else if (artifact.id === 31) {
        // flute
        game.command_parser.run("use flute");
      } else {
        throw new CommandException("You can't play that.");
      }
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }

  },
});
