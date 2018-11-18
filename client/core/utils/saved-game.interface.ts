// import { EMPTY } from 'rxjs';

export interface ISavedGameService {
  saveGame(data: any);
  listSavedGames(player_id: any, adventure_id: number);
  loadSavedGame(saved_game: any);
  loadSavedGameById(id: number);
  deleteSavedGame(saved_game: any);
}

/**
 * Dummy service used with automated tests
 */
export class DummySavedGameService implements ISavedGameService {

  public saveGame(data: any) {
  }

  public listSavedGames(player_id: any, adventure_id: number) {
    // this used to return an empty Observable, but that just confused Webpack, so
    // it got refactored to return undefined
    return undefined;
    // return EMPTY;
  }

  public loadSavedGame(saved_game: any) {
  }

  public loadSavedGameById(id: number) {
  }

  public deleteSavedGame(saved_game: any) {
  }

}
