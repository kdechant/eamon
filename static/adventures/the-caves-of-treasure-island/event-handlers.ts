import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // set up game data
    game.data["hermit_saves"] = false;
    game.data["hermit_speaks"] = false;
    game.data["quicksand_counter"] = 0;
    let terry: Monster = game.monsters.get(16);
    game.data["terry_actions"] = [
      terry.name + ' says, "Ya-d\'er-eh, what\'s this all aboot?"',
      terry.name + ' says, "Too tight!"',
      terry.name + ' mumbles incoherently.',
      terry.name + ' drinks some vodka.',
      terry.name + ' passes out for a few minutes.',
      terry.name + ' says something about a spaceship.',
      terry.name + ' talks about birch bark.'
    ];
    game.data["found_trapdoor"] = false;
    game.data["found_book"] = false;
    game.data["read"] = {};  // flag for whether various artifacts have been read before

    // rename the locked door artifacts
    for (let a = 49; a <= 53; a++) {
      game.artifacts.get(a).name = game.artifacts.get(49).name;
    }

    // custom messages for the lava monster
    game.monsters.get(11).combat_verbs = [
      "hurls molten rock at",
      "flings shards of obsidian at",
      "breathes fire at",
      "reaches toward"
    ];
    game.monsters.get(11).health_messages = [
      "is in perfect health.",
      "is lightly chipped.",
      "is chipped.",
      "is oozing lava.",
      "is cracking.",
      "is crumbling!",
      "shatters into molten droplets!"
    ];

    // the potion shouldn't have a built-in heal value; its logic is implemented differently
    game.artifacts.get(2).dice = 0;

  },

  // add your custom event handlers here
  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    if (room_from.id === 11 && room_to.id === 10) {
      // fall into the lava tube (not a death trap)
      game.history.write("You fall down a pit!");
    } else if (room_to.id === 3 || room_to.id === 17) {
      // pirates death trap, pit death trap; message is in room description
      game.history.write(room_to.description); // because game won't show descriptions if you're dead.
      game.die();
    } else if (room_from.id === 46 && room_to.id === 49) {
      game.history.write("The passage closes behind you!");
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 1) {
        game.history.write("You are a weirdo, aren't you?");
        return;
      } else if (artifact.id === 2) {
        // potion can either hurt or heal
        let roll = game.diceRoll(1, 10);
        if (roll > 8) {
          game.history.write("Argh! It burns!", "special");
          game.player.injure(5);
        } else if (roll > 4) {
          game.history.write("Some of your wounds heal.", "special");
          game.player.heal(5);
        } else {
          game.history.write("You get a weird tingling sensation in your head.", "special");
        }
      } else if (artifact.id === 3) {
        // shovel
        game.history.write("Digging...");
        if (game.player.room_id === 14 && !game.data["found_trapdoor"]) {
          game.history.write("Found something!");
          game.data["found_trapdoor"] = true;
          game.artifacts.get(54).reveal();
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
          m = game.monsters.all[i];
          if (m.isHere() && m.reaction === Monster.RX_FRIEND) {
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

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();
    // some readable artifacts have their text contained in the artifact description
    if (artifact !== null) {
      if (artifact.id === 34 || artifact.id === 39 || artifact.id === 42 || artifact.id === 44) {
        if (game.data["read"][artifact.id]) {
          // the first time, the game will show the description automatically as the artifact is revealed.
          // subsequent readings require the description to be shown again.
          game.history.write(artifact.description);
        } else {
          game.data["read"][artifact.id] = true;
        }
        command.markings_read = true;  // suppresses the "no markings to read" message
      } else if (artifact.id === 15) {
        // the book teleports you (and friendly NPCs)
        game.player.moveToRoom(22);
      }
    }
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();

    if (artifact.id === 2) {
      // potion only works for the player
      game.history.write(monster.name + " doesn't want to try that strange potion.");
      return false;
    }
    return true;
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
    if (game.player.room_id > 1 && !game.in_battle && terry.isHere()) {
      let roll = game.diceRoll(1, 100);
      if (terry.reaction === Monster.RX_FRIEND && game.data["terry_actions"].length && roll <= 75) {
        let action_no = Math.floor(Math.random() * game.data["terry_actions"].length);
        game.history.write(game.data["terry_actions"][action_no]);
        game.data["terry_actions"].splice(action_no, 1);
      }
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    if (exit.room_to < 0 && exit.room_to !== RoomExit.EXIT) {
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
  "power": function(roll: number) {
    let game = Game.getInstance();
    // power is useless in this adventure
    game.history.write("You hear a loud sonic boom which echoes all around you!");
  },

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let game = Game.getInstance();
    let genz = game.monsters.get(7);
    if (genz.isHere() && genz.reaction !== Monster.RX_HOSTILE) {
      game.exit_message.push(game.effects.get(6).text);
      game.player.profit += 1000;
    }
  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
