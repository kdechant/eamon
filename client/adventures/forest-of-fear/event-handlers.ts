import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const event_handlers = {

  "start": function(): void {
    // aragorn starts out in poor health
    game.monsters.get(4).damage = 23;
  },

  // add your custom event handlers here

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    if (defender.special === 'orc' && attacker.weapon_id === 25) {
      // orcrist does extra damage to orcs
      return damage + game.diceRoll(1, 5);
    }
    return true;
  },

  "eat": function(arg: string, artifact: Artifact): boolean {
    if (artifact && artifact.id === 13) {
      game.effects.print(2);
      game.die();
      return false;
    }
    return true;
  },

  "drink": function(arg: string, artifact: Artifact): boolean {
    if (artifact && artifact.id === 38) {
      game.effects.print(2);
      game.die();
      return false;
    }
    return true;
  },

  "seeMonster": function (monster: Monster): void {
    if (monster.id === 4) {  // aragorn
      game.effects.print(3);
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll: number): void {
    if (game.player.room_id < 43) {
      if (roll <= 25) {
        game.history.write("A tree branch falls on your head!");
      } else if (roll <= 50) {
        game.history.write("A strong wind knocks a tree down in back of you!");
      } else {
        game.history.write("Wind whips through the forest, scaring away a flock of birds.");
      }
    } else {
      game.history.write("You hear a loud sonic boom which echoes through the castle!");
    }
  },

}; // end event handlers
