// r%(X, 7) - Terrain type indicator (0 - Dungeon, 1 - Wilderness, 2 - Exterior, 3 - Mountains, 4 - Swamp)
export const terrain_data = {
  'dungeon': {
    'weather_effects': null,
    'move_time': 1
  },
  'road': {  // a.k.a. wilderness
    'weather_effects': [64, 65, 66, 67],
    'move_time': 10
  },
  'outdoor': {  // city, forest (a.k.a., exterior)
    'weather_effects': null,
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

const event_triggers = {
  ENTER_ROOM: 0,
  MONSTER_DIES: 1,
  // ENTER_ROOM_OPENS_DOOR: 2,
  MONSTER_FOLLOWS_PLAYER: 3,
  NOT_WEARING_ARTIFACT: 4,
  // MONSTER_GIVES_ITEM: 5,
}

export const triggered_events = [
  {
    monster: 1,
    room: 74,
    effect: 5,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 2,
    room: 81,
    effect: 7,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 3,
    room: 75,
    effect: 10,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 76,
    effect: 20,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 5,
    room: 50,
    effect: 27,
    triggered: 0,
    type: event_triggers.MONSTER_DIES,
    other_monster: 4,
  },
  {
    monster: 4,
    room: 54,
    effect: 22,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 51,
    effect: 23,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 80,
    effect: 23,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 79,
    effect: 22,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 46,
    effect: 24,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 14,
    effect: 22,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 15,
    effect: 25,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 4,
    room: 48,
    effect: 26,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
    door: 13,
  },
  {
    monster: 4,
    room: 49,
    effect: 28,
    triggered: -1,
    type: event_triggers.ENTER_ROOM,
  },
  // tealand / leaving room where you find him
  {
    monster: 7,
    room: 32,
    effect: 45,
    triggered: 0,
    type: event_triggers.MONSTER_FOLLOWS_PLAYER,
  },
  {
    monster: 0,
    room: 22,
    effect: 46,
    triggered: 0,
    type: event_triggers.NOT_WEARING_ARTIFACT,
    artifact: 9,
  },
  {
    monster: 0,
    room: 41,
    effect: 47,
    triggered: 0,
    type: event_triggers.NOT_WEARING_ARTIFACT,
    artifact: 9,
  },
  {
    monster: 0,
    room: 42,
    effect: 48,
    triggered: 0,
    type: event_triggers.NOT_WEARING_ARTIFACT,
    artifact: 9,
  },
  // tealand / dungeon door
  {
    monster: 7,
    room: 43,
    effect: 49,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
    door: 20,
  },
  {
    monster: 9,
    room: 142,
    effect: 56,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
    received_artifact: 24,
  },
  {
    monster: 3,
    room: 75,
    effect: 93,
    triggered: 0,
    type: event_triggers.MONSTER_DIES,
    end: true,
  },
  {
    monster: 13,
    room: 343,
    effect: 111,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 39,
    room: 77,
    effect: 121,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
  {
    monster: 40,
    room: 76,
    effect: 122,
    triggered: 0,
    type: event_triggers.ENTER_ROOM,
  },
]
