/**
 * This file contains some helper functions used during unit testing.
 */
import {Game} from "../../core/models/game";

// import the mock data.
// (still importing these files as typescript files because it's unclear how to read directly from JSON.)
import {ADVENTURE} from "../../adventures/demo1/mock-data/adventure.js";
import {ROOMS} from "../../adventures/demo1/mock-data/rooms.js";
import {ARTIFACTS} from "../../adventures/demo1/mock-data/artifacts.js";
import {EFFECTS} from "../../adventures/demo1/mock-data/effects.js";
import {MONSTERS} from "../../adventures/demo1/mock-data/monsters.js";
import {PLAYER} from "../../adventures/demo1/mock-data/player.js";


/**
 * Init from the mock data. Used in the unit tests.
 */
export function initMockGame() {
  let game = Game.getInstance();
  let HINTS = [];  // there is no mock data for hints yet
  game.init([ADVENTURE, ROOMS, ARTIFACTS, EFFECTS, MONSTERS, HINTS, PLAYER]);
  game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests
  game.start();
}
