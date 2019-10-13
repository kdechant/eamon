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
- We can test for the phrase. In this case, we test if the player says "magic" while artifact #5 is in the room or in the player's inventory
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

# Basic coding techniques

There are some classes and utilities that apply to all event handlers. This section describes them and provides a few examples.

## Objects and Repositories

The collections of rooms, artifacts, effects, and monsters are organized into Repository classes, with each repository
 containing the entire set of objects of that type. Additionally, there is a Game class which represents the overall
 game engine (similar to the MAIN PGM in Classic Eamon).

## The Game object

At the beginning of many event handlers, there is a special line:

    let game = Game.getInstance();

This allows you to access the global Game instance, which is a singleton. This provides access to the object repositories.

The Game object has the following important properties:

- game.rooms: Repository of rooms
- game.artifacts: Repository of artifacts
- game.effects: Repository of effects
- game.monsters: Repository of monsters
- game.player: The player, who is also a Monster (monster #0)
- game.hints: The hints that appear when the player clicks the "Hints" button below the command prompt
- game.intro_text: The text that appears before the start of the game

These are described in detail below.

## Writing messages to the output

It's quite frequent to display a certain message to the player when they take an action, like entering a room, opening a
 chest, or using an artifact. This can be done using the `game.history` object, which represents the game output.
 
    // write a message in the default font
    game.history.write('The dragon blocks your way!');
    // write a message using a custom style
    game.history.write('The scroll disappears in a puff of smoke!', 'special');

The available styles are as follows:

- normal - regular text
- emphasis (black, bold): Used for slightly more emphasis, but without a particular meaning
- success (green): Used for messages where the player successfully did something
- warning (orange): Used in combat messages, and anywhere something risky is happening
- danger (red): Used in combat to indicate a monster's death. Also can be used when another highly dangerous event happens.
- special (blue): Used for special effects, magic spells, etc.
- special2 (purple): Used for special effects, magic spells, etc.

For finer control of the output, you may also use the optional third "Markdown" argument to `game.history.write()`:

    // write a message using Markdown to mix regular and bold font
    game.history.write('The dragon snarls, **"Go Away"**', 'normal', true);  // third argument "true" enables Markdown

## Working with Rooms, Artifacts, and Monsters

The Game object contains references to all the objects contained within your adventure. The repositories are available
 at `game.rooms`, `game.artifacts`, `game.effects`, and `game.monsters`. There are also other objects that are less
 frequently used in event handlers, such as `game.hints`.
 
Here are some examples of working with the repositories:

    // get a room by its ID
    let r = game.rooms.get(1);
    // get all rooms
    let r = game.rooms.all;
    // get all rooms that are dark
    let dark_rooms = game.rooms.all.filter(r => r.is_dark);

    // get all monsters
    let monsters = game.monsters.all;
    // get the visible monsters (a filtered view of the monsters visible in the current room; updated after
    // each player command and each monster's combat actions)
    let monsters = game.monsters.visible;
    // get a single monster by ID
    let m1 = game.monsters.get(1);
    
    // get all artifacts
    let artifacts = game.artifacts.all;
    // get the visible artifacts (a filtered view of the artifacts visible in the current room; updated after
    // each player command and each monster's combat actions; does not include unrevealed embedded artifacts and
    // secret doors the player hasn't found yet.)
    let artifacts = game.artifacts.visible;
    // get a single artifact by ID
    let a1 = game.artifacts.get(1);
    // get everything the player is carrying
    let inv = game.player.inventory;
    // get everything a monster is carrying (as an array of artifacts)
    let m1_inv = game.monsters.get(1).inventory;
    // get the contents of a container (as an array of artifacts)
    let contents = game.artifacts.get(3).contents;
    
The room, monster, and artifact arrays are standard JavaScript arrays, and can be used in loops and with higher-order
 functions like `map`, `filter`, and `find`. 
 
    // change the friendliness of all monsters in the game
    game.monsters.all.forEach(m => m.reaction = Monster.RX_HOSTILE);
    // get the currently visible artifacts that are weapons
    let weapons = game.artifacts.visible.filter(a => a.type === Artifact.TYPE_WEAPON || a.type === Artifact.TYPE_MAGIC_WEAPON);

In addition, Monsters and Artifacts have a few special methods and properties:

    // move a monster to the player's current room
    game.monsters.get(1).moveToRoom();
    // move a monster to a numbered room
    game.monsters.get(1).moveToRoom(5);
    // remove a monster from the game
    game.monsters.get(1).destroy();  // note: this does not actually kill them; they can be later brought back by another event with moveToRoom()
    // do damage to a monster
    game.monsters.get(1).injure(5);
    game.monsters.get(1).injure(5, true);  // same as above, but ignores armor
    
    // move an artifact to the player's current room
    game.artifacts.get(6).moveToRoom();
    // move an artifact to a numbered room
    game.artifacts.get(6).moveToRoom(5);
    // move an artifact into the player's inventory
    game.artifacts.get(6).moveToInventory();
    // move an artifact into a numbered monster's inventory
    game.artifacts.get(6).moveToInventory(3);
    // reveal an embedded artifact (making it appear in the artifacts list in the status sidebar)
    game.artifacts.get(10).reveal();
    // open/close a door or container
    game.artifacts.get(8).open();
    game.artifacts.get(8).close();
    // remove an artifact from the game
    game.artifacts.get(6).destroy();
    // determine if the player is carrying an artifact
    if (game.player.hasArtifact(3)) ...
    // determine if an artifact is "here" (meaning, if it's in the current room OR the player's inventory)
    if (game.artifacts.get(3).isHere()) ...
    // determine if an artifact is inside a container
    if (game.artifacts.get(3).container_id === 7) ...    

## Effects

Effects are far simpler objects, containing just an ID, the effect text, and the style, which determines the color of the
 text shown to the player.

Working with effects is easy:

    // show an effect, using the style defined in the database
    game.effects.print(1);
    // show an effect, overriding the style
    game.effects.print(1, "special")

The text styles available are the same ones described in the "Writing messages to the output" section above.

### Countdown

For timed effects, you can set a counter on the game object.

    game.counters['my counter'] = 5;
    
Then to count the counter down and return true when it runs out, you can
 call `game.countdown()` from within any event handler. This returns true
 if the countdown expired, and false otherwise. This usually works best
 when called from one of the "endTurn" event handlers, which run every turn.
 
    "endTurn1": function () { 
      if (game.countdown('my counter')) {
        // do something when the countdown runs out
      }
    }

# Example event handlers

The following is a list of all the available event handlers, how they're used, and a sample handler of each type.

## Game Intro

The "intro" event handler is called after the game data is initialized, right as the intro text is shown. Use this to 
alter the intro text if you need to.

Parameters: none

Sample code:

      "intro": function() {
        let game = Game.getInstance();
        // change the intro text if the player is female
        if (game.player.gender === 'f') {
          game.intro_text = game.intro_text.replace("Larcenous Lil", "Slippery Sven");
        }
      },

## Game Start

The "start" event handler runs once at the very beginning of the game. Use this to set up initial variables and move
monsters and artifacts around before the player can interact with them. Any text or effects printed in this event 
handler will appear at the very beginning of the game output. To change the pre-game intro text, use the "intro"
event handler instead.

Certain monster behaviors can also be set up in the 'start' event handler:
* You can give a monster custom attack messages
* You can give a monster the ability to cast standard spells like 'heal' or 'blast' 
* Monsters can be assigned custom data that can be used in later logic, like flags

Certain other aspects of the game can also be customized:
* The name of the money
* The names of the standard Eamon characters you meet at the end of the adventure (e.g., Sam Slicker) 
* The verbs used in the text when a monster flees

Parameters: none

Sample code:

      "start": function() {
        let game = Game.getInstance();
    
        // declare some variables, which can be used in other event handlers as game flags, counters, etc.
        game.data['my var'] = true;
        game.data['another var'] = 5;
        
        // give monster #1 custom attack messages, which replace the usual "swings" or "slashes" messages
        game.monsters.get(1).combat_verbs = ["breathes fire at", "claws at", "swings its tail at"];
        
        // move monster #2 to a random room
        game.monsters.get(2).moveToRoom(game.diceRoll(1,6));
        
        // give monster #3 the ability to cast spells
        game.monsters.get(3).spells = ['blast', 'heal'];  // The spells the monster can cast. Only 'blast' and 'heal' are implemented so far
        game.monsters.get(3).spell_points = 3;  // The monster can cast 3 spells during the adventure, then no more. This does not recharge.
        
        // change the name of the money for this adventure
        // (enter this as singular; it will be automatically pluralized)
        game.money_name = 'credit';
        
        // change the name of Sam Slicker and Lord William Missilefire
        game.lwm_name = 'Lord Alfred Arrowshoot';
        game.ss_name = 'Fast Charlie Benante';
        
        // change the text shown when a monster flees
        game.flee_verbs = {'singular': "runs away", 'plural': "run away"};
        
      },

## End of Turn

There are three useful event handlers that happen at the end of each turn. These are used in many adventures and it
helps to be familiar with them. They happen in this order:

1. The monsters take their turns (attacking, picking up weapons, etc.)
1. The `endTurn` event handler runs
1. The room name or description is shown
1. The `endTurn1` event handler runs
1. The artifact and monster names or descriptions are shown
1. The `endTurn2` event handler runs

All these event handlers are called with no arguments. You may access the game variables like `game.player`, `game.rooms`,
 `game.artifacts`, `game.monsters`, etc. from within your event handlers.

Examples:

### End Turn

This happens after movement and monster actions, but before the room name or description is shown.

      "endTurn": function() {
        let game = Game.getInstance();
    
        // merlin appears, if he hasn't already appeared
        if (game.player.room_id == 77 && !game.effects.get(11).seen) {
          game.effects.print(11);
          game.monsters.get(48).moveToRoom();
        }
      },

### End Turn 1

This happens after the room name or description is shown, but before the artifact and monster names or descriptions are shown. 

      "endTurn1": function () {
        let game = Game.getInstance();
        
        // the snowman melts when entering a room that's too warm
        if (room_id == 37 && game.monsters.get(2).isHere()) {
            game.history.write("Frosty just melted!", "special2");
            game.monsters.get(2).destroy();
        }
      }

### End Turn 2

This happens at the very end of the turn, after all names and descriptions are shown.

      "endTurn2": function() {
        let game = Game.getInstance();
    
        // a sudden death trap that occurs if a certain monster is in the room
        if (game.monsters.get(1).isHere()) {
          game.effects.print(5);
          game.die();
        }
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

## Open

There are two event handlers that run when the player tries to open a door, gate, or container.
 
### beforeOpen

This event handler runs just before the player opens a door/gate or container. It can be used to prevent the artifact
 from being opened. It can also be used to allow the player to try to open something
 that isn't an actual artifact object.
 
Parameters:
- arg (string) - What the player typed after OPEN (e.g., "close *chest*" or "close *window*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Return value:
true - allows the door/gate or container to open
false - stops the door/gate or container from being opened

Example:
    
    "beforeOpen": function(arg: string, artifact: Artifact) {
      let game = Game.getInstance();
      if (artifact !== null) {
        if (artifact.id === 23) {
          artifact.reveal();  // this artifact is embedded; trying to open it reveals it.
          game.history.write("It's stuck! You will need to find a way to pry it open.");
          return false;
        }
      }
     return true;
    },

### "afterOpen"

This happens after the door, gate, or container is opened.

Parameters:
- arg (string) - What the player typed after OPEN (e.g., "close *chest*" or "close *window*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Return value: none. 

Example:

    "afterOpen": function(arg: string, artifact: Artifact) {
      let game = Game.getInstance();
      if (artifact !== null) {
        if (artifact.id === 23) {
          // the grain sack is a death trap
          command.opened_something = true;
          game.effects.print(3, "danger");
          game.die();
        }
      }
    },

## Close

This is called when the player tries to close an artifact like a container or door. It can be used to handle situations
where the player shouldn't be able to close something (like a door that's been broken open), or when a player should
try to close something that is not an explicit artifact.

Parameters:
- arg (string) - What the player typed after CLOSE (e.g., "close *chest*" or "close *window*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "beforeClose": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        // trying to close a drawbridge when the winch has been smashed
        if (artifact.name === 'drawbridge' && game.data['drawbridge winch smashed']) {
          game.history.write("The winch has been smashed. You can't close it.");
          return false; // stops the game from running the rest of the "close" command logic
        }
        return true; // normal situation not handled above; resume regular command logic
      },
    },

A note on standard doors/gates and containers like chests or bags:

These common types of artifacts are handled by the core game logic and don't require a custom event handler. Set the artifact type to "Door/Gate" (8) or "Container" (4). Optionally give it a "key_id" to lock it using that artifact ID, or put items into a container by setting their "container_id" property to the ID of the container artifact.

## Get

There are several event handlers which trigger when the player tries to get an artifact.

### Before Get

This is called as the player tries to pick something up. This applies to artifacts that are on the ground. For artifacts
 in containers, the `beforeRemoveFromContainer` event handler will also be called.
 
Parameters:
* arg (string) - What the player typed after GET (e.g., "get *magic sword*" )
* artifact (Artifact) - If the player's text matched the name of an artifact in the room, or in an open container in the room, this will contain a reference to the Artifact object.

Return Value:
Return true to allow the "get" operation to continue, or false to prevent the player from getting the artifact.

Example:

    "beforeGet": function(arg, artifact) {
      let game = Game.getInstance();
      // special message when the player tries to pick up the throne
      if (artifact && artifact.id === 1) {
        game.history.write("There's no way you'll ever be able to carry the throne!");
        return false;
      }
      return true;
    },

### After Get

This is called after the player has already gotten the artifact. It can be used to create special effects, or do things
 that require the artifact to already be in the player's inventory. To prevent the player from getting the artifact at
 all, use `beforeGet` instead.

Parameters:
* arg (string) - What the player typed after GET (e.g., "get *magic sword*" )
* artifact (Artifact) - If the player's text matched the name of an artifact in the room, or in an open container in the room, this will contain a reference to the Artifact object.

Example:

    "afterGet": function(arg, artifact) {
      let game = Game.getInstance();
      // special message when the player finds the treasure
      if (artifact && artifact.id == 3) {
        game.history.write("The magic sword is so shiny you decided to ready it.");
        game.player.ready(artifact);
      }
      return true;
    },

### specialGet

This is used to create custom logic when the player tries to get something that isn't a full-fledged artifact object.
 For example, there might be an item described in a room description that doesn't have a real artifact, or that describes
 an artifact that isn't actually in the current room.
 
For example: in the adventure "Sword of Inari", the player can see the sword from a distance, but can't interact with it
 because it isn't actually in the current room. If the player does try to get it in this situation, the game shows some
 specific messages.

Note: This is called *before* the `beforeGet` and `afterGet` event handlers, and returning false will also prevent those from running.

Parameters:
* arg (string) - What the player typed after GET (e.g., "get *magic sword*" )

Return Value:
true: allow the "get" operation to continue
false: prevent any further logic from executing 

Example:

      "specialGet": function(arg): boolean {
        let game = Game.getInstance();
        // if you try to get the sword when it's still in the brace
        let sword = game.artifacts.get(12);
        if (sword.match(arg) && sword.container_id === 31) {
          if (game.player.room_id === 10) {
            game.history.write("You can't reach it from here!");
            return false;
          } else if (game.player.room_id === 11) {
            game.history.write("The brace holds the sword in place!");
            return false;
          }
        }
        return true;
      },

## Drop

This event handler is a bit simpler than the "get" ones and is not as frequently used. It can prevent the player from
 dropping something, so in that sense, it's more like a "before drop" handler.

Parameters:
* arg (string) - What the player typed after DROP (e.g., "drop *magic sword*" )
* artifact (Artifact) - The artifact the player is attempting to drop

Return value:
true: allow the player to drop the artifact
false: prevent the player from dropping the artifact

Example:

    "drop": function(arg: string, artifact: Artifact): boolean {
      if (artifact.id === 20) {
        // can't drop cursed item
        Game.getInstance().history.write("You can't pry the cursed sword from your hand!");
        return false;
      }
      return true;
    },

## Remove item from a container

There are two event handlers associated with removing artifacts from containers.

### beforeRemoveFromContainer

This is called when the player tries to remove an artifact from a container. It is also called when the player tries to
 "get" an item that is inside a container.

Note: for adding events when the player removes a wearable artifact from their body, see the "beforeRemoveWearable" event
 handler below.

Parameters:
- arg (string) - What the player typed after REMOVE (e.g., "remove *jewels from chest*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in a container, which is in the current room or in the player's inventory, this will contain the Artifact object.
- container (Artifact) - The container the player is trying to remove the artifact from

Return Value:
Return true if the artifact should be removed from the container, or false to prevent it from being removed.

Example: 

    "beforeRemoveFromContainer": function(arg: string, artifact: Artifact, container: Artifact) {
      let game = Game.getInstance();
      if (artifact) {
        if (artifact.id === 14) {
          game.history.write("A magic force is holding the wand in the chest. You can't remove it.");
          return false;
        }
      }
      return true;
    },

### afterRemoveFromContainer

This is called just after the artifact is removed from the container. It can produce special effects, but it can't be
 used to stop the removal from happening.
 
Parameters:
- arg (string) - What the player typed after REMOVE (e.g., "remove *jewels from chest*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in a container, which is in the current room or in the player's inventory, this will contain the Artifact object.
- container (Artifact) - The container the player is trying to remove the artifact from

Example:

    "afterRemoveFromContainer": function(arg: string, artifact: Artifact, container: Artifact) {
      let game = Game.getInstance();
      // special message when the player finds the treasure
      if (artifact && artifact.id === 3) {
        game.history.write("That's a fine-looking sword.");
      }
      return true;
    },

## Put an item into a container

There are three event handlers that happen when the player uses the PUT command.

### beforePut

This happens when the player is trying to put an item into a container, immediately before it goes in. It can be used
 to prevent the insertion. (If you need to use the PUT command with something that's not a container, see the 
 "specialPut" event handler below.) 

Parameters:
- arg (string) - What the player typed after PUT (e.g., "put *sword into scabbard*" )
- artifact (Artifact) - The artifact being put into the container (in this case, the sword)
- container (Artifact) - The container the player is trying to put the artifact into (in this case, the scabbard)

Return Value:
true: allow the item to be put into the container (if it fits)
false: prevent the item from being put into the container

Example:

    "beforePut": function(arg: string, artifact: Artifact, container: Artifact) {
      let game = Game.getInstance();
      // can't put a cursed item into a container, because you can't let go of it
      if (artifact.id === 20) {
        Game.getInstance().history.write("You can't pry the cursed sword from your hand!");
        return false;
      }
      return true;
    },

### afterPut

This is called just after the player puts something into a container.

Parameters:
- arg (string) - What the player typed after PUT (e.g., "put *sword into scabbard*" )
- artifact (Artifact) - The artifact that was just put into the container (in this case, the sword)
- container (Artifact) - The container the player just put the artifact into (in this case, the scabbard)

Return Value: none

Example:

    "afterPut": function(arg: string, item: Artifact, container: Artifact) {
      let game = Game.getInstance();
      if (item.id === 25 && container.id === 56) {
        game.history.write("The Hellsblade is contained, for now...", "special2");
        container.inventory_message = "with Hellsblade inside";
      }
    },

### specialPut

This allows the player to put something into an artifact that isn't a real container, or to put arbitrary items into
 other items, even if they're not full-fledged artifacts. This is called before "beforePut" and if it returns false, it
 will cancel the rest of the "put" logic, meaning that the artifact won't end up in the container.

Note: This is called *before* the `beforePut` and `afterPut` event handlers, and returning false will also prevent those from running.

Paramerers:

Return value:
true: to allow the normal PUT operation to continue (e.g., artifact goes into the container if it fits)
false: to 

Example:

    "specialPut": function(arg: string, item: Artifact, container: Artifact) {
      let game = Game.getInstance();
      // rubies / statue
      if (item.id === 14 && container.id === 71) {
        game.history.write("You put the rubies into the statue's scepter and you hear hidden gears grinding. The south wall swings open!");
        container.is_open = true;
        return false;   // skips the rest of the "put" logic
      }
      return true;
    },

## Wear an artifact

This is called when the player puts on a wearable artifact.

Parameters:
- arg (string) - What the player typed after WEAR (e.g., "wear *ring*" )
- artifact (Artifact) - If the player's text matched the name of an artifact is in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "wear": function(arg: string, target: Artifact) {
      let game = Game.getInstance();
      // can't attack or wear backpack
      if (target.id === 13) {
        game.history.write("You don't need to. Just carry it.");
        return false;
      }
      return true;
    },

## Take off (remove) a wearable artifact

The REMOVE command is used for both removing an item from a container, and for removing an article of clothing or armor
 (called a "wearable" artifact). The two uses each have different event handlers.
 
### beforeRemoveWearable

This is called just before the player takes off the artifact. It can prevent the artifact from being taken off.

Parameters:
- arg (string) - What the player typed after REMOVE (e.g., "remove *helmet*" )
- artifact (Artifact) - The Artifact object representing the artifact that the player is trying to take off

Return value:
true: Allow the artifact to be taken off
false: Prevent tha artifact from being taken off

Example:

    "afterRemoveWearable": function(arg: string, artifact: Artifact) {
      let game = Game.getInstance();
      // take off gauntlets
      if (artifact && artifact.id === 57) {
        game.history.write("You can't take that off!", "special2");
        return false
      }
      return true;
    },

### afterRemoveWearable

This is called just after the artifact has been taken off.

Parameters:
- arg (string) - What the player typed after REMOVE (e.g., "remove *helmet*" )
- artifact (Artifact) - The Artifact object representing the artifact that the player just took off

Return value: none

Example:

    "afterRemoveWearable": function(arg: string, artifact: Artifact) {
      let game = Game.getInstance();
      // take off gauntlets
      if (artifact && artifact.id === 57 && game.player.hasArtifact(25)) {
        game.history.write("The Hellsblade twitches eagerly!", "special2");
      }
      return true;
    },

## Eat

This is called when the player tries to eat something. It can be used to handle situations where the player needs
to eat something that is not an explicit artifact, or to prevent eating an otherwise edible artifact.

Parameters:
- arg (string) - What the player typed after EAT (e.g., "eat *donut*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "eat": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        if (artifact && artifact.name === 'poison donut') {
          game.history.write("You don't like the smell of that donut. Better not eat it.");
          return false; // stops the game from running the rest of the "eat" command logic
        }
        return true; // normal situation not handled above; resume regular command logic (healing food, etc.) 
      },
    },

## Drink

This is called when the player tries to drink something. It can be used to handle situations where the player needs
to drink something that is not an explicit artifact. For example, to order a drink at a bar.

Parameters:
- arg (string) - What the player typed after DRINK (e.g., "drink *water*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "drink": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        // use the "drink" command (with no arguments) to order a drink from the bartender
        if (game.player.room_id === 5) {  // the bar
          game.history.write("The bartender pours you a drink.");
          game.artifacts.get(6).moveToRoom(); // moves the "beer" artifact to the current room
          return false; // stops the game from running the rest of the "drink" command logic
        }
        return true; // normal situation not handled above; resume regular command logic (healing potions, etc.) 
      },
    },

A note on healing potions and healing food items:

These common types of artifacts are handled by the core game and don't require a custom event handler. Set the artifact type to "Edible" (9) or "Drinkable" (6), then set the dice and sides to match the amount of healing effect you want.

## Use

The `use()` handler is called whenever a player tries to USE an artifact. This includes eating or drinking artifacts. (Healing potions and healing food are built into the core game, but other special effects should use this event handler).

Parameters:
- arg (string) - What the player typed after USE (e.g., "use *lever*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

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
- arg (string) - What the player typed after USE (e.g., "use *button*" )
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

## Request an artifact from a monster

The player can use a command like "REQUEST NOTE FROM EDDIE" to get an artifact that's
in a monster's inventory. The following event handlers run during this process:

### beforeRequest

This runs after the target monster and artifact are identified, but before any other
checks are made. Thus, this will run even if the monster or artifact doesn't exist,
or if the monster isn't carrying the artifact. This allows creating special effects
around non-existent artifacts or artifacts that are somewhere other than the monster's
inventory.

Parameters:
- arg (string) - What the player typed after WEAR (e.g., "wear *ring*" )
- artifact (Artifact) - If the player's text matched the name of an artifact is in the current room or in the player's inventory, this will contain the Artifact object.
- monster (Monster) - The monster from whom the player is requesting the artifact

Return value:
true: continue with the normal "request artifact" logic (the monster will give the artifact to the player)
false: skip the rest of the "request" logic. This bypasses the check for whether the monster and artifact actually exist, and whether the monster has the artifact.

Example:

    "beforeRequest": function(arg: string, artifact: Artifact, monster: Monster) {
      let game = Game.getInstance();
      // in this event handler, you should check for whether the monster and artifact
      // exist, unless your logic doesn't require them to exist.
      if (!monster) return true;
      if (!artifact) return true;
      if (!monster.hasArtifact(artifact.id)) return true;
      
      // custom logic: you can't take alfred's lucky sword.
      if (monster.id === 3 && artifact.id === 8) {
        game.history.write("Alfred says, \"That's my lucky sword! My father gave it to me!\"");
        return false;
      }
      return true;
    },

### afterRequest

This runs after the item has changed hands. It's mainly for special messages, etc.

Parameters:
- arg (string) - What the player typed after WEAR (e.g., "wear *ring*" )
- artifact (Artifact) - If the player's text matched the name of an artifact is in the current room or in the player's inventory, this will contain the Artifact object.
- monster (Monster) - The monster who gave the artifact to the player

Example:

    "afterRequest": function(arg: string, artifact: Artifact, monster: Monster) {
      let game = Game.getInstance();
      if (monster.id === 3 && artifact.id === 1) {
        game.history.write("Alfred says, 'Use it well.'");
      }
    },

## Light

This runs when the player tries to light a "light source" artifact like a lamp, torch, flashlight, etc. It can also be
 used for other effects separate from light sources, like lighting the fuse on a stick of dynamite.

Parameters:
- arg (string) - What the player typed after LIGHT (e.g., "light *dynamite*" )
- artifact (Artifact) - What the player is trying to light

Return value:
true: continue with the normal "light a torch" logic, where the artifact gets lit
false: skip the rest of the "light something" logic 

Example:

    "light": function(arg: string, artifact: Artifact) {
      let game = Game.getInstance();
      if (artifact !== null) {
        if (artifact.id === 5) {
          if (artifact.monster_id === Monster.PLAYER) {
            game.history.write("Better put it down first!");
            // or, you could blow up the player...
          } else {
            game.history.write("* * B O O M * *", "special");
            artifact.destroy();
            // also destroy some other things here - use your imagination
          }
          return false; // this skips the regular "light source" lighting routine
        }
      }
      return true;
    },

## Look

This event handler is called when the player tries to look at something. Normally, the artifact or monster description is 
 shown in this situation, but you can use this event handler to do something else instead, like move an artifact into the
 room, or explain why something isn't possible.

Parameters:
- arg (string) - What the player typed after LOOK (e.g., "look *sword*" )

Return values:
true: Continue with the regular LOOK command logic, i.e., showing the artifact, monster, or room description
false: Skip the usual messages. Useful after you have just displayed a custom message.

Example:


    "look": function(arg: string) {
      let game = Game.getInstance();
      let sword = game.artifacts.get(12);
      if (sword.match(arg) && sword.container_id === 31) {
        if (game.player.room_id === 10) {
          game.history.write("The sword is too high to see clearly!");
          return false;
        } else if (game.player.room_id === 11) {
          game.history.write("The brace is blocking your view!");
          return false;
        }
      }
      return true;
    },

## See a monster

This is called when the player sees a monster for the first time. It can be used to add additional messages, such as
 if the monster should speak when first encountered.
 
Parameters:
- monster (Monster) - The Monster object that the player just saw for the first time.

Return value: none

Example (from Training Ground):

    "seeMonster": function(monster: Monster): void {
      let game = Game.getInstance();
      // some monsters speak when you first see them.
  
      // red sun's opening remarks
      if (monster.id === 1) {
        game.effects.print(4);
      }
      // Sylvani speaks (ID 13 is Don Jonson. In EDX, Sylvani speaks after both descriptions are shown.)
      if (monster.id === 13) {
        game.effects.print(6);
      }
    },

## See an artifact

Just like "seeMonster", this is called when the player first sees an artifact. It's typically used to show extra information
 that isn't in the artifact description.

Parameters:
- artifact (Artifact) - The Artifact object which the player just saw for the first time

Return value: none
 
Example:
    
    "seeArtifact": function(artifact: Artifact): void {
      let game = Game.getInstance();
      if (artifact.id === 26) {
        game.artifacts.get(36).reveal();
      }
    },

## Read

There are two event handlers that occur when the player reads something.

Note: These event handlers are an older style and may change in the future.

### beforeRead

The `beforeRead` event handler runs right before the player reads something. It can block the player from
 reading the artifact by returning false.

Parameters:
- arg (string) - What the player typed after READ (e.g., "read *book*" )
- artifact (Artifact) - The artifact that matched the arg (if any)

Return value:
true: Continue with the regular READ command logic, i.e., showing the effects associated with the artifact
false: Skip the usual messages. Useful after you have just displayed a custom message.

Example:

    "beforeRead": function(arg: string, artifact: Artifact) {
      if (artifact && artifact.id === 17) {
        let game = Game.getInstance();
        game.history.write(" PEACE BEGETS PEACE. PUT DOWN YOUR", "special2");
        game.history.write("WEAPONS AND LEAVE VIOLENCE BEHIND YOU ", "special2");
        // teleport all weapons to random rooms
        game.player.inventory.filter(a => a.is_weapon).forEach(a => {
          let dest = game.rooms.getRandom();
          item.moveToRoom(dest.id);
        })
        game.player.updateInventory();
        game.artifacts.updateVisible();
        return false;
      }
      return true;
    },

### "afterRead"

This works just like "beforeRead" but it happens after any regular markings (effects) on the artifact are shown. It
can be used to display additional text or perform additional logic after the "normal" effects are shown. 

Parameters:
- arg (string) - What the player typed after READ (e.g., "read *book*" )
- artifact (Artifact) - The artifact that matched the arg (if any)

Return value: none

Example:

    "afterRead": function(arg: string, artifact: Artifact) {
      let game = Game.getInstance();
      if (artifact !== null && artifact.id === 11) {
        // this artifact is not actually a "readable" type, but has a readable message on it
        game.effects.print(10);
      }
    },

## Ready a weapon

This is called when the player readies a weapon. It has no effect when NPCs ready weapons.

Parameters:
- arg (string) - What the player typed after READY (e.g., "ready *sword*" )
- old_wpn (Artifact) - The weapon the player was using previously
- new_wpn (Artifact) - The weapon the player is readying

Example:

    "ready": function(arg: string, old_wpn: Artifact, new_wpn: Artifact): boolean {
      // if unreadying trollsfire, put it out
      if (old_wpn && old_wpn.id === 10 && new_wpn.id !== 10) {
        put_out_trollsfire();
      }
      return true;
    },

## Reveal an Artifact

This is called whenever an embedded artifact is revealed. Usually, this happens when a player looks at the artifact or 
 tries to get it, open it, or otherwise interact with it. This is just used for special effects and can't prevent the
 artifact from being revealed.
 
Note: Most secret doors can be implemented in the core logic and don't require event handlers.
 
Parameters:
- artifact (Artifact) - The Artifact object which the player just saw for the first time

Return value: none

    "revealArtifact": function(artifact: Artifact) {
      let game = Game.getInstance();
      // two secret doors with the same alias. when one is revealed, also reveal the other
      if (artifact.id === 55) {
        game.artifacts.get(56).reveal();
      }
    },

## Say

This is called whenever the player says something. It can be used to implement magic words, etc.

Parameters:
- phrase (string) - phrase the player typed after SAY (e.g., "say *magic*")

Return value: none

Example:

    "say": function(phrase: string) {
      let game = Game.getInstance();
      if (phrase === 'magic' && game.artifacts.get(5).isHere()) {
        game.history.write("POOF!!", "special");
        game.artifacts.get(5).destroy();
      }
    },

## Combat

### Attack Monster

The "attackMonster" event is triggered whenever a player attacks a monster. This can be used to prevent an attack, or
to implement some other logic, like a monster that disappears in a puff of smoke when attacked.
 
Note: This only happens when the player is attacking and does not happen when monsters attack each other.

Parameters:
- arg (string) - What the player typed after ATTACK (e.g., "attack *dragon*")
- target (Monster) - the monster being attacked

Return value:
Return true if the attack should proceed, or false if the attack should be canceled.

Example:

      "attackMonster": function(arg: string, target: Monster) {
        let game = Game.getInstance();
        // bozworth the gnome disappears if attacked
        if (target.id === 20) {
          game.effects.print(21);
          game.monsters.get(20).room_id = null;
        }
        return true;
      },

### Attack Artifact

The "attackMonster" event is triggered whenever a player attacks an artifact. (Attacking an artifact is a way to smash
open doors and chests in many adventures.) This can be used to prevent an attack, or to implement some other logic, like
an artifact that zaps the player when attacked.

Parameters:
- arg (string) - What the player typed after ATTACK (e.g., "attack *iron door*")
- target (Artifact) - the monster being attacked

Return value:
Return true if the attack should proceed, or false if the attack should be canceled.

Example:

      "attackArtifact": function(arg: string, target: Artifact) {
        let game = Game.getInstance();
        // can't attack or wear backpack
        if (target.id === 13) {
          game.history.write("You don't need to.");
          return false;
        }
        return true;
      },

### Flee

This event handler is called when the player tries to flee combat. It can be used to prevent fleeing, among other things.
 This does not prevent other monsters from fleeing.

Parameters: none

Return value: true/false: true to allow the flee action to proceed, or false to prevent it

      "flee": function() {
        let game = Game.getInstance();
        if (game.monsters.get(5).isHere() || game.monsters.get(12).isHere()) {
          game.history.write("You are surrounded and cannot escape!", "emphasis");
          return false;  // prevents fleeing
        }
        return true;  // player can flee as normal
      },

#### Forcing a Monster to Flee

If you want to force a monster to immediately flee, in any situation, there is a special `Monster.flee()` method you
 can call from within any event handler. This works whether or not there is active combat.
  
Here's an example event handler to demonstrate:

    "say": function(phrase: string) {
      let game = Game.getInstance();
      // a scary word that makes a certain monster flee
      let m = game.monsters.get(1);
      if (phrase === 'booga booga' && m.isHere()) {
        m.flee();
      }
    },

#### Custom Fleeing Messages

Normally, the game engine will show a message like "Sir Robin flees" whenever a monster flees. If you want to override
 this message with a custom message, you can do that by adding special configuration into your adventure's "start" event
 handler. For example, if you wanted to change the message to "Sir Robin runs away" you could do this:
 
    "start": function(arg: string) {
      let game = Game.getInstance();
      game.flee_verbs = {'singular': 'runs away', 'plural': 'run away'};
    },

This setting affects all monsters, not just a specific one. 

Note that the `flee_verbs` property is an object containing two variants of the verb. There is a 'singular' version
 (used when one monster is fleeing) and a 'plural' version (used when a group of monsters flee). Because these words
 are verbs, the singular version usually ends in 's' and the plural version doesn't end in 's'.

### Fumble

This is called whenever a monster fumbles. You can change the fumble behavior, e.g., preventing cursed weapons from
being dropped accidentally.

Parameters:
- attacker (Monster) - The monster doing the attacking. This is the one who fumbled.
- defender (Monster) - The monster being attacked
- fumble_roll (number) - A random number from 1-100 which was rolled by the combat routine, to determine the fumble type:

1-40 = fumble recovered
41-80 = weapon dropped
81-85 = weapon hits user
86-95 = weapon damaged
96-99 = weapon broken (with potential to hurt user)
100 = weapon broken, hurts user with extra damage

Return value:
Return true if the fumble should proceed as normal, or false to prevent the fumble and leave the weapon in the monster's
inventory. The monster will still lose their turn even if this event handler returns false.

Example:
    
      "fumble": function(attacker: Monster, defender: Monster, fumble_roll: number) {
        let game = Game.getInstance();
        // cannot drop a cursed weapon
        if (attacker.id === 0 && attacker.weapon.name === 'hellsblade') {
          game.history.write("-- fumble recovered!", "no-space");  // this fakes a normal fumble message
          return false;  // no fumble actually happens, but the player still loses their turn
        }
        return true;  // otherwise, use regular fumble logic
      },

### Choose Target

The "chooseTarget" event handler allows you to alter the target that a monster
will attack during their attack phase.

Parameters:
- attacker (Monster) - the one doing the attacking
- defender (Monster) - the monster that would be attacked based on the standard game logic

Return value:
- a Monster object which the attacker will now attack
- null if the monster should not attack

Note: if not changing anything here, return either TRUE or the original value
of 'defender', which is the randomly chosen defender from the basic game
logic. You can also return null to make the monster skip their attack.

Example:

    "chooseTarget": function (attacker, defender): Monster {
      // this monster always attacks the player
      return attacker.id === 1 ? game.player : defender;
    },

### Attack Odds

The "attackOdds" event handler is called when a monster attacks another monster, after the standard odds have been
calculated, but before the hit check is performed. It can adjust the odds to, for example, make a monster harder or
easier to hit based on a game condition like having an artifact, or a special type of monster.

Any output printed by this event handler will appear before the "Monster1 swings at Monster2" combat message.

Parameters:
- attacker (Monster) - The monster doing the attacking. This is the one who fumbled.
- defender (Monster) - The monster being attacked
- odds (number) - The normal to-hit odds for the attacker, calculated by the combat routine. This is a number from 0-100
representing a percentage, though it may in rare cases be outside the range of 0-100.

Return value:
This can return true if no adjustment should be made, or it can return a number representing the new "to hit" odds.

Example:

      "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
        let game = Game.getInstance();
        // the umber hulk's gaze makes it harder to hit
        if (attacker.id === Monster.PLAYER && defender.name === 'Umber Hulk') {
          game.history.write("Your vision seems to swim making it hard to concentrate on fighting.");
          return odds - 10;
        }
        return true;  // this makes the game use the normal odds in situations not covered above.
      },

### Attack Damage

The "attackDamage" event handler is called when a monster attacks another monster, after the standard damage amount
 has been calculated, but before the damage is dealt. It can adjust the damage amount to, for example, create a
 magic spell that makes the player do more damage, or make a certain monster resistant to damage from a specific
 weapon.

Any output printed by this event handler will appear after the "Monster1 swings at Monster2" combat message.

Parameters:
- attacker (Monster) - The monster doing the attacking.
- defender (Monster) - The monster being attacked
- damage (number) - The normal damage done by the attacker, calculated by the combat routine, measured in hit points

Return value:
This can return true if no adjustment should be made, or it can return a number representing the new "to hit" odds.

Example:

      "attackDamage": function (attacker: Monster, defender: Monster, odds: number) {
        let game = Game.getInstance();
        // a dragon-slaying weapon
        if (attacker.weapon.name === 'dragonlance' && defender.name === 'green dragon') {
          return damage * 2;
        }
        return true;  // this makes the game use the normal odds in situations not covered above.
      },

### After Attack Damage

The "attackDamageAfter" event handler is called after damage is dealt to the target monster during combat. This is
called after every hit, even if the damage was fully absorbed by the target's armor.

Any output printed by this event handler will appear after the "Monster1 swings at Monster2" combat message.

Parameters:
- attacker (Monster) - The monster doing the attacking
- defender (Monster) - The monster being attacked
- damage_dealt (number) - The actual damage amount that was just taken by the defender. If the damage was absorbed by armor, this number could be zero.

Example:

      "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
        let game = Game.getInstance();
        // polaris gets hit by flamethrower
        if (defender.id === 1 && attacker.weapon_id === 12) {
          game.effects.print(2, 'special');
          defender.reaction = Monster.RX_NEUTRAL;
          game.artifacts.get(19).moveToRoom();
        }
        return true;
      },

### Armor Class

The "armorClass" event handler allows you to customize the player's armor class. It is called every time a monster's inventory and armor are recalculated, just after the normal calculation is performed. It can adjust the armor class depending on game conditions, e.g., whether a certain spell is active.
 
If present, this event handler will be called frequently, so it is not recommended to output any messages.

Parameters:
- monster (Monster) - The monster whose armor class is being calculated

Example:
    
      "armorClass": function (monster: Monster) {
        let game = Game.getInstance();
        if (monster.id === Monster.PLAYER && monster.spell_counters['protection'] > 0) {
          // protection spell ac bonus
          monster.armor_class += 3;
        }
      },

### Death

This is called when a monster dies. It can be used to print messages, cause some other effects to happen, or even to 
 prevent the monster from dying at all.
 
Parameters:
- monster: the Monster object that is dying

Return value:
- Boolean - true to allow the death to continue; false to prevent it from happening

Example: 

      "death": function(monster: Monster): boolean {
        let game = Game.getInstance();
        if (monster.id === 8) {
          // print an effect when a certain monster dies
          game.effects.print(3);
        }
        // if you wanted to prevent a certain monster from dying, you could do something like this:
        if (monster.id === 42) {
            monster.damage = monster.hardiness - 1;  // gives 1 HP back
            game.effects.print(1);
            return false;  // the monster goes on living if this event handler returns false.
        }
        return true;  // return true, and the monster dies as normal.
      },

## Magic spells

There are several events related to casting spells. These include the POWER spell which has no built-in functionality but relies entirely on event handlers.
 
### Power 

The base adventure includes a default implementation of POWER, but you should customize it to your needs.

Parameters:
- roll (number) - a dice roll from 1 to 100. This is the roll to determine the Power effect. It is not the roll for spell success. This event handler is called only if the spell has succeeded.

Example:

      "power": function(roll) {
        let game = Game.getInstance();
        if (roll <= 50) {
          game.history.write("You hear a loud sonic boom which echoes all around you!");
        } else if (roll <= 75) {
          // teleport to random room
          game.history.write("You are being teleported...");
          let room = game.rooms.getRandom();
          game.player.moveToRoom(room.id);
          game.skip_battle_actions = true;
        } else {
          game.history.write("All your wounds are healed!");
          game.player.heal(1000);
        }
      },

### Blast

This is called when the player tries to use the BLAST spell on a monster. Return false to prevent the spell from affecting the target. Otherwise, this should return true, or the spell will not work. 

Example:

      "blast": function(arg: string, target: Monster) {
        let game = Game.getInstance();
        // this monster disappears if blasted
        if (target.id === 20) {
          game.effects.print(21);  // this effect contains the description of the monster disappearing
          game.monsters.get(20).room_id = null;
        }
        return true;
      },

### Before a Spell

The "beforeSpell" event handler is a general-purpose handler that can be called before any spell is cast. It can alter the spell or prevent it from firing.

Parameters:
- spell_name (string) - The name of the spell ("blast", "heal", "power", or "speed")

Example:

      "beforeSpell": function(spell_name: string) {
        let game = Game.getInstance();
        // this prevents all spell casting in a certain room
        if (game.player.room_id === 7) {
          game.history.write("This is an anti-magic area!");
          return false;
        }
        // this prevents only POWER in a different room
        if (game.player.room_id === 8 && spell_name === 'power') {
          game.history.write("A wizard's magic has prevented the POWER spell from working in this area!");
          return false;
        }
        return true;
      },

## Monster Action

To make a monster do something special during its turn, instead of the usual combat routine, you can use the
"monsterAction" event. This is triggered each turn during a monster's normal combat phase. If the function returns
false, the normal combat action will be skipped. If the function returns true, this means that the event handler
did nothing, and the monster will perform its normal combat actions (attacking, fleeing, picking up a weapon).

Parameters:
- monster (Monster) - The monster whose turn it is

Note: Since this was written, there is now a better way to teach spells to an NPC. See the "Game Start" section above.

Example:

      "monsterAction": function(monster: Monster) {
        let game = Game.getInstance();
    
        // this monster knows a "heal" spell and will sometimes cast it if injured
        if (monster.id === 17 game.diceRoll(1,3) === 3 && monster.damage > monster.hardiness * 0.4) {
          game.history.write(monster.name + " casts a heal spell!");
          let heal_amount = game.diceRoll(2, 6);
          monster.heal(heal_amount);
          return false; // skip the default combat actions
        }
        return true;
      },

## After selling items

The `afterSell` event handler provides extra logic on the final screen of the game, after the player has sold treasures to Sam Slicker, but before the return to the Main Hall. This is useful for giving a reward to the player for completing a quest.

In this event handler, you will need to use `game.exit_message.push()` instead of the usual `game.history.write()` to display output to the player.

Parameters: none

Example:

      "afterSell": function() {
        let game = Game.getInstance();
        let cynthia = game.monsters.get(3);
        // Duke Luxom's Reward - given if Cynthia made it to the exit and still likes the player.
        // The "here" in "isHere()" refers to the last room the player was in before stepping out the exit.
        if (cynthia.isHere() && cynthia.reaction !== Monster.RX_HOSTILE) {
          let reward = game.player.charisma * 10;
          game.exit_message.push("Additionally, you receive " + reward + " gold pieces for the safe return of Cynthia.");
          game.player.gold += reward;
        }
      },

# Handling group monsters

It's possible to create a group of monsters with the same properties. They will always be displayed as a group in the
 game, though the members are independent entities who can fight or flee as individuals.
 
To create a group monster, enter the following when creating or editing the monster in the admin panel:

* "Count" field greater than 1
* Enter a custom plural name in the "Name plural" field
  * This is optional; if you leave this blank, the plural name will be created by adding an "s" to the regular name. This may not always be what you want.
* If the monsters should have weapons (other than natural weapons), you'll need to do the following:
  * Create as many artifacts as there are group members. The artifact IDs must be in a contiguous numerical series, e.g., #11, #12, #13...
  * Set the group monster's weapon ID to the first one
  * This will assign the weapons to the individual group members in sequential order. So, if the group monster's weapon ID is 11, the first member will have artifact ID #11 as its weapon, the second member will have artifact 12, and so on.

## How it works

Group monsters are represented by two types of objects: a virtual "parent" monster object representing the group, and an array
 of "children." Children are represented as separate monster objects with an ID like '5.001' or '5.002'. (Where 5 is the 
 id of the group.)

Within an event handler, you may interact with the children of a group in a forEach() loop, like this:

    let group_monster = game.monsters.get(5);
    group_monster.children.forEach(c => c.hardiness++);

## Limitations

The group monster routine can work for groups up to 9,999 members. However, performance problems are likely if the group
 size exceeds 500 members.

All monsters in the group will have the same reaction to the player; e.g., if one is friendly, they're all friendly.

## Attacking

Group members attack as separate individuals. Only 5 members can attack in any given turn. (Otherwise, each turn could take a long time.)

## Targeting

During combat, when a monster chooses to target a group, it actually targets a random member of the group.

Similarly, using `monster.injure()` (e.g., with traps or mass-effect weapons like bombs and grenades), the damage will
 be done to a random member of the group.

## Fleeing

Any number of group members can flee in one round. They may all flee in different directions. If multiple members end
 up in the same room, they will appear as part of the group when next encountered. 

In an event handler, you can force the entire group to flee:

    let group_monster = game.monsters.get(5);
    group_monster.flee();
    
All the members of the group who are in the current room will flee. This does not affect other members who are currently
 located in different rooms.

## Pursuit

When the player flees, the group members in the current room will either pursue the player as a group, or stay put as a group.

## Dead bodies

If the group monster has a dead body id, that artifact will be placed on the ground in the room where any member dies.
 If some members flee, and they later die in a different room, the same artifact will be reused and moved to the new room.

This behavior may change in the future.

## Moving a group to a different room

In an event handler, using `monster.moveToRoom(5)` will move all living members of the group to the target room.

To move just one member, or just a few members, you can do something like the following:

    // move one member
    monster.children[0].moveToRoom(5);
    // move the first 10 members
    monster.children.slice(0, 10).forEach(c => c.moveToRoom(5));

## Adding members to a group

You can add on additional members to the group, using the `spawnChild()` method:

    let group_monster = game.monsters.get(5);
    group_monster.spawnChild();

The new member will appear in the same room where the virtual "parent" monster is currently located. It will have the
 same stats as the parent. New members will always have natural weapons, even if the other members are using artifacts
 as weapons.

## Removing members from a group

You can reduce the size of a group by calling the `removeChildren()` method:

    let group_monster = game.monsters.get(5);
    group_monster.removeChildren(3);
    
If the number you pass is equal to or larger than the current size of the group, the entire group monster will be removed from the game.

Note: This doesn't take into account where the members are. If they are scattered among multiple rooms, it won't be
 predictable which ones get removed.

# Requesting player input

In some event handlers, you may need to ask for additional input from the player before proceeding. For this purpose, the game engine contains a "modal" object which displays a prompt.

Function: `game.modal.show()`

Parameters:
- text (string) - The text of the question to ask the player
- callback (function) - A TypeScript function to run as a callback. Within this function, check if the player's answer matches what you expected.

Example:

      "beforeOpen": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        // open a vault door with a combination lock
        if (artifact !== null && artifact.id === 3) {
          // show the modal here
          game.modal.show("Enter combination (use dashes):", function(value) {
            if (value === '11-16-27') {
              game.history.write("The vault door opened!", "success");
              artifact.is_open = true;
            } else {
              game.history.write("The vault door did not open.");
            }
          });
          
        }
      },

The modal handles the logic for collecting the user's input and pausing the game clock until the player answers the question. The text the user entered will be available in the `value` parameter of the callback function.

The modal is designed to work in early-turn event handlers like "beforeMove", "open", and "use". Due to the animation of Eamon's results display, it should not be used in "endTurn" event handlers, as it may behave unpredictably.
