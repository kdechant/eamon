import {async, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "./event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';
import {Artifact} from "../../core/models/artifact";

describe("Devil's Dungeon tests", function() {

  // to initialize the test, we need to load the whole game data.
  // this requires that a real, live API is running.
  let game = Game.getInstance();
  let gameLoaderService = null;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
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

        game.player.moveToRoom(2);
        game.artifacts.get(10).moveToInventory();
        game.player.updateInventory();
        game.modal.mock_answers = ['no'];
        game.command_parser.run('n');
        expect(game.player.room_id).toBe(2, 'player should not move');
        game.modal.mock_answers = ['Yes'];
        game.command_parser.run('n');
        expect(game.player.room_id).toBe(3, 'player should move');

        // blarney stone
        game.player.moveToRoom(20);
        game.monsters.get(8).destroy();
        let prev_ch = game.player.charisma;
        game.command_parser.run('kiss blarney stone');
        expect(game.player.charisma).toBe(prev_ch + 1, 'ch did not increase');
        game.command_parser.run('kiss blarney stone');
        expect(game.history.getOutput().text).toBe("Sorry, only one kiss per customer!", "wrong message for second kiss");
        expect(game.player.charisma).toBe(prev_ch + 1, 'ch should only increase once');

        // pickle
        game.player.moveToRoom(7);
        game.command_parser.run('say pickle');
        expect(game.artifacts.get(19).room_id).toBeNull('scroll should disappear');
        expect(game.artifacts.get(41).room_id).toBe(7, 'pickle should appear');

        console.log(game.history);
      }
    );
  }));

});
