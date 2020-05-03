import {ILoggerService} from "./logger.interface";
import {getAxios} from "../../main-hall/utils/api";
import Game from "../models/game";

declare var game: Game;

/**
 * Real live logger class connected to API
 */
export default class Logger implements ILoggerService {

  public log(type: string = "", value: number = null) {
    let body = {
      'player': game.demo ? null : window.localStorage.getItem('player_id'),
      'adventure': game.id,
      'type': type,
      'value': value
    };
    const axios = getAxios();
    axios.post('/log', body)
      .catch(err => {
        console.error('logger error', err);
      });
  }

}
