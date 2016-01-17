import {RoomRepository} from '../repositories/room.repo';
import {ArtifactRepository} from '../repositories/artifact.repo';
import {MonsterRepository} from '../repositories/monster.repo';

/**
 * Game Data class. Contains game state and data like rooms, artifacts, monsters.
 */
export class GameData {
  
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
   * Sets up data received from the GameLoaderService.
   */
  setupData(room_data:Array<Object>, artifact_data:Array<Object>, monster_data:Array<Object>) {
    
    this.rooms = new RoomRepository(room_data);
    this.artifacts = new ArtifactRepository(artifact_data, this);
    this.monsters = new MonsterRepository(monster_data, this);
    
  }
         
  /**
   * Tick the game clock. Monster/artifact maintenance and things like changing
   * torch fuel will happen here.
   */
  tick() {
    this.timer++;
    this.artifacts.updateVisible();
    this.monsters.updateVisible();
  }
  
}
