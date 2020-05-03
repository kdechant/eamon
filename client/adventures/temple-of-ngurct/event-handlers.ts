import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

declare var game: Game;

export var event_handlers = {

  "start": function() {
    game.data['oak door shut'] = false;

    game.data['wandering monsters'] = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26];

    // sir charles
    game.monsters.get(32).spells = ['heal'];
    game.monsters.get(32).spell_points = 2;

    // magician
    game.monsters.get(32).spells = ['blast', 'heal'];
    game.monsters.get(32).spell_points = 2;

    // high priest
    game.monsters.get(56).spells = ['blast'];
    game.monsters.get(56).spell_points = 3;

    // alkanda
    game.monsters.get(29).spells = ['blast'];
    game.monsters.get(32).spell_points = 4;

    game.data['regeneration counter'] = 0;
    game.data['alkanda summoned'] = false;
    game.data["original ag"] = game.player.agility;
    game.data["sober counter"] = 0;
    // wand charges
    game.artifacts.get(33).quantity = game.diceRoll(1, 4) + 2;

    // place the mage's body
    game.artifacts.get(32).moveToRoom(
      game.rooms.getRandom([1,2,3,4,5,6,7,8,9,10,11,12,13,14,28,29,30,31,32,41,50,51,52,53]).id
    );

  },

  "attackMonster": function(arg: string, target: Monster) {
    if (game.player.weapon_id === 33) {
      fireball();
      return false;
    }
    return true;
  },

  "afterGet": function(arg, artifact) {
    if (artifact && artifact.id === 41) {
      // scimitar
      game.history.write("Alignment conflict! The evil runes on the scimitar burn with a cold fire against your hand!", "special2");
      game.player.injure(game.diceRoll(1, 8) + 1, true);
    }
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    // traps! (artifact type 14)
    for (let a of game.artifacts.inRoom.filter(x => x.embedded && x.type === 14)) {
      game.effects.print(a.effect_id);
      // weapon_odds field is used to store the chance of hitting, as an integer (not a percentage).
      // to make the saving throw, the player rolls 1 d (agility) and has to be above that number.

      // choose targets and deal damage
      let monster_ids = game.monsters.visible.map(x => x.id);
      monster_ids.push(0);
      for (let i = 0; i < a.quantity; i++) {
        let monster_index = game.diceRoll(1, monster_ids.length) - 1;
        let victim = game.monsters.get(monster_ids[monster_index]);
        if (victim.rollSavingThrow('agility', a.weapon_odds)) {
          game.history.write(victim.name + " narrowly avoids the trap!");
        } else {
          // damage is stored in dice and sides, just like weapons.
          // the "armor_penalty" field should be either 1 (ignore armor) or 0 (armor absorbs hits)
          victim.injure(game.diceRoll(a.dice, a.sides), a.armor_penalty === 1);
        }
        monster_ids.splice(monster_index, 1);
        if (!monster_ids.length) break;  // no more targets left
      }
      a.embedded = false;
    }

    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    // oak door
    if (room_from.id === 33 && room_to.id === 18 && !game.data['oak door shut']) {
      game.history.write("After you pass through the oak door, you find that it shuts and locks behind you!");
      game.artifacts.get(17).close();
      game.data['oak door shut'] = true;
    }
  },

  "endTurn": function() {
    // wandering monsters (not in room 1 because it causes test failures)
    if (game.data['wandering monsters'].length > 0 && game.player.room_id > 1 && !game.skip_battle_actions) {
      if (game.diceRoll(1, 100) <= 9) {
        summon_wandering_monster();
      }
    }

    // ring of regen
    if (game.player.isWearing(64) && game.player.damage > 0) {
      game.data['regeneration counter']++;
      if (game.data['regeneration counter'] % 5 === 0) {
        game.history.write("The Ring of Regeneration is healing you slowly!");
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
    // fell into the latrine (yuck!)
    if (game.player.room_id === 60) {
      game.die();
    }

  },

  "beforeRead": function(arg: string, artifact: Artifact) {
    if (artifact !== null) {
      if (artifact.id === 18) {
        game.effects.print(5);
        game.player.moveToRoom(58);
        return false;
      } else if (artifact.id === 53) {
        game.history.write('It says "H2SO4"');
        return false;
      } else if (artifact.id === 64) {
        game.history.write('It says "Hale to he who wears this ring!"');
        return false;
      }
    }
    return true;
  },

  "say": function(phrase) {
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

  "eat": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 67) {
      game.history.write("You think you know what kind of animal the carcass came from, and you'd rather not eat it.");
      return false;
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.id === 33) {
        fireball();
      } else if (artifact.id === 52) {
        game.history.write("You shudder in disgust as you realize that you've just drunk human blood!", "warning");
        game.history.write("Aside from feeling grossed out, you suffer no ill effects.");
      } else if (artifact.id === 53) {
        game.history.write("It's acid! It touches your lips and burns you something awful!", "warning");
      } else if (artifact.id === 62) {
        // black potion
        game.history.write("A strange sensation comes over you. Your movements seem to quicken, just a little.");
        game.player.agility++;
        game.data["original ag"]++;
      } else if (artifact.id === 69) {
        game.history.write("You knew the wine was strong, but you drank it anyway. Now, you're roaring drunk and in no shape for combat.", "special");
        game.player.agility = Math.floor(game.player.agility / 2);
      }
    }
  },

  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (roll < 20 || game.player.room_id === 58) {
      // teleport to random room
      game.history.write("You are being teleported...");
      let room = game.rooms.getRandom([29,30,31,32,45,46,49,50,51,52,53,55,58]);
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;
    } else if (roll <= 40) {
      game.history.write("The ground shakes! A huge crack appears in the floor...", "warning");
      if (roll <= 30 || game.monsters.visible.length === 0) {
        // affects player
        if (game.player.rollSavingThrow('agility', 10)) {
          game.history.write("You slip down into the crack but hang onto the edge as falling rocks pummel you!", "warning");
          game.player.injure(game.diceRoll(1, 8));
        } else {
          game.history.write("You scream as you fall into the bowels of the Earth!", "danger");
          game.die();
        }
      } else {
        // affects a random monster
        let victim = game.getRandomElement(game.monsters.visible);
        game.history.write(victim.name + ' falls into the crack!', "warning");
        victim.destroy();
      }
    } else if (roll <= 55) {
      game.history.write("The room is lit by a blinding flash!", "special2");
      game.history.write('You hear a thunderous voice commanding: "Mortal! Bother me no more!"', "special2");
    } else if (roll <= 75) {
      // hero
      let hero = game.monsters.get(57);
      if (hero.isHere()) {
        game.history.write("The hero vanishes! (The gods giveth...)", "special");
        hero.destroy();
        return;
      }
      game.history.write("The ground shakes and a thunderclap slams your ears.", "special");
      hero.moveToRoom();
      hero.showDescription();
      hero.seen = true;
    } else if (roll <= 90) {
      summon_wandering_monster();
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

  "exit": function() {
    // have to do some artifact checks before the selling happens
    if (game.player.hasArtifact(37)) {
      game.data['returned medallion'] = true;
      game.artifacts.get(37).destroy();
    }
    return true;
  },

  // event handler that happens at the very end, after the player has sold their treasure to sam slicker
  "afterSell": function() {
    let thera = game.monsters.get(33);
    if (thera.isHere() && thera.reaction !== Monster.RX_HOSTILE) {
      let reward = 500 + (thera.hardiness - thera.damage) * 25;
      game.after_sell_messages.push("Additionally, you receive " + reward + " gold pieces as a reward for the return of Princess Thera.");
      if (game.monsters.get(55).isHere()) {
        game.after_sell_messages.push("Of course, Gonzales takes his half.");
        reward = Math.floor(reward / 2);
      }
      game.player.gold += reward;
    }
    if (game.data['returned medallion']) {
      game.after_sell_messages.push("You also receive 5,000 GP for the return of the Gold Medallion of Ngurct. The king immediately takes it to his wizard, who destroys it.");
      game.player.gold += 5000;
    } else {
      game.after_sell_messages.push("Unfortunately, you have failed in your mission to return the Gold Medallion of Ngurct. Shame! Shame! (And no money.)");
    }
  },

}; // end event handlers

/**
 * Logic to make a wandering monster enter the room
 */
function summon_wandering_monster() {
  if (!game.data['wandering monsters'].length) {
    return;
  }
  let index = Math.floor(game.diceRoll(1, game.data["wandering monsters"].length) - 1);
  let monster = game.monsters.get(game.data['wandering monsters'][index]);
  if (monster.room_id === null) {
    game.history.write(monster.name + " walks into the room!", "warning");
    monster.moveToRoom();
    game.data["wandering monsters"].splice(index, 1);
  }
}

/**
 * The fireball wand logic
 */
function fireball() {
  let wand = game.artifacts.get(33);

  game.modal.show("What is the trigger word?", function (value) {
    if (value === 'fire') {
      let targets: Monster[] = [];
      for (let m of game.monsters.visible.filter(x => x.reaction === Monster.RX_HOSTILE)) {
        if (targets.length < 10) {
          targets.push(m);
        }
      }
      if (targets.length) {
        game.history.write("The room is filled with an incandescent fireball!", "special2");
        for (let target of targets) {
          let damage = game.diceRoll(6, 6);
          // saving throw
          if (target.rollSavingThrow('hardiness', 14)) {
            damage = Math.floor(damage / 2);
          }
          target.injure(damage, true);
        }

        // wand.quantity--;
        if (wand.quantity <= 1) {
          game.history.write("The fireball wand is used up!", "special");
          wand.destroy();
        }

      } else {
        game.history.write("There are no unfriendlies about!");
      }
    } else {
      game.history.write("Wrong! Nothing happens.");
    }
  });
}
