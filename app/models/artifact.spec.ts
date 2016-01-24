import {Game} from '../models/game';
import {Artifact} from '../models/artifact';
import {ArtifactRepository} from '../repositories/artifact.repo';

import {ARTIFACTS} from '../demo1/mock-data/artifacts';

describe("Artifact", function() {

  // initialize the test with the full repository of artifacts
  let repo:ArtifactRepository;
  var game = new Game();
  beforeEach(() => {
    repo = new ArtifactRepository(ARTIFACTS, game);
  });

  it("should know its max damage", function() {
    // non-weapon
    expect(repo.get(1).maxDamage()).toEqual(0)
    // magic sword
    expect(repo.get(3).maxDamage()).toEqual(16)
    // spear
    expect(repo.get(4).maxDamage()).toEqual(5)
  });

});
