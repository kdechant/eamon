import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data["water level"] = 0;
    game.data["water dropped"] = 0;
    game.data["chest open"] = false;
    game.data["malagur steal"] = 0;
    game.data["artifacts increased"] = [];

    // the shark's attack messages
    game.monsters.get(15).combat_verbs = ["bites at", "chews on"];

    // move red face and blue nose to a random place on the second level of the ship
    // (originally they were in the brig, but this makes the beginning too hard.)
    game.monsters.get(12).moveToRoom(18 + game.diceRoll(1, 10));
    game.monsters.get(13).moveToRoom(18 + game.diceRoll(1, 10));

    // hide extra descriptions for some rooms
    for (let i = 44; i <= 47; i++) {
      game.rooms.getRoomById(i).seen = true;
    }

    // take away player's weapons and gold
    let storage_rooms: number[] = [15, 17, 30, 29, 34];
    for (let item of game.player.inventory) {
      if (item.is_weapon) {
        item.monster_id = null;
        item.moveToRoom(storage_rooms[Math.floor(Math.random() * storage_rooms.length)]);
      } else {
        // other items just get removed
        item.destroy();
      }
    }
    game.player.updateInventory();
    game.artifacts.get(71).value = game.player.gold;
    game.player.gold = 0;

    if (game.player.hardiness > 5) game.player.damage = 5;

    game.history.write("You wake up on a hard wooden floor, somewhere dark and stuffy. You seem to have sustained a few bruises. In the distance, you can hear shouting and ocean sounds.");
    // naked message
    game.effects.print(7);
    game.history.write("You hear a man's voice in the darkness. He says, 'Good, you're awake. I'm Orlando. I was kidnapped by the smugglers, too. We need to get out of here, pronto.'");
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    switch (exit.room_to) {
      case -7:

        game.history.write("The lower hold is now filled with water!", "emphasis");
        return false;

      case -10:

        // the passenger ship
        game.effects.print(5);
        game.data["ship"] = "passenger";
        game.exit();
        break;

      case -11:

        // the slave ship
        if (game.monsters.get(1).isHere()) {
          game.history.write("Orlando says, \"I've seen that ship before. I think they're slavers. Let's try a different one.\"");
          return false;
        } else {
          game.effects.print(6);
          game.die();
        }
        break;

      case -999:

        // fishing trawler
        game.effects.print(4);
        game.exit();
    }
    return true;
  },

  "flee": function() {
    let game = Game.getInstance();
    if (game.monsters.get(14).isHere()) {
      game.history.write("One tentacle has you by the leg!", "emphasis");
      return false;
    }
    if (game.monsters.get(15).isHere()) {
      game.effects.print(11, "emphasis");
      return false;
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    let game = Game.getInstance();
    // the guardian of the bowl
    if (artifact && artifact.id === 8 && game.monsters.get(16).reaction === Monster.RX_UNKNOWN) {
      game.history.write("A strange force prevents you from lifting the bowl...");
      return false;
    }
    if (artifact && artifact.id === 44) {  // damp spot
      game.effects.print(12);
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (artifact) {
      switch (artifact.id) {
        case 11:
          // chalice
          game.effects.print(10);
          game.player.injure(game.diceRoll(1, 8));
          break;
        case 15:
          game.history.write("You put on your clothes...");
          game.player.wear(artifact);
          break;
        case 71:
          game.history.write("You take back your gold...");
          break;
      }
    }
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    // oarmen
    if (target.id === 69) {
      game.history.write("They have enough problems already!");
      return false;
    }
    return true;
  },

  "beforeRead": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact && artifact.id === 11) {
      game.effects.print(10);
      return false;
    }
    return true;
  },

  "revealArtifact": function(artifact: Artifact) {
    let game = Game.getInstance();
    // two secret doors with the same alias
    if (artifact.id === 55) {
      game.artifacts.get(56).reveal();
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 19) {
        let roll = game.diceRoll(1, 4);
        switch (roll) {
          case 1:
            let a: Artifact = null;
            for (let i = 51; i <= 59; i++) {
              let art = game.artifacts.get(i);
              if (art.isHere() && art.embedded) {
                a = art;
              }
            }
            if (a) {
              game.history.write("You get an urge to investigate the room...");
              a.reveal();
              return;
            }
            break;
          case 2:
            let f = 0;
            for (let a of game.player.inventory) {
              if (a.value > 0 && game.data["artifacts increased"].indexOf(a.id) == -1) {
                a.value += 10;
                game.data["artifacts increased"].push(a.id);
                f++;
              }
            }
            if (f > 0) {
              game.effects.print(16, "special");
              return;
            }
          case 3:
            if (!game.artifacts.get(30).seen) {
              game.history.write("Something just appeared in front of you...");
              game.artifacts.get(30).moveToRoom();
              return;
            }
            break;
          case 4:
            game.command_parser.run("power", false);
            return;
        }
        // fallback, if other effects were impossible
        game.history.write("You see a shower of sparks erupt from the deck!");
      }
    }
  },

  "endTurn": function() {
    let game = Game.getInstance();

    // show water message even in dark rooms
    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource() && game.player.room_id < 15) {
      game.effects.print(18);
    }

    // put the "rising water" artifact in the room
    if (game.player.room_id < 15) {
      game.data["water level"]++;
      place_water();
    }

    // malagur
    let malagur = game.monsters.get(6);
    if (malagur.isHere() && malagur.reaction === Monster.RX_FRIEND) {
      let roll = game.diceRoll(1, 10);
      if (roll >= 7) {
        let favorite_item = null;
        for (let i in game.player.inventory) {
          let item = game.player.inventory[i];
          if (!item.is_worn && item.id !== game.player.weapon_id && !item.is_lit && item.value > 10
            && (favorite_item === null || item.value > favorite_item.value)) {
            favorite_item = item;
          }
        }
        if (favorite_item !== null) {
          if (game.data["malagur steal"] < 3) {
            favorite_item.monster_id = 6;
            game.data["malagur steal"]++;
            game.player.updateInventory();
          } else {
            game.history.write("You catch " + malagur.name + " trying to steal your " + favorite_item.name + "!", "warning");
            malagur.reaction = Monster.RX_NEUTRAL;
          }
        }
      }
    }

  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource() && !game.artifacts.get(70).isHere()) {
      game.artifacts.get(70).moveToRoom();
    } else {
      let roll = game.diceRoll(1, 3);
      if (roll === 1 && game.player.damage > 0) {
        game.history.write("All your wounds are healed!");
        game.player.damage = 0;
      } else if (roll === 2 && game.monsters.get(1).isHere() && game.monsters.get(1).damage > 0) {
        game.history.write("All of " + game.monsters.get(1).name + "'s wounds are healed!");
        game.monsters.get(1).damage = 0;
      } else if (roll === 3 && game.player.room_id < 15 && game.data["water level"] > 20 && game.data["water dropped"] < 4) {
        game.data["water level"] -= 20;
        game.data["water dropped"]++;
        for (let i = 35; i <= 39; i++) game.artifacts.get(i).seen = false;
        game.history.write("The water level dropped slightly!");
      } else {
        game.history.write("You hear a loud splash echo through the ship!");
      }
    }
  },

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let game = Game.getInstance();

    if (game.data["ship"] === "passenger") {
      let taken = Math.floor(game.player.profit / 2);
      game.after_sell_messages.push("The captain of the passenger ship takes " + taken + " gold pieces for your fare.");
      game.player.gold -= taken;
    }

  },

}; // end event handlers


// declare any functions used by event handlers and custom commands
function place_water() {
  let game = Game.getInstance();

  if (game.data["water level"] > 60) {
    game.history.write("The ship just sank, taking you with it!", "emphasis");
    game.die();
  }
  for (let i = 35; i <= 39; i++) {
    game.artifacts.get(i).room_id = null;
  }
  game.artifacts.get(35 + Math.floor(game.data["water level"] / 15)).moveToRoom();
}
