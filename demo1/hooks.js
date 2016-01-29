var hooks = [];

hooks.push({
  name: 'beforeGet',
  run: function(verb, arg) {
    var ar = this.game.artifacts.getByName(arg);
    // special message when the player tries to pick up the throne
    if (ar && ar.id == 1) {
      this.game.history.write("There's no way you'll ever be able to carry the throne!");
      return false;
    }
    return true;
  }
});

hooks.push({
  name: 'afterGet',
  run: function(verb, arg) {
    var ar = this.game.artifacts.getByName(arg);
    // special message when the player finds the treasure
    if (ar && ar.id == 3) {
      this.game.history.write("The magic sword is so shiny you decided to ready it.");
      this.game.monsters.player.ready(ar);
    }
    return true;
  }
});

hooks.push({
  name: 'say',
  run: function(verb, arg) {
    // 'say trollsfire' is the same as running the command 'trollsfire'
    if (arg == 'trollsfire') {
      this.game.command_parser.run('trollsfire');
    }
  }
});
