import {Game} from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "wave",
  verbs: ["wave"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    // this command is really just a wrapper around the "use" command

    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if (artifact.id === 3) {
        // black wand. "wave x" is just a synonym for "use x"
        artifact.use();
      } else {
        throw new CommandException("Nothing happens.");
      }
    } else {
      throw new CommandException("Nothing happens.");
    }

  },
});
