import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";
import {ModalQuestion} from "../../core/models/modal";

export var custom_commands = [];

custom_commands.push({
  name: "buy",
  verbs: ["buy"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    arg = arg.toLowerCase();
    let stan = game.monsters.get(8);
    if (arg === 'brandy' && stan.isHere()) {
      if (stan.hasArtifact(28)) {
        if (game.player.gold < 75) {
          game.history.write('"It costs 75 kopins," says Stan. "Come back when you have enough money."');
        } else {
          game.modal.confirm('"I can sell it to you for 75 kopins," says Stan. "Deal?"', () => {
            game.history.write("Stan rolls out a keg of brandy.");
            game.data['brandy'] = true;
            game.artifacts.get(28).moveToRoom();
            game.player.gold -= 75;
            game.monsters.get(8).updateInventory();
          })
        }
      } else {
        game.history.write('"Sorry, all out of that," says Stan.');
      }
      return;
    } else if (arg === "rum" && stan.isHere()) {
      if (game.player.gold < 3) {
        game.history.write('"It costs 3 kopins," says Stan. "Come back when you have enough money."');
      } else {
        game.player.gold -= 3;
        game.history.write("Stan pours you a glass of rum. You drink it. You feel like you should be investigating the situation in town, not just getting drunk.");
      }
      return;
    }
    if (arg === 'cheesedip' || arg === 'cheese' || arg === 'dip') {
      if (game.monsters.get(11).isHere()) {
        game.effects.print(21);
        return;
      }
      let m = null;
      if (stan.isHere()) m = stan;
      if (game.monsters.get(4).isHere()) m = game.monsters.get(4);
      if (m) {
        game.history.write(`${m.name} gives you a bowl of cheesedip. You choke it down.`);
        return;
      }
    }
    throw new CommandException("No one here has that for sale.");
  },
});

custom_commands.push({
  name: "talk",
  verbs: ["talk"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();

    if (arg.indexOf('to ') !== -1) {
      arg = arg.slice(3);
    }

    let monster = game.monsters.getLocalByName(arg);
    if (monster) {
      if (monster.id === 2) {
        // minstrel
        game.effects.printSequence([2,3,4,5,6,7]);
        game.history.pause();
        game.effects.printSequence([8, 9, 10, 11]);
        monster.destroy();
        game.monsters.get(3).moveToRoom();
        game.artifacts.get(8).moveToRoom();
        game.history.pause();
        return;
      }
      if (monster.id === 6 && game.data['prince unconscious']) {
        game.history.write('The Prince is unconscious.');
        return;
      }
      // chichester (first time)
      if (monster.id === 16 && monster.hasArtifact(19)) {
        game.artifacts.get(19).moveToRoom();
        game.effects.printSequence([32, 33]);
        monster.reaction = Monster.RX_FRIEND;
        return;
      }
      // sage
      if (monster.id === 21 && game.data['sage wants rum'] === 0) {
        game.effects.print(54);
        return;
      }

      // other monsters have either a standard response or an effect ID
      switch (monster.data['talk']) {
        case -1:
          game.history.write("GRRR...");
          break;
        case -2:
          game.history.write("You mendicant! You shall die!");
          break;
        case -3:
          game.history.write("No response.");
          break;
        case 0:
          game.history.write("You talk about the barbarian horde and when it will finally kill you all.");
          break;
        default:
          game.effects.print(monster.data['talk']);
          break;
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

