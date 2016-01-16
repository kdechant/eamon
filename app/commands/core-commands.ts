import {BaseCommand} from './base-command';

export var core_commands: BaseCommand[] = [];

export class MoveCommand implements BaseCommand {
  name: string = 'move';
  verbs: string[] = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd'];
  run(verb, arg) {
    // TODO: implement room move here
    return ('Moving '+verb);
  }
}
core_commands.push(new MoveCommand());

export class SayCommand implements BaseCommand {
  name: string = 'say';
  verbs: string[] = ['say'];
  run(verb, arg) {
    return 'Ok... "'+arg+'"'
  }
}
core_commands.push(new SayCommand());
