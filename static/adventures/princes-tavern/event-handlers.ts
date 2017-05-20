import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";
import {ModalQuestion} from "../../core/models/modal";

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
  {"text" : "You feel extremely numb, dizzy, and sick.", "style": "warning"}
];

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

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
    game.data["original ag"] = game.player.agility;

    // drinkers
    game.monsters.get(19).data['tolerance'] = 49;
    game.monsters.get(19).data['drinks'] = 0;
    game.monsters.get(20).data['tolerance'] = 35;
    game.monsters.get(20).data['drinks'] = 0;
    game.monsters.get(21).data['tolerance'] = 35;
    game.monsters.get(21).data['drinks'] = 0;
    game.monsters.get(22).data['tolerance'] = 32;
    game.monsters.get(22).data['drinks'] = 0;
    game.monsters.get(23).data['tolerance'] = 28;
    game.monsters.get(23).data['drinks'] = 0;
    game.monsters.get(24).data['tolerance'] = 18;
    game.monsters.get(24).data['drinks'] = 0;

  },

  "endTurn": function() {
    let game = Game.getInstance();

    // drunk yet?
    if (game.data['drinks'] > game.player.hardiness) {
      game.player.agility = Math.round(game.data['original ag'] - (game.data['drinks'] - game.player.hardiness));
      let condition = game.player.agility / game.data['original ag'];
      if (condition < 0) {
        game.history.write("You passed out!", "danger");
        if (game.player.room_id === 22) {
          // scatter player's artifacts
          game.data['drinks'] = 0;
          game.data['drinking contest active'] = 0;
          game.history.write("You wake up several hours later. All your possessions are gone! They must have been stolen while you were passed out.", "emphasis");
          for (let i of game.player.inventory) {
            let dest = game.rooms.getRandom([1, 9, 12, 16, 18, 50, 53, 57]);
            i.moveToRoom(dest.id);
          }
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
    } else if (game.data['drinks'] > game.player.hardiness / 3) {
      update_status(1);
    }
  },

  "endTurn2": function() {
    let game = Game.getInstance();
    if (game.player.room_id === 42 && game.monsters.get(31).isHere() && !game.data["protection spell text"]) {
      game.effects.print(3);
      game.data["protection spell text"] = true;
    }

  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // gerschter bar
    if (game.player.room_id === 7) {
      game.effects.print(9);
      game.player.moveToRoom()
      game.monsters.get(20).room_id = null;
    }
    return true;
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

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
      if (game.player.hasArtifact(25)) {
        game.effects.print(41);
      } else if (game.artifacts.get(25).room_id === null && game.artifacts.get(25).monster_id === null) {
        // drank it
        game.effects.print(40, "danger");
        game.die();
        return false;
      } else {
        game.effects.print(39);
        return false;
      }
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

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    // drinking contest
    if (room_to.id === 22 && game.data['drinking contest active'] === null) {
      game.data["drinking contest active"] = true;
      game.effects.print(1);
    }
  },

  "beforeSpell": function(spell_name: string) {
    let game = Game.getInstance();
    // gerschter bar
    if (game.player.room_id === 7) {
      game.effects.print(10);
      return false;
    }
    return true;
  },

  "drink": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();

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
          let drink = drinks.find(x => x.name === game.modal.questions[0].answer);
          let str = answer === 'sip' ? 0.5 : (answer === 'drink' ? 1 : 1.5);
          game.data['drinks'] += drink.strength + str;

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
          for (let monster_id of game.data['drinkers']) {
            m = game.monsters.get(monster_id);
            d = drinks[game.diceRoll(1, drinks.length) - 1];
            game.history.write(m.name + " buys a " + d.name + " and guzzles it!.");
            m.data['drinks'] += d.strength * 1.5;
            if (m.data['drinks'] > m.data['tolerance']) {
              game.history.write(m.name + " passes out!", "emphasis");
              game.artifacts.get(game.dead_body_id + m.id - 1).moveToRoom();
              game.data['drinkers'].splice(game.data['drinkers'].indexOf(monster_id), 1);
            }
          }

          if (game.data['drinkers'].length === 0) {
            game.history.write("The drinking contest is over. You notice a stack of gold on the table.");
            game.data['drinking contest active'] = false;
            game.artifacts.get(31).moveToRoom();
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
      } else if (game.data['bartender patience']) {
        game.history.write("The bartender asks you to pay up before she will pour you another.");
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

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    let game = Game.getInstance();

    if (recipient.id === 6 && artifact.id === 8) {
      // lamp to piano player
      game.effects.print(37);
    } else if (recipient.id === 32 && artifact.id === 13) {
      // amulet to hokas
      game.effects.print(13);
      game.effects.print(14);
      game.data['locate active'] = true;
    } else if (recipient.id === 12 && artifact.id === 22) {
      // slipper to prince
      game.effects.print(38);
      game.artifacts.get(28).moveToRoom();
    }
    return true;
  },

  "open": function(arg: string, artifact: Artifact, command: OpenCommand) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 69) {
        // vault door
        command.opened_something = true; // use this even if we didn't open it, to suppress other messages
        game.modal.show("Enter combination (use dashes):", function(value) {
          if (value === game.data['combo'][3]) {
            game.history.write("The vault door opened!", "success");
            artifact.is_open = true;
          } else {
            game.history.write("The vault door did not open.");
          }
        });
      }
    }
  },

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    if (artifact && artifact.name === 'graffiti') {
      game.history.write("You see some names and measurements:");
      game.history.write("Deede Berry - " + game.data['combo'][0]);
      game.history.write("Fifi LaFrentz - " + game.data['combo'][1]);
      game.history.write("V. Ault - " + game.data['combo'][2]);
      game.history.write("Jamie Zena - " + game.data['combo'][3]);
      command.markings_read = true;
    }
  },

  "say": function(phrase: string) {
    let game = Game.getInstance();
    if ((phrase === 'gronk' || phrase === 'grunt') && game.monsters.get(6).isHere()) {
      game.effects.print(43);
    }
  },

  "seeRoom": function() {
    let game = Game.getInstance();
    // brawl effect shown after room, so it appears before monster desc
    if (game.rooms.current_room.id === 40 && game.monsters.get(25).isHere()) {
      game.effects.print(11);
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    switch (artifact.name) {
      case 'peanuts':
        game.effects.print(2);
        game.player.moveToRoom(36, true);
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
            game.player.agility -= 3;
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
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
    if (game.monsters.get(25).isHere()) {
      game.effects.print(12);
      game.monsters.get(25).room_id = null;
      game.artifacts.get(13).moveToRoom();
      return;
    }
    game.history.write("POWER TODO!")
  },

}; // end event handlers

// declare any functions used by event handlers and custom commands
function update_status(status: number) {
  let game = Game.getInstance();
  if (status === 0 || status === game.data['how drunk']) return;
  game.data['how drunk'] = status;
  let st = drunk_messages[status - 1];
  game.history.write(st.text, st.style);
}
