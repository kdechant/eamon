import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";

export var custom_commands = [];

custom_commands.push({
  name: "locate",
  verbs: ["locate"],
  category: "magic",
  description: "Activates a special spell. You'll need to learn this before you can use it.",
  examples: ['LOCATE TORCH', 'LOCATE HOKAS TOKAS'],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    if (game.data['locate active']) {

      game.history.write("Your mind reaches beyond your body...", "special");

      let m = game.monsters.getByName(arg);
      if (m) {
        if (m.room_id !== null) {
          let r = game.rooms.getRoomById(m.room_id);
          game.history.write(m.name + " is " + fix_room_name(r.name));
          return;
        }
      }

      // only look for artifacts
      let a = game.artifacts.getByName(arg);
      if (a) {
        if (a.monster_id === 0) {
          game.history.write(a.name + " is in your possession!");
          return;
        } else if (a.monster_id) {
          let m2 = game.monsters.get(a.monster_id);
          game.history.write(a.name + " is being carried by " + m2.name + ".");
          return;
        } else if (a.room_id !== null) {
          let r = game.rooms.getRoomById(a.room_id);
          game.history.write(a.name + " is " + fix_room_name(r.name));
          return;
        }
      }

      game.history.write(arg + " could not be located.");

    } else {
      game.history.write("Nothing happens.");
    }
  },
});

custom_commands.push({
  name: "pay",
  verbs: ["pay"],
  description: "Pays for your purchases. In this place, that usually means drinks.",
  examples: ['PAY'],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    if (game.player.room_id === 36 && game.data['bar tab']) {
      if (game.in_battle) {
        game.player.gold -= game.data['bar tab'] + 100;
        if (game.player.gold < 0) game.player.gold = 0;
        game.data['bar tab'] = 0;
        game.monsters.get(13).reaction = Monster.RX_NEUTRAL;
        game.monsters.get(14).reaction = Monster.RX_NEUTRAL;
        game.history.write('You have paid for your drink, plus damages. The bar is open for business.');
      } else {
        game.player.gold -= game.data['bar tab'];
        if (game.player.gold < 0) game.player.gold = 0;
        game.data['bar tab'] = 0;
        game.history.write('The bartender smiles and replies, "Thank you."');
      }
    } else {
      game.history.write("Your tab is all paid up.");
    }
  },
});

function fix_room_name(name) {
  let n = name.replace("You are ", "");
  if (n.charAt(n.length - 1) === ".") {
    return n;
  } else {
    return n + ".";
  }
}
