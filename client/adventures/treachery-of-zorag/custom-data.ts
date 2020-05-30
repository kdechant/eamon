// r%(X, 7) - Terrain type indicator (0 - Dungeon, 1 - Wilderness, 2 - Exterior, 3 - Mountains, 4 - Swamp)
export const terrain_data = {
  'dungeon': {
    'weather_effect': null,
    'move_time': 1
  },
  'road': {  // a.k.a. wilderness
    'weather_effect': [64, 65, 66, 67],
    'move_time': 10
  },
  'outdoor': {  // city, forest (a.k.a., exterior)
    'weather_effect': null,
    'move_time': 2
  },
  'mountains': {
    'weather_effects': [68, 69, 70, 71],
    'move_time': 12
  },
  'swamp': {
    'weather_effects': [72, 73, 74, 75],
    'move_time': 5
  }
};

export const talk_data = {
  // TODO: extract talk stuff from EDX data file and put it here
};
