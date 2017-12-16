import {async, getTestBed} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService, CookieModule } from 'ngx-cookie';

import {Game} from "../../core/models/game";
import {GameLoaderService} from "../../core/services/game-loader.service";
import {event_handlers} from "adventure/event-handlers";

import {
  TestBed, inject
} from '@angular/core/testing';

describe("The Curse of the Hellsblade", function() {

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
        expect(game.rooms.rooms.length).toBe(79, "Wrong room count. Check data.");
        expect(game.artifacts.all.length).toBe(71 + 5, "Wrong artifact count. Check data."); // includes player artifacts
        expect(game.effects.all.length).toBe(20, "Wrong effect count. Check data.");
        expect(game.monsters.all.length).toBe(32, "Wrong monster count. Check data."); // includes player
        game.start();

        // ready weapon
        let hb = game.artifacts.get(25);
        expect(game.player.weapon_id).toBe(25, "player should have hellsblade ready at start.");
        game.command_parser.run("ready firebrand");
        expect(game.player.weapon_id).toBe(73, "player didn't ready firebrand as expected");

        game.command_parser.run("drop hellsblade");
        expect(hb.monster_id).toBe(0, "shouldn't be able to drop hb");

        // a regular container item - to make sure the event handlers don't have side effects
        game.player.moveToRoom(73);
        game.command_parser.run("open chest");
        expect(game.artifacts.get(7).is_open).toBeTruthy("chest didn't open");

        game.artifacts.get(57).moveToRoom();
        game.player.pickUp(game.artifacts.get(57));
        game.command_parser.run("wear gauntlets", false);
        //expect(game.history.getLastOutput().text).toBe("The Hellsblade whines...");

        game.player.moveToRoom(64);
        game.artifacts.get(27).moveToRoom();
        game.command_parser.run("light torch");
        game.command_parser.run("attack guardian", false);
        expect(game.history.getLastOutput().text).toBe("The Guardian pushes you away!", "shouldn't be able to attack guardian");

        game.command_parser.run("open box", false);
        expect(game.history.getLastOutput().text).toBe("The Guardian pushes you away!", "shouldn't be able to open box yet");

        game.command_parser.run("say elizabeth");
        expect(game.data["guardian protects box"]).toBeFalsy("Guardian should step aside");

        game.command_parser.run("open box", false);
        expect(game.artifacts.get(55).is_open).toBeFalsy("box should be locked");

        game.artifacts.get(58).moveToRoom();
        game.artifacts.updateVisible();
        game.command_parser.run("get key");
        game.command_parser.run("open box");
        console.log(game.history)
        expect(game.artifacts.get(55).is_open).toBeTruthy("box didn't open");

        game.command_parser.run("remove scabbard from box");
        game.command_parser.run("get scabbard");
        game.command_parser.run("put hellsblade into scabbard");
        game.command_parser.run("put scabbard into box");
        game.command_parser.run("give gold key to guardian");
        expect(game.data['hb safe']).toBeTruthy("failed to set the safe flag");
        expect(game.artifacts.get(71).room_id).toBe(64, "door didn't appear");

      }
    );
  }));

});
