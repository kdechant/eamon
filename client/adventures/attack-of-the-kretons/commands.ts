import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "talk",
  verbs: ["talk"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    if (arg.indexOf('to ') !== -1) {
      arg = arg.slice(4);
    }

    let monster = game.monsters.getLocalByName(arg);
    if (monster) {
      if (monster.id === 2) {
        // minstrel
        game.effects.printSequence([2,3,4,5,6,7,8,9,10,11]);
        monster.destroy();
        game.monsters.get(3).moveToRoom();
        game.artifacts.get(8).moveToRoom();
        return;
      }
      if (monster.id === 6 && game.data['prince unconscious']) {
        game.history.write('The prince is unconscious.');
        return;
      }
      // chichester (first time)
      if (monster.id === 16 && monster.hasArtifact(19)) {
        game.artifacts.get(16).moveToRoom();
        game.effects.printSequence([32, 33]);
        monster.reaction = Monster.RX_FRIEND;
      }
      // sage
      if (monster.id === 21 && game.data['sage wants rum'] === 0) {
        game.effects.print(54);
        return;
      }

      // other monsters have either a standard response or an effect ID
      switch (monster.data['talk']) {
        case -1:
          game.history.write("GRRR...");
          break;
        case -2:
          game.history.write("You mendicant! You shall die!");
          break;
        case -3:
          game.history.write("No response.");
          break;
        case 0:
          game.history.write("You talk about the barbarian horde and when it will finally kill you all.");
          break;
        default:
          game.effects.print(monster.data['talk']);
          break;
      }
      return;
    }

    // if you try to talk to an artifact
    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      game.history.write('No response.');
    }
  }
});

