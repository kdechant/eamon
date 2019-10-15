import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ModalQuestion} from "../../core/models/modal";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // the dwarf's question

    // prevent user mischief
    let value = parseInt(game.intro_answer);
    if (value < 0 || isNaN(value)) {
      value = 0;
    }
    if (value > game.player.gold) {
      value = game.player.gold;
    }

    // dwarf's reaction depends on the amount of gold you give him
    if (value < 25) {
      game.history.write("Angry and hurt, the dwarf violently pushes you into the hole and slams the door shut above you!", "danger");
      game.rooms.getRoomById(1).getExit("u").room_to = -1; // blocks exit from starting room
    } else if (value < 50) {
      game.history.write("The dwarf looks disgustedly at the small payment in his hand, sniffs once, and turns and walks away.", "warning");
    } else {
      let adr = game.player.gender === "m" ? "sir" : "ma'am";
      game.history.write("The little man's face lights up...  He leans over to whisper to you as you climb into the hole, \"Thank you, " + adr + ", and keep a sharp eye out for secret doors down there!", "success");
    }
    game.player.gold -= value;

  },

  "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
    let game = Game.getInstance();
    // gelatinous cube
    if (attacker.id === 9) {
      if (game.diceRoll(1,6) > 1) {
        // pick a random armor item the player is wearing
        let armors = defender.inventory.filter(a => a.isArmor() && a.is_worn);
        if (armors.length === 0) {
          if (defender.id === Monster.PLAYER || defender.armor_class === 0) {
            return true; // can't do anything in this case
          }
          // NPC with armor class but no actual armor items
          game.history.write("The gelatinous cube burns a hole through " + defender.name + "'s armor!", "warning");
          defender.armor_class--;
          return true;
        }
        let roll = game.diceRoll(1, armors.length) - 1;
        let target_armor = armors[roll];
        target_armor.armor_class--;
        let defender_name = defender.id === Monster.PLAYER ? 'your' : defender.name + "'s";
        if (target_armor.armor_class <= 0) {
          game.history.write("The gelatinous cube burns a hole through " + defender_name + " " + target_armor.name + "! It's now useless!", "warning");
          target_armor.destroy();
          defender.updateInventory();
          return true;
        }
        game.history.write("The gelatinous cube dissolves part of " + defender_name + " " + target_armor.name + "!", "warning");
        defender.updateInventory();
      }
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    if (exit.room_to === -1) {
      game.history.write("The dwarf has blocked the exit!");
      return false;
    }

    // if player is carrying the crystal ball, look for possible hostile monsters in the next room
    if (game.player.hasArtifact(10)) {
      let monsters = game.monsters.getByRoom(exit.room_to);
      let danger = false;
      for (let m of monsters) {
        if (!m.seen) {
          danger = true;
        }
      }
      if (danger) {
        let q1 = new ModalQuestion;
        q1.type = 'multiple_choice';
        q1.question = "The crystal ball warns of possible danger ahead! Do you wish to proceed?";
        q1.choices = ['Yes', 'No'];
        q1.callback = function (answer) {
          if (answer.toLowerCase() === 'yes') {
            let room_to = game.rooms.getRoomById(exit.room_to);
            let room_from = game.rooms.current_room;
            game.player.moveToRoom(room_to.id, true);
            game.triggerEvent("afterMove", arg, room_from, room_to);
          }
          return true;
        };
        game.modal.questions = [q1];
        game.modal.run();
        // always return false here because the actual movement happens in the callback.
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }

  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact && artifact.id === 23) {
      // the grain sack
      game.effects.print(3, "danger");
      game.die();
      return false;
    }
    return true;
  },

  "beforeRead": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();

    if (artifact && artifact.id === 23) {  // sack
      // it's a container, so the regular "read a non-readable" logic doesn't work here.
      game.effects.print(6);
      return false;
    }
    return true;
  },

  "say": function(arg: string) {
    let game = Game.getInstance();
    arg = arg.toLowerCase();
    if (arg === 'pickle' && game.artifacts.get(19).isHere()) {
      game.history.write("  S H A Z A M ! !  ", "special");
      game.artifacts.get(19).destroy();
      game.artifacts.get(41).room_id = game.player.room_id;
    }
  },

  "use": function(artifact_name, artifact) {
    let game = Game.getInstance();
    if (artifact.id === 17) {
      // mad scientist's potion
      game.effects.print(5);
      let roll = game.diceRoll(1, 4);
      if (roll >= 3) {
        roll = -1;
      }
      game.player.hardiness += roll;
      game.history.write("It tastes awful!", "emphasis");
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else if (roll <= 75) {
      // teleport to random room
      game.history.write("You are being teleported...");
      let room = game.rooms.getRandom();
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let game = Game.getInstance();
    // reward for saving leia
    let leia = game.monsters.get(13);
    if (leia.isHere() && leia.reaction !== Monster.RX_HOSTILE) {
      game.after_sell_messages.push(game.effects.get(1).text);
      game.player.gold += 2500;
    }
    // reward for killing vader
    let vader = game.monsters.get(12);
    if (vader.room_id === null) {
      game.after_sell_messages.push(game.effects.get(2).text);
      game.player.gold += 1000;
    }

  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
