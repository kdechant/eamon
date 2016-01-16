import {BaseCommand} from './base-command';
import {RoomService} from '../services/room.service';

export var core_commands = [];

export class MoveCommand implements BaseCommand {
  name: string = 'move';
  verbs: string[] = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd'];
  _roomService: RoomService;
  
  run(verb, arg) {
    
    // TODO: turn "north" into "n"
    var exit = this._roomService.current_room.getExit(verb);
    if (exit === null) {
      var msg = "You can't go that way!";
    } else {
    
      // TODO: monster checks and key checks go here
      
      var room_to = this._roomService.getRoomById(exit.room_to);
      var msg = "Moving to " + room_to.name;
      this._roomService.moveTo(room_to.id);
    }
    
    return msg;
  }
}
core_commands.push(new MoveCommand());

export class SayCommand implements BaseCommand {
  name: string = 'say';
  verbs: string[] = ['say'];
  _roomService: RoomService;
  run(verb, arg) {
    return 'Ok... "'+arg+'"'
  }
}
core_commands.push(new SayCommand());
