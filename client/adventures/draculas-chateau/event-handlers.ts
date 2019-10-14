import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {ModalQuestion} from "../../core/models/modal";

declare var game: Game;

export var event_handlers = {

  "start": function(arg: string) {

    // witch
    game.monsters.get(9).spells = ['blast', 'heal'];

    game.counters = {
      'drunk': 0,
      'xorn': 0,
      'dracula': 0
    };

    // EDX 5.0 recharge rate is 10% of current rate per turn
    game.spell_recharge_rate = ['percentage', 10];

    game.player.moveToRoom(63);
  },

  "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
    // slime
    if (defender.id === 15 && attacker.id === 0 && game.diceRoll(1, 4) === 4 && game.player.weapon.weapon_type !== 2) {
      game.effects.print(17);
      game.player.weapon.sides -= 2;
      if (game.player.weapon.sides <= 0) {
        game.history.write(`Your ${game.player.weapon.name} now has so many holes it's useless!`, "warning");
        game.player.weapon.destroy();
      }
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    // belg
    if (target.id === 26) {
      game.effects.print(20);
      return false;
    }
    return true;
  },

  "chooseTarget": function (attacker, defender): Monster {
    // belg always attacks the player
    return attacker.id === 26 ? game.player : defender;
  },

  "death": function(monster: Monster, attacker: Monster) {
    // player / belg
    if (monster.id === 0 && attacker && attacker.id === 26) {
      game.history.pause();
      attacker.destroy();
      game.effects.print(16);
      game.rooms.get(98).description = game.effects.get(4).text;
      game.rooms.get(98).seen = false;
      game.player.damage = game.data['damage before belg'];
      return false;
    }
    // dracula
    if (monster.id === 2) {
      game.counters['dracula'] = 5;
    }
    // sheryl / player
    if (monster.id === 25 && attacker.id === Monster.PLAYER) {
      game.effects.print(6);
      game.die(false);
    }
    return true;
  },

  "endTurn1": function () {
    // stuff that happens after room desc is shown, but before monster/artifacts
    let xorn = game.monsters.get(12);
    if (xorn.seen) {
      if (xorn.isHere()) {
        if (game.diceRoll(1, 4) === 4) {
          game.effects.print(29);
          xorn.destroy();
          game.counters['xorn'] = 5;
        }
      } else if (xorn_can_appear() && game.countdown('xorn')) {
        game.effects.print(30);
        xorn.moveToRoom();
      }
    }

    let dracula = game.monsters.get(2);
    if (game.countdown('dracula')) {
      dracula.status = Monster.STATUS_ALIVE;
      dracula.damage = Math.floor(dracula.hardiness / 2);
      game.effects.print(game.artifacts.get(30).isHere() ? 31 : 32);
      game.artifacts.get(30).destroy();
      dracula.moveToRoom();
    }

    // see the key, even in the dark
    if (game.artifacts.get(23).room_id === game.player.room_id && game.rooms.current_room.is_dark) {
      game.effects.print(13);
    }

    game.monsters.updateVisible();
  },

  "endTurn2": function () {
    if (game.monsters.get(16).isHere()) {
      game.effects.print(14);
    }
    if (game.countdown('drunk')) {
      game.effects.print(28);
      game.player.hardiness = game.data['original hd'];
      game.player.agility = game.data['original ag'];
      game.player.status_message = '';
    }
  },

  "flee": function() {
    if (game.monsters.get(16).isHere()) {  // vine
      game.effects.print(8);
      return false;
    }
    if (game.monsters.get(26).isHere()) {  // belg
      game.effects.print(9);
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    // belg
    if (monster.id === 26) {  // belg
      game.history.write("He laughs in your face!");
      return false;
    } else if (monster.id === 17) {  // animated sword
      game.effects.print(10);
      return false;
    }
    return true;
  },

  "look": function(arg: string) {
    if (game.monsters.get(26).isHere()) {
      game.history.write("Belg looms over you and you can't see anything.");
      return false;
    }
    return true;
  },

  "dropArtifact": function(monster: Monster, artifact: Artifact): void {
    // dracula drops goldenwrath (either during combat, or as he dies)
    if (monster.id === 2 && artifact.id === 8) {
      game.effects.print(3);
      put_out_goldenwrath();
    }
  },

  "pickUpArtifact": function(monster, artifact) {
    // dracula re-lights his sword when he picks it up
    if (monster.id === 2 && artifact.id === 8) {
      game.effects.print(15);
      light_goldenwrath();
    }
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact): boolean {
    // gun
    if (new_wpn.id === 11) {
      new_wpn.use();
      return false;
    }
    return true;
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();
    let gw = game.artifacts.get(8);
    if (phrase === 'miyrm') {
      if (game.artifacts.get(67).room_id === 40) {
        game.effects.print(game.player.room_id === 40 ? 18 : 19, 'special');
        game.artifacts.get(67).destroy();
      }
    } else if (phrase === 'flame on') {
      if (gw.isHere()) {
        game.history.write("GoldenWrath suddenly bursts into flame!", 'special');
        light_goldenwrath();
      }
    } else if (phrase === 'flame off') {
      if (gw.isHere()) {
        game.history.write("GoldenWrath extinguishes its flame!", 'special');
        put_out_goldenwrath();
      }
    }
  },

  "seeMonster": function(monster: Monster): void {
    // belg
    if (monster.id === 26) {
      game.data['damage before belg'] = game.player.damage;
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 65) {  // shovel
        game.history.write("Digging...");
        if (game.player.room_id === 80 && !game.data["found gold"]) {
          game.history.write("You find some buried gold!");
          game.data["found gold"] = true;
          game.artifacts.get(25).moveToRoom();
        } else {
          game.history.write("You find nothing.");
        }
      } else if (artifact.id === 2) {  // stake
        if (game.monsters.get(2).isHere()) {
          game.effects.print(34);
        } else if (game.artifacts.get(30).isHere()) {
          game.effects.print(33);
          game.artifacts.get(2).destroy();
          game.artifacts.get(30).destroy();
          game.artifacts.get(68).moveToRoom();
          game.counters['dracula'] = 0;
        } else {
          if (game.monsters.get(7).isHere() || game.monsters.get(8).isHere() ||
            game.artifacts.get(35).isHere() || game.artifacts.get(36).isHere()) {
            game.history.write("Save that for Dracula.");
          } else {
            game.history.write("You find nothing to use it on.");
          }
        }
      } else if (artifact.id === 10) {  // iron cross
        let vampires = game.monsters.all.filter(m => m.special === 'vampire' && m.isHere());
        if (vampires.length) {
          for (let v of vampires) {
            game.history.write(`${v.name} recoils from the cross!`, 'special');
            v.flee();
          }
        } else {
          game.history.write("Nothing happens.");
        }
      } else if (artifact.id === 11) {  // gun
        if (!game.monsters.visible.length) {
          game.history.write("There's no one here to shoot!");
          return false;
        }
        game.pause();
        let q1 = new ModalQuestion;
        q1.type = 'multiple_choice';
        q1.question = "You only have one bullet. Shoot whom?";
        q1.choices = game.monsters.visible.map(m => m.name);
        q1.choices.push("No one");
        q1.callback = function (answer) {
          answer = answer.toLowerCase();
          if (answer !== 'no one') {
            let target = game.monsters.getLocalByName(answer);
            game.history.write("B A N G ! !", "emphasis");
            let article = [2, 7, 8, 25, 26].indexOf(target.id) === -1 ? "the" : "";
            game.history.write(`${game.player.name} shoots ${article} ${target.name}!`);
            if (target.id === 4) {
              target.injure(target.hardiness, true);
            } else if (target.id === 26) {
              game.history.write("The bullet bounces off of Belg!", "emphasis");
            } else {
              target.injure(game.diceRoll(2, 8), true);
            }
            game.artifacts.get(11).destroy();
            game.artifacts.get(12).moveToInventory();
          }
          return true;
        };
        game.modal.questions = [q1];
        game.modal.run();
        // always return false here because the actual movement happens in the callback.
        return false;
      } else if (artifact.id === 12) {  // empty gun
        game.history.write("It's out of bullets.");
        return false;
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (roll <= 5) {
      // thrown to sharks
      game.effects.print(22);
      game.die();
    } else if (roll <= 50 && game.counters['drunk'] === 0) {
      // drunk
      game.effects.print(21);
      game.data['original hd'] = game.player.hardiness;
      game.data['original ag'] = game.player.agility;
      game.player.hardiness += 2;
      game.player.agility -= 3;
      game.counters['drunk'] = 20;
      game.player.status_message = 'drunk';
    } else if (roll <= 65) {
      // ground shakes
      game.effects.print(23);
    } else if (roll < 86) {
      // healing
      game.effects.print(24);
      game.player.heal(1000);
    } else {
      // weapon change
      if (game.player.weapon) {
        if (game.player.weapon.type === Artifact.TYPE_WEAPON) {
          game.effects.print(25);
          game.player.weapon.type = Artifact.TYPE_MAGIC_WEAPON;
          game.player.weapon.sides += 2;
        } else {
          game.effects.print(26);
          game.player.weapon.type = Artifact.TYPE_WEAPON;
          game.player.weapon.sides = Math.max(1, game.player.weapon.sides - 2);
        }
      } else {
        // default if no weapon ready
        game.effects.print(23);
      }
    }
  },

}; // end event handlers


// functions used by event handlers and custom commands
function light_goldenwrath(): void {
  "use strict";
  let gw = game.artifacts.get(8);
  gw.dice = 3;
  gw.is_lit = true;
  gw.inventory_message = "flaming";
}

function put_out_goldenwrath(): void {
  "use strict";
  let gw = game.artifacts.get(8);
  gw.dice = 2;
  gw.is_lit = false;
  gw.inventory_message = "";
}

// xorn can reappear on main level or lower level only
function xorn_can_appear(): boolean {
  return (game.player.room_id >= 33 && game.player.room_id <= 50) ||
         (game.player.room_id >= 61 && game.player.room_id <= 76);
}
