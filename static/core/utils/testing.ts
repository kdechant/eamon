/**
 * This file contains some helper functions used during unit testing.
 */
import {Game} from "../../core/models/game";

// import the mock data.
// (still importing these files as typescript files because it's unclear how to read directly from JSON.)
import {ADVENTURE} from "../../adventures/demo1/mock-data/adventure";
import {ROOMS} from "../../adventures/demo1/mock-data/rooms";
import {ARTIFACTS} from "../../adventures/demo1/mock-data/artifacts";
import {EFFECTS} from "../../adventures/demo1/mock-data/effects";
import {MONSTERS} from "../../adventures/demo1/mock-data/monsters";
import {PLAYER} from "../../adventures/demo1/mock-data/player";

/**
 * Init from the mock data. Used in the unit tests.
 */
export function initMockGame() {
  let game = Game.getInstance();
  game.init([ADVENTURE, ROOMS, ARTIFACTS, EFFECTS, MONSTERS, PLAYER]);
}
