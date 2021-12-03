import Player, {updateCachedInfo} from "../models/player";
import Artifact, {ARMOR_TYPES, ARTIFACT_TYPES} from "../models/artifact";

let player;

beforeEach(() => {
  player = {} as Player;
  const artifact1 = {
    'name': 'trollsfire',
    'type': ARTIFACT_TYPES.WEAPON,
    'dice': 2,
    'sides': 10
  } as Artifact;
  const artifact2 = {
    'name': 'axe',
    'type': ARTIFACT_TYPES.WEAPON,
    'dice': 1,
    'sides': 6
  } as Artifact;
  const artifact3 = {
    'name': 'leather armor',
    'type': ARTIFACT_TYPES.WEARABLE,
    'armor_type': ARMOR_TYPES.ARMOR,
    'armor_class': 1
  } as Artifact;
  player.inventory = [artifact1, artifact2, artifact3];
  updateCachedInfo(player);
});

it('can determine best weapon and armor', () => {
  expect(player.best_weapon.name).toBe('trollsfire');
  expect(player.best_armor.name).toBe('leather armor');
});
