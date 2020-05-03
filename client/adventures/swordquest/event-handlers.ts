import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";

declare var game: Game;

export var event_handlers = {

  "start": function() {
    // custom attack messages
    game.monsters.get(44).combat_verbs = ["claws at", "breathes fire at", "slashes at"];

    // merlin's spells
    game.monsters.get(48).spells = ['blast', 'heal'];
    game.monsters.get(48).spell_points = 10;
    game.monsters.get(48).spell_frequency = 40;

  },

  "death": function(monster: Monster) {
    // player
    if (monster.id === 0) {
      game.history.write("In your last conscious moments, you think:");
      let rl = game.diceRoll(1, 7);
      game.effects.print(rl + 15);
    }
    // morgan/excalibur
    if (monster.id === 38) {
      game.effects.print(12);
      game.artifacts.get(2).destroy();
      game.artifacts.get(32).moveToRoom();
    }
    return true;
  },

  "endTurn": function() {
    // merlin
    if (game.player.room_id == 77 && !game.effects.get(11).seen) {
      game.effects.print(11);
      game.monsters.get(48).moveToRoom();
    }
  },

  "endTurn2": function() {
    // palace guards
    if (game.artifacts.get(104).isHere()) {
      game.effects.print(5);
      game.die();
    }
  },

  "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact) {
    // Ready excalibur
    if (new_wpn.id === 32) {
      game.effects.print(13);
      new_wpn.destroy();
      game.effects.print(1);
      let r2 = game.diceRoll(1, 75);
      game.player.moveToRoom(r2);
      return false;
    }
    return true;
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();
    if (phrase === 'via mithrae') {
      if (game.player.hasArtifact(4) && game.player.hasArtifact(5)) {
        game.effects.print(1);
        let r2 = game.diceRoll(1, 95);
        game.player.moveToRoom(r2);
      }
    } else if (phrase === 'pax mithrae') {
      if (game.player.hasArtifact(4) && game.player.hasArtifact(5)) {
        game.effects.print(3);
        game.monsters.get(44).reaction = Monster.RX_NEUTRAL;
      }
    } else if (phrase === 'vincere in nominis mithrae') {
      if (game.player.hasArtifact(4) && game.player.hasArtifact(5) && game.player.hasArtifact(6)) {
        game.effects.print(2);
        game.monsters.get(44).destroy();
      }
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (roll <= 90) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

  "exit": function() {
    if (game.player.hasArtifact(32)) {
      game.effects.print(23);
      game.player.gold += 5000;
    } else {
      game.effects.print(14);
      game.player.gold = 0;
      for (let a of game.player.inventory) {
        a.destroy();
      }
    }
    return true;
  }

}; // end event handlers
