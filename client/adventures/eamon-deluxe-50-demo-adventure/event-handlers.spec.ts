
/**
 * Unit tests for the demo adventure. Also includes general tests of the built-in event
 * handlers. (Because this adventure includes one of every type of artifact, monster,
 * etc. and has minimal custom code.)
 */
import Game from "../../core/models/game";
import {
  initLiveGame,
  expectEffectSeen,
  expectEffectNotSeen,
  playerHit,
  movePlayer,
  expectMonsterIsHere, expectArtifactIsNotHere, runCommand, expectArtifactIsHere, expectMonsterIsNotHere
} from "../../core/utils/testing";
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
  game.slug = 'eamon-deluxe-50-demo-adventure';
  return initLiveGame(game);
});

// uncomment the following for debugging
// afterEach(() => { game.history.history.map((h) => console.log(h.command, h.results)); });

// TESTS

it("should have working event handlers", () => {
  // some tests of the core game engine - put here because this is a basic adventure with stuff we can try
  game.command_parser.run("open door");
  expect(game.history.getOutput(0)?.text).toBe(game.artifacts.get(1)?.description);
  expect(game.history.getOutput(1)?.text).toBe("That's not something you can open.");
  game.command_parser.run("open spaceship");
  expect(game.history.getOutput(0)?.text).toBe("I don't see a spaceship here!");
  const mailbox = game.artifacts.get(3);
  game.command_parser.run("look mailbox");
  expect(game.history.getOutput(0)?.text).toBe(mailbox?.description);
  expect(mailbox?.embedded).toBeFalsy();

  // GET/DROP stuff
  game.command_parser.run("open mailbox");
  expect(game.history.getOutput(0)?.text).toBe("Mailbox opened.");
  expect(mailbox?.is_open).toBeTruthy();

  game.command_parser.run("get paper"); // inside mailbox
  expect(game.player.hasArtifact(4)).toBeTruthy();

  movePlayer(7); // kitchen
  game.command_parser.run('get knife');
  expect(game.player.hasArtifact(11)).toBeTruthy();
  expect(game.player.hasArtifact(12)).toBeFalsy();
  game.command_parser.run('drop knife');
  expect(game.player.hasArtifact(11)).toBeFalsy();

  game.artifacts.get(55)?.moveToRoom(); // bed - not gettable
  game.command_parser.run('get all');
  expect(game.player.hasArtifact(11)).toBeTruthy();
  expect(game.player.hasArtifact(12)).toBeTruthy();
  expect(game.player.hasArtifact(55)).toBeFalsy();
  game.command_parser.run('drop knife');
  game.command_parser.run('drop sandwich');
  expect(game.player.hasArtifact(11)).toBeFalsy();
  expect(game.player.hasArtifact(12)).toBeFalsy();

  game.command_parser.run('get'); // 'get' with no target === 'get all'
  expect(game.player.hasArtifact(11)).toBeTruthy();
  expect(game.player.hasArtifact(12)).toBeTruthy();
  expect(game.player.hasArtifact(55)).toBeFalsy();

  // ATTACK
  movePlayer(6); // bedroom
  game.player.combat_verbs = ['attacks']; // force generic attack messages
  game.command_parser.run('attack');
  expect(game.history.getOutput(0)?.text).toBe("Birgitte attacks Ogre");

});
