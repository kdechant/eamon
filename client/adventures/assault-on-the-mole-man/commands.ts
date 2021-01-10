import Game from "../../core/models/game";
import {CommandException} from "../../core/utils/command.exception";

declare let game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "push",
  verbs: ["push", "hit"],
  description: "Used for pushing buttons on machinery.",
  examples: ['PUSH BUTTON', 'HIT BUTTON'],
  run: function(verb: string, arg: string): void {
    // this command is really just an alias for the "use" command
    const artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if ([8,9,14,15].indexOf(artifact.id) !== -1) {
        // buttons. "push x" is just a synonym for "use x"
        artifact.use();
      } else {
        game.history.write("Nothing happens.");
      }
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }
  },
});

