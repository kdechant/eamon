import Game from "../../core/models/game";

declare let game: Game;

export var custom_commands = [];

custom_commands.push({
  name: 'trollsfire',
  verbs: ['trollsfire'],
  run: function(verb, arg) {
    game.history.write('As you say the magic word (Trollsfire), green flames rise from the sword\'s blade');
  }
});

custom_commands.push({
  name: 'go',
  verbs: ['go'],
  run: function(verb, arg) {
    const exits = game.rooms.current_room.exits;
    const rand = exits[Math.floor(Math.random() * exits.length)];
    game.command_parser.run(rand.direction, false);
  }
});
