import {BaseCommand} from "./base-command";
import {Game} from "../models/game";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";
import {RoomExit} from "../models/room";
import {CommandException} from "../utils/command.exception";

export let core_commands = [];

export class MoveCommand implements BaseCommand {
  name: string = "move";
  verbs: string[] = ["north", "n", "south", "s", "east", "e", "west", "w", "up", "u", "down", "d"];

  run(verb, arg) {

    let game = Game.getInstance();

    // TODO: turn "north" into "n"
    let exit = game.rooms.current_room.getExit(verb);
    let msg: string;
    if (exit === null) {
      throw new CommandException("You can't go that way!");
    }

    // hostile monsters prevent the player from moving
    if (game.in_battle) {
      throw new CommandException("You can't do that with unfriendlies about!");
    }

    // check if there is a door or gate blocking the way
    if (exit.door_id) {
      let door = game.artifacts.get(exit.door_id);

      // if it's a hidden or secret door, the exit is blocked even if the door's "open" flag is set.
      // show the normal "you can't go that way" message here, to avoid giving away secret door locations
      if (door.embedded && door.hidden) {
        throw new CommandException("You can't go that way!");
      }

      if (door.embedded) {
        door.reveal();
      }

      // try to unlock the door using a key the player is carrying
      if (!door.is_open && door.key_id && game.player.hasArtifact(door.key_id)) {
        let key = game.artifacts.get(door.key_id);
        game.history.write("You unlock the door using the " + key.name + ".");
        door.is_open = true;
      }

      if (!door.is_open) {
        throw new CommandException("The " + door.name + " blocks your way!");
      }
    }

    // monsters never fight during the turn when a player moves to a new room.
    game.skip_battle_actions = true;

    if (game.triggerEvent("beforeMove", arg, game.rooms.current_room, exit)) {
      if (exit.room_to === RoomExit.EXIT) {
        // leaving the adventure
        game.history.write("You successfully ride off into the sunset!");
        game.exit();
        return;
      } else {
        let room_to = game.rooms.getRoomById(exit.room_to);
        game.player.moveToRoom(room_to.id);

        // move friendly monsters
        for (let i in game.monsters.visible) {
          if (game.monsters.visible[i].reaction === Monster.RX_FRIEND) {
            game.monsters.visible[i].moveToRoom(room_to.id);
          }
        }

        game.triggerEvent("afterMove", arg, exit, room_to);

      }
    }
  }
}
core_commands.push(new MoveCommand());


export class LookCommand implements BaseCommand {
  name: string = "look";
  verbs: string[] = ["look", "examine"];
  run(verb, arg) {
    let game = Game.getInstance();

    // look event. can be used to reveal secret doors, etc.
    game.triggerEvent("look", arg);

    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource()) {
      // can't look at anything if it's dark.
      return;
    }

    if (arg === "") {
      // if not looking at anything in particular, show the room description
      game.history.write(game.rooms.current_room.description);
    } else {
      // looking at a specific thing.

      let match = false;

      // see if there is a matching artifact.
      let a = game.artifacts.getLocalByName(arg, true);
      if (a) {
        match = true;

        // if it's an embedded artifact, reveal it
        if (a.embedded) {
          a.reveal();
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
          if (a.quantity >= 25) {
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
      let m = game.monsters.getLocalByName(arg);
      if (m) {
        match = true;
        game.history.write(m.description);
      }

      // error message if nothing matched
      if (!match) {
        throw new CommandException("I see no " + arg + " here!");
      }

    }
  }
}
core_commands.push(new LookCommand());


export class SayCommand implements BaseCommand {
  name: string = "say";
  verbs: string[] = ["say"];
  run(verb, arg) {

    if (arg === "") {
      arg = prompt("Say what?");
    }
    this.doit(arg);

  }
  doit(arg) {
    let game = Game.getInstance();
    game.history.write("Ok... \"" + arg + "\"");
    game.triggerEvent("say", arg);
  }
}
core_commands.push(new SayCommand());


export class GetCommand implements BaseCommand {
  name: string = "get";
  verbs: string[] = ["get"];
  run(verb: string, arg: string) {

    let game = Game.getInstance();
    arg = arg.toLowerCase();
    let match = false;

    for (let i in game.artifacts.visible) {
      let a = game.artifacts.visible[i];
      if (a.match(arg) || arg === "all") {
        match = true;
        if (arg === "all" && a.get_all === false) {
          game.history.write("You don't bother picking up the " + a.name + ".");
          continue;
        }

        if (game.triggerEvent("beforeGet", arg, a)) {

          // if it's a disguised monster, reveal it
          if (a.type === Artifact.TYPE_DISGUISED_MONSTER) {
            a.revealDisguisedMonster();
            continue;
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
            throw new CommandException("You can't get that.");
          }

          if (game.player.weight_carried + a.weight <= game.player.maxWeight()) {
            game.player.pickUp(a);
            if (arg === "all") {
              game.history.write(a.name + " taken.", "no-space");
            } else {
              game.history.write("Got it.");
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

    // message if nothing was taken
    if (!match && arg !== "all") {
      throw new CommandException("I see no " + arg + " here!");
    }
  }
}
core_commands.push(new GetCommand());


export class RemoveCommand implements BaseCommand {
  name: string = "remove";
  verbs: string[] = ["remove"];
  run(verb: string, arg: string) {

    let game = Game.getInstance();
    let match = false;

    // check if we're removing something from a container
    let regex_result = /(.+) from (.*)/.exec(arg);
    if (regex_result !== null) {
      let item_name: string = regex_result[1];
      let container_name: string = regex_result[2];

      // catch user mischief
      let m: Monster = game.monsters.getLocalByName(container_name);
      if (m) {
        throw new CommandException("I can't remove something from " + container_name + "!");
      }

      // look for a container artifact and see if we can remove the item from it
      let container: Artifact = game.artifacts.getLocalByName(container_name);
      if (container) {
        if (container.type === Artifact.TYPE_CONTAINER) {
          if (container.is_open) {
            let item: Artifact = container.getContainedArtifact(item_name);
            if (item) {
              if (game.triggerEvent("beforeRemove", arg, item)) {
                game.history.write(item.name + " removed from " + container.name + ".");
                match = true;
                item.removeFromContainer();
                if (!item.seen) {
                  game.history.write(item.description);
                  item.seen = true;
                }
                game.triggerEvent("afterRemove", arg, item);
              }
            } else {
              throw new CommandException("There is no " + item_name + " inside the " + container_name + "!");
            }
          } else {
            throw new CommandException("Try opening the " + container_name + " first.");
          }
        } else {
          throw new CommandException("I can't remove things from the " + container_name + "!");
        }
      } else {
        throw new CommandException("I see no " + container_name + " here!");
      }

    } else {

      let artifact = game.player.findInInventory(arg);
      if (artifact) {
        if (artifact.is_worn) {
          game.player.remove(artifact);
          game.history.write("You take off the " + artifact.name + ".");
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


export class DropCommand implements BaseCommand {
  name: string = "drop";
  verbs: string[] = ["drop"];
  run(verb: string, arg: string) {

    let game = Game.getInstance();
    arg = arg.toLowerCase();

    let match = false;

    let inventory = game.player.inventory;
    for (let i in inventory) {
      if (inventory[i].match(arg) || arg === "all") {
        // "drop all" doesn't drop items the player is wearing
        if (arg === "all" && inventory[i].is_worn) {
          continue;
        }
        match = true;
        game.player.drop(inventory[i]);
        game.history.write(inventory[i].name + " dropped.", "no-space");
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
  name: string = "ready";
  verbs: string[] = ["ready"];
  run(verb, arg) {

    let game = Game.getInstance();
    let old_wpn = game.player.weapon;
    let wpn = game.player.findInInventory(arg);
    if (wpn) {
      if (game.triggerEvent("ready", arg, old_wpn, wpn)) {
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
    } else {
      throw new CommandException("You aren't carrying a " + arg + "!");
    }
  }
}
core_commands.push(new ReadyCommand());


export class WearCommand implements BaseCommand {
  name: string = "wear";
  verbs: string[] = ["wear"];
  run(verb: string, arg: string) {

    let game = Game.getInstance();
    let artifact = game.player.findInInventory(arg);
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
          if (artifact.armor_type === Artifact.ARMOR_TYPE_SHIELD && game.player.weapon.hands === 2) {
            throw new CommandException("You are using a two-handed weapon. You can only use a shield with a one-handed weapon.");
          }
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
  name: string = "flee";
  verbs: string[] = ["flee"];
  run(verb, arg) {
    let game = Game.getInstance();

    if (!game.in_battle) {
      throw new CommandException("There is nothing to flee from!");
    }

    let room_to = game.player.chooseRandomExit();
    if (!room_to) {
      throw new CommandException("There is nowhere to flee to!");
    }
    game.history.write("Fleeing to " + room_to.name);
    game.player.moveToRoom(room_to.id);

    // TODO: check if other monsters follow
  }
}
core_commands.push(new FleeCommand());


export class DrinkCommand implements BaseCommand {
  name: string = "drink";
  verbs: string[] = ["drink"];
  run(verb, arg) {
    let game = Game.getInstance();
    let item = game.artifacts.getLocalByName(arg, true);
    if (item) {

      if (item.embedded) {
        item.reveal();
      }

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
    }
  }
}
core_commands.push(new DrinkCommand());


export class EatCommand implements BaseCommand {
  name: string = "eat";
  verbs: string[] = ["eat"];
  run(verb, arg) {
    let game = Game.getInstance();
    let item = game.artifacts.getLocalByName(arg, true);
    if (item) {

      if (item.embedded) {
        item.reveal();
      }

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
    }
  }
}
core_commands.push(new EatCommand());


export class UseCommand implements BaseCommand {
  name: string = "use";
  verbs: string[] = ["use"];
  run(verb, arg) {
    let game = Game.getInstance();
    let item = game.player.findInInventory(arg);
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
core_commands.push(new UseCommand());


export class AttackCommand implements BaseCommand {
  name: string = "attack";
  verbs: string[] = ["attack", "a"];
  run(verb, arg) {
    let game = Game.getInstance();

    if (!game.player.weapon_id) {
      throw new CommandException("You don't have a weapon ready!");
    }

    let monster_target = game.monsters.getLocalByName(arg);
    let artifact_target = game.artifacts.getLocalByName(arg, true);
    if (monster_target) {

      if (game.triggerEvent('attackMonster', arg, monster_target)) {

        // halve the target's friendliness and reset target's reaction.
        // this will allow friendly/neutral monsters to fight back if you anger them.
        monster_target.hurtFeelings();

        game.player.attack(monster_target);
      }

    } else if (artifact_target) {
      // attacking an artifact

      if (game.triggerEvent('attackArtifact', arg, artifact_target)) {

        // if it's an embedded artifact, reveal it
        if (artifact_target.embedded) {
          artifact_target.reveal();
        }

        if (artifact_target.type === Artifact.TYPE_DEAD_BODY) {
          // if it's a dead body, hack it to bits
          game.history.write("You hack it to bits.");
          artifact_target.room_id = null;

        } else if (artifact_target.type === Artifact.TYPE_CONTAINER || artifact_target.type === Artifact.TYPE_DOOR) {
          // if it's a door or container, try to break it open.
          if (artifact_target.hardiness !== null) {
            let damage = game.player.rollAttackDamage();
            game.history.write("Wham! You hit the " + artifact_target.name + "!");
            artifact_target.hardiness -= damage;
            console.log(artifact_target.hardiness);
            if (artifact_target.hardiness <= 0) {
              artifact_target.is_broken = true;
              game.history.write("The " + artifact_target.name + " smashes to pieces!");
              if (artifact_target.type === Artifact.TYPE_CONTAINER) {
                for (let i in artifact_target.contents) {
                  artifact_target.contents[i].room_id = game.player.room_id;
                  artifact_target.contents[i].container_id = null;
                }
                artifact_target.destroy();
              } else {
                artifact_target.is_open = true;
              }
            }
          } else {
            // can't smash open things that have a key, or that are otherwise prevented from opening
            game.history.write("Nothing happens.");
          }

        } else {
          throw new CommandException("Why would you attack a " + arg + "?");
        }
      }

    } else {
      throw new CommandException("Attack whom?");
    }

  }
}
core_commands.push(new AttackCommand());


export class LightCommand implements BaseCommand {
  name: string = "light";
  verbs: string[] = ["light"];
  run(verb, arg) {
    let game = Game.getInstance();
    let artifact = game.player.findInInventory(arg);
    if (artifact) {
      if (artifact.type === Artifact.TYPE_LIGHT_SOURCE) {
        if (artifact.is_lit) {
          artifact.is_lit = false;
          game.history.write("You put out the " + artifact.name + ".");
        } else {
          if (artifact.quantity > 0) {
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
core_commands.push(new LightCommand());


export class ReadCommand implements BaseCommand {
  name: string = "read";
  verbs: string[] = ["read"];
  markings_read: boolean = false;
  run(verb, arg) {
    let game = Game.getInstance();
    this.markings_read = false;

    // can't read anything if it's dark
    if (game.rooms.current_room.is_dark && !game.artifacts.isLightSource()) {
      game.history.write("You can't read in the dark!");
      return;
    }

    // see if we're reading an artifact that has markings
    let a = game.artifacts.getLocalByName(arg);
    if (a !== null) {

      // "readable" type artifacts have built-in markings logic
      // (this is the new version, which displays one marking per use of the "read" command.)
      // NOTE: This is not implemented on most adventures yet.
      if (a.markings) {
        game.history.write("It reads: \"" + a.markings[a.markings_index] + "\"");
        this.markings_read = true;
        a.markings_index++;
        if (a.markings_index >= a.markings.length) {
          a.markings_index = 0;
        }
      }

      // markings logic from EDX - uses the effect system to print a bunch of effects in series.
      // (This prints them all at once. It doesn't page through them on multiple "read" calls.)
      if (a.effect_id) {
        for (let i = 0; i < a.num_effects; i++) {
          game.effects.print(a.effect_id + i);
        }
        this.markings_read = true;
      }

      // also call the event handler to allow reading custom markings on other artifact types
      // (or doing special things when reading something)
      game.triggerEvent("read", arg, a, this);
    }

    // otherwise, nothing happens
    if (!this.markings_read) {
      if (a || arg === 'wall' || arg === 'door' || arg === 'floor' || arg === 'ceiling') {
        game.history.write("There are no markings to read!");
      } else {
        game.history.write("There is no " + arg + " here!");
      }
    }
  }
}
core_commands.push(new ReadCommand());


export class OpenCommand implements BaseCommand {
  name: string = "open";
  verbs: string[] = ["open"];
  opened_something: boolean = false;
  run(verb, arg) {
    let game = Game.getInstance();
    let a = game.artifacts.getLocalByName(arg, true);
    if (a !== null) {

      // if it's an embedded artifact, reveal it
      if (a.embedded) {
        a.reveal();
      }

      if (a.type === Artifact.TYPE_DISGUISED_MONSTER) {
        // if it's a disguised monster, reveal it

        a.revealDisguisedMonster();
        this.opened_something = true;

      } else if (a.type === Artifact.TYPE_CONTAINER || a.type === Artifact.TYPE_DOOR) {
        // normal container or door/gate

        if (!a.is_open) {
          // not open. try to open it.
          if (a.key_id === -1) {
            game.history.write("It won't open.");
          } else if (a.key_id === 0 && a.hardiness) {
            game.history.write("You'll have to force it open.");
          } else if (a.key_id > 0) {
            if (game.player.hasArtifact(a.key_id)) {
              let key = game.artifacts.get(a.key_id);
              game.history.write("You unlock it using the " + key.name + ".");
            } else {
              throw new CommandException("It's locked and you don't have the key!");
            }
          } else {
            game.history.write(a.name + " opened.");

            if (a.type === Artifact.TYPE_CONTAINER) {
              a.printContents();
            }

          }
          a.is_open = true;
          this.opened_something = true;
        } else {
          throw new CommandException("It's already open!");
        }
      } else if (a.type === Artifact.TYPE_READABLE || a.type === Artifact.TYPE_EDIBLE || a.type === Artifact.TYPE_DRINKABLE) {
        if (!a.is_open) {
          game.history.write(a.name + " opened.");
          a.is_open = true;
          this.opened_something = true;
        } else {
          throw new CommandException("It's already open!");
        }
      }
    }

    // other effects are custom to the adventure
    game.triggerEvent("open", arg, this);

    // otherwise, nothing happens
    if (!this.opened_something) {
      if (arg === "door") {
        game.history.write("The door will open when you pass through it.");
      } else {
        game.history.write("I don't know how to open that!");
      }
    }
  }
}
core_commands.push(new OpenCommand());


export class CloseCommand implements BaseCommand {
  name: string = "close";
  verbs: string[] = ["close"];
  closed_something: boolean = false;
  run(verb, arg) {
    let game = Game.getInstance();
    let a = game.artifacts.getLocalByName(arg, true);
    if (a !== null) {
      if (a.hidden) {
        throw new CommandException("I don't follow you.");
      }

      // if it's an embedded artifact, reveal it
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
          a.is_open = false;
          game.history.write(a.name + " closed.");
          this.closed_something = true;
        }
      }
    }

    // other effects are custom to the adventure
    game.triggerEvent("close", arg, this);

    // otherwise, nothing happens
    if (!this.closed_something) {
      throw new CommandException("It's not here.");
    }
  }
}
core_commands.push(new CloseCommand());


export class GiveCommand implements BaseCommand {
  name: string = "give";
  verbs: string[] = ["give"];
  run(verb: string, arg: string) {

    let game: Game = Game.getInstance();
    let match = false;

    let regex_result = /(.+) to (.*)/.exec(arg);
    if (regex_result === null) {
      throw new CommandException("Try giving (something) to (someone).");
    }

    let item_name: string = regex_result[1];
    let monster_name: string = regex_result[2];

    let recipient = game.monsters.getByName(monster_name);
    if (!recipient || recipient.room_id !== game.rooms.current_room.id) {
      throw new CommandException(monster_name + " is not here!");
    }

    let gold_amount = Number(item_name);
    if (!isNaN(gold_amount)) {
      // giving money

      if (gold_amount > game.player.gold) {
        throw new CommandException("You only have " + game.player.gold + " gold pieces!");
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
      let item = game.player.findInInventory(item_name);
      if (!item) {
        throw new CommandException("You're not carrying it!");
      }

      if (game.triggerEvent("give", arg, item, recipient)) {

        if (item.is_worn) {
          game.player.remove(item);
        }
        item.monster_id = recipient.id;
        if ((item.type === Artifact.TYPE_EDIBLE || item.type === Artifact.TYPE_DRINKABLE) && item.is_healing) {
          let v: string = item.type === Artifact.TYPE_EDIBLE ? "eats" : "drinks";
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
      }
    }
  }
}
core_commands.push(new GiveCommand());


export class TakeCommand implements BaseCommand {
  name: string = "take";
  verbs: string[] = ["take", "request"];
  run(verb: string, arg: string) {

    let game: Game = Game.getInstance();
    let match = false;

    let regex_result = /(.+) from (.*)/.exec(arg);
    if (regex_result === null) {
      throw new CommandException("Try taking (something) from (someone).");
    }

    let item_name: string = regex_result[1];
    let monster_name: string = regex_result[2];

    let monster = game.monsters.getByName(monster_name);
    if (!monster || monster.room_id !== game.rooms.current_room.id) {
      throw new CommandException(monster_name + " is not here!");
    }

    let item = monster.findInInventory(item_name);
    if (!item) {
      throw new CommandException(monster.name + " doesn't have it!");
    }

    if (game.triggerEvent("take", arg, item, monster)) {

      item.monster_id = game.player.id;
      let ready_weapon_id = monster.weapon_id;
      monster.updateInventory();
      game.history.write(monster.name + " gives you the " + item.name + ".");
      if (item.id === ready_weapon_id) {
        // took NPC's ready weapon. NPC should ready another weapon if they have one
        monster.weapon = null;
        monster.readyBestWeapon();
        if (monster.weapon_id) {
          game.history.write(monster.name + " readies the " + monster.weapon.name + ".");
        }
      }
      game.player.updateInventory();

    }

  }
}
core_commands.push(new TakeCommand());


export class FreeCommand implements BaseCommand {
  name: string = "free";
  verbs: string[] = ["free", "release"];
  run(verb: string, arg: string) {

    let game: Game = Game.getInstance();
    let monster: Monster = null;
    let message: string = "";

    // see if we're reading an artifact that has markings
    let a = game.artifacts.getLocalByName(arg);
    if (a !== null) {
      if (a.type !== Artifact.TYPE_BOUND_MONSTER) {
        throw new CommandException("You can't free that!");
      }
      if (a.guard_id !== null) {
        let guard = game.monsters.get(a.guard_id);
        if (guard.isHere()) {
          throw new CommandException(guard.name + " won't let you!");
        }
      }
      if (a.key_id) {
        if (game.player.hasArtifact(a.key_id)) {
          let key = game.artifacts.get(a.key_id);
          message = "You free it using the " + key.name + ".";
        } else {
          throw new CommandException("It's locked and you don't have the key!");
        }
      } else {
        message = "Freed.";
      }
      game.history.write(message);
      game.triggerEvent("free", arg, a, monster);
      // put the freed monster into the room
      monster = game.monsters.get(a.monster_id);
      monster.room_id = game.rooms.current_room.id;
      // remove the "bound monster" artifact
      a.destroy();
    } else {
      throw new CommandException("I don't see any " + arg + "!");
    }

  }
}
core_commands.push(new FreeCommand());


export class PowerCommand implements BaseCommand {
  name: string = "power";
  verbs: string[] = ["power"];
  run(verb, arg) {
    let game = Game.getInstance();

    if (game.player.spellCast(verb)) {
      //  this spell has no effect except what is defined in the adventure
      let roll = game.diceRoll(1, 100);
      game.triggerEvent("power", roll);
    }
  }
}
core_commands.push(new PowerCommand());


export class HealCommand implements BaseCommand {
  name: string = "heal";
  verbs: string[] = ["heal"];
  run(verb, arg) {
    let game = Game.getInstance();

    if (game.player.spellCast(verb)) {
      let heal_amount = game.diceRoll(2, 6);
      game.triggerEvent("heal", arg);
      if (arg !== "") {
        // heal a monster
        let m = game.monsters.getByName(arg);
        if (m.room_id = game.rooms.current_room.id) {
          game.history.write("Some of " + m + "'s wounds seem to clear up.");
          m.heal(heal_amount);

        } else {
          throw new CommandException("Heal whom?");
        }
      } else {
        // heal player
        game.history.write("Some of your wounds seem to clear up.");
        game.player.heal(heal_amount);
      }
    }
  }
}
core_commands.push(new HealCommand());


export class BlastCommand implements BaseCommand {
  name: string = "blast";
  verbs: string[] = ["blast"];
  run(verb, arg) {
    let game = Game.getInstance();

    if (game.player.spellCast(verb)) {
      // blast a monster
      let target = game.monsters.getLocalByName(arg);
      if (target) {
        if (game.triggerEvent("blast", arg, target)) {
          game.history.write("--a direct hit!", "success");
          let damage = game.diceRoll(2, 5);
          target.injure(damage);
          target.hurtFeelings();
        }
      } else {
        throw new CommandException("Blast whom?");
      }
    }
  }
}
core_commands.push(new BlastCommand());


export class SpeedCommand implements BaseCommand {
  name: string = "speed";
  verbs: string[] = ["speed"];
  run(verb, arg) {
    let game = Game.getInstance();

    if (game.player.spellCast(verb)) {
      game.triggerEvent("speed", arg);
      // double player's agility
      game.history.write("You can feel the new agility flowing through you!", "success");
      if (game.player.speed_time === 0) {
        game.player.speed_multiplier = 2;
      }
      game.player.speed_time += 10 + game.diceRoll(1, 10);
    }
  }
}
core_commands.push(new SpeedCommand());


// a cheat command used for debugging. say "goto" and the room number (e.g., "goto 5")
export class GotoCommand implements BaseCommand {
  name: string = "goto";
  verbs: string[] = ["goto"];
  run(verb, arg) {
    let game = Game.getInstance();

    let room_to = game.rooms.getRoomById(parseInt(arg));
    if (!room_to) {
      throw new CommandException("There is no room " + arg);
    }
    game.skip_battle_actions = true;
    game.player.moveToRoom(room_to.id);
  }
}
core_commands.push(new GotoCommand());
