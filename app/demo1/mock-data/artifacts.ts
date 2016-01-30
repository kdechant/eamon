/**
 * JSON data that mocks what would come from the back-end API
 */
export var ARTIFACTS: Array<Object> = [
  {
    'id': 1,
    'name': 'throne',
    'description': 'You see the king\'s throne. It has a large sunburst on top.',
    'room_id': 3,
    'weight': 1000,
    'value': 0
  },
  {
    'id': 2,
    'name': 'gold bars',
    'description': 'You see a pile of gold bars. They look heavy but are probably worth a lot of money.',
    'room_id': 4,
    'weight': 50,
    'value': 1000
  },
  {
    'id': 3,
    'name': 'magic sword',
    'description': 'You see a shiny magic sword.',
    'room_id': 4,
    'weight': 3,
    'value': 500,
    'is_weapon': true,
    'weapon_type': 5,
    'weapon_odds': 20,
    'dice': 2,
    'sides': 8
  },
  {
    'id': 4,
    'name': 'spear',
    'description': 'You see a standard 10-foot-long spear.',
    'room_id': null,
    'monster_id': 1,
    'weight': 5,
    'value': 10,
    'is_weapon': true,
    'is_standard_weapon': true,
    'weapon_type': 4,
    'weapon_odds': 10,
    'dice': 1,
    'sides': 5
  },
  {
    'id': 5,
    'name': 'gold key',
    'description': 'You see a gold key sitting next to the throne.',
    'room_id': 3,
    'monster_id': null,
    'weight': 1,
    'value': 0,
    'is_weapon': false,
  },
];
