/**
 * Unit tests for The Beginner's Cave
 */
import {async, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieModule } from 'ngx-cookie';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';

describe("The Beginner's Cave", function() {

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
        expect(game.rooms.rooms.length).toBe(26, "Wrong room count. Check data.");
        expect(game.artifacts.all.length).toBe(24 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        expect(game.effects.all.length).toBe(12, "Wrong effect count. Check data.");
        expect(game.monsters.all.length).toBe(9, "Wrong monster count. Check data."); // includes player
        game.start();

        // ready weapon
        expect(game.player.weapon_id).toBe(27, "player starts with different weapon than expected.");
        game.command_parser.run("ready firebrand");
        expect(game.player.weapon_id).toBe(26, "player didn't ready firebrand as expected");
        let tr = game.artifacts.get(10);
        tr.moveToRoom();
        game.player.pickUp(tr);
        game.command_parser.run("ready trollsfire");
        expect(game.player.weapon_id).toBe(10, "player didn't ready trollsfire as expected");
        game.command_parser.run("trollsfire");
        expect(tr.is_lit).toBeTruthy();
        expect(tr.inventory_message).toBe("glowing");
        game.command_parser.run("ready firebrand");
        expect(tr.is_lit).toBeFalsy();
        expect(tr.inventory_message).toBe("");

      }
    );
  }));

});
