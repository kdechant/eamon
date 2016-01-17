import {GameData} from '../models/game-data';
import {CommandParserService} from '../services/command-parser.service';

/**
 * Class BaseCommand.
 * Interface for commands a player can give.
 */
export class BaseCommand {
  name: string;
  verbs: Array<string>;
  game: GameData;
  
  _commandParserService: CommandParserService;
  
  run(verb, arg) {
    return '';
  }
}
