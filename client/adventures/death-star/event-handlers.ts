import type { Artifact } from "../../core/models/artifact";
import type Game from "../../core/models/game";
import { Monster } from "../../core/models/monster";
import { Room, RoomExit } from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game: Game;

export const event_handlers = {
  start: function (): void {
    // remove player artifacts, and replace with light saber
    game.data.original_gear = game.player.inventory.map((a) => a.id);
    game.player.inventory.forEach((a) => {
      a.destroy();
    });
    game.artifacts.get(1).moveToInventory();
    game.player.ready(game.artifacts.get(1));

    // scatter storm troopers randomly around ship
    game.monsters.get(8).children.forEach((m, idx) => {
      if (idx < 100) {
        m.moveToRoom(8); // st quarters
        return;
      } else if (idx < 103) {
        m.moveToRoom(72);
      } else if (idx < 105) {
        m.moveToRoom(2);
      } else {
        // Can put the rest in any room up to ID 71, except a few special rooms.
        // (72+ is the detention area, which has special placement)
        let new_room = game.diceRoll(1, 71);
        const banned_rooms = [1, 2, 8, 11, 17, 24, 36, 49];
        while (banned_rooms.includes(new_room)) {
          new_room = game.diceRoll(1, 71);
        }
        m.moveToRoom(new_room);
      }
    });

    game.data.launch_tube = 0;

    // blaster counts
    game.rooms.rooms.forEach((r) => {
      r.data.blasters = 0;
    });
    game.monsters.all.forEach((m) => {
      m.data.blasters = 0;
    });

    // Equipment the player destroyed
    game.data.destroyed = {
      3: false,
      4: false,
      5: false,
    };

    game.data.vader_attacks_kenobi = 0;
  },

  death: function (monster: Monster) {
    // stormtroopers and other soldiers drop a blaster
    if ([8, 9, 10].includes(monster.parent?.id)) {
      game.rooms.current_room.data.blasters++;
    }
    if (monster.id === 11) {
      game.effects.print(7);
    }
    return true;
  },

  beforeMove: function (arg: string, room: Room, exit: RoomExit): boolean {
    // stormtroopers in detention area
    if (exit.room_to === 72 && game.artifacts.get(12).isHere()) {
      game.effects.print(5);
      return false;
    }
    if (exit.room_to === 73 && game.artifacts.get(13).isHere()) {
      game.effects.print(5);
      return false;
    }

    if (exit.room_to === 17) {
      // reset launch tube counter
      game.data.launch_tube = 0;
    }

    return true;
  },

  endTurn: function () {
    // If there are blasters in the room, place the "blaster in room" virtual artifact
    const count_in_room = game.rooms.current_room.data.blasters;
    const in_room_blaster = game.artifacts.get(10);
    // in_room_blaster.monster_id = null; // make sure it gets removed from inventory
    if (count_in_room > 0) {
      in_room_blaster.moveToRoom();
      in_room_blaster.name = count_in_room > 1 ? `${count_in_room} blasters` : "blaster";
      in_room_blaster.article = count_in_room > 1 ? "" : "a";
    } else {
      in_room_blaster.destroy();
    }

    // If the player is carrying blaster(s), place "blaster in inventory" artifact
    const inv_blaster = game.artifacts.get(11);
    const inv_count = game.player.data.blasters;
    console.log("blasters in inventory", inv_count);
    if (inv_count > 0) {
      inv_blaster.moveToInventory();
      inv_blaster.name = inv_count > 1 ? `${inv_count} blasters` : "blaster";
      inv_blaster.article = inv_count > 1 ? "" : "a";
      console.log(inv_blaster);
    } else {
      inv_blaster.destroy();
    }

    // TODO: check if NPCs have blasters, and update their inventories. This might require creating extra artifacts for them.

    // If Leia is with you when you try to leave the detention center, place the "squad of stormtrooper" artifacts
    if (game.player.room_id === 74 && game.monsters.get(2).isHere()) {
      game.artifacts.get(12).moveToRoom(71);
      game.artifacts.get(13).moveToRoom(74);
    }

    // launch tube
    if (game.player.room_id === 17) {
      if (game.data.launch_tube >= 1) {
        game.effects.print(2);
        game.die();
      }
      game.data.launch_tube += 1;
    }
  },

  endTurn1: function () {
    if (game.player.room_id === 91) {
      game.die();
    }
  },

  specialCommand: function (verb: string, arg: string): boolean {
    // "take off" == "takeoff"
    if (verb === "take" && arg === "off") {
      game.command_parser.run("takeoff", false);
      return false;
    }
    return true;
  },

  beforeGet: function (arg, artifact) {
    if (artifact && artifact.id === 10) {
      if (arg === "all" || arg === "") {
        game.player.data.blasters += game.rooms.current_room.data.blasters;
        game.rooms.current_room.data.blasters = 0;
        return true;
      }

      game.player.data.blasters += 1;
      game.rooms.current_room.data.blasters -= 1;
      game.history.write("Blaster taken.");
      return false;
    }
    return true;
  },

  drop: function (arg, artifact) {
    if (artifact && artifact.id === 11) {
      if (arg === "all" || arg === "") {
        game.rooms.current_room.data.blasters += game.player.data.blasters;
        game.player.data.blasters = 0;
        return true;
      }

      game.player.data.blasters -= 1;
      game.rooms.current_room.data.blasters += 1;
      game.history.write("Blaster dropped.");
      return false;
    }
    return true;
  },

  dropArtifact: function (monster: Monster, artifact: Artifact): void {
    // NPC drops a blaster. Update room and monster blaster counts
    if (monster.id !== Monster.PLAYER && artifact.id === 11) {
      monster.data.blasters -= 1;
      game.rooms.current_room.data.blasters += 1;
    }
  },

  ready: function (arg, old_wpn, wpn): boolean {
    const blaster = game.artifacts.get(11);

    // switch from other weapon to blaster
    if (!old_wpn.name.includes("blaster") && wpn.name.includes("blaster")) {
      // Make a new artifact that is the one the player actually readies. That allows us to keep it separate from
      // the pile of blasters.
      let readied_blaster = game.artifacts.get(11.001);
      if (!readied_blaster) {
        readied_blaster = game.artifacts.add({
          ...blaster,
          id: 11.001,
          article: "a",
          name: "blaster",
        });
      }
      game.player.data.blasters -= 1;
      readied_blaster.moveToInventory();
      game.player.ready(readied_blaster);
      game.history.write(`${readied_blaster.name} readied.`);
      return false;
    }

    // switch from blaster to other weapon
    if (old_wpn.name.includes("blaster") && !wpn.name.includes("blaster")) {
      game.player.weapon.destroy();
      game.player.data.blasters += 1;
      return true;
    }

    return true;
  },

  seeMonster: function (monster: Monster): void {
    // garbage monster
    if (monster.id === 4) {
      game.history.write("The garbage monster wraps around your leg and tries to pull you under!", "warning");
    }
  },

  flee: function () {
    if (game.monsters.get(4).isHere()) {
      game.history.write("You are held fast by the garbage monster and cannot flee!", "emphasis");
      return false;
    }
    return true;
  },

  attackArtifact: function (arg: string, target: Artifact) {
    return destroy(target);
  },

  chooseTarget: function (attacker, defender): Monster {
    // vader always attacks obi-wan
    const vader = game.monsters.get(3);
    const kenobi = game.monsters.get(11);
    if (attacker.id === 3 && kenobi.isHere()) {
      game.data.vader_attacks_kenobi += 1;
      return kenobi;
    }
    if (attacker.id === 11 && vader.isHere()) {
      return vader;
    }
    return defender;
  },

  attackDamage: function (attacker: Monster, defender: Monster, damage: number) {
    if (attacker.id === 3 && defender.id === 11) {
      if (game.data.vader_attacks_kenobi > 2) {
        // vader always kills obi-wan after 3 rounds.
        return 1000;
      } else {
        // but try not to let obi-wan die until 3 rounds have passed.
        return 2;
      }
    }
    // obi-wan never kills vader
    if (attacker.id === 11 && defender.id === 3) {
      return 3;
    }
    return true;
  },

  beforeSpell: function (spell_name: string) {
    // spells don't work in prison due to shielding
    game.history.write("Your Eamon spells don't seem to work in this galaxy!");
    return false;
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  power: function (roll: number): void {
    game.history.write("You hear a loud sonic boom which echoes all around you!");
  },
}; // end event handlers

export function destroy(target: Artifact) {
  if (target.id < 3 || target.id > 8) {
    game.effects.print(4);
    return false;
  }

  if (target.id > 5) {
    game.history.write("What more could you do to it?");
    return false;
  }

  game.history.write(`You smash the ${target.name} to pieces!`);
  target.destroy();
  game.data.destroyed[target.id] = true;
  game.artifacts.get(target.id + 3).moveToRoom();

  // Destroying tractor beam moves Vader and Obi-wan to the hangar deck
  if (target.id === 3 || target.id === 5) {
    game.monsters.get(3).moveToRoom(2);
    game.monsters.get(11).moveToRoom(2);
  }

  return false;
}
