import {Injectable} from 'angular2/core';

import {GameLoaderService} from '../services/game-loader.service';
import {GameData} from '../models/game-data';

import {BaseCommand} from '../commands/base-command';
import {core_commands} from '../commands/core-commands';
// TODO: import custom commands

/**
 * Command Parser class. Handles registration of available commands and parsing
 * user input.
 */
@Injectable()
export class CommandParserService {

  /**
   * A reference to the GameData object
   */
  game: GameData;

  /**
   * A hash map of all the verbs used by the registered commands
   */
  available_verbs: { [key:string]:string; } = {};
  
  /**
   * A hash map containing all the registered commands, keyed by command machine name
   */
  available_commands: { [key:string]:BaseCommand; } = {};

  constructor(private _gameLoader: GameLoaderService) {
    
    this.game = this._gameLoader.game_data;
    
    for(var i in core_commands) {
      this.register(core_commands[i]);
    }
  }

  /**
   * Adds a command to the list of registered commands
   * @param BaseCommand command The command object, a subclass of BaseCommand
   */
  register(command:BaseCommand) {
    
    // no easy way to do DI at the time the command objects are created,
    // so do it manually here.
    command._commandParserService = this;
    command.game = this.game;
    
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
        var msg = command.run(verb, args);
        this.game.tick();
      } catch (ex) {
        var msg:string = ex.message;
      }
      
      return msg;
    } else {
      return "I don't know the command "+verb+"!";
    }
    
  }
  
}
