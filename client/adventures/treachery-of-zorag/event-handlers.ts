import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {terrain_data, talk_data, event_triggers, triggered_events} from "./custom-data";
import {CommandException} from "../../core/utils/command.exception";
import {BuyCommand} from "../../core/commands/optional-commands";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var event_handlers = {

  "start": function() {
    game.show_exits = true;

    // uses custom exit prompt
    game.exit_prompt = false;

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
      auto_exit: false,
      auto_lantern: false,
      got_quest: false,
      exited_hall: false,
      hunger: 0,
      thirst: 0,
      fatigue: 0,
      original_ag: game.player.agility,
      summoned_tealand: false,
      raulos_zorag: false,
      triggered_events: triggered_events,  // includes them in the saved game
    }

    // unpack monster talk data into monster
    game.monsters.all.forEach(monster => {
      let words = talk_data.filter(d => d.monster === monster.id);
      if (words.length) {
        monster.data.talk = words;
        monster.data.talk.forEach(t => t.said = false);
      }
    });
  },

  "specialMove": function(arg, exit) {
    // stray off path in swamp
    if (!exit && game.player.room_id >= 161 && game.player.room_id <= 189) {
      game.effects.print(52);
      game.delay(3);
      if (game.player.rollSavingThrow('agility', 8)) {
        game.effects.print(53);
      } else {
        game.effects.print(54);
        game.die(false);
      }
      return false;
    }
    // sandeer / scroll logic - before checking whether the door blocks the way
    let sandeer = game.monsters.get(13);
    if (exit && exit.door_id === 51 && !game.artifacts.get(51).is_open && sandeer.isHere() && sandeer.hasArtifact(52)) {
      game.effects.print(117);
      game.artifacts.get(51).open();
    }
    return true;
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
    // custom exit prompt
    if (exit.room_to === RoomExit.EXIT || game.data.auto_exit) {
      let text = game.monsters.get(3).isAlive() ?
        'You have not succeeded in your quest! Do you still want to leave this adventure?' :
        'You have succeeded in your quest! Leave this adventure?';
      game.modal.confirm(text, answer => {
        if (answer === 'Yes') {
          game.effects.print(140);
          game.exit();
        } else {
          // no more convenient way out; player must walk to start to leave.
          if (game.data.auto_exit) {
            game.history.write("You decide to continue exploring. When you're ready to leave, you'll need to take the King's Road you used to get here.");
            game.data.auto_exit = false;
            game.command_parser.run(exit.direction, false);
          } else {
            game.history.write('You turn around and stay here.');
          }
        }
      });
      return false;
    }
    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    // can't take booze out of bar
    if (room_from.id === 77) {
      game.artifacts.all.filter(
        a => a.id >= 66 && a.id <= 69).forEach(a => a.moveToInventory(39));
    } else if (room_from.id === 76) {
      game.artifacts.get(65).moveToInventory(40);
    }

    // hunger/thirst/fatigue counters
    const local_terrain = terrain_data[game.rooms.current_room.data.env];
    game.data.hunger += local_terrain.move_time;
    game.data.thirst += local_terrain.move_time;
    game.data.fatigue += local_terrain.move_time;

    // lantern management
    let lantern = game.artifacts.get(1);
    if (room_to.is_dark && !lantern.is_lit && lantern.quantity > 0 && game.data.auto_lantern) {
      game.history.write("You light the lantern before proceeding into the dark.")
      lantern.is_lit = true;
    }
    if (!room_to.is_dark && lantern.is_lit) {
      game.history.write("You leave the darkness and emerge into the natural light. You put out the lantern to save fuel.")
      game.data.auto_lantern = true;
      lantern.is_lit = false;
    }

    // some effects (e.g., weather report) only happen on the turn when the
    // player first enters a room (see endTurn2)
    game.data.just_entered_room = true;

    // triggered events when monster follows player
    let enter_events = game.data.triggered_events.filter(
      e => e.room === room_from.id && e.type === 3 && e.triggered !== 1 &&
      game.monsters.get(e.monster).isHere());
    for (let e of enter_events) {
      game.effects.print(e.effect);
      if (e.triggered === 0) {
        e.triggered = 1;
      }
    }
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
      weatherReport();
      // king raulos
      if (game.monsters.get(3).isHere()) {
        if (game.monsters.get(34).isHere() && !game.data.raulos_zorag) {
          // zorag here
          game.effects.print(92);
          game.monsters.get(3).reaction = Monster.RX_HOSTILE;
          game.data.raulos_zorag = true;
          // golems
          [35,36,37].forEach(id => {
            game.monsters.get(id).showDescription();
            game.monsters.get(id).moveToRoom();
          });
          game.monsters.updateVisible();
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

    // triggered events on entering room
    const inTheDark = game.rooms.current_room.is_dark && !game.artifacts.isLightSource();
    if (!inTheDark) {
      let enter_events = game.data.triggered_events.filter(e => e.room === game.player.room_id &&
        e.type === 0 && e.triggered !== 1 &&
        (e.monster === 0 || game.monsters.get(e.monster).isHere()));
      for (let e of enter_events) {
        game.effects.print(e.effect);
        // The 'enter room' triggered event can optionally have a door to open
        // or an artifact that is given to the player.
        if (e.hasOwnProperty('door')) {
          game.artifacts.get(e.door).open();
        }
        if (e.hasOwnProperty('received_artifact')) {
          game.artifacts.get(e.received_artifact).moveToInventory();
        }
        if (e.triggered === 0) {
          e.triggered = 1;
        }
      }
    }

    let not_wearing_effects = game.data.triggered_events.filter(e => e.room === game.player.room_id && e.type === 4 && e.triggered !== 1 && !game.player.isWearing(e.artifact));
    if (not_wearing_effects.length) console.trace();
    for (let e of not_wearing_effects) {
      game.effects.print(e.effect);
      if (e.triggered === 0) {
        e.triggered = 1;
      }
    }

    // cold weather
    if (game.player.room_id >= 41 && game.player.room_id <= 43 && !game.player.isWearing(9)) {
      game.effects.print(47);
      game.player.injure(10, true);
      // TODO: make this damage amount increase each time, so you can't just tough it out
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
      game.player.agility = Math.max(1, game.player.agility - 1);  // Note: temporary only
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

    // Buy a drink and barkeep will now talk about Tealand the Druid
    if (artifact.id >= 66 && artifact.id <= 69) {
      seller.data.talk.forEach(t => t.ignore = 0);
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
      if (artifact.data.role === 'water source') {
        game.history.write("Try filling your canteen or waterskin with it.")
        return false;
      }
      if (artifact.data.role === 'water') {
        game.data.thirst = 0;
      }
      if (artifact.id >= 65 && artifact.id <= 69) {
        game.history.write('Gulp! This stuff is real rotgut but better than the swill served at the Guild.')
        game.data.thirst = 0;
      }
    }
  },

  "beforeFree": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 50) {
      if (game.monsters.get(38).isHere()) {
        game.effects.print(112);
        return false;
      } else if (!game.player.hasArtifact(49)) {
        game.effects.print(110);
        return false;
      } else if (!game.artifacts.get(49).data.active) {
        game.effects.print(129);
        if (game.monsters.get(13).isHere()) {
          game.effects.print(130);
        }
        return false;
      } else {
        game.effects.print(113);  // works
        game.history.suppressNextMessage = true;  // prevent "you free it..." message
      }
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    if (artifact && artifact.id === 2 && game.player.room_id === 141) {
      game.rooms.get(141).removeExit('d');
      game.rooms.get(143).removeExit('u');
    }
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    // seer / cauldron
    if (recipient.id === 9 && artifact.id === 28) {
      game.effects.print(60);
      recipient.data.talk.forEach(t => t.ignore = 0);
    }
    // sandeer / scroll
    if (recipient.id === 13 && artifact.id === 52) {
      game.effects.print(116);
    }
    return true;
  },

  "giveGold": function(arg: string, gold_amount: number, recipient: Monster) {
    // this adventure doesn't let you hire NPCs as mercenaries
    if (gold_amount >= 5000) {
      game.history.write("Don't go flashing that kind of money around here!");
      return false;
    }
  },

  "look": function(arg: string) {
    let artifact = game.artifacts.getLocalByName(arg, false);
    if (artifact && artifact.type === Artifact.TYPE_DEAD_BODY) {
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

  "beforeOpen": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 51 && !artifact.is_open) {
      let sandeer = game.monsters.get(13);
      if (artifact.id === 51 && sandeer.isHere() && sandeer.hasArtifact(52)) {
        game.effects.print(117);
        game.artifacts.get(51).open();
        return false;  // bypass normal door logic
      }
    }
    return true;
  },

  "afterOpen": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 32 && !game.effects.get(62).seen) {
      // vampire
      game.effects.print(62);
      game.monsters.get(8).moveToRoom();
      game.skip_battle_actions = true;
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

  "beforeSay": function (arg) {
    arg = arg.toLowerCase();
    let orb = game.artifacts.get(19);
    if (arg === 'tealand' && game.player.room_id === 32 && !game.data.summoned_tealand) {
      game.effects.print(44);
      game.monsters.get(7).moveToRoom();
      game.data.summoned_tealand = true;
      return false;
    }
    // talking to a specific monster (e.g., 'say hello to boris')
    let target = '';
    if (arg.indexOf(' to ') !== -1) {
      [arg, target] = arg.split(' to ');
      game.command_parser.run(`talk to ${target} about ${arg}`, false);
      return false;
    }
    return true;
  },

  "afterTalk": function(monster: Monster, subject: string, word: any) {
    if (monster.id === 4 && (word.effect === 14 || word.effect === 16)) {
      game.history.flush();
      game.modal.confirm('Do you join Boris to search for the treasure?', answer => {
        if (answer.toLowerCase() === 'yes') {
          game.effects.print(17);
          game.monsters.get(4).reaction = Monster.RX_FRIEND;
        }
      });
    }
  },

  // region combat

  "attackMonster": function(arg: string, target: Monster) {
    if ([7,11,12,13,34].indexOf(target.id) !== -1 && target.reaction === Monster.RX_FRIEND) {
      throw new CommandException("It is not wise to attack a member of your Fellowship!");
    }
    // tree spirit
    if (target.id === 6) {
      game.effects.print(29);
      return false;
    }
    return true;
  },

  "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
    // no one but zorag can hit raulos
    if (attacker.id !== 34 && defender.id === 3) {
      return 0;
    }
    // no one can hit tree spirit
    if (defender.id === 6) {
      return 0;
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    // raulos
    if (target.id === 3) {
      game.effects.print(98);
      return false;
    }
    // tree spirit
    if (target.id === 6) {
      game.effects.print(30);
      return false;
    }
    return true;
  },

  "death": function(monster: Monster) {
    // triggered effects on monster death
    let effects = triggered_events.filter(e =>
      e.monster === monster.id && e.type === event_triggers.MONSTER_DIES);
    effects.forEach(e => {
      if (e.other_monster) {
        // Effect when an "other" monster sees this monster die
        if (game.monsters.get(e.other_monster).isHere()) {
          game.effects.print(e.effect);
          // This currently also removes the "other" monster from the game.
          // (This is a specific use case for the Boris sub-quest)
          game.monsters.get(e.other_monster).destroy();
        }
      }
    });
    // Raulos
    if (monster.id === 3) {
      game.effects.print(138);
      if ([35, 36, 37].some(id => game.monsters.get(id).isHere())) {
        [35, 36, 37].forEach(id => game.monsters.get(id).destroy());
        game.effects.print(139);
      }
      game.effects.print(93);
      [7, 11, 12, 13].forEach(id => game.monsters.get(id).destroy());
      // The player can exit by following any normal exit from the current room.
      // This allows the player to pick up items before leaving.
      game.data.auto_exit = true;
    }
    return true;
  },

  "flee": function(arg: string, exit: RoomExit) {
    if (game.monsters.get(6).isHere()) {  // tree spirit
      if (arg === 'e' || arg === 'east') {
        game.history.write("The tree spirit blocks your way!");
        return false;
      }
      if (!arg) {
        game.player.moveToRoom(29);  // always flee west
        game.skip_battle_actions = true;
        return false;
      }
    }
    return true;
  },

  "miss": function(attacker: Monster, defender: Monster) {
    // special messages when you miss Raulos
    if (defender.id === 3 && attacker.id !== 34) {
      game.effects.print(97 + game.diceRoll(1, 3), 'special2 no-space');
      // zorag tells you not to attack raulos
      if (attacker.id === Monster.PLAYER && game.monsters.get(34).isHere() && !game.effects.get(97).seen) {
        game.effects.print(97);
      }
      return false;
    }
    return true;
  },

  "monsterAction": function(monster: Monster) {
    // Raulos has 30% chance to summon golems.
    if (monster.id === 3) {
      // monsters he can summon (excluding ones already in the room)
      const summonables = [35, 36, 37].map(id => game.monsters.get(id)).filter(m => !m.isHere());
      if (summonables.length && game.diceRoll(1, 10) >= 8) {
        let monster = game.getRandomElement(summonables);
        monster.moveToRoom();
        game.effects.print(monster.id + 70);
        return false;  // skip normal moves
      }
    }
    return true;
  },

  "chooseTarget": function (attacker, defender): Monster {
    // zorag always attacks raulos if they're together
    if (attacker.id === 34 && game.monsters.get(3).isHere()) {
      return game.monsters.get(3);
    }
    return defender;
  },

  // endregion

  "use": function(arg: string, artifact: Artifact) {
    if (artifact.isHere()) {
      switch (artifact.id) {
        case 2:  // rope
          if (game.player.room_id === 141) {
            if (game.rooms.current_room.getExit('d')) {
              throw new CommandException("The rope is already in place.");
            }
            game.effects.print(9);
            artifact.moveToRoom();
            game.rooms.current_room.createExit('d', 143);
            game.rooms.get(143).createExit('u', 141);
          } else {
            throw new CommandException('Not much use for a rope here.');
          }
          break;
        case 14:  // wand of warding
          game.modal.show('Point at whom?', answer => {
            let target = game.monsters.getLocalByName(answer);
            if (!target) {
              game.history.write('Nobody here by that name!');
            } else if (target.id === 6) {
              game.effects.print(31);
              target.destroy();
            } else {
              game.effects.print(32);
            }
          });
          break;
      }
    }
  },

  "power": function(roll) {
    // Activate stone
    let stone = game.artifacts.get(49);
    if (stone.isHere() && !stone.data.active && game.artifacts.get(50).isHere()) {
      stone.data.active = true;
      stone.inventory_message = "glowing";
      game.effects.print(131);
    }
    if (terrain_data[game.rooms.current_room.data.env].weather_effects) {
      weatherReport();
    } else if (game.rooms.current_room.data.env === 'dungeon') {
      game.history.write('Strange lights flicker through the hallways and disappear.');
    } else {
      game.history.write('You hear a loud sonic boom which echoes all around you!');
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

/**
 * Prints the weather report (used in outdoor areas)
 */
function weatherReport() {
  let weather_effect = 0;
  const local_terrain = terrain_data[game.rooms.current_room.data.env];
  if (local_terrain.weather_effects && game.diceRoll(1,2) === 2) {
    game.effects.print(game.getRandomElement(local_terrain.weather_effects));
  }
}
