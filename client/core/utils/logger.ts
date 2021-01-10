import {ILoggerService} from "./logger.interface";
import {getAxios} from "../../main-hall/utils/api";
import Game from "../models/game";

declare let game: Game;

/**
 * Real live logger class connected to API
 */
export default class Logger implements ILoggerService {

  public log(type = "", value: number = null) {
    const body = {
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
