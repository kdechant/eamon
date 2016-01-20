import {Inject} from 'angular2/core';

import {RoomRepository} from '../repositories/room.repo';
import {ArtifactRepository} from '../repositories/artifact.repo';
import {MonsterRepository} from '../repositories/monster.repo';

import {HistoryService} from '../services/history.service';

import {Room, RoomExit} from '../models/room';
import {Artifact} from '../models/artifact';
import {Monster} from '../models/monster';

/**
 * Game Data class. Contains game state and data like rooms, artifacts, monsters.
 */
export class Game {

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
   * Constructor. No actual code, but needed for DI
   */
  constructor(private _historyService: HistoryService) { }

  /**
   * Sets up data received from the GameLoaderService.
   */
  init(data) {

    this.name = data[0].name;
    this.description = data[0].description;

    this.rooms = new RoomRepository(data[1]);
    this.artifacts = new ArtifactRepository(data[2], this);
    this.monsters = new MonsterRepository(data[3], this);

    this.monsters.addPlayer(data[4]);

  }

  /**
   * Tick the game clock. Monster/artifact maintenance and things like changing
   * torch fuel will happen here.
   */
  tick() {
    this.timer++;

    // if the player is seeing the room for the first time, show the description
    if (this.rooms.current_room.times_visited == 1) {
      this._historyService.push('', this.rooms.current_room.description);
    }

    this.artifacts.updateVisible();
    this.monsters.updateVisible();
  }

}
