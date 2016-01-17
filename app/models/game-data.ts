import {RoomRepository} from '../repositories/room.repo';
import {ArtifactRepository} from '../repositories/artifact.repo';
import {MonsterRepository} from '../repositories/monster.repo';

/**
 * Game Data class. Contains game state and data like rooms, artifacts, monsters.
 */
export class GameData {
  
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
   * Sets up data received from the GameLoaderService.
   */
  setupData(data) {
//    console.log('Setting up GameData', data);
    this.name = data[0].name;
    this.description = data[0].description;
    
    this.rooms = new RoomRepository(data[1]);
    this.artifacts = new ArtifactRepository(data[2], this);
    this.monsters = new MonsterRepository(data[3], this);
    
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
