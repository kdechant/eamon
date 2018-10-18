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
import {Monster} from "../../core/models/monster";

describe("Temple of the Trolls tests", function() {

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

        game.player.moveToRoom(5);
        game.command_parser.run('look adventurer');
        expect(game.artifacts.get(32).isHere).toBeTruthy('artifact 32 did not appear');
        expect(game.artifacts.get(33).isHere).toBeTruthy('artifact 33 did not appear');
        game.command_parser.run('get all');

        // spells
        let original_ac = game.player.armor_class;
        game.command_parser.run('say qorgaw');
        expect(game.player.spell_counters['qorgaw']).toBeGreaterThan(0);
        expect(game.player.armor_class).toBe(original_ac + 3);
        game.command_parser.run('say trezore');
        expect(game.player.spell_counters['trezore']).toBeGreaterThan(0);

        // other say command uses
        game.command_parser.run('say info');
        expect(game.history.getOutput(1).text).toBe('The magic words the king told you are: ' + game.data['active words']);

        // king
        game.player.moveToRoom(8);
        game.tick();
        expect(game.effects.get(14).seen).toBeTruthy('effect 14 should have been seen');
        expect(game.data['holfane speaks']).toBe(1, 'king flag should change from 0 to 1');
        game.command_parser.run("give scroll to king");
        expect(game.effects.get(24).seen).toBeTruthy('effect 24 should have been seen');
        expect(game.effects.get(23).seen).toBeFalsy('effect 23 should NOT have been seen');
        game.command_parser.run("give token to king");
        expect(game.effects.get(9).seen).toBeTruthy('effect 9 should have been seen');
        expect(game.data['holfane speaks']).toBe(4, 'king flag should change from 0 to 1');

        // wenda
        let wenda = game.monsters.get(3);
        wenda.reaction = Monster.RX_NEUTRAL;  // she has random friendliness, but needs to be neutral for the test
        game.player.moveToRoom(16);
        game.tick();
        expect(wenda.reaction).toBe(Monster.RX_NEUTRAL, 'wenda should start out neutral');
        game.command_parser.run('kiss wenda');
        expect(wenda.reaction).toBe(Monster.RX_NEUTRAL, 'wenda should not react to female char');
        game.player.gender = 'm';
        game.command_parser.run('kiss wenda');
        expect(wenda.reaction).toBe(Monster.RX_FRIEND, 'wenda should react to male char');

        // two-sided secret door
        game.command_parser.run('ex rock');
        expect(game.artifacts.get(47).embedded).toBeFalsy('should have shown art #47');
        expect(game.artifacts.get(48).embedded).toBeFalsy( 'should have shown art #48');

        // temple door
        game.command_parser.run('d');
        game.command_parser.run('s');
        expect(game.artifacts.get(46).is_open).toBeFalsy('door should start closed');
        game.command_parser.run('open marble door');
        expect(game.artifacts.get(46).is_open).toBeFalsy('door should still be closed');
        game.command_parser.run('say ' + game.data['active words']);
        expect(game.artifacts.get(46).is_open).toBeTruthy('door should be open');
        game.command_parser.run('s');
        expect(game.player.room_id).toBe(25, 'player did not move through door');

        // ulik
        let ulik = game.monsters.get(8);
        game.tick();
        game.player.moveToRoom(53);
        game.artifacts.get(32).moveToInventory();
        game.player.updateInventory();
        game.command_parser.run('s');
        expect(game.history.getOutput(0).text).toBe("Ulik won't let you pass!");
        expect(game.player.room_id).toBe(53, 'player should not have moved');
        game.command_parser.run('kiss ulik');
        expect(game.effects.get(15).seen).toBeTruthy('effect 15 should have been seen');
        expect(ulik.room_id).toBeNull("ulik should have left");
        ulik.moveToRoom();
        game.command_parser.run('give ' + game.player.weapon.name + ' to ulik');
        expect(game.effects.get(15).seen).toBeTruthy('effect 21 should have been seen');
        expect(ulik.room_id).toBeNull("ulik should have left");
        ulik.moveToRoom();
        game.command_parser.run('give token to ulik');
        expect(game.effects.get(15).seen).toBeTruthy('effect 22 should have been seen');
        expect(ulik.room_id).toBeNull("ulik should have left");

        // wangba
        game.tick();
        game.player.moveToRoom(58);
        game.artifacts.get(38).moveToInventory();
        game.player.updateInventory();
        game.command_parser.run('give jug of Grog to wangba');
        expect(game.monsters.get(6).reaction).toBe(Monster.RX_FRIEND, 'wangba should be friendly');

        // grommick
        game.tick();
        game.player.moveToRoom(54);
        game.artifacts.get(15).moveToInventory();
        game.artifacts.get(23).moveToInventory();
        game.artifacts.get(24).moveToInventory();
        game.artifacts.get(25).moveToInventory();
        game.player.updateInventory();
        game.command_parser.run('give shield to grommick');
        expect(game.history.getOutput(0).text).toBe('Grommick shrugs and says, "I have no use for that."');
        game.command_parser.run('give sword blank to grommick');
        expect(game.history.getOutput(1).text).toBe('Grommick smiles and says, "I\'ll need a magic power source."');
        game.command_parser.run('give amulet to grommick');
        expect(game.history.getOutput(1).text).toBe('Grommick smiles and says, "I\'ll need a suitable reward."');
        game.command_parser.run('give red diamond to grommick');
        expect(game.effects.get(2).seen).toBeTruthy('should have seen effect #2');
        expect(game.artifacts.get(37).sides).toBe(10, 'wrong weapon sides');
        expect(game.player.room_id).toBe(63, 'player did not move');

        for (let h of game.history.history) {
          console.log(h);
        }
      }
    );
  }));

});
