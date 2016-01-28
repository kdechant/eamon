import {BaseCommand} from './base-command';

export var core_commands = [];

export class MoveCommand extends BaseCommand {
  name: string = 'move';
  verbs: string[] = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd'];

  run(verb, arg) {

    // TODO: turn "north" into "n"
    var exit = this.game.rooms.current_room.getExit(verb);
    var msg:string;
    if (exit === null) {
      throw new Error("You can't go that way!");
    } else {

      // TODO: monster checks and key checks go here

      var room_to = this.game.rooms.getRoomById(exit.room_to);
      msg = "Entering " + room_to.name;
      this.game.monsters.player.room_id = room_to.id;
      this.game.rooms.moveTo(room_to.id);

      // TODO: move friendly monsters

      // show room description if first time seeing
      if (this.game.rooms.current_room.times_visited == 1) {
        msg += "\n\n"+this.game.rooms.current_room.description;
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

export class GetCommand extends BaseCommand {
  name: string = 'get';
  verbs: string[] = ['get', 'take'];
  run(verb, arg) {

    var output = '';
    var match = false;

    for (var i in this.game.artifacts.visible) {
      var a = this.game.artifacts.visible[i];
      if (arg == a.name || arg == 'all') {
        match = true;
        if (this.game.monsters.player.weight_carried + a.weight <= this.game.monsters.player.maxWeight()) {
          this.game.monsters.player.pickUp(a);
          output += a.name + ' taken.';
        } else {
          output += a.name + ' is too heavy.';
        }
      }
    }

    // message if nothing was taken
    if (!match && arg != 'all') {
      throw new Error("I see no " + arg + " here!")
    }

    return output;
  }
}
core_commands.push(new GetCommand());

export class DropCommand extends BaseCommand {
  name: string = 'drop';
  verbs: string[] = ['drop'];
  run(verb, arg) {

    var output = '';
    var match = false;

    var inventory = this.game.monsters.player.getInventory();
    for (var i in inventory) {
      match = true;
      if (arg == inventory[i].name || arg == 'all') {
        this.game.monsters.player.drop(inventory[i]);
      }
    }

    // message if nothing was dropped
    if (!match && arg != 'all') {
      throw new Error("You aren't carrying a " + arg + "!")
    }

    return output;
  }
}
core_commands.push(new DropCommand());
