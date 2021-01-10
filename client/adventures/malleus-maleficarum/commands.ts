import Game from "../../core/models/game";
import {CommandException} from "../../core/utils/command.exception";
import {inquisitorIsHere} from "./event-handlers";

declare let game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "buy",
  verbs: ["buy"],
  description: "Buys an item from a merchant. Items that are for sale will be listed in the game window.",
  examples: ['BUY BEER'],
  run: function(verb: string, arg: string): void {
    arg = arg.toLowerCase();
    const artifact = game.artifacts.getByName(arg);
    // if (artifact.length > 1) {
    //   throw new CommandException("Did you mean '" + artifact.join("' or '") + "'?");
    // }
    if (!artifact || (artifact.monster_id && !game.monsters.get(artifact.monster_id).isHere())) {
      throw new CommandException("No one here has that for sale.");
    }
    if (!artifact.data.for_sale) {
      throw new CommandException("That's not for sale.");
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

custom_commands.push({
  name: "talk",
  verbs: ["talk"],
  description: "Talks to an NPC to get information.",
  examples: ['TALK TO MAYA'],
  run: function(verb: string, arg: string): void {
    if (arg.indexOf('to ') !== -1) {
      arg = arg.slice(3);
    }

    const monster = game.monsters.getLocalByName(arg);
    if (monster) {
      // maya special in castle
      if (monster.id === 1 && game.player.room_id >= 51 && game.player.room_id <= 54) {
        game.effects.print(4);
        return;
      }

      // no one has much to say after you win
      if (game.data.cf_defeated) {
        game.effects.print(299);
        return;
      }

      // generic talk logic
      if (monster.data.talk) {
        game.effects.print(monster.data.talk);
      } else if (monster.parent && monster.parent.data.talk) {
        game.effects.print(monster.parent.data.talk);
      } else {
        game.history.write(`${monster.name} has nothing to say.`)
      }

      // special stuff that happens when certain monsters talk
      if (monster.id === 2) {  // talia
        if (game.monsters.get(1).isHere()) {
          game.effects.print(52);
          game.artifacts.get(41).moveToInventory(1);
          game.monsters.get(1).data.talk = 3;
        }
      } else if (monster.id === 30) {  // velatha
        if (!game.data.orb_quest) {
          game.data.orb_quest = true;
          game.monsters.get(1).data.talk = 5;
          const bag = game.artifacts.get(4);
          bag.moveToInventory();
          game.history.write(`You receive: ${bag.name}`);
          bag.showDescription();
        }
      } else if (monster.id === 32) {  // zinnah
        game.artifacts.get(3).moveToRoom(9);
      } else if (monster.id === 34) {  // old mage in prison
        if (!game.player.spell_abilities.power) {
          game.effects.print(58);
          game.player.spell_abilities.power += 50;
          game.player.spell_abilities_original.power += 50;
        }
      }
      return;
    }

    // if you try to talk to an artifact
    const artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
      // the prisoners in stocks (who are an artifact)
      if (artifact.id === 2) {
        game.effects.print(11);
        return;
      }
      game.history.write('No response.');
      return;
    }

    game.history.write('No one here by that name.');
  }
});

custom_commands.push({
  name: "pay",
  verbs: ["pay"],
  description: "Pays for things you owe, e.g., fines. To buy things from merchants, use the BUY command instead.",
  examples: ['PAY FINE'],
  run: function(verb: string, arg: string): void {
    if (arg === 'fine' || arg === 'inquisitor') {
      if (game.data.fine_due && inquisitorIsHere()) {
        game.effects.print(33);
        game.player.gold = Math.max(0, game.player.gold - 100);
        game.data.fine_due = false;
      } else {
        game.history.write("That won't accomplish anything.");
      }
    } else {
      game.history.write('Try a different command.');
    }
  }
});
