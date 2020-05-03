import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";

declare var game: Game;

export var event_handlers = {

  "use": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if ([8, 9, 14, 15].indexOf(artifact.id) !== -1) {
        // these buttons free monsters
        // @ts-ignore
        let a = game.artifacts.all.find(x => x.type === Artifact.TYPE_BOUND_MONSTER && x.isHere());
        if (typeof a !== 'undefined') {
          game.history.write("There is a clanking sound and the prisoner is freed!", "success");
          a.freeBoundMonster();
        } else {
          game.history.write("Nothing happens.");
        }
      } else if (artifact.id === 2) {
        // strange device
        if (game.artifacts.get(3).isHere()) {
          toggle_gate(3);
        } else if (game.artifacts.get(5).isHere()) {
          toggle_gate(5);
        } else {
          game.history.write("Nothing happens.");
        }
      } else if (artifact.id === 25 || artifact.id === 26) {
        // exit button
        if (game.artifacts.get(2).monster_id === 0) {
          game.effects.print(1);
          game.exit();
        } else {
          game.effects.print(2);
        }
      }
    }
  },

  "beforeFree": function(arg: string, artifact: Artifact) {
    if (artifact.id >= 21 && artifact.id <= 24) {
      game.history.write("You can't see how. Maybe there is a button somewhere?");
      return false;
    }
    return true;
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let army = game.monsters.get(29);
    if (army.isHere()) {
      game.history.write("* * P O O F * *", "special2");
      game.history.write("The army of mindless slaves vanishes!", "emphasis");
      let r = game.diceRoll(1, game.rooms.rooms.length);
      if (r === game.player.room_id) {
        r = null;
      }
      army.moveToRoom(r);
      army.seen = false;
    } else {
      if (roll <= 50) {
        game.history.write("You hear a loud sonic boom which echoes all around you!");
      } else {
        game.history.write("Some of your wounds seem to clear up.");
        game.player.heal(game.diceRoll(2, 4));
      }
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
function toggle_gate(artifact_id: Number) {
  let artifact = game.artifacts.get(artifact_id);
  if (artifact.is_open) {
    game.history.write("The gate swings closed!", "special");
    artifact.close();
  } else {
    game.history.write("The gate swings open!", "special");
    artifact.open();
  }
}
