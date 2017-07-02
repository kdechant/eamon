/**
 * Unit tests for Assault on the Clone Master
 */
import {async, getTestBed} from '@angular/core/testing';
import {HttpModule} from '@angular/http';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";
import {Monster} from "../../core/models/monster";

import {drunk_messages} from "adventure/event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';
import {DummyLoggerService} from "../../core/services/logger.service";

describe("Assault on the Clone Master", function() {

  // to initialize the test, we need to load the whole game data.
  // this requires that a real, live API is running.
  let game = Game.getInstance();
  let gameLoaderService = null;
  beforeEach(async(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // avoid errors due to slow api calls
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        GameLoaderService
      ]
    });
    gameLoaderService = getTestBed().get(GameLoaderService);
  }));

  it("should have working event handlers", async(() => {
    gameLoaderService.setupGameData(true).subscribe(
      data => {
        game.logger = new DummyLoggerService;
        game.init(data);
        game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests
        // expect(game.rooms.rooms.length).toBe(46, "Wrong room count. Check data.");
        // expect(game.artifacts.all.length).toBe(43 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        // expect(game.effects.all.length).toBe(3, "Wrong effect count. Check data.");
        // expect(game.monsters.all.length).toBe(23, "Wrong monster count. Check data."); // includes player
        game.start();

        // blow stuff up
        game.player.moveToRoom(2);
        game.player.pickUp(game.artifacts.get(5));
        game.player.moveToRoom(6);
        game.player.drop(game.artifacts.get(5));
        game.command_parser.run("light dynamite", false);
        expect(game.artifacts.get(5).room_id).toBeNull();
        expect(game.artifacts.get(6).room_id).toBeNull();
        expect(game.artifacts.get(9).room_id).toBe(6);
        expect(game.artifacts.get(10).room_id).toBe(11);
        expect(game.effects.get(1).seen).toBeTruthy('effect 1 should be seen');

        // inner gate
        game.player.moveToRoom(20);
        expect(game.artifacts.get(22).is_open).toBeFalsy('gate should not be open');
        game.player.moveToRoom(14);
        game.player.pickUp(game.artifacts.get(30));
        game.player.wear(game.artifacts.get(30));
        game.player.moveToRoom(20);
        game.tick();
        expect(game.effects.get(2).seen).toBeTruthy('effect 2 should be seen');
        expect(game.artifacts.get(22).is_open).toBeTruthy('gate should be open');

        game.command_parser.run('s');
        // should prop open the gates, if they are still intact
        expect(game.data['inner gate open']).toBeTruthy('inner gate flag not set');
        expect(game.effects.get(3).seen).toBeTruthy('effect 3 should be seen');
        expect(game.artifacts.get(22).is_open).toBeTruthy('gate should be open');
        game.player.moveToRoom(20);
        game.command_parser.run('close gate');
        expect(game.artifacts.get(22).is_open).toBeTruthy('gate should not have closed');

      }
    );
  }));

});
