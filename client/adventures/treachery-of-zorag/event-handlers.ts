import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {terrain_data, talk_data} from "./custom-data";
import {CommandException} from "../../core/utils/command.exception";
import {BuyCommand} from "../../core/commands/optional-commands";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var event_handlers = {

  "start": function() {

    // Use the optional "buy" command
    game.command_parser.register(new BuyCommand());

    // set custom hardiness of monsters based on player's best weapon
    // (which should be the weapon the player readied at game init)
    let wpn = game.player.getWeapon();
    let dmg = wpn ? wpn.maxDamage() / 2 : 8;
    game.monsters.all.filter(m => m.hardiness < 0)
      .forEach(m => m.hardiness = dmg * Math.abs(m.hardiness));

    game.data = {
      ...game.data,
      got_quest: false,
      exited_hall: false,
      hunger: 0,
      thirst: 0,
      fatigue: 0,
      original_ag: game.player.agility,
      weather_change: false,
      raulos_zorag: false,
    }
  },

  "beforeMove": function(arg: string, room_from: Room, exit: RoomExit): boolean {
    // lost in swamp
    if ((room_from.id === 181 && exit.room_to === 180) || (room_from.id === 171 && exit.room_to === 172)) {
      if (game.player.hasArtifact(21)) {
        game.effects.print(137);
      } else {
        // lost; end up back further in the marsh
        game.effects.print(136);
        game.skip_battle_actions = true;
        game.player.moveToRoom(160 + game.diceRoll(1, 10));
        return false;
      }
    }
    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    // TODO: can't take booze out of bar

    // hunger/thirst/fatigue counters
    const local_terrain = terrain_data[game.rooms.current_room.data.env];
    game.data.hunger += local_terrain.move_time;
    game.data.thirst += local_terrain.move_time;
    game.data.fatigue += local_terrain.move_time;

    // some effects (e.g., weather report) only happen on the turn when the
    // player first enters a room (see endTurn2)
    game.data.just_entered_room = true;
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

    // effects that happen when the player just entered a room
    if (game.data.just_entered_room) {
      game.data.just_entered_room = false;
      // weather
      let weather_effect = 0;
      const local_terrain = terrain_data[game.rooms.current_room.data.env];
      if (local_terrain.weather_effects && game.diceRoll(1,2) === 2) {
        game.effects.print(game.getRandomElement(local_terrain.weather_effects));
      }
      // king raulos
      if (game.monsters.get(3).isHere()) {
        if (game.monsters.get(34).isHere() && !game.data.raulos_zorag) {
          // zorag here
          game.effects.print(92);
          game.monsters.get(3).reaction = Monster.RX_HOSTILE;
          game.data.raulos_zorag = true;
          [35,36,37].forEach(id => game.monsters.get(id).moveToRoom());  // golems
        } else if (game.monsters.get(34).status === Monster.STATUS_DEAD && !game.data.raulos_zorag) {
          game.effects.print(89);
          game.die();
        } else if (!game.data.got_quest) {
          game.effects.print(10);
          game.data.got_quest = true;
        } else {
          game.effects.print(87);
        }
      }
    }

    // cold weather
    if (game.player.room_id >= 41 && game.player.room_id <= 43 && !game.player.isWearing(9)) {
      game.effects.print(47);
      game.player.injure(10, true);
    }

    // region hunger/thirst/fatigue
    let status_messages = [];
    if (game.data.hunger > 100) {
      const food_sources = game.player.inventory.filter(a => isFoodSource(a))
      if (food_sources.length) {
        const chosen_source = food_sources[0];
        game.history.write(`You are getting hungry from traveling. You eat some of the ${chosen_source.name}.`);
        game.data.hunger = 0;
        chosen_source.quantity--;
        if (chosen_source.quantity === 0) {
          // FIXME: handle plurals
          game.history.write(`The ${chosen_source.name} is all gone!`)
        }
        if (food_sources.map(a => a.quantity).reduce((sum, a) => sum + a) < 3) {
          game.history.write('You are running low on food.');
        }
      } else {
        if (game.data.hunger > 150) {
          game.history.write("You are wracked with hunger! You must eat soon or starve to death!", 'warning');
          game.player.injure(game.diceRoll(1, 4), true);
          status_messages.push('starving');
        } else {
          game.history.write("You are getting hungry, and you are out of food!");
        }
      }
    }

    if (game.data.thirst > 75) {
      const water_sources = game.player.inventory.filter(a => isWaterSource(a));
      if (water_sources.length) {
        const chosen_source = water_sources[0];
        game.history.write(`You are getting thirsty from traveling. You drink from the ${chosen_source.name}.`);
        game.data.thirst = 0;
        if (chosen_source.quantity === 0) {
          game.history.write(`The ${chosen_source.name} is empty!`)
        }
        if (water_sources.map(a => a.quantity).reduce((sum, a) => sum + a) < 5) {
          game.history.write('You are running low on water.');
        }
      } else {
        if (game.data.thirst > 100) {
          game.history.write("You are dehydrated! You must find water soon!", 'warning');
          game.player.injure(game.diceRoll(1, 4), true);
          status_messages.push('dehydrated');
        } else {
          game.history.write("You are getting thirsty, and your canteens are all empty!");
        }
      }
    }

    if (game.data.fatigue > 300) {
      game.history.write("You are exhausted! Your agility is impaired until you rest.");
      status_messages.push('tired');
      game.player.agility -= 1;  // Note: temporary only
    } else if (game.data.fatigue > 270) {
      game.history.write("You are getting tired. You must make camp soon.");
    }

    game.player.status_message = status_messages.join(', ');
    // endregion

    // display items for sale
    // TODO: move this to core
    let for_sale = game.artifacts.all.filter(a => a.data.for_sale && a.monster_id && game.monsters.get(a.monster_id).isHere());
    if (for_sale.length) {
      game.history.write("Items for sale here: " + for_sale.map(a => a.name).join(', '));
    }

  },

  "afterBuy": function(artifact: Artifact, seller: Monster) {
    // lamp oil, rations: there are two copies of these artifacts, one that the
    // player carries ("primary") and one that always stays in the shopkeeper's
    // inventory ("refill"), allowing the player to buy more.
    const refill_map = {
      4: 22,
      6: 7
    };
    for (let [refill_id, primary_id] of Object.entries(refill_map)) {
      if (artifact.id === parseInt(refill_id)) {
        if (!game.player.hasArtifact(primary_id)) {
          game.artifacts.get(primary_id).moveToInventory();
          game.artifacts.get(primary_id).seen = true;
        }
        game.artifacts.get(primary_id).quantity += artifact.quantity;
        artifact.moveToInventory(1);
        artifact.data.for_sale = true;
        game.player.updateInventory();
        seller.updateInventory();
      }
    }
  },

  "eat": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.data.role === 'food') {
        game.data.hunger = 0;
      }
    }
  },

  "drink": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.data.role === 'water') {
        game.data.thirst = 0;
      }
    }
  },

  "look": function(arg: string) {
    let artifact = game.artifacts.getLocalByName(arg, false);
    if (artifact && artifact.type === Artifact.TYPE_DEAD_BODY) {
      // console.log(artifact, artifact.data)
      if (artifact.data.hidden_artifact) {
        game.artifacts.get(artifact.data.hidden_artifact).moveToRoom();
        delete artifact.data.hidden_artifact;
        if (artifact.data.reveal_effect) {
          game.effects.print(artifact.data.reveal_effect);
        } else {
          game.history.write('You found something!');
        }
      } else {
        game.history.write("Creepy! You don't find anything special.");
      }
      return false;
    }
    return true;
  },

  "afterOpen": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 32 && !game.effects.get(62).seen) {
      // vampire
      game.effects.print(62);
      game.monsters.get(8).moveToRoom();
    }
  },

  "specialPut": function(arg: string, item: Artifact, container: Artifact) {
    if (item.id === 7 && container.id === 1) {
      // 'put lamp oil into lantern' == 'fill lantern'
      game.command_parser.run('fill lantern', false);
      return false;   // skips the rest of the "put" logic
    }
    return true;
  },

  // region combat

  "attackMonster": function(arg: string, target: Monster) {
    if ([7,11,12,13,34].indexOf(target.id) !== -1 && target.reaction === Monster.RX_FRIEND) {
      throw new CommandException("It is not wise to attack a member of your Fellowship!");
    }
    return true;
  },

  // endregion

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


export function isFoodSource(artifact: Artifact) {
  if (!artifact.data || !artifact.data.role) {
    return false;
  }
  return artifact.data.role === 'food';
}

export function isWaterSource(artifact: Artifact) {
  if (!artifact.data || !artifact.data.role) {
    return false;
  }
  return artifact.data.role === 'water';
}
