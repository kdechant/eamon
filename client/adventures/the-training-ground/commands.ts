import Game from "../../core/models/game";
import {CommandException} from "../../core/utils/command.exception";

declare let game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "buy",
  verbs: ["buy"],
  description: "Buys an item from a merchant. Items that are for sale will be listed in the game window.",
  examples: ['BUY POTION'],
  run: function(verb: string, arg: string): void {
    arg = arg.toLowerCase();
    const for_sale_here = game.artifacts.all.filter(a => a.data.for_sale && a.monster_id && game.monsters.get(a.monster_id).isHere());
    const artifact = for_sale_here.find(a => a.match(arg));
    if (!artifact) {
      throw new CommandException("No one here has that for sale.");
    }
    if (artifact.value > game.player.gold) {
      throw new CommandException(`That costs ${artifact.value} gold pieces and you only have ${game.player.gold}.`);
    }

    game.modal.confirm(`That costs ${artifact.value} gold pieces. Do you want to buy it?`, answer => {
      if (answer === 'Yes') {
        game.history.write(`You buy the ${artifact.name}.`);
        artifact.showDescription();
        artifact.moveToInventory();
        game.player.gold -= artifact.value;
        game.player.updateInventory();
        artifact.data.for_sale = false;
      } else {
        game.history.write(`"Maybe next time."`);
      }
    });
  }
});

