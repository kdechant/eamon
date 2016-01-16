import {RoomService} from '../services/room.service';

/**
 * Class BaseCommand.
 * Interface for commands a player can give.
 */
export interface BaseCommand {
  name: string;
  verbs: Array<string>;
  
  _roomService: RoomService;
  
  run(verb, arg);
}
