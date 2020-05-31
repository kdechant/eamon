import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {CommandException} from "../../core/utils/command.exception";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

export var event_handlers = {

  "start": function() {
    adjustMonsterStats();

    game.data = {
      ...game.data,
      amulet_used: 0,
      orion_died: false,
      i_am: 0,
      temple: false,
      worshipped_magon: false,
    };

    game.monsters.get(2).data.reward = 100;
    game.monsters.get(3).data.reward = 80;
    game.monsters.get(4).data.reward = 50;
    game.monsters.get(5).data.reward = 50;
    game.monsters.get(6).data.reward = 50;
    game.monsters.get(7).data.reward = 50;

    // skullcleaver
    game.monsters.get(25).health_messages = [
      "is undamaged.",
      "has barely a scratch.",
      "is nicked.",
      "is damaged.",
      "is badly damaged.",
      "is barely holding together!",
      "falls to the ground, lifeless!"
    ];
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    // mutant equipment
    if (target.id >= 14 && target.id <= 19) {
      game.history.write("SMASH! CRUNCH! WHANG! CRASH!");
      target.destroy();
      game.artifacts.get(target.id + 6).moveToRoom();
      return false;
    }
    return true;
  },

  "attackMonster": function(arg: string, target: Monster) {
    if (target.id === 1) {
      orionGetsMad();
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    if (target.id === 1) {
      orionGetsMad();
    }
    return true;
  },

  "death": function(monster: Monster) {
    // orion's sword comes alive
    if (monster.id === 1) {
      game.effects.print(18);
      game.monsters.get(25).moveToRoom();
      game.monsters.get(25).showDescription();
      game.monsters.get(25).seen = true;
      game.data.orion_died = true;
    }
    return true;
  },

  "fumble": function(attacker: Monster, defender: Monster, fumble_roll: number) {
    // orion doesn't drop or damage his weapon
    if (attacker.id === 1) {
      game.history.write("-- fumble recovered!", "no-space");
      return false;
    }
    return true;  // otherwise, use regular fumble logic
  },

  "beforeMove": function(arg: string, current_room: Room, exit: RoomExit): boolean {
    if (exit.room_to === 3 && current_room.id === 1 && !game.player.hasArtifact(12)) {
      game.history.write('Forgetting something?');
      return false;
    }
    return true;
  },

  "endTurn2": function () {
    // locusts
    if (game.countdown('locusts')) {
      game.monsters.get(30).moveToRoom();
      game.monsters.get(30).showDescription();
      game.monsters.get(30).seen = true;
      game.monsters.updateVisible();
    }
  },

  "afterGet": function(arg, artifact) {
    // special message when the player finds the treasure
    if (artifact && artifact.id == 13) {
      game.effects.print(15);
      game.exit();
    }
    return true;
  },

  "seeMonster": function(monster: Monster): void {
    // some monsters speak when you first see them.

    // slig
    if (monster.id === 2) {
      game.effects.get(27).replacements = {'{name}': game.player.name};
      game.effects.print(27);
      if (game.monsters.get(1).isHere()) {
        game.effects.print(8);
      }
    }

    // lhara / chemyenne
    let i_am = false;
    if (monster.id === 13) {
      game.effects.print(2);
      if (!game.monsters.get(14).isHere()) i_am = true;
    }
    if (monster.id === 14) {
      game.effects.print(3);
      i_am = true;
    }
    // friendly NPCs in temple
    if (i_am && !game.data.temple) {
      game.data.temple = true;
      for (let i of [1, 9, 10, 11, 12]) {
        if (game.monsters.get(i).isHere()) {
          game.effects.get(28).replacements = {
            '{name}': game.monsters.get(i).name,
          }
          game.effects.print(28);
          break;
        }
      }
    }

    // croc
    if (monster.id === 28) {
      // set countdown to 2:
      // 1 for end of this turn
      // 1 for end of next turn when they appear
      game.counters['locusts'] = 2;
    }
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();
    if (phrase === 'hoshianu' && game.player.hasArtifact(12)) {
      game.command_parser.run('use amulet', false);
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 12 && artifact.isHere()) {
      game.data.amulet_used++;
      switch(game.data.amulet_used) {
        case 1:
          let ally_id = game.getRandomElement([9,10,11,12,26]);
          game.monsters.get(ally_id).moveToRoom();
          game.effects.print(30);
          break;
        case 2:
          if (game.player.damage > 0) {
            game.history.write('All of your wounds have cleared up!');
            game.player.damage = 0;
          }
          game.effects.print(31);
          game.player.hardiness += 1;
          game.player.stats_original.hardiness += 1;
          game.history.write("The amulet suddenly vanishes!", "special2");
          artifact.destroy();
          break;
        default:
          throw new CommandException("It should have disappeared!");
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (roll <= 40) {
      // teleport to random room
      game.history.write("You are being teleported...");
      let room = game.rooms.getRandom();
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else if (roll <= 55) {
      // heal
      let heal_amount = game.diceRoll(2, 6);
      game.history.write("Some of your wounds seem to clear up.");
      game.player.heal(heal_amount);
    } else if (roll <= 80) {
      game.effects.print(26);
      game.player.spell_abilities['blast'] = game.player.spell_abilities_original['blast'];
      game.player.spell_abilities['heal'] = game.player.spell_abilities_original['heal'];
      game.player.spell_abilities['speed'] = game.player.spell_abilities_original['speed'];
    } else {
      game.history.write("A sonic boom shakes the entire complex!");
    }
  },

  "afterSell": function() {
    // reward for killing and destroying stuff
    let reward = 0;
    let mutants_slain = 0;
    for (let i=2; i<=7; i++) {
      if (game.monsters.get(i).status === Monster.STATUS_DEAD) {
        reward += game.monsters.get(i).data.reward;
        mutants_slain++;
      }
    }
    for (let i=14; i<=19; i++) {
      if (game.artifacts.get(i).room_id === null) {
        reward += 100;
      }
    }
    game.after_sell_messages.push(game.effects.get(12).text);
    game.player.gold += reward;
    game.after_sell_messages.push(`After checking the list, he pays you ${reward} gold pieces.`);

    if (mutants_slain === 6) {
      game.after_sell_messages.push(game.effects.get(14).text);
    } else {
      game.after_sell_messages.push(game.effects.get(13).text);
    }
  },

}; // end event handlers

/**
 * When Orion gets mad, he gets really mad, and his sword does, too.
 */
function orionGetsMad() {
  game.monsters.get(1).reaction = Monster.RX_HOSTILE;
  game.monsters.get(25).reaction = Monster.RX_HOSTILE;
  game.monsters.get(1).weapon_dice = 6;
}

/**
 * Adjusts stats on monsters to make it tougher for strong characters
 */
export function adjustMonsterStats() {
  if (game.player.hardiness > 25) {
    let boost_amount = Math.ceil((game.player.hardiness - 20) / 3);
    for (let m = 2; m <= 7; m++) {
      game.monsters.get(m).hardiness += boost_amount;
    }
    for (let m = 27; m <= 30; m++) {
      game.monsters.get(m).hardiness += boost_amount;
      game.monsters.get(m).children.forEach(mon => mon.hardiness += boost_amount);
    }
  }
}
