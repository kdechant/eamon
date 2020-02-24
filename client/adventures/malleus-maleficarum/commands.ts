import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";
import {inquisitorIsHere} from "./event-handlers";

declare var game;

export var custom_commands = [];

custom_commands.push({
  name: "buy",
  verbs: ["buy"],
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

    game.modal.confirm(`That costs ${artifact.value} gold pieces. Do you want to buy it?`, () => {
      game.history.write(`You buy the ${artifact.name}`);
      artifact.showDescription();
      artifact.moveToInventory();
      game.player.gold -= artifact.value;
      game.player.updateInventory();
      artifact.data.for_sale = false;
    });
  }
});

custom_commands.push({
  name: "talk",
  verbs: ["talk"],
  run: function(verb: string, arg: string): void {
    if (arg.indexOf('to ') !== -1) {
      arg = arg.slice(3);
    }

    let monster = game.monsters.getLocalByName(arg);
    if (monster) {
      // maya special in castle
      if (monster.id === 1 && game.player.room_id >= 51 && game.player.room_id <= 54) {
        game.effects.print(4);
        return;
      }

      // generic talk logic
      if (monster.data.talk) {
        game.effects.print(monster.data.talk);
      } else {
        // TODO: handle group monsters
        game.history.write(`${monster.name} has nothing to say.`)
      }

      // special stuff that happens when certain monsters talk
      if (monster.id === 2) {  // talia
        // game.data.talia = true;
        game.monsters.get(1).data.talk = 3;
      } else if (monster.id === 30) {  // velatha
        if (!game.data.orb_quest) {
          game.data.orb_quest = true;
          game.monsters.get(1).data.talk = 5;
        }
      } else if (monster.id === 32) {  // zinnah
        game.artifacts.get(3).moveToRoom(9);
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
  name: "pay",
  verbs: ["pay"],
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
