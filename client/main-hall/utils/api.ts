import axios, {AxiosInstance, AxiosPromise} from "axios";
import * as Cookie from 'js-cookie';

/**
 * File utils/api.js
 * Utility functions related to API calls
 */

/**
 * Gets the headers we need to make API calls, including the CSRF token from Django
 * if the user is logged in to the admin
 */
export function getHeaders(): Record<string, unknown> {
  const headers = {
    'Content-Type': 'application/json',
  };
  const csrf = Cookie.get('csrftoken');
  if (csrf) {
    headers['X-CSRFToken'] = csrf;
  }
  return headers;
}

/**
 * Gets the configured Axios instance that is ready to make API calls.
 */
export function getAxios(): AxiosInstance {
  return axios.create({
    baseURL: "/api",
    headers: getHeaders(),
  });
}

/**
 * Records an entry in the activity log for the current player
 * @param {string} type
 *   The type of log message (e.g., 'start_adventure')
 * @param {number|null} value
 *   An additional value to record in the log (e.g., a room ID or monster ID,
 *   or other numeric data like move count)
 * @return {AxiosPromise} the promise from the API call
 */
export function log(type = "", value: number|null = null): AxiosPromise {

  // using player ID from local storage to avoid race condition if this.player isn't loaded yet
  const body = {
    'player': window.localStorage.getItem('player_id'),
    'adventure': null,
    'type': type,
    'value': value
  };

  return getAxios().post("/log", body);
}
