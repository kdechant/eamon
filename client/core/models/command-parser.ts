import Game from "../models/game";

import {BaseCommand} from "../commands/base-command";
import {CustomCommand} from "../commands/base-command";
import {core_commands} from "../commands/core-commands";
import {CommandException} from "../utils/command.exception";

/**
 * Command Parser class. Handles registration of available commands and parsing
 * user input.
 */
export class CommandParser {

  /**
   * A hash map of all the verbs used by the registered commands
   */
  available_verbs: { [key: string]: string; } = {};

  /**
   * A hash map containing all the registered commands, keyed by command machine name
   */
  available_commands: { [key: string]: BaseCommand; } = {};

  constructor(custom_commands) {
    for (let i in core_commands) {
      this.register(core_commands[i]);
    }

    // register custom commands
    for (let c of custom_commands) {
      let cmd = new CustomCommand();
      cmd.name = c.name;
      cmd.verbs = c.verbs;
      cmd.category = c.category;  // for command list modal
      cmd.description = c.description;  // for command list modal
      cmd.examples = c.examples;  // for command list modal
      cmd.run = c.run;
      this.register(cmd);
    }
  }

  /**
   * Adds a command to the list of registered commands
   * @param {BaseCommand} command The command object, a subclass of BaseCommand
   */
  public register(command: BaseCommand): void {

    // add to the list of verbs, used for parsing commands
    for (let i in command.verbs) {
      this.available_verbs[command.verbs[i]] = command.name;
    }
    // add to the list of all the command objects
    this.available_commands[command.name] = command;

  }

  /**
   * Parses a command into a verb and arguments, then runs the command
   * @param {string} input
   *   The input string from the user, e.g., "n", "get all", "give sword to marcus"
   * @param {boolean} tick
   *   Whether to tick the game clock after running this command. Defaults to true.
   *   Set this to false when calling a command from within another command,
   *   to prevent multiple game clock ticks.
   */
  public run(input: string, tick: boolean = true): void {

    let game = Game.getInstance();

    input = input.toLowerCase().trim();
    let space_pos = input.indexOf(" ");
    let verb: string, args: string;
    if (space_pos === -1) {
      // single word command
      verb = input;
      args = "";
    } else {
      // multiple word command
      verb = input.slice(0, space_pos);
      args = input.slice(space_pos).trim();
    }

    // look up the command in the list of available verbs
    let command_match: string[] = [];
    // first, match by the exact string
    if (this.available_verbs.hasOwnProperty(verb)) {
      command_match.push(verb);
    }
    // if no direct match, try the fuzzy matching
    if (command_match.length === 0) {
      let keys: string[] = Object.keys(this.available_verbs);
      for (let k in keys) {
        // @ts-ignore
        if (keys[k].startsWith(verb)) {
          command_match.push(keys[k]);
        }
      }
    }

    if (command_match.length === 1) {
      // found exactly one match. run it.
      let command = this.available_commands[this.available_verbs[command_match[0]]];
      let ct = command_match[0];
      if (typeof command.history_display === 'function') {
        ct = command.history_display(verb);
      }
      if (tick) {
        game.history.push(ct + (args.length ? " " + args : ""));
      }
      try {
        command.run(verb, args);
        if (tick) {
          game.tick();
        }
      } catch (ex) {
        if (ex instanceof CommandException) {
          // illegal command. show in game but not in console.
          game.history.write(ex.message);
        } else {
          // an unexpected JS error. show in console for debugging.
          game.history.write("Error: " + ex.message);
          console.error(ex);
        }
        game.endTurn();
      }

    } else if (command_match.length > 1) {
      game.history.push(input);
      game.history.write("Did you mean '" + command_match.join("' or '") + "'?");
      game.history.display();
    } else {
      game.history.push(input);
      game.history.write("I don't know the command '" + verb + "'!");
      game.history.display();
    }

  }

}
