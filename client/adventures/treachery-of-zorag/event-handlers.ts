import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import talk_data from "./talk-data";
import {cobaltFrontIsHere} from "../malleus-maleficarum/event-handlers";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var event_handlers = {

  "start": function() {
    // set custom hardiness of monsters based on player's best weapon
    // (which should be the weapon the player readied at game init)
    let wpn = game.player.getWeapon();
    let dmg = wpn ? wpn.maxDamage() / 2 : 8;
    game.monsters.all.filter(m => m.hardiness < 0)
      .forEach(m => m.hardiness = dmg * Math.abs(m.hardiness));

    game.data = {
      got_quest: false,
      exited_hall: false,
      ...game.data
    }
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    // king bestows quest
    if (room_to.id === 75 && !game.data.got_quest) {
      game.data.got_quest = true;
    }
    if (room_to.id === 58 && game.data.got_quest) {
      game.data.exited_hall = true;
    }
    // TODO: can't take booze out of bar
  },

  "endTurn2": function() {
    // Did player visit King as summoned?
    if ([14, 16, 21, 33].indexOf(game.player.room_id) !== -1 && !game.data.got_quest) {
      game.effects.print(33);
      game.die(false);
    }

    // NPC healing potions
    game.monsters.visible.forEach(m => {
      if (m.damage > m.hardiness / 2) {
        let potions = m.inventory.filter(a => a.type === Artifact.TYPE_DRINKABLE && a.quantity > 0);
        if (potions.length) {
          const p = potions[0];
          const pronoun = m.gender === 'male' ? 'his' : 'her';
          game.history.write(`${m.name} takes a sip of ${pronoun} ${p.name}.`);
          p.use();
        }
      }
    });
    // Zorag heal spell
    let zorag = game.monsters.get(34);
    if (zorag.damage > zorag.hardiness / 2) {
      game.effects.print(101);
      zorag.damage = 0;
    }

  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
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
