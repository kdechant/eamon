/**
 * Unit tests for {base adventure}
 */
import Game from "../../core/models/game";
import {Monster} from "../../core/models/monster";
import {Artifact} from "../../core/models/artifact";
import {initLiveGame, expectEffectSeen, expectEffectNotSeen, playerAttackMock, movePlayer} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";

// SETUP

const game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = '{put your adventure slug here}';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

test("effect 1", () => {
  // do some game actions and write assertions here

  // for example:
  expect(game.rooms.get(1)).not.toBeNull();

});

test("effect 2", () => {
  // do some game actions and write assertions here

  // for example:
  expect(game.rooms.get(1)).not.toBeNull();

});
