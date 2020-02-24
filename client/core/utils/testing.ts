/**
 * This file contains some helper functions used during unit testing.
 */
import axios from "axios";

declare var game;

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

     game.died = false;
     game.won = false;
     game.start();
   });
}

export function expectEffectSeen(id) {
  expect(game.effects.get(id).seen).toBeTruthy();
}

export function expectEffectNotSeen(id) {
  expect(game.effects.get(id).seen).toBeFalsy();
}

/**
 * Has one monster attack another (with the necessary mock dice rolls)
 * @param Monster attacker  Who is attacking
 * @param Monster defender  What to attack
 * @param boolean hit  Whether or not the player should hit the target
 * @param Number damage  The amount of damage the attack should do (before armor)
 * @param Number[] special  Results of any dice rolls in the attackDamageAfter event handler
 */
export function monsterAttack(attacker, defender, hit, damage, special) {
  game.mock_random_numbers = [
    hit ? 5 : 96,
    damage,
    ...special
  ];
  attacker.attack(defender);
}

