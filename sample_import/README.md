# Sample JSON import files

The files in this directory are examples of the file formats used by the data import script. The files themselves are
JSON, with the fields depending on the object type.

Note: Properties of the JSON objects may appear in any order. Only the names are important.

## Rooms

Example schema:

```json
[
  {
    "id": 1,
    "name": "Entrance",
    "description": "You are standing at the castle entrance.",
    "n": 2,
    "s": 0,
    "e": 0,
    "w": 4,
    "u": 0,
    "d": 0,
    "ne": 0,
    "se": 0,
    "sw": 0,
    "nw": 0,
    "light": 1
  },
  {
    "id": 2,
    "name": "Great Hall",
    "description": "You are in the great hall of the castle.",
    "n": 3,
    "s": 1,
    "e": 0,
    "w": 0,
    "u": 0,
    "d": 5,
    "ne": 0,
    "se": 0,
    "sw": 0,
    "nw": 0,
    "light": 1
  }
]
```

Fields:
* id: an integer greater than zero
* name: a string
* description: a string
* n, s, w, e, u, d, ne, se, sw, nw: the room IDs of the connections in each direction.
  * Use zero for no connection
  * Connection numbers greater than 500 refer to a door, where the artifact ID of the door is the number minus 500. So if the door's artifact ID is 7, the value here should be 507. The door artifact itself contains the room that the connection goes to.
  * Negative numbers are allowed, and are used by special code in the adventure.
  * The diagonal directions (NE, SE, SW, NW) are optional and may be omitted. Or just leave them all zero if working on a 6-direction adventure
* light: 0 to make the room dark, 1 to make it not dark (if not present, the default is 1)

## Artifacts

Example schema:

```json
[
  {
    "id": 1,
    "name": "throne",
    "description": "You see the king's throne. It has a large sunburst on top.",
    "weight": 999,
    "type": 1,
    "room_id": 3,
    "value": 0,
    "field5": null,
    "field6": null,
    "field7": null,
    "field8": null
  },
  {
    "id": 2,
    "name": "magic sword",
    "description": "You see a shiny magic sword.",
    "value": 500,
    "type": 3,
    "weight": 3,
    "room_id": 512,
    "field5": 25,
    "field6": 5,
    "field7": 2,
    "field8": 8
  }
]
```

Fields:
* id: an integer greater than zero
* name: a string
* description: a string
* value: an integer
* type: an integer from 0-12 representing the item type
* weight: an integer
* room_id: the ID of the room where the item is found
  * If the room_id is greater than 200, that indicates an embedded artifact. e.g., room_id 203 means the artifact is embedded in room 3
  * If the room_id is greater than 500, that means it's in a container, where the number minus 500 is the artifact id
    of the container. e.g., room_id 512 means that the artifact is inside the container with artifact id 12.
  * If the room_id is -1, the artifact appears in the player's inventory
  * If the room_id is below -1, the artifact appears in a monster's inventory, e.g., room_id -3 means that monster #2 is carrying it
* field5, field6, field7, field8: These are different for every artifact type. The JSON data should contain the same values as 
  found in the original Eamon data file. The Python import script will unpack this data into the new fields.
  * For weapons (types 2 and 3) these are the odds, weapon type, dice, and sides
  * For treasures (types 0 and 1) these are unused
  * For other types, like potions and doors, these have special meaning that is described in the Eamon Deluxe documentation

## Effects:

Sample data:

```json
[
  {
    "id": 1,
    "text": "this is sample text"
  },
  {
    "id": 2,
    "text": "this is sample text"
  }
]
```

Fields:
* id: an integer
* text: a string

## Monsters (MAIN PGM v4, v5, or v6)

For adventures using the version 4, 5, or 6.x MAIN PGM, the fields are:

```json
[
  {
    "id": 1,
    "name": "guard",
    "description": "You see a big guard wearing chainmail.",
    "hardiness": 40,
    "agility": 10,
    "friendliness": 0,
    "courage": 100,
    "defense_odds": 0,
    "room_id": 1,
    "weight": 100,
    "armor_class": 2,
    "weapon_id": 4,
    "offense_odds": 50,
    "weapon_dice": 1,
    "weapon_sides": 5
  }
]
```

Fields:
* id: an integer greater than zero
* name: a string
* description: a string
* hardiness: an integer
* agility: an integer
* friendliness: an integer, usually in the range 0-200
* courage: an integer, usually in the range 0-200
* defense_odds: an integer, usually zero, but sometimes greater than zero
* room_id: an integer, for the ID of the room where the monster starts
* weight: an integer, unused
* armor_class: an integer, usually in the range 0-7
* weapon_id: an integer, either an artifact ID, or zero for natural weapons, or -1 for no weapon
* offense_odds: an integer, usually in the range 25-75
* weapon_dice: an integer, used as the dice for natural weapons. Not used if the weapon_id is greater than zero
* weapon_sides: an integer, used as the sides for natural weapons. Not used if the weapon_id is greater than zero

## Monsters (MAIN PGM v7)

TODO
