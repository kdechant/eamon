import {describe, it, beforeEach, expect} from 'angular2/testing';

import {Game} from "../models/game";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";
import {ArtifactRepository} from "../repositories/artifact.repo";
import {MonsterRepository} from "../repositories/monster.repo";

import {MONSTERS} from "../../demo1/mock-data/monsters";

describe("Monster", function() {

  // initialize the test with the full repository of artifacts
  let repo: MonsterRepository;
  beforeEach(() => {
    repo = new MonsterRepository(MONSTERS);
  });

  it("should know its carrying capacity", function() {
    expect(repo.get(1).maxWeight()).toEqual(400);
    expect(repo.get(2).maxWeight()).toEqual(100);
  });

});
