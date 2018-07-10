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
import {Monster} from "../../core/models/monster";

describe("Temple of Ngurct tests", function() {

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

        // wandering monsters
        game.mock_random_numbers = [1,20,12]; // first turn will not summon a monster (rnd < 20), second turn will summon monster #18
        let joubert = game.monsters.get(18);
        game.command_parser.run('look');
        expect(joubert.room_id).toBeNull('Joubert should not appear yet');
        game.command_parser.run('look');
        expect(joubert.room_id).toBe(game.player.room_id, 'Joubert should appear');
        joubert.reaction = Monster.RX_NEUTRAL; // needed for fireball wand test below

        // wandering monsters will be a pain for the remaining tests. remove them.
        game.data['wandering monsters'] = [];

        // the dead mage's artifacts
        let dm = game.artifacts.get(32);
        expect(dm.room_id).not.toBeNull('dead mage should be placed somewhere');
        dm.moveToRoom(); // this is easier than going to a random room that might have monsters in it
        game.command_parser.run('look dead mage');
        expect(game.artifacts.get(33).room_id).toBe(1, 'wand did not appear');
        expect(game.artifacts.get(64).room_id).toBe(1, 'ring did not appear');
        game.command_parser.run('get fireball wand');

        // fireball wand
        game.artifacts.get(33).moveToInventory();
        game.command_parser.run('ready fireball wand');
        // wrong trigger word
        game.modal.mock_answers = ['nope'];
        game.command_parser.run('use wand');
        expect(game.history.getOutput().text).toBe('Wrong! Nothing happens.', 'wrong wand message 1');
        // no monsters
        game.modal.mock_answers = ['fire'];
        game.command_parser.run('use wand');
        expect(game.history.getOutput().text).toBe('There are no unfriendlies about!', 'wrong wand message 2');
        // now with monsters
        game.monsters.get(7).moveToRoom();  // guard
        game.monsters.get(9).moveToRoom();  // ogre
        game.monsters.get(17).moveToRoom();  // bugbear
        game.monsters.updateVisible();
        // attack!
        game.mock_random_numbers = [12, 1, 12, 20, 12, 1];  // == damage mon 1, saving throw roll mon 1, damage mon 2...
        game.modal.mock_answers = ['fire'];
        game.command_parser.run('attack guard');
        expect(game.monsters.get(7).damage).toBe(12, "Guard should take 12 damage");
        expect(game.monsters.get(9).damage).toBe(6, "Ogre should take 6 damage after saving throw");
        expect(game.monsters.get(17).damage).toBe(12, "Bugbear should take 12 damage, failing saving throw");
        expect(game.monsters.get(18).damage).toBe(0, "Joubert should not take damage from wand");

        game.monsters.get(7).destroy();
        game.monsters.get(9).destroy();
        game.monsters.get(17).destroy();

        // oak door
        let door1 = game.artifacts.get(16);
        let door2 = game.artifacts.get(17);
        game.player.moveToRoom(33);
        game.tick();
        game.command_parser.run('open door');
        expect(door1.is_open).toBeTruthy('side 1 did not open');
        expect(door2.is_open).toBeTruthy('side 2 did not open');
        game.command_parser.run('n');
        expect(door1.is_open).toBeFalsy('side 1 did not close');
        expect(door2.is_open).toBeFalsy('side 2 did not close');

        // alkanda
        let alk = game.monsters.get(56);
        game.command_parser.run('say annal natthrac');
        expect(alk.room_id).toBeNull('Alkandar should not appear without medallion');
        game.artifacts.get(37).moveToInventory();
        game.player.updateInventory();
        game.player.damage = 0;
        game.command_parser.run('say annal natthrac');
        expect(alk.room_id).toBe(game.player.room_id, 'Alkandar should appear');
        alk.injure(100); // kills him so he drops his scimitar
        game.tick();
        game.command_parser.run('get scimitar');
        expect(game.player.damage).toBeGreaterThan(0, 'Scimitar should hurt to pick up');

        // power
        game.history.push('power 1');
        game.mock_random_numbers = [13];  // room
        game.triggerEvent('power', 10);
        expect(game.player.room_id).toBe(13, 'player should have teleported');
        game.player.damage = 0;
        game.history.push('power 2');
        game.mock_random_numbers = [20, 8];  // saving throw roll and damage roll
        game.triggerEvent('power', 25);
        expect(game.player.damage).toBeGreaterThan(0, 'quake should injure player');
        game.history.push('power 3');
        game.triggerEvent('power', 70);
        game.monsters.updateVisible();
        expect(game.monsters.get(57).isHere()).toBeTruthy("Hero didn't appear");
        game.history.push('power 4');
        game.triggerEvent('power', 70);
        game.monsters.updateVisible();
        expect(game.monsters.get(57).isHere()).toBeFalsy("Hero didn't disappear");
        game.history.push('power 5');
        game.triggerEvent('power', 99);
        expect(game.player.damage).toBe(0, 'power should heal player');
        game.mock_random_numbers = [1];  // saving throw roll
        game.history.push('power 6');
        game.triggerEvent('power', 25);
        expect(game.died).toBeTruthy('player should have died in quake');

        for (let h of game.history.history) {
          console.log(h);
        }
      }
    );
  }));

});
