import {Game} from '../models/game';

import {BaseCommand} from '../commands/base-command';
import {CustomCommand} from '../commands/base-command';
import {core_commands} from '../commands/core-commands';
import {CommandException} from '../utils/command.exception';

// import custom commands from the adventure directory.
import {custom_commands} from 'adventure/commands';

/**
 * Command Parser class. Handles registration of available commands and parsing
 * user input.
 */
export class CommandParser {

  /**
   * A hash map of all the verbs used by the registered commands
   */
  available_verbs: { [key:string]:string; } = {};

  /**
   * A hash map containing all the registered commands, keyed by command machine name
   */
  available_commands: { [key:string]:BaseCommand; } = {};

  constructor() {

    for(var i in core_commands) {
      this.register(core_commands[i]);
    }

    // register custom commands
    for (var i in custom_commands) {
      var cmd = new CustomCommand();
      cmd.name = custom_commands[i].name;
      cmd.verbs = custom_commands[i].verbs;
      cmd.run = custom_commands[i].run;
      this.register(cmd);
    }
  }

  /**
   * Adds a command to the list of registered commands
   * @param BaseCommand command The command object, a subclass of BaseCommand
   */
  register(command:BaseCommand) {

    // add to the list of verbs, used for parsing commands
    for (var i in command.verbs) {
      this.available_verbs[command.verbs[i]] = command.name;
    }
    // add to the list of all the command objects
    this.available_commands[command.name] = command;

  }

  /**
   * Parses a command into a verb and arguments, then runs the command
   * @param string input The input string from the user, e.g., "n", "get all", "give sword to marcus"
   */
  run(input:string) {

    var game = Game.getInstance();

    input = input.trim();
    var space_pos = input.indexOf(' ');
    if (space_pos == -1) {
      // single word command
      var verb = input;
      var args = '';
    } else {
      // multiple word command
      var verb = input.slice(0, space_pos);
      var args = input.slice(space_pos).trim();
    }

    // look up the command in the list of available verbs
    if (this.available_verbs.hasOwnProperty(verb)) {
      var command = this.available_commands[this.available_verbs[verb]];
      try {
        command.run(verb, args);
        game.tick();
      } catch (ex) {
        if (ex instanceof CommandException) {
          // illegal command. show in game but not in console.
          game.history.write(ex.message);
        } else {
          // an actual JS error occurred. Throw again so error appears in console.
          throw(ex); // for debugging
        }
      }

    } else {
      game.history.write("I don't know the command '"+verb+"'!");
    }

  }

}
