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

describe("Cliffs of Fire tests", function() {

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

        // free elf
        game.player.moveToRoom(6);
        game.command_parser.run('free elf');
        expect(game.artifacts.get(32).isHere()).toBeTruthy('caged elf guarded');
        expect(game.monsters.get(3).isHere()).toBeFalsy('elf should not be free yet');
        game.monsters.get(2).destroy();
        game.command_parser.run('free elf');
        expect(game.artifacts.get(32).isHere()).toBeFalsy('caged elf should disappear');
        expect(game.monsters.get(3).isHere()).toBeTruthy('freed elf should appear');

        // black wand stuff
        game.player.moveToRoom(25);
        // the effect #2 logic doesn't work. See event-handlers.ts
        // game.command_parser.run('w');
        // expect(game.effects.get(2).seen).toBeTruthy('effect 2 was not shown');
        game.artifacts.get(3).moveToInventory();
        game.command_parser.run('wave wand');
        expect(game.effects.get(3).seen).toBeTruthy('effect 3 was not shown');
        expect(game.artifacts.get(13).room_id).toBeNull('stone should have disappeared');

        // power stuff
        console.log(game.player);
        game.triggerEvent('power', 85);
        expect(game.player.damage).toBe(Math.floor(game.player.hardiness / 2), "power didn't injure player");
        game.triggerEvent('power', 99);
        expect(game.player.damage).toBe(0, "power didn't heal player");

        // exit
        game.player.moveToRoom(1);
        game.modal.mock_answers = ['no'];
        game.command_parser.run('n');
        expect(game.won).toBeFalsy('player should not have moved');
        game.modal.mock_answers = ['yes'];
        game.command_parser.run('n');
        expect(game.won).toBeTruthy('player should have moved');

        console.log(game.history);
      }
    );
  }));

});
