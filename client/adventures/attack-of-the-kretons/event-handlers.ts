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
    game.data['sage'] = 0;  // d%(1)
    game.data['prince unconscious'] = false;  // d%(2)
    game.data['prince saw groo'] = false;  // d%(2)
    game.data['eagles'] = false;  // d%(3)
    game.data['hot room'] = 0;  // d%(4)
    game.data['read codex'] = false;  // d%(5)
    // d%(6) through d%(10) were replaced by effect "seen" flags
    game.data['orb'] = false;  // d$(12)
    game.data['brandy'] = false;

    // monster random actions
    game.monsters.get(1).data['actions'] = ['growls viciously.', 'cracks a walnut on his head.',
      'spits in a beer and swears.', 'chases some barbarians out.', 'opens a bottle with his teeth.'];
    game.monsters.get(3).data['battle taunts'] = ['A fray!', 'Now Groo does what Groo does best!',
      'Fear me! I am Groo, the guy you should fear!', 'Die, mendicant!'];

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

    // custom people's names and stuff
    game.lwm_name = 'Lord Daniel Spitz';
    game.ss_name = 'Fast Charlie Benante';
    game.money_name = 'kopin';

  },

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    // some monsters never take damage
    return (defender.id === 29 || defender.id === 40) ? 0 : true;
  },

  "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
    let game = Game.getInstance();
    // mr. r
    if (defender.id === 40 && attacker.id === Monster.PLAYER) {
      game.history.write('Mr. Roessler shrugs off your attack and laughs.');
    }
    return true;
  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // to battle!
    if (target.id === 16) {
      game.effects.print(106);
      return false;
    }
    if (target.reaction !== Monster.RX_HOSTILE) {
      game.history.write("That wouldn't be very nice!");
      return false;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    if (target.reaction !== Monster.RX_HOSTILE) {
      game.history.write("That wouldn't be very nice!");
      return false;
    }
    return true;
  },

  "beforeGet": function (arg, artifact) {
    let game = Game.getInstance();
    if (artifact && artifact.id === 45 && !game.data['orb']) {
      game.history.write("Sorry, it's not yours.");
      return false;
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    if (exit.room_to === 51 || room.id === 51) {
      game.history.write("You feel as if you are tumbling through space and time...");
    }

    switch (exit.room_to) {
      case -555:
        // leaving the city
        game.effects.print(25);
        game.player.moveToRoom(10);
        return false;
      case -627:
        // getting back into the city
        if (game.monsters.get(12).room_id !== 9) {
          game.history.write("The soldiers aren't there to let you in.");
        } else if (game.data['sage'] === 0 && game.monsters.get(21).isHere()) {
          // returning with sage
          game.data['sage'] = 1;
          game.effects.printSequence([28,40,41]);
          game.artifacts.get(29).moveToRoom(2);  // fish key
          // TODO: if you already have the brandy, you shouldn't get thrown out
          game.history.write("They throw you out the door and tell you that the rum shop is to the east.");
          game.monsters.get(21).reaction = Monster.RX_NEUTRAL;
          game.player.moveToRoom(2, false);  // npcs don't follow
        } else {
          // soldiers let you in
          game.effects.print(28);
          game.player.moveToRoom(9);
        }
        return false;
      case -747:
        game.history.write("There is nothing for you there.");
        return false;
      case 46:
        if (!game.data['eagles']) {
          game.effects.print(56);
          return false;
        }
    }
    return true;
  },

  "death": function(monster: Monster) {
    let game = Game.getInstance();
    if (monster.id === 3) {
      game.effects.print(108);
      monster.heal(monster.hardiness);
      return false;
    }
    return true;
  },

  "afterDeath": function(monster: Monster) {
    let game = Game.getInstance();
    switch (monster.id) {
      case 2:
        game.artifacts.get(8).moveToRoom();
        break;
      case 25:
        game.artifacts.get(35).moveToRoom();  // grateful dead
        break;
      case 31:
        game.monsters.get(32).moveToRoom();
        game.skip_battle_actions = true;
        break;
      case 32:
        game.monsters.get(33).moveToRoom();
        game.skip_battle_actions = true;
        break;
      case 33:
        game.effects.printSequence([59,60,61]);
        game.player.moveToRoom(46);
        game.artifacts.get(49).moveToInventory();
        game.player.updateInventory();
        break;
    }
  },

  "eat": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (game.player.room_id === 51 && (arg === "cheesedip" || arg === "cheese" || arg === "dip")) {
      game.history.write("That's some psychedelic cheesedip. Your vision goes all swimmy for a few minutes.");
      return false;
    }
    if (artifact) {
      if (artifact.id === 3) {
        game.history.write("You're already sick of the stuff.");
        return false;
      }
      if (artifact.id === 65) {
        game.history.write("No way.");
        return false;
      }
    }
  },

  "endTurn": function() {
    let game = Game.getInstance();
    if (game.player.room_id === 57) {
      if (game.data['hot room'] > 2) {
        game.effects.print(83, 'danger');
        game.die();
      } else if (game.data['hot room'] > 0) {
        game.data['hot room']++;
      }
    }
  },

  "endTurn1": function() {
    let game = Game.getInstance();

    // if you found Groo before talking to the minstrel
    if (game.monsters.get(2).isHere() && game.monsters.get(3).isHere()) {
      game.monsters.get(2).destroy();
      game.artifacts.get(8).moveToRoom();
      game.effects.print(95);
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();
    let room_id = game.player.room_id;

    if (game.player.room_id === 57 && game.data['hot room'] > 0) {
      game.history.write("The flames rise higher! Hurry up, or you're toast!", "warning");
    }

    // sage gets cranky if you come back without rum
    if (room_id === 3 && game.data['sage'] === 1 && !game.player.hasArtifact(28)) {
      game.effects.print(70);
    }

    // groo's reactions to things
    let groo = game.monsters.get(3);
    if (groo.isHere()) {
      // thrown out of court
      if (room_id === 5
        && !game.data['prince unconscious']
        && !game.data['prince saw groo']
        && !game.data['read codex']) {
        game.data['prince unconscious'] = true;
        game.data['prince saw groo'] = true;
        game.effects.printSequence([16,17]);
        game.history.write("Groo is thrown outside by the guards.");
        groo.moveToRoom(4);
      }
      // statue
      if (game.artifacts.get(57).isHere() && !game.effects.get(74).seen) {
        game.effects.printSequence([74, 75]);
      }
      // kretons
      if (game.monsters.get(14).isHere() && !game.effects.get(27).seen) {
        game.effects.print(27);
      }
      // path
      if (room_id === 30 && !game.effects.get(49).seen) {
        game.effects.print(49);
      }
      // pillagers
      if (game.monsters.get(23).isHere() && !game.effects.get(49).seen) {
        game.effects.print(49);
      }
    }

    // first time in torture room
    if (room_id === 25 && !game.effects.get(36).seen) {
      game.effects.printSequence([36,37]);
    }

    // chichester's reactions to things
    let chi = game.monsters.get(16);
    let zombies = game.monsters.get(36);
    let chakaal = game.monsters.get(34);
    if (chi.isHere()) {
      // zombie horde
      if (zombies.isHere()) {
        game.effects.printSequence([80, 81]);
        zombies.destroy();
      }
      if (chakaal.isHere()) {
        console.log('chakaal leaves');
        game.effects.printSequence([72, 73]);
        game.history.write(`${chakaal.name} mopes away.`);
        chakaal.destroy();
      }
      if (!game.in_battle && game.diceRoll(1,5) === 1) {
        game.history.write(`${chi.name} blows a smoke ring.`);
      }
    }

    // zombies (without chichester)
    if (zombies.isHere()) {
      game.effects.printSequence([78, 79]);
      zombies.destroy();
    }

    // monster actions and taunts
    game.monsters.visible.forEach(m => {
      if (m.data['actions'] && game.diceRoll(1,2) === 2) {
        let action = game.getRandomElement(m.data['actions']);
        game.history.write(`${m.name} ${action}`);
      }
      if (game.in_battle && m.data['battle taunts']
        && game.player.room_id !== 59 && game.diceRoll(1,2) === 2) {
        let taunt = game.getRandomElement(m.data['battle taunts']);
        game.history.write(`${m.name} shouts with bloodlust, "${taunt}"`);
      }
    });

    // conan's remarks
    if (game.monsters.get(33).isHere() && !game.effects.get(65).seen) {
      game.effects.print(65);
    }

    if (room_id === 51) {
      game.history.write("You think you hear Frank Zappa far in the distance.");
    }

    if (room_id === 57 && game.data['hot room'] === 0) {
      game.history.write("The doors slam shut!", "emphasis");
      game.effects.print(71, "warning");
      game.data['hot room'] = 1;
    }

    // cheesedip god
    let cg = game.monsters.get(39);
    if (cg.isHere()) {
      game.effects.print(85);
      if (groo.isHere()) {
        game.history.write("But Groo has no brain!");
        game.effects.print(86);
        cg.destroy();
        game.history.pause();
        game.monsters.get(40).moveToRoom();
        game.monsters.get(40).showDescription();
        game.monsters.get(40).seen = true;
        [65,66].forEach(id => {
          game.artifacts.get(id).moveToRoom();
          game.artifacts.get(id).showDescription();
          game.artifacts.get(id).seen = true;
        });
        game.monsters.updateVisible();
        game.artifacts.updateVisible();
      } else {
        game.effects.print(107);
        game.die();
      }
    }

    // dog's name
    if (game.monsters.get(18).isHere()) {
      game.monsters.visible.filter(m => m.special && m.special.indexOf('dog') !== -1 && !m.data['dog'])
        .forEach(m => {
          if (m.id === 6 && game.data['prince unconscious']) return;
          game.history.write(`${m.name} asks what the dog's name is.`);
          m.data['dog'] = true;
      });
    }

    if (room_id === 3 && game.monsters.get(21).isHere() && game.player.hasArtifact(28)) {
      game.history.write("The Sage begs for the brandy.");
    }

  },

  "flee": function(arg: string, exit: RoomExit) {
    let game = Game.getInstance();
    if (game.monsters.get(14).isHere()) { // kretons taunt
      if (exit.room_to === -627) {
        // getting back into the city
        if (game.monsters.get(12).room_id !== 9) {
          game.history.write("The soldiers aren't there to let you in.");
        } else if (game.data['sage'] === 0 && game.monsters.get(21).isHere()) {
          // returning with sage
          game.data['sage'] = 1;
          game.player.moveToRoom(3);  // moves player and NPCs
          game.effects.printSequence([28, 40, 41]);
          game.artifacts.get(29).moveToRoom(2);  // fish key
          // TODO: if you already have the brandy, you shouldn't get thrown out
          game.history.write("They throw you out the door and tell you that the rum shop is to the east.");
          game.monsters.get(21).reaction = Monster.RX_NEUTRAL;
          game.player.moveToRoom(2, false);  // moves only the player outside; NPCs stay
        } else {
          // soldiers let you in
          game.effects.print(28);
          game.player.moveToRoom(9);
        }
        return false;
      } else {
        game.effects.print(29);
      }
    }
    if (game.monsters.get(29).isHere()) { // max
      if (arg === 'e' || arg === 'east') {
        game.history.write("Manly Max won't let you go that way!");
      } else {
        game.player.moveToRoom(13);  // always flee west
        game.skip_battle_actions = true;
      }
      return false;
    }
    return true;
  },

  "beforeFree": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact && artifact.id === 68) {  // old man
      game.history.write("You have freed the old man.");
      game.effects.print(88);
      artifact.destroy();  // have to do this manually due to returning false below
      game.artifacts.get(69).moveToRoom();
      return false;  // this is not a real bound monster, just an effect.
    }
    return true;
  },

  "afterFree": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    if (monster) {
      if (monster.id === 18) {  // dog
        game.effects.print(68);
        if (game.monsters.get(21).isHere()) {
          game.effects.print(111);
          if (game.monsters.get(3).isHere()) {
            game.effects.print(69);
          }
        }
      } else if (monster.id === 21) {  // sage
        game.monsters.get(34).moveToRoom(13); // chakaal
      }
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

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();
    // sage / brandy
    if (recipient.id === 21 && artifact.id === 28) {  // sage / brandy
      if (game.player.room_id !== 3) {
        game.history.write(`The Sage says, "Wait 'til we're back in my house."`);
        return false;
      }
      game.effects.printSequence([42, 44, 45, 46]);
      game.data['sage'] = 2;
      recipient.reaction = Monster.RX_FRIEND;
      game.history.suppressNextMessage = true;  // don't print the standard "monster takes item" message
    } else if (recipient.id === 6 && game.data['prince unconscious']) {
      game.history.write('The Prince is unconscious.');
      return false;
    } else if (recipient.id === 6 && artifact.id === 49) {  // crystal to prince
      game.effects.print(63);
      game.data['orb'] = true;
      game.history.suppressNextMessage = true;  // don't print the standard "monster takes item" message
    } else if (recipient.id === 18) {  // dog
      game.history.write("Good luck getting a dog to carry that.");
      return false;
    }
    return true;
  },

  "giveGold": function(arg: string, gold_amount: number, recipient: Monster) {
    let game = Game.getInstance();
    // this adventure doesn't let you hire NPCs as mercenaries
    if (gold_amount >= 5000) {
      game.history.write("Don't go flashing that kind of money around here!");
      return false;
    }
    // buy brandy from stan
    if (recipient.id === 8) {
      if (game.data['brandy']) {
        game.history.write('"I already sold you one."');
      } else if (gold_amount < 75) {
        game.history.write('"That ain\'t enough!" growls Stan.');
      } else {
        game.history.write("Stan rolls out a keg of brandy.");
        game.data['brandy'] = true;
        game.artifacts.get(28).moveToRoom();
        recipient.updateInventory();
        if (gold_amount > 75) {
          game.history.write("Stan hands you your change.");
          game.player.gold += gold_amount - 75;
        }
      }
      return false; // bypass normal "give money" logic
    }
    return true;
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 9) {  // city gate
        game.history.write("Don't be dumb.");
        return false;
      } else if (artifact.id === 34) {  // slab
        game.history.write("How?");
        return false;
      }
    }
    return true;
  },

  "afterRead": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 37) {  // codex
        game.data['codex'] = true;
        game.data['prince unconscious'] = false;
      } else if (artifact.id === 6) {  // catalog
        if (game.monsters.get(21).isHere()) {
          game.effects.print(14);
          artifact.moveToInventory(21);
          game.monsters.get(21).updateInventory();
        } else {
          game.effects.print(15);
        }
      }
    }
  },

  "say": function(phrase) {
    let game = Game.getInstance();
    phrase = phrase.toLowerCase();
    let room_id = game.player.room_id;
    if (phrase === 'the password' && room_id === 45) {
      game.history.write('The eagles say, "OK, go on in."');
      game.data['eagles'] = true;
    } else if (phrase === 'dhoud' && room_id === 35) {
      game.effects.print(109, 'special');
      game.artifacts.get(34).open();
    } else if (phrase === 'imtu khoul' && game.artifacts.get(45).isHere()) {
      game.effects.print(64, 'special2');
      game.player.moveToRoom(48);
    } else if (phrase === 'cawteenahmosh' && room_id === 55) {
      game.history.write("You again feel nausea as you return to your home dimension.", "special2");
      game.exit();
    } else if (game.monsters.get(16).isHere()) {
      game.history.write('"What a profound statement," Chichester mutters.');
    }
    // Note: the EDX version allows you to say "not" and some key artifacts/monsters get moved to the plane
    // of stench. (as a workaround in case you get stuck)
  },

  "beforeRequest": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    if (!monster || !artifact) return true;
    // Some effects can happen even if the monster doesn't have the artifact.
    // So, we check for whether the monster actually has the artifact below.

    if (monster.id === 4) {  // cheesy woman
      game.effects.print(67);
      return false;
    } else if (monster.id === 6 && game.data['prince unconscious']) {
      game.history.write("He's unconscious.");
      return false;
    } else if (monster.id === 6 && artifact.id === 45) {  // prince / orb
      if (artifact.room_id !== 5) {
        return true;  // already got it
      } else if (!game.data['read codex']) {
        game.history.write("The Prince says you can't have it if you don't have a reason.");
      } else {
        game.effects.print(55);
      }
      return false;
    } else if (monster.id === 8) {  // stan
      if (artifact.id === 28) {
        if (monster.hasArtifact(artifact.id)) {
          game.history.write(`"I'll sell it to you for 75 kopins," says Stan.`);
          return false;
        } else {
          game.history.write('"Sorry, all out of that," says Stan.');
          return false;
        }
      }
    } else if (monster.id === 11) {  // kurk
      game.effects.print(21);
      return false;
    } else if (monster.id === 16 && artifact.id === 51
        || monster.id === 21 && artifact.id === 6
        && monster.hasArtifact(artifact.id)) {
      // chichester / sage
      game.history.write(`${monster.name} tells you to bite something.`);
      return false;
    } else if (monster.id === 30 && artifact.id === 49) {  // wizard
      game.effects.print(58);
      game.skip_battle_actions = true;
      game.player.moveToRoom(47);
      return false;
    }
    return true;
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact.isHere()) {
      switch (artifact.id) {
        case 26:  // wand of frost
          if (game.player.room_id === 57 && game.data['hot room'] > 0) {
            game.data['hot room'] = -1;
            game.effects.print(84);
            // make doors easier to smash, for convenience
            game.artifacts.get(63).hardiness = 5;
            game.artifacts.get(64).hardiness = 5;
          } else {
            game.history.write("It gets very cold and snow covers the area, however it quickly passes.", 'special');
          }
          break;
        case 43:  // wand of castratia
          if (game.monsters.get(29).isHere()) {
            game.effects.print(110);
            game.monsters.get(29).destroy();
            game.artifacts.get(46).moveToRoom();
            game.artifacts.get(47).moveToRoom();
            game.rooms.get(43).getExit('e').room_to = 44;
          } else {
            game.history.write("The wand glows, but nothing seems to happen.", 'special');
          }
          break;
        case 66:  // electronics equipment
          game.effects.print(112);
          break;
        case 70:  // amulet of ian
          if (game.monsters.get(40).isHere()) {
            game.effects.print(91, "special2");
            if (game.monsters.get(21).isHere()) {
              game.effects.printSequence([91, 92, 93]);
              game.monsters.get(40).destroy();
              game.artifacts.get(67).moveToRoom();
              game.monsters.get(18).name = 'Mulch';
            } else {
              game.monsters.get(40).injure(10000);
            }
          } else {
            game.effects.print(90);
          }
          break;
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 40) {
      game.history.write("Blobs of cheesedip rain from above. They make a big mess but don't do any damage.");
    } else if (roll <= 80) {
      // teleport to random room
      game.history.write("You are being teleported...");
      // valid destinations are 1-23 (except 3) and 27-35
      let room_id = game.diceRoll(1, 32);
      // don't let this choose the sage's house (3)
      while (room_id === 3) {
        room_id = game.diceRoll(1, 32);
      }
      if (room_id >= 24) room_id += 3;
      game.player.moveToRoom(room_id);
      game.skip_battle_actions = true;
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
      game.monsters.visible
        .filter(m => m.reaction === Monster.RX_FRIEND)
        .forEach(m => m.heal(100));
    }
  },

  "exit": function() {
    let game = Game.getInstance();
    // you can exit without killing c.g. but you don't get a prize
    if (game.monsters.get(39).room_id === null
      && game.monsters.get(40).room_id === null) {
      game.effects.printSequence([96, 97, 98, 99, 100]);
      game.history.pause();
      game.effects.printSequence([101, 102, 103, 104, 105]);
      game.player.gold += 5000;
    }
    return true;
  }

}; // end event handlers
