import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {CommandException} from "../../core/utils/command.exception";
import {put_out_trollsfire} from "../the-beginners-cave/event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

export var event_handlers = {

  "start": function(arg: string) {
    game.data.in_boat = false;
    game.data.water_rooms = [19, 20];
    game.data.shore_rooms = [21, 18];
    game.data.well_empty = false;
    game.data.just_summoned = false;
    game.data.no_teleport_rooms = [1, 8, 19, 20, 21, 22];
    // start in room 22
    game.player.moveToRoom(22);

    // things one can say
    game.data.phrases = {
      summon: 'yog-sothoth vigor commutare pulvis ai ai',
      unsummon: 'ai ai pulvis commutare vigor yog-sothoth',
      ygolonac: "ai ai y'golonac expergefeci ai ai",
      companion: 'oh companion of the night'
    };

    game.data.statue_counter = 0;

    game.monsters.get(1).data.growl_effect = 10;
    game.monsters.get(2).data.growl_effect = 9;
    game.monsters.get(3).data.growl_effect = 8;
    game.monsters.all.filter(m => m.special === 'ghoul').forEach(m => {
      m.data.smile_effect = 6;
      m.data.growl_effect = 7;
    });

    // Imam
    let imam = game.monsters.get(7);
    imam.spells = ['blast'];
    imam.spell_points = 5;
    imam.spell_frequency = 50;

    game.player.spell_counters['armor'] = 0;
  },

  "armorClass": function (monster: Monster) {
    if (monster.id === Monster.PLAYER && monster.spell_counters['armor'] > 0) {
      monster.armor_class += 2;
    }
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    // statuette
    if (target.id === 1) {
      game.effects.print(23);
      target.destroy();
      game.artifacts.get(80).moveToRoom();
      return false;
    }
    return true;
  },

  "drop": function(arg: string, artifact: Artifact): boolean {
    // elder sign
    if (artifact.id === 4 && game.player.room_id === 2) {
      useElderSign();
      return false;
    }
    return true;
  },

  "endTurn": function() {
    if (game.data.in_boat) {
      game.artifacts.get(28).moveToRoom();

      // shore
      if (game.data.in_boat && game.data.water_rooms.indexOf(game.player.room_id) === -1) {
        game.history.write("You get out of the skiff.");
        game.data.in_boat = false;
      }
    }

    // statuette
    if (game.player.room_id === 2 && game.artifacts.get(1).isHere()) {
      game.data.statue_counter++;
      if (game.data.statue_counter === 3) {
        game.monsters.get(2).moveToRoom();
        game.data.skip_battle_actions = true;
        game.data.just_summoned = true;
      }
    }
  },

  "endTurn1": function() {
    if (game.player.room_id === 8) {
      game.effects.print(27);
      game.die();
    }
  },

  "endTurn2": function() {
    if (game.player.room_id === 22 && !game.effects.get(22).seen) {
      game.effects.print(22);
    }
    if (game.data.in_boat) {
      game.history.write("(You are in the skiff.)");
    }

    // statuette
    if (game.player.room_id === 2 && game.artifacts.get(1).isHere()
        && game.data.statue_counter < 3) {
      game.effects.print(24);
    }

    // 50% chance of running away from a great one the turn it is summoned
    if (game.data.just_summoned && game.diceRoll(1, 2) === 2) {
      game.data.just_summoned = false;
      game.effects.print(21);
      if (game.player.weapon) {
        game.player.drop(game.player.weapon);
      }
      // turn off "pursues" flag briefly
      game.monsters.all.filter(m => m.special === 'great one').forEach(m => m.pursues = false);
      game.command_parser.run('flee', false);
      // turn "pursues" back on
      game.monsters.all.filter(m => m.special === 'great one').forEach(m => m.pursues = true);
      game.tick();
    }

  },

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 28) {
        // skiff
        game.history.write("To get into the boat, try going onto the canal.");
        return false;
      } else if (artifact.id === 26) {
        // jars
        game.effects.print(19);
        return false;
      }
    }
    return true;
  },

  "beforeMove": function(arg: string, from_room: Room, exit: RoomExit): boolean {
    if (game.data.water_rooms.indexOf(exit.room_to) !== -1) {
      if (game.artifacts.get(28).isHere()) {
        if (!game.data.in_boat) {
          game.history.write("You get into the skiff.");
          game.data.in_boat = true;
        }
        return true;
      } else {
        throw new CommandException("You can't go on the canal without a boat!");
      }
    }
    if (exit.room_to === 1) {
      if (isInWell(1) || isInWell(2)) {
        game.effects.print(20);
        game.monsters.get(1).moveToRoom();
        game.monsters.get(2).moveToRoom();
        game.data.just_summoned = true;
        game.data.skip_battle_actions = true;
      } else {
        game.effects.print(18);
      }
      return false;
    } else if (exit.room_to === 8) {
      game.modal.confirm("The water looks deep and turbulent. Do you really want to jump in?",
        answer => {
          if (answer === 'Yes') {
            game.player.moveToRoom(8);
          }
        });
      return false;
    }

    return true;
  },

  "say": function(arg) {
    let game = Game.getInstance();
    arg = arg.toLowerCase();
    // for easier matching
    arg = arg.replace(/yog[ '-]?sothoth/, 'yog-sothoth');
    if (arg === game.data.phrases.summon) {
      // make some zombies
      let printed2 = false;
      let summoned = false;
      for (let art of game.artifacts.all.filter(a => a.isHere() && a.id > 100)) {
        let m = game.monsters.get(art.id - 100);
        if (m && m.special === 'zombie') {
          if (m.id === 40) {
            game.effects.print(12, 'special');
            if (!m.seen) {
              game.effects.print(13, 'danger');
            }
          } else if (!printed2) {
            game.effects.print(3, 'special');
            printed2 = true;
          }
          m.moveToRoom();
          m.damage = 0;
          art.destroy();
          summoned = true;
        }
      }
      if (!summoned) {
        game.effects.print(33);
      }
    } else if (arg === game.data.phrases.unsummon) {
      // kill zombies
      let unsummoned = false;
      for (let m of game.monsters.visible.filter(m => m.special === 'zombie')) {
        let body = game.artifacts.get(m.dead_body_id);
        if (body) {
          body.moveToRoom();
        }
        game.effects.print(4);
        m.inventory.forEach(a => m.drop(a));
        m.destroy();
        unsummoned = true;
      }
      if (!unsummoned) {
        game.effects.print(33);
      }
    } else if (arg === game.data.phrases.ygolonac) {
      // summon y'g
      if (game.player.room_id === 54) {
        game.effects.print(5);
        game.monsters.get(3).moveToRoom();
        game.skip_battle_actions = true;
        game.data.just_summoned = true;
      } else {
        game.history.write("Nothing happens.");
      }
    } else if (arg === game.data.phrases.companion) {
      // summon hastur
      if (game.player.room_id === 2 || game.player.room_id === 61 && isInWell(1)) {
        game.effects.print(1);
        game.monsters.get(1).moveToRoom();
        game.skip_battle_actions = true;
        game.data.just_summoned = true;
      } else {
        game.history.write("Nothing happens.");
      }
    }
  },

  "monsterSmile": function(monster: Monster) {
    if (monster.reaction === Monster.RX_FRIEND && monster.data.smile_effect) {
      game.effects.print(monster.data.smile_effect);
      return false;
    }
    if (monster.reaction === Monster.RX_HOSTILE && monster.data.growl_effect) {
      game.effects.print(monster.data.growl_effect);
      return false;
    }
    return true;  // no special logic; monster will be included in normal smile logic
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.id === 28) {
        // boat
        game.history.write("To get into the skiff, just move onto the river.");
      } else if (artifact.id === 4) {
        // sign
        if (game.player.room_id === 2 && !game.effects.get(2).seen) {
          useElderSign();
        } else {
          game.effects.print(14);
        }
      } else if (artifact.id === 7) {
        // amulet
        game.effects.print(28);
        if (game.monsters.all.filter(m => m.special === 'great one')
          .some(m => m.isHere())) {
          game.effects.print(29);
          changeSpellAbility('blast', -game.diceRoll(4, 5));
          changeSpellAbility('heal', -game.diceRoll(4, 5));
          changeSpellAbility('power', -game.diceRoll(4, 5));
          changeSpellAbility('speed', -game.diceRoll(4, 5));
          game.player.weapon_abilities[1] -= game.diceRoll(3, 5);
          game.player.weapon_abilities[2] -= game.diceRoll(3, 5);
          game.player.weapon_abilities[3] -= game.diceRoll(3, 5);
          game.player.weapon_abilities[4] -= game.diceRoll(3, 5);
          game.player.weapon_abilities[5] -= game.diceRoll(3, 5);
          game.player.charisma -= 2;
        }
        game.effects.print(30);
        game.exit();
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let resurrectables = game.artifacts.visible.filter(a => a.id > 100);
    if (roll <= 10) {
      // teleport to random room
      game.history.write("There is a cloud of dust and a flash of light!");
      let room = game.rooms.getRandom(game.data.no_teleport_rooms);
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else if (roll < 30) {
      game.history.write("Your armor thickens!");
      game.player.spell_counters['armor'] = game.diceRoll(1, 12) + 5;
      game.player.updateInventory();
    } else if (roll < 40) {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    } else if (roll < 55 && resurrectables.length > 0) {
      for (let art of resurrectables) {
        let m = game.monsters.get(art.id - 100);
        if (m) {
          game.history.write(`${m.name} comes alive!`);
          m.resurrect();
        }
      }
    } else if (roll < 80) {
      game.history.write("You hear a loud sonic boom which echoes throughout the swamp.");
    } else {
      game.history.write("You can feel the new agility flowing through you!", "success");
      if (game.player.spell_counters['speed'] === 0) {
        game.player.speed_multiplier = 2;
      }
      game.player.spell_counters['speed'] += 10 + game.diceRoll(1, 10);
    }
  },

}; // end event handlers


function useElderSign() {
  game.effects.print(2);
  game.artifacts.get(4).destroy();
  if (isInWell(1)) {
    game.monsters.get(1).destroy();
  }
  if (isInWell(2)) {
    game.monsters.get(2).destroy();
  }
  game.artifacts.get(78).moveToRoom();
  changeSpellAbility('blast', 20);
  changeSpellAbility('heal', 20);
  changeSpellAbility('power', 20);
  changeSpellAbility('speed', 20);
}

function isInWell(monster_id) {
  return game.monsters.get(monster_id).room_id === 1;
}

function changeSpellAbility(spell_name, amount) {
  if (game.player.spell_abilities_original[spell_name] > 0) {
    game.player.spell_abilities[spell_name] += amount;
    game.player.spell_abilities_original[spell_name] += amount;
  }
}
