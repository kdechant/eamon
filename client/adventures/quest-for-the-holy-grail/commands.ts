import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

declare var game: Game;

export var custom_commands = [];

custom_commands.push({
  name: "throw",
  verbs: ["throw","toss","chuck","heave"],
  description: "Throws something.",
  examples: ['THROW HOLY HAND GRENADE'],
  run: function(verb: string, arg: string): void {
    let artifact = game.artifacts.getLocalByName(arg);
    // the Holy Hand Grenade
    if (artifact && artifact.id === 1 && game.player.hasArtifact(1)) {
      game.effects.print(48); // BOOM!
      artifact.destroy();
      game.monsters.visible.forEach(function(monster){
        if ((monster.id > 6) && (monster.id != 25) && (monster.id != 26) && (monster.id != 34)) {
          monster.injure(1000);
        }
      });
      return;
    }
    game.effects.print(49);
  }
});

custom_commands.push({
  name: "enter",
  verbs: ["enter"],
  description: "Try to go into a building.",
  examples: ['ENTER CASTLE'],
  run: function(verb: string, arg: string): void {
    if (arg === 'castle') {
      switch (game.player.room_id) {
        case 18:
          game.history.write(`The Frenchman's head appears above the wall again. He says, "You cannot enter! Now go away, or I shall taunt you a second time!`);
          return;
        case 13:
          game.command_parser.run('e', false);
          return;
        case 34:
          game.command_parser.run('w', false);
          return;
        case 65:
          game.command_parser.run('n', false);
          return;
      }
    }
    throw new CommandException("Try a different command.");
  }
});

custom_commands.push({
  name: "buy",
  verbs: ["buy","purchase"],
  description: "Buys an item from a merchant.",
  examples: ['BUY CHEESE'],
  run: function(verb: string, arg: string): void {
    let artifact = game.artifacts.getByName(arg);
    if (artifact && (artifact.id == 3) && game.monsters.get(13).isHere()) {
      if (artifact.monster_id === Monster.PLAYER) {
        game.effects.print(62); // you already have one
        return;
      }
      if (game.player.gold < 50) {
        game.effects.print(61); // you can't afford it
        return;
      }
      game.effects.print(63);
      game.player.gold -= 50;
      artifact.room_id = null;
      artifact.monster_id = Monster.PLAYER;
      game.player.updateInventory();
      return;
    }
    if (!artifact || !artifact.isHere()) {
      game.history.write("Huh?");
      return;
    }
    game.effects.print(60); // that's not for sale
  }
});
