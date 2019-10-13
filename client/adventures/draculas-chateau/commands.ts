import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "dig",
  verbs: ["dig"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    if (game.artifacts.get(65).isHere()) {
      // shovel. "dig" is just a synonym for "use shovel"
      game.artifacts.get(65).use();
    } else {
      throw new CommandException("You don't have anything to dig with.");
    }

  },
});

