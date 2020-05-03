import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var event_handlers = {

  "start": function() {
    game.data['gold stolen'] = 0;
    game.data['laszlo spells'] = 0;

    // custom attack messages
    game.monsters.get(5).combat_verbs = ["bites at", "leaps at"];
    game.monsters.get(17).combat_verbs = ["shoots a firebolt at", "swings at"];

    // laszlo spells
    game.monsters.get(17).spells = ['blast', 'heal'];
    game.monsters.get(17).spell_points = 3;
    game.monsters.get(17).spell_frequency = 33;
  },

  "drop": function(arg: string, artifact: Artifact): boolean {
    if (artifact.id === 20) {
      game.effects.print(4);
      return false;
    }
    return true;
  },

  "endTurn": function() {
    // bandit
    if (!game.in_battle && game.player.gold > 0 && game.monsters.get(13).room_id !== null && game.data['gold stolen'] === 0) {
      let roll = game.diceRoll(1, 10);
      if (roll === 10) {
        game.effects.print(2);
        game.data['gold stolen'] = game.player.gold;
        game.artifacts.get(21).value = game.player.gold;
        game.artifacts.get(21).moveToRoom(32);
        game.player.gold = 0;
      }
    }
  },

  "flee": function() {
    if (game.monsters.get(1).isHere() && !game.player.rollSavingThrow('agility', 16)) {
      game.effects.print(5);
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    // special message when the player finds the treasure
    if (artifact && artifact.id == 20) {
      game.history.write("As you touch the sword, your hand feels warm. You are forced to drop any ready weapon you have and use the golden sword!", "special");
      game.player.ready(artifact);
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    // cursed sword
    if (artifact.id === 20) {
      game.effects.print(4);
      return false;
    }
    return true;
  },

  "light": function(arg: string, artifact: Artifact) {
    if (!game.artifacts.get(8).isHere()) {
      game.history.write("You must have left your matches at home. You don't have anything to light it with.");
      return false;
    }
    if (artifact !== null) {
      if (artifact.id === 10) {
        if (artifact.monster_id === Monster.PLAYER) {
          game.history.write("Better put it down first!");
        } else {
          if (game.artifacts.get(11).isHere() || game.artifacts.get(12).isHere()) {
            game.history.write("* * B O O M * *", "special");
            game.history.write("The explosion blew a hole in the doorway that was bricked up.");
            artifact.destroy();
            game.artifacts.get(11).destroy();
            game.artifacts.get(12).destroy();
          } else {
            game.history.write("Save that for when you need it.");
          }
        }
        return false; // skip the regular "light source" lighting routine
      }
    }
    return true;
  },

  "look": function(arg: string) {
    let throne = game.artifacts.get(26);
    let door = game.artifacts.get(36);
    if (arg !== "" && throne.match(arg) && throne.isHere() && door.embedded) {
      game.effects.print(3);
      door.reveal();
    }
    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    // cave in
    if (room_to.id === 5 && game.effects.get(1).seen === false) {
      game.effects.print(1);
    }
  },

  "beforePut": function(arg: string, artifact: Artifact, container: Artifact) {
    if (artifact.id === 20) {
      game.effects.print(4);
      return false;
    }
    return true;
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact) {
    // cursed sword
    if (old_wpn && old_wpn.id === 20) {
      game.effects.print(4);
      return false;
    }
    return true;
  },

  "say": function(arg) {
    arg = arg.toLowerCase();
    if (arg === 'anderhauf' && game.artifacts.get(17).isHere()) {
      game.history.write("As you say the word, you feel the sword vibrate and... vanish!", "special");
      game.artifacts.get(17).destroy();
    }
    if (arg === 'gilgamesh' && game.artifacts.get(20).isHere()) {
      game.history.write("The sword leaps from your hand and begins to bend and stretch. As you watch in horror, it transforms into a huge demon!", "special");
      game.artifacts.get(20).destroy();
      game.monsters.get(15).moveToRoom();
    }
    if (arg === 'eamon' && game.player.room_id === 52) {
      game.history.write("You hear a rumbling noise, and find yourself teleported...", "special");
      let rm = game.diceRoll(1, 7) + 10;
      game.player.moveToRoom(rm);
    }
  },

  "seeArtifact": function(artifact: Artifact): void {
    if (artifact.id === 26) {
      game.artifacts.get(36).reveal();
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact.isHere() && artifact.name === 'bottle') {
      game.history.write("Try lighting it.");
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (roll <= 25) {
      game.history.write("You hear a rush of wind.");
      let lights = game.artifacts.all.filter(a => Artifact.TYPE_LIGHT_SOURCE && a.is_lit && a.isHere());
      for (let l of lights) {
        game.history.write("It blew out your " + l.name);
        l.is_lit = false;
      }
    } else if (roll <= 50) {
      game.history.write("A flame erupts from the floor, engulfing and burning you.", "warning");
      game.player.injure(5);
    } else if (roll <= 75 && game.player.hasArtifact(10)) {
      game.history.write("The chemical you were carrying just exploded!", "warning");
      game.player.injure(5);
      game.artifacts.get(10).destroy();
    } else {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    }
  },

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let kathryn = game.monsters.get(6);
    if (kathryn.isHere() && kathryn.reaction !== Monster.RX_HOSTILE) {
      game.after_sell_messages.push("Kathryn thanks you for rescuing her and immediately heads off to find a new adventure.");
    }
  },

}; // end event handlers
