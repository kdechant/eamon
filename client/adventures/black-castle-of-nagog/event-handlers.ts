import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

declare var game: Game;

export var event_handlers = {

  "start": function() {
    game.data['vrock appeared'] = false;
    game.data['balor appeared'] = false;
    game.data['bridge'] = false;
    // TODO: convert to core spell logic
    game.data['wizard spells'] = 3;
    game.data['lammasu spells'] = 3;
    game.data['rovnart'] = false;
  },

  "death": function(monster: Monster) {
    // balor
    if (monster.id === 30) {
      game.history.write("As the demon dies, its body explodes, destroying its weapons and blasting you with a powerful jolt of fire!", "special2");
      let rl = game.diceRoll(1, 6);
      game.player.injure(rl, true);
      for (let m of game.monsters.visible) {
        if (m.id !== 30) {
          let rl = game.diceRoll(1, 6);
          m.injure(rl);
        }
      }
    }
    return true;
  },

  "endTurn": function() {
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
          game.history.write("You feel a wave of heat coming from the dread idol.", "special2");
          game.monsters.get(29).moveToRoom();
          game.data['vrock appeared'] = true;
        }
      } else if (game.player.room_id <= 28 && !game.data['balor appeared']) {
        // balor always appears after vrock
        if (rn < 35) {
          game.history.write("A feeling of approaching evil sends shivers down your spine as an icy breeze suddenly manifests itself.", "special2");
          game.monsters.get(30).moveToRoom();
          game.data['balor appeared'] = true;
        }
      }
    }
  },

  "endTurn2": function() {
    if (game.data['bridge'] && (game.player.room_id === 64 || game.player.room_id === 65)) {
      game.history.write("A crystal bridge extends across the chasm.", "special");
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
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
    if (artifact && artifact.id === 2) {
      // idol
      // TODO: convert to new style saving throw
      let rnd = game.diceRoll(1, 20) + 5;
      if (rnd > game.player.agility) {
        game.history.write("When you touched the idol, a bolt of lightning from the ceiling hits you.", "special");
        game.player.injure(Math.max(2, Math.floor((game.player.hardiness - game.player.damage) / 3)), true);
      }
    }
  },

  "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
    // umber hulk's gaze
    if (attacker.id === Monster.PLAYER && defender.id === 21) {
      // TODO: if the IQ stat is ever implemented, turn this into an IQ check instead of HD
      if (game.diceRoll(1, 34) > game.player.hardiness) {
        game.history.write("Your vision seems to swim, making it hard to concentrate on fighting.", "special no-space");
        return odds - 10;
      }
    }
    return true;
  },

  "monsterAction": function(monster: Monster) {
    // wizard can cast blast
    if (monster.id === 13 && game.data['wizard spells'] > 0 && game.diceRoll(1,3) === 3) {
      // blast
      let monster_target = monster.chooseTarget();
      if (monster_target) {
        let damage = game.diceRoll(2, 5);
        game.history.write(monster.name + " casts a blast spell at " + monster_target.name + "!");
        game.history.write("--a direct hit!", "success");
        monster_target.injure(damage, true);
        game.data['wizard spells']--;
        return false; // skip the default combat actions
      }
    }
    // lammasu can cast heal
    if (monster.id === 15 && game.data['lammasu spells'] > 0 && game.diceRoll(1,3) === 3) {
      if (monster.damage > monster.hardiness * 0.4) {
        game.history.write(monster.name + " casts a heal spell!");
        let heal_amount = game.diceRoll(2, 6);
        monster.heal(heal_amount);
        game.data['lammasu spells']--;
        return false; // skip the default combat actions
      }
    }
    return true;
  },

  "afterOpen": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 63 && !game.data['rovnart']) {
      // rovnart's tomb
      game.data['rovnart'] = true;
      game.player.charisma -= 2;
      game.player.stats_original.charisma -= 2;
    }
  },

  "specialPut": function(arg: string, item: Artifact, container: Artifact) {
    // rubies / statue
    if (item.id === 14 && container.id === 71) {
      game.history.write("You put the rubies into the statue's scepter and you hear hidden gears grinding. The south wall swings open!");
      container.is_open = true;
      return false;   // skips the rest of the "put" logic
    }
    return true;
  },

  "afterRead": function(arg: string, artifact: Artifact) {
    // book
    if (artifact && artifact.id === 10) {
      for (let spell_name of ['blast', 'heal', 'speed', 'power']) {
        if (game.player.spell_abilities_original[spell_name]) { // only improves spells you already know
          game.player.spell_abilities[spell_name] += 5;
          game.player.spell_abilities_original[spell_name] += 5;
        }
      }
      artifact.destroy();
    }
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();

    if (phrase === 'morgar' && !game.data['bridge'] && game.player.room_id === 64 && game.player.hasArtifact(1)) {
      game.effects.print(4);
      game.data['bridge'] = true;
    }
  },

  "seeMonster": function(monster: Monster): void {
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
    if (game.player.room_id == 64 && !game.data['bridge']) {
      game.effects.print(4);
      game.data['bridge'] = true;
    } else {

      // resurrection
      for (let a of game.artifacts.visible) {
        if (a.type === Artifact.TYPE_DEAD_BODY) {
          let monster_id = a.id - game.dead_body_id + 1;
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

  "exit": function() {
    if (game.player.hasArtifact(2)) {
      let value = game.player.charisma * 100;
      game.history.write("Because you successfully recovered the gold idol, King Mithidas has knighted you and given you a land grant worth " + value + " gp!", "success");
      game.player.gold += value;
      game.player.charisma++;
      game.history.write("The pride of your new title has increased your charisma!", "emphasis");
    } else {
      game.history.write("So you returned without completing your quest. You shall be branded as the coward you are until you do finish the mission.", "emphasis");
      if (game.player.charisma > 1) {
        game.player.charisma--;
        game.history.write("The shame of failure has reduced your charisma.", "emphasis");
      }
    }
    return true;
  }

}; // end event handlers
