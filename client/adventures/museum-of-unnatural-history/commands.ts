import Game from "../../core/models/game";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const custom_commands = [];

custom_commands.push({
  name: "assemble",
  verbs: ["assemble"],
  description: "Puts something together. You'll need the required components first.",
  examples: ['ASSEMBLE something'],
  run: function(verb: string, arg: string): void {
    arg = arg.toLowerCase();

    if (arg === 'powder' || arg === 'gunpowder') {
      if (game.artifacts.allAreHere([1, 7, 19])) {
        game.effects.print(12);
        game.artifacts.get(35).moveToRoom();
      } else {
        game.effects.print(14);
      }
    }

    if (arg === 'bomb' || arg === 'device') {
      if (game.data.made_bomb) {
        game.history.write('You already did!');
        return;
      }
      if (game.artifacts.allAreHere([14, 16, 35])) {
        game.effects.print(13);
        game.artifacts.get(14).destroy();
        game.artifacts.get(16).destroy();
        game.artifacts.get(35).destroy();
        game.artifacts.get(34).moveToRoom();
        game.data.made_bomb = true;
      } else {
        game.effects.print(15);
      }
    }
  },
});
