/**
 * JSON data that mocks what would come from the back-end API
 */
export var PLAYER: Object = {
  'name': 'Princess Leia',
  'gender': 'f',
  'hardiness': 18,
  'agility': 15,
  'charisma': 16,
  'gold': 200,
  'weapon_abilities': {
    1: 5,
    2: -10,
    3: 20,
    4: 10,
    5: 0
  },
  'weapons': [
    {
      'name': 'mace',
      'weapon_type': 3,
      'weapon_odds': 10,
      'weapon_dice': 1,
      'weapon_sides': 4,
    },
    {
      'name': 'trollsfire',
      'weapon_type': 6,
      'weapon_odds': 25,
      'weapon_dice': 1,
      'weapon_sides': 10,
    }
  ],
  'spell_abilities': {
    'blast': 0,
    'heal': 50,
    'power': 70,
    'speed': 0
  }
};
