var commands = [];

commands.push({
  name: 'trollsfire',
  verbs: ['trollsfire'],
  run: function(verb, arg) {
    return 'As you say the magic word (Trollsfire), green flames rise from the sword\'s blade';
  }
});

commands.push({
  name: 'go',
  verbs: ['go'],
  run: function(verb, arg) {
    var exits = this.game.rooms.current_room.exits;
    var rand = exits[Math.floor(Math.random() * exits.length)];
    this.game.command_parser.run(rand.direction);
  }
});
