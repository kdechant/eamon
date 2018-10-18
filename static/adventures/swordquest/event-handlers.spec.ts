/**
 * Unit tests for SwordQuest
 */
import {async, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "./event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';
import {Monster} from "../../core/models/monster";

describe("SwordQuest", function() {

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
        expect(game.rooms.rooms.length).toBe(95, "Wrong room count. Check data.");
        expect(game.artifacts.all.length).toBe(109 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        expect(game.effects.all.length).toBe(23, "Wrong effect count. Check data.");
        expect(game.monsters.all.length).toBe(53 + 1, "Wrong monster count. Check data."); // includes player
        game.start();

        // guards
        game.mock_random_numbers = [1];
        game.player.moveToRoom(2);
        game.tick();
        expect(game.effects.get(5).seen).toBeTruthy("palace guards: did not show effect 5");
        expect(game.died).toBeTruthy("palace guards: player should be dead");
        // random player death effect (mocked to always show #16)
        expect(game.effects.get(16).seen).toBeTruthy("palace guards: did not show effect 16");

        // reactivate the game after dying
        game.player.damage = 0;
        game.active = true;
        game.died = false;

        // merlin
        game.player.moveToRoom(77);
        game.tick();
        expect(game.effects.get(11).seen).toBeTruthy("did not show effect 11");
        expect(game.monsters.get(48).room_id).toBe(77, "merlin did not appear");

        // mithra spells
        let dragon = game.monsters.get(44);
        game.player.moveToRoom(69);
        dragon.checkReaction();
        game.command_parser.run('say pax mithrae', false);
        expect(dragon.reaction).toBe(Monster.RX_HOSTILE, "pax should not work without artifacts");
        game.command_parser.run('say vincere in nominis mithrae', false);
        expect(dragon.isHere()).toBeTruthy("vincere should not work without artifacts");
        // again, with the proper artifacts
        game.artifacts.get(4).moveToInventory();
        game.artifacts.get(5).moveToInventory();
        game.artifacts.get(6).moveToInventory();
        game.player.updateInventory();
        game.command_parser.run('say pax mithrae', false);
        expect(game.effects.get(3).seen).toBeTruthy("did not show effect 3");
        expect(dragon.reaction).toBe(Monster.RX_NEUTRAL, "pax should make dragon neutral");
        game.command_parser.run('say vincere in nominis mithrae', false);
        expect(game.effects.get(2).seen).toBeTruthy("did not show effect 2");
        expect(dragon.isHere()).toBeFalsy("vincere should make dragon disappear");

        // morgan le fay and excalibur
        game.player.moveToRoom(82);
        expect(game.artifacts.get(2).isHere()).toBeTruthy('excalibur should be encased');
        game.monsters.get(38).injure(50);
        expect(game.effects.get(12).seen).toBeTruthy("did not show effect 12");
        expect(game.artifacts.get(32).isHere()).toBeTruthy('excalibur should be free');
        expect(game.artifacts.get(2).isHere()).toBeFalsy('encased excalibur should be gone');

        // exit with excalibur
        let ex = game.artifacts.get(32);
        ex.moveToInventory();
        game.player.updateInventory();
        game.exit();
        expect(game.effects.get(23).seen).toBeTruthy("exit w/ excalibur: did not show effect 23");
        expect(game.player.gold).toBe(5200, "exit w/ excalibur: should have lots of gold");

        // reactivate the game after testing exit
        game.active = true;
        game.won = false;

        // ready excalibur
        ex.moveToInventory();
        game.player.updateInventory();
        game.command_parser.run('ready excalibur');
        expect(game.effects.get(13).seen).toBeTruthy("did not show effect 13");
        expect(game.player.hasArtifact(ex.id)).toBeFalsy("lady did not take excalibur")

        // exit without excalibur
        game.exit();
        expect(game.effects.get(14).seen).toBeTruthy("exit w/o excalibur: did not show effect 14");
        expect(game.player.gold).toBe(0, "exit w/o excalibur: should have no gold");
      }
    );
  }));

});
