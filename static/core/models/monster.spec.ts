import {describe, it, beforeEach, expect} from 'angular2/testing';

import {Game} from "../models/game";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";
import {ArtifactRepository} from "../repositories/artifact.repo";
import {MonsterRepository} from "../repositories/monster.repo";

import {ARTIFACTS} from "../../adventures/demo1/mock-data/artifacts";
import {MONSTERS} from "../../adventures/demo1/mock-data/monsters";

describe("Monster", function() {

  // initialize the test with the full repository of artifacts
  let repo: MonsterRepository;
  beforeEach(() => {
    let game = Game.getInstance();
    game.artifacts = new ArtifactRepository(ARTIFACTS);
    repo = new MonsterRepository(MONSTERS);
  });

  it("should know its carrying capacity", function() {
    expect(repo.get(1).maxWeight()).toEqual(400);
    expect(repo.get(2).maxWeight()).toEqual(100);
  });

  it("should match synonyms", function() {
    expect(repo.get(3).match('alfred')).toBeTruthy(); // real name, but lowercase
    expect(repo.get(3).match('al')).toBeTruthy(); // alias
    expect(repo.get(3).match('albert')).toBeFalsy(); // alias

    // a multi-word alias
    expect(repo.get(4).match('bad guy')).toBeTruthy(); // alias

    // item with no aliases
    let king = repo.get(2);
    expect(king.match('king')).toBeTruthy();
    expect(king.match('grand duke')).toBeFalsy();
  });

});
