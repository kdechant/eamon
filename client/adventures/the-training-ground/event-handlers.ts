import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

export var event_handlers = {

  "start": function() {
    game.effects.print(17);
    if (game.player.armor_expertise > 25) {
      game.effects.print(18);
    }
    let a = game.player.gender === 'm' ? "son" : "miss";
    game.history.write('"OK, let\'s be careful in there, ' + a + '", he says, as he walks away.');

    // set up game data
    game.data["jacques_shouts"] = false;
    game.data["kobolds_appear"] = false;
    game.data["thors_hammer_found"] = false;
    game.data["secret_library"] = false;
    game.data["sounds_room_26"] = false;
    game.data["sex_change_counter"] = 0;
    game.data["charisma_boost"] = false;
    game.data["emerald warrior appeared"] = false;
    // old variables from EDX no longer used: sylvani_speaks, red_sun_speaks

    // set the "seen" flag on kobold6
    game.monsters.get(11).seen = true;

    // items for sale
    for (let id of [40, 41]) {
      game.artifacts.get(id).data.for_sale = true;
    }
  },

  "seeMonster": function(monster: Monster): void {
    // some monsters speak when you first see them.

    // red sun's opening remarks
    if (monster.id === 1) {
      game.effects.print(4);
    }
    // Sylvani speaks (ID 13 is Don Jonson. In EDX, Sylvani speaks after both descriptions are shown.)
    if (monster.id === 13) {
      game.effects.print(6);
    }
  },

  "endTurn": function() {
    // Kobolds appear (30% chance)
    if (game.player.room_id >= 11 && game.player.room_id <= 15 && !game.data["kobolds_appear"]) {
      let roll = game.diceRoll(1, 100);
      if (roll < 31) {
        for (let i = 6; i <= 9; i++) {
          game.monsters.get(i).room_id = game.player.room_id;
        }
        game.data['kobolds_appear'] = true;
      }
    }
  },

  "endTurn1": function() {
    // jacques shouts at you from the room he's locked in
    if (game.rooms.current_room.id === 8 && !game.data["jacques_shouts"]) {
      game.effects.print(5);
      game.data["jacques_shouts"] = true;
    }
    // You hear sounds...
    if (game.player.room_id === 26 && !game.data["sounds_room_26"]) {
      game.effects.print(15);
      game.data["sounds_room_26"] = true;
    }
    // Zapf the Conjurer brings in strangers (15% Chance)
    let zapf = game.monsters.get(15);
    if (zapf.isHere() && zapf.hasArtifact(33)) {
      let roll = game.diceRoll(1, 100);
      console.log("zapf roll", roll)
      if (roll <= 15) {
        game.effects.print(16, "special");
        let m = game.monsters.getRandom();
        // Zapf's spell only brings in monsters the player has already seen
        if (!m.isHere() && m.seen) {
          game.history.write("<<POOF!!>>  " + m.name + " appears!", "special");
          m.room_id = game.player.room_id;
        }
      }
    }
  },

  "endTurn2": function () {
    // display items for sale
    let for_sale = game.artifacts.all.filter(a => a.data.for_sale && a.monster_id && game.monsters.get(a.monster_id).isHere());
    if (for_sale.length) {
      game.history.write("Items for sale here: " + for_sale.map(a => a.name).join(', '));
    }
  },

  "afterGet": function (arg: string, artifact: Artifact) {
    // Taking Purple book reveals secret passage
    if (artifact && artifact.id === 27 && game.player.room_id === 24 && !game.data["secret_library"]) {
      game.effects.print(12, "special");
      let exit = new RoomExit();
      exit.direction = 'e';
      exit.room_to = 25;
      game.rooms.getRoomById(24).addExit(exit);
      game.rooms.getRoomById(24).name = "You are in the library. (E/W)";
      game.data["secret_library"] = true;
    }
    // Taking obsidian scroll case makes emerald warrior appear
    if (artifact && artifact.id === 30 && !game.data["emerald warrior appeared"]) {
      game.effects.print(13, "special");
      game.monsters.get(14).moveToRoom();
      game.data["emerald warrior appeared"] = true;
    }
  },

  "afterRead": function(arg: string, artifact: Artifact) {
    // Plain scroll increases BLAST ability
    if (artifact && artifact.id === 29) {
      game.player.spell_abilities["blast"] += 250;  // big boost to current spell ability
      game.player.spell_abilities_original["blast"] += 10;  // smaller boost to permanent spell ability
      artifact.destroy();
    }
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact) {
    // player tries to ready the Hammer of Thor
    if (new_wpn.id === 24) {
      game.history.write("Only Thor himself could do that!", "special");
      return false;
    }
    return true;
  },

  "use": function(arg: string, artifact: Artifact) {
    // use the thor's hammer
    if (artifact && artifact.id === 24) {
      game.command_parser.run('say thor');
    }
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    // Give obsidian scroll case to Emerald Warrior
    if (recipient.id === 14 && artifact.id === 30) {
      game.effects.print(14, "special");
      game.monsters.get(14).room_id = null;
      game.history.suppressNextMessage = true;  // don't print the standard "monster takes item" message
    }
    // giving the rapier to Jacques
    if (recipient.id === 5 && artifact.id === 8) {
      game.effects.print(22);
    }
    return true;
  },

  "giveGold": function(arg: string, gold_amount: number, recipient: Monster) {
    // buy potions from Bozworth the gnome - old version (deprecated in favor of BUY command)
    if (recipient.id === 20) {
      if (gold_amount < 100) {
        game.effects.print(28);
      } else {
        let p: Artifact;
        if (recipient.hasArtifact(40)) {
          p = game.artifacts.get(40);
        } else if (recipient.hasArtifact(41)) {
          p = game.artifacts.get(41);
        }
        if (p !== undefined) {
          game.player.gold -= gold_amount;
          p.monster_id = null;
          p.room_id = game.player.room_id;
          game.effects.print(31);
          if (gold_amount > 100) {
            game.effects.print(30);
          }
          recipient.updateInventory();
        } else {
          // out of potions
          game.effects.print(29);
        }
      }
      return false; // bypass normal "give money" logic
    }
    return true;
  },

  "say": function(arg: string) {
    arg = arg.toLowerCase();
    if (arg === 'thor' && game.artifacts.get(24).isHere()) {
      game.effects.print(32);
      game.monsters.visible.filter(m => m.reaction === Monster.RX_HOSTILE && !m.data.thor).forEach(m => {
        m.courage /= 4;
        // this effect can only happen once per monster
        m.data.thor = true;
      });
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    if (!game.data["thors_hammer_found"] && game.player.room_id === 22 && !game.artifacts.get(24).seen) {
      game.effects.print(7, "special");
      game.artifacts.get(24).room_id = game.player.room_id;
      game.data["thors_hammer_found"] = true;
      return;
    }

    // 20% chance of sex change
    if (roll < 21 && game.data["sex_change_counter"] < 2) {
      game.data["sex_change_counter"]++;
      let word = game.player.gender === "m" ? "feminine" : "masculine";
      game.history.write("You feel different...more " + word + ".");
      game.player.gender = game.player.gender === "m" ? "f" : "m";
      return;
    }
    // 40% chance Charisma up (one time only)
    if (roll < 41 && !game.data["charisma_boost"]) {
      game.data["charisma_boost"] = true;
      let word = game.player.gender === "m" ? "handsome" : "beautiful";
      game.player.charisma += 2;
      return;
    }
    // 5% Chance of being hit by lightning!
    if (roll > 94) {
      game.effects.print(33, "danger");
      game.player.injure(10, true);
      return;
    }
    // default
    game.history.write("You hear a loud sonic boom which echoes all around you!");
  },

  "attackMonster": function(arg: string, target: Monster) {
    // bozworth disappears if attacked/blasted
    if (target.id === 20) {
      game.effects.print(20);
      game.monsters.get(20).destroy();
      return false;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    // bozworth disappears if attacked/blasted
    if (target.id === 20) {
      game.effects.print(21);
      game.monsters.get(20).destroy();
      return false;
    }
    return true;
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    // can't attack or wear backpack
    if (target.id === 13) {
      game.history.write("You don't need to.");
      return false;
    }
    return true;
  },

  "wear": function(arg: string, target: Artifact) {
    // can't attack or wear backpack
    if (target.id === 13) {
      game.history.write("You don't need to. Just carry it.");
      return false;
    }
    return true;
  },

}; // end event handlers
