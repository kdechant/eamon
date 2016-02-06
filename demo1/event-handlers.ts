import {Game} from "../app/models/game";
import {Artifact} from "../app/models/artifact";
import {Monster} from "../app/models/monster";

export var event_handlers = [];

event_handlers.push({
  name: 'beforeGet',
  run: function(artifact) {
    var game = Game.getInstance();
    // special message when the player tries to pick up the throne
    if (artifact && artifact.id == 1) {
      game.history.write("There's no way you'll ever be able to carry the throne!");
      return false;
    }
    return true;
  }
});

event_handlers.push({
  name: 'afterGet',
  run: function(artifact) {
    var game = Game.getInstance();
    // special message when the player finds the treasure
    if (artifact && artifact.id == 3) {
      game.history.write("The magic sword is so shiny you decided to ready it.");
      game.monsters.player.ready(artifact);
    }
    return true;
  }
});

event_handlers.push({
  name: 'say',
  run: function(arg) {
    var game = Game.getInstance();
    // 'say trollsfire' is the same as running the command 'trollsfire'
    if (arg == 'trollsfire') {
      game.command_parser.run('trollsfire', false);
    }
  }
});

event_handlers.push({
  name: 'use',
  // 'use' event handler takes an Artifact as an argument
  run: function(artifact) {
    var game = Game.getInstance();
    switch (artifact.name) {
      case 'bread':
        if (game.monsters.get(1).room_id == game.rooms.current_room.id) {
          game.history.write("The guard shouts at you for stealing his bread.", "warning")
          game.monsters.get(1).reaction = Monster.RX_HOSTILE;
        } else {
          game.history.write("It tases OK. Would be better with some cheese.")
        }
        break;
    }
  }
});

event_handlers.push({
  name: 'power',
  // 'power' event handler takes a 1d100 dice roll as an argument
  run: function(roll) {
    var game = Game.getInstance();
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 75) {
      // teleport to random room
      game.history.write("You are being teleported...");
      var room = game.rooms.getRandom();
      game.monsters.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else {
      game.history.write("All your wounds are healed!");
      game.monsters.player.heal(1000);
    }
  }
});

event_handlers.push({
  name: 'read',
  // the 'read' event handler should return true if the handler did something,
  // otherwise the "there are no markings to read" message will appear.
  run: function(arg) {
    var game = Game.getInstance();
    if (arg == 'black book') {
      var a = game.artifacts.getByName(arg);
      if (a.room_id == game.rooms.current_room.id || a.monster_id == 0) {
        game.history.write("The book zaps you when you open it!", "danger");
        game.monsters.player.injure(5);
      } else {
        game.history.write("I don't see a " + arg + "!");
      }
      return true;
    }
  }
});

event_handlers.push({
  name: 'beforeRemove',
  run: function(artifact: Artifact) {
    var game = Game.getInstance();
    // special message when the player tries to pick up the throne
    if (artifact) {
      if (artifact.id == 13) {
        game.history.write("Sucker! The jewels are fake. The thief must have stolen the real ones.");
        artifact.name = 'Fake jewels';
        artifact.value = 0;
      } else if (artifact.id == 14) {
        game.history.write("A magic force is holding the wand in the chest. You can't remove it.");
        return false;
      }
    }
    return true;
  }
});

event_handlers.push({
  name: 'afterRemove',
  run: function(artifact) {
    var game = Game.getInstance();
    // special message when the player finds the treasure
    if (artifact && artifact.id == 3) {
      game.history.write("That's a fine-looking sword.");
    }
    return true;
  }
});
