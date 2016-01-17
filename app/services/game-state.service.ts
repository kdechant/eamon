import {Injectable} from 'angular2/core';

/**
 * Game state service.
 * Tracks current game state variables like which room the user is in.
 */
@Injectable()
export class GameStateService {
  /**
   * The room the player is in. Room 1 is the entrance, by definition,
   * so the initial value of this property is 1.
   */
  room: number = 1;
  
}
