import {Game} from '../models/game';
import {Artifact} from '../models/artifact';
import {Monster} from '../models/monster';
import {ArtifactRepository} from '../repositories/artifact.repo';
import {MonsterRepository} from '../repositories/monster.repo';

import {MONSTERS} from '../demo1/mock-data/monsters';

describe("Monster", function() {

  // initialize the test with the full repository of artifacts
  let repo:MonsterRepository;
  var game = new Game();
  beforeEach(() => {
    repo = new MonsterRepository(MONSTERS, game);
  });

  it("should know its carrying capacity", function() {
    expect(repo.get(1).maxWeight()).toEqual(120)
    expect(repo.get(2).maxWeight()).toEqual(100)
  });

});
