import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data = {
      'troll words': [
        "jolicks verploeg", "vanch cur fros", "wilk nedthix", "kentry drathran", "hulmfin radkryne"
      ],
      'active words': '',
      'holfane speaks': 0,
    };
    // choose one of the troll words at random for this adventure
    game.data['active words'] = game.data['troll words'][game.diceRoll(1, game.data['troll words'].length) - 1];

    for (let i of [6, 20, 21, 45, 47, 48, 49, 50, 51]) {
      game.artifacts.get(i).seen = true;
    }

    // initialize custom spells
    game.player.spell_counters['trezore'] = 0;
    game.player.spell_counters['qorgaw'] = 0;
  },

  "armorClass": function (monster: Monster) {
    let game = Game.getInstance();
    if (monster.id === Monster.PLAYER && monster.spell_counters['qorgaw'] > 0) {
      // qorgaw spell ac bonus
      monster.armor_class += 3;
    }
  },

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    let game = Game.getInstance();
    if (attacker.id === Monster.PLAYER && attacker.spell_counters['trezore'] > 0) {
      // trezore spell damage multiplier
      return damage * 4;
    }
    return true;
  },

  "endTurn2": function() {
    let game = Game.getInstance();
    if (game.monsters.get(1).isHere()) {
      if (game.data['holfane speaks'] === 0) {
        game.effects.print(14);
        game.data['holfane speaks'] = 1;
      } else if (game.data['holfane speaks'] === 2) {
        game.effects.print(12);
        game.data['holfane speaks'] = 3;
      }
    }
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();

    if (artifact.id === 24 && recipient.id > 2) {
      game.history.write(recipient.name + " appears to be afraid to take it, but does.");
    }

    if (recipient.id === 8) {
      // ulik
      // this is here instead of afterGive so we can show custom messages and also have access to the
      // player's weapon id before the give operation happens.
      if (artifact.id === 32) {
        game.effects.print(22);
        artifact.moveToInventory(8);
        recipient.destroy();
        return false;
      } else if (artifact.id === game.player.weapon_id) {
        game.effects.print(21);
        artifact.moveToInventory(8);
        recipient.destroy();
        return false;
      }
    }

    // grommick
    if (recipient.id === 2) {
      if (artifact.id === 13 || artifact.id === 14) {
        game.history.write('Grommick looks at your offering and shakes his head. "I\'ll need a greater reward than that."');
        return false;
      } else if (artifact.id === 23 && recipient.hasArtifact(25)) {
        game.history.write('Grommick shakes his head. "I already have a magic source."');
        return false;
      } else if (artifact.id === 25 && recipient.hasArtifact(23)) {
        game.history.write('Grommick shakes his head. "I already have a magic source."');
        return false;
      } else if ([15,16,17,23,24,25].indexOf(artifact.id) === -1) {
        game.history.write('Grommick shrugs and says, "I have no use for that."');
        return false;
      }
    }
    return true;
  },

  "afterGive": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();
    if (recipient.id === 1) {
      // king
      if (artifact.id === 24) {
        game.history.write(recipient.name + " thanks you.", "special");
      }
      if (artifact.id === 32 && !recipient.hasArtifact(33)) {
        game.effects.print(23);
      } else if (artifact.id === 33 && !recipient.hasArtifact(32)) {
        game.effects.print(24);
      } else if (recipient.hasArtifact(32) && recipient.hasArtifact(33)) {
        game.effects.print(9);
        game.history.write("The magic words are:");
        game.history.write(game.data['active words'], 'special');
        game.data['holfane speaks'] = 4;
      }
    } else if (recipient.id === 2) {
      // grommick
      if (!recipient.hasArtifact(15) && !recipient.hasArtifact(16) && !recipient.hasArtifact(17)) {
        game.history.write('Grommick smiles and says, "I\'ll need a sword blank."');
      } else if (!recipient.hasArtifact(23) && !recipient.hasArtifact(25)) {
        game.history.write('Grommick smiles and says, "I\'ll need a magic power source."');
      } else if (!recipient.hasArtifact(24)) {
        game.history.write('Grommick smiles and says, "I\'ll need a suitable reward."');
      } else {
        // make the sword
        game.effects.print(2);
        let sword = game.artifacts.get(37);
        if (recipient.hasArtifact(15)) {
          sword.sides = 10;
        } else if (recipient.hasArtifact(16)) {
          sword.sides = 8;
        } else if (recipient.hasArtifact(17)) {
          sword.sides = 6;
        }
        // magic powder is not as good as the amulet
        if (recipient.hasArtifact(23) && !recipient.hasArtifact(25)) {
          sword.weapon_odds -= 10;
        }
        game.delay(3);
        game.player.moveToRoom(63);

      }
    }

    // wangba
    else if (recipient.id === 6 && artifact.id === 38) {
      game.history.write('Wangba takes a swig from the grog. He smiles and says "Grog! My Favorite!"');
      recipient.reaction = Monster.RX_FRIEND;
    }

  },

  "giveGold": function(arg: string, gold_amount: number, recipient: Monster) {
    let game = Game.getInstance();
    if (recipient.id === 2) {
      // grommick
      game.history.write("Grommick isn't interested in your gold.");
    }
    return true;
  },

  "look": function(arg: string) {
    let game = Game.getInstance();
    let artifact = game.artifacts.getLocalByName(arg, false);
    if (artifact) {
      switch (artifact.id) {
        case 27:
          // coal
          if (game.artifacts.get(24).room_id === 0) {
            game.history.write("You found something!", "success");
            game.artifacts.get(24).moveToRoom();
          }
          break;
        case 31:
          // dead adventurer
          if (game.artifacts.get(32).room_id === 0) {
            game.artifacts.get(32).moveToRoom();
          }
          if (game.artifacts.get(33).room_id === 0) {
            game.artifacts.get(33).moveToRoom();
          }
          break;
      }
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    // king
    let king = game.monsters.get(1);
    if (king.room_id === exit.room_to && game.data['holfane speaks'] === 1) {
      game.data['holfane speaks'] = 2;
    }
    // see also the check in line 615 of the EDX code - if king is in room you last left?
    if (room.id === 8 && exit.room_to !== 7 && king.isHere() && game.data['holfane speaks'] !== 4) {
      game.history.write(king.name + " won't let you pass!");
      return false;
    }

    // ulik
    if (room.id === 53 && exit.room_to === 54 && game.monsters.get(8).isHere()) {
      game.history.write("Ulik won't let you pass!");
      return false;
    }

    return true;
  },

  "say": function(phrase) {
    let game = Game.getInstance();
    phrase = phrase.toLowerCase();
    switch (phrase) {
      case 'trezore':
        if (game.player.spell_counters['trezore'] === 0) {
          game.history.write('Your strength in combat suddenly increases by fourfold!', 'special');
          game.player.spell_counters['trezore'] = game.diceRoll(1, 12) + 5;
        } else {
          game.effects.print(18);
        }
        break;
      case 'qorgaw':
        if (game.player.spell_counters['qorgaw'] === 0) {
          game.effects.print(17);
          game.player.spell_counters['qorgaw'] = game.diceRoll(1, 12) + 5;
          game.player.updateInventory();
        } else {
          game.effects.print(18);
        }
        break;
      case game.data['active words']:
        if (game.player.room_id === 24 && game.artifacts.get(46).isHere()) {
          game.effects.print(19);
          game.artifacts.get(46).is_open = true;
        } else {
          game.effects.print(20);
        }
        break;
      case 'info':
        game.history.write("The magic words the king told you are: " + game.data['active words']);
        break;
    }
  },

  'spellExpires': function(spell_name) {
    let game = Game.getInstance();
    if (spell_name === 'trezore') {
      game.history.write('The Trezore spell expires!');
    }
    if (spell_name === 'qorgaw') {
      game.history.write('The protection spell expires!');
      game.player.updateInventory();
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
