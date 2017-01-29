/**
 * Unit tests for Cave of the Mind
 */
import {async, getTestBed} from '@angular/core/testing';
import {HttpModule} from '@angular/http';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';

describe("Cave of the Mind", function() {

  // to initialize the test, we need to load the whole game data.
  // this requires that a real, live API is running.
  let game = Game.getInstance();
  let gameLoaderService = null;
  beforeEach(async(() => {
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
        expect(game.rooms.rooms.length).toBe(32, "Wrong room count. Check data.");
        expect(game.artifacts.all.length).toBe(51 + 16 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        expect(game.effects.all.length).toBe(15, "Wrong effect count. Check data.");
        expect(game.monsters.all.length).toBe(16, "Wrong monster count. Check data."); // includes player

        expect(game.monsters.get(12).name).toBe("The Mind");
        game.start();
        expect(game.monsters.get(12).combat_verbs.length).toBe(3);

        // use the miner's pick
        game.player.moveToRoom(5);
        game.artifacts.get(19).reveal();
        game.triggerEvent("use", "", game.artifacts.get(7));
        expect(game.artifacts.get(19).room_id).toBeNull();
        expect(game.artifacts.get(18).room_id).toBe(5);

        // use the potion
        let p = game.artifacts.get(16);
        game.triggerEvent("use", "potion", p);
        expect(game.history.getLastOutput().text).toBe(game.effects.get(10).text);
        expect(game.won).toBeTruthy();

        // inscription
        game.mock_random_numbers = [1, 2, 3];
        expect(game.player.inventory.length).toBe(5);
        game.triggerEvent("beforeRead", "", game.artifacts.get(17));
        expect(game.player.inventory.length).toBe(2, "Player weapons did not disappear");
        expect(game.artifacts.get(68).room_id).toBe(1);
        expect(game.artifacts.get(69).room_id).toBe(2);
        expect(game.artifacts.get(70).room_id).toBe(3);

        // power spell effects
        game.triggerEvent("power", 20);
        expect(game.history.getLastOutput().text).toBe("You hear a loud sonic boom which echoes all around you!");
        game.mock_random_numbers = [16];
        game.triggerEvent("power", 51);
        expect(game.history.getLastOutput().text).toBe("You are being teleported...");
        expect(game.player.room_id).toBe(16);

      }
    );
  }));

});
