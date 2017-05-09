/**
 * Unit tests for The Beginner's Cave
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

describe("The Prince's Tavern", function() {

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
        expect(game.rooms.rooms.length).toBe(63, "Wrong room count. Check data.");
        expect(game.artifacts.all.length).toBe(68 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        expect(game.effects.all.length).toBe(43, "Wrong effect count. Check data.");
        expect(game.monsters.all.length).toBe(33, "Wrong monster count. Check data."); // includes player
        game.start();

        // eat peanuts
        game.player.moveToRoom(23);
        game.command_parser.run("eat peanuts");
        expect(game.effects.get(2).seen).toBeTruthy();
        expect(game.player.room_id).toBe(36, "player didn't move to bar after eating peanuts");

        // spell of protection
        game.player.moveToRoom(42);
        game.monsters.get(31).room_id = 42;
        game.triggerEvent("endTurn2");
        expect(game.effects.get(3).seen).toBeTruthy("should show effect 3 in room 42");

        // brawl
        game.player.moveToRoom(game.monsters.get(25).room_id);
        game.triggerEvent('seeRoom');
        expect(game.effects.get(11).seen).toBeTruthy("should show effect 11 when seeing brawl");
        game.triggerEvent('power', 99);
        expect(game.monsters.get(25).room_id).toBeNull();
        expect(game.artifacts.get(13).isHere()).toBeTruthy('amulet should be in room');
        expect(game.effects.get(12).seen).toBeTruthy("should show effect 12 when stopping brawl");

        // mad piano player
        game.player.moveToRoom(game.monsters.get(6).room_id);
        game.command_parser.run("say gronk");
        expect(game.effects.get(43).seen).toBeTruthy("effect 43 not shown");
        game.artifacts.get(8).monster_id = Monster.PLAYER;
        game.artifacts.get(8).room_id = null;
        game.player.updateInventory();
        expect(game.player.hasArtifact(8)).toBeTruthy("player didn't get artifact 8");
        game.command_parser.run("give lamp to mad piano player");
        expect(game.effects.get(37).seen).toBeTruthy("effect 37 not shown");

        // hokas tokas
        game.player.moveToRoom(game.monsters.get(32).room_id);
        expect(game.data['locate active']).toBeFalsy('FAIL: Locate should not be active yet');
        game.artifacts.get(13).monster_id = Monster.PLAYER;
        game.player.updateInventory();
        expect(game.player.hasArtifact(13)).toBeTruthy("player didn't get artifact 13");
        game.command_parser.run("give silver amulet to hokas tokas");
        expect(game.effects.get(13).seen).toBeTruthy("effect 13 not shown");
        expect(game.effects.get(14).seen).toBeTruthy("effect 14 not shown");
        expect(game.data['locate active']).toBeTruthy('FAIL: Locate should be active');

        // gerschter bar
        game.player.moveToRoom(7);
        game.command_parser.run('speed');
        expect(game.effects.get(10).seen).toBeTruthy();

      }
    );
  }));

});
