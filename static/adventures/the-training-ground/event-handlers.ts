import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // add your custom game start code here
    game.effects.print(17);
    if (game.player.armor_expertise > 25) {
      game.effects.print(18);
    }
    let a = game.player.gender === 'm' ? "son" : "miss";
    game.history.write('"OK, let\'s be careful in there, ' + a + '", he says, as he walks away.');

    // set up game data
    game.data["red_sun_speaks"] = false;
    game.data["jacques_shouts"] = false;
    game.data["kobolds_appear"] = false;
    game.data["sylvani_speaks"] = false;
    game.data["thors_hammer"] = false;
    game.data["secret_library"] = false;
    game.data["sounds_room_26"] = false;
    game.data["sex_change_counter"] = 0;
    game.data["charisma_boost"] = false;

  },

  // add your custom event handlers here
  "endTurn": function() {
    let game = Game.getInstance();
    // red sun's opening remarks
    if (game.monsters.get(1).isHere() && !game.data["red_sun_speaks"]) {
      game.effects.print(4);
      game.data["red_sun_speaks"] = true;
    }
    // jacques shouts at you from the room he's locked in
    if (game.rooms.current_room.id === 8 && !game.data["jacques_shouts"]) {
      game.effects.print(5);
      game.data["jacques_shouts"] = true;
    }
    // Kobolds appear (30% chance)
    if (game.player.room_id >= 11 && game.player.room_id <= 15 && !game.data["kobolds_appear"]) {
      let roll = game.diceRoll(1, 100);
      if (roll < 31) {
        for (let i = 6; i <= 9; i++) {
          game.monsters.get(i).room_id = game.player.room_id;
        }
        game.data['kobolds_appear'] = true;
      }
    }
    // Sylvani speaks
    if (game.monsters.get(12).isHere() && !game.data["sylvani_speaks"]) {
      game.effects.print(6);
      game.data["sylvani_speaks"] = true;
    }
    // You hear sounds...
    if (game.player.room_id === 26 && !game.data["sounds_room_26"]) {
      game.effects.print(15);
      game.data["sounds_room_26"] = true;
    }
    // Zapf the Conjurer brings in strangers (15% Chance)
    if (game.monsters.get(15).isHere()) {
      let roll = game.diceRoll(1, 100);
      if (roll <= 15) {
        game.effects.print(16, "special");
        let m = game.monsters.getRandom();
        // Zapf's spell only brings in monsters the player has already seen
        if (!m.isHere() && !m.seen) {
          game.history.write("<<POOF!!>>  " + m.name + " appears!", "special");
          m.room_id = game.player.room_id;
        }
      }
    }
  },

  // TODO: "give" command (giving rapier to jacques, buying potions)

  // TODO: attack/blast bozworth

  // TODO: reading scrolls

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    let game = Game.getInstance();
    if (!game.data["thors_hammer"] && game.player.room_id === 22 && !game.artifacts.get(24).seen) {
      game.effects.print(7, "special");
      game.artifacts.get(24).room_id = game.player.room_id;
      game.data["thors_hammer"] = true;
      return;
    }

    // 20% chance of sex change
    if (roll < 21 && game.data["sex_change_counter"] < 2) {
      game.data["sex_change_counter"]++;
      let word = game.player.gender === "m" ? "feminine" : "masculine";
      game.history.print("You feel different...more " + word + ".");
      game.player.gender = game.player.gender === "m" ? "f" : "m";
      return;
    }
    // 40% chance Charisma up (one time only)
    if (roll < 41 && !game.data["charisma_boost"]) {
      game.data["charisma_boost"] = true;
      let word = game.player.gender === "m" ? "handsome" : "beautiful";
      game.player.charisma += 2;
      return;
    }
    // 5% Chance of being hit by lightning!
    if (roll > 94) {
      game.effects.print(33, "danger");
      game.player.injure(10, true);
      return;
    }
    // default
    game.history.write("You hear a loud sonic boom which echoes all around you!");
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
