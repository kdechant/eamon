import Game from "../../core/models/game";
import {light_trollsfire, put_out_trollsfire} from "./event-handlers";

declare let game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "trollsfire",
  verbs: ["trollsfire"],
  description: "Activates a special item.",
  examples: ['TROLLSFIRE or SAY TROLLSFIRE'],
  run: function(verb: string, arg: string): void {
    const trollsfire = game.artifacts.get(10);

    if (game.player.hasArtifact(trollsfire.id)) {
      if (!trollsfire.is_lit) {
        game.effects.print(4, "success");
        if (game.player.weapon_id === trollsfire.id) {
          // player has trollsfire ready. increase its stats.
          light_trollsfire();
        } else {
          // turned on when carrying but not ready. Ouch.
          game.effects.print(5, "warning");
          game.player.injure(game.diceRoll(1, 5), true);
        }
      } else {
        game.effects.print(6, "success");
        put_out_trollsfire();
      }
    } else {
      game.history.write("Nothing happens.");
    }
  },
});
