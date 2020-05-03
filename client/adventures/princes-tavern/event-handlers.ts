import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ModalQuestion} from "../../core/models/modal";

declare var game: Game;

// some data - export so we can use it in tests
export var drinks = [
  {"name": "seven-7", "price": 2, "strength": 4},
  {"name": "martini", "price": 3, "strength": 5},
  {"name": "beer", "price": 1, "strength": 3},
  {"name": "vodka sour", "price": 2, "strength": 5},
  {"name": "gin and tonic", "price": 2, "strength": 4},
  {"name": "margarita", "price": 4, "strength": 6},
  {"name": "wine", "price": 2, "strength": 3},
  {"name": "old fashioned", "price": 3, "strength": 4},
  {"name": "screwdriver", "price": 2, "strength": 5},
  {"name": "rum", "price": 1, "strength": 4},
  {"name": "long island iced tea", "price": 5, "strength": 7},
  {"name": "suicide", "price": 6, "strength": 9},
];

export var drunk_messages = [
  {"text" : "You're getting a little buzzed.", "style": "normal"},
  {"text" : "Boy, are you drunk!", "style": "emphasis"},
  {"text" : "You are very dizzy. You don't feel well.", "style": "warning"},
  {"text" : "You feel very numb and are staggering badly.", "style": "warning"},
  {"text" : "You feel extremely numb, dizzy, and sick.", "style": "warning"},
  {"text" : "You seem to be sobering up a little.", "style": "normal"}
];

export var event_handlers = {

  "start": function() {
    // add your custom game start code here
    game.data['combo'] = [
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8)),
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8)),
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8)),
      (32 + game.diceRoll(1, 10)) + '-' + (20 + game.diceRoll(1, 8)) + '-' + (30 + game.diceRoll(1, 8))
    ];
    game.data['drinking contest active'] = null;
    game.data['drinkers'] = [ 19, 20, 21, 22, 23, 24 ];
    game.data['drinker reaction'] = 0;
    game.data['drinker prev reaction'] = 0;
    game.data['locate active'] = false;
    game.data["protection spell text"] = false;
    game.data["bar tab"] = 0;
    game.data["bartender patience"] = 0;
    game.data["drinks"] = 0;
    game.data["how drunk"] = 0;
    game.data["sober counter"] = 0;
    game.data["original ag"] = game.player.agility;
    game.data['barrel air'] = 4;

    // drinkers
    game.monsters.get(19).data['tolerance'] = 42;
    game.monsters.get(19).data['drinks'] = 0;
    game.monsters.get(20).data['tolerance'] = 33;
    game.monsters.get(20).data['drinks'] = 0;
    game.monsters.get(21).data['tolerance'] = 33;
    game.monsters.get(21).data['drinks'] = 0;
    game.monsters.get(22).data['tolerance'] = 30;
    game.monsters.get(22).data['drinks'] = 0;
    game.monsters.get(23).data['tolerance'] = 27;
    game.monsters.get(23).data['drinks'] = 0;
    game.monsters.get(24).data['tolerance'] = 18;
    game.monsters.get(24).data['drinks'] = 0;

    // custom attack messages
    game.monsters.get(16).combat_verbs = ["bites at", "leaps at"];
    game.monsters.get(11).combat_verbs = ["stomps on", "charges at", "gores"];
    game.monsters.get(17).combat_verbs = ["bites at", "slithers at", "spits acid at"];

  },

  "endTurn": function() {
    let sobering = false;

    game.data['sober counter']--;
    if (game.data['sober counter'] === 0 && game.data['drinks'] > 0) {
      update_status(6);
    }
    if (game.data['sober counter'] <= 0 && game.data['drinks'] > 0) {
      game.data['drinks'] -= 0.1;
      sobering = true;
    }

    // drunk yet?
    if (game.data['drinks'] > game.player.hardiness) {
      game.player.agility = Math.round(game.data['original ag'] - (game.data['drinks'] - game.player.hardiness));
      if (!sobering) {
        let condition = game.player.agility / game.data['original ag'];
        if (condition <= 0) {
          game.history.write("You passed out!", "danger");
          if (game.player.room_id === 22) {
            // scatter player's artifacts
            game.data['drinks'] = 0;
            game.data['drinking contest active'] = 0;
            game.player.agility = game.data['original ag'];
            game.history.write("You wake up several hours later. All your possessions are gone! They must have been stolen while you were passed out.", "emphasis");
            for (let i of game.player.inventory) {
              let dest = game.rooms.getRandom([1, 9, 12, 16, 18, 50, 53, 54, 57, 61]);
              i.moveToRoom(dest.id);
            }
            game.player.updateInventory();
          }
        } else if (condition < .25) {
          update_status(5);
        } else if (condition < .50) {
          update_status(4);
        } else if (condition < .75) {
          update_status(3);
        } else if (condition < .99) {
          update_status(2);
        }
      }
    } else if (game.data['drinks'] > game.player.hardiness / 3) {
      if (!sobering) {
        update_status(1);
      }
    }

    if (game.player.room_id === 9) {
      game.data['barrel air']--;
      if (game.data['barrel air'] <= 0) {
        game.effects.print(35);
        game.die(false);
      } else if (game.data['barrel air'] <= 1) {
        game.history.write("You are almost out of air!", "warning");
      }
    }

    // magic recharges faster here - this is in addition to the built-in recharge in the game object.
    game.player.rechargeSpellAbilities(2);
  },

  "endTurn2": function() {
    if (game.player.room_id === 42 && game.monsters.get(31).isHere() && !game.data["protection spell text"]) {
      game.effects.print(3);
      game.data["protection spell text"] = true;
    }

  },

  "attackMonster": function(arg: string, target: Monster) {
    // gerschter bar
    if (game.player.room_id === 7) {
      game.effects.print(9);
      game.player.moveToRoom(63);
      target.moveToRoom(63);
      return false;
    }
    // brawlers
    if (target.id === 25) {
      game.history.write("You don't want to wade into that fray. Better find a different way to get their attention.");
      return false;
    }
    // drinking contest
    if (game.player.room_id === 22 && game.data['drinking contest active']) {
      game.effects.print(4);
      return false;
    }

    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    if (room.id === 22 && game.data['drinking contest active']) {
      game.history.write("The men in the room won't let you leave.");
      return false;
    }

    if (exit.room_to === -5) {
      game.effects.print(5, "danger");
      game.effects.print(6, "danger");
      game.die();
      return false;
    } else if (exit.room_to === -999) {
      if (room.id === 2) {
        // main exit
        if (game.player.hasArtifact(25)) {
          game.effects.print(41);
        } else if (game.artifacts.get(25).room_id === null && game.artifacts.get(25).monster_id === null) {
          // you drank the scotch
          game.effects.print(40, "danger");
          game.die();
          return false;
        } else {
          game.effects.print(39);
          return false;
        }
      }
      game.player.agility = game.data['original ag']; // sober up
    } else if (room.id === 36 && game.data["bar tab"] > 0) {
      if (game.data['bartender patience']) {
        game.history.write("The bartender is asking you politely to pay up or incur bodily damage from the bouncer.");
        game.data['bartender patience']--;
      } else {
        game.history.write("The bartender has run out of patience. She summons the bouncer!");
        game.monsters.get(13).reaction = Monster.RX_HOSTILE;
        game.monsters.get(14).reaction = Monster.RX_HOSTILE;
      }
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    // loose boards
    if (artifact && artifact.id === 35) {
      game.player.moveToRoom(16);
    }
    return true;
  },

  "endTurn1": function() {
    // drinking contest
    if (game.player.room_id === 22 && game.data['drinking contest active'] === null) {
      game.data["drinking contest active"] = true;
      game.effects.print(1);
    }
  },

  "beforeSpell": function(spell_name: string) {
    // gerschter bar
    if (game.player.room_id === 7) {
      game.effects.print(10);
      return false;
    }
    return true;
  },

  "drink": function(arg: string, artifact: Artifact) {
    // drinking contest
    if (game.player.room_id === 22) {
      if (game.data['drinking contest active']) {

        let q1 = new ModalQuestion;
        q1.type = 'multiple_choice';
        q1.question = "The bartender hands you a drink menu. What do you order?";
        q1.choices = drinks.map(d => {
          return d.name;
        });
        q1.callback = function (answer) {
          game.modal.questions[1].question = game.modal.questions[1].question.replace('{drink}', answer);
          return true;
        };

        let q2 = new ModalQuestion();
        q2.type = 'multiple_choice';
        q2.question = "The bartender pours you a {drink}. Do you sip it, drink it, or guzzle it?";
        q2.choices = ['sip', 'drink', 'guzzle'];
        q2.callback = function (answer) {
          game.history.write("You " + answer + " the " + game.modal.questions[0].answer + ".");
          // @ts-ignore
          let drink = drinks.find(x => x.name === game.modal.questions[0].answer);
          let str = answer === 'sip' ? 0.5 : (answer === 'drink' ? 1 : 1.5);
          game.data['drinks'] += drink.strength + str;
          game.data['sober counter'] = 10;

          if (answer !== 'guzzle') {
            game.data['drinker reaction']++;
          }

          let m: Monster;
          if (game.data['drinker reaction'] > 2) {
            game.history.write("The men attack!", "warning");
            for (let monster_id of game.data['drinkers']) {
              m = game.monsters.get(monster_id);
              m.moveToRoom();
              m.agility = Math.floor(m.agility * (1 - m.data['drinks'] / m.data['tolerance']));
            }
            game.data['drinking contest active'] = false;
            return false;
          }

          // men buy drinks ahd guzzle
          let d: any;
          let passed_out = [];
          for (let monster_id of game.data['drinkers']) {
            m = game.monsters.get(monster_id);
            d = drinks[game.diceRoll(1, drinks.length) - 1];
            game.history.write(m.name + " buys a " + d.name + " and guzzles it!.");
            m.data['drinks'] += d.strength * 1.5;
            if (m.data['drinks'] > m.data['tolerance']) {
              game.history.write(m.name + " passes out!", "emphasis");
              game.artifacts.get(game.dead_body_id + m.id - 1).moveToRoom();
              passed_out.push(monster_id);
            }
          }

          // now remove anyone who passed out from the drinkers list
          // (do this outside the previous loop to prevent splice() from screwing with the loop)
          for (let monster_id of passed_out) {
            game.data['drinkers'].splice(game.data['drinkers'].indexOf(monster_id), 1);
          }

          if (game.data['drinkers'].length === 0) {
            game.history.write("The drinking contest is over. You notice a stack of gold on the table.", "success");
            game.data['drinking contest active'] = false;
            game.artifacts.get(31).moveToRoom();
            return true;  // prevents the reaction below if the last man passed out
          }

          if (game.data['drinker reaction'] !== game.data['drinker prev reaction']) {
            if (game.data['drinker reaction'] === 1) {
              game.history.write("The men are unimpressed. You had better drink faster if you want them to refrain from carving you up!");
            } else if (game.data['drinker reaction'] === 2) {
              game.history.write("The men have had enough of your stalling. They point their weapons at you and shout, 'Drink up!'", "emphasis");
            }
            game.data['drinker prev reaction'] = game.data['drinker reaction'];
          }

          return true;
        };
        game.modal.questions = [q1, q2];
        game.modal.run();
      } else {
        game.history.write("The bartender says you've had enough.");
      }
      return false;
    }

    // bartender training room
    else if (game.player.room_id === 36) {
      if (game.data['bar tab'] === 0) {
        let roll = game.diceRoll(1, drinks.length);
        let drink = drinks[roll - 1];
        game.history.write("The bartender pours you a " + drink.name + ". You drink it and she asks for " + drink.price + " GP.");
        game.data['bar tab'] += drink.price;
        game.data['bartender patience'] = 2;
        game.data['drinks'] += drink.strength;
        game.data['sober counter'] = 10;
      } else if (game.data['bartender patience']) {
        game.history.write("The bartender asks you to pay up before she will pour you another.");
        game.data['bartender patience']--;
      } else {
        game.history.write("The bartender has run out of patience. She summons the bouncer!");
        game.monsters.get(13).reaction = Monster.RX_HOSTILE;
        game.monsters.get(14).reaction = Monster.RX_HOSTILE;
      }
      return false;

    // wine barrel
    } else if (game.player.room_id === 9) {
      game.effects.print(19);
      game.player.moveToRoom(12);
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    if (recipient.id === 6 && artifact.id === 8) {
      // lamp to piano player
      game.effects.print(37);
    } else if (recipient.id === 32 && artifact.id === 13) {
      // amulet to hokas
      game.effects.print(13);
      game.effects.print(14);
      game.data['locate active'] = true;
      recipient.room_id = null;
    } else if (recipient.id === 12 && artifact.id === 22) {
      // slipper to prince
      game.effects.print(38);
      game.artifacts.get(28).moveToRoom();
    }
    return true;
  },

  "light": function(arg: string, artifact: Artifact) {
    if (artifact !== null) {
      if (artifact.id === 15) {
        if (game.artifacts.get(1).isHere()) {
          game.history.write("You have been teleported!");
          game.artifacts.get(1).destroy();
          let dest = game.rooms.getRandom([1, 12, 16, 54, 61]);
          game.player.moveToRoom(dest.id);
        } else {
          game.history.write("Try looking for something to light it with.");
        }
        return false;
      }
    }
    return true;
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    if (artifact !== null) {
      if (artifact.id === 69) {
        // vault door
        game.modal.show("Enter combination (use dashes):", function(value) {
          if (value === game.data['combo'][3]) {
            game.history.write("The vault door opened!", "success");
            artifact.is_open = true;
          } else {
            game.history.write("The vault door did not open.");
          }
        });
        return false;
      } else if (artifact.id === 72) {
        game.history.write("You don't see any physical way to open it.");
        return false;
      }
    }
    return true;
  },

  "beforeRead": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.name === 'graffiti') {
      // this artifact's markings contain dynamic text, so effects won't work
      game.history.write("You see some names and measurements:");
      game.history.write("Deede Berry - " + game.data['combo'][0]);
      game.history.write("Fifi LaFrentz - " + game.data['combo'][1]);
      game.history.write("V. Ault - " + game.data['combo'][2]);
      game.history.write("Jamie Zena - " + game.data['combo'][3]);
      return false;
    }
    return true;
  },

  "say": function(phrase: string) {
    phrase = phrase.toLowerCase();
    if ((phrase === 'gronk' || phrase === 'grunt') && game.monsters.get(6).isHere()) {
      game.effects.print(43);
    }
    if (phrase === 'evantke' && game.artifacts.get(72).isHere()) {
      game.effects.print(26, "special");
      game.artifacts.get(72).is_open = true;
    }
  },

  "seeRoom": function() {
    // brawl effect shown after room, so it appears before monster desc
    if (game.rooms.current_room.id === 40 && game.monsters.get(25).isHere()) {
      game.effects.print(11);
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    switch (artifact.name) {
      case 'peanuts':
        game.effects.print(2);
        game.player.moveToRoom(36, true);
        game.delay();
        break;
      case 'case of rum':
      case 'case of brandy':
      case 'case of vodka':
        game.history.write("What a lush!");
        if (game.monsters.get(11).room_id === null) {
          game.effects.print(27);
          game.monsters.get(11).moveToRoom();
        }
        break;
      case '600 year old scotch':
        game.history.write("That was probably the most expensive drink you've ever had!");
        artifact.destroy();
        game.artifacts.get(26).moveToRoom();
        break;
      case 'strange brew':
        let roll = game.diceRoll(1, 5);
        switch (roll) {
          case 1:
            game.effects.print(28);
            game.player.charisma -= 3;
            break;
          case 2:
            game.effects.print(29);
            game.player.charisma += 3;
            break;
          case 3:
            game.effects.print(30);
            game.player.agility = Math.max(game.player.agility - 3, 1);
            game.data['original ag'] -= 3;
            break;
          case 4:
            game.effects.print(31);
            for (let wa in game.player.weapon_abilities) {
              game.player.weapon_abilities[wa] += 7;
            }
            break;
          case 5:
            game.effects.print(32);
            game.player.armor_expertise += 10;
            break;
        }
        break;
      case "matchbook":
        if (game.artifacts.get(15).isHere()) {
          game.command_parser.run("light candle", false);
        } else {
          game.history.write("Try looking for something to light with it.");
        }
        break;
      case "candle":
        if (game.artifacts.get(1).isHere()) {
          game.command_parser.run("light candle", false);
        } else {
          game.history.write("Try looking for something to light it with.");
        }
        break;
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (game.monsters.get(25).isHere()) {
      game.effects.print(12, "special");
      game.monsters.get(25).room_id = null;
      game.artifacts.get(13).moveToRoom();
      return;
    }
    // resurrect
    let bodies = game.artifacts.visible.filter(x => x.isHere() && x.type === Artifact.TYPE_DEAD_BODY);
    if (bodies.length) {
      for (let a of bodies) {
        let m = game.monsters.get(a.id - game.dead_body_id);
        game.history.write(m.name + ' comes alive!', 'special');
        m.damage = 0;
        m.moveToRoom();
        a.destroy();
      }
      return;
    }

    // regular power effects
    if (roll <= 10) {
      game.history.write("You feel an increase in your magic abilities!", "special");
      for (let spell_name in this.spell_abilities) {
        if (this.spell_abilities[spell_name] < this.spell_abilities_original[spell_name]) {
          this.spell_abilities[spell_name] += 5;
          this.spell_abilities_original[spell_name] += 5;
        }
      }
    } else if (roll <= 28) {
      game.history.write("Small fireballs circle your head, faster and faster, then explode in a shower of sparks!");
    } else if (roll <= 38 && !game.data['barrel']) {
      game.effects.print(15);
      game.player.moveToRoom(9, false);
      game.data['barrel'] = true;
    } else if (roll <= 45) {
      // hear conversations
      game.effects.print(16);
      game.effects.print(17);
      game.effects.print(18);
    } else if (roll <= 53) {
      game.effects.print(20, "special");
      game.player.hardiness += 4;
    } else if (roll <= 61) {
      game.effects.print(21, "special");
      game.player.injure(3);
    } else if (roll <= 69) {
      game.effects.print(22, "special");
      if (game.player.charisma < 15) {
        game.player.charisma += 15;
      } else {
        game.player.charisma += 5;
      }
    } else if (roll <= 77) {
      // horse
      game.effects.print(23, "special");
      game.effects.print(25, "special");
      for (let wa in game.player.weapon_abilities) {
        game.player.weapon_abilities[wa] -= 10;
      }
    } else if (roll <= 85) {
      game.effects.print(7, "special");
      game.player.injure(Math.floor((game.player.hardiness - game.player.damage) / 2));
      game.effects.print(8, "special");
    } else if (roll <= 95) {
      game.history.write("You can feel the new agility flowing through you!", "success");
      if (game.player.spell_counters['speed'] === 0) {
        game.player.speed_multiplier = 2;
      }
      game.player.spell_counters['speed'] += 10 + game.diceRoll(1, 10);
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }

  },

}; // end event handlers

// declare any functions used by event handlers and custom commands
function update_status(status: number) {
  if (status === 0 || status === game.data['how drunk']) return;
  game.data['how drunk'] = status;
  let st = drunk_messages[status - 1];
  game.history.write(st.text, st.style);
}
