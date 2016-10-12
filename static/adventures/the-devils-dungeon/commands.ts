import {Game} from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "kiss",
  verbs: ["kiss"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    let m: Monster = game.monsters.getLocalByName(arg);
    if (m) {
      game.history.write("SMACK!" + m.name + " blushes slightly.");
      return;
    }

    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      if (artifact.id === 11) {
        // blarney stone
        if (game.data["kissed_blarney_stone"]) {
          game.history.write("Sorry, only one kiss per customer!");
        } else {
          game.history.write("You feel strange...  Your charisma has increased!");
          game.player.charisma++;
          game.data["kissed_blarney_stone"] = true;
        }
      } else if (artifact.id === 12) {
        // sleeping beauty
        game.history.write("As you kiss " + artifact.name + ", the SLEEP spell bounces back, and you too fall asleep, forever forgotten in the Devil's Dungeon!");
        game.die();
      } else {
        throw new CommandException("Why would you want to kiss that?");
      }
    } else {
      throw new CommandException("You don't have it and it's not here.");
    }

  },
});
