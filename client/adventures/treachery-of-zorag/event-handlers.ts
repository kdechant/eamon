import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {terrain_data, talk_data} from "./custom-data";
import {CommandException} from "../../core/utils/command.exception";

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
      hunger: 0,
      thirst: 0,
      fatigue: 0,
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

    // hunger/thirst/fatigue counters
    const local_terrain = terrain_data[game.rooms.current_room.data.env];
    game.data.hunger += local_terrain.move_time;
    game.data.thirst += local_terrain.move_time;
    game.data.fatigue += local_terrain.move_time;
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

    // weather
    let weather_effect = 0;
    const local_terrain = terrain_data[game.rooms.current_room.data.env];
    if (local_terrain.weather_effect) {
      game.effects.print(game.getRandomElement(local_terrain.weather_effect));
    }

    // hunger/thirst/fatigue effects
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
        } else {
          game.history.write("You are getting thirsty, and your canteens are all empty!");
        }
      }
    }

    if (game.data.fatigue > 300) {
      game.history.write("You are exhausted! Your weapon abilities are impaired until you rest.");
    } else if (game.data.fatigue > 270) {
      game.history.write("You are getting tired. You must make camp soon.");
    }

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
