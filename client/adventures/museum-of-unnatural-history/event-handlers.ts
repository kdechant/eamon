import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const event_handlers = {

  "start": function(): void {
    // add your custom game start code here
    game.data = {
      fertilized: false,
      made_bomb: false
    }
    game.ss_effect = 6;
  },

  "endTurn2": function(): void {
    // note from professor
    if (!game.effects.get(1).seen) {
      game.effects.print(1);
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    switch (exit.room_to) {
      case -5:
        // desert
        game.effects.print(3);
        game.player.injure(Math.floor((game.player.hardiness - game.player.damage) / 2), true);
        game.player.moveToRoom(1);
        return false;
    }
    return true;
  },

  "beforeGet": function(arg, artifact) {
    if (artifact && artifact.id == 20) {
      // death ore
      game.effects.print(7);
      game.player.injure(Math.floor((game.player.hardiness - game.player.damage) / 2), true);
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    if (artifact && artifact.id == 25) {
      // red crystal
      game.history.write("(The crystal feels warm.)");
    }
  },

  "say": (phrase: string): void => {
    phrase = phrase.toLowerCase();
    if (phrase === 'flaming') {
      // Player must have all letters for this to work.
      if (!game.artifacts.allAreHere([2, 8, 9, 11, 27, 31, 32])) {
        game.history.write('Nothing happened.');
        return;
      }
      const bomb = game.artifacts.get(34);
      if (bomb.isHere()) {
        bomb.destroy();
        const doorway = game.artifacts.get(33);
        if (doorway.isHere()) {
          game.effects.print(11);
          doorway.destroy();
        } else {
          game.effects.print(10);
          game.die();
        }
        return;
      }

      if (game.artifacts.get(16).isHere()) {
        game.history.write("The magic word lit the fuse, which fizzled and went out.");
        return;
      }

      game.history.write('Nothing happened.');
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact.isHere()) {
      switch (artifact.id) {
        case 4:  // feather
          if (game.monsters.get(19).isHere()) {
            game.history.write('The hyena laughs with pleasure and becomes friendly!');
            game.monsters.get(19).reaction = Monster.RX_FRIEND;
            return true;
          }
          break;
        case 6:  // gum
          if (canPlugDrain()) {
            game.history.write('You plug the fountain with the gum and see a key wedged in ' +
              'the drain.');
            game.artifacts.get(22).moveToRoom();
            game.artifacts.get(6).destroy();
            return true;
          }
          break;
        case 17:  // nitrates
          if (game.player.room_id === 37 && game.artifacts.get(15).isHere() && !game.data.fertilized) {
            game.data.fertilized = true;
            game.artifacts.get(16).moveToRoom();
            return true;
          }
          break;
        case 25:  // red crystal
          if (game.player.room_id === 50 && game.artifacts.get(26).isHere()) {
            game.effects.print(2, 'special');
            game.exit();
          }
          break;
        case 29:  // other crystals
        case 30:
          if (game.player.room_id === 50 && game.artifacts.get(26).isHere()) {
            game.history.write('Nothing happened...');
            return true;
          }
          break;
        case 34:  // bomb
          game.history.write("You must find a way to light the fuse first!");
          return true;
      }
      game.history.write("Try a different command.");
      return true;
    }
  },

  "specialPut": function(arg: string, item: Artifact, container: Artifact) {
    if (item && item.id === 6 && canPlugDrain()) {
      game.command_parser.run('use gum', false);
      return false;
    }
    return true;
  },

  "power": function(roll: number): void {
    if (roll <= 10) {
      game.effects.print(8);
      game.player.injure(Math.floor((game.player.hardiness - game.player.damage) / 2), true);
    } else if (roll <= 86) {
      game.effects.print(9);
    } else if (roll <= 95) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

  "afterSell": function() {
    game.after_sell_messages.push("The Board of Directors also gives you your reward of 1000 gold pieces!");
    game.player.gold += 1000;
  },

}; // end event handlers

const canPlugDrain = () => game.artifacts.get(21).isHere() && !game.artifacts.get(22).room_id;
