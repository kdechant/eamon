import {describe, it, beforeEach, expect} from 'angular2/testing';

import {Game} from "../models/game";
import {Monster} from "../models/monster";
import {ArtifactRepository} from "./artifact.repo";
import {MonsterRepository} from "./monster.repo";

// still importing these as typescript files because it"s unclear how to reading directly from JSON.
import {MONSTERS} from "../../demo1/mock-data/monsters";
import {ARTIFACTS} from "../../demo1/mock-data/artifacts";
import {PLAYER} from "../../demo1/mock-data/player";

describe("Monster Repo", function() {

  let repo: MonsterRepository;
  beforeEach(() => {
    let game = Game.getInstance();
    game.artifacts = new ArtifactRepository(ARTIFACTS);
    repo = new MonsterRepository(MONSTERS);
  });

  it("should read the monster data", function() {
    expect(repo.all.length).toEqual(4, "There should be 4 monsters after loading monster data.");
    expect(repo.get(1).id).toEqual(1);
    expect(repo.get(1).name).toEqual("guard");
  });

  it("should add the player", function() {
    let game = Game.getInstance();
    expect(repo.all.length).toEqual(4, "There should be 4 monsters before setting up the player.");
    expect(game.artifacts.all.length).toEqual(21, "There should be 21 artifacts (incl. 4 dead bodies) before setting up the player.");
    let player = repo.addPlayer(PLAYER);
    expect(repo.all.length).toEqual(5, "There should be 5 monsters after setting up the player.");
    expect(game.artifacts.all.length).toEqual(26, "There should be 26 artifacts after setting up the player's items.");
    expect(player.id).toEqual(0);
    expect(player.room_id).toEqual(1, "Player should start in room 1");
    expect(player.weapon.name).toEqual("battle axe", "Player should start with best weapon ready");
  });


});
