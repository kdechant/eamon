import Player from "../models/player";
import Artifact from "../models/artifact";

let player;

beforeEach(() => {
  player = new Player();
  const artifact1 = new Artifact();
  artifact1.init({
    'name': 'trollsfire',
    'type': Artifact.TYPE_WEAPON,
    'dice': 2,
    'sides': 10
  });
  const artifact2 = new Artifact();
  artifact2.init({
    'name': 'axe',
    'type': Artifact.TYPE_WEAPON,
    'dice': 1,
    'sides': 6
  });
  const artifact3 = new Artifact();
  artifact3.init({
    'name': 'leather armor',
    'type': Artifact.TYPE_WEARABLE,
    'armor_type': Artifact.ARMOR_TYPE_ARMOR,
    'armor_class': 1
  });
  player.inventory = [artifact1, artifact2, artifact3];
  player.update();
});

it('can describe gender', () => {
  player.gender = 'm';
  expect(player.getGenderLabel()).toBe('mighty');
  player.gender = 'f';
  expect(player.getGenderLabel()).toBe('fair');
});

it('can determine best weapon and armor', () => {
  expect(player.best_weapon.name).toBe('trollsfire');
  expect(player.best_armor.name).toBe('leather armor');
});
