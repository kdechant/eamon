/**
 * This file contains some helper functions used during unit testing.
 */
// import Game from "../../core/models/game";
import axios from "axios";

/**
 * Init from the mock data. Used in the unit tests.
 */
export function initMockGame(game) {

  game.slug = 'demo1';
  let path = "http://localhost:8000/static/mock-data";
  return axios.all([
    axios.get(path + '/adventure.json'),
    axios.get(path + '/rooms.json'),
    axios.get(path + '/artifacts.json'),
    axios.get(path + '/effects.json'),
    axios.get(path + '/monsters.json'),
    axios.get(path + '/player.json'),
  ])
   .then(responses => {

     game.init(responses[0].data, responses[1].data, responses[2].data, responses[3].data, responses[4].data, [], responses[5].data, []);

     game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests

     game.start();
   });
}

/**
 * Init from the live game data (data gotten from database)
 */
export function initLiveGame(game) {

  let path = "http://localhost:8000/api/adventures/" + game.slug;
  return axios.all([
    axios.get(path + ''),
    axios.get(path + '/rooms'),
    axios.get(path + '/artifacts'),
    axios.get(path + '/effects'),
    axios.get(path + '/monsters'),
    axios.get(path + '/hints'),
    axios.get('http://localhost:8000/static/mock-data/player.json'),
  ])
   .then(responses => {

     game.init(
       responses[0].data,
       responses[1].data,
       responses[2].data,
       responses[3].data,
       responses[4].data,
       responses[5].data,
       responses[6].data,
       []
     );

     game.history.delay = 0; // bypasses the history setTimeout() calls which break the tests

     game.start();
   });
}
