import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ModalQuestion} from "../../core/models/modal";
import {CommandException} from "../../core/utils/command.exception";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['inner gate open'] = false;
    game.data['clone check'] = false;
    game.data['cannon uses'] = 3;
    game.data['power off'] = false;

  },

  "beforeMove": function(arg: string, current_room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -4:
      case -9:
        // main gate
        if (game.artifacts.get(34).room_id !== null || game.monsters.get(21).room_id !== null) {
          game.history.write("The clone army is blocking the gates!");
          return false;
        } else {
          exit.room_to = Math.abs(exit.room_to);
        }
        break;
      case 3:
        if (current_room.id === 2 && !game.player.hasArtifact(5)) {
          game.history.write('One of the commandos says, "Don\'t forget the dynamite. You\'ll need it."');
          return false;
        }
        if (game.artifacts.get(34).room_id === null || game.monsters.get(21).room_id === null) {
          game.effects.print(12);
          game.exit();
        }
    }
    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    // airships follow
    if (room_from.id === 3 && room_to.id === 4 && game.artifacts.get(4).room_id === 3) {
      game.artifacts.get(4).moveToRoom();
    }
    // inner gate
    if (room_from.id === 20 && room_to.id === 21 && game.artifacts.get(22).room_id === 20 && !game.data["inner gate open"]) {
      game.data["inner gate open"] = true;
      game.effects.print(3);
    }
    // servants' doors
    if (room_from.id === 47 && room_to.id === 19) {
      game.artifacts.get(21).is_open = true;
    }
    if (room_from.id === 44 && room_to.id === 26) {
      game.artifacts.get(27).is_open = true;
    }
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    if (target.id === 34) {
      if (game.in_battle) {
        throw new CommandException("That will take a while. You can't turn your back on the enemy!");
      }
      target.hardiness -= game.diceRoll(game.player.weapon.dice, game.player.weapon.sides);
      if (target.hardiness < 0) {
        game.effects.print(11);
        destroy_clonatorium();
      } else {
        game.history.write("You hack at the machines, but it's going to take a while to do enough damage.");
        if (game.diceRoll(1, 2) === 2) {
          // move guards into the room
          game.history.write("A guard enters the room!", 'emphasis');
          game.monsters.get(23).damage = 0;
          game.monsters.get(23).moveToRoom();
        } else {
          game.history.write("Better hurry! More guards are on the way!");
        }
      }
      return false;
    }
    return true;
  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // to battle!
    if (target.id === 5 || target.id === 6) {
      game.effects.print(9);
      game.monsters.get(4).reaction = Monster.RX_NEUTRAL;
      game.monsters.get(5).reaction = Monster.RX_NEUTRAL;
      game.monsters.get(6).destroy();
      game.monsters.updateVisible();
      game.artifacts.get(4).name = 'rebel airship';
      game.delay();
      return false;
    }
    return true;
  },

  "beforeClose": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.id === 22 && game.data['inner gate open']) {
      game.history.write("The gears have been smashed. You can't close it.");
      return false;
    }
    return true;
  },

  "flee": function(arg: string, exit: RoomExit) {
    let game = Game.getInstance();
    if (game.monsters.get(20).isHere() && game.player.room_id === 28) {
      // big group of soldiers
      if (arg === 's' || arg === 'south') {
        game.history.write("The soldiers block the entrance!");
      } else {
        game.player.moveToRoom(27);  // always flee north
        game.skip_battle_actions = true;
      }
      return false;
    }
    return true;
  },

  "light": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact !== null) {
      // dyn-o-mite!
      if (artifact.id === 5) {
        if (artifact.monster_id === Monster.PLAYER) {
          game.history.write("Better put it down first!");
        } else {
          if (game.artifacts.get(6).isHere()) {  // west side
            game.effects.print(1);
            game.history.write("* * B O O M * *", "special");
            artifact.destroy();
            game.artifacts.get(6).destroy();
            game.artifacts.get(9).moveToRoom();
            game.artifacts.get(10).moveToRoom(11);
            game.rooms.current_room.createExit('e', 11);
            game.rooms.get(11).createExit('w', 6);
          } else if (game.artifacts.get(8).isHere()) {  // east side
            game.effects.print(1);
            game.history.write("* * B O O M * *", "special");
            artifact.destroy();
            game.artifacts.get(8).destroy();
            game.artifacts.get(11).moveToRoom();
            game.artifacts.get(12).moveToRoom(16);
            game.rooms.current_room.createExit('w', 16);
            game.rooms.get(16).createExit('e', 8);
          } else {
            game.history.write("Save that for when you need it.");
          }
        }
        return false; // skip the regular "light source" lighting routine
      }
    }
    return true;
  },

  "seeArtifact": function(artifact: Artifact): void {
    let game = Game.getInstance();
    if (artifact.id === 45) {
      game.delay();
      game.effects.print(13);
      game.monsters.get(15).destroy();
    }
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
      game.monsters.get(20).removeChildren(Math.floor(game.monsters.get(20).children.length * 0.4));
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.isHere()) {
      switch (artifact.name) {
        case 'dynamite':
          game.history.write("Try lighting it.");
          break;
        case 'fire cannon':
          if (game.in_battle) {
            throw new CommandException("The soldiers won't let you!");
          }
          let q1 = new ModalQuestion;
          q1.type = 'multiple_choice';
          q1.question = "What do you target with the cannon?";
          q1.choices = ['Battlefield', 'Power Station', 'Inner Gate'];
          q1.callback = function (answer) {
            switch (answer) {
              case q1.choices[0]:
                game.effects.print(5);
                break;
              case q1.choices[1]:
                game.effects.print(6);
                break;
              case q1.choices[2]:
                game.effects.print(7);
                game.artifacts.get(22).destroy();
                game.rooms.getRoomById(20).getExit('s').door_id = null;
                game.artifacts.get(23).moveToRoom(20);
                game.monsters.get(12).destroy();
                game.artifacts.get(44).moveToRoom(21);
                break;
            }
            game.data['cannon uses']--;
            if (game.data['cannon uses'] <= 0) {
              game.effects.print(8);
              artifact.destroy();
              game.artifacts.get(20).moveToRoom();
            }
          };
          game.modal.questions = [q1];
          game.modal.run();
          break;
        case 'console':
          if (!game.data['power off']) {
            game.history.write("You use the console to shut down power to parts of the complex. You hear startled shouts from outside, and the sounds of soldiers running.");
            // reduce the size of the big guard group
            game.monsters.get(20).removeChildren(Math.floor(game.monsters.get(20).children.length * 0.4));
            game.data['power off'] = true;
          } else {
            game.history.write("You can't figure out how to turn off any more power feeds.");
          }
          break;
        case 'resonant transformer':
          if (game.artifacts.get(34).isHere()) {
            artifact.destroy();
            game.effects.print(14);
            destroy_clonatorium();
          } else if (game.player.room_id === 23 || game.player.room_id === 32 || game.player.room_id === 39) {
            game.history.write("The device powers up and emits a series of small lightning bolts, but otherwise it does nothing.");
          } else {
            game.history.write("There is no power source here to operate the device.");
          }
          break;
        case 'glass grenade':
          if (game.artifacts.get(34).isHere()) {
            artifact.destroy();
            game.effects.print(15);
            destroy_clonatorium();
          } else if (game.in_battle) {
            game.effects.print(16);
            for (let m of game.monsters.visible.filter(x => x.reaction === Monster.RX_HOSTILE)) {
              if (m.children.length) {
                // group monsters take 1 hit per member
                m.children.forEach(c => c.injure(game.diceRoll(1, 20), true));
              } else {
                m.injure(game.diceRoll(1, 20), true);
              }
            }
            artifact.destroy();
          } else {
            game.history.write("There is nothing here to use the grenade on. Save it for when you need it.");
          }
          break;
      }
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();

    // inner gate
    if (game.artifacts.get(22).isHere() && game.artifacts.get(30).is_worn) {
      game.effects.print(2);
      game.artifacts.get(22).is_open = true;
    }

    // inside inner gate
    if (game.monsters.get(12).isHere() && !game.data['clone check']) {
      game.effects.print(4);
      game.data['clone check'] = true;
    }

  },

  // add your custom event handlers here

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

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let game = Game.getInstance();
    game.after_sell_messages.push("The rebels gave you some sheets of green paper with lots of zeroes on them as a reward. You threw them away as valueless.");
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
function destroy_clonatorium() {
  let game = Game.getInstance();

  game.artifacts.get(34).destroy();
  game.artifacts.get(35).moveToRoom();
  // chaos
  let guards = game.monsters.get(20);
  guards.children.filter(g => g.room_id === 28).forEach(g => g.destroy());

  game.monsters.get(5).destroy();
  game.monsters.get(13).destroy();
  game.monsters.get(23).moveToRoom(27);
  // todo: the group of guards starts with 1 member, but can grow. Need to research this
  game.monsters.get(23).spawnChild(); // turns it into a group monster with 1 member
  game.monsters.get(24).moveToRoom(20);
  game.monsters.get(25).moveToRoom(19);
  // any other remaining soldiers
  let possible_rooms = [10, 11, 12, 13, 16, 17, 20, 21, 22, 31, 37, 38, 43, 44, 45, 46, 47];
  for (let m = 7; m <= 12; m++) {
    if (game.monsters.get(m).room_id !== null) {
      let r = game.diceRoll(1, possible_rooms.length) - 1;
      let monster = game.monsters.get(m);
      monster.moveToRoom(possible_rooms[r]);
      // also move all living members of group monsters
      monster.children.filter(c => c.status === Monster.STATUS_ALIVE).forEach(c => c.moveToRoom(possible_rooms[r]));
    }
  }
}
