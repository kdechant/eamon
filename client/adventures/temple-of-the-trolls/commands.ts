import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

declare var game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "kiss",
  verbs: ["kiss"],
  description: "Kiss someone or something.",
  examples: ['KISS (NAME OF NPC)'],
  run: function(verb: string, arg: string): void {
    let m: Monster = game.monsters.getLocalByName(arg);
    if (m) {
      game.history.write(">>>>> SMACK! <<<<<");
      if (m.id === 3) {
        if (game.player.gender === 'f') {
          game.history.write("Wenda is flattered, but she would be more interested in a male adventurer.");
        } else {
          game.history.write("She liked it!");
          m.reaction = Monster.RX_FRIEND;
        }
      } else if (m.id === 8) {
        game.effects.print(15);
        m.destroy();
      } else {
        if (m.reaction !== Monster.RX_HOSTILE) {
          game.history.write(m.name + ' tells you to keep your hands to yourself!');
        } else {
          game.history.write(m.name + ' snarls at you!');
        }
      }
      return;
    }

    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      throw new CommandException("Why would you want to kiss that?");
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }

  },
});
