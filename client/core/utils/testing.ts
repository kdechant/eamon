/**
 * This file contains some helper functions used during unit testing.
 */
import axios from "axios";
import Game from "../../core/models/game";

declare var game: Game;

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
export function initLiveGame(game: Game) {

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
// export function monsterAttack(attacker, defender, hit, damage, special) {
//   game.mock_random_numbers = [
//     hit ? 5 : 96,
//     damage,
//     ...special
//   ];
//   attacker.attack(defender);
// }

/**
 * Creates mock random numbers for the player attacking. The target is
 * specified
 * @param boolean hit  Whether or not the player should hit the target
 * @param Number damage  The amount of damage the attack should do (before armor)
 * @param special  Results of any dice rolls in the attackDamageAfter event handler
 */
export function playerAttack(hit: boolean, damage: number, special: number[] = []) {
  return [
    hit ? 6 : 96,  // 6 = non-critical hit, 96 = non-fumble miss
    damage,
    ...special
  ]
}

export function movePlayer(room_id) {
  game.skip_battle_actions = true;
  game.player.moveToRoom(room_id);
  game.tick();
}

// /**
//  * Creates mock random numbers for an NPC attack
//  * @param boolean flee  Whether or not the NPC should flee
//  * @param Number target  The ID of the monster to attack
//  * @param boolean hit  Whether or not the NPC should hit
//  * @param Number damage  The amount of damage the attack should do (before armor)
//  * @param special  Results of any dice rolls in the attackDamageAfter event handler
//  */
// export function monsterAttack(flee, target, hit, damage, special) {
//   // Note: to mock non-player fighting, use the following mock numbers:
//   // [flee chance, target, hit roll, damage roll]
//   // For player attack, you only need:
//   // [hit roll, damage roll]
//   // If there is an attackDamageAfter e.h., add any numbers for it to the
//   // end of the array.
//
// }
