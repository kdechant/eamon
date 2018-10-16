import {Game} from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "buy",
  verbs: ["buy"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    arg = arg.toLowerCase();
    if (arg === 'drink' || arg === 'beer') {
      if (game.monsters.get(8).isHere()) {
        game.command_parser.run('give 10 to bartender', false);
      } else {
        throw new CommandException("There is no one here to buy a drink from!");
      }
    } else {
      throw new CommandException("No one here has that for sale.");
    }

  },
});

custom_commands.push({
  name: "rent",
  verbs: ["rent"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    if (arg.toLowerCase() === 'room') {
      if (game.monsters.get(9).isHere()) {
        game.command_parser.run('give 10 to innkeeper', false);
      } else {
        throw new CommandException("There is no one here to rent a room from!");
      }
    } else {
      throw new CommandException("I'm not sure what you're talking about.");
    }

  },
});

custom_commands.push({
  name: "pay",
  verbs: ["pay"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    // this command is just a friendly alias for giving money to a couple of NPCs
    let npc = game.monsters.getLocalByName(arg);
    if (npc) {
      if (npc.id === 8) {
        game.command_parser.run('give 10 to bartender', false);
      } else if (npc.id === 9) {
        game.command_parser.run('give 10 to innkeeper', false);
      } else {
        game.history.write(npc.name + " doesn't have anything to buy");
      }
    } else {
      throw new CommandException("No one here by that name.");
    }

  },
});

custom_commands.push({
  name: "pull",
  verbs: ["pull"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    // this command is really just a wrapper around the "use" command

    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if (artifact.id === 9) {
        // bell rope. "play x" is just a synonym for "use x"
        artifact.use();
      } else {
        game.history.write("Nothing happens.");
      }
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }

  },
});
