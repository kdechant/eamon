import Game from "../../core/models/game";
import { Monster } from "../../core/models/monster";
import { CommandException } from "../../core/utils/command.exception";
import { destroy } from "./event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const custom_commands = [];

custom_commands.push({
  name: "destroy",
  verbs: ["destroy", "smash"],
  description: "Destroys something.",
  examples: ["DESTROY EQUIPMENT"],
  run: function (verb: string, arg: string): void {
    if (!arg) {
      throw new CommandException("What are you trying to destroy?");
    }
    const target = game.artifacts.getLocalByName(arg);
    console.log("destroy", target);
    if (!target) {
      throw new CommandException("What are you trying to destroy?");
    }
    destroy(target);
  },
});

custom_commands.push({
  name: "takeoff",
  verbs: ["takeoff", "launch"],
  description: "Fly a spaceship.",
  examples: [],
  run: function (verb: string, arg: string): void {
    if (game.player.room_id === 1) {
      game.history.write("The Millennium Falcon takes off...");
      game.history.write("...Clears the hanger deck...");

      if (game.data.destroyed[3] && game.data.destroyed[5]) {
        game.history.write("... and flies off into space!");
        game.history.write(
          "You escape successfully, and head for the rebel base on Yavin. Hopefully no one follows you...",
          "success",
        );

        // give player their original gear back
        game.player.inventory.forEach((a) => {
          console.log("drop artifact", a);
          a.destroy();
        });
        game.data.original_gear.forEach((id: number) => {
          game.artifacts.get(id).moveToInventory();
        });
        game.artifacts.updateVisible();

        game.exit();
      } else {
        game.history.write("The Death Star's tractor beam latches on and tears it apart!", "danger");
        game.die();
      }
    } else if (game.player.room_id === 16) {
      game.effects.print(1);
      game.die();
    } else {
      throw new CommandException("You have to be in a ship to take off.");
    }
  },
});
