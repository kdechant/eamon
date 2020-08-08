// r%(X, 7) - Terrain type indicator (0 - Dungeon, 1 - Wilderness, 2 - Exterior, 3 - Mountains, 4 - Swamp)
import {Monster} from "../../core/models/monster";

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

export const talk_data = [
  {
    monster: 1,
    word: '*',
    ignore: 0,
    effect: 3,
    repeat_effect: 4,
  },
  {
    monster: 2,
    word: '*',
    ignore: 0,
    effect: 6,
    repeat_effect: 8,
  },
  // boris
  {
    monster: 4,
    word: 'hello',
    ignore: 0,
    effect: 20,
  },
  {
    monster: 4,
    word: 'treasure',
    ignore: 0,
    effect: 14,
  },
  {
    monster: 4,
    word: 'guard',
    ignore: 0,
    effect: 15,
  },
  {
    monster: 4,
    word: 'adventure',
    ignore: 0,
    effect: 16,
  },
  {
    monster: 4,
    word: 'cliff',
    ignore: 0,
    effect: 18,
  },
  {
    monster: 4,
    word: 'where',
    ignore: 0,
    effect: 19,
  },
  {
    monster: 4,
    word: 'cave',
    ignore: 0,
    effect: 21,
  },
  // tealand
  {
    monster: 7,
    word: 'raulos',
    ignore: 0,
    effect: 36,
  },
  {
    monster: 7,
    word: ['druid', 'order'],
    ignore: 0,
    effect: 37,
  },
  {
    monster: 7,
    word: 'golem',
    ignore: 0,
    effect: 38,
  },
  {
    monster: 7,
    word: 'zorag',
    ignore: 0,
    effect: 39,
  },
  {
    monster: 7,
    word: ['fellspawn', 'cavern'],
    ignore: 0,
    effect: 40,
  },
  {
    monster: 7,
    word: 'prison',
    ignore: 0,
    effect: 41,
  },
  {
    monster: 7,
    word: 'hello',
    ignore: 0,
    effect: 42,
  },
  // witch seer
  {
    monster: 9,
    word: 'hello',
    ignore: 0,
    effect: 56,
  },
  {
    monster: 9,
    word: 'raulos',
    ignore: 100,
    effect: 76,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: 'zorag',
    ignore: 100,
    effect: 77,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: 'druid',
    ignore: 100,
    effect: 78,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: 'golem',
    ignore: 100,
    effect: 79,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: 'prison',
    ignore: 100,
    effect: 80,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: ['grimhold', 'tower'],
    ignore: 100,
    effect: 81,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: ['marsh', 'foulwater'],
    ignore: 100,
    effect: 82,
    withhold_effect: 86,
  },
  {
    monster: 9,
    word: ['cauldron', 'devil'],
    ignore: 0,
    effect: 83,
  },
  {
    monster: 9,
    word: 'guard',
    ignore: 0,
    effect: 84,
  },
  {
    monster: 9,
    word: ['save', 'world'],
    ignore: 100,
    effect: 85,
    withhold_effect: 86,
  },
  // companions
  {
    monster: 11,
    word: 'hello',
    ignore: 0,
    effect: 104,
  },
  {
    monster: 12,
    word: 'hello',
    ignore: 0,
    effect: 102,
  },
  {
    monster: 13,
    word: 'hello',
    ignore: 0,
    effect: 103,
  },
  // bartenders
  {
    monster: 39,
    word: 'hello',
    ignore: 0,
    effect: 120,
  },
  {
    monster: 39,
    word: ['adventurer', 'folk', 'druid', 'looney'],
    ignore: 100,
    effect: 125,
    repeat_effect: 127,
    withhold_effect: 124,
  },
  {
    monster: 40,
    word: 'hello',
    ignore: 0,
    effect: 123,
  },
  {
    monster: 40,
    word: 'boris',
    ignore: 0,
    effect: 128,
  },
  // zorag
  {
    monster: 34,
    word: 'hello',
    ignore: 0,
    effect: 134,
  },
  {
    monster: 34,
    word: 'druid',
    ignore: 0,
    effect: 133,
  },
  {
    monster: 34,
    word: 'raulos',
    ignore: 0,
    effect: 132,
    reaction_change: Monster.RX_FRIEND,
  },
];

export const event_triggers = {
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
    monster: 3,
    room: 75,
    effect: 138,
    triggered: 0,
    type: event_triggers.MONSTER_DIES,
    other_monster: null,  // this triggers game end
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
