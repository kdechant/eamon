/**
 * Unit tests for The Prince's Tavern
 */
import {async, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {custom_commands} from "./commands";
import {Monster} from "../../core/models/monster";

import {
  TestBed, inject
} from '@angular/core/testing';

describe("The Prince's Tavern", function() {

  // to initialize the test, we need to load the whole game data.
  // this requires that a real, live API is running.
  let game = Game.getInstance();
  let gameLoaderService = null;
  beforeEach(async(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // avoid errors due to slow api calls
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [
        GameLoaderService, CookieService
      ]
    });
    gameLoaderService = getTestBed().get(GameLoaderService);
  }));

  it("should have working custom commands", async(() => {
    gameLoaderService.setupGameData(true).subscribe(
      data => {
        game.init(data);
        game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests
        game.start();

        // before active
        game.command_parser.run("locate rum", false);
        expect(game.history.getLastOutput().text).toBe("Nothing happens.");

        // after active
        game.data['locate active'] = true;
        game.command_parser.run("locate rum", false);
        expect(game.history.getLastOutput().text).toBe("Case of rum is in a supply room.");
        game.command_parser.run("locate firebox", false);
        expect(game.history.getLastOutput().text).toBe("Firebox is being carried by the prince.");
        game.command_parser.run("locate timmy", false);
        expect(game.history.getLastOutput().text).toBe("Timmy is in the nursery.");
        game.command_parser.run("locate pink elephant", false);
        expect(game.history.getLastOutput().text).toBe("Pink elephant could not be located.");
        game.command_parser.run("locate asdf", false);
        expect(game.history.getLastOutput().text).toBe("Asdf could not be located.");

      }
    );
  }));

});
