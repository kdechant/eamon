import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {CommandException} from "../../core/utils/command.exception";
import {ModalQuestion} from "../../core/models/modal";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['exit flag'] = false;
    game.data['bell ringing'] = false;
    game.data['amulet used'] = false;
    game.data['room rented'] = false;

  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // illusionary army disappears if attacked/blasted
    if (target.id === 6) {
      armyDisappears();
    }
    return true;
  },

  "blastMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // illusionary army disappears if attacked/blasted
    if (target.id === 6) {
      armyDisappears();
    }
    return true;
  },

  "death": function(monster: Monster) {
    let game = Game.getInstance();
    // banedon
    if (monster.id === 2) {
      game.effects.print(14);
      game.die();
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (artifact && artifact.id === 11 && game.data['amulet used']) {
      game.history.write("The amulet is too hot to pick up!", "warning");
      return false;
    }

    return true;
  },

  "specialGet": function(arg): boolean {
    let game = Game.getInstance();
    // if you try to get the sword when it's still in the brace
    let sword = game.artifacts.get(12);
    if (sword.match(arg) && sword.container_id === 31) {
      if (game.player.room_id === 10) {
        game.history.write("You can't reach it from here!");
        return false;
      } else if (game.player.room_id === 11) {
        game.history.write("The brace holds the sword in place!");
        return false;
      }
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();
    let esher = game.monsters.get(1);

    // player has to pick up some things before leaving first room
    if (room.id === 1 && exit.room_to === 2 && (!game.player.hasArtifact(13) || !game.player.hasArtifact(14) || !game.player.hasArtifact(11))) {
      game.history.write('Banedon says, "Forgetting something? Take the amulet, cube, and scabbard before you go."');
      return false;
    }

    // Leave cathedral without player or Esher carrying Sword of Inari
    if (room.id === 12 && exit.room_to === 13 && esher.isHere()) {
      if (!hasSword()) {
        game.effects.print(20);
        return false;
      }
    }
    // other special exits
    switch (exit.room_to) {
      case -2:
        game.effects.print(8);
        return false;
      case -3:
        if (esher.isHere()) {
          game.effects.print(9);
          return false;
        } else {
          game.effects.print(46);
          game.die();
          return false;
        }
      case -4:
        if (esher.isHere()) {
          game.effects.print(10);
          return false;
        } else {
          game.effects.print(46);
          game.die();
          return false;
        }
      case -5:
        if (esher.isHere()) {
          game.effects.print(11);
          return false;
        } else {
          game.effects.print(46);
          game.die();
          return false;
        }
      case -10:
        game.effects.print(7);
        return false;
      case -17:
        if (game.monsters.get(12).room_id === null) {
          game.monsters.get(12).moveToRoom(17);
          exit.room_to = 17;
          if (game.diceRoll(1, 50) > game.player.agility) {
            game.history.write("You walk out into the street and stumble right into a group of trackers!", 'danger');
            return true;
          }
          game.history.write("You step out into the street and stop dead when you see a group of trackers coming right toward you. You slink back into the alley before they spot you. That was close!", "warning");
          game.history.write("From what you can tell, the trackers are still lurking in the street in front of the inn. Best avoid going that way.");
          return false;
        }
        return false;
    }

    return true;
  },

  "beforePut": function(arg: string, item: Artifact, container: Artifact) {
    let game = Game.getInstance();
    if (item && item.id === 11 && !game.data['amulet used']) {
      game.command_parser.run('use amulet', false);
      return false;
    }
    // anything other than sword into scabbard
    if (container.id === 13 && item.id !== 12) {
      game.history.write("It won't fit.");
      return false;
    }
    return true;
  },

  "flee": function() {
    let game = Game.getInstance();
    if (game.monsters.get(5).isHere() || game.monsters.get(12).isHere()) {
      game.history.write("You are surrounded and cannot escape!", "emphasis");
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();

    if (recipient.id === 16 && artifact.id === 53 && recipient.hasArtifact(44)) {
      // receipt to leatherworker
      game.history.write("The leatherworker gives you a set of leather armor.");
      game.artifacts.get(44).moveToRoom();
    }
    return true;
  },

  "giveGold": function(arg: string, gold_amount: number, recipient: Monster) {
    let game = Game.getInstance();
    // buy options from Bozworth the gnome
    if ((recipient.id === 8 || recipient.id === 9) && gold_amount !== 10) {
      throw new CommandException("He wants 10 gold pieces, no more, no less!");
    }

    if (recipient.id === 8) {
      if (game.artifacts.get(32).room_id !== null) {
        throw new CommandException('"Finish what you have first!"');
      }
      game.history.write('"One brew coming right up!"');
      game.artifacts.get(32).moveToRoom();
      game.artifacts.get(32).quantity = 1;
    } else if (recipient.id === 9) {
      if (game.data['room rented']) {
        throw new CommandException('"You already rented a room!"');
      }
      game.data['room rented'] = true;
      game.history.write('"First room on your left!"');
      game.artifacts.get(19).moveToRoom();
    } else {
      throw new CommandException("No services are currently being offered by " + recipient.name + ".");
    }
    return true;
  },

  "look": function(arg: string) {
    let game = Game.getInstance();
    let sword = game.artifacts.get(12);
    if (sword.match(arg) && sword.container_id === 31) {
      if (game.player.room_id === 10) {
        game.history.write("The sword is too high to see clearly!");
        return false;
      } else if (game.player.room_id === 11) {
        game.history.write("The brace is blocking your view!");
        return false;
      }
    }
    return true;
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.isHere()) {
      switch (artifact.id) {
        case 6:
          // iron bell
          game.history.write("You try to push the bell, but it is too heavy to move!");
          return;
        case 9:
          // rope
          if (game.monsters.get(5).isHere()) {
            game.history.write("The worshippers ignore the ringing bell!");
            return;
          }
          if (game.data['bell ringing']) {
            game.history.write("The bell is still ringing from the first time!");
          }
          game.effects.print(6);
          game.monsters.get(5).destroy();
          game.artifacts.get(8).destroy(); // old peephole
          game.artifacts.get(30).moveToRoom(); // new peephole
          game.data['bell ringing'] = true;
          return;
        case 11:
          // amulet
          if (game.player.room_id === 11) {
            game.data['amulet used'] = true;
            artifact.moveToRoom();
            game.effects.print(19);
            return;
          }
          game.effects.print(37);
          return;
        case 14:
          // silver cube
          if (game.monsters.get(5).isHere()) {
            game.effects.print(36);
            artifact.destroy();
          } else if (game.player.room_id === 9) {
            game.monsters.get(6).moveToRoom();
            artifact.destroy();
            game.effects.print(12);
          } else {
            game.history.write("There's not enough room for the spell to work!", "warning");
          }
          return;
        // The following conflicted with the regular "you drink..." message. Removed pending game logic changes.
        // case 32:
        //   game.history.write("You gulp it all down in one drink. Everyone is impressed.");
        //   break;
        case 38:
          // hammer
          if (game.artifacts.get(52).isHere()) {
            game.artifacts.get(52).destroy();
            game.history.write("You smash the armor parts into very tiny pieces!");
          }
          return;
        case 47:
          // tools
          if (game.player.room_id === 21 && !game.artifacts.get(23).is_open) {
            game.artifacts.get(23).reveal();
            game.artifacts.get(23).open();
            game.history.write("You've pried the grate open!", "emphasis");
          }
          if (game.artifacts.get(44).isHere() && game.artifacts.get(52).isHere()) {
            game.artifacts.get(44).destroy();
            game.artifacts.get(52).destroy();
            game.artifacts.get(51).moveToRoom();
            game.effects.print(38);
          }
          return;
      }
    }
    game.history.write("Nothing happens.");
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 23) {
        artifact.reveal();
        game.history.write("It's stuck! You will need to find a way to pry it open.");
        return false;
      }
    }
    return true;
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();

    if (game.artifacts.get(11).isHere()) {
      game.effects.print(40);
      return;
    } else if (game.artifacts.get(12).isHere()) {
      game.effects.print(39);
      return;
    }

    if (roll <= 20) {
      game.effects.print(41);
    } else if (roll <= 40) {
      game.effects.print(42);
    } else if (roll <= 60) {
      game.effects.print(43);
    } else if (roll <= 91) {
      game.effects.print(44);
    } else {
      for (let m of game.monsters.visible) {
        game.history.write("All of " + m.name + "'s wounds are healed!");
        m.heal(m.damage);
      }
    }
  },

  "take": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    // you can't take alfred's lucky sword.
    if (monster.id === 1 && artifact.id === 1) {
      game.history.write(monster.name + " will not give up his weapon!");
      return false;
    }
    return true;
  },

  "exit": function() {
    let game = Game.getInstance();
    let sword = game.artifacts.get(12);
    let amulet = game.artifacts.get(11);

    // got sword of inari but didn't complete other puzzle tasks
    if (sword.container_id !== 31) {
      // Leave without using amulet
      if (!game.data['amulet used']) {
        game.effects.print(16);
        failedQuest();
        return true;
      }

      // Leave without putting Sword of Inari in scabbard
      if (sword.container_id !== 13) {
        game.effects.print(18);
        failedQuest();
        return true;
      }

      // Leave without using cube
      if (game.monsters.get(6).room_id !== 9) {
        game.effects.print(17);
        failedQuest();
        return true;
      }
    }

    // Leave without Sword of Inari
    if (!hasSword()) {
      game.effects.print(23);  // this effect has some chained effects in the db
      return true;
    }

    // successful mission
    game.effects.print(21);  // this effect has some chained effects in the db
    game.player.gold += 5000;
    // Player can't sell Sword, scabbard, amulet, or cube!
    game.artifacts.get(11).destroy();
    game.artifacts.get(12).destroy();
    game.artifacts.get(13).destroy();
    game.artifacts.get(14).destroy();

    return true;
  }

}; // end event handlers

/**
 * The illusionary army handling
 */
function armyDisappears() {
  let game = Game.getInstance();
  game.history.write("* * * P O O F * * *", "special2");
  game.history.write("The Illusionary Soldiers vanish!");
  game.monsters.get(6).room_id = null;
}

/**
 * Helper function. Determines if either the player or Esher is in possession of the Sword of Inari
 * @returns {boolean}
 */
function hasSword() {
  let game = Game.getInstance();
  let esher = game.monsters.get(1);
  let sword = game.artifacts.get(12);
  if (game.player.hasArtifact(12) || (game.player.hasArtifact(13) && sword.container_id === 13)) {
    return true;
  }
  if (esher.isHere() && esher.hasArtifact(12) || (esher.hasArtifact(13) && sword.container_id === 13)) {
    return true;
  }
  return false;
}

/**
 * Stuff that happens if your quest fails
 */
function failedQuest() {
  let game = Game.getInstance();
  game.effects.print(15);
  game.effects.print(24);
  for (let a of game.player.inventory) {
    a.destroy();
  }
  game.player.gold = 0;
}
