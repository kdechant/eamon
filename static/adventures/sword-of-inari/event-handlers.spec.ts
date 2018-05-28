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

describe("Sword of Inari tests", function() {

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

        // some artifact shortcuts
        let sword = game.artifacts.get(12);
        let amulet = game.artifacts.get(11);

        // generic power - without sword or amulet
        game.player.moveToRoom(8);
        game.triggerEvent('power', 1);
        expect(game.effects.get(41).seen).toBeTruthy('should have seen effect 41');
        game.triggerEvent('power', 22);
        expect(game.effects.get(42).seen).toBeTruthy('should have seen effect 42');
        game.triggerEvent('power', 44);
        expect(game.effects.get(43).seen).toBeTruthy('should have seen effect 43');
        game.triggerEvent('power', 66);
        expect(game.effects.get(44).seen).toBeTruthy('should have seen effect 44');

        // some artifacts needed for the special effects to work
        game.player.moveToRoom(1);
        game.command_parser.run('get all');
        game.command_parser.run('d'); // meet esher
        game.command_parser.run('take helsingin bow from esher');
        expect(game.history.getOutput().text).toBe("Esher will not give up his weapon!");
        expect(game.artifacts.get(1).monster_id).toBe(1, 'esher should still have the bow');

        // power + amulet
        game.mock_random_numbers = [1];
        game.command_parser.run('power');
        expect(game.effects.get(40).seen).toBeTruthy('should have seen effect 40');

        game.player.moveToRoom(8);
        game.command_parser.run('use rope');
        expect(game.monsters.get(5).room_id).toBeNull('worshippers should disappear');
        expect(game.effects.get(6).seen).toBeTruthy('should have seen effect 6');

        // use amulet when not in proper place
        game.command_parser.run('use amulet');
        expect(game.effects.get(37).seen).toBeTruthy('should have seen effect 37');

        // before getting sword, test some move logic
        game.player.moveToRoom(12);
        game.command_parser.run('s');
        expect(game.effects.get(20).seen).toBeTruthy('should have seen effect 20');
        expect(game.player.room_id).toBe(12, 'should not have moved to room 13');

        // sword stuff
        game.monsters.get(13).destroy();  // acolyte out of way
        game.player.moveToRoom(10);
        game.command_parser.run('look sword of inari');
        expect(game.history.getOutput().text).toBe("The sword is too high to see clearly!");
        game.command_parser.run('get sword of inari');
        expect(game.history.getOutput().text).toBe("You can't reach it from here!");
        expect(sword.container_id).toBe(31, 'sword should still be in brace');
        game.player.moveToRoom(11);
        game.command_parser.run('look sword of inari');
        expect(game.history.getOutput().text).toBe("The brace is blocking your view!");
        game.command_parser.run('get sword of inari');
        expect(game.history.getOutput().text).toBe("The brace holds the sword in place!");
        expect(sword.container_id).toBe(31, 'sword should still be in brace (second)');
        game.command_parser.run('remove sword of inari from brace');
        game.command_parser.run('put amulet into brace');
        expect(game.effects.get(19).seen).toBeTruthy('should have seen effect 19');
        expect(amulet.room_id).toBe(11);
        game.command_parser.run('get amulet');
        expect(game.history.getOutput().text).toBe("The amulet is too hot to pick up!");
        expect(amulet.room_id).toBe(11);

        // power + sword
        game.mock_random_numbers = [1];
        game.command_parser.run('power');
        expect(game.effects.get(40).seen).toBeTruthy('should have seen effect 40');

        game.command_parser.run('use silver cube');
        expect(game.history.getOutput().text).toBe("There's not enough room for the spell to work!");
        game.player.moveToRoom(9);
        game.command_parser.run('use silver cube');
        expect(game.monsters.get(6).room_id).toBe(9,'illusion should appear');

        // now test the same move logic as above, but it should work differently now
        game.player.moveToRoom(12);
        game.command_parser.run('s');
        expect(game.player.room_id).toBe(13, 'should have moved to room 13');

        // making armor
        game.artifacts.get(53).moveToInventory(); // receipt
        game.player.updateInventory();
        game.player.moveToRoom(32);
        game.command_parser.run('give receipt to leatherworker');
        expect(game.artifacts.get(44).room_id).toBe(32, 'leather armor should appear');
        game.command_parser.run('get leather armor');
        game.player.moveToRoom(31);
        game.artifacts.get(52).moveToRoom(31); // parts
        game.command_parser.run("use tools");
        expect(game.effects.get(38).seen).toBeTruthy('should have seen effect 38');
        expect(game.artifacts.get(44).room_id).toBeNull("leather didn't go away");
        expect(game.artifacts.get(52).room_id).toBeNull("parts didn't go away");
        expect(game.artifacts.get(51).room_id).toBe(31, "reinforced armor didn't appear");

        // buying stuff
        game.player.moveToRoom(15);
        let beer = game.artifacts.get(32);
        game.command_parser.run('give 9 to bartender');
        expect(game.history.getOutput().text).toBe("He wants 10 gold pieces, no more, no less!");
        game.command_parser.run('buy drink');
        expect(beer.room_id).toBe(15, 'beer should have appeared');
        game.command_parser.run('give 10 to bartender');
        expect(game.history.getOutput().text).toBe("Finish what you have first!");
        game.command_parser.run('drink beer');
        // expect(game.history.getOutput(1).text).toBe("You gulp it all down in one drink. Everyone is impressed.");
        expect(beer.room_id).toBeNull('beer should disappear');
        game.command_parser.run('give 10 to bartender');
        expect(game.artifacts.get(32).room_id).toBe(15, 'beer should have reappeared');
        expect(beer.quantity).toBe(1, 'beer should have a quantity of 1');

        game.player.moveToRoom(16);
        game.command_parser.run('give 10 to innkeeper');
        expect(game.artifacts.get(19).room_id).toBe(16, 'key should have appeared');
        game.command_parser.run('rent room');
        expect(game.history.getOutput().text).toBe("You already rented a room!");

        //  open grate
        game.player.moveToRoom(21);
        game.command_parser.run('look grate');
        game.command_parser.run('open grate');
        expect(game.history.getOutput().text).toBe("It's stuck! You will need to find a way to pry it open.");
        expect(game.artifacts.get(23).is_open).toBeFalsy("grate not should have opened");
        game.artifacts.get(47).moveToInventory();
        game.command_parser.run('use tools');
        expect(game.history.getOutput().text).toBe("You've pried the grate open!");
        expect(game.artifacts.get(23).is_open).toBeTruthy("grate should have opened");

        // movement stuff
        game.monsters.get(3).destroy();  // move sentry out the of way
        game.monsters.get(10).destroy();  // move soldiers out the of way
        game.monsters.get(11).destroy();  // move worshippers out the of way
        game.player.moveToRoom(3);
        game.command_parser.run('u');
        expect(game.effects.get(8).seen).toBeTruthy('should have seen effect 8');
        expect(game.player.room_id).toBe(3, 'should not have moved up from room 3');
        game.player.moveToRoom(17);
        game.command_parser.run('e');
        expect(game.effects.get(9).seen).toBeTruthy('should have seen effect 9');
        expect(game.player.room_id).toBe(17, 'should not have moved east from room 17');
        game.player.moveToRoom(21);
        game.command_parser.run('n');
        expect(game.monsters.get(12).room_id).toBe(17, 'trackers should appear');
        expect(game.player.room_id).toBe(17, 'should move to 17 from 21');
        game.monsters.get(12).destroy();  // remove trackers
        game.player.moveToRoom(22);
        game.command_parser.run('e');
        expect(game.effects.get(10).seen).toBeTruthy('should have seen effect 10');
        expect(game.player.room_id).toBe(22, 'should not have moved east from room 22');
        game.player.moveToRoom(23);
        game.command_parser.run('n');
        expect(game.effects.get(11).seen).toBeTruthy('should have seen effect 11');
        expect(game.player.room_id).toBe(23, 'should not have moved north from room 23');
        // without esher
        game.monsters.get(1).destroy();
        game.command_parser.run('n');
        expect(game.effects.get(46).seen).toBeTruthy('should have seen effect 46');
        expect(game.died).toBeTruthy('player should have croaked');

        // reactivate the game after testing death
        game.active = true;
        game.died = false;

        game.player.moveToRoom(25);
        game.command_parser.run('u');
        expect(game.player.gold).toBe(0, 'player gold should be taken away');
        expect(game.effects.get(18).seen).toBeTruthy('should have seen eff 18');
        expect(game.effects.get(27).seen).toBeTruthy('should have seen eff 27');
        expect(game.effects.get(15).seen).toBeTruthy('should have seen eff 15');
        expect(game.effects.get(24).seen).toBeTruthy('should have seen eff 24');

        // reactivate the game after testing exit
        game.active = true;
        game.died = false;

        sword.moveToInventory();
        game.artifacts.get(13).moveToInventory();
        game.command_parser.run('put sword of inari into scabbard');
        expect(sword.container_id).toBe(13, 'sword should have gone into scabbard');
        game.command_parser.run('u');
        expect(game.effects.get(21).seen).toBeTruthy('should have seen eff 18');
        expect(game.player.gold).toBe(5000, 'player should have gold bonus');
        expect(sword.container_id).toBeNull('sword should have been taken away at exit');
        expect(amulet.room_id).toBeNull('amulet should have been taken away at exit');
        expect(game.artifacts.get(13).monster_id).toBeNull('scabbard should have been taken away at exit');
        expect(game.artifacts.get(14).monster_id).toBeNull('sword should have been taken away at exit');

        console.log(game.history);
      }
    );
  }));

});
