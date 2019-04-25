import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {CommandException} from "../../core/utils/command.exception";

export var custom_commands = [];

custom_commands.push({
  name: "smile",
  verbs: ["smile","grin"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    if (game.monsters.visible.length === 0) {
      game.history.write("Ok. 😃");
      game.history.write("You know…you look a bit dim, smiling like that, when no one's around.");
      return;
    }
    let friends = game.monsters.visible.filter(m => (m.reaction == Monster.RX_FRIEND));
    let neutrals = game.monsters.visible.filter(m => (m.reaction == Monster.RX_NEUTRAL));
    let hostiles = game.monsters.visible.filter(m => (m.reaction == Monster.RX_HOSTILE));
    if (friends.length > 0) {
      game.history.write(formatMonsterAction(friends, "smiles back.", "smile back. (Kinda creepy!)"));
    }
    if (neutrals.length > 0) {
      game.history.write(formatMonsterAction(neutrals, "ignores you.", "ignore you."));
    }
    if (hostiles.length > 0) {
      game.history.write(formatMonsterAction(hostiles, "scowls at you.", "scowl at you…in unison!"));
    }
  }
});

custom_commands.push({
  name: "throw",
  verbs: ["throw","toss","chuck","heave"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    let artifact = game.artifacts.getLocalByName(arg);
    // the Holy Hand Grenade
    if (artifact && artifact.id === 1 && game.player.hasArtifact(1)) {
      game.effects.print(48); // BOOM!
      artifact.destroy();
      game.monsters.visible.forEach(function(monster){
        if ((monster.id > 6) && (monster.id != 25) && (monster.id != 26) && (monster.id != 34)) {
          monster.injure(1000);
        }
      });
      return;
    }
    game.effects.print(49);
  }
});

custom_commands.push({
  name: "buy",
  verbs: ["buy","purchase"],
  run: function(verb: string, arg: string): void {
    let game = Game.getInstance();
    let artifact = game.artifacts.getByName(arg);
    if (artifact && (artifact.id == 3) && game.monsters.get(13).isHere()) {
      if (artifact.monster_id === Monster.PLAYER) {
        game.effects.print(62); // you already have one
        return;
      }
      if (game.player.gold < 50) {
        game.effects.print(61); // you can't afford it
        return;
      }
      game.effects.print(63);
      game.player.gold -= 50;
      artifact.room_id = null;
      artifact.monster_id = Monster.PLAYER;
      game.player.updateInventory();
      return;
    }
    if (!artifact || !artifact.isHere()) {
      game.history.write("Huh?");
      return;
    }
    game.effects.print(60); // that's not for sale
  }
});

export function formatMonsterAction(monsters: Monster[], singularAction: string, pluralAction: string): string {
  let game = Game.getInstance();
  let plural = false;
  let output: string = "";
  if (monsters.length > 1) { plural = true; }
  for (let i = 0; i < monsters.length; i++) {
    let count = 1;
    if (monsters[i].count > 1) { count = monsters[i].children.filter(m => m.isHere()).length; }
    if (count == 1) {
      output += monsters[i].name;
    } else {
      output += `${count} ${monsters[i].name_plural}`;
      plural = true;
    }
    if ((monsters.length > 2) && (i < (monsters.length - 1))) { output += ","; }
    output += " ";
    if (i == (monsters.length - 2)) { output += "and "; }
  }
  if (plural) {
    output += ` ${pluralAction}`;
  } else {
    output+= ` ${singularAction}`;
  }
  return output;
}
