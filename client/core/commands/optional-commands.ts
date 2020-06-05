import {BaseCommand} from "./base-command";
import Game from "../models/game";
import {CommandException} from "../utils/command.exception";

declare var game: Game;

/**
 * These commands are optional and can be added to any adventure if needed. To use them,
 * add the following lines to the adventure's 'start' event handler:
 *
 * ```
 * // put this at the top of the file
 * import {BuyCommand} from "../../core/commands/optional-commands";
 *
 * // put this in the 'start' event handler
 * game.command_parser.register(new BuyCommand());
 * ```
 * (Example shows the "buy" command, but change the names to use a different command.)
 */
export class BuyCommand implements BaseCommand {
  name: string = "buy";
  verbs: string[] = ["buy"];
  category: string = "interactive";
  description: string = "Buys an item from a merchant. Items that are for sale will be listed in the game window.";
  examples: string[] = ['BUY BEER'];
  run(verb: string, arg: string): void {
    arg = arg.toLowerCase();
    let artifact = game.artifacts.getByName(arg);
    // if (artifact.length > 1) {
    //   throw new CommandException("Did you mean '" + artifact.join("' or '") + "'?");
    // }
    if (!artifact || (artifact.monster_id && !game.monsters.get(artifact.monster_id).isHere())) {
      throw new CommandException("No one here has that for sale.");
    }
    // see if anyone here previously sold this item, so we can show "out of stock" message
    let previously_sold = game.monsters.visible.find(m => !m.hasArtifact(artifact.id) && m.data.sold_items && m.data.sold_items.indexOf(artifact.id) !== -1);
    if (previously_sold) {
      throw new CommandException(`The ${previously_sold.name} says, "Looks like I'm fresh outta stock. Sorry!"`);
    }
    if (!artifact.data.for_sale) {
      throw new CommandException("That's not for sale.");
    }
    let seller = game.monsters.get(artifact.monster_id);

    // sale price can be different from value (what Sam Slicker pays for it)
    let price = artifact.data.price ? artifact.data.price : artifact.value;
    if (price > game.player.gold) {
      throw new CommandException(`That costs ${price} gold pieces and you only have ${game.player.gold}.`);
    }

    game.modal.confirm(`That costs ${price} gold pieces. Do you want to buy it?`, answer => {
      if (answer === 'Yes') {
        if (game.triggerEvent('beforeBuy', artifact, seller)) {
          game.history.write(`You buy the ${artifact.name}.`);
          if (!artifact.seen) {
            artifact.showDescription();
            artifact.seen = true;
          }
          artifact.moveToInventory();
          game.player.gold -= price;
          game.player.updateInventory();
          artifact.data.for_sale = false;
          if (!seller.data.hasOwnProperty('sold_items')) {
            seller.data.sold_items = [];
          }
          seller.data.sold_items.push(artifact.id);
          seller.updateInventory();
          game.triggerEvent('afterBuy', artifact, seller);
        }
      } else {
        game.history.write(`"Maybe next time."`);
      }
    });
  }
}
