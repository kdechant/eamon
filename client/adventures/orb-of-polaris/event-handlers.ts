import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['freezing'] = 0;
    game.data['flamethrower instructions'] = false;
    game.data['warlock appeared'] = false;
    game.data['warlock speaks 1'] = false;

    // random word of power to shatter the orb
    let power_words = ["pokaris","freonis","chinara","requess","planoris"];
    game.data['magic word'] = power_words[game.diceRoll(1, power_words.length) - 1];

    game.data['power counter'] = 0;
  },

  "endTurn": function() {
    let game = Game.getInstance();
    if (game.player.room_id >= 29 && game.player.room_id <= 32) {
      // warm room effects
      if (game.monsters.get(2).isHere()) {
        game.history.write("Frosty just melted!", "special2");
        game.monsters.get(2).destroy();
        for (let i = 14; i <= 18; i++) {
          game.artifacts.get(i).moveToRoom();
        }
      }
      if (game.artifacts.get(3).isHere()) {
        game.history.write("The frozen adventurer thaws out!", "special2");
        game.artifacts.get(3).destroy();
        game.monsters.get(11).moveToRoom();
      }
      if (game.artifacts.get(5).isHere()) {
        game.history.write("Bleazak thaws out!", "special2");
        game.artifacts.get(5).destroy();
        game.monsters.get(19).moveToRoom();
      }
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();
    // special logic for cold rooms
    if (game.player.room_id < 29 || game.player.room_id > 32) {
      // freezing
      if (game.player.isWearing(4) || game.player.isWearing(9)) {
        game.data['freezing'] = 0;
      } else {
        game.data['freezing']++;
        if (game.data['freezing'] > game.player.hardiness) {
          game.history.write("You have frozen to death!", "special");
          game.die();
        } else if (game.data['freezing'] > game.player.hardiness * 0.8) {
          game.history.write("You are nearly freezing to death!", "special");
        } else if (game.data['freezing'] > game.player.hardiness * 0.6) {
          game.history.write("You are freezing!", "special");
        } else if (game.data['freezing'] > game.player.hardiness * 0.4) {
          game.history.write("You are extremely cold!", "special");
        } else {
          game.history.write("Brrr! You are very cold.", "special");
        }
      }
      // icicles fall
      if (game.diceRoll(1, 20) === 20) {
        game.history.write("Some large icicles have fallen from the ceiling!", 'warning');
        if (game.diceRoll(1,2) === 2) {
          game.player.injure(2, true);
        } else {
          game.history.write("A near miss! The icicles shatter harmlessly on the cavern floor.");
        }
      }
    }

    // warlock effects
    if (game.monsters.get(22).isHere()) {
      if (game.player.hasArtifact(19) && !game.data['warlock speaks 1']) {
        game.effects.print(3);
        game.data['warlock speaks 1'] = true;
      }
      if (game.player.hasArtifact(20)) {
        game.effects.print(7);
        game.monsters.get(22).destroy();
      }
    }

  },

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    let game = Game.getInstance();
    if (defender.special === 'cold' && attacker.weapon_id === 12) {
      // flamethrower extra damage for cold-based monsters
      return damage * 2;
    }
    return true;
  },

  "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
    let game = Game.getInstance();
    // polaris gets hit by flamethrower
    if (defender.id === 1 && attacker.weapon_id === 12) {
      game.effects.print(2, 'special');
      defender.reaction = Monster.RX_NEUTRAL;
      game.artifacts.get(19).moveToRoom();
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (arg === 'icicle' || arg === 'icicles') {
      game.history.write("They are too high to reach.");
      return false;
    }

    if (arg === 'ice' || arg === 'snow') {
      game.history.write("There's enough of it around here, and you don't have much use for it.");
      return false;
    }

    if (artifact && artifact.id === 14 && !game.player.hasArtifact(21)) {
      game.history.write("You have no way to pick up the water!", "emphasis");
      return false;
    }

    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();
    // warlock
    if (artifact && artifact.id == 19 && !game.data['warlock appears']) {
      game.monsters.get(22).moveToRoom(1);
      game.data['warlock appeared'] = true;
    }
    return true;
  },

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();

    if (artifact && artifact.id === 13) {
      game.data['flamethrower instructions'] = true;
    }
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact) {
    let game = Game.getInstance();
    // flamethrower
    if (new_wpn.id === 12 && !game.data['flamethrower instructions']) {
      game.history.write("You can't figure out how to work it.");
      return false;
    }
    return true;
  },

  "say": function(arg) {
    let game = Game.getInstance();
    arg = arg.toLowerCase();
    if (game.artifacts.get(19).isHere() && arg === game.data['magic word']) {
      game.history.write("Cracks appear in the orb. They grow rapidly, spreading across the surface.", "emphasis");
      game.history.write("The orb shatters with a great crash!", "special2");
      game.artifacts.get(19).destroy();
      game.artifacts.get(20).moveToRoom();
    }
  },

  "see_monster": function(monster: Monster): void {
    let game = Game.getInstance();
    // some monsters speak when you first see them.

    // polaris
    if (monster.id === 1) {
      game.effects.print(9);
    }
  },

  "use": function(artifact) {
    let game = Game.getInstance();
    if (artifact.id === 12) {
      game.history.write("To use the flamethrower, READY it and ATTACK with it.")
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();

    // frosty
    if (in_cold_room()
      && game.artifacts.get(14).room_id === game.player.room_id
      && game.artifacts.get(15).room_id === game.player.room_id
      && game.artifacts.get(16).room_id === game.player.room_id
      && game.artifacts.get(17).room_id === game.player.room_id
      && game.artifacts.get(18).room_id === game.player.room_id
    ) {
      game.effects.print(8, "special");
      game.monsters.get(2).moveToRoom();
      game.monsters.get(2).damage = 0;
      game.artifacts.get(14).destroy();
      game.artifacts.get(15).destroy();
      game.artifacts.get(16).destroy();
      game.artifacts.get(17).destroy();
      game.artifacts.get(18).destroy();
      return;
    }

    // effects in this adventure are based on a counter, not on a random number
    game.data['power counter']++;
    switch (game.data['power counter'] % 3) {
      case 1:
        game.history.write("The word " + game.data['magic word'] + " just popped into your head!", "special");
        break;
      case 2:
        game.history.write('You hear a voice boom out of nowhere:', "emphasis");
        game.history.write("Destroy the Orb or know the everlasting peace of death!", "special2");
      case 3:
        game.history.write("All your wounds are healed!");
        game.player.heal(1000);
    }
  },

}; // end event handlers

/**
 * Determines if the player is in a cold room
 */
function in_cold_room() {
  let game = Game.getInstance();
  return game.player.room_id < 29 || game.player.room_id > 32;
}
