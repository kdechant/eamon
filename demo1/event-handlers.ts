import {Game} from "../app/models/game";

export var event_handlers = [];

event_handlers.push({
  name: 'beforeGet',
  run: function(arg) {
    var game = Game.getInstance();
    var ar = game.artifacts.getByName(arg);
    // special message when the player tries to pick up the throne
    if (ar && ar.id == 1) {
      game.history.write("There's no way you'll ever be able to carry the throne!");
      return false;
    }
    return true;
  }
});

event_handlers.push({
  name: 'afterGet',
  run: function(arg) {
    var game = Game.getInstance();
    var ar = game.artifacts.getByName(arg);
    // special message when the player finds the treasure
    if (ar && ar.id == 3) {
      game.history.write("The magic sword is so shiny you decided to ready it.");
      game.monsters.player.ready(ar);
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
