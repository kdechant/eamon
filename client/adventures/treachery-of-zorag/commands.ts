import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";
// import {BuyCommand} from "../../core/commands/optional-commands";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var custom_commands = [];

// Use the optional "buy" command
// game.command_parser.register(new BuyCommand());
// game.optional_commands.push('buy');

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
    let subject = '';
    if (arg.indexOf('about') !== -1) {
      [arg, subject] = arg.split(' about ');
    }

    let monster = game.monsters.getLocalByName(arg);
    if (monster) {
      // generic talk logic
      if (monster.data.talk) {
        game.effects.print(monster.data.talk);
      } else if (monster.parent && monster.parent.data.talk) {
        game.effects.print(monster.parent.data.talk);
      } else {
        game.history.write(`${monster.name} has nothing to say.`)
      }
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
    // TODO: fill water vessel if there is a water source here
    // TODO: fill light source if there is some fuel (lamp oil) here
  }
});


