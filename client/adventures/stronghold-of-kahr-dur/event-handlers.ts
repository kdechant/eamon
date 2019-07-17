import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

declare var game: Game;

export var event_handlers = {

  "start": function(arg: string) {
    // let game = Game.getInstance();

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

  "endTurn2": function() {
    // let game = Game.getInstance();

    // flavor effects
    let odds = game.rooms.get(84).seen ? 10 : 5;
    if (game.diceRoll(1, 100) <= odds) {
      game.effects.print(game.diceRoll(1, 5) + 64);
    }
  },

  "monsterAction": function(monster: Monster) {
    // let game = Game.getInstance();

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
    let game = Game.getInstance();
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
    return true;
  },

  "say": function(phrase) {
    // let game = Game.getInstance();
    phrase = phrase.toLowerCase();

    if (phrase === 'knock nikto mellon') {
      let cauldron = game.artifacts.get(24);
      if (cauldron.isHere() && cauldron.contains([19,20,21,22])) {
        game.effects.print(51);
        game.data['cauldron'] = true;
      }
    }
  },

  "seeMonster": function (monster: Monster): void {
    // let game = Game.getInstance();
    // lich
    if (monster.id === 15) {
      game.effects.print(53);
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();

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
    // TODO: bring companions into/out of pit

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


// declare any functions used by event handlers and custom commands
