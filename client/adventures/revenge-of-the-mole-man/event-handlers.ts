import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";

declare var game: Game;

export var event_handlers = {

  "start": function() {
    // nobody's body
    game.artifacts.get(26).seen = true;

    game.data['timer'] = 0;
  },

  "death": function(monster: Monster) {
    // custom placement of Sir Galliant's body
    // (dead bodies for this adventure are handled by placing them in the monster's inventory. except we can't do
    // that for Sir Galliant because he's friendly so you could see it in his inventory by looking at him.)
    if (monster.id === 30) {
      game.artifacts.get(13).moveToRoom();
    }
    return true;
  },

  "endTurn2": function() {
    if (game.data['timer'] > 0) {
      game.data.timer--;
      if (game.data['timer'] <= 0) {
        game.artifacts.get(17).destroy();
        if (game.player.room_id === 74) {
          game.effects.print(1);
          game.exit();
        } else {
          game.effects.print(5);
          game.die();
        }
      } else {
        game.history.write("The timer is ticking...", "special2");
      }
    }

  },

  "use": function(arg: string, artifact: Artifact) {
    if (arg == "blood") {
      game.history.write("What are you, a vampire?");
    }

    // set timer
    if (artifact && artifact.id === 4) {
      game.modal.show("Set timer to what? (1-90):", function(value) {
        value = parseInt(value);
        if (value >= 1 && value <= 90) {
          game.data['timer'] = value;
          game.history.write("The timer is set to " + value);
        } else {
          game.history.write("Invalid value!");
        }

      });
    }

  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (game.monsters.get(4).isHere()) {
      game.history.write(" * * P O O F * * ", "special");
      game.history.write("The army of mindless creatures vanishes!", "special");
      game.monsters.get(4).destroy();
    } else if (game.monsters.get(14).isHere()) {
      game.history.write(" * * P O O F * * ", "special");
      game.history.write("The Juggernaut vanishes!", "special");
      game.monsters.get(14).destroy();
    } else if (roll <= 90) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

  "exit": function() {
    if (game.player.hasArtifact(33)) {
      // put the basilisk's body down so we can use it for an effect later, after selling
      game.artifacts.get(33).moveToRoom(74);
      game.player.updateInventory();
    }
    return true; // this permits normal exit logic
  },

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    // Hokas' reward
    if (game.artifacts.get(33).isHere()) {   // if player was carrying, gets automatically put down in "exit" handler
      game.after_sell_messages.push("Hokas Tokas pays you 1,500 gold pieces for the body of the basilisk.");
      game.player.gold += 1500;
      game.artifacts.get(33).destroy(); // hides it from the status box
    }
  },

}; // end event handlers
