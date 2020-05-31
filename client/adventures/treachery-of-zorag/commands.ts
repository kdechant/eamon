import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "buy",
  verbs: ["buy"],
  description: "Buys an item from a merchant. Items that are for sale will be listed in the game window.",
  examples: ['BUY BEER'],
  run: function(verb: string, arg: string): void {
    arg = arg.toLowerCase();
    let artifact = game.artifacts.getByName(arg);
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
  examples: ['TALK TO SHOPKEEPER', 'TALK TO {someone} ABOUT {something}'],
  run: function(verb: string, arg: string): void {
    if (arg.indexOf('to ') !== -1) {
      arg = arg.slice(3);
    }
    // TODO: handle additional keywords ("talk to boris about treasure")

    let monster = game.monsters.getLocalByName(arg);
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
          let bag = game.artifacts.get(4);
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
    let artifact = game.artifacts.getLocalByName(arg);
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
  name: "camp",
  verbs: ["camp"],
  description: "Sets up camp so you can rest. Your party will automatically set a watch in case you are attacked in the night.",
  examples: ['CAMP'],
  run: function(verb: string, arg: string): void {
    // TODO: finish this (watch, monsters attack, etc.)
    game.data.fatigue = 0;
    game.player.agility = game.player.stats_original.agility;
    // TODO: eat and drink
  }
});

custom_commands.push({
  name: "fill",
  verbs: ["fill"],
  description: "Fills a water vessel, or puts fuel into a lamp.",
  examples: ['FILL CANTEEN', 'FILL LANTERN'],
  run: function(verb: string, arg: string): void {
    // TODO: fill water vessel if there is a water source here
    // TODO: fill light source if there is some fuel (lamp oil) here
  }
});


