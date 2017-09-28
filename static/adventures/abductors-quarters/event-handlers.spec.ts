/**
 * Unit tests for The Abductor's Quarters
 */
import {async, getTestBed} from '@angular/core/testing';
import {HttpModule} from '@angular/http';
import { CookieService, CookieModule } from 'ngx-cookie';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';

describe("The Abductor's Quarters", function() {

  // to initialize the test, we need to load the whole game data.
  // this requires that a real, live API is running.
  let game = Game.getInstance();
  let gameLoaderService = null;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, CookieModule.forRoot()],
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
        game.history.delay = 0;
        expect(game.rooms.rooms.length).toBe(66, "Wrong room count. Check data.");
        expect(game.artifacts.all.length).toBe(39 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        expect(game.effects.all.length).toBe(2, "Wrong effect count. Check data.");
        expect(game.monsters.all.length).toBe(18 + 1, "Wrong monster count. Check data."); // includes player
        game.start();

        // cave in
        game.player.moveToRoom(3);
        game.command_parser.run('e');
        expect(game.effects.get(1).seen).toBeTruthy("Effect 1 should be seen");

        // golden sword
        let sword = game.artifacts.get(20);
        game.player.moveToRoom(sword.room_id);
        game.artifacts.updateVisible();
        game.command_parser.run("get golden sword");
        console.log(game.history.history);
        expect(game.player.hasArtifact(20)).toBeTruthy("Failed to pick up golden sword");
        expect(game.player.weapon_id).toBe(20);
        game.command_parser.run("drop golden sword");
        expect(game.player.hasArtifact(20)).toBeTruthy("Should not be able to drop golden sword");
        game.command_parser.run("ready firebrand"); // weapon from mock data
        expect(game.player.hasArtifact(20)).toBeTruthy("Should not be able to ready other weapon");

        // saying things
        game.command_parser.run("say gilgamesh");
        expect(sword.monster_id).toBeNull("sword should disappear");
        expect(game.monsters.get(15).room_id).toBe(game.player.room_id, "Demon should be here");
        let anderhauf = game.artifacts.get(17);
        anderhauf.moveToRoom();
        game.player.pickUp(anderhauf);
        game.command_parser.run("say anderhauf");
        expect(anderhauf.monster_id).toBeNull("anderhauf should disappear");

        // bottle
        let flint = game.artifacts.get(8);
        let bottle = game.artifacts.get(10);
        let doorway = game.artifacts.get(11);
        let doorway2 = game.artifacts.get(11);
        game.player.moveToRoom(37);
        bottle.moveToRoom();
        flint.moveToRoom();
        game.command_parser.run("light bottle");
        expect(bottle.room_id).toBeNull("bottle should disappear");
        expect(doorway.room_id).toBeNull("bricked doorway should disappear");
        expect(doorway2.room_id).toBeNull("bricked doorway 2 should disappear");

      }
    );
  }));

});
