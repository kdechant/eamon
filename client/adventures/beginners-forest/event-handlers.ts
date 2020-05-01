import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

declare var game: Game;

export var event_handlers = {

  "start": function(arg: string) {
    game.data["queen effect"] = game.player.gender === "m" ? 5 : 6;
    game.data["queen artifact"] = game.player.gender === "m" ? 7 : 15;
    game.data["met queen"] = false;

    // set up the entrance/exit gates
    game.artifacts.get(19).seen = true;
    game.artifacts.get(20).seen = true;
    game.artifacts.get(20).name = game.artifacts.get(19).name;
    game.rooms.get(33).seen = true;

    // Sir Grummor is always kind to the ladies!
    if (game.player.gender === 'f') {
      game.monsters.get(4).friendliness = Monster.FRIEND_ALWAYS;
    }

    // entrance routine, similar to Beginner's Cave
    game.effects.print(11);
    if (game.player.weapon_id === null) {
      game.effects.print(12);
    } else if (game.player.weapon_abilities[1] === 5 &&
        game.player.weapon_abilities[2] === -10 &&
        game.player.weapon_abilities[3] === 20 &&
        game.player.weapon_abilities[4] === 10 &&
        game.player.weapon_abilities[5] === 0) {
      game.effects.print(15);
    } else {
      // not a beginner
      game.effects.print(13);
      game.monsters.get(11).moveToRoom(1);
    }
  },

  "attackMonster": function(arg: string, target: Monster) {
    // ranger
    if (target.id === 11) {
      game.history.write(target.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    // ranger
    if (target.id === 11) {
      game.history.write(target.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "death": function(monster: Monster) {
    // ghosts
    if (monster.id === 9) {
      game.effects.print(8);
      // reset the count, or else the next time they appear there would be 2
      if (monster.count === 1) {
        monster.count = 0;
      }
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    // ranger
    if (recipient.id === 11) {
      game.history.write(recipient.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "take": function(arg: string, item: Artifact, monster: Monster) {
    // ranger
    if (monster.id === 11) {
      game.history.write(monster.name + " is still pretending that you aren't here.");
      return false;
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    switch (exit.room_to) {
      case -2:
        game.history.write("The path is washed out!");
        return false;
      case -33:
        // spooky water
        game.effects.print(3);
        exit.room_to = 1;
        break;
      case -34:
        // beaver dam
        game.effects.print(1);
        exit.room_to = 33;
        break;
      case -35:
        // trying to climb the cliff
        game.effects.print(4);
        game.player.injure(4);
        return false;
    }
    return true;
  },

  "beforeRead": function(arg: string, artifact: Artifact) {
    if (artifact !== null) {
      // some readable artifacts have their text contained in the artifact description
      if (artifact.id === 19 || artifact.id === 20) {
        game.history.write(artifact.description, "special");
        return false;
      }
    }
    return true;
  },

  "afterRead": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 3) {
      // scroll vanishes
      artifact.destroy();
    }
  },

  "wear": function(arg: string, target: Artifact) {
    // agility ring
    if (target && target.id === 2) {
      game.history.write("You can feel the new agility flowing through you!", "success");
      if (game.player.spell_counters['speed'] === 0) {
        game.player.speed_multiplier = 2;
      }
      game.player.spell_counters['speed'] += 10 + game.diceRoll(1, 10);
    }
    return true;
  },

  "spellExpires": function(spell_name) {
    // if wearing the agility ring, it disappears
    let ring = game.artifacts.get(2);
    if (spell_name === 'speed' && ring.monster_id === 0 && ring.is_worn) {
      game.effects.print(17, 'success');
      ring.destroy();
    }
  },

  "endTurn": function() {
    // ghosts
    let ghosts = game.monsters.get(9);
    if (game.player.room_id > 1 && game.player.room_id <= 5) {
      // 1 in 3 chance a ghost appears in those rooms; limit of 4 in the room
      if (game.diceRoll(1, 3) == 1 && ghosts.children.filter(m => m.isHere()).length < 4) {
        try {
          ghosts.children.find(m => !m.isHere() && m.status === Monster.STATUS_ALIVE).moveToRoom();
        } catch (e) {
          // no ghosts left; do nothing
        }
        ghosts.seen = false;
      }
    }

    // fairy queen
    let queen = game.monsters.get(8);
    if (queen.room_id === game.player.room_id && !game.data["met queen"]) {
      game.data["met queen"] = true;
      game.effects.print(game.data["queen effect"]);
      game.artifacts.get(game.data["queen artifact"]).moveToRoom();

      // grass blade turns into Greenblade
      let blade = game.artifacts.get(6);
      if (blade.isHere()) {
        blade.destroy();
        game.artifacts.get(8).moveToRoom();
      }
    }
  },

  "fumble": function(attacker: Monster, defender: Monster, fumble_roll: number) {
    // player can't break or damage weapon in this adventure
    if (attacker.id === Monster.PLAYER && fumble_roll > 80) {
      game.history.write("-- fumble recovered!", "no-space");
      return false;
    }
    return true;  // otherwise, use regular fumble logic
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
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

}; // end event handlers
