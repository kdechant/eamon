import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['gold stolen'] = 0;
    game.data['laszlo spells'] = 0;

    // custom attack messages
    game.monsters.get(5).combat_verbs = ["bites at", "leaps at"];
    game.monsters.get(17).combat_verbs = ["shoots a firebolt at", "swings at"];

  },

  "drop": function(arg: string, artifact: Artifact): boolean {
    if (artifact.id === 20) {
      Game.getInstance().history.write("You can't pry the golden sword from your hand!");
      return false;
    }
    return true;
  },

  "endTurn": function() {
    let game = Game.getInstance();

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
    let game = Game.getInstance();
    if (game.monsters.get(1).isHere() && game.diceRoll(1, 25) > game.player.agility) {
      game.history.write("Your exit was blocked!");
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();
    // special message when the player finds the treasure
    if (artifact && artifact.id == 20) {
      game.history.write("As you touch the sword, your hand feels warm. You are forced to drop any ready weapon you have and use the golden sword!", "special");
      game.player.ready(artifact);
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    // cursed sword
    if (artifact.id === 20) {
      game.history.write("You can't pry the golden sword from your hand!");
      return false;
    }
    return true;
  },

  "light": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
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

  "monsterAction": function(monster: Monster) {
    let game = Game.getInstance();

    // laszlo can cast spells
    if (monster.id === 17 && game.data['laszlo spells'] < 3 && game.diceRoll(1,3) === 3) {
      if (monster.damage > monster.hardiness * 0.4) {
        // heal
        game.history.write(monster.name + " casts a heal spell!");
        let heal_amount = game.diceRoll(2, 6);
        monster.heal(heal_amount);
      } else {
        // blast
        let monster_target = monster.chooseTarget();
        let damage = game.diceRoll(2, 5);
        game.history.write(monster.name + " casts a blast spell at " + monster_target.name + "!");
        game.history.write("--a direct hit!", "success");
        monster_target.injure(damage, true);
      }
      game.data['laszlo spells']++;
      return false; // skip the default combat actions
    }

    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    // cave in
    if (room_to.id === 5 && game.effects.get(1).seen === false) {
      game.effects.print(1);
    }
  },

  "beforePut": function(arg: string, artifact: Artifact, container: Artifact) {
    let game = Game.getInstance();
    if (artifact.id === 20) {
      Game.getInstance().history.write("You can't pry the golden sword from your hand!");
      return false;
    }
    return true;
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact) {
    let game = Game.getInstance();
    // cursed sword
    if (old_wpn && old_wpn.id === 20) {
      game.history.write("You can't pry the golden sword from your hand!");
      return false;
    }
    return true;
  },

  "say": function(arg) {
    let game = Game.getInstance();
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
    let game = Game.getInstance();
    if (artifact.id === 26) {
      game.artifacts.get(36).reveal();
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.isHere() && artifact.name === 'bottle') {
      game.history.write("Try lighting it.");
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
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
    let game = Game.getInstance();
    let kathryn = game.monsters.get(6);
    if (kathryn.isHere() && kathryn.reaction !== Monster.RX_HOSTILE) {
      game.after_sell_messages.push("Kathryn thanks you for rescuing her and immediately heads off to find a new adventure.");
    }
  },

}; // end event handlers
