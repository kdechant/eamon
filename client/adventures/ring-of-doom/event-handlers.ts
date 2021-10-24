import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {CommandException} from "../../core/utils/command.exception";
import {ModalQuestion} from "../../core/models/modal";
import {drinks} from "../princes-tavern/event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const event_handlers = {

  "start": function(): void {
    // add your custom game start code here
  },

  "beforeMove": function(arg: string, room_from: Room, exit: RoomExit): boolean {
    if (exit) {
      if (!game.player.hasArtifact(2)) {
        game.history.write("Pick up the ring, buddy.");
        return false;
      }
      if (exit.room_to === -71) {  // lost in desert
        game.effects.print(5);
        game.player.injure((game.player.hardiness - game.player.damage) / 2, true);
        game.monsters.visible.forEach(m => m.injure(m.hardiness / 2, true));
        return false;
      }
      if (exit.room_to === -51 || exit.room_to === -73) {
        game.history.write("The watchers block your path!");
        return false;
      }
    }
    return true;
  },

  "endTurn1": (): void => {
    // probably never get to this room, but if somehow we do...
    if (game.player.room_id === 71) {
      game.die();
    }
  },

  "drop": function(arg: string, artifact: Artifact): boolean {
    if (artifact.id === 2 && game.player.room_id === 72) {
      if (game.monsters.get(4).isHere()) {
        game.effects.print(6);
      }
      game.effects.print(7);
      game.exit();
      return false;
    }
    return true;
  },

  "light": (arg: string, artifact: Artifact): boolean => {
    if (artifact && artifact.id === 10 && !artifact.is_lit) {
      game.effects.print(11);
      artifact.is_lit = true;
      return false;  // suppress normal "you light the..." message
    }
    return true;
  },

  "beforeRead": (arg: string, artifact: Artifact): boolean => {
    if (artifact && artifact.id === 10) {  // flask - not 'readable' type but can be read anyway
      game.effects.print(8);
      return false;
    }
    return true;
  },

  "say": (phrase: string): void => {
    phrase = phrase.toLowerCase();
    const flask = game.artifacts.get(10);
    if (phrase === 'aiya elenion ancalima' && flask.isHere()) {
      game.effects.print(12);
      game.effects.print(13);
      if (game.player.room_id === 50) {
        game.player.moveToRoom(51);
      }
      if (game.player.room_id === 52) {
        game.player.moveToRoom(73);
      }
    } else if (phrase === 'githoneil a elbereth' && flask.isHere()) {
      game.effects.print(11);
      flask.is_lit = true;
    }
  },

  "beforeUse": (arg: string): boolean => {
    if (game.artifacts.get(10).match(arg) && game.artifacts.get(10).isHere()) {
      game.command_parser.run('light flask', false);
      return false;
    }
    return true;
  },

  "use": (arg: string, artifact: Artifact): boolean => {
    console.log('use event handler', arg, artifact, artifact.id, artifact.isHere());
    if (artifact.id === 37 && artifact.isHere()) {
      const q = new ModalQuestion;
      q.type = 'multiple_choice';
      q.question = "Use the equipment on what?";
      q.choices = game.artifacts.all
        .filter(a => a.isHere() && (a.id === 1 || a.is_weapon))
        .map(a => a.name);
      if (!q.choices) {
        throw new CommandException("You don't have any weapons to use it on!");
      }
      q.callback = function (answer) {
        if (answer === game.artifacts.get(1).name) {
          game.history.write("You have reforged Narsil!", "success");
          game.artifacts.get(1).destroy();
          game.artifacts.get(8).moveToRoom();
        } else {
          game.history.write('Nothing happens.');
        }
        return true;
      };
      game.modal.questions = [q];
      game.modal.run();
    }
    return true;
  },

  "wear": (arg: string, target: Artifact): boolean => {
    if (target.id === 2) {  // ring
      game.effects.print(3);
      return false;
    }
    return true;
  },

  "power": function(roll: number): void {
    if (roll <= 16) {
      game.effects.print(9);
    } else if (roll <= 31) {
      game.effects.print(10);
    } else if (roll <= 94) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(game.player.damage);
    }
  },

}; // end event handlers
