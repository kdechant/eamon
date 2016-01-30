import {BaseCommand} from './base-command';
import {Game} from '../models/game';
import {RoomExit} from '../models/room';
import {CommandException} from '../utils/command.exception';

export var core_commands = [];

export class MoveCommand implements BaseCommand {
  name: string = 'move';
  verbs: string[] = ['north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd'];

  run(verb, arg) {

    var game = Game.getInstance();

    // TODO: turn "north" into "n"
    var exit = game.rooms.current_room.getExit(verb);
    var msg:string;
    if (exit === null) {
      throw new CommandException("You can't go that way!");
    } else if (exit.isLocked()) {
      throw new CommandException("The door is locked and you don't have the key!");
    } else {

      // hostile monsters prevent the player from moving
      if (game.in_battle) {
        throw new CommandException("You can't do that with unfriendlies about!");
      }

      // if a key was used, tell the player which key they used.
      if (exit.key_id) {
        var key = game.artifacts.get(exit.key_id);
        game.history.write("You unlock the door using the " + key.name + ".");
      }

      var room_to = game.rooms.getRoomById(exit.room_to);
      game.history.write("Entering " + room_to.name);
      game.monsters.player.moveToRoom(room_to.id);

      // TODO: move friendly monsters

    }
  }
}
core_commands.push(new MoveCommand());


export class LookCommand implements BaseCommand {
  name: string = 'look';
  verbs: string[] = ['look','examine'];
  run(verb, arg) {
    var game = Game.getInstance();

    // look event. can be used to reveal secret doors, etc.
    game.triggerEvent('look', arg);

    if (arg == '') {
      // if not looking at anything in particular, show the room description
      game.history.write(game.rooms.current_room.description);
    } else {
      // looking at a specific thing.

      var match = false;

      // see if there is a matching artifact.
      for (var i in game.artifacts.all) {
        var a = game.artifacts.all[i];
        if (a.name == arg && a.room_id == game.rooms.current_room.id) {
          match = true;
          // if it's an embedded artifact, reveal it
          if (a.embedded) {
            a.embedded = false;
          }
          game.history.write(a.description);
        }
      }
      // see if there is a matching monster.
      for (var i in game.monsters.all) {
        match = true;
        var m = game.monsters.all[i];
        if (m.name == arg && m.room_id == game.rooms.current_room.id) {
          game.history.write(m.description);
        }
      }

      // error message if nothing matched
      if (!match) {
        throw new CommandException("I see no " + arg + " here!");
      }

    }
  }
}
core_commands.push(new LookCommand());


export class SayCommand implements BaseCommand {
  name: string = 'say';
  verbs: string[] = ['say'];
  run(verb, arg) {
    var game = Game.getInstance();

    game.history.write('Ok... "'+arg+'"')
    game.triggerEvent('say', arg);

  }
}
core_commands.push(new SayCommand());


export class GetCommand implements BaseCommand {
  name: string = 'get';
  verbs: string[] = ['get', 'take'];
  run(verb, arg) {

    var game = Game.getInstance();

    var match = false;

    for (var i in game.artifacts.visible) {
      var a = game.artifacts.visible[i];
      if (arg == a.name || arg == 'all') {
        match = true;
        if (game.triggerEvent('beforeGet', a)) {
          if (game.monsters.player.weight_carried + a.weight <= game.monsters.player.maxWeight()) {
            game.monsters.player.pickUp(a);
            game.history.write(a.name + ' taken.');
            game.triggerEvent('afterGet', a)
          } else {
            game.history.write(a.name + ' is too heavy.');
          }
        }
      }
    }

    // message if nothing was taken
    if (!match && arg != 'all') {
      throw new CommandException("I see no " + arg + " here!")
    }
  }
}
core_commands.push(new GetCommand());


export class DropCommand implements BaseCommand {
  name: string = 'drop';
  verbs: string[] = ['drop'];
  run(verb, arg) {

    var game = Game.getInstance();

    var match = false;

    var inventory = game.monsters.player.inventory;
    for (var i in inventory) {
      match = true;
      if (arg == inventory[i].name || arg == 'all') {
        game.monsters.player.drop(inventory[i]);
        game.history.write(inventory[i].name + " dropped.")
      }
    }

    // message if nothing was dropped
    if (!match && arg != 'all') {
      throw new CommandException("You aren't carrying a " + arg + "!")
    }
  }
}
core_commands.push(new DropCommand());


export class ReadyCommand implements BaseCommand {
  name: string = 'ready';
  verbs: string[] = ['ready'];
  run(verb, arg) {

    var game = Game.getInstance();

    var match = false;

    var inventory = game.monsters.player.inventory;
    for (var i in inventory) {
      match = true;
      if (arg == inventory[i].name) {
        game.monsters.player.ready(inventory[i]);
        game.history.write(inventory[i].name + " readied.")
      }
    }

    // message if nothing was dropped
    if (!match) {
      throw new CommandException("You aren't carrying a " + arg + "!")
    }
  }
}
core_commands.push(new ReadyCommand());


export class FleeCommand implements BaseCommand {
  name: string = 'flee';
  verbs: string[] = ['flee'];
  run(verb, arg) {
    var game = Game.getInstance();

    if (!game.in_battle) {
      throw new CommandException("There is nothing to flee from!");
    }

    // choose a random exit
    var exits:RoomExit[] = game.rooms.current_room.exits;
    var good_exits:RoomExit[] = [];
    // exclude any locked exit and the game exit
    for (var i in exits) {
      if (exits[i].room_to != RoomExit.EXIT && !exits[i].isLocked()) {
        good_exits.push(exits[i]);
      }
    }
    if (good_exits.length == 0) {
      throw new CommandException("There is nowhere to flee to!");
    } else {
      var random_exit = good_exits[Math.floor(Math.random() * good_exits.length)];

      var room_to = game.rooms.getRoomById(random_exit.room_to);
      game.history.write("Fleeing to " + room_to.name);
      game.monsters.player.moveToRoom(room_to.id);

      // TODO: check if other monsters follow
    }
  }
}
core_commands.push(new FleeCommand());
