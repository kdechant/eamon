/**
 * Unit tests for {base adventure}
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

var game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = '{put your adventure slug here}';
  return initLiveGame(game);
});

// TESTS

it("should have working event handlers", () => {
  // do some game actions and write assertions here

  // for example:
  expect(game.rooms.getRoomById(1)).not.toBeNull();

  // uncomment the following for debugging
  // game.history.history.map(() => console.log(h); });

});
