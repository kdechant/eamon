# Eamon Adventure Design Manual - Event Handlers

In Classic Eamon for the Apple 2 and Eamon Deluxe for MS-DOS, adventure designers could edit the "Main Program" as they
 pleased to insert custom features into the game, such as a special effect when the player picks up an item, drinks
 a potion, enters a specific room, etc.
 
This system made sense at the time, but required each adventure to keep its own copy of the main program and all the
core logic. With over 250 adventures, it becomes difficult to keep each one up to date with bug fixes and new features
of the core engine.

In the web-based Eamon, all adentures share the core game logic, which provides basic features like moving, getting
 items, combat, etc. A system of event handlers is used to allow adventure designers the capability to insert their
 own special effects at important points in the game.
 
## How do I use event handlers?

Each adventure contains its own "event-handlers.ts" file. This contains all the event handlers for the adventure.

Event handlers are just TypeScript functions which take a few parameters. The parameters themselves vary with each event
handler, but they make sense for the type of event that is occurring. A "use item" handler might accept the artifact
object as an parameter, while a "say" event handler might accept the word being said as its parameter.

An example of a simple event handler:
    
      "say": function(phrase: string) {
        let game = Game.getInstance();
        if (phrase === 'magic' && game.artifacts.get(5).isHere()) {
          game.history.write("POOF!!", "special");
          game.artifacts.get(5).destroy();
        }
      },

What happened here?
- The "say" event handler takes one parameter, the phrase being said
- We can test for the phrase. In this case, we test if the player says "magic" while carrying artifact #5
- If true, we call `game.history.write()` to print a string to the output, using the "special" color (blue)
- We also destroy artifact #5. This removes it from the player's inventory and the game.

Some event handlers also return a value, usually a boolean. This is a signal to the core code that processing on that
event should continue, or stop. For example, a "beforeMove" handler might return `false` if the movement should be
prevented.

Another example:
    
      "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
        let game = Game.getInstance();
        if (exit.room_to === -1) {
          // print an effect -- can't go that way
          game.effects.print(3);
          return false;
        }
        return true;
      },
  
What happened here?
- The "beforeMove" handler takes three parameters, the direction the player typed in, the Room object for the room the
 player is *currently* in, and the RoomExit object representing the exit the player is trying to take.
- The adventure designer has used a special exit code of -1 to indicate a connection that requires special handling
- We use `game.effects.print()` to print a specific event text from the `effects` table in the database
- We return *false* here to prevent the player from moving
- The event handler is called for all player movement, not just movement to exit -1. Thus, we need to return true
 if no conditions were met.

# Example event handlers

The following is a list of all the available event handlers, how they're used, and a sample handler of each type.

## Game Start

The "start" eveny handler runs once at the very beginning of the game. Use this to set up initial variables and move
monsters and artifacts around before the player can interact with them.

Parameters: none

Sample code:

      "start": function(arg: string) {
        let game = Game.getInstance();
    
        // declare some variables
        game.data['my var'] = true;
        game.data['another var'] = 5;
        
        // move monster #2 to a random room
        game.monsters.get(2).moveToRoom(game.diceRoll(1,6));
      },

## Before Move and After Move

This is a pair of event handlers which provides special logic around player movement.

### Before Move

`beforeMove()` is called immediately before the player moves. It can do a special
effect, or it can block the movement if a condition isn't met.

* NOTE: Don't use beforeMove() to implement basic "locked door" logic. This is built into the core game engine.

Parameters: 
- arg (string): the direction the player entered (n, s, e, w, u, d, etc.)
- room (Room): The Room object of the room the player is moving *from*
- exit (RoomExit): The RoomExit object the player is trying to follow.

Sample:

      "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
        let game = Game.getInstance();
    
        if ((exit.room_to === -5 && !game.data["elevator on"]) {
          game.history.write("The elevator must first be turned on.");
          return false;  // this prevents movement. player will stay in current room
        } else {
          switch (exit.room_to) {
            case -5:
              // going up, after elevator has been turned on
              exit.room_to = 5;
              break;
          }
        }
        // any other connections return true. this allows movement unimpeded.
        return true;
      },

### After Move

`aftermove()` is triggered immediately after the player completes his/her movement. Use this to trigger a special effect
that happens as soon as a player enters a new room. Any text displayed in this event handler will appear before any combat
text and room descriptions shown in this turn.

Parameters:
- arg (string): the direction the player entered (n, s, e, w, u, d, etc.)
- room_from (Room): The Room object that the player moved *from*
- room (Room): The Room object that the player moved *to*
    
Sample:

      "afterMove": function(arg: string, room_from: Room, room_to: Room) {
        let game = Game.getInstance();
        // show a warning when entering this room
        if (room_to.id === 28 && !game.data["player was warned"]) {
          game.data["player was warned"] = true;
          game.history.write("You are in grave danger", "emphasis");
        }
      },

## Use

The `use()` handler is called whenever a player tries to USE an artifact. This includes eating or drinking artifacts. (Healing potions and healing food are built into the core game, but other special effects should use this event handler).

Parameters:
- arg (string) - What the player typed after USE (e.g., "use *lever*" )
- artifact (Artifact) - If the player's text matched the name of an artifact, this will contain the Artifact object.

Example:

    "use": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        if (artifact) {
          if (artifact.name === 'strength potion') {
            game.history.write("The potion increased your hardiness!", "special")
            game.player.hardiness++;
          }
        }
      },
    },

The example above works for using a specific artifact. You can also program in special effects for other strings that aren't artifacts.

Example 2:

    "use": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        if (arg === "the force") {
          game.history.write("You pull the light saber to you using the Force.");
          game.artifacts.get(10).player_id = Monster.PLAYER;
        }
      },
    },

A note on healing potions and healing food:

These common types of artifacts are handled by the core game and don't require a custom event handler. Set the artifact type to "Edible" (9) or "Drinkable" (6), then set the dice and sides to match the amount of healing effect you want.

## Give

The "give" event is triggered when the player tries to give an artifact to an NPC. It runs just before the actual artifact transfer occurs.
 
Parameters:
- arg (string) - What the player typed after USE (e.g., "give *sword to alfred*" )
- artifact (Artifact) - What the player is trying to give
- recipient (Monster) - To whom the player is trying to give it

Example:

      "give": function(arg: string, artifact: Artifact, recipient: Monster) {
        let game = Game.getInstance();
        // ranger
        if (recipient.id === 11) {
          game.history.write(recipient.name + " is still pretending that you aren't here.");
          return false;
        }
        return true;
      },

## Magic spells

There are several events related to casting spells. These include the POWER spell which has no built-in functionality but relies entirely on event handlers.
 
### Power 

The base adventure includes a default implementation of POWER, but you All adventures should

### Blast

### Before Spell

This is a general-purpose event handler that can be called before any spell is cast. It can alter the spell or prevent it from firing.

Parameters:
- spell_name (string) - The name of the spell ("blast", "heal", "power", or "speed")

Example:

