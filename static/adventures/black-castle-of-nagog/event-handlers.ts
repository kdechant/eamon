import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['vrock appeared'] = false;
    game.data['balor appeared'] = false;
    game.data['bridge'] = false;

  },

  "endTurn": function() {
    let game = Game.getInstance();

    // idol and demons - appear in random spot, but always appear before you leave
    if (game.player.hasArtifact(2)) {
      let rn = game.diceRoll(1, 100);
      if (game.player.room_id === 2 || game.player.room_id === 6) {
        // something always appears in these rooms if it didn't already appear
        // (player has to pass these rooms to exit, so this guarantees that both demons appear)
        rn = 1;
      }
      if (game.player.room_id <= 63 && !game.data['vrock appeared']) {
        if (rn < 40) {
          game.history.write("You feel a wave of heat coming from the dread idol.", "warning");
          game.monsters.get(29).moveToRoom();
          game.data['vrock appeared'] = true;
        }
      } else if (game.player.room_id <= 28 && !game.data['balor appeared']) {
        // balor always appears after vrock
        if (rn < 35) {
          game.history.write("A feeling of approaching evil sends shivers down your spine as an icy breeze suddenly manifests itself.", "warning");
          game.monsters.get(30).moveToRoom();
          game.data['balor appeared'] = true;
        }
      }
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();
    if (game.data['bridge'] && (game.player.room_id === 64 || game.player.room_id === 65)) {
      game.history.write("A crystal bridge extends across the chasm.", "special");
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -64:
      case -65:
        // bridge
        if (game.data['bridge']) {
          exit.room_to = Math.abs(exit.room_to);
        }
        break;
      case -98:
        game.history.write("You started down the chasm, but the footing was too slippery and the stones crumbled under your feet. You quiclkly scramble back up to the ledge.");
        return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (artifact && artifact.id === 2) {
      // idol
      let rnd = game.diceRoll(1, 20) + 5;
      if (rnd > game.player.agility) {
        game.history.write("When you touched the idol, a bolt of lightning from the ceiling hits you.", "special");
        game.player.injure(Math.max(2, Math.floor((game.player.hardiness - game.player.damage) / 3)));
      }
    }
  },

  "specialPut": function(arg: string, item: Artifact, container: Artifact) {
    let game = Game.getInstance();
    // rubies / statue
    if (item.id === 14 && container.id === 71) {
      game.history.write("You put the rubies into the statue's scepter and you hear hidden gears grinding.");
      container.is_open = true;
      return false;   // skips the rest of the "put" logic
    }
    return true;
  },

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    // book
    if (artifact && artifact.id === 10) {
      game.history.write("After reading the book you understand your magic spells better, thus making it easier to cast them. However the book evaporates into smoke.", "special");
      for (let spell_name of ['blast', 'heal', 'speed', 'power']) {
        if (game.player.spell_abilities_original[spell_name]) { // only improves spells you already know
          game.player.spell_abilities[spell_name] += 5;
          game.player.spell_abilities_original[spell_name] += 5;
        }
      }
      artifact.destroy();
      command.markings_read = true;
    }
  },

  "say": function(phrase) {
    let game = Game.getInstance();
    phrase = phrase.toLowerCase();

    if (phrase === 'morgar' && !game.data['bridge'] && game.player.room_id === 64 && game.player.hasArtifact(1)) {
      game.history.write("A mist appears over the chasm and then parts to reveal a crystal bridge spanning the gorge.", "special");
      game.data['bridge'] = true;
    }
  },

  "see_monster": function(monster: Monster): void {
    let game = Game.getInstance();

    // mummy
    if (monster.id === 17) {
      for (let m of game.monsters.visible) {
        // friendly monsters can change their reaction
        if (m.reaction == Monster.RX_FRIEND) {
          m.friendliness = Monster.FRIEND_RANDOM;
          m.friend_odds -= 10;
          m.reaction = Monster.RX_UNKNOWN;
          m.checkReaction();
          if (m.reaction == Monster.RX_NEUTRAL) {
            game.history.write(m.name + " looks at you like he has never seen you before.");
          } else if (m.reaction == Monster.RX_HOSTILE) {
            game.history.write(m.name + " sees the mummy and goes insane!");
          }
        }
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();

    if (game.player.room_id == 64 && !game.data['bridge']) {
      game.data['bridge'] = true;
    } else {

      // resurrection
      for (let a of game.artifacts.visible) {
        if (a.type === Artifact.TYPE_DEAD_BODY) {
          let monster_id = a.id - game.dead_body_id;
          let monster = game.monsters.get(monster_id);
          if (monster) {
            monster.damage = 0;
            monster.moveToRoom();
            game.history.write(monster.name + " comes alive!");
            a.destroy();
            return;
          }
        }
      }

      if (roll <= 50) {
        game.history.write("You hear a loud sonic boom which echoes all around you!");
      } else if (roll <= 75) {
        // teleport to random room
        game.history.write("You are being teleported...");
        let room = game.rooms.getRandom([65,67]);
        game.player.moveToRoom(room.id);
        game.skip_battle_actions = true;
      } else {
        game.history.write("All your wounds are healed!");
        game.player.heal(1000);
      }
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
