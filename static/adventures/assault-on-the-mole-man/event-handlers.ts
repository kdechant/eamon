import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // remove the # from some artifact names
    for (let a of game.artifacts.all.filter(x => x.name.indexOf('#') > -1 && x.id <= 27)) {
      a.name = a.name.replace(/#/g, "");
    }

  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
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

  "free": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();

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
    let game = Game.getInstance();

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
