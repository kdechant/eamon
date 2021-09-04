import * as pluralize from 'pluralize';
import {BaseCommand} from "./base-command";
import Game from "../models/game";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";
import {RoomExit} from "../models/room";
import {CommandException} from "../utils/command.exception";
import {ModalQuestion} from "../models/modal";
import {formatMonsterAction} from "../utils";

declare let game: Game;

export const core_commands = [];

export class MoveCommand implements BaseCommand {
  name = "move";
  verbs: string[] = ["north", "n", "south", "s", "east", "e", "west", "w",
    "up", "u", "down", "d",
    "northeast", "ne", "southeast", "se", "southwest", "sw", "northwest", "nw"];
  category = "movement";
  description = "Moves in a direction";
  examples: string[] = [
    'N - Go to the North',
    'S - Go to the South',
    'Note: The diagonal directions (NE, SE, SW, NW) only work in some adventures.'
  ];
  directions: { [key: string]: string; } = {
    "north": "n",
    "northeast": "ne",
    "east": "e",
    "southeast": "se",
    "south": "s",
    "southwest": "sw",
    "west": "w",
    "northwest": "nw",
    "up": "u",
    "down": "d",
  };

  /**
   * Alters the display in the history window
   * @param {string} verb
   */
  history_display(verb) {
    // turn short words ("n") into long ("north")
    for (const d in this.directions) {
      if (this.directions[d] === verb) {
        return d;
      }
    }
    return verb;
  }

  run(verb, arg) {

    // turn long words ("north") into short ("n")
    if (this.directions.hasOwnProperty(verb)) {
      verb = this.directions[verb];
    }

    const room_from = game.rooms.current_room;
    const exit = game.rooms.current_room.getExit(verb);
    let msg: string;

    if (!game.triggerEvent('specialMove', arg, exit)) return;

    if (exit === null) {
      throw new CommandException("You can't go that way!");
    }
    if (!exit.room_to && exit.effect_id) {
      throw new CommandException(game.effects.get(exit.effect_id).text);
    }

    // hostile monsters prevent the player from moving
    if (game.in_battle) {
      throw new CommandException("You can't do that with unfriendlies about!");
    }

    // check if there is a door or gate blocking the way
    if (exit.door_id) {
      const door = game.artifacts.get(exit.door_id);

      // sometimes doors get moved or blown up, so check if the door is still there
      if (door.room_id === room_from.id) {

        // if it's a hidden or secret door, the exit is blocked even if the door's "open" flag is set.
        // show the normal "you can't go that way" message here, to avoid giving away secret door locations
        if (door.hidden) {
          throw new CommandException("You can't go that way!");
        }

        if (door.embedded) {
          door.reveal();
        }

        // try to unlock the door using a key the player is carrying
        if (!door.is_open && door.key_id && game.player.hasArtifact(door.key_id)) {
          const key = game.artifacts.get(door.key_id);
          game.history.write("You unlock the " + door.name + " using the " + key.name + ".");
          door.open();
        }

        if (!door.is_open) {
          throw new CommandException("The " + door.name + " blocks your way!");
        }

      }
    }

    // monsters never fight during the turn when a player moves to a new room.
    game.skip_battle_actions = true;

    if (game.triggerEvent("beforeMove", arg, game.rooms.current_room, exit)) {
      if (exit.room_to === RoomExit.EXIT || exit.room_to === RoomExit.EXIT_SILENT) {
        if (game.exit_prompt) {
          // leaving the adventure
          game.modal.confirm("Leave this adventure?",
            answer => {
              if (answer === 'Yes') {
                if (exit.room_to === RoomExit.EXIT) {
                  game.history.write(game.exit_message);
                }
                game.exit();
              }
            });
          return;
        } else {
          if (exit.room_to === RoomExit.EXIT) {
            game.history.write(game.exit_message);
          }
          game.exit();
        }
      } else {
        const room_to = game.rooms.getRoomById(exit.room_to);
        if (room_to) {
          if (exit.effect_id) {
            game.effects.print(exit.effect_id);
          }
          game.player.moveToRoom(room_to.id, true);

          game.triggerEvent("afterMove", arg, room_from, room_to);
        } else {
          // oops, broken connection
          console.error("Tried to move to non-existent room #" + exit.room_to);
          game.history.write("You can't go that way!");
        }
      }
    }
  }
}
core_commands.push(new MoveCommand());


export class LookCommand implements BaseCommand {
  name = "look";
  verbs: string[] = ["look", "examine"];
  category = "miscellaneous";
  description = "Inspects a room, artifact, or monster. Can often be used to find hidden items in rooms.";
  examples: string[] = [
    'LOOK - Show the description of the current room',
    'LOOK TORCH - Show the description of an artifact',
    'LOOK WALL - If the room description mentions something odd about a wall (or a rock, tapestry, throne, etc.) and you think there might be a secret item or door, this might find it.',
    'LOOK EDDIE - Shows the description of a monster or NPC named Eddie, and his health status.'
  ];
  run(verb, arg) {

    // look event. can be used to reveal secret doors, etc.
    if (!game.triggerEvent("look", arg)) {
      return;
    }

    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource()) {
      // can't look at anything if it's dark.
      return;
    }

    if (arg === "") {
      // if not looking at anything in particular, show the room description
      game.rooms.current_room.show_description();
    } else {
      // looking at a specific thing.

      let match = false;

      // see if there is a matching artifact. (don't reveal yet - or we would see the description twice)
      const a: Artifact = game.artifacts.getLocalByName(arg, false);
      if (a) {
        match = true;

        // either reveal or show the description if already known about.
        // this prevents the description being shown twice when revealing.
        if (a.embedded) {
          a.reveal();
        } else {
          game.history.write(a.description);
        }

        // Reveal artifacts "hidden" in this artifact - e.g., a ring on a dead body, etc.
        // This only applies to artifacts that are not containers. To set up this effect,
        // give the "contained" item a "container_id" of another artifact that is not a
        // container (see Temple of Ngurct fireball wand for example)
        // Note: This currently doesn't work to reveal secret doors, because they must be
        // in the room for normal room exit logic to work. Use a 'look' event handler for those.
        a.updateContents(true); // override the container logic to have contents of any artifact type, just for this logic
        if (a.type !== Artifact.TYPE_CONTAINER && a.contents.length > 0) {
          game.history.write("You found something!");
          for (const item of a.contents) {
            item.moveToRoom();
          }
        }

        // display quantity for food, drinks, and light sources
        if (a.type === Artifact.TYPE_EDIBLE || a.type === Artifact.TYPE_DRINKABLE) {
          let noun = a.type === Artifact.TYPE_EDIBLE ? "bite" : "swallow";
          if (a.quantity === 1) {
            verb = "is";
          } else {
            verb = "are";
            noun += "s";
          }
          game.history.write("There " + verb + " " + a.quantity + " " + noun + " remaining.");
        }
        if (a.type === Artifact.TYPE_LIGHT_SOURCE) {
          if (a.quantity >= 25 || a.quantity === -1) {
            game.history.write("It has a lot of fuel left.");
          } else if (a.quantity >= 10) {
            game.history.write("It has some fuel left.");
          } else if (a.quantity > 0) {
            game.history.write("It is low on fuel.");
          } else {
            game.history.write("It is out of fuel.");
          }
        }
      }

      // see if there is a matching monster.
      const m = game.monsters.getLocalByName(arg);
      if (m) {
        match = true;
        if (m.id === Monster.PLAYER) {
          game.history.write("You see yourself.");
        } else {
          game.history.write(m.description);
          m.printInventory();
        }
        m.showHealth();
      }

      // error message if nothing matched
      if (!match) {
        const common_stuff = ["wall", "door", "floor", "ceiling", "road", "path", "trail", "window"];
        if (arg === 'sign' && game.rooms.current_room.description.indexOf('sign') !== -1) {
          // generic sign which is not really readable. we can pretend.
          game.rooms.current_room.show_description();
        } else if (common_stuff.indexOf(arg) !== -1 || game.rooms.current_room.textMatch(arg)) {
          game.history.write("You see nothing special.");
        } else {
          throw new CommandException("I see no " + arg + " here!");
        }
      }

    }
  }
}
core_commands.push(new LookCommand());


export class SayCommand implements BaseCommand {
  name = "say";
  verbs: string[] = ["say"];
  category = "interactive";
  description = "Allows you to say a word or phrase, like a magic word or something you might say to an NPC.";
  examples: string[] = ['SAY OPEN SESAME'];
  run(verb, arg) {

    if (arg !== "") {
      if (game.triggerEvent("beforeSay", arg)) {
        game.history.write("Ok... \"" + arg + "\"");
      }

      // debugging mode
      if (arg === "bort") {
        game.history.write("You feel a sudden power, like you can see inside the Matrix.")
        game.data["bort"] = true;
      }

      game.triggerEvent("say", arg);
    } else {
      game.modal.show("Say what?", function(value) {
        game.command_parser.run("say " + value);
      });
    }
  }
}
core_commands.push(new SayCommand());


export class GetCommand implements BaseCommand {
  name = "get";
  verbs: string[] = ["get"];
  category = "artifact manipulation";
  description = "Picks something up.";
  examples: string[] = [
    'GET GOLD COINS',
    'GET GO - Same as GET GOLD COINS, with partial word matching',
    'GET ALL - Tries to pick up everything in the room. This command will ignore some items, like dead bodies, but you can pick those up individually if you want.'
  ];
  run(verb: string, arg: string) {

    arg = arg.toLowerCase();
    let match = false;

    // the "specialGet" event handler is used for logic when getting something that wouldn't normally be gettable
    // like an artifact that's in a different room but is visible in the distance. (See Sword of Inari)
    if (game.triggerEvent('specialGet', arg)) {

      for (const a of game.artifacts.inRoom) {
        if (a.match(arg) || arg === "all") {
          match = true;
          if (arg === "all" && (a.get_all === false || a.embedded)) {
            continue;
          }

          if (game.triggerEvent("beforeGet", arg, a)) {

            // if it's a disguised monster, reveal it
            if (a.type === Artifact.TYPE_DISGUISED_MONSTER) {
              a.revealDisguisedMonster();
              continue;
            }

            // if it's an embedded artifact, reveal it
            if (a.embedded) {
              a.reveal();
            }

            // a monster is guarding it
            if (a.guard_id) {
              const guard = game.monsters.get(a.guard_id);
              if (guard.isHere()) {
                if (arg === 'all') {
                  continue;
                } else {
                  throw new CommandException(guard.getDisplayName() + " won't let you!");
                }
              }
            }

            // weights of >900 and -999 indicate items that can't be gotten.
            if (arg === "all" && (a.weight > 900 || a.weight === -999)) {
              continue;
            }
            if (a.weight > 900) {
              throw new CommandException("Don't be absurd.");
            }
            if (a.weight === -999) {
              throw new CommandException("You can't get that.");
            }
            if (a.type === Artifact.TYPE_BOUND_MONSTER) {
              if (arg === 'all') {
                game.history.write(a.name + " can't be picked up.");
                continue;
              }
              throw new CommandException("You can't get that.");
            }

            if (game.player.weight_carried + a.weight <= game.player.maxWeight()) {
              game.player.pickUp(a);
              const style = arg === 'all' ? "no-space" : '';
              if (a.type === Artifact.TYPE_GOLD) {
                game.history.write(a.name + " is added to your coin pouch.", style);
                game.player.gold += a.value;
                a.destroy();
              } else {
                game.history.write(a.name + " taken.", style);
              }
              game.triggerEvent("afterGet", arg, a);

              // if in battle and player has no weapon ready, ready it
              if (game.in_battle && a.is_weapon && game.player.weapon_id === null) {
                if (a.hands === 1 || !game.player.isUsingShield()) {
                  game.player.ready(a);
                  game.history.write("Readied.");
                }
              }
            } else {
              game.history.write(a.name + " is too heavy.");
            }
          }
        }
      }

      // artifact in container
      if (!match) {
        const art = game.artifacts.getByName(arg);
        if (art && art.container_id !== null) {
          const container = game.artifacts.get(art.container_id);
          if (container.monster_id === Monster.PLAYER) {
            throw new CommandException("You're already carrying it. But you could REMOVE it from the " + container.name + ".");
          } else if (container.room_id === game.player.room_id && !container.embedded) {
            if (game.triggerEvent("beforeGet", arg, art)) {
              game.command_parser.run('remove ' + arg + ' from ' + container.name, false);
              game.triggerEvent("afterGet", arg, art);
            }
            return;
          }
        }
      }

      // message if nothing was taken
      if (!match && arg !== "all") {

        // catch user mischief
        if (game.monsters.getLocalByName(arg)) {
          throw new CommandException("I can't get that.");
        }

        throw new CommandException("I see no " + arg + " here!");
      }
    }
  }
}
core_commands.push(new GetCommand());


export class RemoveCommand implements BaseCommand {
  name = "remove";
  verbs: string[] = ["remove"];
  category = "artifact manipulation";
  description = "Has two uses: To remove an item from a container, or to take off an article of clothing or armor.";
  examples: string[] = [
    "REMOVE JEWEL FROM CHEST - Removes an item from a container, and adds it to your character's inventory",
    'REMOVE PLATE ARMOR - Takes off a wearable item, for example if you wanted to put on a different armor.'
  ];
  run(verb: string, arg: string) {

    // check if we're removing something from a container
    const regex_result = /(.+) from (.*)/.exec(arg);
    if (regex_result !== null) {
      const item_name: string = regex_result[1];
      const container_name: string = regex_result[2];

      // look for a container artifact and see if we can remove the item from it
      const container: Artifact = game.artifacts.getLocalByName(container_name);
      if (container) {
        if (container.type === Artifact.TYPE_CONTAINER) {
          if (container.is_open) {
            const item: Artifact = container.getContainedArtifact(item_name);
            if (item) {
              if (game.triggerEvent("beforeRemoveFromContainer", arg, item, container)) {
                if (!item.seen) {
                  game.history.write(item.description);
                  item.seen = true;
                }

                // a monster is guarding it
                if (item.guard_id !== null && item.guard_id !== 0) {
                  const guard = game.monsters.get(item.guard_id);
                  if (guard.isHere()) {
                    throw new CommandException(guard.getDisplayName() + " won't let you!");
                  }
                }

                if (item.type === Artifact.TYPE_GOLD) {
                  game.history.write(`You add the ${item.name} to your coin pouch.`);
                  game.player.gold += item.value;
                  item.destroy();
                } else {
                  game.history.write(item.name + " removed from " + container.name + ".");
                  item.removeFromContainer();
                }
                game.triggerEvent("afterRemoveFromContainer", arg, item, container);
              }
            } else {
              throw new CommandException("There is no " + item_name + " inside the " + container_name + "!");
            }
          } else {
            // fixme: this lets you guess what's in a closed container
            throw new CommandException("Try opening the " + container_name + " first.");
          }
        } else {
          throw new CommandException("I can't remove things from the " + container_name + "!");
        }
      } else {

        // catch user mischief
        const m: Monster = game.monsters.getLocalByName(container_name);
        if (m) {
          throw new CommandException("I can't remove something from " + m.name + "!");
        }

        throw new CommandException("I see no " + container_name + " here!");
      }

    } else {
      // taking off an item of clothing or gear
      let artifact = game.player.inventory.filter(a => a.is_worn).find(x => x.match(arg));
      if (!artifact) {
        artifact = game.player.findInInventory(arg);
      }
      if (artifact) {
        if (artifact.is_worn) {
          if (game.triggerEvent("beforeRemoveWearable", arg, artifact)) {
            game.player.remove(artifact);
            game.history.write("You take off the " + artifact.name + ".");
            game.triggerEvent("afterRemoveWearable", arg, artifact);
          }
        } else {
          throw new CommandException("You aren't wearing it!");
        }
      } else {
        throw new CommandException("You aren't carrying a " + arg + "!");
      }

    }

  }
}
core_commands.push(new RemoveCommand());


export class PutCommand implements BaseCommand {
  name = "put";
  verbs: string[] = ["put"];
  category = "artifact manipulation";
  description = "Places an item into a container.";
  examples: string[] = [
    "PUT SWORD INTO SCABBARD",
  ];
  run(verb: string, arg: string) {

    let match = false;

    // check if we're putting something into a container
    const regex_result = /(.+) in(to)? (.*)/.exec(arg);
    if (regex_result !== null) {
      const item_name: string = regex_result[1];
      const container_name: string = regex_result[3];

      // catch user mischief
      let m: Monster = game.monsters.getLocalByName(item_name);
      if (m) {
        throw new CommandException("I can't put " + m.name + " into something!");
      }
      m = game.monsters.getLocalByName(container_name);
      if (m) {
        throw new CommandException("I can't put something into " + m.name + "!");
      }

      const item: Artifact = game.artifacts.getLocalByName(item_name);
      if (!item) {
        throw new CommandException("I see no " + item_name + " here!");
      }
      const container: Artifact = game.artifacts.getLocalByName(container_name);
      if (!container) {
        throw new CommandException("I see no " + container_name + " here!");
      }
      // the "specialPut" event handler is used for logic when putting something into an artifact that
      // is not a typical container, e.g., putting lamp oil into a lamp
      if (game.triggerEvent('specialPut', arg, item, container)) {
        // if it's a disguised monster, reveal it
        if (item.type === Artifact.TYPE_DISGUISED_MONSTER) {
          item.revealDisguisedMonster();
          return;
        }
        if (container.type === Artifact.TYPE_DISGUISED_MONSTER) {
          container.revealDisguisedMonster();
          return;
        }
        // make sure it's something we can put into things
        // (if you need to put larger items into containers for the game logic, use the "specialPut" event handler)
        if (item.weight > 900) {
          throw new CommandException("Don't be absurd.");
        }
        if (item.weight === -999 || item.type === Artifact.TYPE_BOUND_MONSTER) {
          throw new CommandException("You can't do that.");
        }
        // check capacity of container
        if (item.weight > container.getRemainingCapacity()) {
          throw new CommandException("It won't fit!");
        }
        if (container.type === Artifact.TYPE_CONTAINER) {
          if (container.is_open) {
            if (game.triggerEvent("beforePut", arg, item, container)) {
              game.history.write("Done.");
              match = true;
              item.putIntoContainer(container);
              game.triggerEvent("afterPut", arg, item, container);
            }
          } else {
            throw new CommandException("Try opening the " + container_name + " first.");
          }
        } else {
          throw new CommandException("I can't put things into the " + container_name + "!");
        }
      }
    } else {
      throw new CommandException("Try putting (SOMETHING) into (SOMETHING ELSE).");
    }

  }
}
core_commands.push(new PutCommand());


export class DropCommand implements BaseCommand {
  name = "drop";
  verbs: string[] = ["drop"];
  category = "artifact manipulation";
  description = "Drops an item you are carrying.";
  examples: string[] = [
    "DROP SWORD",
    "DROP ALL - Tries to drop everything you are carrying.",
  ];
  run(verb: string, arg: string) {

    arg = arg.toLowerCase();

    let match = false;

    const inventory = game.player.inventory;
    for (const i in inventory) {
      if (inventory[i].match(arg) || arg === "all") {
        // "drop all" doesn't drop items the player is wearing
        if (arg === "all" && inventory[i].is_worn) {
          continue;
        }
        match = true;
        if (game.triggerEvent("drop", arg, inventory[i])) {
          game.player.drop(inventory[i]);
          game.history.write(inventory[i].name + " dropped.", "no-space");
        }
      }
    }

    // message if nothing was dropped
    if (!match && arg !== "all") {
      throw new CommandException("You aren't carrying a " + arg + "!");
    }
  }
}
core_commands.push(new DropCommand());


export class ReadyCommand implements BaseCommand {
  name = "ready";
  verbs: string[] = ["ready"];
  category = "artifact manipulation";
  description = "Changes your ready weapon.";
  examples: string[] = [
    "READY TROLLSFIRE - Put your current weapon into your pack and hold the Trollsfire sword in your hand.",
  ];
  run(verb, arg) {

    const old_wpn = game.player.weapon;
    const wpn = game.player.findInInventory(arg);
    if (wpn) {
      if (game.triggerEvent("ready", arg, old_wpn, wpn)) {
        if (wpn.type === Artifact.TYPE_WEARABLE) {
          // for armor/shields, "ready" is the same as "wear"
          game.command_parser.run("wear " + wpn.name, false);
        } else {
          if (!wpn.is_weapon) {
            throw new CommandException("That is not a weapon!");
          }
          if (wpn.hands === 2 && game.player.isUsingShield()) {
            throw new CommandException("That is a two-handed weapon. Try removing your shield first.");
          } else {
            game.player.ready(wpn);
            game.history.write(wpn.name + " readied.");
          }
        }
      }
    } else {
      throw new CommandException("You aren't carrying a " + arg + "!");
    }
  }
}
core_commands.push(new ReadyCommand());


export class WearCommand implements BaseCommand {
  name = "wear";
  verbs: string[] = ["wear"];
  category = "artifact manipulation";
  description = "Puts on an article of clothing or armor.";
  examples: string[] = [
    "WEAR PLATE ARMOR",
    "WEAR SHIELD - In Eamon, you don't READY shields, you WEAR them like clothing."
  ];
  run(verb: string, arg: string) {

    const artifact = game.player.findInInventory(arg);
    if (game.triggerEvent('wear', arg, artifact)) {
      if (artifact) {
        if (artifact.type === Artifact.TYPE_WEARABLE) {
          if (artifact.is_worn) {
            throw new CommandException("You're already wearing it!");
          }
          if (artifact.armor_type === Artifact.ARMOR_TYPE_ARMOR && game.player.isWearingArmor()) {
            throw new CommandException("Try removing your other armor first.");
          }
          if (artifact.armor_type === Artifact.ARMOR_TYPE_SHIELD && game.player.isUsingShield()) {
            throw new CommandException("Try removing your other shield first.");
          }
          if (artifact.armor_type === Artifact.ARMOR_TYPE_SHIELD && game.player.weapon && game.player.weapon.hands === 2) {
            throw new CommandException("You are using a two-handed weapon. You can only use a shield with a one-handed weapon.");
          }
          if (artifact.armor_type === Artifact.ARMOR_TYPE_HELMET && game.player.isUsingHelmet()) {
            throw new CommandException("Try removing your other helmet first.");
          }
          // TODO: gloves + rings
          game.player.wear(artifact);
          game.history.write("You put on the " + artifact.name + ".");
        } else {
          throw new CommandException("You can't wear that!");
        }
      } else {
        throw new CommandException("You aren't carrying a " + arg + "!");
      }
    }
  }
}
core_commands.push(new WearCommand());


export class FleeCommand implements BaseCommand {
  name = "flee";
  verbs: string[] = ["flee"];
  category = "movement";
  description = "Runs away from a fight. Note that you might not always be able to escape.";
  examples: string[] = [
    "FLEE - If no direction is given, you will run in a random direction.",
    "FLEE N - Try to flee to the north. This might not always work. If a dragon is guarding a cave entrance in that direction, you might need to try to flee in a different direction.",
  ];
  run(verb, arg) {
    if (!game.in_battle) {
      throw new CommandException("Calm down. There is no danger here.");
    }

    let exit = game.rooms.current_room.chooseRandomExit();
    // if the player tried to flee a certain way, go that way instead
    // of using the random exit.
    if (arg !== "") {
      exit = game.rooms.current_room.getExit(arg);
      if (exit === null) {
        throw new CommandException("You can't go that way!");
      } else if (!exit.isOpen()) {
        throw new CommandException("The way is blocked!");
      }
    }
    if (game.triggerEvent("flee", arg, exit) !== false) {
      if (!exit) {
        throw new CommandException("There is nowhere to flee to!");
      }
      game.player.moveToRoom(exit.room_to);
      game.skip_battle_actions = true;
      game.triggerEvent("afterFlee", arg, exit);
    }

  }
}
core_commands.push(new FleeCommand());


export class DrinkCommand implements BaseCommand {
  name = "drink";
  verbs: string[] = ["drink"];
  category = "artifact manipulation";
  description = "Take a drink from a drinkable artifact.";
  examples: string[] = [
    "DRINK HEALING POTION",
  ];
  run(verb, arg) {
    const item = game.artifacts.getLocalByName(arg);
    if (game.triggerEvent("drink", arg, item) !== false) {
      if (item) {
        if (item.type === Artifact.TYPE_DRINKABLE) {
          if (item.quantity > 0) {
            game.history.write("You drink the " + item.name + ".");
            item.use();
          } else {
            throw new CommandException("There's none left!");
          }
        } else {
          throw new CommandException("You can't drink that!");
        }
      } else {
        // trying to drink something that's not here
        const item = game.artifacts.getByName(arg);
        if (item && item.isInLocalContainer()) {
          const container = game.artifacts.get(item.container_id);
          throw new CommandException(`Try removing it from the ${container.name} first.`);
        } else {
          // There's no artifact, or it's not here. Gracefully handle stuff in the room description.
          const common_stuff = ["water", "river", "stream", "lake", "ocean"];
          if (common_stuff.indexOf(arg) !== -1 && game.rooms.current_room.textMatch(arg)) {
            game.history.write("Nothing happens.");
          } else {
            throw new CommandException("I don't know what you mean.");
          }
        }
      }
    }
  }
}
core_commands.push(new DrinkCommand());


export class EatCommand implements BaseCommand {
  name = "eat";
  verbs: string[] = ["eat"];
  category = "artifact manipulation";
  description = "Eats an edible item.";
  examples: string[] = [
    "EAT SANDWICH",
  ];
  run(verb, arg) {
    const item = game.artifacts.getLocalByName(arg);
    if (game.triggerEvent("eat", arg, item) !== false) {
      if (item) {
        if (item.type === Artifact.TYPE_EDIBLE) {
          if (item.quantity > 0) {
            game.history.write("You eat the " + item.name + ".");
            item.use();
          } else {
            throw new CommandException("There's none left!");
          }
        } else {
          throw new CommandException("You can't eat that!");
        }
      } else {
        // trying to eat something that's not here
        const item = game.artifacts.getByName(arg);
        if (item && item.isInLocalContainer()) {
          const container = game.artifacts.get(item.container_id);
          throw new CommandException(`Try removing it from the ${container.name} first.`);
        } else {
          throw new CommandException("I don't know what you mean.");
        }
      }
    }
  }
}
core_commands.push(new EatCommand());


export class UseCommand implements BaseCommand {
  name = "use";
  verbs: string[] = ["use"];
  category = "artifact manipulation";
  description = "Uses the special ability of an item, either something you're carrying or something in the room.";
  examples: string[] = [
    "USE ROPE - If you're carrying a rope, this might attach it to the wall or ceiling so you can climb.",
    "USE LEVER - A lever in a room might open a nearby door. This command will activate it."
  ];
  run(verb, arg) {
    if (game.triggerEvent('beforeUse', arg)) {
      const item: Artifact = game.artifacts.getLocalByName(arg);
      if (item) {
        if (item.quantity === null || item.quantity > 0) {
          item.use();
        } else {
          throw new CommandException("There's none left!");
        }
      } else {
        throw new CommandException("You aren't carrying it!");
      }
    }
  }
}
core_commands.push(new UseCommand());


export class AttackCommand implements BaseCommand {
  name = "attack";
  verbs: string[] = ["attack"];
  category = "interactive";
  description = "Attacks a monster or NPC, or sometimes an artifact like a locked door or chest.";
  examples: string[] = [
    "ATTACK DRAGON",
    "AT DR - Shorthand for the same thing",
    "A DRAGON - Another shorthand",
    "ATTACK DOOR - Try to smash open a door",
    "ATTACK EVIL MACHINE - Try to destroy something"
  ];
  run(verb, arg) {

    if (!game.player.weapon_id) {
      throw new CommandException("You don't have a weapon ready!");
    }

    const [monster_target, artifact_target] = findTarget(arg);
    if (monster_target) {

      if (game.triggerEvent('attackMonster', arg, monster_target)) {

        // halve the target's friendliness and reset target's reaction.
        // this will allow friendly/neutral monsters to fight back if you anger them.
        monster_target.hurtFeelings();

        game.player.attack(monster_target);

        // if player attacked, allow other monsters to do battle actions like
        // picking up a weapon or healing.
        game.is_battle_turn = true;
      }

    } else if (artifact_target) {
      // attacking an artifact

      if (game.triggerEvent('attackArtifact', arg, artifact_target)) {

        // if it's a disguised monster, reveal it
        if (artifact_target.type === Artifact.TYPE_DISGUISED_MONSTER) {
          artifact_target.revealDisguisedMonster();
          return;
        }

        const damage_done = artifact_target.injure(game.player.rollAttackDamage());
        if (damage_done === 0) {
          game.history.write("Nothing happens.");
        } else if (damage_done === -1) {
          throw new CommandException(`Why would you attack a ${artifact_target.name}?`);
        }
      }

    } else {
      throw new CommandException("Attack whom?");
    }

  }
}
core_commands.push(new AttackCommand());


export class LightCommand implements BaseCommand {
  name = "light";
  verbs: string[] = ["light"];
  category = "artifact manipulation";
  description = "Ignites or turns on a light source, or puts it out if it's already lit.";
  examples: string[] = [
    "LIGHT TORCH",
  ];
  run(verb, arg) {

    if (arg === '') {
      throw new CommandException('Light what?')
    }

    const artifact = game.artifacts.getLocalByName(arg);

    if (game.triggerEvent('light', arg, artifact) !== false ) {

      if (artifact) {
        if (artifact.type === Artifact.TYPE_LIGHT_SOURCE) {
          if (artifact.is_lit) {
            artifact.is_lit = false;
            game.history.write("You put out the " + artifact.name + ".");
          } else {
            if (artifact.quantity > 0 || artifact.quantity === -1) {
              artifact.is_lit = true;
              game.history.write("You light the " + artifact.name + ".");
            } else {
              game.history.write("It's out of fuel!");
            }
          }
        } else {
          throw new CommandException("That isn't a light source!");
        }
      } else {
        throw new CommandException("You aren't carrying a " + arg + "!");
      }
    }

  }
}
core_commands.push(new LightCommand());


export class ReadCommand implements BaseCommand {
  name = "read";
  verbs: string[] = ["read"];
  category = "artifact manipulation";
  description = "Reads an item like a book, scroll, sign, or inscription.";
  examples: string[] = [
    "READ BOOK",
  ];
  run(verb, arg) {

    // can't read anything if it's dark
    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource()) {
      throw new CommandException("You can't read in the dark!");
    }

    if (arg === '') {
      throw new CommandException('Read what?')
    }

    // see if we're reading an artifact that has markings
    const a = game.artifacts.getLocalByName(arg, false);
    if (game.triggerEvent('beforeRead', arg, a)) {
      if (a !== null) {
        // don't reveal in getLocalByName above because we want to know if we revealed something.
        let revealed_something = false;
        if (a.embedded) {
          a.reveal();
          revealed_something = true;
        }

        // artifacts that aren't specifically "readable" can sometimes still have effect_ids and be
        // "de facto" readable.
        // this does not work with containers, which can have an effect ID that appears when you open them.
        if (a.effect_id && a.type !== Artifact.TYPE_CONTAINER) {
          for (let i = 0; i < a.num_effects; i++) {
            game.effects.print(a.effect_id + i);
          }
        } else if (a.type === Artifact.TYPE_READABLE) {
          // readable artifact with no effects. just show description.
          if (!revealed_something) {
            a.showDescription();
          }
        } else {
          game.history.write(a.name + " has no markings to read!");
        }
        game.triggerEvent("afterRead", arg, a);
      } else {
        // no valid readable artifact. we can try to show interesting messages explaining why it can't be read.
        if (arg === 'wall' || arg === 'door' || arg === 'floor' || arg === 'ceiling') {
          game.history.write("There are no markings to read!");
        } else if (arg === 'sign' && game.rooms.current_room.description.indexOf('sign') !== -1) {
          // generic sign which is not really readable. we can pretend.
          game.rooms.current_room.show_description();
        } else {
          game.history.write("There is no " + arg + " here!");
        }
      }
    }
  }
}
core_commands.push(new ReadCommand());


export class OpenCommand implements BaseCommand {
  name = "open";
  verbs: string[] = ["open"];
  category = "artifact manipulation";
  description = "Tries to open a closed door, gate, or container.";
  examples: string[] = [
    "OPEN DOUBLE DOORS",
    "OPEN WOODEN CHEST",
  ];
  run(verb, arg) {

    if (arg === '') {
      throw new CommandException('Open what?')
    }

    const a: Artifact = game.artifacts.getLocalByName(arg, false);
    if (a !== null) {
      if (game.triggerEvent("beforeOpen", arg, a)) {
        // don't reveal in getLocalByName above because we want to know if we revealed something.
        let revealed_something = false;
        if (a.embedded) {
          a.reveal();
          revealed_something = true;
        }
        if (a.type === Artifact.TYPE_DISGUISED_MONSTER) {
          // if it's a disguised monster, reveal it
          a.revealDisguisedMonster();
        } else if (a.type === Artifact.TYPE_CONTAINER
          || a.type === Artifact.TYPE_DOOR
          || a.type === Artifact.TYPE_READABLE
          || a.type === Artifact.TYPE_EDIBLE
          || a.type === Artifact.TYPE_DRINKABLE
        ) {
          // normal container or door/gate; books and food/drink are also openable
          // FIXME: this doesn't make sense for some items like a piece of paper or a loaf of bread
          // (though what user is going to type "open bread"?)
          if (!a.is_open) {
            // not open. try to open it.
            if (a.key_id === -1) {
              game.history.write("It won't open.");  // only special code can open this
            } else if (a.key_id === 0 && a.hardiness) {
              game.history.write("You'll have to force it open.");
            } else if (a.key_id > 0) {
              if (game.player.hasArtifact(a.key_id)) {
                const key = game.artifacts.get(a.key_id);
                game.history.write("You unlock it using the " + key.name + ".");
                a.open();

                if (a.effect_id && !game.effects.get(a.effect_id).seen) {
                  game.effects.print(a.effect_id);
                }
                game.triggerEvent('afterOpen', arg, a);
                if (a.type === Artifact.TYPE_CONTAINER) {
                  a.printContents();
                }
              } else {
                game.history.write("It's locked and you don't have the key!");
              }
            } else {
              game.history.write(a.name + " opened.");
              a.open();

              if (a.effect_id && !game.effects.get(a.effect_id).seen) {
                game.effects.print(a.effect_id);
              }
              game.triggerEvent('afterOpen', arg, a);
              if (a.type === Artifact.TYPE_CONTAINER) {
                a.printContents();
              }
            }
          } else {
            // secret passages usually start out as "open" so we don't show the "already open" message for them.
            if (!revealed_something) {
              game.history.write("It's already open!");
            }
          }
        } else {
          throw new CommandException("That's not something you can open.");
        }
      }
      // if the beforeOpen event handler returned false, display nothing. that event handler should display a message
      // explaining why something couldn't be opened.
    } else {
      // if we didn't find anything to open, show a message
      if (game.rooms.current_room.textMatch(arg)) {
        if (arg === 'door') {
          throw new CommandException("The door will open when you pass through it.");
        } else {
          throw new CommandException("That's not something you can open.");
        }
      } else {
        // catch user mischief
        if (game.monsters.getLocalByName(arg)) {
          throw new CommandException("That's not something you can open.");
        }
        throw new CommandException("I don't see a " + arg + " here!");
      }
    }
  }
}
core_commands.push(new OpenCommand());


export class CloseCommand implements BaseCommand {
  name = "close";
  verbs: string[] = ["close"];
  category = "artifact manipulation";
  description = "Tries to close an open door, gate, or container.";
  examples: string[] = [
    "CLOSE DOUBLE DOORS",
    "CLOSE WOODEN CHEST",
  ];
  run(verb, arg) {

    if (arg === '') {
      throw new CommandException('Close what?')
    }

    const a = game.artifacts.getLocalByName(arg, false);  // not revealing embedded artifacts automatically
    if (a !== null) {
      if (game.triggerEvent('beforeClose', arg, a)) {
        // don't reveal secret passages with this command
        if (a.hidden) {
          throw new CommandException("I don't follow you.");
        }

        // if it's an embedded artifact that is not a hidden secret passage, reveal it
        if (a.embedded) {
          a.reveal();
        }

        if (a.type === Artifact.TYPE_READABLE || a.type === Artifact.TYPE_EDIBLE || a.type === Artifact.TYPE_DRINKABLE || a.key_id === -1) {
          throw new CommandException("You don't need to.");
        } else if (a.type === Artifact.TYPE_CONTAINER || a.type === Artifact.TYPE_DOOR) {
          if (!a.is_open) {
            throw new CommandException("It's not open.");
          } else if (a.is_broken) {
            throw new CommandException("You broke it.");
          } else {
            a.close();
            game.history.write(a.name + " closed.");
            game.triggerEvent('afterClose', arg, a);
          }
        }
      }
    } else {
      throw new CommandException("It's not here.");
    }
    // If the beforeClose event handler returned false, this displays nothing. That event
    // handler should display a message explaining why something couldn't be closed.
  }
}
core_commands.push(new CloseCommand());


export class GiveCommand implements BaseCommand {
  name = "give";
  verbs: string[] = ["give"];
  category = "artifact manipulation";
  description = "Gives an artifact to a monster or NPC.";
  examples: string[] = [
    "GIVE SWORD TO EDDIE - If you give a weapon to an NPC, and they don't already have one, they will ready it.",
    "GIVE HEALING POTION TO EDDIE - If you give an edible or drinkable artifact to an NPC, they will take one bite or drink and give it back to you.",
    "GIVE 100 TO EDDIE - Gives an NPC named Eddie 100 gold pieces",
  ];
  run(verb: string, arg: string) {

    const match = false;

    const regex_result = /(.+) to (.*)/.exec(arg);
    if (regex_result === null) {
      throw new CommandException("Try giving (something) to (someone).");
    }

    const item_name: string = regex_result[1];
    const monster_name: string = regex_result[2];

    const recipient = game.monsters.getLocalByName(monster_name);
    if (!recipient) {
      throw new CommandException(monster_name + " is not here!");
    }

    // check if we're giving money (GIVE 123 TO NPC or GIVE 123 GOLD TO NPC)
    let gold_amount = Number(item_name);
    if (isNaN(gold_amount)) {
      const plural = pluralize.plural(game.money_name);
      const regex_result = new RegExp(`([0-9,.]+) (gold|${game.money_name}|${plural})`).exec(item_name);
      if (regex_result) {
        gold_amount = Number(regex_result[1]);
      }
    }
    if (!isNaN(gold_amount)) {
      // giving money

      if (gold_amount > game.player.gold) {
        throw new CommandException(`You only have ${game.player.getMoneyFormatted()}!`);
      }

      if (gold_amount <= 0 || gold_amount !== Math.floor(gold_amount)) {
        throw new CommandException(`You're not making any sense.`);
      }

      // TODO: show confirmation dialog to player

      if (game.triggerEvent("giveGold", arg, gold_amount, recipient)) {
        game.player.gold -= gold_amount;
        game.history.write(recipient.name + " takes the money...");
        if (recipient.reaction === Monster.RX_NEUTRAL && gold_amount >= 5000) {
          game.history.write(recipient.name + " agrees to join your cause.");
          recipient.reaction = Monster.RX_FRIEND;
        }
      }

    } else {

      // giving item
      const item = game.player.findInInventory(item_name);
      if (!item) {
        throw new CommandException("You're not carrying it!");
      }

      if (game.triggerEvent("give", arg, item, recipient)) {

        if (item.is_worn) {
          game.player.remove(item);
        }
        item.monster_id = recipient.id;
        if ((item.type === Artifact.TYPE_EDIBLE || item.type === Artifact.TYPE_DRINKABLE) && item.is_healing) {
          const v: string = item.type === Artifact.TYPE_EDIBLE ? "eats" : "drinks";
          game.history.write(recipient.name + " " + v + " the " + item.name + " and hands it back.");
          item.use();
          item.monster_id = game.player.id;
        } else {
          recipient.updateInventory();
          game.history.write(recipient.name + " takes the " + item.name + ".");
        }
        game.player.updateInventory();

        // if you give a weapon to a monster who doesn't have one, they will ready it
        if (item.is_weapon && recipient.weapon_id === null) {
          game.history.write(recipient.name + " readies the " + item.name + ".");
          recipient.ready(item);
        }

        game.triggerEvent('afterGive', arg, item, recipient);

      }
    }
  }
}
core_commands.push(new GiveCommand());


export class TakeCommand implements BaseCommand {
  name = "take";
  verbs: string[] = ["take", "request"];
  category = "interactive";
  description = "Takes an item back from a monster or NPC. However, they might not want to give it to you. This usually only works with friendly monsters.";
  examples: string[] = [
    "REQUEST SWORD FROM EDDIE",
    "TAKE SWORD FROM EDDIE",
  ];
  run(verb: string, arg: string) {

    const match = false;

    const regex_result = /(.+) from (.*)/.exec(arg);
    if (regex_result === null) {
      throw new CommandException("Try taking (something) from (someone).");
    }

    const item_name: string = regex_result[1];
    const monster_name: string = regex_result[2];

    const monster = game.monsters.getByName(monster_name);
    if (!monster || monster.room_id !== game.rooms.current_room.id) {

      // if user types an artifact name instead of a monster name
      const a: Artifact = game.artifacts.getLocalByName(monster_name);
      if (a && a.type === Artifact.TYPE_CONTAINER) {
        game.command_parser.run('remove ' + arg, false);
        return;
      } else {
        throw new CommandException(monster_name + " is not here!");
      }

    }

    // first look in monster's inventory, then look at all items
    const item = monster.findInInventory(item_name) || game.artifacts.getByName(item_name);
    if (game.triggerEvent("beforeRequest", arg, item, monster)) {
      if (!item || !monster.hasArtifact(item.id)) {
        throw new CommandException(monster.name + " doesn't have it!");
      }

      // legacy event handler
      if (game.triggerEvent("take", arg, item, monster)) {
        item.moveToInventory();
        const ready_weapon_id = monster.weapon_id;
        monster.updateInventory();
        game.history.write(monster.name + " gives you the " + item.name + ".");
        if (!item.seen) {
          item.showDescription();
        }
        if (item.id === ready_weapon_id) {
          // took NPC's ready weapon. NPC should ready another weapon if they have one
          monster.weapon = null;
          monster.readyBestWeapon();
          if (monster.weapon_id) {
            game.history.write(monster.name + " readies the " + monster.weapon.name + ".");
          }
        }
        game.player.updateInventory();
        game.triggerEvent("afterRequest");
      }
    }
  }
}
core_commands.push(new TakeCommand());


export class FreeCommand implements BaseCommand {
  name = "free";
  verbs: string[] = ["free", "release"];
  category = "interactive";
  description = "Frees a bound monster. Note that a nearby monster may be guarding the bound monster and may prevent this.";
  examples: string[] = [
    "FREE PRISONER",
  ];
  run(verb: string, arg: string) {

    const monster: Monster = null;
    let message = "";

    if (arg === '') {
      throw new CommandException('Free what?')
    }

    const a = game.artifacts.getLocalByName(arg);
    if (game.triggerEvent('beforeFree', arg, a)) {
      if (a !== null) {
        if (a.type !== Artifact.TYPE_BOUND_MONSTER) {
          throw new CommandException("You can't free that!");
        }
        // some adventures use guard_id of 0 to indicate no guard
        if (a.guard_id !== null && a.guard_id !== 0) {
          const guard = game.monsters.get(a.guard_id);
          if (guard.isHere()) {
            throw new CommandException(guard.getDisplayName() + " won't let you!");
          }
        }
        const monster = game.monsters.get(a.monster_id);
        if (a.key_id) {
          if (game.player.hasArtifact(a.key_id)) {
            const key = game.artifacts.get(a.key_id);
            message = `You free ${monster.name} using the ${key.name}.`;
          } else {
            throw new CommandException("You don't have the key!");
          }
        } else {
          message = `You free ${monster.name}.`;
        }
        if (game.triggerEvent("free", arg, a)) {
          game.history.write(message);
          a.freeBoundMonster();
          game.triggerEvent("afterFree", arg, a, monster);
        }
      } else {

        // catch user mischief
        const m: Monster = game.monsters.getLocalByName(arg);
        if (m) {
          throw new CommandException(m.name + " is already free!");
        }

        throw new CommandException("I don't see any " + arg + "!");
      }
    }
  }
}
core_commands.push(new FreeCommand());


export class PowerCommand implements BaseCommand {
  name = "power";
  verbs: string[] = ["power"];
  category = "magic";
  description = "Casts the POWER spell. This spell has different effects in every adventure, and may be necessary to complete certain quests.";
  examples: string[] = [
    "POWER",
  ];
  run(verb, arg) {
    if (game.player.spellCast('power')) {
      //  this spell has no effect except what is defined in the adventure
      const roll = game.diceRoll(1, 100);
      game.triggerEvent("power", roll);
    }
  }
}
core_commands.push(new PowerCommand());


export class HealCommand implements BaseCommand {
  name = "heal";
  verbs: string[] = ["heal"];
  category = "magic";
  description = "Casts the HEAL spell.";
  examples: string[] = [
    "HEAL - With no target, this will heal your character.",
    "HEAL EDDIE - With a target, this will heal someone else.",
  ];
  run(verb, arg) {
    if (game.triggerEvent("heal", arg)) {
      let target = null;

      // determine the target
      if (arg !== "") {
        // heal a monster
        target = game.monsters.getLocalByName(arg);
        if (!target) {
          throw new CommandException("No one here by that name.");
        }
      } else {
        // heal the player
        target = game.player;
      }

      if (game.player.spellCast('heal')) {

        const heal_amount = game.diceRoll(2, 6);
        if (target.id == game.player.id) {
          game.history.write("Some of your wounds seem to clear up.");
        } else {
          game.history.write("Some of " + target.name + "'s wounds seem to clear up.");
        }
        target.heal(heal_amount);
      }
    }
  }
}
core_commands.push(new HealCommand());


export class BlastCommand implements BaseCommand {
  name = "blast";
  verbs: string[] = ["blast"];
  category = "magic";
  description = "Casts the BLAST spell. This is a standard magic missile type spell that can damage monsters and some artifacts like doors and chests.";
  examples: string[] = [
    "BLAST ORC - Casts a magic attack at a monster",
    "BLAST WOODEN CHEST - Casts a magic attack at an artifact, trying to smash it open",
  ];
  run(verb, arg) {
    if (game.player.spellCast('blast')) {

      const [monster_target, artifact_target] = findTarget(arg);
      let damage = game.diceRoll(2, 5);
      if (monster_target) {
        if (game.triggerEvent("blast", arg, monster_target)) {
          game.history.write(game.player.name + " casts a blast spell at " + monster_target.getDisplayName());
          game.history.write("--a direct hit!", "success no-space");
          const damage_adjusted = game.triggerEvent('blastDamage', game.player, monster_target, damage);
          if (damage_adjusted !== true) {
            // event handler returns boolean TRUE if no
            // change occurred (or handler didn't exist)
            damage = damage_adjusted;
          }
          monster_target.injure(damage, true);
          monster_target.hurtFeelings();
        }
      } else if (artifact_target) {
        if (game.triggerEvent('attackArtifact', arg, artifact_target)) {
          const damage_done = artifact_target.injure(damage, "blast");
          if (damage_done === 0) {
            game.history.write("Nothing happens.");
          } else if (damage_done === -1) {
            throw new CommandException("Why would you blast a " + artifact_target.name + "?");
          }
        }
      } else {
        throw new CommandException("Blast whom or what?");
      }
    }
  }
}
core_commands.push(new BlastCommand());


export class SpeedCommand implements BaseCommand {
  name = "speed";
  verbs: string[] = ["speed"];
  category = "magic";
  description = "Casts the SPEED spell. This increases your agility for a short time, making you a better fighter. Useful just before a tough combat.";
  examples: string[] = [
    "SPEED",
  ];
  run(verb, arg) {
    if (game.player.spellCast('speed')) {
      game.triggerEvent("speed", arg);
      // double player's agility
      game.history.write("You can feel the new agility flowing through you!", "success");
      if (game.player.spell_counters['speed'] === 0) {
        game.player.speed_multiplier = 2;
      }
      game.player.spell_counters['speed'] += 10 + game.diceRoll(1, 10);
    }
  }
}
core_commands.push(new SpeedCommand());


export class SaveCommand implements BaseCommand {
  name = "save";
  verbs: string[] = ["save"];
  category = "miscellaneous";
  description = "Saves your game.";
  examples: string[] = [
    "SAVE",
  ];
  run(verb, arg) {
    if (game.demo) {
      throw new CommandException("Saved games are not available when playing as the demo character.");
    }

    const q1 = new ModalQuestion;
    q1.type = 'multiple_choice';
    q1.question = "Please choose a saved game slot:";
    q1.choices = [];
    for (let slot = 1; slot <= 10; slot++) {
      if (game.saved_games.hasOwnProperty(slot.toString())) {
        q1.choices.push(slot + ": " + (game.saved_games[slot].description ? game.saved_games[slot].description : "no description"));
      } else {
        q1.choices.push(slot + ": unused");
      }
    }
    q1.choices.push('Cancel');
    q1.callback = function (answer) {
      if (answer.toLowerCase() === 'cancel') {
        return false;
      }
      const slot = parseInt(answer);
      if (game.saved_games.hasOwnProperty(slot.toString())) {
        q2.answer = game.saved_games[slot].description;
      }
      return true;
    };

    const q2 = new ModalQuestion();
    q2.type = 'text';
    q2.question = "Enter a description for the saved game:";
    q2.callback = function (answer) {
      const slot = parseInt(game.modal.questions[0].answer);
      game.save(slot, answer);
      game.history.write("Game saved to slot " + slot + ".");
      return true;
    };
    game.modal.questions = [q1, q2];
    game.modal.run();

  }
}
core_commands.push(new SaveCommand());


export class RestoreCommand implements BaseCommand {
  name = "restore";
  verbs: string[] = ["restore"];
  category = "miscellaneous";
  description = "Restores from a saved game.";
  examples: string[] = [
    "RESTORE",
  ];
  run(verb, arg) {
    if (game.demo) {
      throw new CommandException("Saved games are not available when playing as the demo character.");
    }

    const q1 = new ModalQuestion;
    q1.type = 'multiple_choice';
    q1.question = "Please choose a saved game to restore:";
    q1.choices = [];
    for (let i = 1; i <= 10; i++) {
      if (game.saved_games.hasOwnProperty(i)) {
        q1.choices.push(i + ": " + (game.saved_games[i].description ? game.saved_games[i].description : "no description"));
      }
    }
    q1.choices.push('Cancel');
    q1.callback = answer => {
      if (answer.toLowerCase() === 'cancel') {
        return false;
      }
      const slot = parseInt(answer, 10);
      game.restore(slot);
      return true;
    };
    game.modal.questions = [q1];
    game.modal.run();
  }
}
core_commands.push(new RestoreCommand());


export class SmileCommand implements BaseCommand {
  name = "smile";
  verbs: string[] = ["smile"];
  category = "interactive";
  description = "Greets monsters to see if they are friendly or not.";
  examples: string[] = [
    "SMILE",
  ];
  run(verb, arg) {
    if (game.monsters.visible.length === 0) {
      game.history.write("Ok. 😃");
      game.history.write("You know... you look a bit dim, smiling like that, when no one's around.");
      return;
    }
    const friends = game.monsters.visible.filter(m => (m.reaction == Monster.RX_FRIEND));
    const neutrals = game.monsters.visible.filter(m => (m.reaction == Monster.RX_NEUTRAL));
    const hostiles = game.monsters.visible.filter(m => (m.reaction == Monster.RX_HOSTILE));
    if (friends.length > 0) {
      const smiles = [];
      friends.forEach(m => {
        if (game.triggerEvent('monsterSmile', m)) {
          smiles.push(m);
        }
      });
      if (smiles.length) {
        game.history.write(formatMonsterAction(smiles, "smiles back.", "smile back."));
      }
    }
    if (neutrals.length > 0) {
      const ignores = [];
      neutrals.forEach(m => {
        if (game.triggerEvent('monsterSmile', m)) {
          ignores.push(m);
        }
      });
      if (ignores.length) {
        game.history.write(formatMonsterAction(ignores, "ignores you.", "ignore you."));
      }
    }
    if (hostiles.length > 0) {
      const growls = [];
      hostiles.forEach(m => {
        if (game.triggerEvent('monsterSmile', m)) {
          growls.push(m);
        }
      });
      if (growls.length) {
        game.history.write(formatMonsterAction(growls, "scowls at you.", "scowl at you."));
      }
    }
  }
}
core_commands.push(new SmileCommand());


export class InventoryCommand implements BaseCommand {
  name = "inventory";
  verbs: string[] = ["inventory"];
  category = "miscellaneous";
  description = "Shows what you are carrying, or what someone else is carrying.";
  examples: string[] = [
    "INVENTORY (or INV for short) - Shows what you are carrying",
    "INV EDDIE - Shows what an NPC named Eddie is carrying. If Eddie is not friendly, this command will only show you his ready weapon.",
  ];
  run(verb, arg) {
    if (arg === "") {
      // player
      game.player.printInventory();
      game.player.showHealth();
    } else {
      // inventory another monster
      const m = game.monsters.getLocalByName(arg);
      if (m) {
        m.printInventory();
        m.showHealth();
      } else {
        throw new CommandException(`No one here by that name!`);
      }
    }
  }
}
core_commands.push(new InventoryCommand());


// a cheat command used for debugging. say "goto" and the room number (e.g., "goto 5")
export class GotoCommand implements BaseCommand {
  name = "goto";
  verbs: string[] = ["xgoto"];
  secret = true;
  run(verb, arg) {
    if (!game.data['bort']) {
      throw new CommandException("I don't know the command '" + verb + "'!")
    }
    const room_to = game.rooms.getRoomById(parseInt(arg));
    if (!room_to) {
      throw new CommandException("There is no room " + arg);
    }
    const room_from = game.rooms.current_room;
    game.skip_battle_actions = true;
    game.player.moveToRoom(room_to.id);
    game.triggerEvent("afterMove", arg, room_from, room_to);
  }
}
core_commands.push(new GotoCommand());

// a cheat command used for debugging. opens the javascript debugger
export class DebuggerCommand implements BaseCommand {
  name = "debugger";
  verbs: string[] = ["xdebugger"];
  secret = true;
  run(verb, arg) {
    if (!game.data['bort']) {
      throw new CommandException("I don't know the command '" + verb + "'!")
    }
    debugger;
  }
}
core_commands.push(new DebuggerCommand());

// a cheat command used for debugging. gets an artifact no matter where it is
export class AccioCommand implements BaseCommand {
  name = "accio";
  verbs: string[] = ["xaccio"];
  secret = true;
  run(verb, arg) {
    if (!game.data['bort']) {
      throw new CommandException("I don't know the command '" + verb + "'!")
    }
    let a = game.artifacts.getByName(arg);
    const m = game.monsters.getByName(arg);
    if (a && a.type === Artifact.TYPE_DEAD_BODY && m) {
      a = null;
    }
    if (a) {
      if (!a.seen)
        a.showDescription();
      a.moveToInventory();
      game.history.write(`${a.name} taken.`);
      a.data.for_sale = false;
      game.player.updateInventory();
    } else {
      if (m) {
        m.moveToRoom();
        game.history.write(`${m.name} appears.`);
        game.monsters.updateVisible();
      } else {
        game.history.write(`I don't know what ${arg} is!`);
      }
    }
  }
}
core_commands.push(new AccioCommand());

/**
 * Helper function to find a target to attack or blast
 * @param arg
 */
function findTarget(arg: string) {
    let monster_target = null;
    let artifact_target = null;
    if (arg === '') {
      // no target specified: attack a random hostile monster
      monster_target = game.player.chooseTarget();
      if (!monster_target) {
        throw new CommandException("Calm down. There are no hostile monsters here.");
      }
    } else {
      monster_target = game.monsters.getLocalByName(arg);
      artifact_target = game.artifacts.getLocalByName(arg);
    }
    return [monster_target, artifact_target];
}
