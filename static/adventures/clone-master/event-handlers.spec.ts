/**
 * Unit tests for Assault on the Clone Master
 */
import {async, getTestBed} from '@angular/core/testing';
import {HttpModule} from '@angular/http';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";
import {Monster} from "../../core/models/monster";

import {
  TestBed, inject
} from '@angular/core/testing';

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
        game.init(data);
        game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests
        // expect(game.rooms.rooms.length).toBe(46, "Wrong room count. Check data.");
        // expect(game.artifacts.all.length).toBe(43 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        // expect(game.effects.all.length).toBe(3, "Wrong effect count. Check data.");
        // expect(game.monsters.all.length).toBe(23, "Wrong monster count. Check data."); // includes player
        game.start();

        // big fight
        game.player.moveToRoom(4, true);
        game.command_parser.run("attack clone army");
        expect(game.effects.get(9).seen).toBeTruthy('effect 9 should be seen');
        expect(game.monsters.get(4).reaction).toBe(Monster.RX_NEUTRAL);
        expect(game.monsters.get(5).reaction).toBe(Monster.RX_NEUTRAL);
        expect(game.monsters.get(6).room_id).toBeNull();
        // main gate blocked
        game.command_parser.run("s");
        expect(game.player.room_id).toBe(4);

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

        // cannon
        game.modal.mock_answers = ['Battlefield', 'Power Station', 'Inner Gate'];
        game.player.moveToRoom(18);
        // todo: move the soliders from the wall
        game.command_parser.run('use cannon');
        expect(game.effects.get(5).seen).toBeTruthy('effect 5 should be seen');
        game.command_parser.run('use cannon');
        expect(game.effects.get(6).seen).toBeTruthy('effect 6 should be seen');
        game.command_parser.run('use cannon');
        expect(game.effects.get(7).seen).toBeTruthy('effect 7 should be seen');
        expect(game.artifacts.get(22).room_id).toBeNull('should have destroyed gate');
        expect(game.artifacts.get(23).room_id).toBe(20, 'broken gate should be there');
        // broken
        expect(game.effects.get(8).seen).toBeTruthy('effect 8 should be seen');
        expect(game.artifacts.get(19).room_id).toBeNull('cannon should have jammed');
        expect(game.artifacts.get(20).room_id).toBe(18, 'broken cannon should be there');

        // dragon
        game.player.moveToRoom(34);
        game.command_parser.run('free dragon');
        expect(game.monsters.get(19).room_id).toBeNull();
        expect(game.monsters.get(20).count).toBe(10);

        // clone room stuff
        game.player.moveToRoom(30);
        game.command_parser.run('attack clonatorium');
        expect(game.effects.get(11).seen).toBeTruthy('effect 11 should be seen');
        expect(game.artifacts.get(34).room_id).toBeNull();
        expect(game.artifacts.get(35).room_id).toBe(30);

      }
    );
  }));

});
