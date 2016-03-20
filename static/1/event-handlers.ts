import {Game} from "../core/models/game";
import {Artifact} from "../core/models/artifact";
import {Monster} from "../core/models/monster";

export var event_handlers = [];

event_handlers.push({
  name: 'read',
  run: function(arg:string, artifact:Artifact) {
    var game = Game.getInstance();

    if (artifact !== null) {
      if (artifact.id === 3) {
        game.history.write('It says "HEALING POTION"');
        artifact.name = 'healing potion';
        return true;
      } else if (artifact.id === 9) {
//        game.effects.read(7);
        if (game.rooms.current_room.id === 26) {
          game.history.write("You fall into the sea and are eaten by a big fish.");
        } else {
          game.history.write("You flop three times and die.");
        }
        game.die();
      }
    }
  }
});
