import {RoomService} from '../services/room.service';
import {CommandParserService} from '../services/command-parser.service';

/**
 * Class BaseCommand.
 * Interface for commands a player can give.
 */
export class BaseCommand {
  name: string;
  verbs: Array<string>;
  
  _roomService: RoomService;
  _commandParserService: CommandParserService;
  
  run(verb, arg) {
    return '';
  }
}
