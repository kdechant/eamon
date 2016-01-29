import {Game} from "../app/models/game";

export var hooks = [];

hooks.push({
  name: 'beforeGet',
  run: function(verb, arg) {
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

hooks.push({
  name: 'afterGet',
  run: function(verb, arg) {
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

hooks.push({
  name: 'say',
  run: function(verb, arg) {
    var game = Game.getInstance();
    // 'say trollsfire' is the same as running the command 'trollsfire'
    if (arg == 'trollsfire') {
      game.command_parser.run('trollsfire', false);
    }
  }
});
