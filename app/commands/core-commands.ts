import {BaseCommand} from './base-command';
import {Game} from '../models/game';

export var core_commands = [];

export class MoveCommand extends BaseCommand {
  name: string = 'move';
  verbs: string[] = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd'];

  run(verb, arg) {

    var game = Game.getInstance();

    // TODO: turn "north" into "n"
    var exit = game.rooms.current_room.getExit(verb);
    var msg:string;
    if (exit === null) {
      throw new Error("You can't go that way!");
    } else {

      // TODO: monster checks and key checks go here

      var room_to = game.rooms.getRoomById(exit.room_to);
      msg = "Entering " + room_to.name;
      Game.getInstance().monsters.player.room_id = room_to.id;
      Game.getInstance().rooms.moveTo(room_to.id);

      // TODO: move friendly monsters

      // show room description if first time seeing
      if (game.rooms.current_room.times_visited == 1) {
        msg += "\n\n"+Game.getInstance().rooms.current_room.description;
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

    var game = Game.getInstance();

    var output = '';
    var match = false;

    for (var i in game.artifacts.visible) {
      var a = game.artifacts.visible[i];
      if (arg == a.name || arg == 'all') {
        match = true;
        if (game.monsters.player.weight_carried + a.weight <= game.monsters.player.maxWeight()) {
          game.monsters.player.pickUp(a);
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

    var game = Game.getInstance();

    var output = '';
    var match = false;

    var inventory = game.monsters.player.getInventory();
    for (var i in inventory) {
      match = true;
      if (arg == inventory[i].name || arg == 'all') {
        game.monsters.player.drop(inventory[i]);
        output += inventory[i].name + " dropped."
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
