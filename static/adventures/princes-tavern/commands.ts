import {Game} from "../../core/models/game";
import {Monster} from "../../core/models/monster";

export var custom_commands = [];

custom_commands.push({
  name: "locate",
  verbs: ["locate"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
console.log(game.data['locate active']);
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

function fix_room_name(name) {
  let n = name.replace("You are ", "");
  if (n.charAt(n.length - 1) === ".") {
    return n;
  } else {
    return n + ".";
  }
}
