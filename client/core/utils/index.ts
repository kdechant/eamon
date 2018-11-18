import {Game} from "../../../static/core/models/game";

declare var game;

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

export function nl2br(value) {
  return (typeof value === "undefined") ? "" : value.replace(/\n/g, "<br />");
}
