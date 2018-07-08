import {Game} from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";
import {ReadCommand, OpenCommand} from "../../core/commands/core-commands";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    game.data['oak door shut'] = false;

    // let rooms = game.rooms.rooms.map(x => x.id);
    game.data['wandering monsters'] = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26];
    // for (let i in [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]) {
    //   game.data['wandering monsters'].push({
    //     'monster_id': i,
    //     'rooms': rooms,
    //     'chance': 0.07
    //   })
    // }

    game.data['regeneration counter'] = 0;
    game.data['alkanda summoned'] = false;
    game.data["original ag"] = game.player.agility;
    game.data["sober counter"] = 0;

    // place the mage's body
    game.artifacts.get(32).moveToRoom(
      game.rooms.getRandom([1,2,3,4,5,6,7,8,9,10,11,12,13,14,28,29,30,31,32,41,50,51,52,53]).id
    );
    console.log(game.artifacts.get(32).room_id);

  },

  "attackArtifact": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    if (target.id === 50) {
      game.history.write("The statue howls in pain and roars with anger. I think you're in trouble!", "special");
      game.monsters.get(53).moveToRoom();
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    let game = Game.getInstance();

    if (artifact) {
      switch (artifact.id) {
        case 41:
          // scimitar
          game.history.write("Alignment conflict! The evil runes on the scimitar burn with a cold fire against your hand!", "special2");
          game.player.injure(game.diceRoll(1, 8) + 1);
          break;
      }
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();

    // traps! (artifact type 14)
    for (let a of game.artifacts.inRoom.filter(x => x.embedded && x.type === 14)) {
      game.effects.print(a.effect_id);
      // weapon_odds field is used to store the chance of hitting, as an integer (not a percentage).
      // to make the saving throw, the player rolls 1 d (agility) and has to be above that number.
      if (game.diceRoll(1, game.player.agility) > a.weapon_odds) {
        game.history.write("You narrowly avoid the trap!");
      } else {
        // choose targets and deal damage
        let monster_ids = game.monsters.visible.map(x => x.id);
        for (let i = 0; i < a.quantity; i++) {
          let monster_id = Math.floor(Math.random() * monster_ids.length);
          let monster = game.monsters.get(monster_id);
          // damage is stored in dice and sides, just like weapons.
          // the "armor_penalty" field should be either 1 (ignore armor) or 0 (armor absorbs hits)
          monster.injure(game.diceRoll(a.dice, a.sides), a.armor_penalty);
          monster_ids.splice(monster_id, 1);
        }
      }
      a.reveal();
    }

    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    // oak door
    if (room_from.id === 33 && room_to.id === 18 && !game.data['oak door shut']) {
      game.history.write("After you pass through the oak door, you find that it shuts and locks behind you!");
      game.artifacts.get(17).close();
      game.data['oak door shut'] = true;
    }
  },

  "endTurn": function() {
    let game = Game.getInstance();

    // wandering monsters
    if (game.data['wandering monsters'].length > 0) {
      if (game.diceRoll(1, 100) < 7) {
        let index = Math.floor(Math.random() * game.data["wandering monsters"].length);
        console.log('wandering monster index:', index);
        let monster = game.monsters.get(game.data['wandering monsters'][index]);
        console.log('wandering monster id:', monster.id);
        if (monster.room_id === null) {
          game.history.write(monster.name + " walks into the room!");
          monster.moveToRoom();
          game.data["wandering monsters"].splice(index, 1);
        }
      }
    }

    // ring of regen
    if (game.player.isWearing(64)) {
      game.data['regeneration counter']++;
      if (game.data['regeneration counter'] % 5 === 0) {
        game.player.heal(1);
      }
    }

    // sobering up
    if (game.player.agility < game.data["original ag"]) {
      game.data['sober counter']++;
      if (game.data['sober counter'] % 8 === 0) {
        game.player.agility++;
        game.history.write("You seem to be sobering up a little.");
      }
    }

  },

  "endTurn2": function(): void {
    let game = Game.getInstance();

    // fell into the latrine (yuck!)
    if (game.player.room_id === 60) {
      game.die();
    }

  },

  "read": function(arg: string, artifact: Artifact, command: ReadCommand) {
    let game = Game.getInstance();

    if (artifact !== null) {
      if (artifact.id === 18) {
        game.effects.print(5);
        game.player.moveToRoom(58);
        command.markings_read = true;
      } else if (artifact.id === 53) {
        game.history.write('It says "H2SO4"');
        command.markings_read = true;
      } else if (artifact.id === 64) {
        game.history.write('It says "Hale to he who wears this ring!"');
        command.markings_read = true;
      }
    }
    return true;
  },

  "say": function(phrase) {
    let game = Game.getInstance();
    phrase = phrase.toLowerCase();
    if (phrase === 'annal natthrac') {
      if (!game.player.hasArtifact(37)) {
        game.history.write("You don't have the Medallion of Ngurct!");
      } else if (game.data['alkanda summoned']) {
        game.history.write('Nothing happens.');
      } else {
        game.data['alkanda summoned'] = true;
        game.skip_battle_actions = true;
        game.history.write("A whirlwind scatters the dust into a cloud... A figure materializes in the cloud!");
        game.monsters.get(56).moveToRoom();
      }
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact) {
      if (artifact.id === 52) {
        game.history.write("You shudder in disgust as you realize that you've just drunk human blood!", "warning");
        game.history.write("Aside from feeling grossed out, you suffer no ill effects.");
      } else if (artifact.id === 53) {
        game.history.write("It's acid! It touches your lips and burns you something awful!", "warning");
      } else if (artifact.id === 69) {
        game.history.write("You knew the wine was strong, but you drank it anyway. Now, you're roaring drunk and in no shape for combat.", "special");
        game.player.agility /= 2;
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    let game = Game.getInstance();
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
