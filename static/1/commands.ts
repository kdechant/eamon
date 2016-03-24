import {Game} from "../core/models/game";
import {Monster} from "../core/models/monster";
import {put_out_trollsfire} from "./event-handlers";

export var custom_commands = [];

custom_commands.push({
  name: "trollsfire",
  verbs: ["trollsfire"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    let trollsfire = game.artifacts.get(10);

    if (trollsfire.monster_id === Monster.PLAYER) {
      if (!trollsfire.is_lit) {
        game.effects.print(4);
        if (game.player.weapon_id === trollsfire.id) {
          // player has trollsfire ready. increase its stats.
          trollsfire.is_lit = true;
          trollsfire.sides = 10;
        } else {
          // turned on when carrying but not ready. Ouch.
          game.effects.print(5);
          game.player.injure(game.diceRoll(1, 5), true);
        }
      } else {
        game.effects.print(6);
        put_out_trollsfire();
      }
    } else {
      game.history.write("Nothing happens.");
    }

  },
});
