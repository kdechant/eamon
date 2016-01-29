import {Inject} from 'angular2/core';

import {RoomRepository} from '../repositories/room.repo';
import {ArtifactRepository} from '../repositories/artifact.repo';
import {MonsterRepository} from '../repositories/monster.repo';

import {HistoryManager} from '../models/history-manager';
import {CommandParser} from '../models/command-parser';
import {Hook} from '../commands/hook';
import {hooks} from 'adventure/hooks';

/**
 * Game Data class. Contains game state and data like rooms, artifacts, monsters.
 */
export class Game {

  private static _instance:Game = new Game();

  /**
   * @var string The current adventure's name
   */
  name:string;

  /**
   * @var string The current adventure's description
   */
  description:string;

  /**
   * A container for all the Room objects
   */
  rooms: RoomRepository;

  /**
   * A container for all the Artifact objects
   */
  artifacts: ArtifactRepository;

  /**
   * A container for all the Monster objects
   */
  monsters: MonsterRepository;

  /**
   * The game timer. Keeps track of the number of game clock ticks.
   */
  timer:number = 0;

  /**
   * Command history and results
   */
  history: HistoryManager;

  /**
   * Command parser object
   */
  command_parser: CommandParser;

  /**
   * Command parser object
   */
  hooks: Hook[] = [];

  /**
   * In Battle flag
   */
  in_battle: boolean = false;

  constructor() {
    if(Game._instance){
      throw new Error("Error: Instantiation failed: Use Game.getInstance() instead of new.");
    }
    Game._instance = this;
  }

  public static getInstance():Game {
    return Game._instance;
  }

  /**
   * Sets up data received from the GameLoaderService.
   */
  init(data) {

    this.name = data[0].name;
    this.description = data[0].description;

    this.rooms = new RoomRepository(data[1]);
    this.artifacts = new ArtifactRepository(data[2]);
    this.monsters = new MonsterRepository(data[3]);

    this.monsters.addPlayer(data[4]);

    this.history = new HistoryManager;
    this.command_parser = new CommandParser();

    // register the hooks
    for (var i in hooks) {
      var h = new Hook();
      h.name = hooks[i].name;
      h.run = hooks[i].run;
      this.hooks.push(h);
    }

    // Show the adventure description
    this.history.push('');
    this.history.write(this.description)

    // Place the player in the first room
    this.rooms.moveTo(1);

    // Tick the game clock. This builds the list of monsters/items in the first room.
    this.tick();

  }

  /**
   * Tick the game clock. Monster/artifact maintenance and things like changing
   * torch fuel will happen here.
   */
  tick() {
    this.timer++;

    // if the player is seeing the room for the first time, show the description
    if (!this.rooms.current_room.seen) {
      this.history.write(this.rooms.current_room.description);
      this.rooms.current_room.seen = true;
    }

    this.artifacts.updateVisible();
    this.monsters.updateVisible();

    // show monster and artifact descriptions
    for (var i in this.monsters.visible) {
      var m = this.monsters.visible[i];
      if (!m.seen) {
        this.history.write(m.description);
        m.seen = true;
      } else {
        this.history.write(m.name + ' is here.');
      }
    }

    for (var i in this.artifacts.visible) {
      var a = this.artifacts.visible[i];
      if (!a.seen) {
        this.history.write(a.description);
        a.seen = true;
      } else {
        this.history.write('You see ' + a.name);
      }
    }

  }

  /**
   * Rolls a set of dice
   */
  diceRoll(dice, sides) {
    var result = 0;
    for(var i=0; i < dice; i++) {
      result += Math.random() * sides + 1;
    }
    return result;
  }

  /**
   * Invokes a game hook
   * @param string hook_name The name of the hook.
   * @param string verb The verb of the command that was run
   * @param string arg The arguments to the command
   */
  public invoke(hook_name, verb, arg) {
    for (var i in this.hooks) {
      if (this.hooks[i].name == hook_name) {
        return this.hooks[i].run(verb, arg);
      }
    }
  }

}
