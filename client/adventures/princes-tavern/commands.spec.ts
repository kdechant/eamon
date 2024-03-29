/**
 * Unit tests for The Prince's Tavern
 */
import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {initLiveGame} from "../../core/utils/testing";
import {event_handlers} from "./event-handlers";
import {custom_commands} from "./commands";
import {drunk_messages} from "./event-handlers";

// SETUP

const game = new Game();

beforeAll(() => { global['game'] = game; });
afterAll(() => { delete global['game']; });

// to initialize the test, we need to load the whole game data.
// this requires that a real, live API is running.
beforeEach(() => {
  game.registerAdventureLogic(event_handlers, custom_commands);
  game.slug = 'princes-tavern';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working custom commands", () => {

  // before active
  game.command_parser.run("locate rum");
  expect(game.history.getOutput().text).toBe("Nothing happens.");

  // after active
  game.data['locate active'] = true;
  game.command_parser.run("locate rum");
  expect(game.history.getOutput(0).text).toBe("Your mind reaches beyond your body...");
  expect(game.history.getOutput(1).text).toBe("Case of rum is in a supply room.");
  game.command_parser.run("locate firebox");
  expect(game.history.getOutput(1).text).toBe("Firebox is being carried by the prince.");
  game.command_parser.run("locate timmy");
  expect(game.history.getOutput(1).text).toBe("Timmy is in the nursery.");
  game.command_parser.run("locate pink elephant");
  expect(game.history.getOutput(1).text).toBe("Pink elephant could not be located.");
  game.command_parser.run("locate asdf");
  expect(game.history.getOutput(1).text).toBe("Asdf could not be located.");

});
