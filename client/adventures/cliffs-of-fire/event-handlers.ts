import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";
import {ModalQuestion} from "../../core/models/modal";

export var event_handlers = {

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    // this never runs. MoveCommand checks the presence of a door before it runs this handler. Maybe fix this some day.
    if (exit.door_id === 13 && game.artifacts.get(13).isHere()) {
      // this just shows an effect instead of the normal "x blocks your way!" message
      game.effects.print(2);
      return false;
    }

    if (exit.room_to === RoomExit.EXIT) {
      if (!game.player.hasArtifact(16)) {
        game.pause();
        let q1 = new ModalQuestion;
        q1.type = 'multiple_choice';
        q1.question = "Seeing that you are not carrying the sceptre, the priests look at you with disapproval. One says, 'Do you really wish to return to the Main Hall?'";
        q1.choices = ['Yes', 'No'];
        q1.callback = function (answer) {
          if (answer.toLowerCase() === 'yes') {
            game.history.write("The boat takes you back to the Main Hall.");
            game.exit();
          } else {
            game.history.write("The priests ask you to hurry and find the sceptre!");
          }
          return true;
        };
        game.modal.questions = [q1];
        game.modal.run();
        // always return false here because the actual movement happens in the callback.
        return false;
      }
    }
    return true;
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact && artifact.id === 3) {
      if (game.artifacts.get(13).isHere()) {
        game.effects.print(3);
        game.artifacts.get(13).destroy();
      } else {
        game.history.write('The wand glows briefly, but nothing happens.');
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 80) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 91) {
      game.history.write("A terrible pain courses through you. Blood flows from your nose and ears, and you dispel the incantation as rapidly as you can. The cliffs have dangerous effects on Power spells...");
      game.player.injure(Math.floor((game.player.hardiness - game.player.damage) / 2), true);
    } else {

      // heal everyone in the room
      game.history.write(game.player.name + " is healed!");
      game.player.heal(100);
      for (let m of game.monsters.visible) {
        game.history.write(m.name + " is healed!");
        m.heal(100);
      }

    }
  },

  "exit": function() {
    let game = Game.getInstance();
    if (game.player.hasArtifact(16)) {
      game.history.write("The excited priests welcome you on board. The high priest hands you a huge bag containing 2000 gold pieces as a reward for returning the sceptre.", "emphasis");
      game.player.gold += 2000;
      game.artifacts.get(16).destroy();
    }
    return true; // this permits normal exit logic
  }

}; // end event handlers
