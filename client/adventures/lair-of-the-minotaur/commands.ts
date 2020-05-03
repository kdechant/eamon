import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

declare var game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "dig",
  verbs: ["dig"],
  description: "Digs a hole.",
  examples: ['DIG'],
  run: function(verb: string, arg: string): void {
    if (game.artifacts.get(9).isHere()) {
      // shovel. "dig" is just a synonym for "use shovel"
      game.artifacts.get(9).use();
    } else {
      throw new CommandException("You don't have anything to dig with.");
    }

  },
});

