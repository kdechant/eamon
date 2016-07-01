import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // initial messages
    game.history.write("Greetings, " + game.player.name + "!");
    game.history.write("The Free Adventurer's Guild has elected you to rescue a captured adventurer. Recently, somebody found a note in a bottle asking for assistance.  The author, Genzenbraun the Sailor, is a fellow member of the Guild.");
    game.history.write("He explained that he had been taken captive by pirates on Treasure Island. Unfortunatly the exact location of the unlucky adventurer was destroyed by sea water.  However, in the bottle was the following map...");
    game.history.write("TODO");
    game.history.write("A word of caution:  Genzenbraun warns of hidden caverns with one way passages and tunnels under the surface of the island.  Also the waters around it are infested with man-eating sharks.");
    game.history.write("A ship will drop you off on the west beach of the island, but it has other duties and can't wait for you.  Another is scheduled to land on the south beach soon after you are dropped off.");
    game.history.write("**** Good luck! ****");

    // set up game data
    game.data["hermit_saves"] = false;
    game.data["hermit_speaks"] = false;
    game.data["quicksand_counter"] = 0;
    let terry: Monster = game.monsters.get(16);
    game.data["terry_actions"] = [
      {
        'text': terry.name + ' says, "Ya-d\'er-eh, what\'s this all aboot?"',
        'done': false
      },
      {
        'text': terry.name + ' says, "Too tight!"',
        'done': false
      },
      {
        'text': terry.name + ' mumbles incoherently.',
        'done': false
      },
      {
        'text': terry.name + ' drinks some vodka.',
        'done': false
      },
      {
        'text': terry.name + ' passes out for a few minutes.',
        'done': false
      },
      {
        'text': terry.name + ' says something about a spaceship.',
        'done': false
      },
      {
        'text': terry.name + ' talks about birch bark.',
        'done': false
      }
    ];
    game.data["terry_done"] = 0;
    game.data["found_trapdoor"] = false;
    game.data["found_book"] = false;

    // rename the locked door artifacts
    for (let a = 49; a <= 53; a++) {
      game.artifacts.get(a).name = game.artifacts.get(49).name;
    }
  },

  // add your custom event handlers here

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 3) {
        // shovel
        game.history.write("Digging...");
        if (game.player.room_id === 14 && !game.data["found_trapdoor"]) {
          game.history.write("Found something!");
          game.data["found_trapdoor"] = true;
          game.artifacts.get(54).room_id = 14;
        } else if (game.player.room_id === 51 && !game.data["found_book"]) {
          game.history.write("Found something!");
          game.data["found_book"] = true;
          game.artifacts.get(15).room_id = 51;
        } else {
          game.history.write("You find nothing.");
        }
      } else if (artifact.id === 18) {
        // magic harp - heals all friendly monsters in the room
        game.history.write("You play the harp.");
        let m: Monster;
        for (let i in game.monsters.all) {
          m = game.monsters.get(i);
          if (m.room_id === game.player.room_id && m.reaction === Monster.RX_FRIEND) {
            m.heal(m.damage);
          }
        }
      } else if (artifact.id === 31) {
        // flute opens locked doors
        game.history.write("You play the flute.");
        let art: Artifact;
        for (let a = 49; a <= 53; a++) {
          art = game.artifacts.get(a);
          if (art.room_id === game.player.room_id) {
            art.is_open = true;
            game.history.write("The " + art.name + " opens!", "special");
          }
        }
      }
    }
  },

  "endTurn": function() {
    let game = Game.getInstance();

    // quicksand trap
    if (game.player.room_id === 9 && !game.data["hermit_saves"]) {
      game.data["quicksand_counter"]++;
      if (game.data["quicksand_counter"] > 4) {
        game.history.write("You sink beneath the surface and die!", "danger");
        game.die();
      } else {
        game.history.write("You are caught in the quicksand!", "warning");
      }
    }

  },

  "endTurn2": function() {
    let game = Game.getInstance();

    // hermit speaks
    let hermit = game.monsters.get(4);
    if (game.player.room_id === 14 && hermit.room_id === 14 && !game.data["hermit_speaks"]) {
      game.effects.print(2);
      game.data["hermit_speaks"] = true;
    }

    // terry's ramblings
    let terry = game.monsters.get(16);
    if (terry.isHere()) {
      let roll = game.diceRoll(1, 100);
      if (terry.reaction === Monster.RX_FRIEND && game.data["terry_done"] <= 6 && roll <= 40) {
        let action_no = game.diceRoll(1, 7) - 1;
        while (game.data["terry_actions"][action_no]["done"]) {
          let action_no = game.diceRoll(1, 7) - 1;
        }
        game.history.write(game.data["terry_actions"][action_no]["text"]);
      }
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    if (exit.room_to < 0 && exit.room_to !== -999) {
      // stuck in quicksand
      if (game.data["hermit_saves"]) {
        exit.room_to = Math.abs(exit.room_to);
        return true;
      } else {
        game.history.write("You just sink farther down!", "warning");
        return false;
      }
    }
    return true;
  },

  "say": function(arg: string) {
    let game = Game.getInstance();
    if (game.player.room_id === 9 && arg === 'help' && !game.data["hermit_saves"]) {
      game.history.write("An old hermit appears and pulls you out in the nick of time!", "special");
      game.data["hermit_saves"] = true;
      game.monsters.get(4).moveToRoom(game.player.room_id);
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument
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


// declare any functions used by event handlers and custom commands
