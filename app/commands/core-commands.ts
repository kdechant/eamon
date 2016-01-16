import {BaseCommand} from './base-command';
import {RoomService} from '../services/room.service';
import {CommandParserService} from '../services/command-parser.service';

export var core_commands = [];

export class MoveCommand extends BaseCommand {
  name: string = 'move';
  verbs: string[] = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd'];
  
  run(verb, arg) {
    
    // TODO: turn "north" into "n"
    var exit = this._roomService.current_room.getExit(verb);
    var msg:string;
    if (exit === null) {
      msg = "You can't go that way!";
    } else {
    
      // TODO: monster checks and key checks go here
      
      var room_to = this._roomService.getRoomById(exit.room_to);
      msg = "Entering " + room_to.name;
      this._roomService.moveTo(room_to.id);
      
      // TODO: move friendly monsters
      
      // show room description if first time seeing
      if (this._roomService.current_room.times_visited == 1) {
        msg += "\n\n"+this._roomService.current_room.description;
      }
      
    }
    
    return msg;
  }
}
core_commands.push(new MoveCommand());

export class SayCommand extends BaseCommand {
  name: string = 'say';
  verbs: string[] = ['say'];
  run(verb, arg) {
    return 'Ok... "'+arg+'"'
  }
}
core_commands.push(new SayCommand());
