import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {CommandException} from "../../core/utils/command.exception";

declare var game: Game;

export var event_handlers = {

  "start": function(arg: string) {
    // set custom hardiness of monsters based on player's best weapon
    // (which should be the weapon the player readied at game init)
    let wpn = game.player.getWeapon();
    let dmg = wpn ? wpn.maxDamage() / 2 : 10;
    game.monsters.all.filter(m => parseInt(m.special) > 0)
      .forEach(m => m.hardiness = dmg * parseInt(m.special));

    // ss/lwm names
    game.lwm_name = "Lord William Crankhandle";
    game.ss_name = "Tom Zucchini";

    // EDX 5.0 recharge rate is 10% of current rate per turn
    game.spell_recharge_rate = ['percentage', 10];

    game.data['cauldron'] = false;
    game.data['lich'] = 0;
  },

  "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
    // can't hit necromancer
    if (defender.id === 22) {
      return 0;
    }
    return true;
  },

  "miss": function(attacker: Monster, defender: Monster) {
    // special messages when you miss the necromancer
    if (defender.id === 22) {
      game.effects.print(60 + game.diceRoll(1, 4), 'special2 no-space');
      return false;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // necromancer
    if (target.id === 22 && !game.player.isWearing(25)) {
      game.history.write(`${game.player.name} casts a blast spell at ${target.getDisplayName()}`);
      game.effects.print(56 + game.diceRoll(1, 4), 'special2 no-space');
      return false;
    }
    return true;
  },

  "blastDamage": function(attacker: Monster, defender: Monster, damage: number) {
    // wizard's helm makes blast spell more potent
    if (attacker.isWearing(25)) {
      return game.diceRoll(2, 12);
    }
    return true;
  },

  "afterClose": function(arg: string, artifact: Artifact) {
    if (artifact.id === 3 && game.artifacts.get(4).isHere()) {
      game.artifacts.get(4).destroy();
    }
  },

  "endTurn2": function() {
    // flavor effects
    let odds = game.rooms.get(84).seen ? 10 : 5;
    if (game.diceRoll(1, 100) <= odds) {
      game.effects.print(game.diceRoll(1, 5) + 64);
    }
  },

  "look": function(arg: string) {
    let artifact = game.artifacts.getLocalByName(arg, false);
    if (artifact) {
      if (artifact.id === 3 && game.player.isWearing(2)) {
        artifact.open();
        game.artifacts.get(4).moveToRoom();
        return false;
      }
      if (artifact.id === 11 && game.player.isWearing(2)) {
        game.artifacts.get(10).moveToRoom();
        return false;
      }
    }
    return true;
  },

  "monsterAction": function(monster: Monster) {
    // Necromancer has several special attacks. He always targets
    // the player and his attacks always ignore armor.
    if (monster.id === 22) {
      const summonables = {5: 23, 6: 24, 7: 25};  // monsters he can summon
      let action = game.diceRoll(1,7);

      // don't summon monster already in room
      if (action >= 5 && game.monsters.get(summonables[action]).isHere()) {
        action++;
      }
      if (action > 7) action = game.diceRoll(1,4);

      game.effects.print(69 + action);

      switch (action) {
        case 1:  // spell drain
          game.player.spell_abilities = game.player.spell_abilities.map(a => a *= 0.8);
          return false;
        case 2:  // lightning
          game.player.injure(game.diceRoll(1,8), true);
          return false;
        case 3:  // fireball
          game.player.injure(game.diceRoll(1,6), true);
          return false;
        case 4:  // necrotic spell
          game.player.injure(game.diceRoll(1,10), true);
          return false;
        default:
          let mon = game.monsters.get(summonables[action]);
          mon.damage = 0;
          mon.status = Monster.STATUS_ALIVE;
          mon.moveToRoom();
          return false;
      }
    }
    return true;
  },

  "beforeMove": function(arg: string, room_from: Room, exit: RoomExit): boolean {
    // Cannot enter forest if not wearing magical amulet
    if (room_from.id === 92 && exit.room_to === 65 && !game.player.hasArtifact(18)) {
      game.effects.print(45);
      return false;
    }
    // pit (going down)
    if (room_from.id === 84 && exit.room_to === 94) {
      if (game.player.hasArtifact(14)) {
        // If descend pit w/ mgk boots, write effect, and allies stay put
        game.effects.print(47);
        game.player.moveToRoom(94, false);
      } else {
        // If descend pit w/out mgk boots, fall to death
        game.modal.confirm("It looks dangerous, try to climb down anyway?",
          answer => {
            if (answer === 'Yes') {
              game.effects.print(46);
              game.die();
            }
          });
      }
      return false;
    }

    // pit (going up)
    if (room_from.id === 94 && exit.room_to === 84) {
      if (game.player.hasArtifact(14)) {
        game.effects.print(48);
        // allies stay put
        game.player.moveToRoom(84, false);
      } else {
        // Cannot go up the pit if not wearing mgk boots
        game.history.write("The ceiling is too high to climb back up!", "emphasis");
      }
      return false;
    }

    // secret doors work differently here
    if (exit.door_id && !game.artifacts.get(exit.door_id).isHere()) {
      throw new CommandException("You can't go that way!");
    }

    return true;
  },

  "afterOpen": function(arg: string, artifact: Artifact) {
    if (artifact.id === 3 && game.player.isWearing(2)) {
      game.artifacts.get(4).moveToRoom();
    }
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();

    if (phrase === 'knock nikto mellon') {
      let cauldron = game.artifacts.get(24);
      if (cauldron.isHere() && cauldron.contains([19,20,21,22])) {
        game.effects.print(51);
        game.data['cauldron'] = true;
      }
    }
  },

  "seeMonster": function(monster: Monster): void {
    // lich
    if (monster.id === 15) {
      game.effects.print(53);
    }
  },

  "spellBacklash": function(spell_name: string): boolean {
    // no forgetting spells completely in this adventure; it
    // would make it unwinnable; just reduce ability temporarily
    game.history.write(`Spell backlash! Your ability to cast ${spell_name.toLocaleUpperCase()} temporarily diminishes!`);
    game.player.spell_abilities[spell_name] = 1;
    return false;
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let cauldron = game.artifacts.get(24);
    if (game.data['cauldron'] && cauldron.isHere() && cauldron.contains([19,20,21,22])) {
      game.artifacts.get(7).open();
      game.artifacts.get(7).key_id = null;
      game.artifacts.get(8).key_id = null;
      game.data['cauldron'] = false;
      game.effects.print(52, "special");
      game.history.write("The cauldron disintegrates!", "special");
      cauldron.destroy();
    }

    // move companions into pit
    if (isInPit(game.player)) {
      let friends = game.monsters.all.filter(
        m => m.seen && m.reaction === Monster.RX_FRIEND
        && m.status === Monster.STATUS_ALIVE && !isInPit(m));
      if (friends.length > 0) {
        for (let f of friends) {
          game.history.write(`${f.name} suddenly appears!`);
          f.moveToRoom();
        }
      }
    } else {
      // move companions out of pit
      let friends = game.monsters.all.filter(
        m => m.seen && m.reaction === Monster.RX_FRIEND
        && m.status === Monster.STATUS_ALIVE && isInPit(m));
      if (friends.length > 0) {
        for (let f of friends) {
          game.history.write(`${f.name} suddenly appears!`);
          f.moveToRoom();
        }
      }
    }

    // standard effects, if not casting knock or moving friends
    if (roll <= 50) {
      game.history.write("You hear a loud sonic boom which echoes all around you!", "special");
    } else if (roll <= 90) {
      game.history.write("The air crackles with magical energy but nothing interesting happens.", "special");
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
function isInPit(monster: Monster) {
  return monster.room_id > 93 && monster.room_id < 110;
}
