import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const event_handlers = {

  "start": function(): void {
    game.data = {
      red_lever: false,
      green_lever: false,
      blue_lever: false,
    };
    game.artifacts.get(63).is_lit = true;
    game.artifacts.get(63).inventory_message = 'glowing';

    game.player.spell_counters['aule'] = 0;
  },

  "armorClass": function (monster: Monster) {
    if (monster.id === Monster.PLAYER && monster.spell_counters['aule'] > 0) {
      // aule of the valar gave ac bonus (see power spell)
      monster.armor_class += 2;
    }
  },

  "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
    // sauron can't die here...
    if (defender.id === 2 && defender.damage > defender.hardiness) {
      game.effects.print(16);
      defender.destroy();
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    if (exit.room_to === -15) {
      if (game.data.green_lever) {
        exit.room_to = 15;
        return true;
      }
      // fall in pit
      game.effects.print(14);
      game.player.moveToRoom(14);
      return false;
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    if (artifact && artifact.id == 33) {
      // crown
      game.effects.print(1);
      if (game.player.hasArtifact(41)) {
        // forge druinval from mithril ore
        game.effects.print(4);
        game.artifacts.get(41).destroy();
        game.artifacts.get(20).moveToInventory();
      }
      game.exit();
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    if (recipient.id === 25) {
      game.history.write("You can't give anything to an eagle.");
      return false;
    }
    return true;
  },

  "beforeUse": (arg: string): boolean => {
    // magic stone is also a light source with quantity -1. This prevents it from
    // being used normally, so this logic has to go in 'beforeUse'.
    const stone = game.artifacts.get(63);
    if (stone.match(arg) && stone.isHere()) {
      const morgoth = game.monsters.get(1);
      if (!morgoth.isHere()) {
        game.history.write("Good idea, but not here.");
        return false;
      } else {
        game.effects.print(5);
        morgoth.injure(morgoth.hardiness, true);
        return false;
      }
    }
    return true;
  },

  "use": function(artifact_name, artifact): boolean {
    if (artifact.id === 14) {
      // red lever
      if (game.data.red_lever) {
        game.history.write('You should know better than to try that again!');
        return false;
      }
      game.effects.print(13);
      game.player.injure(game.diceRoll(2,5));
      game.data.red_lever = true;
    }
    if (artifact.id === 22) {
      // needle
      game.history.write('Nah, better not.');
      return false;
    }
    if (artifact.id === 51) {
      // potion
      game.effects.print(6);
      game.player.hardiness += 2;
      game.player.stats_original.hardiness += 2;
      game.player.charisma -= 1;
      game.player.stats_original.charisma -= 1;
    }
    if (artifact.id === 55) {
      // bubbling stuff
      game.effects.print(7);
      game.player.injure(Math.floor((game.player.hardiness - game.player.damage) / 2), true);
    }
    if (artifact.id === 65) {
      // green lever
      if (game.data.green_lever) {
        game.history.write('You already pulled it!');
        return false;
      }
      game.effects.print(12);
      game.data.green_lever = true;
    }
    if (artifact.id === 66) {
      // blue lever
      if (game.data.blue_lever) {
        game.history.write('You already pulled it!');
        return false;
      }
      game.effects.print(15);
      const exit = new RoomExit();
      exit.direction = 'd';
      exit.room_to = 60;
      game.rooms.getRoomById(59).addExit(exit);
      game.rooms.getRoomById(59).name = "You are at the end of a north/south tunnel. (S/D)";
      game.data.blue_lever = true;
    }
    return true;
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll: number): void {
    if (roll <= 10) {
      // heal
      game.effects.print(10);
      game.player.damage = 0;
    } else if (roll <= 20) {
      // stronger armor
      game.effects.print(9);
      game.player.spell_counters.aule = 30;
      game.player.updateInventory(); // recalculates AC
    } else if (roll <= 95) {
      game.effects.print(8);
    } else {
      // morgoth damage spell
      game.effects.print(11);
      game.player.injure(8, true);
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
