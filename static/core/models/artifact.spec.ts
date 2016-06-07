import {Game} from "../models/game";
import {Artifact} from "../models/artifact";
import {ArtifactRepository} from "../repositories/artifact.repo";

import {ARTIFACTS} from "../../adventures/demo1/mock-data/artifacts";

describe("Artifact", function() {

  // initialize the test with the full repository of artifacts
  let repo: ArtifactRepository;
  beforeEach(() => {
    repo = new ArtifactRepository(ARTIFACTS);
  });

  it("should know its max damage", function() {
    // non-weapon
    expect(repo.get(1).maxDamage()).toEqual(0);
    // magic sword
    expect(repo.get(3).maxDamage()).toEqual(16);
    // spear
    expect(repo.get(4).maxDamage()).toEqual(5);
  });

  it("should match synonyms and partial names", function() {
    expect(repo.get(5).match('gold key')).toBeTruthy(); // real name
    expect(repo.get(5).match('gold')).toBeTruthy(); // partial match (beginning)
    expect(repo.get(5).match('go')).toBeTruthy(); // partial match (beginning)
    expect(repo.get(5).match('ke')).toBeFalsy(); // EDX does not match the middle of strings. Kept it this way to make it simpler.
    expect(repo.get(5).match('key')).toBeTruthy(); // partial match (end)

    expect(repo.get(12).match('chest')).toBeTruthy(); // real name
    expect(repo.get(12).match('box')).toBeTruthy(); // alias

    expect(repo.get(18).match('vault')).toBeTruthy();
    expect(repo.get(18).match('door')).toBeTruthy();
    expect(repo.get(18).match('not a match')).toBeFalsy();

    // item with no aliases
    expect(repo.get(1).match('throne')).toBeTruthy();
    expect(repo.get(1).match('not a match')).toBeFalsy();
  });

});
