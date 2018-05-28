import {Game} from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";
import {buyDrink, rentRoom} from "../sword-of-inari/event-handlers";

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
