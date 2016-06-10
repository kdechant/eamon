import {Game} from "../models/game";
import {Monster} from "../models/monster";
import {initMockGame} from "../utils/testing";

describe("Monster Repo", function() {

  beforeEach(() => {
    initMockGame();
  });

  it("should read the monster data", function() {
    let game = Game.getInstance();
    expect(game.monsters.all.length).toEqual(6, "There should be 6 monsters including the player.");
    expect(game.artifacts.all.length).toEqual(31, "There should be 31 artifacts (incl. 5 dead bodies and 5 player artifacts) after setting up the player's items.");

    expect(game.monsters.get(1).id).toEqual(1);
    expect(game.monsters.get(1).name).toEqual("guard");

    expect(game.player.id).toEqual(0);
    expect(game.player.room_id).toEqual(1, "Player should start in room 1");
    expect(game.player.weapon.name).toEqual("battle axe", "Player should start with best weapon ready");
  });

  it("should find a monster by name in the current room", function() {
    let game = Game.getInstance();

    // find a monster in the player's current room
    let alfred = game.monsters.getLocalByName('alfred');
    expect(alfred).not.toBeNull();
    expect(alfred.id).toBe(3);

    // should not find a monster that is in a different room
    let thief = game.monsters.getLocalByName('thief');
    expect(thief).toBeNull();

    // special case where there are 2 monsters with the same name, in different rooms
    let king = game.monsters.get(2);
    king.name = 'alfred';
    let someone = game.monsters.getLocalByName('alfred');
    expect(someone.id).toBe(3);
    game.player.moveToRoom(3);
    let someone2 = game.monsters.getLocalByName('alfred');
    expect(someone2.id).toBe(2);

  });


});
