import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

declare var game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "play",
  verbs: ["play"],
  run: function(verb: string, arg: string): void {
    // this command is really just a wrapper around the "use" command
    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if (artifact.id === 21) {
        // harmonica. "play x" is just a synonym for "use x"
        artifact.use();
      } else {
        throw new CommandException("You can't play that.");
      }
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }

  },
});
