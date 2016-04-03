/**
 * JSON data that mocks what would come from the back-end API
 */
export var MONSTERS: Array<Object> = [
  {
    "id": 1,
    "name": "guard",
    "description": "You see a big guard wearing chainmail.",
    "room_id": 1,
    "hardiness": 40,
    "agility": 15,
    "courage": 100,
    "friendliness": "neutral",
    "friend_odds": 40,
    "attack_odds": 33,
    "weapon_id": 4,
    "weapon_dice": 1,
    "weapon_sides": 5,
    "armor_class": 2
  },
  {
    "id": 2,
    "name": "king",
    "description": "You see the king. He has a crown and a purple robe.",
    "room_id": 3,
    "hardiness": 10,
    "agility": 10,
    "courage": 100,
    "friendliness": "neutral",
    "armor_class": 0
  },
  {
    "id": 3,
    "name": "Alfred",
    "synonyms": "al",
    "description": "You see a fellow adventurer wearing plate mail and holding a sword. He says his name is Alfred.",
    "room_id": 1,
    "hardiness": 15,
    "agility": 12,
    "courage": 100,
    "friendliness": "friend",
    "attack_odds": 50,
    "weapon_id": 8,
    "weapon_dice": 1,
    "weapon_sides": 8,
    "armor_class": 5
  },
  {
    "id": 4,
    "name": "thief",
    "synonyms": "bandit,bad guy",
    "description": "You see a thief who is looking for the treasure vault.",
    "room_id": 2,
    "hardiness": 15,
    "agility": 12,
    "courage": 10,
    "friendliness": "hostile",
    "attack_odds": 30,
    "weapon_id": null,
    "armor_class": 1
  }
];
