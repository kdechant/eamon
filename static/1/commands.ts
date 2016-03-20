import {Game} from "../core/models/game";

export var custom_commands = [];

custom_commands.push({
  name: 'trollsfire',
  verbs: ['trollsfire'],
  run: function(verb, arg) {
    var game = Game.getInstance();
    game.history.write('As you say the magic word (Trollsfire), green flames rise from the sword\'s blade');
  }
});
