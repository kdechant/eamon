import {async, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieModule } from 'ngx-cookie';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';
import {Artifact} from "../../core/models/artifact";

describe("Temple of Ngurct tests", function() {

  // to initialize the test, we need to load the whole game data.
  // this requires that a real, live API is running.
  let game = Game.getInstance();
  let gameLoaderService = null;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, CookieModule.forRoot()],
      providers: [
        GameLoaderService, CookieService
      ]
    });
    gameLoaderService = getTestBed().get(GameLoaderService);
  }));

  it("should have working event handlers", async(() => {
    gameLoaderService.setupGameData(true).subscribe(
      data => {
        game.init(data);
        game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests
        game.start();

        // wandering monsters will be a pain for this test. remove them.
        game.data['wandering monsters'] = [];

        // the dead mage's artifacts
        let dm = game.artifacts.get(32);
        expect(dm.room_id).not.toBeNull('dead mage should be placed somewhere');
        dm.moveToRoom(); // this is easier than going to a random room that might have monsters in it
        game.command_parser.run('look dead mage');
        expect(game.artifacts.get(33).room_id).toBe(1, 'wand did not appear');
        expect(game.artifacts.get(64).room_id).toBe(1, 'ring did not appear');

        // oak door
        let door1 = game.artifacts.get(16);
        let door2 = game.artifacts.get(17);
        game.player.moveToRoom(33);
        game.tick();
        game.command_parser.run('open door');
        expect(door1.is_open).toBeTruthy('side 1 did not open');
        expect(door2.is_open).toBeTruthy('side 2 did not open');
        game.command_parser.run('n');
        expect(door1.is_open).toBeFalsy('side 1 did not close');
        expect(door2.is_open).toBeFalsy('side 2 did not close');

        for (let h of game.history.history) {
          console.log(h);
        }
      }
    );
  }));

});
