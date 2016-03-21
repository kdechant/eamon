import {Game} from "../core/models/game";
import {Artifact} from "../core/models/artifact";
import {Monster} from "../core/models/monster";

export var event_handlers = [];

event_handlers.push({
  name: 'start',
  run: function(arg: string) {
    var game = Game.getInstance();

    game.effects.print(8);
    game.effects.print(10);

    // must have weapon
    if (game.monsters.player.weapon_id === null) {
      game.effects.print(9);
    }

    // check if base stats
    if (game.monsters.player.weapon_abilities[1] == 5 &&
        game.monsters.player.weapon_abilities[2] == -10 &&
        game.monsters.player.weapon_abilities[3] == 20 &&
        game.monsters.player.weapon_abilities[4] == 10 &&
        game.monsters.player.weapon_abilities[5] == 0) {
      game.effects.print(12);
    } else {
      // not a beginner
      game.effects.print(11);
    }

  }
});

event_handlers.push({
  name: 'read',
  run: function(arg: string, artifact: Artifact) {
    var game = Game.getInstance();

    if (artifact !== null) {
      if (artifact.id === 3) {
        game.history.write('It says "HEALING POTION"');
        artifact.name = 'healing potion';
        return true;
      } else if (artifact.id === 9) {
        game.effects.print(7, "special");
        if (game.rooms.current_room.id === 26) {
          game.history.write("You fall into the sea and are eaten by a big fish.", "danger");
        } else {
          game.history.write("You flop three times and die.", "danger");
        }
        game.die();
        return true;
      }
    }
  }
});
