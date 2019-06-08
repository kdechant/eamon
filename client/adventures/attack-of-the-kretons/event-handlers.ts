import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // custom attack messages
    let witch_attacks = [
      "sends flames showering upon",
      "sends a phantom fist hammering at",
      "shoots a beam of light at",
      "shoots a lightning bolt at",
      "conjures a ghostly dragon which snaps at"
    ];
    game.monsters.get(19).combat_verbs = witch_attacks;
    game.monsters.get(20).combat_verbs = witch_attacks;

    // game data
    game.data['sage wants rum'] = 0;  // d$(1)
    game.data['prince unconscious'] = false;  // d$(2)
    game.data['eagles'] = false;  // d$(3)
    game.data['hot room'] = false;  // d$(4)
    game.data['read codex'] = false;  // d$(5)
    // the next few should be effect "seen" flag or seeMonster e.h.
    // game.data['groo sees kretons'] = false;  // d$(6)
    // game.data['seen torture room'] = false;  // d$(7)
    // game.data['pillagers'] = false;  // d$(8)
    // game.data['conan'] = false;  // d$(9)
    // game.data['statue'] = false;  // d$(10)
    game.data['conan dies'] = false;  // d$(11)
    game.data['can take orb'] = false;  // d$(12)

    // monster random actions
    game.monsters.get(1).data['actions'] = ['growls viciously.', 'cracks a walnut on his head.',
      'spits in a beer and swears.', 'chases some barbarians out.', 'opens a bottle with his teeth.'];
    game.monsters.get(3).data['battle_taunts'] = ['A fray!', 'Now Groo does what Groo does best!',
      'Fear me! I am Groo, the guy you should fear!', 'Die, mendicant!'];
    game.monsters.get(16).data['actions'] = ['blows a smoke ring.']

    // monster talk effects
    game.monsters.get(1).data['talk'] = 1;
    game.monsters.get(2).data['talk'] = 98;
    game.monsters.get(3).data['talk'] = 23;
    game.monsters.get(4).data['talk'] = 19;
    game.monsters.get(5).data['talk'] = -3;
    game.monsters.get(6).data['talk'] = 62;
    game.monsters.get(7).data['talk'] = -3;
    game.monsters.get(8).data['talk'] = 0;
    game.monsters.get(9).data['talk'] = 18;
    game.monsters.get(10).data['talk'] = 20;
    game.monsters.get(11).data['talk'] = 22;
    game.monsters.get(12).data['talk'] = 0;
    game.monsters.get(13).data['talk'] = 26;
    game.monsters.get(14).data['talk'] = -2;
    game.monsters.get(15).data['talk'] = 31;
    game.monsters.get(16).data['talk'] = 34;
    game.monsters.get(17).data['talk'] = -1;
    game.monsters.get(18).data['talk'] = 39;
    game.monsters.get(19).data['talk'] = 35;
    game.monsters.get(20).data['talk'] = 35;
    game.monsters.get(21).data['talk'] = 38;
    game.monsters.get(22).data['talk'] = -1;
    game.monsters.get(23).data['talk'] = -2;
    game.monsters.get(24).data['talk'] = -2;
    game.monsters.get(25).data['talk'] = -1;
    game.monsters.get(26).data['talk'] = 50;
    game.monsters.get(27).data['talk'] = -2;
    game.monsters.get(28).data['talk'] = -1;
    game.monsters.get(29).data['talk'] = -2;
    game.monsters.get(30).data['talk'] = 57;
    game.monsters.get(31).data['talk'] = -1;
    game.monsters.get(32).data['talk'] = -1;
    game.monsters.get(33).data['talk'] = -2;
    game.monsters.get(34).data['talk'] = 0;
    game.monsters.get(35).data['talk'] = -2;
    game.monsters.get(36).data['talk'] = -1;
    game.monsters.get(37).data['talk'] = -2;
    game.monsters.get(38).data['talk'] = 94;
    game.monsters.get(39).data['talk'] = -1;
    game.monsters.get(40).data['talk'] = -2;
    game.monsters.get(41).data['talk'] = -2;

  },

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    // some monsters never take damage
    return (defender.id === 29 || defender.id === 40) ? 0 : true;
  },

  "endTurn2": function() {
    let game = Game.getInstance();

    // groo's reactions to things
    let groo = game.monsters.get(3);
    if (groo.isHere()) {
      // statue
      if (game.artifacts.get(57).isHere() && !game.effects.get(74).seen) {
        game.effects.print(74);
      }

    }

    // monster actions and taunts
    game.monsters.visible.forEach(m => {
      if (m.data['actions']) {
        let action = game.getRandomElement(m.data['actions']);
        game.history.write(`${m.name} ${action}`);
      }
      if (game.in_battle && m.data['battle taunts']) {
        let taunt = game.getRandomElement(m.data['battle taunts']);
        game.history.write(`${m.name} shouts with bloodlust, "${taunt}"`);
      }
    });

    // dog's name
    if (game.monsters.get(18).isHere()) {
      game.monsters.visible.filter(m => m.special && m.special.indexOf('dog') !== -1 && !m.data['dog'])
        .forEach(m => {
        game.history.write(`${m.name} asks what the dog's name is.`);
        m.data['dog'] = true;
      });
    }
  },

  "fumble": function(attacker: Monster, defender: Monster, fumble_roll: number) {
    let game = Game.getInstance();
    // some monsters can't fumble
    if (attacker.id === 29 || attacker.id === 40) {
      game.history.write("-- fumble recovered!", "no-space");
      return false;
    }
    return true;  // otherwise, use regular fumble logic
  },

  "beforeOpen": function(arg: string, artifact: Artifact, command: OpenCommand) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 9) {  // city gate
        game.history.write("Don't be dumb.");
        return false;
      }
    }
    return true;
  },

  "seeMonster": function(monster: Monster): void {
    let game = Game.getInstance();
    // nasreen's opening remarks
    if (monster.id === 1) {
      game.history.write('Nasreen tells you, "Two of my commandos, Nevil and Norwood, are waiting in the camp to the south. We should join them as soon as you\'re ready."');
    }
    if (monster.id === 19) {
      // dragon
      game.effects.print(10);
      monster.destroy();
      game.monsters.get(20).removeChildren(Math.floor(game.monsters.get(20).children.length / 3));
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
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
