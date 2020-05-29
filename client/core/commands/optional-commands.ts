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
    // is anyone here carrying the item? (we check if it's for sale later)
    let monster_ids = game.monsters.visible.map(m => m.id);
    let artifacts = game.artifacts.all.filter(
      a => monster_ids.indexOf(a.monster_id) !== -1 && a.match(arg));

    if (artifacts.length === 0) {
      // see if anyone here previously sold this item, so we can show "out of stock" message
      let previous_seller = game.monsters.visible.find(m => m.data.sold_items && m.data.sold_items.some(id => game.artifacts.get(id).match(arg)));
      if (previous_seller) {
        throw new CommandException(`The ${previous_seller.name} says, "Looks like I'm fresh outta stock. Sorry!"`);
      }
      throw new CommandException("No one here has that for sale.");
    } else if (artifacts.length > 1) {
      throw new CommandException(
        "Did you mean '" + artifacts.map(a => a.name).join("' or '") + "'?");
    }
    let artifact = artifacts[0];
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
