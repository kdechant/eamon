import Game from "../models/game";
import {Monster} from "../models/monster";

declare var game: Game;

export function gamevars(value) {
  if (typeof value === "undefined") {
    return "";
  } else {
    if (game.player) {
      return value.replace("{{name}}", game.player.name);
    }
    return value;
  }
}

/**
 * Formats a string showing one or more monsters doing something
 * @param {Monster[]} monsters
 * @param {string} singularAction
 * @param {string} pluralAction
 */
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
