import {Game} from '../models/game';
import {Monster} from '../models/monster';
import {ArtifactRepository} from './artifact.repo';
import {MonsterRepository} from './monster.repo';

// still importing these as typescript files because it's unclear how to reading directly from JSON.
import {MONSTERS} from '../demo1/mock-data/monsters';
import {PLAYER} from '../demo1/mock-data/player';

describe("Monster Repo", function() {

  let repo:MonsterRepository;
  beforeEach(() => {
    var game = new Game();
    game.artifacts = new ArtifactRepository([], game);
    repo = new MonsterRepository(MONSTERS, game);
    console.log(repo);
  });

  it("should read the monster data", function() {
    expect(repo.monsters.length).toEqual(2, 'There should be 2 monsters after loading monster data.');
    expect(repo.get(1).id).toEqual(1);
    expect(repo.get(1).name).toEqual('guard');
  });

  it("should add the player", function() {
    expect(repo.monsters.length).toEqual(2, 'There should be 2 monsters before setting up the player.');
    var player = repo.addPlayer(PLAYER);
    expect(repo.monsters.length).toEqual(3, 'There should be 3 monsters after setting up the player.');
    expect(player.id).toEqual(0);
    expect(player.room_id).toEqual(1, 'Player should start in room 1');
    expect(player.weapon).toEqual(2, 'Player should start with best weapon ready'); // without any artifacts in the system, the weapon will be #2
  });


});
