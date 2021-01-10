import Game from "../../core/models/game";
import {CommandException} from "../../core/utils/command.exception";
import {Artifact} from "../../core/models/artifact";
import {talkTo} from "./functions";
import {Monster} from "../../core/models/monster";
import {isFoodSource, isWaterSource} from "./event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare let game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "talk",
  verbs: ["talk"],
  description: "Talks to an NPC to get information.",
  examples: ['TALK TO SHOPKEEPER', 'TALK TO {someone} ABOUT {something}'],
  run: function(verb: string, arg: string): void {
    if (arg.indexOf('to ') !== -1) {
      arg = arg.slice(3);
    }
    let subject = '';
    if (arg.indexOf('about') !== -1) {
      [arg, subject] = arg.split(' about ');
    }

    const monster = game.monsters.getLocalByName(arg);
    if (monster) {
      talkTo(monster, subject);
      return;
    }

    // if you try to talk to an artifact
    const artifact = game.artifacts.getLocalByName(arg);
    if (artifact) {
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
    if (game.in_battle) {
      throw new CommandException('It is not wise to camp with enemies about!');
    }
    game.history.write('You make camp for the night...');
    game.data.fatigue = 0;
    game.player.agility = game.player.stats_original.agility;
    const watchers = game.monsters.all.filter(
      m => m.isHere() && m.reaction === Monster.RX_FRIEND);
    // if you're alone, no one can watch and the chance of monsters is higher
    const monster_odds = watchers.length > 1 ? 25 : 33;
    const monsters_appear = game.diceRoll(1, 100) <= monster_odds;
    const active_watcher = game.diceRoll(1, watchers.length) - 1;
    let summoned = false;
    game.history.slower(1000);  // FIXME: not currently working.
    watchers.forEach((m, index) => {
      if (summoned) return;
      if (m.id === Monster.PLAYER) {
        if (index > 0) {
          game.history.write("You take the last watch...");
          game.delay(2);
        }
      } else {
        const word = (index === 0 ? "first" : "next");
        game.history.write(`${m.name} takes the ${word} watch...`)
        game.delay(2);
      }
      if (monsters_appear && index === active_watcher) {
        game.history.write("Your rest is interrupted!");
        summoned = true;
        const monster_id = game.diceRoll(1, 4) + 13;
        const monster = game.monsters.get(monster_id);
        monster.showDescription();
        monster.seen = true;
        if (monster.isGroup()) {
          const count = game.diceRoll(1, watchers.length + 2);
          if (monster.children && monster.children.length > count) {
            monster.removeChildren(monster.children.length - count);
          }
          while (monster.children.length < count) {
            monster.spawnChild();
          }
          monster.children.forEach(c => c.resurrect());
        } else {
          monster.resurrect();
        }
      }
    });
    // automatically eat breakfast
    if (!monsters_appear) {
      game.history.write("You awaken refreshed.");
      const food = game.player.inventory.find(a => isFoodSource(a));
      if (food && food.quantity > 0) {
        game.command_parser.run(`eat ${food.name}`, false);
      }
      const water = game.player.inventory.find(a => isWaterSource(a));
      if (water) {
        game.command_parser.run(`drink ${water.name}`, false);
      }
    }
    game.history.faster(1000);
  }
});

custom_commands.push({
  name: "fill",
  verbs: ["fill"],
  description: "Fills a water vessel, or puts fuel into a lamp.",
  examples: ['FILL CANTEEN', 'FILL LANTERN'],
  run: function(verb: string, arg: string): void {
    const artifact = game.artifacts.getLocalByName(arg);
    if (!artifact) {
      throw new CommandException("I'm not sure what you're trying to fill.")
    }
    if (artifact.data.role === 'water') {
      const water_source = game.artifacts.visible.find(a => a.data.role === 'water source');
      if (water_source) {
        game.history.write(`You fill the ${artifact.name} from the ${water_source.name}.`);
        artifact.quantity = artifact.data.capacity;
      } else {
        throw new CommandException(`There is no water source here to fill the ${artifact.name} from!`);
      }
    } else if (artifact.type === Artifact.TYPE_LIGHT_SOURCE) {
      let fuel_source = game.artifacts.visible.find(a => a.data.role === 'fuel source');
      if (!fuel_source) {
        fuel_source = game.player.inventory.find(a => a.data.role === 'fuel source');
      }
      if (fuel_source) {
        if (fuel_source.quantity <= 0) {
          throw new CommandException(`There is no more ${fuel_source.name} left!`);
        }
        game.history.write(`You fill the ${artifact.name} with the ${fuel_source.name}.`);
        const amount = Math.min(artifact.data.capacity - artifact.quantity, fuel_source.quantity);
        artifact.quantity += amount;
        fuel_source.quantity -= amount;
        if (fuel_source.quantity <= 0) {
          game.history.write(`Your ${fuel_source.name} is now empty!`);
        }
      } else {
        throw new CommandException(`You don't have anything to fill the ${artifact.name} from!`);
      }
    }
  }
});


