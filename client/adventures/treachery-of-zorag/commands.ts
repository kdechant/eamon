import Game from "../../core/models/game";
import {CommandException} from "../../core/utils/command.exception";
import {Artifact} from "../../core/models/artifact";
import {talkTo} from "./functions";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

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

    let monster = game.monsters.getLocalByName(arg);
    if (monster) {
      talkTo(monster, subject);
      return;
    }

    // if you try to talk to an artifact
    let artifact = game.artifacts.getLocalByName(arg);
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
    let artifact = game.artifacts.getLocalByName(arg);
    if (!artifact) {
      throw new CommandException("I'm not sure what you're trying to fill.")
    }
    if (artifact.data.role === 'water') {
      let water_source = game.artifacts.visible.find(a => a.data.role === 'water source');
      if (water_source) {
        game.history.write(`You fill the ${artifact.name} from the ${water_source.name}`);
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
        game.history.write(`You fill the ${artifact.name} from the ${fuel_source.name}.`);
        let amount = Math.min(artifact.data.capacity - artifact.quantity, fuel_source.quantity);
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


