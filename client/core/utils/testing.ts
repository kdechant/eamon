/**
 * This file contains some helper functions used during unit testing.
 */
import axios from "axios";
import Game from "../../core/models/game";
import {Monster} from "../models/monster";

declare let game: Game;

/**
 * Init from the mock data. Used in the unit tests.
 */
export function initMockGame(game) {

  game.slug = 'demo1';
  const path = "http://localhost:8000/static/mock-data";
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

     game.queue.delay_time = 0; // bypasses the history setTimeout() calls which break the tests

     game.start();
   });
}

/**
 * Init from the live game data (data gotten from database)
 */
export function initLiveGame(game: Game) {

  const path = "http://localhost:8000/api/adventures/" + game.slug;
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

     game.queue.delay_time = 0; // bypasses the setTimeout() calls which break the tests

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

export function expectArtifactIsHere(id) {
  expect(game.artifacts.get(id).isHere()).toBeTruthy();
}

export function expectArtifactIsNotHere(id) {
  expect(game.artifacts.get(id).isHere()).toBeFalsy();
}

export function expectMonsterIsHere(id) {
  expect(game.monsters.get(id).isHere()).toBeTruthy();
}

export function expectMonsterIsNotHere(id) {
  expect(game.monsters.get(id).isHere()).toBeFalsy();
}

/**
 * Creates mock random numbers for the player attacking. The target is
 * specified
 * @param boolean hit  Whether or not the player should hit the target
 * @param Number damage  The amount of damage the attack should do (before armor)
 * @param special  Results of any dice rolls in the attackDamageAfter event handler
 */
export function playerAttackMock(hit: boolean, damage: number, special: number[] = []) {
  return [
    hit ? 6 : 96,  // 6 = non-critical hit, 96 = non-fumble miss
    damage,
    ...special
  ]
}

/**
 * Player attacks a monster with automatic hit
 * @param string|Monster  The name or object for the target
 * @param Number damage  The amount of damage the attack should do (before armor)
 * @param special  Results of any dice rolls in the attackDamageAfter event handler, or NPC actions
 */
export function playerHit(target: string|Monster, damage: number, special: number[] = []) {
  game.mock_random_numbers = [
    6,  // 6 = non-critical hit
    damage,
    0,  // skip wpn ability increase
    0,  // skip ae increase
    ...special
  ];
  if (target instanceof Monster) {
    target = target.name;
  }
  game.command_parser.run(`attack ${target}`);
}

/**
 * Moves the player to another room, as if they had just teleported there.
 * @param room_id
 */
export function movePlayer(room_id) {
  game.skip_battle_actions = true;
  game.player.moveToRoom(room_id);
  game.history.push(`movePlayer: jump to room ${room_id}`);
  game.tick();
}

/**
 * Shortcut for running a command
 * @param command
 */
export function runCommand(command) {
  game.command_parser.run(command);
}
